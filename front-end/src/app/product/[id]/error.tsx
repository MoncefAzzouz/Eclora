'use client';

import ShopShell from '@/components/ShopShell';

export default function ProductError({ retry }: { retry: () => void }) {
  return <ShopShell><div className="mx-auto max-w-7xl px-4 py-24 text-center">
    <h1 className="text-xl font-bold">Le produit ne peut pas être chargé pour le moment.</h1>
    <p className="mt-3 text-sm text-neutral-600">Veuillez réessayer dans un instant.</p>
    <button onClick={retry} className="mt-6 rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white">Réessayer</button>
  </div></ShopShell>;
}
