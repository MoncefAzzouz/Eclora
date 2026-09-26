// The admin's data layer. Every screen talks to the backend only through `api`.
// Today it is backed by the mock DB; each function maps 1:1 to a future REST endpoint
// (noted above each group), so the backend swap happens here and nowhere else.
import type {
  AdminUser,
  Banner,
  Brand,
  Category,
  ClientStatus,
  ClientWithStats,
  HomeSection,
  Order,
  OrderStatus,
  PaymentStatus,
  Product,
  ProductInput,
  PromoCode,
  Review,
  ReviewStatus,
  ShippingRate,
  StoreSettings,
  Subcategory,
} from '@/types/admin';
import { commit, db, delay, resetDB } from '@/lib/admin/mock/db';
import { slugify, uid } from '@/lib/admin/format';

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

const nowIso = () => new Date().toISOString();

function findOr404<T extends { id: string }>(list: T[], id: string, label: string): T {
  const item = list.find((x) => x.id === id);
  if (!item) throw new ApiError(`${label} introuvable`, 404);
  return item;
}

function withClientStats(clientId: string): Pick<ClientWithStats, 'ordersCount' | 'totalSpent' | 'lastOrderAt'> {
  const orders = db().orders.filter((o) => o.clientId === clientId);
  const counted = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED');
  return {
    ordersCount: orders.length,
    totalSpent: counted.reduce((s, o) => s + o.total, 0),
    lastOrderAt: orders.map((o) => o.createdAt).sort().at(-1),
  };
}

// ─── Auth ─ POST /api/admin/auth/login, GET /api/admin/auth/me ─────────────
const auth = {
  async login(email: string, password: string): Promise<{ token: string; user: AdminUser }> {
    const admin = db().admins.find((a) => a.email.toLowerCase() === email.trim().toLowerCase());
    if (!admin || admin.password !== password) {
      await delay(null, 400);
      throw new ApiError('Email ou mot de passe incorrect', 401);
    }
    if (!admin.isActive) throw new ApiError('Ce compte est désactivé', 403);
    admin.lastLoginAt = nowIso();
    commit();
    const { password: _pw, ...user } = admin;
    return delay({ token: `mock.${admin.id}`, user }, 400);
  },
  async me(token: string): Promise<AdminUser> {
    const id = token.replace(/^mock\./, '');
    const admin = db().admins.find((a) => a.id === id && a.isActive);
    if (!admin) throw new ApiError('Session expirée', 401);
    const { password: _pw, ...user } = admin;
    return delay(user, 50);
  },
};

// ─── Dashboard ─ GET /api/admin/dashboard ──────────────────────────────────
const dashboard = {
  async summary() {
    const { orders, products, clients, reviews } = db();
    const valid = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED');
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(startOfToday);
      d.setDate(d.getDate() - (13 - i));
      return d;
    });
    const revenueByDay = days.map((d) => {
      const next = new Date(d);
      next.setDate(next.getDate() + 1);
      const dayOrders = valid.filter((o) => {
        const t = new Date(o.createdAt);
        return t >= d && t < next;
      });
      return { date: d.toISOString(), revenue: dayOrders.reduce((s, o) => s + o.total, 0), orders: dayOrders.length };
    });

    const sold = new Map<string, number>();
    valid.forEach((o) => o.items.forEach((it) => sold.set(it.productId, (sold.get(it.productId) ?? 0) + it.quantity)));
    const topProducts = [...sold.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, qty]) => ({ product: products.find((p) => p.id === id), quantity: qty }))
      .filter((x): x is { product: Product; quantity: number } => !!x.product);

    const statusCounts = orders.reduce(
      (acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
      {} as Partial<Record<OrderStatus, number>>
    );

    const last14 = revenueByDay.reduce((s, d) => s + d.revenue, 0);
    const last14Orders = revenueByDay.reduce((s, d) => s + d.orders, 0);

    return delay({
      revenue14d: last14,
      orders14d: last14Orders,
      averageOrder: last14Orders ? Math.round(last14 / last14Orders) : 0,
      todayOrders: revenueByDay.at(-1)!.orders,
      pendingOrders: statusCounts.PENDING ?? 0,
      clientsCount: clients.length,
      pendingReviews: reviews.filter((r) => r.status === 'PENDING').length,
      lowStock: products.filter((p) => p.status === 'ACTIVE' && p.stock <= p.lowStockThreshold),
      revenueByDay,
      statusCounts,
      topProducts,
      recentOrders: orders.slice(0, 6),
    });
  },
  /** Badge counts for the sidebar / notifications. */
  async alerts() {
    const { orders, reviews, products } = db();
    return delay(
      {
        pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
        pendingReviews: reviews.filter((r) => r.status === 'PENDING').length,
        outOfStock: products.filter((p) => p.status === 'ACTIVE' && p.stock === 0).length,
        lowStock: products.filter((p) => p.status === 'ACTIVE' && p.stock > 0 && p.stock <= p.lowStockThreshold).length,
      },
      30
    );
  },
};

