'use client';

import React from 'react';
import { ChevronUp } from 'lucide-react';
import Link from 'next/link';
import { shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';
import { useCategories } from '@/lib/shop/catalog';

const ICONS: Record<'instagram' | 'facebook' | 'tiktok', React.ReactNode> = {
  instagram: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
  ),
  facebook: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
  ),
  tiktok: (
    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
  ),
};

const LINK = 'text-white/85 transition-colors hover:text-white hover:underline';

export default function Footer() {
  const categories = useCategories();
  const { data: settings } = useAsyncData(() => shopApi.settings());
  const socials = (Object.keys(ICONS) as (keyof typeof ICONS)[]).filter((k) => settings?.socials[k]?.trim());
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-r from-[#f05b2a] to-[#faae3c] pb-12 pt-12 text-white">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 border-b border-white/25 pb-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider">Boutique</h3>
            <ul className="space-y-2.5 text-[13px]">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/shop/${c.slug}`} className={LINK}>
                    {c.name}
                    {c.description ? ` · ${c.description}` : ''}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/marques" className={LINK}>Nos Marques</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider">Mon ECLORA</h3>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/compte" className={LINK}>Mon compte</Link></li>
              <li><Link href="/suivi" className={LINK}>Suivre ma commande</Link></li>
              <li><Link href="/panier" className={LINK}>Mon panier</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider">Aide</h3>
            <ul className="space-y-2.5 text-[13px]">
              <li><Link href="/aide#livraison" className={LINK}>Livraison</Link></li>
              <li><Link href="/aide#paiement" className={LINK}>Paiement</Link></li>
              <li><Link href="/aide#retours" className={LINK}>Retours</Link></li>
              <li><Link href="/aide#contact" className={LINK}>Nous contacter</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2.5 text-[13px] text-white/90">
              {settings?.contactPhone && (
                <li><a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className={LINK}>{settings.contactPhone}</a></li>
              )}
              {settings?.contactEmail && (
                <li><a href={`mailto:${settings.contactEmail}`} className={`${LINK} break-all`}>{settings.contactEmail}</a></li>
              )}
              {settings?.address && <li>{settings.address}</li>}
            </ul>
            {socials.length > 0 && (
              <div className="mt-5 flex items-center gap-3">
                {socials.map((k) => (
                  <a
                    key={k}
                    href={settings!.socials[k]}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full bg-white/15 p-2 transition-colors hover:bg-white/25"
                    aria-label={k}
                  >
                    {ICONS[k]}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-6 pt-6 text-[12px] text-white/85">
          <p>© {new Date().getFullYear()} ECLORA Algérie. Tous droits réservés.</p>
          <button
            onClick={scrollToTop}
            className="rounded-xl border border-white/50 p-3 transition-colors hover:bg-white hover:text-[#f05b2a]"
            aria-label="Revenir en haut"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
