// Public API for the customer site. No authentication: anyone can browse and
// order as a guest. Prices, shipping and discounts are always recomputed here —
// whatever the browser sends is treated as a request, not as fact.
import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import type { PromoCode } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler, notFound, param } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { getSettings } from './settings.js';
import { quote } from '../lib/delivery.js';
import { optionalCustomer } from '../middleware/customer.js';
import { normalizePhone } from './account.js';

export const shopRouter = Router();

const activeProduct = { status: 'ACTIVE' } satisfies Prisma.ProductWhereInput;

// ─── Catalogue ──────────────────────────────────────────────────────────────

shopRouter.get(
  '/settings',
  handler(async (_req, res) => {
    const settings = await getSettings();
    const full = s.settings(settings);
    res.json({
      storeName: full.storeName,
      contactEmail: full.contactEmail,
      contactPhone: full.contactPhone,
      address: full.address,
      announcementText: full.announcementEnabled ? full.announcementText : '',
      freeShippingThreshold: full.freeShippingThreshold,
      payments: full.payments,
      socials: full.socials,
      maintenanceMode: full.maintenanceMode,
    });
  })
);

shopRouter.get(
  '/categories',
  handler(async (_req, res) => {
    const categories = await prisma.category.findMany({
      where: { isVisible: true },
      include: { subcategories: { orderBy: { position: 'asc' } } },
      orderBy: { position: 'asc' },
    });
    res.json(categories.map(s.category));
  })
);

/**
 * Brands. By default only those with products on sale (for filters); with
 * ?all=1 every brand, for the "Nos Marques" page.
 */
shopRouter.get(
  '/brands',
  handler(async (req, res) => {
    const all = req.query.all === '1';
    const brands = await prisma.brand.findMany({
      where: all ? {} : { products: { some: activeProduct } },
      include: { _count: { select: { products: { where: activeProduct } } } },
      orderBy: [{ position: 'asc' }, { name: 'asc' }],
    });
    res.json(brands.map((b) => ({ ...s.brand(b), count: b._count.products })));
  })
);

shopRouter.get(
  '/brands/:slug',
  handler(async (req, res) => {
    const brand = await prisma.brand.findUnique({
      where: { slug: param(req, 'slug') },
      include: { _count: { select: { products: { where: activeProduct } } } },
    });
    if (!brand) throw notFound('Marque introuvable');
    res.json({ ...s.brand(brand), count: brand._count.products });
  })
);

/** Home page: active banners by placement + visible carousels with their products. */
shopRouter.get(
  '/home',
  handler(async (_req, res) => {
    const now = new Date();
    const [banners, sections, settings] = await Promise.all([
      prisma.banner.findMany({
        where: {
          isActive: true,
          AND: [
            { OR: [{ startsAt: null }, { startsAt: { lte: now } }] },
            { OR: [{ endsAt: null }, { endsAt: { gte: now } }] },
          ],
        },
        orderBy: { position: 'asc' },
      }),
      prisma.homeSection.findMany({
        where: { isVisible: true },
        include: {
          products: {
            orderBy: { position: 'asc' },
            include: { product: { include: { shades: true, brand: true, category: true } } },
          },
        },
        orderBy: { position: 'asc' },
      }),
      getSettings(),
    ]);

    res.json({
      banners: {
        hero: banners.filter((b) => b.placement === 'HERO').map(s.banner),
        dual: banners.filter((b) => b.placement === 'PROMO_DUAL').map(s.banner),
        middle: banners.filter((b) => b.placement === 'PROMO_MIDDLE').map(s.banner),
      },
      sections: sections.map((section) => ({
        id: section.id,
        title: section.title,
        products: section.products
          .filter((entry) => entry.product.status === 'ACTIVE')
          .map((entry) => ({
            ...s.product(entry.product),
            brandName: entry.product.brand.name,
            categorySlug: entry.product.category.slug,
          })),
      })),
      announcement: settings.announcementEnabled ? settings.announcementText : '',
      freeShippingThreshold: settings.freeShippingThreshold,
    });
  })
);

