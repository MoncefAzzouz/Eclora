'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ImageUp, Plus, Save, Trash2 } from 'lucide-react';
import { api } from '@/lib/admin/api';
import { useApi } from '@/lib/admin/useApi';
import { resolvePages, type SitePages } from '@/lib/site-pages';
import type { StoreSettings } from '@/types/admin';
import { Button, Card, ErrorState, Field, IconButton, Input, LoadingState, Tabs, Textarea, Toggle } from '@/components/admin/ui';
import { useToast } from '@/components/admin/ui/Toast';

function PageImage({ label, value, onChange, onBusy }: { label: string; value: string; onChange: (url: string) => void; onBusy: (delta: number) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const upload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('5 Mo maximum par image');
    setUploading(true); onBusy(1);
    try { onChange((await api.uploads.image(file)).url); toast.success('Image importée'); }
    catch (error) { toast.error(error instanceof Error ? error.message : 'Envoi impossible'); }
    finally { setUploading(false); onBusy(-1); if (input.current) input.current.value = ''; }
  };
  return <div className="space-y-3 rounded-xl border border-slate-200 p-4">
    <p className="text-xs font-bold text-slate-700">{label}</p>
    {value && <div className="relative h-44 overflow-hidden rounded-lg bg-slate-50">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={value} alt={label} className="h-full w-full object-cover" />
    </div>}
    <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/avif" aria-label={label} className="hidden" onChange={(event) => void upload(event.target.files?.[0])} />
    <div className="flex flex-wrap gap-2">
      <Button type="button" variant="secondary" icon={ImageUp} loading={uploading} onClick={() => input.current?.click()}>Changer l’image</Button>
      {value && <IconButton type="button" label={`Retirer : ${label}`} icon={Trash2} disabled={uploading} onClick={() => onChange('')} />}
    </div>
    <p className="text-[11px] text-slate-500">JPG, PNG, WebP ou AVIF · 5 Mo maximum</p>
  </div>;
}

export default function PageSettings() {
  const { data, loading, error, reload } = useApi(() => api.settings.get());
  if (loading) return <LoadingState />;
  if (error || !data) return <ErrorState message={error ?? 'Erreur'} onRetry={reload} />;
  return <PageContentForm initial={data} />;
}

