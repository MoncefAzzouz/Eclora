'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import ShopPage from '@/components/ShopPage';
import type { Product } from '@/data/products';
import { shopApi, toProduct } from '@/lib/shop/api';
import { useCart } from '@/lib/shop/cart';
import { useAsyncData } from '@/lib/useAsyncData';
import { useWishlist } from '@/lib/shop/wishlist';

export default function ShopCategoryPage() {
  const { category } = useParams<{ category: string }>();
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const { data, loading, error } = useAsyncData(async () => {
    const [products, categories, brands] = await Promise.all([
      shopApi.products({ category, limit: 100 }),
      shopApi.categories(),
      shopApi.brands(),
    ]);
    return { products: products.map(toProduct), categories, brands };
  }, [category]);

  const categoryName = data?.categories.find((c) => c.slug === category)?.name ?? category;
  const brandFilters = (data?.brands ?? []).map((b) => ({ name: b.name, count: b.count }));

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

      {error ? (
        <p className="max-w-7xl mx-auto px-4 py-16 text-sm text-red-700">{error}</p>
      ) : (
        <ShopPage
          categoryName={String(categoryName)}
          products={data?.products ?? []}
          brands={brandFilters}
          loading={loading}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={(product) => cart.add(product)}
        />
      )}

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
