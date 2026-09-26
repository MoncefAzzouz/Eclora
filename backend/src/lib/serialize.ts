// Shapes Prisma rows into the exact JSON the admin and storefront already expect.
// Optional fields are sent as `undefined` (dropped from JSON) rather than null,
// so React inputs stay controlled.
import type {
  AdminUser,
  Banner,
  Brand,
  Category,
  Client,
  HomeSection,
  HomeSectionProduct,
  Order,
  OrderEvent,
  OrderItem,
  Product,
  PromoCode,
  Review,
  Shade,
  ShippingRate,
  StoreSettings,
  Subcategory,
} from '@prisma/client';

const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);
const iso = (d: Date | null): string | undefined => (d ? d.toISOString() : undefined);

export type ProductWithRelations = Product & { shades: Shade[] };

export function product(p: ProductWithRelations) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brandId: p.brandId,
    categoryId: p.categoryId,
    subcategoryId: opt(p.subcategoryId),
    sku: p.sku,
    price: p.price,
    compareAtPrice: opt(p.compareAtPrice),
    stock: p.stock,
    lowStockThreshold: p.lowStockThreshold,
    volume: opt(p.volume),
    images: p.images,
    shades: p.shades.map((s) => ({ id: s.id, name: s.name, hex: s.hex, stock: s.stock })),
    badge: opt(p.badge),
    badgeType: opt(p.badgeType),
    tags: p.tags,
    isNew: p.isNew,
    isBestSeller: p.isBestSeller,
    status: p.status,
    description: opt(p.description),
    usageTips: opt(p.usageTips),
    ingredients: opt(p.ingredients),
    rating: p.rating,
    reviewsCount: p.reviewsCount,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export function category(c: Category & { subcategories: Subcategory[] }) {
  return {
    id: c.id,
    name: c.name,
    slug: c.slug,
    position: c.position,
    isVisible: c.isVisible,
    isHighlighted: c.isHighlighted,
    badgeColor: opt(c.badgeColor),
    subcategories: [...c.subcategories]
      .sort((a, b) => a.position - b.position)
      .map((s) => ({ id: s.id, name: s.name, slug: s.slug, position: s.position })),
  };
}

export function brand(b: Brand) {
  return { id: b.id, name: b.name, slug: b.slug, logoUrl: opt(b.logoUrl), isFeatured: b.isFeatured };
}

export type OrderWithRelations = Order & { items: OrderItem[]; history: OrderEvent[] };

export function order(o: OrderWithRelations) {
  return {
    id: o.id,
    number: o.number,
    clientId: opt(o.clientId),
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    customerEmail: opt(o.customerEmail),
    wilayaCode: o.wilayaCode,
    commune: o.commune,
    address: o.address,
    deliveryType: o.deliveryType,
    items: o.items.map((i) => ({
      productId: i.productId ?? '',
      name: i.name,
      brand: i.brand,
      image: i.image,
      shade: opt(i.shade),
      unitPrice: i.unitPrice,
      quantity: i.quantity,
    })),
    subtotal: o.subtotal,
    shippingFee: o.shippingFee,
    discount: o.discount,
    promoCode: opt(o.promoCode),
    total: o.total,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    status: o.status,
    trackingNumber: opt(o.trackingNumber),
    adminNote: opt(o.adminNote),
    history: [...o.history]
      .sort((a, b) => a.at.getTime() - b.at.getTime())
      .map((h) => ({ status: h.status, at: h.at.toISOString(), note: opt(h.note), by: opt(h.by) })),
    createdAt: o.createdAt.toISOString(),
  };
}

export function client(c: Client, stats?: { ordersCount: number; totalSpent: number; lastOrderAt?: Date | null }) {
  return {
    id: c.id,
    name: c.name,
    email: c.email ?? '',
    phone: c.phone,
    wilayaCode: c.wilayaCode,
    address: opt(c.address),
    status: c.status,
    adminNote: opt(c.adminNote),
    isGuest: c.isGuest,
    createdAt: c.createdAt.toISOString(),
    ...(stats
      ? {
          ordersCount: stats.ordersCount,
          totalSpent: stats.totalSpent,
          lastOrderAt: stats.lastOrderAt ? stats.lastOrderAt.toISOString() : undefined,
        }
      : {}),
  };
}

export function review(r: Review) {
  return {
    id: r.id,
    productId: r.productId,
    authorName: r.authorName,
    rating: r.rating,
    title: r.title,
    text: r.text,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
}

export function banner(b: Banner) {
  return {
    id: b.id,
    placement: b.placement,
    title: b.title,
    subtitle: opt(b.subtitle),
    description: opt(b.description),
    badge: opt(b.badge),
    buttonText: b.buttonText,
    imageUrl: b.imageUrl,
    link: b.link,
    isActive: b.isActive,
    position: b.position,
    startsAt: iso(b.startsAt),
    endsAt: iso(b.endsAt),
  };
}

export function homeSection(s: HomeSection & { products: HomeSectionProduct[] }) {
  return {
    id: s.id,
    title: s.title,
    position: s.position,
    isVisible: s.isVisible,
    productIds: [...s.products].sort((a, b) => a.position - b.position).map((p) => p.productId),
  };
}

export function promoCode(p: PromoCode) {
  return {
    id: p.id,
    code: p.code,
    type: p.type,
    value: p.value,
    minOrder: p.minOrder,
    maxUses: opt(p.maxUses),
    usedCount: p.usedCount,
    startsAt: iso(p.startsAt),
    endsAt: iso(p.endsAt),
    isActive: p.isActive,
  };
}

export function shippingRate(r: ShippingRate) {
  return {
    wilayaCode: r.wilayaCode,
    wilayaName: r.wilayaName,
    homePrice: r.homePrice,
    stopdeskPrice: r.stopdeskPrice,
    deliveryDays: r.deliveryDays,
    isActive: r.isActive,
  };
}

export function settings(s: StoreSettings) {
  return {
    storeName: s.storeName,
    contactEmail: s.contactEmail,
    contactPhone: s.contactPhone,
    address: s.address,
    announcementText: s.announcementText,
    announcementEnabled: s.announcementEnabled,
    freeShippingThreshold: s.freeShippingThreshold,
    payments: { COD: s.payCod, BARIDIMOB: s.payBaridimob, CIB: s.payCib },
    socials: { instagram: s.instagram, facebook: s.facebook, tiktok: s.tiktok },
    maintenanceMode: s.maintenanceMode,
  };
}

export function adminUser(u: AdminUser) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    lastLoginAt: iso(u.lastLoginAt),
    createdAt: u.createdAt.toISOString(),
  };
}
