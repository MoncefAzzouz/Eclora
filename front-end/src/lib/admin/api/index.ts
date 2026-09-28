// The admin's data layer: every screen talks to the backend only through `api`.
// Signatures are unchanged from the mock version, so screens needed no edits.
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

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
const TOKEN_KEY = 'eclora-admin-token';

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
  }
}

function readToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Token to use instead of the stored one (during login). */
  token?: string;
}

async function request<T>(path: string, { method = 'GET', body, token }: RequestOptions = {}): Promise<T> {
  const auth = token ?? readToken();
  let response: Response;

  try {
    response = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? { Authorization: `Bearer ${auth}` } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Serveur injoignable. Le backend est-il démarré ?', 0);
  }

  if (response.status === 204) return undefined as T;

  const text = await response.text();
  const data = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      data && typeof data === 'object' && 'error' in data ? String((data as { error: unknown }).error) : 'Erreur serveur';
    throw new ApiError(message, response.status);
  }
  return data as T;
}

// ─── Auth ───────────────────────────────────────────────────────────────────
const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: AdminUser }>('/admin/auth/login', { method: 'POST', body: { email, password } }),
  me: (token: string) => request<AdminUser>('/admin/auth/me', { token }),
};

// ─── Dashboard ──────────────────────────────────────────────────────────────
interface DashboardSummary {
  revenue14d: number;
  orders14d: number;
  averageOrder: number;
  todayOrders: number;
  pendingOrders: number;
  clientsCount: number;
  pendingReviews: number;
  lowStock: Product[];
  revenueByDay: { date: string; revenue: number; orders: number }[];
  statusCounts: Partial<Record<OrderStatus, number>>;
  topProducts: { product: Product; quantity: number }[];
  recentOrders: Order[];
}

const dashboard = {
  summary: () => request<DashboardSummary>('/admin/dashboard/summary'),
  alerts: () =>
    request<{ pendingOrders: number; pendingReviews: number; outOfStock: number; lowStock: number }>(
      '/admin/dashboard/alerts'
    ),
};

// ─── Products ───────────────────────────────────────────────────────────────
const products = {
  list: () => request<Product[]>('/admin/products'),
  get: (id: string) => request<Product>(`/admin/products/${id}`),
  create: (input: ProductInput) => request<Product>('/admin/products', { method: 'POST', body: input }),
  update: (id: string, input: ProductInput) => request<Product>(`/admin/products/${id}`, { method: 'PUT', body: input }),
  remove: (id: string) => request<void>(`/admin/products/${id}`, { method: 'DELETE' }),
  bulkStatus: (ids: string[], status: Product['status']) =>
    request<void>('/admin/products/bulk-status', { method: 'PATCH', body: { ids, status } }),
};

// ─── Categories ─────────────────────────────────────────────────────────────
type CategoryInput = Omit<Category, 'id' | 'position' | 'subcategories'> & { id?: string };

const categories = {
  list: () => request<Category[]>('/admin/categories'),
  save: ({ id, ...body }: CategoryInput) =>
    id
      ? request<Category>(`/admin/categories/${id}`, { method: 'PUT', body })
      : request<Category>('/admin/categories', { method: 'POST', body }),
  remove: (id: string) => request<void>(`/admin/categories/${id}`, { method: 'DELETE' }),
  move: (id: string, direction: -1 | 1) =>
    request<void>(`/admin/categories/${id}/move`, { method: 'PATCH', body: { direction } }),
  saveSubcategory: (categoryId: string, sub: { id?: string; name: string }) =>
    sub.id
      ? request<Subcategory>(`/admin/categories/${categoryId}/subcategories/${sub.id}`, {
          method: 'PUT',
          body: { name: sub.name },
        })
      : request<Subcategory>(`/admin/categories/${categoryId}/subcategories`, {
          method: 'POST',
          body: { name: sub.name },
        }),
  removeSubcategory: (categoryId: string, subId: string) =>
    request<void>(`/admin/categories/${categoryId}/subcategories/${subId}`, { method: 'DELETE' }),
};

// ─── Brands ─────────────────────────────────────────────────────────────────
const brands = {
  list: () => request<Brand[]>('/admin/brands'),
  save: ({ id, ...body }: Omit<Brand, 'id' | 'slug'> & { id?: string }) =>
    id ? request<Brand>(`/admin/brands/${id}`, { method: 'PUT', body }) : request<Brand>('/admin/brands', { method: 'POST', body }),
  remove: (id: string) => request<void>(`/admin/brands/${id}`, { method: 'DELETE' }),
};

