// Storefront data layer. Talks to the public backend API (no account required)
// and maps rows into the `Product` shape the existing components already use.
import type { Product, Shade } from '@/data/products';

// Relative by default, and deliberately so: NEXT_PUBLIC_* values are inlined
// into the browser bundle at build time, so an absolute URL here would hard-code
// one domain and need a rebuild every time the site moves. Every caller is a
// client component, so a same-origin path is always resolvable.
const BASE = process.env.NEXT_PUBLIC_API_URL ?? '/api';

export function formatDA(amount: number): string {
  return `${new Intl.NumberFormat('fr-DZ', { maximumFractionDigits: 0 }).format(amount).replace(/ | /g, ' ')} DA`;
}

const TOKEN_KEY = 'eclora-customer-token';

/** The logged-in customer's token, if any. Sent on every call; the API ignores it where unused. */
export function customerToken(): string | null {
  try {
    return typeof window === 'undefined' ? null : localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}
export function setCustomerToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // storage blocked: the session lasts until the tab closes
  }
}

export class ShopApiError extends Error {
  constructor(message: string, public status = 0) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  const token = customerToken();
  try {
    response = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...init?.headers,
      },
      cache: 'no-store',
    });
  } catch {
    throw new ShopApiError('Connexion au serveur impossible. Réessayez dans un instant.');
  }

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const message = data && typeof data === 'object' && 'error' in data ? String(data.error) : 'Une erreur est survenue';
    throw new ShopApiError(message, response.status);
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
  brandSlug?: string;
  brandLogoUrl?: string;
  categorySlug?: string;
  categoryName?: string;
  subcategorySlug?: string;
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
  description?: string;
  subcategories: { id: string; name: string; slug: string }[];
}

export interface ApiBrand {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  count: number;
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
    slug: p.slug,
    stock: p.stock,
    priceValue: p.price,
    brandSlug: p.brandSlug,
    brandLogoUrl: p.brandLogoUrl,
    categorySlug: p.categorySlug,
    categoryName: p.categoryName,
    subcategorySlug: p.subcategorySlug,
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
  brands: (all = false) => request<ApiBrand[]>(`/shop/brands${all ? '?all=1' : ''}`),
  brand: (slug: string) => request<ApiBrand>(`/shop/brands/${encodeURIComponent(slug)}`),
  products: (params: ProductQuery = {}) => {
    const query = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== '' && v !== false)
        .map(([k, v]) => [k, v === true ? '1' : String(v)])
    );
    return request<{ total: number; products: ApiProduct[] }>(`/shop/products${query.toString() ? `?${query}` : ''}`);
  },
  product: (idOrSlug: string) => request<ApiProduct>(`/shop/products/${idOrSlug}`),
  shipping: () => request<ShippingRate[]>('/shop/shipping'),
  deliveryWilayas: () => request<(ShippingRate & { hasStopdesk: boolean })[]>('/shop/delivery/wilayas'),
  deliveryWilaya: (code: number) => request<WilayaDelivery>(`/shop/delivery/wilayas/${code}`),
  deliveryQuote: (body: { wilayaCode: number; communeId?: number | null; deliveryType: 'HOME' | 'STOPDESK'; stopdeskId?: number | null; subtotal: number }) =>
    request<DeliveryQuote>('/shop/delivery/quote', { method: 'POST', body: JSON.stringify(body) }),

  register: (body: { name: string; phone: string; email?: string; password: string }) =>
    request<{ token: string; customer: Customer }>('/shop/account/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (identifier: string, password: string) =>
    request<{ token: string; customer: Customer }>('/shop/account/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  me: () => request<Customer>('/shop/account/me'),
  updateMe: (body: { name: string; email?: string; wilayaCode: number; address?: string }) =>
    request<Customer>('/shop/account/me', { method: 'PUT', body: JSON.stringify(body) }),
  changePassword: (current: string, next: string) =>
    request<void>('/shop/account/password', { method: 'PUT', body: JSON.stringify({ current, next }) }),
  myOrders: () => request<OrderConfirmation[]>('/shop/account/orders'),
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

export interface ProductQuery {
  category?: string;
  subcategory?: string;
  brand?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sort?: string;
  limit?: number;
}

export interface WilayaDelivery {
  rate: ShippingRate;
  communes: { id: number; name: string; isDeliverable: boolean; hasStopDesk: boolean; homePrice: number; deliveryDays: string }[];
  centers: { id: number; name: string; address: string; communeId: number; communeName: string; price: number }[];
}

export interface DeliveryQuote {
  fee: number;
  baseFee: number;
  freeShipping: boolean;
  deliveryDays: string;
  communeName?: string;
  stopdesk?: { id: number; name: string; address: string; communeName: string };
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  wilayaCode: number;
  address: string;
  createdAt: string;
}

export interface CheckoutPayload {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  wilayaCode: number;
  commune: string;
  communeId?: number | null;
  address: string;
  deliveryType: 'HOME' | 'STOPDESK';
  stopdeskId?: number | null;
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
  stopdeskName?: string;
  trackingNumber?: string;
  yalidineStatus?: string;
  paymentMethod: 'COD' | 'BARIDIMOB' | 'CIB';
  status: string;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  items: { name: string; brand: string; image: string; shade?: string; unitPrice: number; quantity: number }[];
  createdAt: string;
}