// ─── Products ─ /api/admin/products ────────────────────────────────────────
const products = {
  list: () => delay(db().products),
  get: (id: string) => delay(findOr404(db().products, id, 'Produit')),
  async create(input: ProductInput): Promise<Product> {
    const d = db();
    if (d.products.some((p) => p.sku === input.sku)) throw new ApiError('Ce SKU existe déjà');
    const product: Product = {
      ...input,
      id: uid('prod'),
      slug: input.slug || slugify(input.name),
      rating: 0,
      reviewsCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    d.products.unshift(product);
    commit();
    return delay(product);
  },
  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const d = db();
    const p = findOr404(d.products, id, 'Produit');
    if (input.sku && d.products.some((x) => x.sku === input.sku && x.id !== id)) throw new ApiError('Ce SKU existe déjà');
    Object.assign(p, input, { updatedAt: nowIso() });
    commit();
    return delay(p);
  },
  async remove(id: string): Promise<void> {
    const d = db();
    d.products = d.products.filter((p) => p.id !== id);
    d.homeSections.forEach((s) => (s.productIds = s.productIds.filter((pid) => pid !== id)));
    commit();
    return delay(undefined);
  },
  async bulkStatus(ids: string[], status: Product['status']): Promise<void> {
    db().products.forEach((p) => ids.includes(p.id) && ((p.status = status), (p.updatedAt = nowIso())));
    commit();
    return delay(undefined);
  },
};

// ─── Categories ─ /api/admin/categories ────────────────────────────────────
const categories = {
  list: () => delay([...db().categories].sort((a, b) => a.position - b.position)),
  async save(cat: Omit<Category, 'id' | 'position' | 'subcategories'> & { id?: string }): Promise<Category> {
    const d = db();
    const slug = cat.slug || slugify(cat.name);
    if (d.categories.some((c) => c.slug === slug && c.id !== cat.id)) throw new ApiError('Ce slug existe déjà');
    if (cat.id) {
      const existing = findOr404(d.categories, cat.id, 'Catégorie');
      Object.assign(existing, cat, { slug });
      commit();
      return delay(existing);
    }
    const created: Category = { ...cat, id: uid('cat'), slug, position: d.categories.length + 1, subcategories: [] };
    d.categories.push(created);
    commit();
    return delay(created);
  },
  async remove(id: string): Promise<void> {
    const d = db();
    if (d.products.some((p) => p.categoryId === id)) {
      throw new ApiError('Impossible : des produits utilisent cette catégorie');
    }
    d.categories = d.categories.filter((c) => c.id !== id);
    commit();
    return delay(undefined);
  },
  async move(id: string, direction: -1 | 1): Promise<void> {
    const list = [...db().categories].sort((a, b) => a.position - b.position);
    const i = list.findIndex((c) => c.id === id);
    const j = i + direction;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i]!.position, list[j]!.position] = [list[j]!.position, list[i]!.position];
    commit();
    return delay(undefined);
  },
  async saveSubcategory(categoryId: string, sub: { id?: string; name: string }): Promise<Subcategory> {
    const cat = findOr404(db().categories, categoryId, 'Catégorie');
    if (sub.id) {
      const existing = findOr404(cat.subcategories, sub.id, 'Sous-catégorie');
      existing.name = sub.name;
      existing.slug = slugify(sub.name);
      commit();
      return delay(existing);
    }
    const created = { id: uid('sub'), name: sub.name, slug: slugify(sub.name), position: cat.subcategories.length + 1 };
    cat.subcategories.push(created);
    commit();
    return delay(created);
  },
  async removeSubcategory(categoryId: string, subId: string): Promise<void> {
    const d = db();
    if (d.products.some((p) => p.subcategoryId === subId)) {
      throw new ApiError('Impossible : des produits utilisent cette sous-catégorie');
    }
    const cat = findOr404(d.categories, categoryId, 'Catégorie');
    cat.subcategories = cat.subcategories.filter((s) => s.id !== subId);
    commit();
    return delay(undefined);
  },
};

