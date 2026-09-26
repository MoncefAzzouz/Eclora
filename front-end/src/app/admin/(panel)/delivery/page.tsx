'use client';

import React, { useMemo, useState } from 'react';
import { Save, Wand2 } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { WILAYAS } from '@/lib/admin/wilayas';
import type { ShippingRate } from '@/types/admin';
import { Button, Card, ErrorState, Field, Input, LoadingState, Modal, PageHeader, SearchInput, Select, Table, Td, Th, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

const ZONES = { CENTER: 'Centre', NORTH: 'Nord', HIGHLANDS: 'Hauts plateaux', SOUTH: 'Sud' } as const;
type Zone = keyof typeof ZONES;

const zoneOf = (code: number) => WILAYAS.find((w) => w.code === code)?.zone as Zone;

export default function DeliveryPage() {
  const { data, loading, error, reload } = useApi(() => api.shipping.list());
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;
  return <DeliveryEditor saved={data} reload={reload} />;
}

/** Holds an editable copy of the saved rates; `saved` is the last server state. */
function DeliveryEditor({ saved: data, reload }: { saved: ShippingRate[]; reload: () => void }) {
  const toast = useToast();
  const [rates, setRates] = useState<ShippingRate[]>(data);
  const [query, setQuery] = useState('');
  const [zone, setZone] = useState<'' | Zone>('');
  const [saving, setSaving] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulk, setBulk] = useState({ zone: 'SOUTH' as Zone, home: '', stopdesk: '', days: '' });

  const dirty = useMemo(() => JSON.stringify(rates) !== JSON.stringify(data), [rates, data]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rates.filter(
      (r) => (!zone || zoneOf(r.wilayaCode) === zone) && (!q || r.wilayaName.toLowerCase().includes(q) || String(r.wilayaCode).padStart(2, '0').includes(q))
    );
  }, [rates, query, zone]);

  const update = (code: number, patch: Partial<ShippingRate>) =>
    setRates((all) => all.map((r) => (r.wilayaCode === code ? { ...r, ...patch } : r)));

  const save = async () => {
    setSaving(true);
    if (await toast.run(() => api.shipping.saveAll(rates), 'Tarifs de livraison enregistrés')) reload();
    setSaving(false);
  };

  const applyBulk = () => {
    setRates((all) =>
      all.map((r) =>
        zoneOf(r.wilayaCode) !== bulk.zone
          ? r
          : {
              ...r,
              homePrice: bulk.home ? Number(bulk.home) : r.homePrice,
              stopdeskPrice: bulk.stopdesk ? Number(bulk.stopdesk) : r.stopdeskPrice,
              deliveryDays: bulk.days || r.deliveryDays,
            }
      )
    );
    setBulkOpen(false);
    toast.success(`Zone ${ZONES[bulk.zone]} mise à jour — pensez à enregistrer`);
  };

  const activeCount = rates.filter((r) => r.isActive).length;

  return (
    <div className="animate-fade-in pb-20">
      <PageHeader
        title="Livraison"
        description={`Tarifs par wilaya, à domicile et en stop desk. ${activeCount} / ${rates.length} wilayas desservies.`}
        actions={
          <>
            <Button variant="secondary" icon={Wand2} onClick={() => setBulkOpen(true)}>Modifier une zone</Button>
            <Button icon={Save} onClick={save} loading={saving} disabled={!dirty}>Enregistrer</Button>
          </>
        }
      />

      <Card padded={false}>
        <div className="flex flex-col sm:flex-row gap-2 p-4">
          <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une wilaya ou un code..." className="flex-1" />
          <Select value={zone} onChange={(e) => setZone(e.target.value as Zone | '')} className="sm:w-48" aria-label="Zone">
            <option value="">Toutes les zones</option>
            {(Object.keys(ZONES) as Zone[]).map((z) => <option key={z} value={z}>{ZONES[z]}</option>)}
          </Select>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Wilaya</Th>
              <Th className="hidden md:table-cell">Zone</Th>
              <Th>Domicile (DA)</Th>
              <Th>Stop desk (DA)</Th>
              <Th className="hidden sm:table-cell">Délai</Th>
              <Th>Active</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((r) => (
              <tr key={r.wilayaCode} className={r.isActive ? '' : 'bg-slate-50 text-slate-400'}>
                <Td className="font-bold whitespace-nowrap">
                  <span className="text-slate-400 tabular-nums mr-1.5">{String(r.wilayaCode).padStart(2, '0')}</span>
                  {r.wilayaName}
                </Td>
                <Td className="hidden md:table-cell text-slate-500">{ZONES[zoneOf(r.wilayaCode)]}</Td>
                <Td>
                  <Input type="number" min={0} step={50} value={r.homePrice} disabled={!r.isActive}
                    onChange={(e) => update(r.wilayaCode, { homePrice: Number(e.target.value) })} className="!w-24 !py-1.5" aria-label={`Domicile ${r.wilayaName}`} />
                </Td>
                <Td>
                  <Input type="number" min={0} step={50} value={r.stopdeskPrice} disabled={!r.isActive}
                    onChange={(e) => update(r.wilayaCode, { stopdeskPrice: Number(e.target.value) })} className="!w-24 !py-1.5" aria-label={`Stop desk ${r.wilayaName}`} />
                </Td>
                <Td className="hidden sm:table-cell">
                  <Input value={r.deliveryDays} disabled={!r.isActive}
                    onChange={(e) => update(r.wilayaCode, { deliveryDays: e.target.value })} className="!w-28 !py-1.5" aria-label={`Délai ${r.wilayaName}`} />
                </Td>
                <Td><Toggle checked={r.isActive} onChange={(v) => update(r.wilayaCode, { isActive: v })} /></Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {dirty && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 lg:left-[calc(50%+8rem)] z-30 bg-black text-white rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 text-xs font-bold animate-fade-in">
          Modifications non enregistrées
          <Button size="sm" variant="secondary" onClick={() => setRates(data)}>Annuler</Button>
          <Button size="sm" className="!bg-pink-600 hover:!bg-pink-700" loading={saving} onClick={save}>Enregistrer</Button>
        </div>
      )}

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title="Modifier une zone entière"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBulkOpen(false)}>Annuler</Button>
            <Button onClick={applyBulk}>Appliquer</Button>
          </>
        }
      >
        <Field label="Zone">
          <Select value={bulk.zone} onChange={(e) => setBulk({ ...bulk, zone: e.target.value as Zone })}>
            {(Object.keys(ZONES) as Zone[]).map((z) => <option key={z} value={z}>{ZONES[z]} ({WILAYAS.filter((w) => w.zone === z).length} wilayas)</option>)}
          </Select>
        </Field>
        <p className="text-[11px] text-slate-500">Laissez un champ vide pour ne pas le modifier.</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Domicile (DA)"><Input type="number" value={bulk.home} onChange={(e) => setBulk({ ...bulk, home: e.target.value })} /></Field>
          <Field label="Stop desk (DA)"><Input type="number" value={bulk.stopdesk} onChange={(e) => setBulk({ ...bulk, stopdesk: e.target.value })} /></Field>
        </div>
        <Field label="Délai"><Input value={bulk.days} onChange={(e) => setBulk({ ...bulk, days: e.target.value })} placeholder="2-3 jours" /></Field>
      </Modal>
    </div>
  );
}
