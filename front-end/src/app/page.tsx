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
import CartDrawer, { CartItem } from '@/components/CartDrawer';
import QuickViewModal from '@/components/QuickViewModal';
import { BEST_SELLERS, NEW_LAUNCHES, Product } from '@/data/products';

export default function Home() {
  const [wishlist, setWishlist] = useState<string[]>(['huda-easy-bake']);
  const [cart, setCart] = useState<CartItem[]>([
    { product: BEST_SELLERS[0], quantity: 1 },
  ]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Toggle wishlist item
  const handleToggleWishlist = (productId: string) => {
    setWishlist((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Add to cart
  const handleAddToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  // Update item quantity
  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove from cart
  const handleRemoveFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  return (
    <div className="min-h-screen bg-white text-black flex flex-col font-sans selection:bg-pink-100 selection:text-pink-900">
      {/* Top Announcement Bar */}
      <AnnouncementBar />

      {/* Main Header */}
      <Header
        wishlistCount={wishlist.length}
        cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuickView={(product) => setQuickViewProduct(product)}
      />

      {/* Category Navigation Bar */}
      <CategoryNav />

      {/* Main Content Area */}
      <main className="flex-1 pb-12">
        {/* Main Hero Banner - Dior Miss Dior */}
        <HeroBanner onDiscover={() => setQuickViewProduct(BEST_SELLERS[0])} />

        {/* Dual Promo Banners */}
        <PromoGrid onDiscover={() => setQuickViewProduct(BEST_SELLERS[1])} />

        {/* Best Sellers Section */}
        <ProductCarousel
          title="Meilleures ventes maquillage"
          products={BEST_SELLERS}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onOpenQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* Middle Dual Promos (Erborian & Perfumes) */}
        <MiddleBanner onDiscover={() => setQuickViewProduct(NEW_LAUNCHES[1])} />

        {/* New Beauty Launches Section */}
        <ProductCarousel
          title="Derniers meileurs"
          products={NEW_LAUNCHES}
          wishlist={wishlist}
          onToggleWishlist={handleToggleWishlist}
          onOpenQuickView={(product) => setQuickViewProduct(product)}
        />

        {/* Trust & Guarantee Service Bar */}
        <TrustBar />
      </main>

      {/* Eclora Dark Footer */}
      <Footer />

      {/* Interactive Cart Slide-over Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
      />

      {/* Product Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlist.includes(quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />
    </div>
  );
}
