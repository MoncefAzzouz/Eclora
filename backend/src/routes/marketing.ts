// Promo codes and per-wilaya shipping rates.
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { CATALOG, MANAGERS, requireRole } from '../middleware/auth.js';

// ─── Promo codes ────────────────────────────────────────────────────────────

export const promoCodesRouter = Router();

const promoSchema = z
  .object({
    code: z.string().regex(/^[A-Z0-9_-]{3,20}$/i, 'Code : 3 à 20 caractères (lettres, chiffres, - ou _)'),
    type: z.enum(['PERCENT', 'FIXED', 'FREE_SHIPPING']),
    value: z.number().int().min(0).default(0),
    minOrder: z.number().int().min(0).default(0),
    maxUses: z.number().int().positive().nullish(),
    startsAt: z.string().datetime().nullish(),
    endsAt: z.string().datetime().nullish(),
    isActive: z.boolean().default(true),
  })
  .superRefine((v, ctx) => {
    if (v.type === 'PERCENT' && (v.value <= 0 || v.value > 90)) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Le pourcentage doit être entre 1 et 90' });
    }
    if (v.type === 'FIXED' && v.value <= 0) {
      ctx.addIssue({ code: 'custom', path: ['value'], message: 'Le montant doit être supérieur à 0' });
    }
  });

const toDate = (v?: string | null) => (v ? new Date(v) : null);

promoCodesRouter.get(
  '/',
  handler(async (_req, res) => {
    const codes = await prisma.promoCode.findMany({ orderBy: { code: 'asc' } });
    res.json(codes.map(s.promoCode));
  })
);

promoCodesRouter.post(
  '/',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = promoSchema.parse(req.body);
    const created = await prisma.promoCode.create({
      data: {
        ...input,
        code: input.code.toUpperCase(),
        maxUses: input.maxUses ?? null,
        startsAt: toDate(input.startsAt),
        endsAt: toDate(input.endsAt),
      },
    });
    res.status(201).json(s.promoCode(created));
  })
);

promoCodesRouter.put(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    const input = promoSchema.parse(req.body);
    const updated = await prisma.promoCode.update({
      where: { id: req.params.id },
      data: {
        ...input,
        code: input.code.toUpperCase(),
        maxUses: input.maxUses ?? null,
        startsAt: toDate(input.startsAt),
        endsAt: toDate(input.endsAt),
      },
    });
    res.json(s.promoCode(updated));
  })
);

promoCodesRouter.delete(
  '/:id',
  requireRole(...CATALOG),
  handler(async (req, res) => {
    await prisma.promoCode.delete({ where: { id: req.params.id } });
    res.status(204).end();
  })
);

// ─── Shipping rates ─────────────────────────────────────────────────────────

export const shippingRouter = Router();

const rateSchema = z.object({
  wilayaCode: z.number().int().min(1).max(58),
  wilayaName: z.string().min(1),
  homePrice: z.number().int().min(0),
  stopdeskPrice: z.number().int().min(0),
  deliveryDays: z.string().min(1),
  isActive: z.boolean(),
});

shippingRouter.get(
  '/',
  handler(async (_req, res) => {
    const rates = await prisma.shippingRate.findMany({ orderBy: { wilayaCode: 'asc' } });
    res.json(rates.map(s.shippingRate));
  })
);

/** The delivery page saves all 58 rows at once. */
shippingRouter.put(
  '/',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const rates = z.array(rateSchema).min(1).parse(req.body);
    if (rates.some((r) => r.homePrice < 0 || r.stopdeskPrice < 0)) throw badRequest('Tarif négatif impossible');

    await prisma.$transaction(
      rates.map((r) =>
        prisma.shippingRate.upsert({ where: { wilayaCode: r.wilayaCode }, create: r, update: r })
      )
    );
    res.status(204).end();
  })
);
