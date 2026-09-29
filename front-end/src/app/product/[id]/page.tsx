'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import ProductDetailPage from '@/components/ProductDetailPage';
import type { Product } from '@/data/products';
import { shopApi, toProduct } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';
import { useWishlist } from '@/lib/shop/wishlist';

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data, loading, error } = useAsyncData(async () => {
    const product = await shopApi.product(id);
    const related = await shopApi.products({ category: product.categorySlug, limit: 10 });
    return {
      product: toProduct(product),
      related: related.filter((p) => p.id !== product.id).map(toProduct),
    };
  }, [id]);

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar />
      <Header
        wishlistCount={wishlist.length}
        cartCount={cart.count}
        onOpenCart={() => cart.setOpen(true)}
        onOpenQuickView={setQuickViewProduct}
      />
      <CategoryNav />

      {loading && <p className="max-w-7xl mx-auto px-4 py-24 text-sm text-neutral-500">Chargement du produit...</p>}

      {error && (
        <div className="max-w-7xl mx-auto px-4 py-24 text-center">
          <p className="text-sm font-bold text-neutral-900">{error}</p>
          <Link href="/" className="inline-block mt-4 text-sm underline">
            Retour à l&apos;accueil
          </Link>
        </div>
      )}

      {data && (
        <ProductDetailPage
          key={data.product.id}
          product={data.product}
          related={data.related}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={(product, shadeName) => cart.add(product, shadeName)}
        />
      )}

      <Footer />

      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        onUpdateQuantity={(itemId, delta, shade) => cart.updateQuantity(itemId, delta, shade)}
        onRemoveItem={(itemId, shade) => cart.remove(itemId, shade)}
      />
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product) => cart.add(product)}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />
    </div>
  );
}
