import Link from 'next/link';
import ShopShell from '@/components/ShopShell';

export default function ProductNotFound() {
  return <ShopShell><div className="mx-auto max-w-7xl px-4 py-24 text-center">
    <h1 className="text-xl font-bold">Produit introuvable</h1>
    <p className="mt-3 text-sm text-neutral-600">Ce produit n’est plus disponible dans notre catalogue.</p>
    <Link href="/" className="mt-6 inline-block text-sm underline">Retour à la boutique</Link>
  </div></ShopShell>;
}
