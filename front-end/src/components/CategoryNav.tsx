'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface MegaColumn {
  title?: string;
  items: { label: string; isRed?: boolean; isBold?: boolean }[];
}

interface MegaMenuData {
  col1: { label: string; isRed?: boolean; isBold?: boolean }[];
  col2: MegaColumn[];
  col3: MegaColumn[];
  col4: MegaColumn[];
}

const MEGA_MENUS: Record<string, MegaMenuData> = {
  Parfum: {
    col1: [
      { label: 'Voir tout', isBold: true },
      { label: 'Jusqu\'à -30% sur une sélection de parfums', isRed: true, isBold: true },
      { label: 'Nouveautés', isBold: true },
      { label: 'Meilleures ventes 🔥', isBold: true },
      { label: 'Uniquement chez Eclora', isBold: true },
      { label: 'Minis & formats voyage 🧳', isBold: true },
      { label: 'Coffrets parfum', isBold: true },
      { label: 'Coffrets parfum femme' },
      { label: 'Coffrets parfum homme' },
    ],
    col2: [
      {
        title: 'Parfum femme',
        items: [
          { label: 'Eau de parfum' },
          { label: 'Eau de toilette' },
          { label: 'Parfum cheveux' },
          { label: 'Parfum solide' },
          { label: 'Soins corps parfumés' },
        ],
      },
      {
        title: 'Parfum homme',
        items: [
          { label: 'Eau de parfum' },
          { label: 'Eau de toilette' },
          { label: 'Eau de cologne' },
          { label: 'Déodorants' },
          { label: 'Parfum' },
        ],
      },
    ],
    col3: [
      {
        title: 'Notes olfactives',
        items: [
          { label: 'Parfum floral' },
          { label: 'Parfum vanillé' },
          { label: 'Parfum boisé' },
          { label: 'Parfum sucré' },
        ],
      },
      { title: 'Brume parfumée', items: [] },
      { title: 'Parfum de niche', items: [] },
      { title: 'Parfum enfant', items: [] },
      { title: 'Parfum mixte', items: [] },
      { title: 'Gravure personnalisée', items: [] },
      { title: 'Parfums rechargeables 💛', items: [] },
      { title: 'Bougies parfumées', items: [] },
    ],
    col4: [
      {
        title: 'Bien-être',
        items: [
          { label: 'Parfum d\'intérieur' },
          { label: 'Huiles essentielles' },
        ],
      },
      { title: 'Parfums à petits prix', items: [] },
    ],
  },

  Maquillage: {
    col1: [
      { label: 'Voir tout le maquillage', isBold: true },
      { label: 'Jusqu\'à -30% sur le teint', isRed: true, isBold: true },
      { label: 'Nouveautés Maquillage', isBold: true },
      { label: 'Meilleures ventes 🔥', isBold: true },
      { label: 'Exclusivités web', isBold: true },
    ],
    col2: [
      {
        title: 'Teint',
        items: [
          { label: 'Fond de teint' },
          { label: 'Anti-cernes & Correcteur' },
          { label: 'Poudre libre & Baking' },
          { label: 'Bronzer & Contour' },
          { label: 'Blush & Enlumineur' },
          { label: 'Base de teint & Spray fixateur' },
        ],
      },
    ],
    col3: [
      {
        title: 'Yeux',
        items: [
          { label: 'Mascara' },
          { label: 'Palettes fards à paupières' },
          { label: 'Eyeliner & Crayon' },
          { label: 'Sourcils & Cire fixante' },
        ],
      },
      {
        title: 'Lèvres',
        items: [
          { label: 'Rouge à lèvres' },
          { label: 'Gloss & Repulpeur' },
          { label: 'Crayon à lèvres' },
          { label: 'Baume à lèvres' },
        ],
      },
    ],
    col4: [
      {
        title: 'Pinceaux & Accessoires',
        items: [
          { label: 'Éponges de teint' },
          { label: 'Pinceaux visage' },
          { label: 'Pinceaux yeux' },
          { label: 'Recourbe-cils' },
        ],
      },
    ],
  },

  'Soin Visage': {
    col1: [
      { label: 'Tous les soins visage', isBold: true },
      { label: 'Offres promos soin', isRed: true, isBold: true },
      { label: 'Nouveautés Soin', isBold: true },
      { label: 'Top Ventes Soin 🔥', isBold: true },
    ],
    col2: [
      {
        title: 'Nettoyant & Démaquillant',
        items: [
          { label: 'Eau micellaire' },
          { label: 'Huile démaquillante' },
          { label: 'Gel nettoyant' },
          { label: 'Gommage visage' },
        ],
      },
    ],
    col3: [
      {
        title: 'Hydratation & Traitement',
        items: [
          { label: 'Sérum & Concentré' },
          { label: 'Crème de jour' },
          { label: 'Crème de nuit' },
          { label: 'Contour des yeux' },
          { label: 'Protection solaire SPF' },
        ],
      },
    ],
    col4: [
      {
        title: 'Masques & Soins ciblés',
        items: [
          { label: 'Masque en tissu' },
          { label: 'Masque purifiant' },
          { label: 'Patchs anti-imperfections' },
        ],
      },
    ],
  },
};

