import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { SALES, requireRole } from '../middleware/auth.js';

export const clientsRouter = Router();

// Totals exclude cancelled and returned orders.
clientsRouter.get(
  '/',
  handler(async (_req, res) => {
    const clients = await prisma.client.findMany({
      orderBy: { createdAt: 'desc' },
      include: { orders: { select: { total: true, status: true, createdAt: true } } },
    });

    res.json(
      clients.map((c) =>
        s.client(c, {
          ordersCount: c.orders.length,
          totalSpent: c.orders
            .filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED')
            .reduce((sum, o) => sum + o.total, 0),
          lastOrderAt: c.orders.map((o) => o.createdAt).sort((a, b) => b.getTime() - a.getTime())[0] ?? null,
        })
      )
    );
  })
);

clientsRouter.get(
  '/:id',
  handler(async (req, res) => {
    const client = await prisma.client.findUniqueOrThrow({ where: { id: req.params.id } });
    const orders = await prisma.order.findMany({
      where: { clientId: client.id },
      include: { items: true, history: true },
      orderBy: { createdAt: 'desc' },
    });
    const counted = orders.filter((o) => o.status !== 'CANCELLED' && o.status !== 'RETURNED');

    res.json({
      client: s.client(client, {
        ordersCount: orders.length,
        totalSpent: counted.reduce((sum, o) => sum + o.total, 0),
        lastOrderAt: orders[0]?.createdAt ?? null,
      }),
      orders: orders.map(s.order),
    });
  })
);

clientsRouter.patch(
  '/:id',
  requireRole(...SALES),
  handler(async (req, res) => {
    const patch = z
      .object({ status: z.enum(['ACTIVE', 'BLOCKED']).optional(), adminNote: z.string().nullish() })
      .parse(req.body);

    const updated = await prisma.client.update({
      where: { id: req.params.id },
      data: { ...patch, adminNote: patch.adminNote === undefined ? undefined : patch.adminNote || null },
    });
    res.json(s.client(updated));
  })
);