/** Lowercase without accents or apostrophes: "L'Oréal Crème" → "loreal creme". */
const fold = (v: string) => v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['’`]/g, '').toLowerCase();

const listItem = (p: Prisma.ProductGetPayload<{ include: typeof listInclude }>) => ({
  ...s.product(p),
  brandName: p.brand.name,
  brandSlug: p.brand.slug,
  categorySlug: p.category.slug,
  categoryName: p.category.name,
  subcategorySlug: p.subcategory?.slug,
  subcategoryName: p.subcategory?.name,
});
const listInclude = { shades: true, brand: true, category: true, subcategory: true } satisfies Prisma.ProductInclude;

/**
 * Catalogue search. Every filter is optional and they combine:
 * category, subcategory, brand (comma-separated slugs), q (text), minPrice,
 * maxPrice, inStock=1, sort. Returns { total, products }.
 */
shopRouter.get(
  '/products',
  handler(async (req, res) => {
    const query = z
      .object({
        category: z.string().optional(),
        subcategory: z.string().optional(),
        brand: z.string().optional(),
        q: z.string().trim().max(100).optional(),
        minPrice: z.coerce.number().int().min(0).optional(),
        maxPrice: z.coerce.number().int().min(0).optional(),
        inStock: z.enum(['1', 'true']).optional(),
        sort: z.enum(['new', 'price-asc', 'price-desc', 'rating', 'name']).optional(),
        limit: z.coerce.number().int().positive().max(500).optional(),
      })
      .parse(req.query);

    const orderBy: Prisma.ProductOrderByWithRelationInput =
      query.sort === 'price-asc' ? { price: 'asc' }
      : query.sort === 'price-desc' ? { price: 'desc' }
      : query.sort === 'rating' ? { rating: 'desc' }
      : query.sort === 'name' ? { name: 'asc' }
      : { createdAt: 'desc' };

    const brands = query.brand?.split(',').map((b) => b.trim()).filter(Boolean);

    const where: Prisma.ProductWhereInput = {
      ...activeProduct,
      ...(query.category ? { category: { slug: query.category } } : {}),
      ...(query.subcategory ? { subcategory: { slug: query.subcategory } } : {}),
      ...(brands?.length ? { brand: { slug: { in: brands } } } : {}),
      ...(query.inStock ? { stock: { gt: 0 } } : {}),
      ...(query.minPrice !== undefined || query.maxPrice !== undefined
        ? { price: { ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}), ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}) } }
        : {}),
    };

    // Text search ignores accents and case ("creme" finds "Crème"), and every
    // word must match somewhere: "creme nivea" finds NIVEA creams. Postgres
    // ILIKE is accent-sensitive, so match in memory over the candidates' text —
    // a beauty catalogue is a few thousand rows at most.
    if (query.q) {
      const words = fold(query.q).split(/\s+/).filter(Boolean).slice(0, 6);
      const candidates = await prisma.product.findMany({
        where,
        select: {
          id: true, name: true, sku: true, tags: true,
          brand: { select: { name: true } },
          category: { select: { name: true, description: true } },
          subcategory: { select: { name: true } },
        },
      });
      const ids = candidates
        .filter((p) => {
          const text = fold([p.name, p.sku, p.brand.name, p.category.name, p.category.description ?? '', p.subcategory?.name ?? '', ...p.tags].join(' '));
          return words.every((w) => text.includes(w));
        })
        .map((p) => p.id);
      where.id = { in: ids };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({ where, include: listInclude, orderBy, take: query.limit ?? 200 }),
    ]);
    res.json({ total, products: products.map(listItem) });
  })
);

