import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';

export const reviewsRouter = Router();

/** Recomputes a product's rating from its approved reviews. */
async function refreshProductRating(productId: string) {
  const approved = await prisma.review.findMany({ where: { productId, status: 'APPROVED' }, select: { rating: true } });
  const count = approved.length;
  const avg = count ? approved.reduce((sum, r) => sum + r.rating, 0) / count : 0;
  await prisma.product.update({
    where: { id: productId },
    data: { rating: Math.round(avg * 10) / 10, reviewsCount: count },
  });
}

reviewsRouter.get(
  '/',
  handler(async (_req, res) => {
    const reviews = await prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(reviews.map(s.review));
  })
);

reviewsRouter.patch(
  '/:id/status',
  handler(async (req, res) => {
    const { status } = z.object({ status: z.enum(['PENDING', 'APPROVED', 'REJECTED']) }).parse(req.body);
    const updated = await prisma.review.update({ where: { id: req.params.id }, data: { status } });
    await refreshProductRating(updated.productId);
    res.json(s.review(updated));
  })
);

reviewsRouter.delete(
  '/:id',
  handler(async (req, res) => {
    const deleted = await prisma.review.delete({ where: { id: req.params.id } });
    await refreshProductRating(deleted.productId);
    res.status(204).end();
  })
);
