import Link from 'next/link';
import { ArrowDown, ArrowUpRight, Sparkles } from 'lucide-react';
import ShopShell from '@/components/ShopShell';
import StoreImage from '@/components/StoreImage';
import ScrollReveal from '@/components/content/ScrollReveal';
import { resolvePages } from '@/lib/site-pages';
import { loadPublicSettings } from '@/lib/shop/public-settings';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'À propos | Eclora Algérie', description: 'Découvrez l’univers Eclora : nos envies, notre histoire et une beauté à votre façon.' };

export default async function AboutPage() {
  const settings = await loadPublicSettings();
  const { about } = resolvePages(settings?.pages);
  return <ShopShell><ScrollReveal>
    <section className="relative overflow-hidden bg-[#f7f2ec]">
      <div className="mx-auto grid max-w-[1440px] items-center gap-10 px-5 py-14 sm:px-10 lg:min-h-[720px] lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="relative z-10">
          <p className="editorial-eyebrow"><span className="h-2 w-2 rounded-full bg-[#e56636]" />L’univers Eclora</p>
          <h1 className="mt-8 whitespace-pre-line text-[clamp(3.5rem,6.6vw,6.8rem)] font-semibold leading-[1.03] tracking-[-0.065em]">{about.title}</h1>
          <p className="mt-7 max-w-md whitespace-pre-line text-base leading-7 text-neutral-600 sm:text-lg">{about.intro}</p>
          <a href="#notre-histoire" className="mt-10 inline-flex items-center gap-4 text-xs font-bold uppercase tracking-[0.12em] group">
            <span className="flex h-12 w-12 items-center justify-center rounded-full border border-black/20 transition-colors group-hover:bg-black group-hover:text-white"><ArrowDown className="h-4 w-4" /></span>Notre histoire
          </a>
        </div>
        <div className="relative mx-auto w-full max-w-lg lg:ml-auto">
          <div className="relative aspect-[4/4.5] overflow-hidden rounded-t-[48%] rounded-b-2xl bg-[#e3d7c7]">
            <StoreImage src={about.heroImage} alt="L’univers beauté Eclora, un sérum dans une lumière naturelle" fill priority sizes="(max-width: 1024px) 90vw, 520px" className="object-cover object-[center_60%]" />
          </div>
          <span aria-hidden="true" className="absolute -left-5 bottom-8 flex h-24 w-24 items-center justify-center rounded-full bg-[#e56636] text-white shadow-lg sm:-left-9 sm:h-28 sm:w-28"><Sparkles className="editorial-spark h-12 w-12 stroke-[1]" /></span>
          <p className="mt-4 text-right text-[10px] uppercase tracking-[0.25em] text-neutral-500">Des essentiels. Des envies. Vous.</p>
        </div>
      </div>
    </section>

    <section id="notre-histoire" className="scroll-mt-24 bg-white px-5 py-20 sm:px-10 lg:py-32">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-24">
        <div data-reveal className="relative aspect-[4/4.2] overflow-hidden rounded-[2px_100px_2px_2px] bg-[#f4eae0]">
          <StoreImage src={about.storyImage} alt="Un moment pour prendre soin de soi" fill sizes="(max-width: 1024px) 90vw, 560px" className="object-cover" />
          <span className="absolute bottom-6 left-6 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">Le plaisir de prendre soin de soi</span>
        </div>
        <div data-reveal>
          <p className="editorial-eyebrow">01 — Notre histoire</p>
          <h2 className="editorial-heading mt-6">{about.storyTitle}</h2>
          <p className="mt-7 whitespace-pre-line text-base leading-8 text-neutral-600">{about.storyText}</p>
          <Link href="/marques" className="mt-8 inline-flex items-center gap-3 border-b border-black pb-2 text-sm font-semibold hover:text-[#bb4d25]">Les marques à découvrir<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>

    <section className="relative overflow-hidden bg-[#20261f] px-5 py-20 text-[#f7f2ec] sm:px-10 lg:py-32">
      <div aria-hidden="true" className="absolute -right-24 -top-32 h-96 w-96 rounded-full border border-white/10" />
      <div className="relative mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_2fr] lg:gap-20">
        <p data-reveal className="editorial-eyebrow !text-[#c5cbbd]">02 — Notre philosophie</p>
        <div data-reveal>
          <h2 className="editorial-heading max-w-3xl">{about.missionTitle}</h2>
          <p className="mt-8 max-w-2xl whitespace-pre-line text-base leading-8 text-[#cdd0c7] sm:text-lg">{about.missionText}</p>
          <Sparkles aria-hidden="true" className="mt-10 h-9 w-9 stroke-[1] text-[#eda476]" />
        </div>
      </div>
    </section>

    <section className="bg-[#fbf9f6] px-5 py-20 sm:px-10 lg:py-32">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
        <div data-reveal className="self-start lg:sticky lg:top-32">
          <p className="editorial-eyebrow">03 — Nos valeurs</p>
          <h2 className="editorial-heading mt-6">{about.valuesTitle}</h2>
          <p className="mt-5 text-sm text-neutral-500">L’esprit Eclora, au quotidien.</p>
        </div>
        <div>{about.values.map((value, index) => <article key={index} data-reveal className="group flex gap-5 border-t border-black/15 py-8 sm:gap-8">
          <span className="pt-1 text-xs text-[#bc5731]">{String(index + 1).padStart(2, '0')}</span>
          <div><h3 className="text-2xl font-medium tracking-tight transition-colors group-hover:text-[#bb4d25] sm:text-3xl">{value.title}</h3><p className="mt-4 whitespace-pre-line text-base leading-7 text-neutral-600">{value.text}</p></div>
        </article>)}</div>
      </div>
    </section>

    <section className="bg-[#f0dfd0] px-5 py-20 text-center sm:px-10 lg:py-28">
      <div data-reveal className="mx-auto max-w-3xl">
        <p className="editorial-eyebrow justify-center">La suite commence avec vous</p>
        <h2 className="editorial-heading mt-6">{about.closingTitle}</h2>
        <p className="mx-auto mt-6 max-w-lg whitespace-pre-line text-base leading-7 text-neutral-600">{about.closingText}</p>
        <div className="mt-9 flex flex-wrap justify-center gap-4">
          <Link href="/" className="editorial-button">Explorer la boutique<ArrowUpRight className="h-4 w-4" /></Link>
          <Link href="/contact" className="editorial-button !border-black/20 !bg-transparent !text-black">Nous contacter<ArrowUpRight className="h-4 w-4" /></Link>
        </div>
      </div>
    </section>
  </ScrollReveal></ShopShell>;
}