shopRouter.get(
  '/products/:idOrSlug',
  handler(async (req, res) => {
    const key = req.params.idOrSlug;
    const product = await prisma.product.findFirst({
      where: { OR: [{ id: key }, { slug: key }], status: 'ACTIVE' },
      include: listInclude,
    });
    if (!product) throw notFound('Produit introuvable');

    const reviews = await prisma.review.findMany({
      where: { productId: product.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    res.json({ ...listItem(product), brandLogoUrl: product.brand.logoUrl ?? undefined, reviews: reviews.map(s.review) });
  })
);

/** Customers submit reviews; they appear on the site only once the admin approves. */
shopRouter.post(
  '/products/:id/reviews',
  handler(async (req, res) => {
    const input = z
      .object({
        authorName: z.string().min(2, 'Votre nom est requis'),
        rating: z.number().int().min(1).max(5),
        title: z.string().min(2, 'Un titre est requis').max(80),
        text: z.string().min(10, 'Votre avis doit faire au moins 10 caractères').max(2000),
      })
      .parse(req.body);

    const productId = param(req, 'id');
    await prisma.product.findUniqueOrThrow({ where: { id: productId } });
    await prisma.review.create({ data: { ...input, productId, status: 'PENDING' } });
    res.status(201).json({ message: 'Merci ! Votre avis sera publié après vérification.' });
  })
);

// ─── Delivery & promo ───────────────────────────────────────────────────────

shopRouter.get(
  '/shipping',
  handler(async (_req, res) => {
    const rates = await prisma.shippingRate.findMany({ where: { isActive: true }, orderBy: { wilayaCode: 'asc' } });
    res.json(rates.map(s.shippingRate));
  })
);

/** Wilayas we deliver to, with their base prices and whether offices exist. */
shopRouter.get(
  '/delivery/wilayas',
  handler(async (_req, res) => {
    const [rates, centers] = await Promise.all([
      prisma.shippingRate.findMany({ where: { isActive: true }, orderBy: { wilayaCode: 'asc' } }),
      prisma.deliveryCenter.groupBy({ by: ['wilayaCode'], where: { isActive: true }, _count: true }),
    ]);
    const withCenters = new Set(centers.map((c) => c.wilayaCode));
    res.json(rates.map((r) => ({ ...s.shippingRate(r), hasStopdesk: withCenters.has(r.wilayaCode) })));
  })
);

/** Communes and Yalidine offices of one wilaya, each with its effective price. */
shopRouter.get(
  '/delivery/wilayas/:code',
  handler(async (req, res) => {
    const code = z.coerce.number().int().min(1).max(99).parse(req.params.code);
    const rate = await prisma.shippingRate.findUnique({ where: { wilayaCode: code } });
    if (!rate || !rate.isActive) throw notFound('Nous ne livrons pas encore dans cette wilaya');

    const [communes, centers] = await Promise.all([
      prisma.deliveryCommune.findMany({ where: { wilayaCode: code }, orderBy: { name: 'asc' } }),
      prisma.deliveryCenter.findMany({ where: { wilayaCode: code, isActive: true }, orderBy: { name: 'asc' } }),
    ]);
    const byId = new Map(communes.map((c) => [c.id, c]));
    res.json({
      rate: s.shippingRate(rate),
      communes: communes.map((c) => ({
        id: c.id,
        name: c.name,
        isDeliverable: c.isDeliverable,
        hasStopDesk: c.hasStopDesk,
        homePrice: c.homePrice ?? rate.homePrice,
        deliveryDays: c.deliveryDays ?? rate.deliveryDays,
      })),
      centers: centers.map((c) => ({
        id: c.id,
        name: c.name,
        address: c.address,
        communeId: c.communeId,
        communeName: c.communeName,
        price: byId.get(c.communeId)?.stopdeskPrice ?? rate.stopdeskPrice,
      })),
    });
  })
);

/** The exact fee the order will be charged; the checkout shows this before confirming. */
shopRouter.post(
  '/delivery/quote',
  handler(async (req, res) => {
    const input = z
      .object({
        wilayaCode: z.number().int().min(1).max(99),
        communeId: z.number().int().nullish(),
        deliveryType: z.enum(['HOME', 'STOPDESK']),
        stopdeskId: z.number().int().nullish(),
        subtotal: z.number().int().min(0),
      })
      .parse(req.body);
    const settings = await getSettings();
    res.json(await quote(input, settings.freeShippingThreshold));
  })
);

function promoProblem(promo: PromoCode | null, subtotal: number): string | null {
  const now = new Date();
  if (!promo || !promo.isActive) return 'Code promo invalide';
  if (promo.startsAt && promo.startsAt > now) return 'Ce code n’est pas encore actif';
  if (promo.endsAt && promo.endsAt < now) return 'Ce code a expiré';
  if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) return 'Ce code a atteint sa limite d’utilisation';
  if (subtotal < promo.minOrder) return `Ce code demande un minimum de ${promo.minOrder} DA`;
  return null;
}

/** Discount in dinars, plus whether shipping becomes free. */
function applyPromo(promo: PromoCode, subtotal: number, shippingFee: number) {
  if (promo.type === 'PERCENT') return { discount: Math.round((subtotal * promo.value) / 100), freeShipping: false };
  if (promo.type === 'FIXED') return { discount: Math.min(promo.value, subtotal), freeShipping: false };
  return { discount: 0, freeShipping: shippingFee > 0 };
}

shopRouter.post(
  '/promo/validate',
  handler(async (req, res) => {
    const { code, subtotal } = z
      .object({ code: z.string().min(1), subtotal: z.number().int().min(0) })
      .parse(req.body);

    const promo = await prisma.promoCode.findUnique({ where: { code: code.trim().toUpperCase() } });
    const problem = promoProblem(promo, subtotal);
    if (problem || !promo) return res.status(400).json({ error: problem ?? 'Code promo invalide' });

    const { discount, freeShipping } = applyPromo(promo, subtotal, 1);
    res.json({ code: promo.code, type: promo.type, value: promo.value, discount, freeShipping });
  })
);

// ─── Guest checkout ─────────────────────────────────────────────────────────

const checkoutSchema = z.object({
  customerName: z.string().min(2, 'Votre nom complet est requis'),
  customerPhone: z
    .string()
    .transform(normalizePhone)
    .refine((p) => /^0[5-7]\d{8}$/.test(p) || /^0[2-4]\d{7}$/.test(p), 'Numéro de téléphone invalide (ex. 0550 12 34 56)'),
  customerEmail: z.string().email('Email invalide').optional().or(z.literal('')),
  wilayaCode: z.number().int().min(1).max(99),
  commune: z.string().trim().optional().default(''),
  communeId: z.number().int().nullish(),
  address: z.string().trim().optional().default(''),
  deliveryType: z.enum(['HOME', 'STOPDESK']),
  stopdeskId: z.number().int().nullish(),
  paymentMethod: z.enum(['COD', 'BARIDIMOB', 'CIB']),
  promoCode: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        shade: z.string().optional(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, 'Votre panier est vide'),
});

/** ECL-26000, ECL-26001, ... Derived from the highest existing number. */
async function nextOrderNumber(tx: Prisma.TransactionClient): Promise<string> {
  const last = await tx.order.findFirst({ orderBy: { number: 'desc' }, select: { number: true } });
  const lastValue = last ? Number.parseInt(last.number.replace(/\D/g, ''), 10) : 25999;
  return `ECL-${(Number.isNaN(lastValue) ? 25999 : lastValue) + 1}`;
}

/** Two shoppers can check out at the same instant, so retry on a number clash. */
async function withUniqueNumber<T>(create: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await create();
    } catch (e) {
      const clash =
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002' &&
        (e.meta?.target as string[] | undefined)?.includes('number');
      if (!clash || attempt >= 4) throw e;
    }
  }
}

