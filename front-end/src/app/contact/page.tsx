import Link from 'next/link';
import { ArrowUpRight, Clock3, Mail, MapPin, Phone } from 'lucide-react';
import ShopShell from '@/components/ShopShell';
import StoreImage from '@/components/StoreImage';
import ScrollReveal from '@/components/content/ScrollReveal';
import { resolvePages } from '@/lib/site-pages';
import { loadPublicSettings } from '@/lib/shop/public-settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Contact | Eclora Algérie', description: 'Une question sur un produit ou une commande ? Contactez l’équipe Eclora.' };

export default async function ContactPage() {
  const settings = await loadPublicSettings();
  const { contact } = resolvePages(settings?.pages);
  const phone = settings?.contactPhone?.trim();
  const email = settings?.contactEmail?.trim();
  const address = settings?.address?.trim();
  const socials = Object.entries(settings?.socials ?? {}).filter(([, url]) => /^https?:\/\//i.test(url));
  return <ShopShell><ScrollReveal>
    <section className="bg-[#f7f2ec] px-5 pb-16 pt-12 sm:px-10 lg:pb-24 lg:pt-20">
      <div className="mx-auto max-w-6xl">
        <p className="editorial-eyebrow"><span className="h-2 w-2 rounded-full bg-[#e56636]" />Contact</p>
        <div className="mt-8 grid items-end gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-20">
          <h1 className="whitespace-pre-line text-[clamp(3.25rem,6vw,6rem)] font-semibold leading-[1.04] tracking-[-0.06em]">{contact.title}</h1>
          <p className="max-w-lg whitespace-pre-line text-base leading-8 text-neutral-600 sm:text-lg">{contact.intro}</p>
        </div>
      </div>
    </section>
    <section className="bg-white px-5 py-16 sm:px-10 lg:py-24">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div data-reveal className="relative min-h-[360px] overflow-hidden rounded-t-[140px] bg-[#eee2d8] lg:min-h-[600px]">
          <StoreImage src={contact.image} alt="La beauté et le soin au quotidien" fill priority sizes="(max-width: 1024px) 90vw, 600px" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <p className="absolute bottom-8 left-7 right-7 text-3xl font-medium leading-tight tracking-tight text-white sm:bottom-10 sm:left-10">Une question ?<br />Faisons connaissance.</p>
        </div>
        <div data-reveal className="min-w-0">
          <p className="editorial-eyebrow">Restons en contact</p>
          <h2 className="mt-5 text-3xl font-medium tracking-tight">À votre écoute.</h2>
          <div className="mt-8 divide-y divide-neutral-200 border-y border-neutral-200">
            {email && <a href={`mailto:${email}`} className="group flex min-w-0 items-start gap-4 py-6"><Mail className="mt-1 h-5 w-5 shrink-0 text-[#b9512c]" /><span className="min-w-0 flex-1"><span className="editorial-eyebrow">Par email</span><span className="mt-2 block break-all text-lg font-medium group-hover:text-[#b9512c]">{email}</span></span><ArrowUpRight className="mt-2 h-4 w-4 shrink-0" /></a>}
            {phone && <a href={`tel:${phone.replace(/[^+\d]/g, '')}`} className="group flex items-start gap-4 py-6"><Phone className="mt-1 h-5 w-5 shrink-0 text-[#b9512c]" /><span className="min-w-0 flex-1"><span className="editorial-eyebrow">Par téléphone</span><span className="mt-2 block text-lg font-medium group-hover:text-[#b9512c]">{phone}</span></span><ArrowUpRight className="mt-2 h-4 w-4 shrink-0" /></a>}
            {address && <div className="flex items-start gap-4 py-6"><MapPin className="mt-1 h-5 w-5 shrink-0 text-[#b9512c]" /><div><p className="editorial-eyebrow">Notre adresse</p><p className="mt-2 whitespace-pre-line text-base leading-7">{address}</p></div></div>}
            {contact.hours && <div className="flex items-start gap-4 py-6"><Clock3 className="mt-1 h-5 w-5 shrink-0 text-[#b9512c]" /><div><p className="editorial-eyebrow">Nos horaires</p><p className="mt-2 whitespace-pre-line text-base leading-7">{contact.hours}</p></div></div>}
          </div>
          {contact.note && <p className="mt-6 whitespace-pre-line rounded-xl bg-[#f7f2ec] p-5 text-sm leading-7 text-neutral-600">{contact.note}</p>}
          {socials.length > 0 && <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3">{socials.map(([name, url]) => <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-semibold capitalize hover:text-[#b9512c]">{name}<ArrowUpRight className="h-4 w-4" /></a>)}</div>}
        </div>
      </div>
    </section>
    <section className="border-t border-neutral-200 bg-[#fbf9f6] px-5 py-14 sm:px-10">
      <div data-reveal className="mx-auto flex max-w-6xl flex-col justify-between gap-6 sm:flex-row sm:items-center">
        <div><p className="editorial-eyebrow">Besoin d’un renseignement ?</p><h2 className="mt-3 text-2xl font-medium tracking-tight">Les réponses à vos questions pratiques.</h2></div>
        <Link href="/aide" className="editorial-button shrink-0 self-start">Consulter l’aide<ArrowUpRight className="h-4 w-4" /></Link>
      </div>
    </section>
  </ScrollReveal></ShopShell>;
}
