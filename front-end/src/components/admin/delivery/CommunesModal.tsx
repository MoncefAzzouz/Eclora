'use client';

// Per-commune prices of one wilaya. An empty price means "same as the wilaya";
// the Yalidine sync fills in the communes Yalidine charges more for.
import React, { useMemo, useState } from 'react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import type { DeliveryCommune, ShippingRate } from '@/types/admin';
import { Badge, Button, ErrorState, Input, LoadingState, Modal, SearchInput, Table, Td, Th, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

export default function CommunesModal({ rate, onClose }: { rate: ShippingRate; onClose: () => void }) {
  const { data, loading, error, reload } = useApi(() => api.yalidine.communes(rate.wilayaCode), [rate.wilayaCode]);
  return (
    <Modal open onClose={onClose} title={`Communes — ${rate.wilayaName}`} size="lg">
      {loading ? (
        <LoadingState />
      ) : error || !data ? (
        <ErrorState message={error ?? 'Erreur'} onRetry={reload} />
      ) : data.length === 0 ? (
        <p className="text-sm text-slate-500">
          Aucune commune pour cette wilaya. Lancez « Synchroniser avec Yalidine » pour importer les communes et les bureaux.
        </p>
      ) : (
        <Editor rate={rate} saved={data} onClose={onClose} />
      )}
    </Modal>
  );
}

function Editor({ rate, saved, onClose }: { rate: ShippingRate; saved: DeliveryCommune[]; onClose: () => void }) {
  const toast = useToast();
  const [rows, setRows] = useState(saved);
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const dirty = useMemo(() => JSON.stringify(rows) !== JSON.stringify(saved), [rows, saved]);
  const visible = rows.filter((r) => r.name.toLowerCase().includes(query.trim().toLowerCase()));

  const update = (id: number, patch: Partial<DeliveryCommune>) => setRows((all) => all.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const price = (v: string) => (v.trim() === '' ? null : Math.max(0, Number(v) || 0));

  const save = async () => {
    setSaving(true);
    const ok = await toast.run(
      () => api.yalidine.saveCommunes(rows.map(({ id, homePrice, stopdeskPrice, isDeliverable }) => ({ id, homePrice, stopdeskPrice, isDeliverable }))),
      'Tarifs des communes enregistrés'
    );
    setSaving(false);
    if (ok) onClose();
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-500">
        Laissez vide pour appliquer le tarif de la wilaya ({rate.homePrice} DA domicile, {rate.stopdeskPrice} DA bureau).
      </p>
      <SearchInput value={query} onChange={setQuery} placeholder="Rechercher une commune..." />
      <div className="max-h-[55vh] overflow-y-auto">
        <Table>
          <thead>
            <tr>
              <Th>Commune</Th>
              <Th>Domicile (DA)</Th>
              <Th>Bureau (DA)</Th>
              <Th>Livrable</Th>
            </tr>
          </thead>
          <tbody>
            {visible.map((c) => (
              <tr key={c.id}>
                <Td className="font-semibold">
                  {c.name} {c.hasStopDesk && <Badge tone="blue">bureau</Badge>}
                  {c.deliveryDays && <span className="block text-[11px] text-slate-400">{c.deliveryDays}</span>}
                </Td>
                <Td>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    placeholder={String(rate.homePrice)}
                    value={c.homePrice ?? ''}
                    onChange={(e) => update(c.id, { homePrice: price(e.target.value) })}
                    className="!w-24 !py-1.5"
                    aria-label={`Domicile ${c.name}`}
                  />
                </Td>
                <Td>
                  <Input
                    type="number"
                    min={0}
                    step={50}
                    placeholder={String(rate.stopdeskPrice)}
                    value={c.stopdeskPrice ?? ''}
                    onChange={(e) => update(c.id, { stopdeskPrice: price(e.target.value) })}
                    className="!w-24 !py-1.5"
                    aria-label={`Bureau ${c.name}`}
                  />
                </Td>
                <Td>
                  <Toggle checked={c.isDeliverable} onChange={(v) => update(c.id, { isDeliverable: v })} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button onClick={save} loading={saving} disabled={!dirty}>
          Enregistrer
        </Button>
      </div>
    </div>
  );
}