// ─── Orders ─────────────────────────────────────────────────────────────────
const orders = {
  list: () => request<Order[]>('/admin/orders'),
  get: (id: string) => request<Order>(`/admin/orders/${id}`),
  updateStatus: (id: string, status: OrderStatus, note?: string) =>
    request<Order>(`/admin/orders/${id}/status`, { method: 'PATCH', body: { status, note } }),
  update: (
    id: string,
    patch: Partial<Pick<Order, 'adminNote' | 'trackingNumber' | 'customerPhone' | 'address' | 'commune'>> & {
      paymentStatus?: PaymentStatus;
    }
  ) => request<Order>(`/admin/orders/${id}`, { method: 'PATCH', body: patch }),
};

// ─── Clients ────────────────────────────────────────────────────────────────
const clients = {
  list: () => request<ClientWithStats[]>('/admin/clients'),
  get: (id: string) => request<{ client: ClientWithStats; orders: Order[] }>(`/admin/clients/${id}`),
  update: (id: string, patch: { status?: ClientStatus; adminNote?: string }) =>
    request<ClientWithStats>(`/admin/clients/${id}`, { method: 'PATCH', body: patch }),
};

// ─── Reviews ────────────────────────────────────────────────────────────────
const reviews = {
  list: () => request<Review[]>('/admin/reviews'),
  setStatus: (id: string, status: ReviewStatus) =>
    request<Review>(`/admin/reviews/${id}/status`, { method: 'PATCH', body: { status } }),
  remove: (id: string) => request<void>(`/admin/reviews/${id}`, { method: 'DELETE' }),
};

// ─── Banners ────────────────────────────────────────────────────────────────
const banners = {
  list: () => request<Banner[]>('/admin/banners'),
  save: ({ id, position: _position, ...body }: Omit<Banner, 'id' | 'position'> & { id?: string; position?: number }) =>
    id ? request<Banner>(`/admin/banners/${id}`, { method: 'PUT', body }) : request<Banner>('/admin/banners', { method: 'POST', body }),
  toggle: (id: string) => request<Banner>(`/admin/banners/${id}/toggle`, { method: 'PATCH' }),
  move: (id: string, direction: -1 | 1) =>
    request<void>(`/admin/banners/${id}/move`, { method: 'PATCH', body: { direction } }),
  remove: (id: string) => request<void>(`/admin/banners/${id}`, { method: 'DELETE' }),
};

// ─── Home sections ──────────────────────────────────────────────────────────
const homeSections = {
  list: () => request<HomeSection[]>('/admin/home-sections'),
  save: ({
    id,
    position: _position,
    ...body
  }: Omit<HomeSection, 'id' | 'position'> & { id?: string; position?: number }) =>
    id
      ? request<HomeSection>(`/admin/home-sections/${id}`, { method: 'PUT', body })
      : request<HomeSection>('/admin/home-sections', { method: 'POST', body }),
  move: (id: string, direction: -1 | 1) =>
    request<void>(`/admin/home-sections/${id}/move`, { method: 'PATCH', body: { direction } }),
  remove: (id: string) => request<void>(`/admin/home-sections/${id}`, { method: 'DELETE' }),
};

// ─── Promo codes ────────────────────────────────────────────────────────────
const promoCodes = {
  list: () => request<PromoCode[]>('/admin/promo-codes'),
  save: ({ id, usedCount: _used, ...body }: Omit<PromoCode, 'id' | 'usedCount'> & { id?: string; usedCount?: number }) =>
    id
      ? request<PromoCode>(`/admin/promo-codes/${id}`, { method: 'PUT', body })
      : request<PromoCode>('/admin/promo-codes', { method: 'POST', body }),
  remove: (id: string) => request<void>(`/admin/promo-codes/${id}`, { method: 'DELETE' }),
};

// ─── Delivery ───────────────────────────────────────────────────────────────
const shipping = {
  list: () => request<ShippingRate[]>('/admin/shipping-rates'),
  saveAll: (rates: ShippingRate[]) => request<void>('/admin/shipping-rates', { method: 'PUT', body: rates }),
};

// ─── Settings & team ────────────────────────────────────────────────────────
const settings = {
  get: () => request<StoreSettings>('/admin/settings'),
  save: (value: StoreSettings) => request<StoreSettings>('/admin/settings', { method: 'PUT', body: value }),
};

const team = {
  list: () => request<AdminUser[]>('/admin/users'),
  save: ({
    id,
    ...body
  }: Omit<AdminUser, 'id' | 'createdAt' | 'lastLoginAt'> & { id?: string; password?: string }) =>
    id ? request<AdminUser>(`/admin/users/${id}`, { method: 'PUT', body }) : request<AdminUser>('/admin/users', { method: 'POST', body }),
  remove: (id: string) => request<void>(`/admin/users/${id}`, { method: 'DELETE' }),
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
};
