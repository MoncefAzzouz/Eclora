'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageCircle, Phone, PhoneCall, X } from 'lucide-react';
import { shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';
import { resolvePages } from '@/lib/site-pages';
import { viberLink } from '@/lib/contact-channels';

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
  const phone = contact.chatPhoneNumber ?? data.contactPhone;
  const viber = viberLink(contact);
  const channels = [
    ...(contact.whatsappNumber ? [{ label: 'WhatsApp', number: contact.whatsappNumber, href: `https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`, icon: MessageCircle, color: 'bg-[#16873e]', external: true }] : []),
    ...(phone ? [{ label: 'Téléphone', number: phone, href: `tel:${phone.replace(/[^+\d]/g, '')}`, icon: Phone, color: 'bg-[#d64b1d]', external: false }] : []),
    ...(viber ? [{ label: 'Viber', number: contact.viberNumber ?? '', href: viber, icon: PhoneCall, color: 'bg-[#7360f2]', external: false }] : []),
  ];
  if (!channels.length) return null;
  return <div ref={root} className={`fixed right-4 z-40 flex flex-col items-end gap-3 sm:right-6 ${path.startsWith('/product/') ? 'bottom-24' : 'bottom-5 sm:bottom-6'}`}>
    {open && <div id={id} role="dialog" aria-label="Moyens de contact" className="flex max-h-[calc(100dvh-13rem)] w-[min(280px,calc(100vw-32px))] flex-col gap-2.5 overflow-y-auto rounded-2xl p-1">
      {channels.map(({ label, number, href, icon: Icon, color, external }) => <a key={label} href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="group flex min-h-16 items-center gap-3 rounded-2xl border border-neutral-200 bg-white p-3 text-black shadow-lg transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black">
        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white ${color}`}><Icon className="h-5 w-5" /></span>
        <span className="min-w-0"><span className="block text-sm font-semibold">{label}</span>{number && <span className="mt-0.5 block break-words text-[13px] font-medium leading-5 text-neutral-600">{number}</span>}</span>
      </a>)}
    </div>}
    <button ref={trigger} type="button" aria-label={open ? 'Fermer les moyens de contact' : 'Ouvrir les moyens de contact'} aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)} className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f05b2a] text-white shadow-lg ring-4 ring-white transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black">{open ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}</button>
  </div>;
}