// ─── Brands ─ /api/admin/brands ────────────────────────────────────────────
const brands = {
  list: () => delay([...db().brands].sort((a, b) => a.name.localeCompare(b.name))),
  async save(brand: Omit<Brand, 'id' | 'slug'> & { id?: string }): Promise<Brand> {
    const d = db();
    const slug = slugify(brand.name);
    if (d.brands.some((b) => b.slug === slug && b.id !== brand.id)) throw new ApiError('Cette marque existe déjà');
    if (brand.id) {
      const existing = findOr404(d.brands, brand.id, 'Marque');
      Object.assign(existing, brand, { slug });
      commit();
      return delay(existing);
    }
    const created: Brand = { ...brand, id: uid('brand'), slug };
    d.brands.push(created);
    commit();
    return delay(created);
  },
  async remove(id: string): Promise<void> {
    const d = db();
    if (d.products.some((p) => p.brandId === id)) throw new ApiError('Impossible : des produits utilisent cette marque');
    d.brands = d.brands.filter((b) => b.id !== id);
    commit();
    return delay(undefined);
  },
};

// ─── Orders ─ /api/admin/orders ────────────────────────────────────────────
const orders = {
  list: () => delay(db().orders),
  get: (id: string) => delay(findOr404(db().orders, id, 'Commande')),
  async updateStatus(id: string, status: OrderStatus, note?: string, by = 'Admin'): Promise<Order> {
    const d = db();
    const order = findOr404(d.orders, id, 'Commande');
    const prev = order.status;
    order.status = status;
    order.history.push({ status, at: nowIso(), note: note || undefined, by });

    // Stock moves: reserve on confirmation, give back on cancel/return.
    const adjust = (sign: 1 | -1) =>
      order.items.forEach((it) => {
        const p = d.products.find((x) => x.id === it.productId);
        if (p) p.stock = Math.max(0, p.stock + sign * it.quantity);
      });
    if (status === 'CONFIRMED' && prev === 'PENDING') adjust(-1);
    if ((status === 'CANCELLED' && prev === 'CONFIRMED') || status === 'RETURNED') adjust(1);
    if (status === 'DELIVERED' && order.paymentMethod === 'COD') order.paymentStatus = 'PAID';

    commit();
    return delay(order);
  },
  async update(
    id: string,
    patch: Partial<Pick<Order, 'adminNote' | 'trackingNumber' | 'customerPhone' | 'address' | 'commune'>> & {
      paymentStatus?: PaymentStatus;
    }
  ): Promise<Order> {
    const order = findOr404(db().orders, id, 'Commande');
    Object.assign(order, patch);
    commit();
    return delay(order);
  },
};

// ─── Clients ─ /api/admin/clients ──────────────────────────────────────────
const clients = {
  list: (): Promise<ClientWithStats[]> => delay(db().clients.map((c) => ({ ...c, ...withClientStats(c.id) }))),
  async get(id: string) {
    const c = findOr404(db().clients, id, 'Client');
    return delay({
      client: { ...c, ...withClientStats(c.id) } as ClientWithStats,
      orders: db().orders.filter((o) => o.clientId === id),
    });
  },
  async update(id: string, patch: { status?: ClientStatus; adminNote?: string }) {
    const c = findOr404(db().clients, id, 'Client');
    Object.assign(c, patch);
    commit();
    return delay(c);
  },
};

// ─── Reviews ─ /api/admin/reviews ──────────────────────────────────────────
const reviews = {
  list: () => delay([...db().reviews].sort((a, b) => b.createdAt.localeCompare(a.createdAt))),
  async setStatus(id: string, status: ReviewStatus): Promise<Review> {
    const r = findOr404(db().reviews, id, 'Avis');
    r.status = status;
    commit();
    return delay(r);
  },
  async remove(id: string): Promise<void> {
    db().reviews = db().reviews.filter((r) => r.id !== id);
    commit();
    return delay(undefined);
  },
};

// ─── Banners ─ /api/admin/banners ──────────────────────────────────────────
const banners = {
  list: () => delay([...db().banners].sort((a, b) => a.position - b.position)),
  async save(banner: Omit<Banner, 'id' | 'position'> & { id?: string }): Promise<Banner> {
    const d = db();
    if (banner.id) {
      const existing = findOr404(d.banners, banner.id, 'Bannière');
      Object.assign(existing, banner);
      commit();
      return delay(existing);
    }
    const position = d.banners.filter((b) => b.placement === banner.placement).length + 1;
    const created: Banner = { ...banner, id: uid('ban'), position };
    d.banners.push(created);
    commit();
    return delay(created);
  },
  async toggle(id: string): Promise<void> {
    const b = findOr404(db().banners, id, 'Bannière');
    b.isActive = !b.isActive;
    commit();
    return delay(undefined);
  },
  async move(id: string, direction: -1 | 1): Promise<void> {
    const b = findOr404(db().banners, id, 'Bannière');
    const group = db().banners.filter((x) => x.placement === b.placement).sort((a, c) => a.position - c.position);
    const i = group.indexOf(b);
    const other = group[i + direction];
    if (!other) return;
    [b.position, other.position] = [other.position, b.position];
    commit();
    return delay(undefined);
  },
  async remove(id: string): Promise<void> {
    db().banners = db().banners.filter((b) => b.id !== id);
    commit();
    return delay(undefined);
  },
};

