'use client';

import React, { useState } from 'react';
import { Save, Plus, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { useAuth } from '@/lib/admin/auth';
import { formatDA, initials, timeAgo } from '@/lib/admin/format';
import { ADMIN_ROLE, PAYMENT_METHOD } from '@/lib/admin/constants';
import type { AdminRole, AdminUser, PaymentMethod, StoreSettings } from '@/types/admin';
import { Badge, Button, Card, ConfirmDialog, ErrorState, Field, IconButton, Input, LoadingState, Modal, PageHeader, Select, Tabs, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

type Tab = 'store' | 'payments' | 'team';

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>('store');
  return (
    <div className="animate-fade-in">
      <PageHeader title="Paramètres" description="Informations de la boutique, moyens de paiement et accès de l’équipe." />
      <Tabs
        tabs={[
          { id: 'store', label: 'Boutique' },
          { id: 'payments', label: 'Paiement & livraison' },
          { id: 'team', label: 'Équipe' },
        ]}
        value={tab}
        onChange={setTab}
      />
      {tab === 'team' ? <TeamTab /> : <StoreTab section={tab} />}
    </div>
  );
}

function StoreTab({ section }: { section: 'store' | 'payments' }) {
  const { data, loading, error, reload } = useApi(() => api.settings.get());
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;
  return <StoreForm section={section} saved={data} reload={reload} />;
}

function StoreForm({ section, saved: data, reload }: { section: 'store' | 'payments'; saved: StoreSettings; reload: () => void }) {
  const toast = useToast();
  const [values, setValues] = useState<StoreSettings>(data);
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const set = <K extends keyof StoreSettings>(k: K, v: StoreSettings[K]) => setValues({ ...values, [k]: v });
  const dirty = JSON.stringify(values) !== JSON.stringify(data);

  const save = async () => {
    if (!Object.values(values.payments).some(Boolean)) return toast.error('Activez au moins un moyen de paiement');
    setSaving(true);
    if (await toast.run(() => api.settings.save(values), 'Paramètres enregistrés')) reload();
    setSaving(false);
  };

  const saveBar = (
    <div className="flex justify-end gap-2">
      {dirty && <Button variant="secondary" onClick={() => setValues(data)}>Annuler</Button>}
      <Button icon={Save} loading={saving} disabled={!dirty} onClick={save}>Enregistrer</Button>
    </div>
  );

  if (section === 'payments') {
    return (
      <div className="space-y-4 max-w-3xl">
        <Card title="Moyens de paiement" description="Proposés au client lors de la commande">
          <div className="space-y-4">
            {(Object.keys(PAYMENT_METHOD) as PaymentMethod[]).map((m) => (
              <Toggle
                key={m}
                checked={values.payments[m]}
                onChange={(v) => set('payments', { ...values.payments, [m]: v })}
                label={PAYMENT_METHOD[m]}
                description={m === 'COD' ? 'Le client paie le livreur à la réception' : m === 'BARIDIMOB' ? 'Virement via l’application BaridiMob' : 'Paiement en ligne via SATIM (à connecter avec le backend)'}
              />
            ))}
          </div>
        </Card>
        <Card title="Livraison gratuite">
          <Field label="Seuil de livraison gratuite (DA)" hint={values.freeShippingThreshold ? `Livraison offerte dès ${formatDA(values.freeShippingThreshold)}` : '0 = jamais gratuite'}>
            <Input type="number" min={0} step={500} value={values.freeShippingThreshold} onChange={(e) => set('freeShippingThreshold', Number(e.target.value))} className="max-w-xs" />
          </Field>
        </Card>
        {saveBar}
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl">
      <Card title="Informations de la boutique">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nom de la boutique"><Input value={values.storeName} onChange={(e) => set('storeName', e.target.value)} /></Field>
          <Field label="Email de contact"><Input type="email" value={values.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} /></Field>
          <Field label="Téléphone"><Input value={values.contactPhone} onChange={(e) => set('contactPhone', e.target.value)} /></Field>
          <Field label="Adresse"><Input value={values.address} onChange={(e) => set('address', e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Bandeau d’annonce" description="Barre de texte tout en haut de la boutique">
        <div className="space-y-4">
          <Toggle checked={values.announcementEnabled} onChange={(v) => set('announcementEnabled', v)} label="Afficher le bandeau" />
          <Field label="Texte">
            <Input value={values.announcementText} onChange={(e) => set('announcementText', e.target.value)} disabled={!values.announcementEnabled} maxLength={120} />
          </Field>
          {values.announcementEnabled && (
            <div className="bg-black text-white text-[11px] font-bold text-center py-2 rounded-lg">{values.announcementText || '...'}</div>
          )}
        </div>
      </Card>

      <Card title="Réseaux sociaux">
        <div className="grid sm:grid-cols-3 gap-4">
          {(['instagram', 'facebook', 'tiktok'] as const).map((k) => (
            <Field key={k} label={k[0]!.toUpperCase() + k.slice(1)}>
              <Input value={values.socials[k]} onChange={(e) => set('socials', { ...values.socials, [k]: e.target.value })} placeholder="https://..." />
            </Field>
          ))}
        </div>
      </Card>

      <Card title="Maintenance">
        <Toggle
          checked={values.maintenanceMode}
          onChange={(v) => set('maintenanceMode', v)}
          label="Mode maintenance"
          description="La boutique affiche une page « Bientôt de retour ». L’admin reste accessible."
        />
      </Card>

      {saveBar}

      {process.env.NODE_ENV !== 'production' && (
        <Card title="Données de démonstration" description="Outil de développement, disparaîtra avec le backend">
          <Button variant="secondary" icon={RotateCcw} onClick={() => setConfirmReset(true)}>Réinitialiser les données de démo</Button>
        </Card>
      )}

      <ConfirmDialog
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={async () => {
          await api.resetDemoData();
          window.location.reload();
        }}
        title="Réinitialiser ?"
        message="Toutes les modifications faites dans l’admin (produits, commandes, paramètres...) seront effacées et remplacées par les données de démo."
        confirmLabel="Réinitialiser"
      />
    </div>
  );
}

type UserDraft = { id?: string; name: string; email: string; role: AdminRole; isActive: boolean; password: string };

function TeamTab() {
  const toast = useToast();
  const { user: me } = useAuth();
  const { data: users, loading, error, reload } = useApi(() => api.team.list());
  const [draft, setDraft] = useState<UserDraft | null>(null);
  const [toDelete, setToDelete] = useState<AdminUser | null>(null);
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingState />;
  if (error || !users) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;

  const canManage = me?.role === 'OWNER' || me?.role === 'ADMIN';

  const save = async () => {
    if (!draft) return;
    if (!draft.name.trim() || !/^\S+@\S+\.\S+$/.test(draft.email)) return toast.error('Nom et email valide obligatoires');
    setBusy(true);
    const ok = await toast.run(
      () => api.team.save({ ...draft, name: draft.name.trim(), password: draft.password || undefined }),
      draft.id ? 'Membre mis à jour' : 'Membre ajouté'
    );
    setBusy(false);
    if (ok) {
      setDraft(null);
      reload();
    }
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <Card
        title="Membres de l’équipe"
        description="Chaque rôle donne accès à certaines pages de l’admin."
        padded={false}
        actions={canManage && <Button size="sm" icon={Plus} onClick={() => setDraft({ name: '', email: '', role: 'SUPPORT', isActive: true, password: '' })}>Inviter</Button>}
      >
        <ul className="divide-y divide-slate-100">
          {users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <span className="w-9 h-9 rounded-full bg-slate-900 text-white flex items-center justify-center text-[11px] font-bold">{initials(u.name)}</span>
              <div className="flex-1 min-w-0 text-xs">
                <div className="font-bold flex items-center gap-2 flex-wrap">
                  {u.name}
                  {u.id === me?.id && <Badge tone="blue">Vous</Badge>}
                  {!u.isActive && <Badge tone="red">Désactivé</Badge>}
                </div>
                <div className="text-slate-500 truncate">{u.email} · {u.lastLoginAt ? `connecté ${timeAgo(u.lastLoginAt)}` : 'jamais connecté'}</div>
              </div>
              <Badge>{ADMIN_ROLE[u.role].label}</Badge>
              {canManage && (
                <div className="flex">
                  <IconButton label="Modifier" icon={Edit2} onClick={() => setDraft({ id: u.id, name: u.name, email: u.email, role: u.role, isActive: u.isActive, password: '' })} />
                  <IconButton label="Supprimer" icon={Trash2} tone="danger" disabled={u.role === 'OWNER' || u.id === me?.id} onClick={() => setToDelete(u)} />
                </div>
              )}
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Rôles">
        <ul className="space-y-2 text-xs">
          {(Object.keys(ADMIN_ROLE) as AdminRole[]).map((r) => (
            <li key={r} className="flex gap-2"><b className="w-28 flex-shrink-0">{ADMIN_ROLE[r].label}</b><span className="text-slate-600">{ADMIN_ROLE[r].description}</span></li>
          ))}
        </ul>
      </Card>

      <Modal
        open={!!draft}
        onClose={() => setDraft(null)}
        title={draft?.id ? 'Modifier le membre' : 'Nouveau membre'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>Annuler</Button>
            <Button loading={busy} onClick={save}>Enregistrer</Button>
          </>
        }
      >
        {draft && (
          <>
            <Field label="Nom *"><Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></Field>
            <Field label="Email *"><Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} /></Field>
            <Field label="Rôle" hint={ADMIN_ROLE[draft.role].description}>
              <Select value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value as AdminRole })} disabled={draft.role === 'OWNER' && !!draft.id}>
                {(Object.keys(ADMIN_ROLE) as AdminRole[]).filter((r) => r !== 'OWNER' || draft.role === 'OWNER').map((r) => (
                  <option key={r} value={r}>{ADMIN_ROLE[r].label}</option>
                ))}
              </Select>
            </Field>
            <Field label={draft.id ? 'Nouveau mot de passe' : 'Mot de passe *'} hint={draft.id ? 'Laisser vide pour ne pas changer' : '8 caractères minimum'}>
              <Input type="password" autoComplete="new-password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
            </Field>
            {draft.role !== 'OWNER' && <Toggle checked={draft.isActive} onChange={(v) => setDraft({ ...draft, isActive: v })} label="Compte actif" />}
          </>
        )}
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onClose={() => setToDelete(null)}
        onConfirm={async () => {
          if (toDelete && (await toast.run(() => api.team.remove(toDelete.id), 'Membre supprimé'))) reload();
          setToDelete(null);
        }}
        title="Retirer ce membre ?"
        message={`${toDelete?.name} n’aura plus accès à l’admin.`}
      />
    </div>
  );
}
