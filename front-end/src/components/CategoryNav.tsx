'use client';

// Main menu. Categories and their subcategories come from the database (admin →
// Catégories), so adding a subcategory there adds it here. Hovering a category
// on desktop opens its panel; on phones a tap reveals the subcategories first.
import React, { useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, X } from 'lucide-react';
import { useAllBrands, useCategories } from '@/lib/shop/catalog';

const BRANDS_KEY = '__brands';

export default function CategoryNav() {
  const categories = useCategories();
  const brands = useAllBrands();
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const panelId = useId();

  const activeCategory = categories.find((c) => c.slug === active);
  const close = () => setActive(null);
  const toggle = (slug: string) => setActive((current) => current === slug ? null : slug);
  const openOnHover = (slug: string, pointerType: string) => {
    if (pointerType === 'mouse' && window.matchMedia('(min-width: 768px) and (hover: hover)').matches) {
      setActive(slug);
    }
  };

  useEffect(() => {
    if (!active) return;
    const onOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !navRef.current?.contains(event.target)) setActive(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      const trigger = Array.from(navRef.current?.querySelectorAll<HTMLElement>('[aria-expanded="true"]') ?? [])
        .find((element) => element.getClientRects().length > 0);
      setActive(null);
      if (trigger?.getClientRects().length) trigger.focus();
    };
    document.addEventListener('pointerdown', onOutsidePress);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onOutsidePress);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [active]);

  return (
    <nav
      ref={navRef}
      aria-label="Catégories de la boutique"
      className="relative z-30 border-b border-gray-200 bg-white shadow-2xs"
      onPointerLeave={(event) => event.pointerType === 'mouse' && close()}
    >
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <ul className="no-scrollbar flex items-center gap-6 overflow-x-auto whitespace-nowrap py-3.5 text-[14px] font-medium text-black lg:gap-8">
          {categories.map((cat) => (
            <li key={cat.id} onPointerEnter={(event) => openOnHover(cat.slug, event.pointerType)}>
              {cat.subcategories.length > 0 && (
                <button
                  type="button"
                  aria-expanded={active === cat.slug}
                  aria-controls={panelId}
                  onClick={() => toggle(cat.slug)}
                  className={`inline-flex min-h-11 items-center gap-1.5 border-b-2 pb-1 uppercase tracking-[0.04em] md:hidden ${active === cat.slug ? 'border-black' : 'border-transparent'} ${cat.badgeColor === 'PINK' ? 'text-[#d80075]' : cat.badgeColor === 'RED' ? 'text-[#d32f2f]' : ''}`}
                  style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
                >
                  {cat.name}
                  <ChevronDown aria-hidden="true" className={`h-3.5 w-3.5 transition-transform ${active === cat.slug ? 'rotate-180' : ''}`} />
                </button>
              )}
              <Link
                href={`/shop/${cat.slug}`}
                aria-expanded={cat.subcategories.length > 0 ? active === cat.slug : undefined}
                aria-controls={cat.subcategories.length > 0 ? panelId : undefined}
                onClick={(event) => {
                  const pointer = 'pointerType' in event.nativeEvent ? event.nativeEvent.pointerType : '';
                  if (cat.subcategories.length > 0 && (pointer === 'touch' || pointer === 'pen' || window.matchMedia('(hover: none)').matches)) {
                    event.preventDefault();
                    toggle(cat.slug);
                  } else close();
                }}
                onFocus={() => {
                  if (window.matchMedia('(min-width: 768px) and (hover: hover)').matches) setActive(cat.slug);
                }}
                className={`${cat.subcategories.length > 0 ? 'hidden md:inline-block' : 'inline-block'} border-b-2 pb-1 uppercase tracking-[0.04em] transition-colors ${
                  active === cat.slug ? 'border-black' : 'border-transparent hover:text-gray-600'
                } ${cat.badgeColor === 'PINK' ? 'text-[#d80075]' : cat.badgeColor === 'RED' ? 'text-[#d32f2f]' : ''}`}
                style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
              >
                {cat.name}
              </Link>
            </li>
          ))}
          <li onPointerEnter={(event) => openOnHover(BRANDS_KEY, event.pointerType)}>
            <Link
              href="/marques"
              onClick={close}
              className={`inline-block border-b-2 pb-1 uppercase tracking-[0.04em] transition-colors ${
                active === BRANDS_KEY ? 'border-black' : 'border-transparent hover:text-gray-600'
              }`}
              style={{ fontFamily: 'var(--font-avantgarde)', fontWeight: 500 }}
            >
              Nos Marques
            </Link>
          </li>
        </ul>
      </div>

      {activeCategory && (
        <div id={panelId} className="absolute inset-x-0 top-full z-50 max-h-[60dvh] overflow-y-auto overscroll-contain border-b border-gray-200 bg-white py-4 shadow-2xl md:py-8">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-4 px-4 sm:px-6 md:grid-cols-12 md:gap-8 lg:px-8">
            <div className="relative border-b border-gray-100 pb-4 pr-10 md:col-span-3 md:border-b-0 md:border-r md:pb-0 md:pr-6">
              <button type="button" onClick={close} aria-label="Fermer les sous-catégories" className="absolute right-0 top-0 flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 md:hidden">
                <X className="h-4 w-4" />
              </button>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">{activeCategory.description}</p>
              <h3 className="mt-1 text-xl font-black md:text-2xl">{activeCategory.name}</h3>
              <Link
                href={`/shop/${activeCategory.slug}`}
                onClick={close}
                className="mt-3 inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-xs font-bold text-white transition hover:bg-neutral-800 md:mt-5"
              >
                Voir tout <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 content-start gap-x-6 gap-y-1 text-sm sm:grid-cols-2 md:col-span-9 md:grid-cols-3 md:gap-x-8 md:gap-y-3">
              {activeCategory.subcategories.map((sub) => (
                <li key={sub.id}>
                  <Link
                    href={`/shop/${activeCategory.slug}?sub=${sub.slug}`}
                    onClick={close}
                    className="block py-2.5 text-gray-700 transition-colors hover:text-black hover:underline md:py-0"
                  >
                    {sub.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {active === BRANDS_KEY && brands.length > 0 && (
        <div className="absolute inset-x-0 top-full z-50 hidden animate-fade-in border-b border-gray-200 bg-white py-8 shadow-2xl md:block">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-5 gap-3 lg:grid-cols-9">
              {brands.map((b) => (
                <Link
                  key={b.id}
                  href={`/marques/${b.slug}`}
                  onClick={close}
                  title={b.name}
                  className="flex h-20 items-center justify-center rounded-xl border border-gray-100 p-3 transition hover:border-gray-300 hover:shadow-sm"
                >
                  {b.logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.logoUrl} alt={b.name} className="max-h-full max-w-full object-contain" loading="lazy" />
                  ) : (
                    <span className="text-center text-xs font-black tracking-wide">{b.name}</span>
                  )}
                </Link>
              ))}
            </div>
            <Link href="/marques" onClick={close} className="mt-5 inline-flex items-center gap-2 text-sm font-bold hover:underline">
              Toutes nos marques <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
