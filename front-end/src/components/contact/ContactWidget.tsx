'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowUpRight, Mail, MessageCircle, MessageSquare, Phone, PhoneCall, X } from 'lucide-react';
import { shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';
import { resolvePages } from '@/lib/site-pages';

export default function ContactWidget() {
  const { data } = useAsyncData(() => shopApi.settings());
  const contact = resolvePages(data?.pages).contact;
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null), trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const path = usePathname();
  useEffect(() => {
    if (!open) return;
    root.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const key = (event: KeyboardEvent) => { if (event.key === 'Escape') { setOpen(false); trigger.current?.focus(); } };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false); };
    document.addEventListener('keydown', key); document.addEventListener('pointerdown', outside);
    return () => { document.removeEventListener('keydown', key); document.removeEventListener('pointerdown', outside); };
  }, [open]);
  if (!data || !contact.chatEnabled) return null;
  const channels = [
    ...(contact.whatsappNumber ? [{ label: 'WhatsApp', href: `https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`, icon: MessageCircle, color: 'bg-[#16873e]', external: true }] : []),
    ...(data?.contactPhone ? [{ label: contact.phoneLabel, href: `tel:${data.contactPhone.replace(/[^+\d]/g, '')}`, icon: Phone, color: 'bg-[#d64b1d]', external: false }] : []),
    ...(contact.viberUrl ? [{ label: 'Viber', href: contact.viberUrl, icon: PhoneCall, color: 'bg-[#7360f2]', external: true }] : []),
    ...(data?.contactEmail ? [{ label: contact.emailLabel, href: `mailto:${data.contactEmail}`, icon: Mail, color: 'bg-neutral-800', external: false }] : []),
  ];
  return <div ref={root} className={`fixed right-4 z-40 flex flex-col items-end gap-3 sm:right-6 ${path.startsWith('/product/') ? 'bottom-24' : 'bottom-5 sm:bottom-6'}`}>
    {open && <div id={id} role="dialog" aria-labelledby={`${id}-title`} className="w-[min(320px,calc(100vw-32px))] overflow-hidden rounded-2xl border border-neutral-200 bg-white text-black shadow-2xl">
      <div className="bg-neutral-950 px-5 py-5 text-white"><h2 id={`${id}-title`} className="text-lg font-semibold tracking-tight">{contact.chatTitle}</h2><p className="mt-2 whitespace-pre-line text-xs leading-6 text-neutral-300">{contact.chatIntro}</p></div>
      <div className="space-y-1 p-3">
        {channels.map(({ label, href, icon: Icon, color, external }) => <a key={href} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="group flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium hover:bg-neutral-50"><span className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${color}`}><Icon className="h-5 w-5" /></span><span className="min-w-0 flex-1 break-words">{label}</span><ArrowUpRight className="h-4 w-4 text-neutral-400" /></a>)}
        {contact.formEnabled && <Link href="/contact#message" onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-xl p-2.5 text-sm font-medium hover:bg-neutral-50"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50 text-[#d64b1d]"><MessageSquare className="h-5 w-5" /></span><span className="flex-1">{contact.messageLabel}</span><ArrowUpRight className="h-4 w-4 text-neutral-400" /></Link>}
      </div>
    </div>}
    <button ref={trigger} type="button" aria-label={open ? 'Fermer les moyens de contact' : 'Ouvrir les moyens de contact'} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f05b2a] text-white shadow-lg ring-4 ring-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}</button>
  </div>;
}
