// Categories (with subcategories) and brands.
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler, param } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { CATALOG, requireRole } from '../middleware/auth.js';

const slugify = (v: string) =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ─── Categories ─────────────────────────────────────────────────────────────

export const categoriesRouter = Router();

const categorySchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  slug: z.string().optional(),
  isVisible: z.boolean().default(true),
  isHighlighted: z.boolean().default(false),
  badgeColor: z.enum(['PINK', 'RED']).nullish(),
  description: z.string().trim().max(300).nullish(),
});

const withSubs = { subcategories: { orderBy: { position: 'asc' } } } as const;

categoriesRouter.get(
  '/',
  handler(async (_req, res) => {
    const categories = await prisma.category.findMany({ include: withSubs, orderBy: { position: 'asc' } });
    res.json(categories.map(s.category));
  })
);

categoriesRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const count = await prisma.category.count();
    const created = await prisma.category.create({
      data: {
        name: input.name,
        slug: input.slug || slugify(input.name),
        isVisible: input.isVisible,
        isHighlighted: input.isHighlighted,
        badgeColor: input.badgeColor ?? null,
        description: input.description || null,
        position: count + 1,
      },
      include: withSubs,
    });
    res.status(201).json(s.category(created));
  })
);

categoriesRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = categorySchema.parse(req.body);
    const updated = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: input.name,
        slug: input.slug || slugify(input.name),
        isVisible: input.isVisible,
        isHighlighted: input.isHighlighted,
        badgeColor: input.badgeColor ?? null,
        description: input.description || null,
      },
      include: withSubs,
    });
    res.json(s.category(updated));
  })
);

/** Swaps position with the neighbour above (-1) or below (+1). */
categoriesRouter.patch(
  '/:id/move',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { direction } = z.object({ direction: z.union([z.literal(-1), z.literal(1)]) }).parse(req.body);
    const all = await prisma.category.findMany({ orderBy: { position: 'asc' } });
    const index = all.findIndex((c) => c.id === req.params.id);
    const other = all[index + direction];
    const current = all[index];
    if (!current || !other) return res.status(204).end();

    await prisma.$transaction([
      prisma.category.update({ where: { id: current.id }, data: { position: other.position } }),
      prisma.category.update({ where: { id: other.id }, data: { position: current.position } }),
    ]);
    res.status(204).end();
  })
);

categoriesRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const used = await prisma.product.count({ where: { categoryId: req.params.id } });
    if (used) throw badRequest('Impossible : des produits utilisent cette catégorie');
    await prisma.category.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

const subSchema = z.object({ name: z.string().min(1, 'Le nom est obligatoire') });

categoriesRouter.post(
  '/:id/subcategories',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { name } = subSchema.parse(req.body);
    const categoryId = param(req, 'id');
    const count = await prisma.subcategory.count({ where: { categoryId } });
    const created = await prisma.subcategory.create({
      data: { name, slug: slugify(name), position: count + 1, categoryId },
    });
    res.status(201).json(created);
  })
);

categoriesRouter.put(
  '/:id/subcategories/:subId',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { name } = subSchema.parse(req.body);
    const updated = await prisma.subcategory.update({
      where: { id: req.params.subId },
      data: { name, slug: slugify(name) },
    });
    res.json(updated);
  })
);

categoriesRouter.delete(
  '/:id/subcategories/:subId',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const used = await prisma.product.count({ where: { subcategoryId: req.params.subId } });
    if (used) throw badRequest('Impossible : des produits utilisent cette sous-catégorie');
    await prisma.subcategory.delete({ where: { id: req.params.subId } });
    res.status(204).end();
  })
);

// ─── Brands ─────────────────────────────────────────────────────────────────

export const brandsRouter = Router();

// Uploaded logos are relative (/uploads/...), so accept a site path as well as a URL.
const logoSchema = z
  .string()
  .trim()
  .refine((v) => v === '' || v.startsWith('/') || /^https:\/\//.test(v), 'Lien du logo invalide')
  .nullish();

const brandSchema = z.object({
  name: z.string().trim().min(1, 'Le nom est obligatoire'),
  logoUrl: logoSchema,
  description: z.string().trim().max(1000).nullish(),
  isFeatured: z.boolean().default(false),
});

const brandData = (input: z.infer<typeof brandSchema>) => ({
  name: input.name,
  logoUrl: input.logoUrl || null,
  description: input.description || null,
  isFeatured: input.isFeatured,
});

brandsRouter.get(
  '/',
  handler(async (_req, res) => {
    const brands = await prisma.brand.findMany({ orderBy: [{ position: 'asc' }, { name: 'asc' }] });
    res.json(brands.map(s.brand));
  })
);

brandsRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = brandSchema.parse(req.body);
    const created = await prisma.brand.create({
      data: { ...brandData(input), slug: slugify(input.name) },
    });
    res.status(201).json(s.brand(created));
  })
);

brandsRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = brandSchema.parse(req.body);
    const updated = await prisma.brand.update({
      where: { id: req.params.id },
      // The slug is the public URL (/marques/<slug>), so renaming keeps it stable.
      data: brandData(input),
    });
    res.json(s.brand(updated));
  })
);

brandsRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const used = await prisma.product.count({ where: { brandId: req.params.id } });
    if (used) throw badRequest('Impossible : des produits utilisent cette marque');
    await prisma.brand.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