function PageContentForm({ initial }: { initial: StoreSettings }) {
  const initialValue = { pages: resolvePages(initial.pages), contactEmail: initial.contactEmail, contactPhone: initial.contactPhone, address: initial.address };
  const [saved, setSaved] = useState(initialValue);
  const [values, setValues] = useState(initialValue);
  const [section, setSection] = useState<'about' | 'contact'>('about');
  const [uploads, setUploads] = useState(0);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const dirty = JSON.stringify(values) !== JSON.stringify(saved);
  const busy = saving || uploads > 0;
  const setAbout = <K extends keyof SitePages['about']>(key: K, value: SitePages['about'][K]) => setValues((current) => ({ ...current, pages: { ...current.pages, about: { ...current.pages.about, [key]: value } } }));
  const setContact = <K extends keyof SitePages['contact']>(key: K, value: SitePages['contact'][K]) => setValues((current) => ({ ...current, pages: { ...current.pages, contact: { ...current.pages.contact, [key]: value } } }));
  const updateValue = (index: number, patch: Partial<{ title: string; text: string }>) => setValues((current) => ({ ...current, pages: { ...current.pages, about: { ...current.pages.about, values: current.pages.about.values.map((value, i) => i === index ? { ...value, ...patch } : value) } } }));
  const onBusy = (delta: number) => setUploads((count) => count + delta);
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setSaving(true);
    try {
      const result = await api.settings.savePages(values);
      const next = { pages: resolvePages(result.pages), contactEmail: result.contactEmail, contactPhone: result.contactPhone, address: result.address };
      setValues(next); setSaved(next); toast.success('Pages enregistrées et mises à jour sur la boutique');
    } catch (error) { toast.error(error instanceof Error ? error.message : 'Enregistrement impossible'); }
    finally { setSaving(false); }
  };
  const about = values.pages.about, contact = values.pages.contact;
  return <form onSubmit={save} className="max-w-5xl space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-100 bg-orange-50 p-4">
      <p className="max-w-xl text-xs leading-6 text-slate-600">Personnalisez vos pages. Les changements apparaissent sur la boutique après l’enregistrement.</p>
      <Link href={section === 'about' ? '/a-propos' : '/contact'} target="_blank" className="inline-flex items-center gap-2 text-xs font-bold text-orange-700">Voir la page<ArrowUpRight className="h-4 w-4" /></Link>
    </div>
    <Tabs tabs={[{ id: 'about', label: 'À propos' }, { id: 'contact', label: 'Contact' }]} value={section} onChange={setSection} />
    <fieldset disabled={saving} className="min-w-0 space-y-4">
      {section === 'about' ? <>
        <Card title="À propos — Introduction">
          <div className="grid items-start gap-5 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Field label="Titre principal"><Textarea value={about.title} required maxLength={180} rows={3} onChange={(event) => setAbout('title', event.target.value)} /></Field>
              <Field label="Texte d’introduction"><Textarea value={about.intro} maxLength={10000} rows={4} onChange={(event) => setAbout('intro', event.target.value)} /></Field>
            </div>
            <PageImage label="Image principale — À propos" value={about.heroImage} onChange={(url) => setAbout('heroImage', url)} onBusy={onBusy} />
          </div>
        </Card>
        <Card title="Notre histoire">
          <div className="grid items-start gap-5 md:grid-cols-[1.2fr_1fr]">
            <div className="space-y-4">
              <Field label="Titre de l’histoire"><Textarea value={about.storyTitle} required maxLength={180} rows={2} onChange={(event) => setAbout('storyTitle', event.target.value)} /></Field>
              <Field label="Votre histoire"><Textarea value={about.storyText} maxLength={10000} rows={8} onChange={(event) => setAbout('storyText', event.target.value)} /></Field>
            </div>
            <PageImage label="Image de l’histoire" value={about.storyImage} onChange={(url) => setAbout('storyImage', url)} onBusy={onBusy} />
          </div>
        </Card>
        <Card title="Notre philosophie"><div className="space-y-4">
          <Field label="Titre de la philosophie"><Textarea value={about.missionTitle} required maxLength={180} rows={2} onChange={(event) => setAbout('missionTitle', event.target.value)} /></Field>
          <Field label="Votre philosophie"><Textarea value={about.missionText} maxLength={10000} rows={5} onChange={(event) => setAbout('missionText', event.target.value)} /></Field>
        </div></Card>
        <Card title="Nos valeurs" actions={<Button type="button" size="sm" variant="secondary" icon={Plus} disabled={about.values.length >= 6} onClick={() => setAbout('values', [...about.values, { title: '', text: '' }])}>Ajouter une valeur</Button>}>
          <div className="space-y-4">
            <Field label="Titre de la section valeurs"><Input value={about.valuesTitle} required maxLength={180} onChange={(event) => setAbout('valuesTitle', event.target.value)} /></Field>
            {about.values.map((value, index) => <div key={index} className="space-y-3 rounded-xl border border-slate-200 p-4">
              <div className="flex items-end gap-3"><div className="min-w-0 flex-1"><Field label={`Valeur ${index + 1} — titre`}><Input value={value.title} required maxLength={180} onChange={(event) => updateValue(index, { title: event.target.value })} /></Field></div><IconButton type="button" label={`Retirer la valeur ${index + 1}`} icon={Trash2} disabled={about.values.length === 1} onClick={() => setAbout('values', about.values.filter((_, i) => i !== index))} /></div>
              <Field label={`Valeur ${index + 1} — texte`}><Textarea value={value.text} maxLength={10000} rows={3} onChange={(event) => updateValue(index, { text: event.target.value })} /></Field>
            </div>)}
          </div>
        </Card>
        <Card title="Invitation à découvrir la boutique"><div className="space-y-4">
          <Field label="Titre de fin"><Textarea value={about.closingTitle} required maxLength={180} rows={2} onChange={(event) => setAbout('closingTitle', event.target.value)} /></Field>
          <Field label="Texte de fin"><Textarea value={about.closingText} maxLength={10000} rows={3} onChange={(event) => setAbout('closingText', event.target.value)} /></Field>
        </div></Card>
      </> : <>
        <Card title="Contact — Introduction"><div className="grid items-start gap-5 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <Field label="Titre de la page Contact"><Textarea value={contact.title} required maxLength={180} rows={3} onChange={(event) => setContact('title', event.target.value)} /></Field>
            <Field label="Introduction de la page Contact"><Textarea value={contact.intro} maxLength={10000} rows={4} onChange={(event) => setContact('intro', event.target.value)} /></Field>
          </div>
          <PageImage label="Image de la page Contact" value={contact.image} onChange={(url) => setContact('image', url)} onBusy={onBusy} />
        </div></Card>
        <Card title="Coordonnées" description="Ces coordonnées sont également affichées dans le pied de page et les informations de la boutique."><div className="grid gap-4 sm:grid-cols-2">
          <Field label="Email de contact"><Input type="email" required value={values.contactEmail} onChange={(event) => setValues((current) => ({ ...current, contactEmail: event.target.value }))} /></Field>
          <Field label="Téléphone"><Input value={values.contactPhone} maxLength={100} onChange={(event) => setValues((current) => ({ ...current, contactPhone: event.target.value }))} /></Field>
          <Field label="Adresse"><Textarea value={values.address} maxLength={2000} rows={3} onChange={(event) => setValues((current) => ({ ...current, address: event.target.value }))} /></Field>
          <Field label="Horaires" hint="Laissez vide pour masquer les horaires"><Textarea value={contact.hours} maxLength={10000} rows={3} onChange={(event) => setContact('hours', event.target.value)} placeholder="Dimanche – jeudi : 9h – 18h" /></Field>
        </div></Card>
        <Card title="Libellés des coordonnées"><div className="grid gap-4 sm:grid-cols-2">
          {([['emailLabel', 'Libellé email'], ['phoneLabel', 'Libellé téléphone'], ['addressLabel', 'Libellé adresse'], ['hoursLabel', 'Libellé horaires']] as const).map(([key, label]) => <Field key={key} label={label}><Input value={contact[key]} required maxLength={180} onChange={(event) => setContact(key, event.target.value)} /></Field>)}
        </div></Card>
        <Card title="Formulaire de contact" description="Les demandes reçues sont disponibles dans Paramètres → Messages."><div className="space-y-4">
          <Toggle checked={contact.formEnabled} onChange={(value) => setContact('formEnabled', value)} label="Afficher le formulaire" />
          <Field label="Titre du formulaire"><Textarea value={contact.formTitle} required maxLength={180} rows={2} onChange={(event) => setContact('formTitle', event.target.value)} /></Field>
          <Field label="Introduction du formulaire"><Textarea value={contact.formIntro} maxLength={10000} rows={3} onChange={(event) => setContact('formIntro', event.target.value)} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {([['nameLabel', 'Libellé nom et prénom'], ['emailFieldLabel', 'Libellé champ email'], ['phoneFieldLabel', 'Libellé champ téléphone'], ['messageLabel', 'Libellé message'], ['submitLabel', 'Texte du bouton d’envoi']] as const).map(([key, label]) => <Field key={key} label={label}><Input value={contact[key]} required maxLength={180} onChange={(event) => setContact(key, event.target.value)} /></Field>)}
          </div>
          <Field label="Confirmation après envoi"><Textarea value={contact.successMessage} maxLength={10000} rows={3} onChange={(event) => setContact('successMessage', event.target.value)} /></Field>
        </div></Card>
        <Card title="Bouton de messagerie" description="Les numéros WhatsApp, téléphone et Viber se règlent dans Paramètres → Messages.">
          <Link href="/admin/settings?tab=messages" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700">Configurer les numéros<ArrowUpRight className="h-4 w-4" /></Link>
        </Card>
        <Card title="Informations complémentaires"><Field label="Note de contact"><Textarea value={contact.note} maxLength={10000} rows={4} onChange={(event) => setContact('note', event.target.value)} /></Field></Card>
      </>}
    </fieldset>
    <div className="sticky bottom-0 z-10 flex flex-wrap justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
      {dirty && <Button type="button" variant="secondary" disabled={busy} onClick={() => setValues(saved)}>Annuler les modifications</Button>}
      <Button type="submit" icon={Save} loading={saving} disabled={busy || !dirty}>Enregistrer les pages</Button>
    </div>
  </form>;
}