// ─── Home page sections ─ /api/admin/home-sections ─────────────────────────
const homeSections = {
  list: () => delay([...db().homeSections].sort((a, b) => a.position - b.position)),
  async save(section: Omit<HomeSection, 'id' | 'position'> & { id?: string }): Promise<HomeSection> {
    const d = db();
    if (section.id) {
      const existing = findOr404(d.homeSections, section.id, 'Section');
      Object.assign(existing, section);
      commit();
      return delay(existing);
    }
    const created: HomeSection = { ...section, id: uid('sec'), position: d.homeSections.length + 1 };
    d.homeSections.push(created);
    commit();
    return delay(created);
  },
  async move(id: string, direction: -1 | 1): Promise<void> {
    const list = [...db().homeSections].sort((a, b) => a.position - b.position);
    const i = list.findIndex((s) => s.id === id);
    const other = list[i + direction];
    if (i < 0 || !other) return;
    [list[i]!.position, other.position] = [other.position, list[i]!.position];
    commit();
    return delay(undefined);
  },
  async remove(id: string): Promise<void> {
    db().homeSections = db().homeSections.filter((s) => s.id !== id);
    commit();
    return delay(undefined);
  },
};

// ─── Promo codes ─ /api/admin/promo-codes ──────────────────────────────────
const promoCodes = {
  list: () => delay(db().promoCodes),
  async save(promo: Omit<PromoCode, 'id' | 'usedCount'> & { id?: string }): Promise<PromoCode> {
    const d = db();
    const code = promo.code.trim().toUpperCase();
    if (d.promoCodes.some((p) => p.code === code && p.id !== promo.id)) throw new ApiError('Ce code existe déjà');
    if (promo.id) {
      const existing = findOr404(d.promoCodes, promo.id, 'Code promo');
      Object.assign(existing, promo, { code });
      commit();
      return delay(existing);
    }
    const created: PromoCode = { ...promo, code, id: uid('promo'), usedCount: 0 };
    d.promoCodes.unshift(created);
    commit();
    return delay(created);
  },
  async remove(id: string): Promise<void> {
    db().promoCodes = db().promoCodes.filter((p) => p.id !== id);
    commit();
    return delay(undefined);
  },
};

// ─── Delivery ─ /api/admin/shipping-rates ──────────────────────────────────
const shipping = {
  list: () => delay(db().shippingRates),
  async saveAll(rates: ShippingRate[]): Promise<void> {
    db().shippingRates = rates;
    commit();
    return delay(undefined, 300);
  },
};

// ─── Settings ─ /api/admin/settings ────────────────────────────────────────
const settings = {
  get: () => delay(db().settings),
  async save(value: StoreSettings): Promise<StoreSettings> {
    db().settings = value;
    commit();
    return delay(value, 300);
  },
};

// ─── Team ─ /api/admin/users ───────────────────────────────────────────────
const team = {
  list: (): Promise<AdminUser[]> => delay(db().admins.map(({ password: _pw, ...u }) => u)),
  async save(user: Omit<AdminUser, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string; password?: string }) {
    const d = db();
    const email = user.email.trim().toLowerCase();
    if (d.admins.some((a) => a.email === email && a.id !== user.id)) throw new ApiError('Cet email est déjà utilisé');
    if (user.id) {
      const existing = findOr404(d.admins, user.id, 'Utilisateur');
      if (existing.role === 'OWNER' && (user.role !== 'OWNER' || !user.isActive)) {
        throw new ApiError('Le propriétaire ne peut pas être rétrogradé ou désactivé');
      }
      const { password, ...rest } = user;
      Object.assign(existing, rest, { email }, password ? { password } : {});
    } else {
      if (!user.password || user.password.length < 8) throw new ApiError('Mot de passe : 8 caractères minimum');
      d.admins.push({ ...user, email, password: user.password, id: uid('adm'), createdAt: nowIso() });
    }
    commit();
    return delay(undefined);
  },
  async remove(id: string): Promise<void> {
    const d = db();
    const target = findOr404(d.admins, id, 'Utilisateur');
    if (target.role === 'OWNER') throw new ApiError('Le propriétaire ne peut pas être supprimé');
    d.admins = d.admins.filter((a) => a.id !== id);
    commit();
    return delay(undefined);
  },
};

export const api = {
  auth,
  dashboard,
  products,
  categories,
  brands,
  orders,
  clients,
  reviews,
  banners,
  homeSections,
  promoCodes,
  shipping,
  settings,
  team,
  /** Dev only: restore the demo data. */
  resetDemoData: async () => {
    resetDB();
    return delay(undefined);
  },
};
