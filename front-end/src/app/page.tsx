'use client';

import React, { useState } from 'react';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import HeroBanner from '@/components/HeroBanner';
import PromoGrid from '@/components/PromoGrid';
import ProductCarousel from '@/components/ProductCarousel';
import MiddleBanner from '@/components/MiddleBanner';
import TrustBar from '@/components/TrustBar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import type { Product } from '@/data/products';
import { shopApi, toProduct } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';
import { useWishlist } from '@/lib/shop/wishlist';

export default function Home() {
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const { data, loading, error } = useAsyncData(() => shopApi.home());

  const sections = (data?.sections ?? []).map((section) => ({
    id: section.id,
    title: section.title,
    products: section.products.map(toProduct),
  }));

  const scrollToProducts = () => document.getElementById('produits')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white">
      <AnnouncementBar text={data?.announcement} />
      <Header
        wishlistCount={wishlist.length}
        cartCount={cart.count}
        onOpenCart={() => cart.setOpen(true)}
        onOpenQuickView={setQuickViewProduct}
      />
      <CategoryNav />

      <main>
        <HeroBanner onDiscover={scrollToProducts} banner={data?.banners.hero[0]} />
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

      <CartDrawer
        isOpen={cart.isOpen}
        onClose={() => cart.setOpen(false)}
        items={cart.items}
        onUpdateQuantity={(id, delta) => cart.updateQuantity(id, delta)}
        onRemoveItem={(id) => cart.remove(id)}
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
