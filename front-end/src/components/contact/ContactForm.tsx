'use client';

import { useId, useRef, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';
import { shopApi } from '@/lib/shop/api';
import type { SitePages } from '@/lib/site-pages';

const CONTROL = 'mt-2 w-full rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3.5 text-sm text-black outline-none transition focus:border-[#f05b2a] focus:bg-white focus:ring-2 focus:ring-[#f05b2a]/15 disabled:opacity-60';

export default function ContactForm({ content }: { content: SitePages['contact'] }) {
  const id = useId();
  const firstInput = useRef<HTMLInputElement>(null);
  const [values, setValues] = useState({ name: '', email: '', phone: '', message: '', website: '' });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (sending) return;
    setSending(true); setError('');
    try {
      await shopApi.contact(values);
      setSent(true); setValues({ name: '', email: '', phone: '', message: '', website: '' });
    } catch (error) { setError(error instanceof Error ? error.message : 'Envoi impossible. Réessayez dans un instant.'); }
    finally { setSending(false); }
  };
  if (sent) return <div className="flex min-h-[540px] flex-col items-start justify-center" role="status" aria-live="polite">
    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 text-[#f05b2a]"><CheckCircle2 className="h-8 w-8" /></span>
    <h2 className="mt-7 text-3xl font-semibold tracking-tight">Message reçu.</h2>
    <p className="mt-4 whitespace-pre-line text-base leading-7 text-neutral-600">{content.successMessage}</p>
    <button type="button" className="mt-8 border-b border-black pb-1 text-sm font-semibold" onClick={() => setSent(false)}>Écrire un autre message</button>
  </div>;
  return <form id="message" onSubmit={submit} className="scroll-mt-28" aria-labelledby={`${id}-title`}>
    <p className="editorial-eyebrow text-[#c8481c]">Échangeons ensemble</p>
    <h2 id={`${id}-title`} className="mt-4 whitespace-pre-line text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">{content.formTitle}</h2>
    {content.formIntro && <p className="mt-4 whitespace-pre-line text-sm leading-7 text-neutral-500">{content.formIntro}</p>}
    <fieldset disabled={sending} className="mt-7 min-w-0 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div><label htmlFor={`${id}-name`} className="text-xs font-semibold">{content.nameLabel} <span aria-hidden="true" className="text-[#c8481c]">*</span></label><input ref={firstInput} id={`${id}-name`} required minLength={2} maxLength={120} autoComplete="name" className={CONTROL} value={values.name} onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))} /></div>
        <div><label htmlFor={`${id}-email`} className="text-xs font-semibold">{content.emailFieldLabel} <span aria-hidden="true" className="text-[#c8481c]">*</span></label><input id={`${id}-email`} type="email" required maxLength={254} autoComplete="email" className={CONTROL} value={values.email} onChange={(event) => setValues((v) => ({ ...v, email: event.target.value }))} /></div>
      </div>
      <div><label htmlFor={`${id}-phone`} className="text-xs font-semibold">{content.phoneFieldLabel} <span aria-hidden="true" className="text-[#c8481c]">*</span></label><input id={`${id}-phone`} type="tel" required minLength={6} maxLength={40} autoComplete="tel" className={CONTROL} value={values.phone} onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))} /></div>
      <div><label htmlFor={`${id}-message`} className="text-xs font-semibold">{content.messageLabel} <span aria-hidden="true" className="text-[#c8481c]">*</span></label><textarea id={`${id}-message`} required minLength={10} maxLength={5000} rows={5} className={`${CONTROL} resize-y`} value={values.message} onChange={(event) => setValues((v) => ({ ...v, message: event.target.value }))} /><p className="mt-1 text-right text-[10px] text-neutral-400">{values.message.length} / 5 000</p></div>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden"><label htmlFor={`${id}-website`}>Site web</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => setValues((v) => ({ ...v, website: event.target.value }))} /></div>
      {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</p>}
      <button type="submit" className="flex w-full items-center justify-center gap-3 rounded-xl bg-black px-5 py-4 text-sm font-semibold text-white transition-colors hover:bg-[#df4f20] disabled:cursor-wait disabled:bg-neutral-400">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}{sending ? 'Envoi en cours…' : content.submitLabel}</button>
    </fieldset>
  </form>;
}
