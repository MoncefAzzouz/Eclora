'use client';

import type { Product } from '@/data/products';
import ProductDetailPage from '@/components/ProductDetailPage';
import RelatedProducts from './RelatedProducts';
import { useCart } from '@/lib/shop/cart';
import { useWishlist } from '@/lib/shop/wishlist';

export default function ProductContent({ product }: { product: Product }) {
  const cart = useCart();
  const { wishlist, toggle } = useWishlist();
  return <ProductDetailPage
    product={product}
    wishlist={wishlist}
    onToggleWishlist={toggle}
    onAddToCart={(item, reference) => cart.add(item, reference)}
    recommendations={<RelatedProducts productId={product.id} />}
  />;
}
