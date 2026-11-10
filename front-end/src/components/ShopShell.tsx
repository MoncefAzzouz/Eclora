'use client';

// The storefront frame shared by every customer page: announcement, header,
// menu, footer, cart drawer and quick view.
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import AnnouncementBar from '@/components/AnnouncementBar';
import Header from '@/components/Header';
import CategoryNav from '@/components/CategoryNav';
import Footer from '@/components/Footer';
import type { Product } from '@/data/products';
import { useCart } from '@/lib/shop/cart';
import { useWishlist } from '@/lib/shop/wishlist';

const CartDrawer = dynamic(() => import('@/components/CartDrawer'));
const QuickViewModal = dynamic(() => import('@/components/QuickViewModal'));

export default function ShopShell({ children, announcement }: { children: React.ReactNode; announcement?: string }) {
  const cart = useCart();
  const { wishlist, toggle: toggleWishlist } = useWishlist();
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  return (
    <div className="min-h-screen bg-white text-black flex flex-col">
      <AnnouncementBar text={announcement} />
      <Header
        wishlistCount={wishlist.length}
        cartCount={cart.count}
        onOpenCart={() => cart.setOpen(true)}
        onOpenQuickView={setQuickViewProduct}
      />
      <CategoryNav />
      <main className="flex-1">{children}</main>
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
