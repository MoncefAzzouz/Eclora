import Link from 'next/link';
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import ShopShell from '@/components/ShopShell';
import StoreImage from '@/components/StoreImage';
import ScrollReveal from '@/components/content/ScrollReveal';
import ContactForm from '@/components/contact/ContactForm';
import { resolvePages } from '@/lib/site-pages';
import { loadPublicSettings } from '@/lib/shop/public-settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact | Eclora Algérie', description: 'Une question sur un produit ou une commande ? Écrivez à l’équipe Eclora.' };

export default async function ContactPage() {
  const settings = await loadPublicSettings();
  const { contact } = resolvePages(settings?.pages);
  const phone = settings?.contactPhone?.trim();
  const email = settings?.contactEmail?.trim();
  const address = settings?.address?.trim();
  const socials = Object.entries(settings?.socials ?? {}).filter(([, url]) => /^https?:\/\//i.test(url));
  return <ShopShell><ScrollReveal>
    <section className="relative isolate overflow-hidden bg-neutral-950 text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-20">
        <StoreImage src={contact.image} alt="" fill priority quality={90} sizes="100vw" className="object-cover object-center opacity-35" />
      </div>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-black/85 via-black/50 to-black/25" />
      <div className={`mx-auto grid max-w-[1320px] gap-12 px-5 py-14 sm:px-10 sm:py-20 ${contact.formEnabled ? 'lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-16' : 'max-w-5xl'}`}>
        <div className="min-w-0 lg:pt-8">
          <p className="editorial-eyebrow text-orange-200"><span className="h-2 w-2 rounded-full bg-[#f05b2a]" />Contact Eclora</p>
          <h1 className="mt-6 whitespace-pre-line text-[clamp(3rem,4.8vw,5rem)] font-semibold leading-[1.06] tracking-[-0.055em]">{contact.title}</h1>
          <p className="mt-7 max-w-lg whitespace-pre-line text-base leading-8 text-white/80 sm:text-lg">{contact.intro}</p>
          <div className="mt-10 grid gap-6 border-t border-white/20 pt-8 sm:grid-cols-2">
            {email && <a href={`mailto:${email}`} className="group min-w-0"><Mail className="h-5 w-5 text-orange-200" /><h2 className="mt-4 text-sm font-semibold">{contact.emailLabel}</h2><p className="mt-2 break-all text-sm leading-7 text-white/75 group-hover:text-white">{email}</p></a>}
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="group"><Phone className="h-5 w-5 text-orange-200" /><h2 className="mt-4 text-sm font-semibold">{contact.phoneLabel}</h2><p className="mt-2 text-sm leading-7 text-white/75 group-hover:text-white">{phone}</p></a>}
            {address && <div><MapPin className="h-5 w-5 text-orange-200" /><h2 className="mt-4 text-sm font-semibold">{contact.addressLabel}</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/75">{address}</p></div>}
            {contact.hours && <div><Clock3 className="h-5 w-5 text-orange-200" /><h2 className="mt-4 text-sm font-semibold">{contact.hoursLabel}</h2><p className="mt-2 whitespace-pre-line text-sm leading-7 text-white/75">{contact.hours}</p></div>}
          </div>
          {(contact.whatsappNumber || contact.viberUrl) && <div className="mt-7 flex flex-wrap gap-3">
            {contact.whatsappNumber && <a href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full border border-white/25 px-5 py-3 text-xs font-semibold hover:bg-white/10">WhatsApp<ArrowUpRight className="h-4 w-4" /></a>}
            {contact.viberUrl && <a href={contact.viberUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full border border-white/25 px-5 py-3 text-xs font-semibold hover:bg-white/10">Viber<ArrowUpRight className="h-4 w-4" /></a>}
          </div>}
          {contact.note && <p className="mt-8 max-w-lg whitespace-pre-line border-l-2 border-[#f05b2a] pl-4 text-xs leading-7 text-white/70">{contact.note}</p>}
          {socials.length > 0 && <div className="mt-8 flex flex-wrap gap-5">{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold capitalize text-white/80 hover:text-white">{name}<ArrowUpRight className="h-3.5 w-3.5" /></a>)}</div>}
        </div>
        {contact.formEnabled && <div className="min-w-0 rounded-3xl border border-white/70 bg-white p-6 text-black shadow-2xl sm:p-9"><ContactForm content={contact} /></div>}
      </div>
    </section>
    <section className="border-t border-neutral-200 bg-white px-5 py-12 sm:px-10">
      <div data-reveal className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div><p className="editorial-eyebrow">Besoin d’un renseignement ?</p><h2 className="mt-3 text-xl font-medium tracking-tight sm:text-2xl">Les réponses à vos questions pratiques.</h2></div>
        <Link href="/aide" className="editorial-button shrink-0 self-start">Consulter l’aide<ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </section>
  </ScrollReveal></ShopShell>;
}
