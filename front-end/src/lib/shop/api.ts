// Storefront data layer. Talks to the public backend API (no account required)
// and maps rows into the `Product` shape the existing components already use.
import type { Product, Shade } from '@/data/products';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

export function formatDA(amount: number): string {
  return `${new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount).replace(/ | /g, ' ')} DA`;
}

export class ShopApiError extends Error {}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { ...(init?.body ? { 'Content-Type': 'application/json' } : {}), ...init?.headers },
      cache: 'no-store',
    });
  } catch {
    throw new ShopApiError('Connexion au serveur impossible. Réessayez dans un instant.');
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : 'Une erreur est survenue';
    throw new ShopApiError(message);
  }
  return data as T;
}

// ─── Backend shapes ─────────────────────────────────────────────────────────

export interface ApiProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  volume?: string;
  images: string[];
  shades: { id: string; name: string; hex: string; stock: number }[];
  badge?: string;
  badgeType?: 'BLACK' | 'PINK' | 'RED' | 'GOLD';
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  description?: string;
  usageTips?: string;
  ingredients?: string;
  rating: number;
  reviewsCount: number;
  brandName?: string;
  categorySlug?: string;
  categoryName?: string;
  subcategoryName?: string;
  reviews?: { id: string; authorName: string; rating: number; title: string; text: string; createdAt: string }[];
}

export interface ApiBanner {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  buttonText: string;
  imageUrl: string;
  link: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  slug: string;
  isHighlighted: boolean;
  badgeColor?: 'PINK' | 'RED';
  subcategories: { id: string; name: string; slug: string }[];
}

export interface ShopSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcementText: string;
  freeShippingThreshold: number;
  payments: { COD: boolean; BARIDIMOB: boolean; CIB: boolean };
  socials: { instagram: string; facebook: string; tiktok: string };
}

export interface ShippingRate {
  wilayaCode: number;
  wilayaName: string;
  homePrice: number;
  stopdeskPrice: number;
  deliveryDays: string;
}

// ─── Mapping to the components' Product shape ───────────────────────────────

const BADGE_TYPE = { BLACK: 'black', PINK: 'pink', RED: 'red', GOLD: 'gold' } as const;

/** The components' `category` is a small union; anything else falls back to 'soin'. */
function toCategory(slug?: string): Product['category'] {
  if (slug === 'maquillage') return 'maquillage';
  if (slug === 'parfum') return 'parfum';
  return 'soin';
}

export function toProduct(p: ApiProduct): Product {
  const shades: Shade[] = p.shades.map((s) => ({
    id: s.id,
    name: s.name,
    hex: s.hex,
    volume: p.volume ?? '',
  }));

  return {
    id: p.id,
    brand: p.brandName ?? '',
    title: p.name,
    volume: p.volume,
    price: formatDA(p.price),
    originalPrice: p.compareAtPrice ? formatDA(p.compareAtPrice) : undefined,
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    badge: p.badge,
    badgeType: p.badgeType ? BADGE_TYPE[p.badgeType] : undefined,
    tags: p.tags,
    image: p.images[0] ?? '',
    images: p.images,
    shades: shades.length ? shades : undefined,
    shadeInfo: shades.length ? `${shades.length} teintes` : undefined,
    category: toCategory(p.categorySlug),
    subcategory: p.subcategoryName,
    isBestSeller: p.isBestSeller,
    isNew: p.isNew,
    description: p.description,
    usageTips: p.usageTips,
    ingredients: p.ingredients,
    reviews: p.reviews?.map((r) => ({
      id: r.id,
      author: r.authorName,
      ageGroup: '',
      isVerified: true,
      rating: r.rating,
      date: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      title: r.title,
      text: r.text,
      recommended: r.rating >= 4,
      helpfulCount: 0,
      unhelpfulCount: 0,
    })),
  };
}

// ─── Endpoints ──────────────────────────────────────────────────────────────

export interface HomePayload {
  banners: { hero: ApiBanner[]; dual: ApiBanner[]; middle: ApiBanner[] };
  sections: { id: string; title: string; products: ApiProduct[] }[];
  announcement: string;
  freeShippingThreshold: number;
}

export const shopApi = {
  home: () => request<HomePayload>('/shop/home'),
  settings: () => request<ShopSettings>('/shop/settings'),
  categories: () => request<ApiCategory[]>('/shop/categories'),
  brands: () => request<{ id: string; name: string; slug: string; count: number }[]>('/shop/brands'),
  products: (params: { category?: string; brand?: string; q?: string; sort?: string; limit?: number } = {}) => {
    const query = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== '') as [string, string][]
    );
    return request<ApiProduct[]>(`/shop/products${query.toString() ? `?${query}` : ''}`);
  },
  product: (idOrSlug: string) => request<ApiProduct>(`/shop/products/${idOrSlug}`),
  shipping: () => request<ShippingRate[]>('/shop/shipping'),
  validatePromo: (code: string, subtotal: number) =>
    request<{ code: string; type: string; value: number; discount: number; freeShipping: boolean }>(
      '/shop/promo/validate',
      { method: 'POST', body: JSON.stringify({ code, subtotal }) }
    ),
  createOrder: (payload: CheckoutPayload) =>
    request<OrderConfirmation>('/shop/orders', { method: 'POST', body: JSON.stringify(payload) }),
  trackOrder: (number: string, phone: string) =>
    request<OrderConfirmation>(`/shop/orders/track?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`),
  submitReview: (productId: string, body: { authorName: string; rating: number; title: string; text: string }) =>
    request<{ message: string }>(`/shop/products/${productId}/reviews`, { method: 'POST', body: JSON.stringify(body) }),
};

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  wilayaCode: number;
  commune: string;
  address: string;
  deliveryType: 'HOME' | 'STOPDESK';
  paymentMethod: 'COD' | 'BARIDIMOB' | 'CIB';
  promoCode?: string;
  items: { productId: string; shade?: string; quantity: number }[];
}

export interface OrderConfirmation {
  id: string;
  number: string;
  customerName: string;
  customerPhone: string;
  wilayaCode: number;
  commune: string;
  address: string;
  deliveryType: 'HOME' | 'STOPDESK';
  paymentMethod: 'COD' | 'BARIDIMOB' | 'CIB';
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  items: { name: string; brand: string; image: string; shade?: string; unitPrice: number; quantity: number }[];
  createdAt: string;
}
