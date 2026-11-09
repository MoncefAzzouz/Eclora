'use client';

// Yalidine connection on the Delivery page: sync status and button, shipping
// origin, free-delivery threshold and the default parcel size sent to Yalidine.
import React, { useEffect, useState } from 'react';
import { RefreshCw, Save, Truck } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import type { ShippingRate, StoreSettings } from '@/types/admin';
import { Badge, Button, Card, Field, Input, Select, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

const fmt = (iso?: string) => (iso ? new Date(iso).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : 'jamais');

export default function YalidinePanel({ rates, onSynced }: { rates: ShippingRate[]; onSynced: () => void }) {
  const toast = useToast();
  const { data: status, reload: reloadStatus } = useApi(() => api.yalidine.status());
  const { data: settings, reload: reloadSettings } = useApi(() => api.settings.get());
  const [applyPrices, setApplyPrices] = useState(true);
  const [starting, setStarting] = useState(false);
  const [draft, setDraft] = useState<StoreSettings | null>(null);
  const [saving, setSaving] = useState(false);

  const running = status?.sync.running ?? false;
  const form = draft ?? settings;

  // Poll while a sync runs, then refresh the rates table once it ends.
  useEffect(() => {
    if (!running) return;
    const timer = setInterval(async () => {
      const next = await api.yalidine.status().catch(() => null);
      if (next && !next.sync.running) {
        clearInterval(timer);
        reloadStatus();
        onSynced();
        if (next.sync.error) toast.error(`Synchronisation échouée : ${next.sync.error}`);
        else toast.success('Synchronisation Yalidine terminée');
      } else if (next) {
        reloadStatus();
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [running, reloadStatus, onSynced, toast]);

  const sync = async () => {
    setStarting(true);
    if (await toast.run(() => api.yalidine.sync(applyPrices))) reloadStatus();
    setStarting(false);
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    if (await toast.run(() => api.settings.save(form), 'Paramètres de livraison enregistrés')) {
      setDraft(null);
      reloadSettings();
      reloadStatus();
    }
    setSaving(false);
  };

  const yal = form?.yalidine;
  const setYal = (patch: Partial<NonNullable<StoreSettings['yalidine']>>) =>
    form && yal && setDraft({ ...form, yalidine: { ...yal, ...patch } });
  const setParcel = (key: keyof NonNullable<StoreSettings['yalidine']>['parcel'], value: string) =>
    yal && setYal({ parcel: { ...yal.parcel, [key]: Math.max(0, Number(value) || 0) } });

  return (
    <Card className="mb-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="rounded-xl bg-red-50 p-2.5 text-red-600">
            <Truck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black">
              Yalidine
              {status && (status.configured ? <Badge tone="emerald">API connectée</Badge> : <Badge tone="amber">Clés API manquantes</Badge>)}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {status
                ? `${status.communes} communes et ${status.centers} bureaux synchronisés · dernière synchro : ${fmt(status.lastSync)}`
                : 'Chargement...'}
            </p>
            {status && !status.configured && (
              <p className="mt-1 text-xs text-amber-700">
                Ajoutez YALIDINE_API_ID et YALIDINE_API_TOKEN dans le fichier .env du serveur, puis redémarrez l’API.
              </p>
            )}
            {running && <p className="mt-1 text-xs font-bold text-blue-700">Synchronisation en cours : {status?.sync.step}…</p>}
            {!running && status?.sync.summary && (
              <p className="mt-1 text-xs text-emerald-700">
                Dernière synchro : {status.sync.summary.wilayas} wilayas, {status.sync.summary.communes} communes, {status.sync.summary.centers} bureaux,
                {' '}tarifs mis à jour pour {status.sync.summary.pricedWilayas} wilayas.
              </p>
            )}
            {!running && status?.sync.error && <p className="mt-1 text-xs text-red-600">Erreur : {status.sync.error}</p>}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button icon={RefreshCw} onClick={sync} loading={starting || running} disabled={!status?.configured}>
            Synchroniser avec Yalidine
          </Button>
          <label className="flex items-center gap-2 text-[11px] font-semibold text-slate-600">
            <Toggle checked={applyPrices} onChange={setApplyPrices} />
            Appliquer les tarifs Yalidine
          </label>
        </div>
      </div>

      {form && yal && (
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-4">
            <Toggle
              checked={yal.autoSync}
              onChange={(v) => setYal({ autoSync: v })}
              label="Synchronisation automatique chaque nuit"
              description="Tarifs, communes et bureaux mis à jour depuis Yalidine vers 3 h du matin. Les tarifs modifiés à la main sont alors remplacés."
            />
          </div>
          <Field label="Wilaya d’expédition" hint="Les tarifs Yalidine dépendent du départ.">
            <Select value={yal.fromWilaya} onChange={(e) => setYal({ fromWilaya: Number(e.target.value) })}>
              {rates.map((r) => (
                <option key={r.wilayaCode} value={r.wilayaCode}>
                  {String(r.wilayaCode).padStart(2, '0')} - {r.wilayaName}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Livraison gratuite dès (DA)" hint="0 = jamais gratuite.">
            <Input
              type="number"
              min={0}
              step={500}
              value={form.freeShippingThreshold}
              onChange={(e) => setDraft({ ...form, freeShippingThreshold: Math.max(0, Number(e.target.value) || 0) })}
            />
          </Field>
          <Field label="Colis par défaut (cm)" hint="Longueur × largeur × hauteur">
            <div className="flex gap-1.5">
              <Input type="number" min={0} value={yal.parcel.length} onChange={(e) => setParcel('length', e.target.value)} aria-label="Longueur" />
              <Input type="number" min={0} value={yal.parcel.width} onChange={(e) => setParcel('width', e.target.value)} aria-label="Largeur" />
              <Input type="number" min={0} value={yal.parcel.height} onChange={(e) => setParcel('height', e.target.value)} aria-label="Hauteur" />
            </div>
          </Field>
          <Field label="Poids par défaut (kg)" hint="Au-delà de 5 kg Yalidine facture un supplément.">
            <Input type="number" min={0} value={yal.parcel.weight} onChange={(e) => setParcel('weight', e.target.value)} />
          </Field>
          {draft && (
            <div className="sm:col-span-2 lg:col-span-4">
              <Button icon={Save} onClick={save} loading={saving}>
                Enregistrer ces paramètres
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