export default function CategoryNav() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = [
    { name: 'Maquillage', slug: 'maquillage' },
    { name: 'Parfum', slug: 'parfum' },
    { name: 'Soin Visage', slug: 'soin-visage' },
    { name: 'Corps & Bain', slug: 'corps-bain' },
    { name: 'Cheveux', slug: 'cheveux' },
    { name: 'Nouveautés & Tendances', slug: 'nouveautes' },
    { name: 'Marques', slug: 'marques' },
    { name: 'Eclora Collection', slug: 'eclora-collection', color: 'pink' },
    { name: 'Bons plans & Cadeaux', slug: 'bons-plans' },
    { name: 'ECLORA edit', slug: 'eclora-edit' },
    { name: 'Dernière chance -40%', slug: 'derniere-chance', color: 'red' },
  ];

  const currentMegaData = activeCategory ? MEGA_MENUS[activeCategory] || MEGA_MENUS['Maquillage'] : null;

  return (
    <nav
      className="bg-white border-b border-gray-200 relative z-30 shadow-2xs"
      onMouseLeave={() => setActiveCategory(null)}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-6 lg:space-x-8 overflow-x-auto no-scrollbar py-3.5 text-[14px] text-black whitespace-nowrap font-avantgarde font-medium">
          {categories.map((cat) => {
            const isPink = cat.color === 'pink';
            const isRed = cat.color === 'red';
            const isActive = activeCategory === cat.name;

            return (
              <div
                key={cat.name}
                className="relative py-1 cursor-pointer group"
                onMouseEnter={() => setActiveCategory(cat.name)}
              >
                <Link
                  href={`/shop/${cat.slug}`}
                  className={`inline-block pb-1 tracking-[0.01em] transition-all ${
                    isActive
                      ? 'text-black border-b-2 border-black'
                      : isPink
                      ? 'text-[#d80075] hover:text-[#b0005e]'
                      : isRed
                      ? 'text-[#d32f2f] hover:text-[#a02020]'
                      : 'hover:text-gray-600'
                  }`}
                  style={{
                    fontFamily: 'var(--font-avantgarde)',
                    fontWeight: 500,
                  }}
                >
                  {cat.name}
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Full-width Mega Menu Dropdown Banner */}
      {activeCategory && currentMegaData && (
        <div
          className="absolute left-0 right-0 top-full bg-white border-b border-gray-200 shadow-2xl z-50 animate-fade-in py-8"
          onMouseEnter={() => setActiveCategory(activeCategory)}
          onMouseLeave={() => setActiveCategory(null)}
        >
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
              {/* Column 1: Quick Links */}
              <div className="space-y-3.5 border-r border-gray-100 pr-6">
                {currentMegaData.col1.map((item, idx) => (
                  <div key={idx}>
                    <Link
                      href={`/shop/${categories.find((c) => c.name === activeCategory)?.slug || 'maquillage'}`}
                      className={`block hover:underline transition-colors ${
                        item.isRed
                          ? 'text-[#d32f2f] font-extrabold text-sm leading-snug'
                          : item.isBold
                          ? 'text-black font-extrabold text-xs'
                          : 'text-gray-700 font-medium'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
              </div>

              {/* Column 2 */}
              <div className="space-y-6">
                {currentMegaData.col2.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    {sec.title && (
                      <h4 className="font-extrabold text-black text-xs uppercase tracking-wide">
                        {sec.title}
                      </h4>
                    )}
                    {sec.items.length > 0 && (
                      <ul className="space-y-2 text-gray-700 font-normal">
                        {sec.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={`/shop/${categories.find((c) => c.name === activeCategory)?.slug || 'maquillage'}`}
                              className="hover:text-black hover:underline transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Column 3 */}
              <div className="space-y-4">
                {currentMegaData.col3.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    {sec.title && (
                      <h4 className="font-extrabold text-black text-xs uppercase tracking-wide hover:underline cursor-pointer">
                        {sec.title}
                      </h4>
                    )}
                    {sec.items.length > 0 && (
                      <ul className="space-y-2 text-gray-700 font-normal">
                        {sec.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={`/shop/${categories.find((c) => c.name === activeCategory)?.slug || 'maquillage'}`}
                              className="hover:text-black hover:underline transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* Column 4 */}
              <div className="space-y-6">
                {currentMegaData.col4.map((sec, idx) => (
                  <div key={idx} className="space-y-2">
                    {sec.title && (
                      <h4 className="font-extrabold text-black text-xs uppercase tracking-wide hover:underline cursor-pointer">
                        {sec.title}
                      </h4>
                    )}
                    {sec.items.length > 0 && (
                      <ul className="space-y-2 text-gray-700 font-normal">
                        {sec.items.map((item, i) => (
                          <li key={i}>
                            <Link
                              href={`/shop/${categories.find((c) => c.name === activeCategory)?.slug || 'maquillage'}`}
                              className="hover:text-black hover:underline transition-colors"
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