shopRouter.post(
  '/orders',
  optionalCustomer,
  handler(async (req, res) => {
    const input = checkoutSchema.parse(req.body);
    if (input.deliveryType === 'HOME' && input.address.length < 5) throw badRequest('L’adresse de livraison est requise');
    const settings = await getSettings();

    // Payment method must be one the store currently offers.
    const enabled = { COD: settings.payCod, BARIDIMOB: settings.payBaridimob, CIB: settings.payCib };
    if (!enabled[input.paymentMethod]) throw badRequest('Ce moyen de paiement n’est pas disponible');

    // Price from the database, never from the browser.
    const products = await prisma.product.findMany({
      where: { id: { in: input.items.map((i) => i.productId) }, status: 'ACTIVE' },
      include: { brand: true, shades: true },
    });

    const lines = input.items.map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw badRequest('Un produit de votre panier n’est plus disponible');
      if (product.stock < item.quantity) {
        throw badRequest(`Stock insuffisant pour « ${product.name} » (${product.stock} restant)`);
      }
      return {
        productId: product.id,
        name: product.name,
        brand: product.brand.name,
        image: product.images[0] ?? '',
        shade: item.shade ?? null,
        unitPrice: product.price,
        quantity: item.quantity,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const delivery = await quote({ ...input, subtotal }, settings.freeShippingThreshold);
    let shippingFee = delivery.fee;
    const commune = delivery.communeName ?? input.commune;
    if (commune.length < 2) throw badRequest('La commune est requise');

    let discount = 0;
    let promo: PromoCode | null = null;
    if (input.promoCode?.trim()) {
      promo = await prisma.promoCode.findUnique({ where: { code: input.promoCode.trim().toUpperCase() } });
      const problem = promoProblem(promo, subtotal);
      if (problem || !promo) throw badRequest(problem ?? 'Code promo invalide');
      const applied = applyPromo(promo, subtotal, shippingFee);
      discount = applied.discount;
      if (applied.freeShipping) shippingFee = 0;
    }

    const phone = input.customerPhone;
    // Logged in: the order belongs to the account. Otherwise match on phone.
    const existing = req.customer ?? (await prisma.client.findUnique({ where: { phone } }));
    if (existing?.status === 'BLOCKED') {
      throw badRequest('Commande impossible. Merci de nous contacter par téléphone.');
    }
    // A guest checkout must not rewrite a registered customer's saved details.
    const mayUpdate = existing && (existing.isGuest || req.customer?.id === existing.id);

    const order = await withUniqueNumber(() => prisma.$transaction(async (tx) => {
      const client = existing && !mayUpdate
        ? existing
        : existing
        ? await tx.client.update({
            where: { id: existing.id },
            data: {
              name: input.customerName,
              email: input.customerEmail || existing.email,
              wilayaCode: input.wilayaCode,
              address: input.address || existing.address,
            },
          })
        : await tx.client.create({
            data: {
              name: input.customerName,
              phone,
              email: input.customerEmail || null,
              wilayaCode: input.wilayaCode,
              address: input.address || null,
              isGuest: true,
            },
          });

      if (promo) {
        await tx.promoCode.update({ where: { id: promo.id }, data: { usedCount: { increment: 1 } } });
      }

      return tx.order.create({
        data: {
          number: await nextOrderNumber(tx),
          clientId: client.id,
          customerName: input.customerName,
          customerPhone: phone,
          customerEmail: input.customerEmail || null,
          wilayaCode: input.wilayaCode,
          commune,
          communeId: delivery.stopdesk?.communeId ?? input.communeId ?? null,
          address: input.address || (delivery.stopdesk ? `Retrait au bureau : ${delivery.stopdesk.name}` : ''),
          deliveryType: input.deliveryType,
          stopdeskId: delivery.stopdesk?.id ?? null,
          stopdeskName: delivery.stopdesk?.name ?? null,
          subtotal,
          shippingFee,
          discount,
          promoCode: promo?.code ?? null,
          total: subtotal + shippingFee - discount,
          paymentMethod: input.paymentMethod,
          status: 'PENDING',
          items: { create: lines },
          history: { create: { status: 'PENDING', by: 'Client' } },
        },
        include: { items: true, history: true },
      });
    }));

    res.status(201).json(s.order(order));
  })
);

/** Order tracking for guests: order number + the phone used. */
shopRouter.get(
  '/orders/track',
  handler(async (req, res) => {
    const { number, phone } = z
      .object({ number: z.string().min(3), phone: z.string().min(6) })
      .parse(req.query);

    const order = await prisma.order.findFirst({
      where: { number: number.trim().toUpperCase(), customerPhone: normalizePhone(phone) },
      include: { items: true, history: true },
    });
    if (!order) throw notFound('Aucune commande ne correspond à ce numéro et ce téléphone');
    res.json({ ...s.order(order), adminNote: undefined });
  })
);
