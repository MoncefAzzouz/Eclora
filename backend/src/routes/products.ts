import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { CATALOG, requireRole } from '../middleware/auth.js';

export const productsRouter = Router();

const shadeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nom de teinte requis'),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Couleur invalide'),
  stock: z.number().int().min(0).default(0),
});

const productSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  slug: z.string().optional(),
  brandId: z.string().min(1, 'Marque obligatoire'),
  categoryId: z.string().min(1, 'Catégorie obligatoire'),
  subcategoryId: z.string().nullish(),
  sku: z.string().min(1, 'SKU obligatoire'),
  price: z.number().int().positive('Le prix doit être supérieur à 0'),
  compareAtPrice: z.number().int().positive().nullish(),
  stock: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(10),
  volume: z.string().nullish(),
  // Admin uploads are stored as same-origin /uploads paths; external https
  // images remain supported as well.
  images: z
    .array(z.string().refine((v) => /^https?:\/\//.test(v) || v.startsWith('/'), 'URL d’image invalide'))
    .default([]),
  shades: z.array(shadeSchema).default([]),
  badge: z.string().nullish(),
  badgeType: z.enum(['BLACK', 'PINK', 'RED', 'GOLD']).nullish(),
  tags: z.array(z.string()).default([]),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  description: z.string().nullish(),
  usageTips: z.string().nullish(),
  ingredients: z.string().nullish(),
});

const slugify = (v: string) =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function validateBusinessRules(input: z.infer<typeof productSchema>) {
  if (input.compareAtPrice && input.compareAtPrice <= input.price) {
    throw badRequest('Le prix barré doit être supérieur au prix de vente');
  }
  if (input.status === 'ACTIVE' && input.images.length === 0) {
    throw badRequest('Ajoutez au moins une image pour mettre le produit en ligne');
  }
}

productsRouter.get(
  '/',
  handler(async (_req, res) => {
    const products = await prisma.product.findMany({
      include: { shades: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(products.map(s.product));
  })
);

productsRouter.get(
  '/:id',
  handler(async (req, res) => {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: req.params.id },
      include: { shades: true },
    });
    res.json(s.product(product));
  })
);

productsRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = productSchema.parse(req.body);
    validateBusinessRules(input);

    const created = await prisma.product.create({
      data: {
        ...input,
        slug: input.slug || slugify(input.name),
        subcategoryId: input.subcategoryId || null,
        compareAtPrice: input.compareAtPrice ?? null,
        badge: input.badge || null,
        badgeType: input.badgeType ?? null,
        volume: input.volume || null,
        description: input.description || null,
        usageTips: input.usageTips || null,
        ingredients: input.ingredients || null,
        // With shades, total stock is the sum of shade stock.
        stock: input.shades.length ? input.shades.reduce((t, sh) => t + sh.stock, 0) : input.stock,
        shades: { create: input.shades.map(({ name, hex, stock }) => ({ name, hex, stock })) },
      },
      include: { shades: true },
    });
    res.status(201).json(s.product(created));
  })
);

productsRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = productSchema.parse(req.body);
    validateBusinessRules(input);
    const { id } = req.params;

    const updated = await prisma.$transaction(async (tx) => {
      await tx.shade.deleteMany({ where: { productId: id } });
      return tx.product.update({
        where: { id },
        data: {
          ...input,
          slug: input.slug || slugify(input.name),
          subcategoryId: input.subcategoryId || null,
          compareAtPrice: input.compareAtPrice ?? null,
          badge: input.badge || null,
          badgeType: input.badgeType ?? null,
          volume: input.volume || null,
          description: input.description || null,
          usageTips: input.usageTips || null,
          ingredients: input.ingredients || null,
          stock: input.shades.length ? input.shades.reduce((t, sh) => t + sh.stock, 0) : input.stock,
          shades: { create: input.shades.map(({ name, hex, stock }) => ({ name, hex, stock })) },
        },
        include: { shades: true },
      });
    });
    res.json(s.product(updated));
  })
);

productsRouter.patch(
  '/bulk-status',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const { ids, status } = z
      .object({ ids: z.array(z.string()).min(1), status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']) })
      .parse(req.body);
    await prisma.product.updateMany({ where: { id: { in: ids } }, data: { status } });
    res.status(204).end();
  })
);

productsRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    await prisma.product.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);
