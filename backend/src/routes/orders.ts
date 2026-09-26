import { Router } from 'express';
import { z } from 'zod';
import type { OrderStatus, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { SALES, requireRole } from '../middleware/auth.js';

export const ordersRouter = Router();

const include = { items: true, history: true } satisfies Prisma.OrderInclude;

/** Allowed transitions — mirrors ORDER_TRANSITIONS in the admin UI. */
const TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  RETURNED: [],
  CANCELLED: ['PENDING'],
};

ordersRouter.get(
  '/',
  handler(async (_req, res) => {
    const orders = await prisma.order.findMany({ include, orderBy: { createdAt: 'desc' } });
    res.json(orders.map(s.order));
  })
);

ordersRouter.get(
  '/:id',
  handler(async (req, res) => {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: req.params.id }, include });
    res.json(s.order(order));
  })
);

ordersRouter.patch(
  '/:id/status',
  requireRole(...SALES),
  handler(async (req, res) => {
    const { status, note } = z
      .object({
        status: z.enum(['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'RETURNED', 'CANCELLED']),
        note: z.string().optional(),
      })
      .parse(req.body);

    const order = await prisma.order.findUniqueOrThrow({ where: { id: req.params.id }, include });
    if (!TRANSITIONS[order.status].includes(status)) {
      throw badRequest(`Transition impossible : ${order.status} → ${status}`);
    }

    const updated = await prisma.$transaction(async (tx) => {
      // Stock: reserved on confirmation, returned on cancel-after-confirm or return.
      const delta = status === 'CONFIRMED' && order.status === 'PENDING' ? -1
        : (status === 'CANCELLED' && order.status === 'CONFIRMED') || status === 'RETURNED' ? 1
        : 0;

      if (delta !== 0) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product) continue;
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: Math.max(0, product.stock + delta * item.quantity) },
          });
        }
      }

      return tx.order.update({
        where: { id: order.id },
        data: {
          status,
          paymentStatus: status === 'DELIVERED' && order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus,
          history: { create: { status, note: note || null, by: req.admin?.name ?? 'Admin' } },
        },
        include,
      });
    });

    res.json(s.order(updated));
  })
);

ordersRouter.patch(
  '/:id',
  requireRole(...SALES),
  handler(async (req, res) => {
    const patch = z
      .object({
        adminNote: z.string().nullish(),
        trackingNumber: z.string().nullish(),
        customerPhone: z.string().min(6).optional(),
        address: z.string().min(1).optional(),
        commune: z.string().min(1).optional(),
        paymentStatus: z.enum(['PENDING', 'PAID', 'REFUNDED']).optional(),
      })
      .parse(req.body);

    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: {
        ...patch,
        adminNote: patch.adminNote === undefined ? undefined : patch.adminNote || null,
        trackingNumber: patch.trackingNumber === undefined ? undefined : patch.trackingNumber || null,
      },
      include,
    });
    res.json(s.order(updated));
  })
);
