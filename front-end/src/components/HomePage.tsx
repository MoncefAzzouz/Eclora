'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import HeroBanner from '@/components/HeroBanner';
import PromoGrid from '@/components/PromoGrid';
import ProductCarousel from '@/components/ProductCarousel';
import MiddleBanner from '@/components/MiddleBanner';
import TrustBar from '@/components/TrustBar';
import Footer from '@/components/Footer';
import type { Product } from '@/data/products';
import { shopApi, toProduct, type HomePayload } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';
import { useWishlist } from '@/lib/shop/wishlist';

const CartDrawer = dynamic(() => import('@/components/CartDrawer'));
const QuickViewModal = dynamic(() => import('@/components/QuickViewModal'));

export default function HomePage({ initialData }: { initialData: HomePayload | null }) {
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const recovered = useAsyncData(() => initialData ? Promise.resolve(initialData) : shopApi.home(), [!!initialData]);
  const data = initialData ?? recovered.data;
  const loading = !initialData && recovered.loading;
  const error = !initialData ? recovered.error : null;

  const sections = (data?.sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    products: section.products.map(toProduct),
  }));

  const scrollToProducts = () => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      <AnnouncementBar text={data?.announcement} />
      <Header
        wishlistCount={wishlist.length}
        cartCount={cart.count}
        onOpenCart={() => cart.setOpen(true)}
        onOpenQuickView={setQuickViewProduct}
      />
      <CategoryNav />

      <main className="flex-1 pb-12">
        <HeroBanner onDiscover={scrollToProducts} banners={data?.banners.hero} />
        <PromoGrid onDiscover={scrollToProducts} banners={data?.banners.dual} />

        <div id="produits">
          {error && (
            <p className="max-w-7xl mx-auto px-4 py-10 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl my-6">
              {error} — vérifiez que le serveur (backend) est démarré.
            </p>
          )}
          {loading && <p className="max-w-7xl mx-auto px-4 py-16 text-sm text-neutral-500">Chargement de la boutique...</p>}

          {sections.slice(0, 1).map((section) => (
            <ProductCarousel
              key={section.id}
              title={section.title}
              products={section.products}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onOpenQuickView={setQuickViewProduct}
            />
          ))}

          {sections.length > 0 && <MiddleBanner onDiscover={scrollToProducts} banners={data?.banners.middle} />}

          {sections.slice(1).map((section) => (
            <ProductCarousel
              key={section.id}
              title={section.title}
              products={section.products}
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
              onOpenQuickView={setQuickViewProduct}
            />
          ))}
        </div>

        <TrustBar />
      </main>

      <Footer />

      {cart.isOpen && <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        onUpdateQuantity={(id, delta, shade) => cart.updateQuantity(id, delta, shade)}
        onRemoveItem={(id, shade) => cart.remove(id, shade)}
      />}
      {quickViewProduct && <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={(product) => cart.add(product)}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={toggleWishlist}
      />}
    </div>
  );
}
