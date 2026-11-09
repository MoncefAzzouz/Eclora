// Yalidine API client (https://api.yalidine.app/v1/).
//
// The credentials stay on the server (.env: YALIDINE_API_ID, YALIDINE_API_TOKEN);
// the storefront never talks to Yalidine directly. Yalidine allows 5 calls per
// second and 50 per minute, and bans accounts that keep exceeding that, so every
// call goes through one queue spaced 1.3 s apart and a 429 waits for Retry-After.
import { prisma } from './prisma.js';

const BASE = 'https://api.yalidine.app/v1';
const MIN_GAP_MS = 1300;

export const yalidineConfigured = () =>
  Boolean(process.env.YALIDINE_API_ID?.trim() && process.env.YALIDINE_API_TOKEN?.trim());

export class YalidineError extends Error {}

let queue: Promise<unknown> = Promise.resolve();
let lastCall = 0;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function call<T>(method: 'GET' | 'POST' | 'DELETE', path: string, body?: unknown): Promise<T> {
  if (!yalidineConfigured()) throw new YalidineError('Yalidine n’est pas configuré (YALIDINE_API_ID / YALIDINE_API_TOKEN).');

  const run = async (): Promise<T> => {
    for (let attempt = 0; ; attempt++) {
      const wait = lastCall + MIN_GAP_MS - Date.now();
      if (wait > 0) await sleep(wait);
      lastCall = Date.now();

      const res = await fetch(`${BASE}${path}`, {
        method,
        headers: {
          'X-API-ID': process.env.YALIDINE_API_ID!.trim(),
          'X-API-TOKEN': process.env.YALIDINE_API_TOKEN!.trim(),
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(30_000),
      });

      if (res.status === 429 && attempt < 3) {
        const retryAfter = Number(res.headers.get('retry-after')) || 60;
        await sleep(retryAfter * 1000);
        continue;
      }
      const text = await res.text();
      let data: unknown = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        /* non-JSON error page */
      }
      if (!res.ok) {
        const detail = data && typeof data === 'object' && 'error' in data
          ? JSON.stringify((data as { error: unknown }).error)
          : text.slice(0, 200);
        throw new YalidineError(`Yalidine ${res.status} sur ${path} : ${detail}`);
      }
      return data as T;
    }
  };

  const result = queue.then(run, run);
  queue = result.catch(() => undefined);
  return result;
}

interface Page<T> { has_more: boolean; total_data: number; data: T[] }

async function listAll<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= 20; page++) {
    const sep = path.includes('?') ? '&' : '?';
    const res = await call<Page<T>>('GET', `${path}${sep}page_size=1000&page=${page}`);
    all.push(...res.data);
    if (!res.has_more) break;
  }
  return all;
}

// ─── Reference data ─────────────────────────────────────────────────────────

interface YWilaya { id: number; name: string; zone: number; is_deliverable: number | boolean }
interface YCommune {
  id: number; name: string; wilaya_id: number; has_stop_desk: number | boolean;
  is_deliverable: number | boolean; delivery_time_parcel: number | null;
}
interface YCenter {
  center_id: number; name: string; address: string | null; gps: string | null;
  commune_id: number; commune_name: string; wilaya_id: number;
}
interface YFees {
  per_commune: Record<string, { commune_id: number; express_home: number | null; express_desk: number | null }>;
}

const days = (n: number | null | undefined) => (n && n > 0 ? `${n} jour${n > 1 ? 's' : ''}` : null);

/** Smallest value, or null. The wilaya's price is its cheapest commune; dearer communes keep their own price. */
const min = (xs: (number | null)[]) => {
  const v = xs.filter((x): x is number => typeof x === 'number' && x > 0);
  return v.length ? Math.min(...v) : null;
};

export interface SyncStatus {
  running: boolean;
  step: string;
  startedAt?: string;
  finishedAt?: string;
  error?: string;
  summary?: { wilayas: number; communes: number; centers: number; pricedWilayas: number };
}

let status: SyncStatus = { running: false, step: 'idle' };
export const syncStatus = () => status;

/**
 * Pulls wilayas, communes, stop-desks and (optionally) the tariff grid from
 * Yalidine. About 62 paced calls, so it runs in the background (~1.5 min).
 * `applyPrices` overwrites the site's delivery prices with Yalidine's tariffs.
 */
