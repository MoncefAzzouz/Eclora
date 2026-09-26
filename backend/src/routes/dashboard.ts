import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';

export const dashboardRouter = Router();

const DAY = 86_400_000;

/** Counts for the sidebar badges and the notification bell. */
dashboardRouter.get(
  '/alerts',
  handler(async (_req, res) => {
    const [pendingOrders, pendingReviews, products] = await Promise.all([
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE' }, select: { stock: true, lowStockThreshold: true } }),
    ]);

    res.json({
      pendingOrders,
      pendingReviews,
      outOfStock: products.filter((p) => p.stock === 0).length,
      lowStock: products.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    });
  })
);

dashboardRouter.get(
  '/summary',
  handler(async (_req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const from = new Date(startOfToday.getTime() - 13 * DAY);

    const [orders, recentOrders, clientsCount, pendingReviews, lowStock, statusGroups] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: from }, status: { notIn: ['CANCELLED', 'RETURNED'] } },
        select: { total: true, createdAt: true },
      }),
      prisma.order.findMany({ include: { items: true, history: true }, orderBy: { createdAt: 'desc' }, take: 6 }),
      prisma.client.count(),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.product.findMany({ where: { status: 'ACTIVE' }, include: { shades: true } }),
      prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    ]);

    const revenueByDay = Array.from({ length: 14 }, (_, i) => {
      const day = new Date(startOfToday.getTime() - (13 - i) * DAY);
      const next = new Date(day.getTime() + DAY);
      const dayOrders = orders.filter((o) => o.createdAt >= day && o.createdAt < next);
      return {
        date: day.toISOString(),
        revenue: dayOrders.reduce((sum, o) => sum + o.total, 0),
        orders: dayOrders.length,
      };
    });

    // Best sellers across all time, from paid-through order lines.
    const sold = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      where: { order: { status: { notIn: ['CANCELLED', 'RETURNED'] } }, productId: { not: null } },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });
    const topProductRows = await prisma.product.findMany({
      where: { id: { in: sold.map((x) => x.productId!).filter(Boolean) } },
      include: { shades: true },
    });

    const revenue14d = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const orders14d = revenueByDay.reduce((sum, d) => sum + d.orders, 0);

    res.json({
      revenue14d,
      orders14d,
      averageOrder: orders14d ? Math.round(revenue14d / orders14d) : 0,
      todayOrders: revenueByDay.at(-1)?.orders ?? 0,
      pendingOrders: statusGroups.find((g) => g.status === 'PENDING')?._count._all ?? 0,
      clientsCount,
      pendingReviews,
      lowStock: lowStock.filter((p) => p.stock <= p.lowStockThreshold).map(s.product),
      revenueByDay,
      statusCounts: Object.fromEntries(statusGroups.map((g) => [g.status, g._count._all])),
      topProducts: sold
        .map((row) => {
          const product = topProductRows.find((p) => p.id === row.productId);
          return product ? { product: s.product(product), quantity: row._sum.quantity ?? 0 } : null;
        })
        .filter((x): x is { product: ReturnType<typeof s.product>; quantity: number } => x !== null),
      recentOrders: recentOrders.map(s.order),
    });
  })
);
