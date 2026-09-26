// Shared domain types for the Eclora admin.
// These mirror the future Prisma schema: money is stored as integer dinars (DA),
// enums are UPPER_CASE strings, dates are ISO strings.

export type ID = string;

// ─── Catalog ────────────────────────────────────────────────────────────────

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type BadgeType = 'BLACK' | 'PINK' | 'RED' | 'GOLD';

export interface Shade {
  id: ID;
  name: string;
  hex: string;
  stock: number;
}

export interface Product {
  id: ID;
  slug: string;
  name: string;
  brandId: ID;
  categoryId: ID;
  subcategoryId?: ID;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  volume?: string;
  images: string[];
  shades: Shade[];
  badge?: string;
  badgeType?: BadgeType;
  tags: string[];
  isNew: boolean;
  isBestSeller: boolean;
  status: ProductStatus;
  description?: string;
  usageTips?: string;
  ingredients?: string;
  rating: number;
  reviewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'rating' | 'reviewsCount' | 'createdAt' | 'updatedAt'>;

export interface Subcategory {
  id: ID;
  name: string;
  slug: string;
  position: number;
}

export interface Category {
  id: ID;
  name: string;
  slug: string;
  position: number;
  isVisible: boolean;
  isHighlighted: boolean;
  badgeColor?: 'PINK' | 'RED';
  subcategories: Subcategory[];
}

export interface Brand {
  id: ID;
  name: string;
  slug: string;
  logoUrl?: string;
  isFeatured: boolean;
}

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface Review {
  id: ID;
  productId: ID;
  authorName: string;
  rating: number;
  title: string;
  text: string;
  status: ReviewStatus;
  createdAt: string;
}

// ─── Orders & clients ───────────────────────────────────────────────────────

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELLED';

export type PaymentMethod = 'COD' | 'BARIDIMOB' | 'CIB';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type DeliveryType = 'HOME' | 'STOPDESK';

export interface OrderItem {
  productId: ID;
  name: string;
  brand: string;
  image: string;
  shade?: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderEvent {
  status: OrderStatus;
  at: string;
  note?: string;
  by?: string;
}

export interface Order {
  id: ID;
  number: string;
  clientId?: ID;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  wilayaCode: number;
  commune: string;
  address: string;
  deliveryType: DeliveryType;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  promoCode?: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  trackingNumber?: string;
  history: OrderEvent[];
  adminNote?: string;
  createdAt: string;
}

export type ClientStatus = 'ACTIVE' | 'BLOCKED';

export interface Client {
  id: ID;
  name: string;
  email: string;
  phone: string;
  wilayaCode: number;
  address?: string;
  status: ClientStatus;
  adminNote?: string;
  createdAt: string;
}

/** Client with figures computed from their orders. */
export interface ClientWithStats extends Client {
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
}

// ─── Storefront content ─────────────────────────────────────────────────────

export type BannerPlacement = 'HERO' | 'PROMO_DUAL' | 'PROMO_MIDDLE';

export interface Banner {
  id: ID;
  placement: BannerPlacement;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  buttonText: string;
  imageUrl: string;
  link: string;
  isActive: boolean;
  position: number;
  startsAt?: string;
  endsAt?: string;
}

export interface HomeSection {
  id: ID;
  title: string;
  productIds: ID[];
  position: number;
  isVisible: boolean;
}

// ─── Marketing & delivery ───────────────────────────────────────────────────

export type PromoType = 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';

export interface PromoCode {
  id: ID;
  code: string;
  type: PromoType;
  value: number;
  minOrder: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: string;
  endsAt?: string;
  isActive: boolean;
}

export interface ShippingRate {
  wilayaCode: number;
  wilayaName: string;
  homePrice: number;
  stopdeskPrice: number;
  deliveryDays: string;
  isActive: boolean;
}

// ─── Settings & team ────────────────────────────────────────────────────────

export interface StoreSettings {
  storeName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  announcementText: string;
  announcementEnabled: boolean;
  freeShippingThreshold: number;
  payments: Record<PaymentMethod, boolean>;
  socials: { instagram: string; facebook: string; tiktok: string };
  maintenanceMode: boolean;
}

export type AdminRole = 'OWNER' | 'ADMIN' | 'EDITOR' | 'SUPPORT';

export interface AdminUser {
  id: ID;
  name: string;
  email: string;
  role: AdminRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}
