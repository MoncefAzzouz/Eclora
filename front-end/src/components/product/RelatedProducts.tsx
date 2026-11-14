'use client';

import { useEffect, useRef, useState } from 'react';
import ProductCarousel from '@/components/ProductCarousel';
import type { Product } from '@/data/products';
import { shopApi, toProduct } from '@/lib/shop/api';
import { useWishlist } from '@/lib/shop/wishlist';

/** Optional content: never blocks the product or competes with its first photo. */
export default function RelatedProducts({ productId }: { productId: string }) {
  const root = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[] | null>(null);
  const { wishlist, toggle } = useWishlist();

  useEffect(() => {
    const controller = new AbortController();
    let started = false;
    const load = () => {
      if (started) return;
      started = true;
      shopApi.relatedProducts(productId, controller.signal)
        .then((items) => { if (!controller.signal.aborted) setProducts(items.map(toProduct)); })
        .catch(() => { if (!controller.signal.aborted) setProducts([]); });
    };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer?.disconnect();
        load();
      }
    }, { rootMargin: '600px' });
    if (observer && root.current) observer.observe(root.current);
    else load();
    return () => { observer?.disconnect(); controller.abort(); };
  }, [productId]);

  return <div ref={root}>
    {products === null ? <div className="min-h-[380px] py-10" aria-label="Suggestions de produits">
      <h2 className="text-xl font-bold">Vous aimerez aussi</h2>
      <div aria-hidden="true" className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[0, 1, 2, 3].map((index) => <div key={index} className="h-64 rounded-xl bg-neutral-50 motion-safe:animate-pulse" />)}
      </div>
    </div> : products.length > 0 && <ProductCarousel title="Vous aimerez aussi" products={products} wishlist={wishlist} onToggleWishlist={toggle} onOpenQuickView={() => {}} />}
  </div>;
}
