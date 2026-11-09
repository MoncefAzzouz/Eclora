'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ShopShell from '@/components/ShopShell';
import ProductDetailPage from '@/components/ProductDetailPage';
import { shopApi, toProduct } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';
import { useWishlist } from '@/lib/shop/wishlist';

function ProductContent() {
  const { id } = useParams<{ id: string }>();
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();

  const { data, loading, error } = useAsyncData(async () => {
    const product = await shopApi.product(id);
    // Same subcategory first, then the rest of the category.
    const related = await shopApi.products({ category: product.categorySlug, limit: 24 });
    const others = related.products
      .filter((p) => p.id !== product.id)
      .sort((a, b) => Number(b.subcategorySlug === product.subcategorySlug) - Number(a.subcategorySlug === product.subcategorySlug))
      .slice(0, 12);
    return { product: toProduct(product), related: others.map(toProduct) };
  }, [id]);

  if (loading) return <p className="mx-auto max-w-7xl px-4 py-24 text-sm text-neutral-500">Chargement du produit...</p>;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 text-center">
        <p className="text-sm font-bold text-neutral-900">{error ?? 'Produit introuvable'}</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }
  return (
    <ProductDetailPage
      key={data.product.id}
      product={data.product}
      related={data.related}
      wishlist={wishlist}
      onToggleWishlist={toggleWishlist}
      onAddToCart={(product, shadeName) => cart.add(product, shadeName)}
    />
  );
}

export default function ProductPage() {
  return (
    <ShopShell>
      <ProductContent />
    </ShopShell>
  );
}
