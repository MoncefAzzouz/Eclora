// Admin side of the Yalidine integration: sync reference data and tariffs,
// edit per-commune prices, and turn an order into a Yalidine parcel.
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler, param } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { MANAGERS, SALES, requireRole } from '../middleware/auth.js';
import { createParcel, getParcel, startSync, syncStatus, toLocalPhone, yalidineConfigured, YalidineError } from '../lib/yalidine.js';
import { getSettings } from './settings.js';

export const yalidineRouter = Router();

yalidineRouter.get(
  '/status',
  handler(async (_req, res) => {
    const settings = await getSettings();
    const [communes, centers] = await Promise.all([prisma.deliveryCommune.count(), prisma.deliveryCenter.count({ where: { isActive: true } })]);
    res.json({
      configured: yalidineConfigured(),
      fromWilaya: settings.yalidineFromWilaya,
      lastSync: settings.yalidineLastSync?.toISOString(),
      communes,
      centers,
      sync: syncStatus(),
    });
  })
);

yalidineRouter.post(
  '/sync',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    if (!yalidineConfigured()) throw badRequest('Ajoutez YALIDINE_API_ID et YALIDINE_API_TOKEN dans le .env du serveur.');
    const { applyPrices } = z.object({ applyPrices: z.boolean().default(true) }).parse(req.body ?? {});
    res.status(202).json(startSync(applyPrices));
  })
);

/** Communes of a wilaya with their own price overrides (null = wilaya price). */
yalidineRouter.get(
  '/communes/:wilaya',
  handler(async (req, res) => {
    const wilayaCode = z.coerce.number().int().parse(req.params.wilaya);
    const communes = await prisma.deliveryCommune.findMany({ where: { wilayaCode }, orderBy: { name: 'asc' } });
    res.json(communes);
  })
);

yalidineRouter.put(
  '/communes',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const rows = z
      .array(
        z.object({
          id: z.number().int(),
          homePrice: z.number().int().min(0).nullable(),
          stopdeskPrice: z.number().int().min(0).nullable(),
          isDeliverable: z.boolean(),
        })
      )
      .max(2000)
      .parse(req.body);
    await prisma.$transaction(
      rows.map((r) =>
        prisma.deliveryCommune.update({
          where: { id: r.id },
          data: { homePrice: r.homePrice, stopdeskPrice: r.stopdeskPrice, isDeliverable: r.isDeliverable },
        })
      )
    );
    res.status(204).end();
  })
);

/** "Amine Ben Ali" → firstname "Amine", familyname "Ben Ali". */
function splitName(full: string) {
  const parts = full.trim().split(/\s+/);
  if (parts.length === 1) return { firstname: parts[0]!, familyname: parts[0]! };
  return { firstname: parts[0]!, familyname: parts.slice(1).join(' ') };
}

/**
 * Creates the parcel at Yalidine. The customer pays exactly the order total
 * shown on the site: Yalidine collects `total` and its delivery fee is charged
 * to the store (freeshipping = true), so nothing is added at the door.
 */
yalidineRouter.post(
  '/orders/:id/parcel',
  requireRole(...SALES),
  handler(async (req, res) => {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: param(req, 'id') }, include: { items: true, history: true } });
    if (order.trackingNumber) throw badRequest(`Colis déjà créé : ${order.trackingNumber}`);
    if (order.status === 'CANCELLED' || order.status === 'RETURNED') throw badRequest('Commande annulée ou retournée');
    if (order.deliveryType === 'STOPDESK' && !order.stopdeskId) {
      throw badRequest('Aucun bureau Yalidine choisi pour ce retrait. Modifiez la commande ou passez en livraison à domicile.');
    }

    const settings = await getSettings();
    const [from, to] = await Promise.all([
      prisma.shippingRate.findUnique({ where: { wilayaCode: settings.yalidineFromWilaya } }),
      prisma.shippingRate.findUnique({ where: { wilayaCode: order.wilayaCode } }),
    ]);
    if (!from || !to) throw badRequest('Synchronisez d’abord les wilayas avec Yalidine (page Livraison).');

    const toCollect = order.paymentMethod === 'COD' && order.paymentStatus !== 'PAID' ? order.total : 0;
    if (toCollect > 150000) throw badRequest('Yalidine limite le montant à encaisser à 150 000 DA');

    const products = order.items.map((i) => `${i.quantity}x ${i.brand} ${i.name}`).join(', ');
    try {
      const { tracking, label } = await createParcel({
        order_id: order.number,
        from_wilaya_name: from.wilayaName,
        ...splitName(order.customerName),
        contact_phone: toLocalPhone(order.customerPhone),
        address: order.address || order.commune,
        to_commune_name: order.commune,
        to_wilaya_name: to.wilayaName,
        product_list: products.slice(0, 250),
        price: toCollect,
        do_insurance: false,
        declared_value: Math.min(order.subtotal, 150000),
        length: settings.parcelLength,
        width: settings.parcelWidth,
        height: settings.parcelHeight,
        weight: settings.parcelWeight,
        freeshipping: true,
        is_stopdesk: order.deliveryType === 'STOPDESK',
        ...(order.deliveryType === 'STOPDESK' && order.stopdeskId ? { stopdesk_id: order.stopdeskId } : {}),
        has_exchange: false,
      });

      const updated = await prisma.order.update({
        where: { id: order.id },
        data: {
          trackingNumber: tracking,
          yalidineLabel: label,
          yalidineStatus: 'En préparation',
          history: { create: { status: order.status, note: `Colis Yalidine créé : ${tracking}`, by: req.admin?.name ?? 'Admin' } },
        },
        include: { items: true, history: true },
      });
      res.json(s.order(updated));
    } catch (e) {
      if (e instanceof YalidineError) throw badRequest(e.message);
      throw e;
    }
  })
);

yalidineRouter.post(
  '/orders/:id/refresh',
  requireRole(...SALES),
  handler(async (req, res) => {
    const order = await prisma.order.findUniqueOrThrow({ where: { id: param(req, 'id') } });
    if (!order.trackingNumber) throw badRequest('Aucun colis Yalidine pour cette commande');
    try {
      const parcel = await getParcel(order.trackingNumber);
      const updated = await prisma.order.update({
        where: { id: order.id },
        data: { yalidineStatus: parcel?.last_status ?? order.yalidineStatus, yalidineLabel: parcel?.label ?? order.yalidineLabel },
        include: { items: true, history: true },
      });
      res.json(s.order(updated));
    } catch (e) {
      if (e instanceof YalidineError) throw badRequest(e.message);
      throw e;
    }
  })
);
