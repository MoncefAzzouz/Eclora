'use client';

import { useState } from 'react';
import { Save } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import type { MessagingSettings } from '@/lib/contact-channels';
import { Button, Card, ErrorState, Field, Input, LoadingState, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

export default function MessagingSettingsCard() {
  const { data, loading, error, reload } = useApi(() => api.settings.messaging());
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Chargement impossible'} onRetry={reload} />;
  return <MessagingForm initial={data} />;
}

function MessagingForm({ initial }: { initial: MessagingSettings }) {
  const [saved, setSaved] = useState(initial);
  const [values, setValues] = useState(initial);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (saving || !dirty) return;
    setSaving(true);
    try {
      const result = await api.settings.saveMessaging(values);
      setValues(result); setSaved(result);
      toast.success('Numéros de contact enregistrés');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Enregistrement impossible'); }
    finally { setSaving(false); }
  };
  return <Card title="Bouton de messagerie" description="Choisissez les numéros proposés par le bouton de contact de la boutique.">
    <form onSubmit={save} className="space-y-5">
      <fieldset disabled={saving} className="min-w-0 space-y-5">
        <Toggle checked={values.chatEnabled} onChange={(chatEnabled) => setValues((current) => ({ ...current, chatEnabled }))} label="Afficher le bouton de contact" />
        <p className="text-xs leading-6 text-slate-500">Utilisez le format international, par exemple +213 555 12 34 56. Laissez un numéro vide pour masquer ce choix.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {([['whatsappNumber', 'Numéro WhatsApp'], ['chatPhoneNumber', 'Numéro de téléphone'], ['viberNumber', 'Numéro Viber']] as const).map(([key, label]) => <Field key={key} label={label}>
            <Input type="tel" autoComplete="off" maxLength={40} placeholder="+213…" value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} />
          </Field>)}
        </div>
      </fieldset>
      <div className="flex flex-wrap justify-end gap-3">
        {dirty && <Button type="button" variant="secondary" disabled={saving} onClick={() => setValues(saved)}>Annuler</Button>}
        <Button type="submit" icon={Save} loading={saving} disabled={!dirty}>Enregistrer les numéros</Button>
      </div>
    </form>
  </Card>;
}