export function startSync(applyPrices: boolean): SyncStatus {
  if (status.running) return status;
  status = { running: true, step: 'Démarrage', startedAt: new Date().toISOString() };

  void (async () => {
    try {
      const settings = await prisma.storeSettings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });

      status.step = 'Wilayas';
      const wilayas = await listAll<YWilaya>('/wilayas/');

      status.step = 'Communes';
      const communes = await listAll<YCommune>('/communes/');

      status.step = 'Bureaux (stop desks)';
      const centers = await listAll<YCenter>('/centers/');

      // Keep admin-set prices for wilayas that already exist.
      const existing = new Map((await prisma.shippingRate.findMany()).map((r) => [r.wilayaCode, r]));
      await prisma.$transaction(
        wilayas.map((w) =>
          prisma.shippingRate.upsert({
            where: { wilayaCode: w.id },
            create: {
              wilayaCode: w.id,
              wilayaName: w.name,
              homePrice: 0,
              stopdeskPrice: 0,
              isActive: false, // priced below; never sell delivery at 0 DA by accident
            },
            update: {
              wilayaName: w.name,
              ...(Boolean(Number(w.is_deliverable)) ? {} : { isActive: false }),
            },
          })
        )
      );

      await prisma.$transaction(
        communes.map((c) => {
          const data = {
            name: c.name,
            wilayaCode: c.wilaya_id,
            hasStopDesk: Boolean(Number(c.has_stop_desk)),
            isDeliverable: Boolean(Number(c.is_deliverable)),
            deliveryDays: days(c.delivery_time_parcel),
          };
          return prisma.deliveryCommune.upsert({
            where: { id: c.id },
            create: { id: c.id, ...data },
            update: data,
          });
        })
      );

      const centerIds = centers.map((c) => c.center_id);
      await prisma.$transaction([
        ...centers.map((c) => {
          const data = {
            name: c.name,
            address: c.address ?? '',
            gps: c.gps,
            communeId: c.commune_id,
            communeName: c.commune_name,
            wilayaCode: c.wilaya_id,
          };
          return prisma.deliveryCenter.upsert({ where: { id: c.center_id }, create: { id: c.center_id, ...data }, update: data });
        }),
        // Offices Yalidine closed: hide them, but keep the rows old orders point at.
        prisma.deliveryCenter.updateMany({ where: { id: { notIn: centerIds } }, data: { isActive: false } }),
      ]);

      let pricedWilayas = 0;
      if (applyPrices) {
        const deliverable = wilayas.filter((w) => Boolean(Number(w.is_deliverable)));
        for (const [i, w] of deliverable.entries()) {
          status.step = `Tarifs ${i + 1}/${deliverable.length} — ${w.name}`;
          const fees = await call<YFees>('GET', `/fees/?from_wilaya_id=${settings.yalidineFromWilaya}&to_wilaya_id=${w.id}`);
          const rows = Object.values(fees.per_commune ?? {});
          const home = min(rows.map((r) => r.express_home));
          const desk = min(rows.map((r) => r.express_desk));
          if (home === null) continue;

          const wilayaCommunes = communes.filter((c) => c.wilaya_id === w.id);
          const slowest = Math.max(0, ...wilayaCommunes.map((c) => c.delivery_time_parcel ?? 0));
          const fastest = Math.min(...wilayaCommunes.map((c) => c.delivery_time_parcel ?? 99));
          const range = slowest && fastest < 99 ? (fastest === slowest ? `${fastest} jours` : `${fastest}-${slowest} jours`) : existing.get(w.id)?.deliveryDays ?? '2-5 jours';

          await prisma.$transaction([
            prisma.shippingRate.update({
              where: { wilayaCode: w.id },
              data: { homePrice: home, stopdeskPrice: desk ?? home, deliveryDays: range, isActive: true },
            }),
            // Communes priced above the wilaya base keep their own price.
            ...rows.map((r) =>
              prisma.deliveryCommune.updateMany({
                where: { id: r.commune_id },
                data: {
                  homePrice: r.express_home && r.express_home !== home ? r.express_home : null,
                  stopdeskPrice: r.express_desk && r.express_desk !== desk ? r.express_desk : null,
                },
              })
            ),
          ]);
          pricedWilayas++;
        }
      }

      await prisma.storeSettings.update({ where: { id: 1 }, data: { yalidineLastSync: new Date() } });
      status = {
        running: false,
        step: 'Terminé',
        startedAt: status.startedAt,
        finishedAt: new Date().toISOString(),
        summary: { wilayas: wilayas.length, communes: communes.length, centers: centers.length, pricedWilayas },
      };
    } catch (e) {
      status = {
        running: false,
        step: 'Échec',
        startedAt: status.startedAt,
        finishedAt: new Date().toISOString(),
        error: e instanceof Error ? e.message : String(e),
      };
    }
  })();

  return status;
}

// ─── Parcels ────────────────────────────────────────────────────────────────

export interface ParcelInput {
  order_id: string;
  from_wilaya_name: string;
  firstname: string;
  familyname: string;
  contact_phone: string;
  address: string;
  to_commune_name: string;
  to_wilaya_name: string;
  product_list: string;
  price: number;
  do_insurance: boolean;
  declared_value: number;
  length: number;
  width: number;
  height: number;
  weight: number;
  freeshipping: boolean;
  is_stopdesk: boolean;
  stopdesk_id?: number;
  has_exchange: boolean;
}

interface ParcelResult {
  success: boolean;
  order_id: string;
  tracking: string | null;
  label: string | null;
  message: string;
}

export async function createParcel(parcel: ParcelInput): Promise<{ tracking: string; label: string | null }> {
  const res = await call<Record<string, ParcelResult>>('POST', '/parcels/', [parcel]);
  const result = res[parcel.order_id] ?? Object.values(res)[0];
  if (!result?.success || !result.tracking) {
    throw new YalidineError(result?.message || 'Yalidine a refusé le colis');
  }
  return { tracking: result.tracking, label: result.label };
}

export async function getParcel(tracking: string): Promise<{ last_status: string; label?: string } | null> {
  const res = await call<{ data?: { last_status: string; label?: string }[] } & { last_status?: string; label?: string }>(
    'GET',
    `/parcels/${encodeURIComponent(tracking)}`
  );
  if (res?.data) return res.data[0] ?? null;
  return res?.last_status ? { last_status: res.last_status, label: res.label } : null;
}

/** Yalidine wants a local number: 0 followed by 8 or 9 digits. */
export function toLocalPhone(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, '');
  if (digits.startsWith('+213')) return `0${digits.slice(4)}`;
  if (digits.startsWith('00213')) return `0${digits.slice(5)}`;
  if (digits.startsWith('213') && digits.length === 12) return `0${digits.slice(3)}`;
  return digits;
}
