// Delivery pricing — the single place that turns (wilaya, commune, type) into a
// fee. The storefront shows the result of quote(); order creation calls the same
// function, so the price a customer sees is the price they are charged.
import { prisma } from './prisma.js';
import { badRequest } from './http.js';

export type DeliveryType = 'HOME' | 'STOPDESK';

export interface QuoteInput {
  wilayaCode: number;
  communeId?: number | null;
  deliveryType: DeliveryType;
  stopdeskId?: number | null;
  subtotal: number;
}

export interface Quote {
  fee: number;
  /** Fee before the free-shipping rule, for "économisez X DA" messages. */
  baseFee: number;
  freeShipping: boolean;
  deliveryDays: string;
  communeName?: string;
  stopdesk?: { id: number; name: string; address: string; communeId: number; communeName: string };
}

export async function quote(input: QuoteInput, freeShippingThreshold: number): Promise<Quote> {
  const rate = await prisma.shippingRate.findUnique({ where: { wilayaCode: input.wilayaCode } });
  if (!rate || !rate.isActive) throw badRequest('Nous ne livrons pas encore dans cette wilaya');

  // Once Yalidine is synced the commune must come from its list; before that,
  // the free-text commune is accepted and the wilaya price applies.
  const synced = (await prisma.deliveryCommune.count({ where: { wilayaCode: input.wilayaCode } })) > 0;
  const commune = input.communeId
    ? await prisma.deliveryCommune.findUnique({ where: { id: input.communeId } })
    : null;
  // For office pickup the commune is the office's, so only home delivery needs one.
  if (synced && !commune && input.deliveryType === 'HOME') throw badRequest('Choisissez votre commune dans la liste');
  if (commune && commune.wilayaCode !== input.wilayaCode) throw badRequest('Cette commune n’appartient pas à la wilaya choisie');

  let stopdesk: Quote['stopdesk'];
  let stopdeskCommuneId: number | null = null;
  if (input.deliveryType === 'HOME') {
    if (commune && !commune.isDeliverable) {
      throw badRequest('La livraison à domicile n’est pas disponible dans cette commune. Choisissez le retrait au bureau.');
    }
  } else {
    const centers = await prisma.deliveryCenter.count({ where: { wilayaCode: input.wilayaCode, isActive: true } });
    if (centers > 0 || input.stopdeskId) {
      if (!input.stopdeskId) throw badRequest('Choisissez le bureau Yalidine où retirer votre colis');
      const center = await prisma.deliveryCenter.findUnique({ where: { id: input.stopdeskId } });
      if (!center || !center.isActive || center.wilayaCode !== input.wilayaCode) {
        throw badRequest('Ce bureau n’est pas disponible pour cette wilaya');
      }
      stopdesk = { id: center.id, name: center.name, address: center.address, communeId: center.communeId, communeName: center.communeName };
      stopdeskCommuneId = center.communeId;
    } else if (synced) {
      throw badRequest('Aucun bureau Yalidine dans cette wilaya. Choisissez la livraison à domicile.');
    }
  }

  // Stop-desk price follows the commune of the office, not the customer's.
  const priceCommune = stopdeskCommuneId
    ? await prisma.deliveryCommune.findUnique({ where: { id: stopdeskCommuneId } })
    : commune;

  const baseFee = input.deliveryType === 'HOME'
    ? priceCommune?.homePrice ?? rate.homePrice
    : priceCommune?.stopdeskPrice ?? rate.stopdeskPrice;

  const freeShipping = freeShippingThreshold > 0 && input.subtotal >= freeShippingThreshold;
  return {
    fee: freeShipping ? 0 : baseFee,
    baseFee,
    freeShipping,
    deliveryDays: commune?.deliveryDays ?? rate.deliveryDays,
    communeName: stopdesk?.communeName ?? commune?.name,
    stopdesk,
  };
}
