// Storefront content managed from the admin: banners and home page carousels.
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { CATALOG, requireRole } from '../middleware/auth.js';

// ─── Banners ────────────────────────────────────────────────────────────────

export const bannersRouter = Router();

const bannerSchema = z.object({
  placement: z.enum(['HERO', 'PROMO_DUAL', 'PROMO_MIDDLE']),
  title: z.string().min(1, 'Le titre est obligatoire'),
  subtitle: z.string().nullish(),
  description: z.string().nullish(),
  badge: z.string().nullish(),
  buttonText: z.string().default('Découvrir'),
  imageUrl: z.string().url('URL d’image invalide'),
  link: z.string().default('/'),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().nullish(),
  endsAt: z.string().datetime().nullish(),
});

const toDate = (v?: string | null) => (v ? new Date(v) : null);

bannersRouter.get(
  '/',
  handler(async (_req, res) => {
    const banners = await prisma.banner.findMany({ orderBy: [{ placement: 'asc' }, { position: 'asc' }] });
    res.json(banners.map(s.banner));
  })
);

bannersRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = bannerSchema.parse(req.body);
    if (input.startsAt && input.endsAt && input.endsAt < input.startsAt) {
      throw badRequest('La date de fin doit suivre la date de début');
    }
    const count = await prisma.banner.count({ where: { placement: input.placement } });
    const created = await prisma.banner.create({
      data: {
        ...input,
        subtitle: input.subtitle || null,
        description: input.description || null,
        badge: input.badge || null,
        startsAt: toDate(input.startsAt),
        endsAt: toDate(input.endsAt),
        position: count + 1,
      },
    });
    res.status(201).json(s.banner(created));
  })
);

bannersRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = bannerSchema.parse(req.body);
    if (input.startsAt && input.endsAt && input.endsAt < input.startsAt) {
      throw badRequest('La date de fin doit suivre la date de début');
    }
    const updated = await prisma.banner.update({
      where: { id: req.params.id },
      data: {
        ...input,
        subtitle: input.subtitle || null,
        description: input.description || null,
        badge: input.badge || null,
        startsAt: toDate(input.startsAt),
        endsAt: toDate(input.endsAt),
      },
    });
    res.json(s.banner(updated));
  })
);

bannersRouter.patch(
  '/:id/toggle',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const banner = await prisma.banner.findUniqueOrThrow({ where: { id: req.params.id } });
    const updated = await prisma.banner.update({
      where: { id: banner.id },
      data: { isActive: !banner.isActive },
    });
    res.json(s.banner(updated));
  })
);

bannersRouter.patch(
  '/:id/move',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { direction } = z.object({ direction: z.union([z.literal(-1), z.literal(1)]) }).parse(req.body);
    const banner = await prisma.banner.findUniqueOrThrow({ where: { id: req.params.id } });
    const group = await prisma.banner.findMany({ where: { placement: banner.placement }, orderBy: { position: 'asc' } });
    const index = group.findIndex((b) => b.id === banner.id);
    const other = group[index + direction];
    if (!other) return res.status(204).end();

    await prisma.$transaction([
      prisma.banner.update({ where: { id: banner.id }, data: { position: other.position } }),
      prisma.banner.update({ where: { id: other.id }, data: { position: banner.position } }),
    ]);
    res.status(204).end();
  })
);

bannersRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    await prisma.banner.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

// ─── Home sections ──────────────────────────────────────────────────────────

export const homeSectionsRouter = Router();

const sectionSchema = z.object({
  title: z.string().min(1, 'Le titre est obligatoire'),
  productIds: z.array(z.string()).default([]),
  isVisible: z.boolean().default(true),
});

const includeProducts = { products: { orderBy: { position: 'asc' } } } as const;

homeSectionsRouter.get(
  '/',
  handler(async (_req, res) => {
    const sections = await prisma.homeSection.findMany({ include: includeProducts, orderBy: { position: 'asc' } });
    res.json(sections.map(s.homeSection));
  })
);

homeSectionsRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = sectionSchema.parse(req.body);
    const count = await prisma.homeSection.count();
    const created = await prisma.homeSection.create({
      data: {
        title: input.title,
        isVisible: input.isVisible,
        position: count + 1,
        products: { create: input.productIds.map((productId, i) => ({ productId, position: i })) },
      },
      include: includeProducts,
    });
    res.status(201).json(s.homeSection(created));
  })
);

homeSectionsRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = sectionSchema.parse(req.body);
    const { id } = req.params;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.homeSectionProduct.deleteMany({ where: { sectionId: id } });
      return tx.homeSection.update({
        where: { id },
        data: {
          title: input.title,
          isVisible: input.isVisible,
          products: { create: input.productIds.map((productId, i) => ({ productId, position: i })) },
        },
        include: includeProducts,
      });
    });
    res.json(s.homeSection(updated));
  })
);

homeSectionsRouter.patch(
  '/:id/move',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { direction } = z.object({ direction: z.union([z.literal(-1), z.literal(1)]) }).parse(req.body);
    const all = await prisma.homeSection.findMany({ orderBy: { position: 'asc' } });
    const index = all.findIndex((x) => x.id === req.params.id);
    const current = all[index];
    const other = all[index + direction];
    if (!current || !other) return res.status(204).end();

    await prisma.$transaction([
      prisma.homeSection.update({ where: { id: current.id }, data: { position: other.position } }),
      prisma.homeSection.update({ where: { id: other.id }, data: { position: current.position } }),
    ]);
    res.status(204).end();
  })
);

homeSectionsRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    await prisma.homeSection.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
