import type {
  AdminRole,
  BannerPlacement,
  ClientStatus,
  DeliveryType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ProductStatus,
  PromoType,
  ReviewStatus,
} from '@/types';

type Tone = 'neutral' | 'amber' | 'blue' | 'violet' | 'emerald' | 'red' | 'pink';

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Nouvelle', tone: 'amber' },
  CONFIRMED: { label: 'Confirmée', tone: 'blue' },
  SHIPPED: { label: 'Expédiée', tone: 'violet' },
  DELIVERED: { label: 'Livrée', tone: 'emerald' },
  RETURNED: { label: 'Retournée', tone: 'pink' },
  CANCELLED: { label: 'Annulée', tone: 'red' },
};

/** Allowed next statuses from a given status (COD workflow). */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURNED'],
  DELIVERED: ['RETURNED'],
  RETURNED: [],
  CANCELLED: ['PENDING'],
};

export const PAYMENT_METHOD: Record<PaymentMethod, string> = {
  COD: 'Paiement à la livraison',
  BARIDIMOB: 'BaridiMob',
  CIB: 'Carte CIB / Edahabia',
};

export const PAYMENT_STATUS: Record<PaymentStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'Non payé', tone: 'amber' },
  PAID: { label: 'Payé', tone: 'emerald' },
  REFUNDED: { label: 'Remboursé', tone: 'neutral' },
};

export const DELIVERY_TYPE: Record<DeliveryType, string> = {
  HOME: 'À domicile',
  STOPDESK: 'Stop desk',
};

export const PRODUCT_STATUS: Record<ProductStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'En ligne', tone: 'emerald' },
  DRAFT: { label: 'Brouillon', tone: 'amber' },
  ARCHIVED: { label: 'Archivé', tone: 'neutral' },
};

export const REVIEW_STATUS: Record<ReviewStatus, { label: string; tone: Tone }> = {
  PENDING: { label: 'En attente', tone: 'amber' },
  APPROVED: { label: 'Publié', tone: 'emerald' },
  REJECTED: { label: 'Rejeté', tone: 'red' },
};

export const CLIENT_STATUS: Record<ClientStatus, { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Actif', tone: 'emerald' },
  BLOCKED: { label: 'Bloqué', tone: 'red' },
};

export const BANNER_PLACEMENT: Record<BannerPlacement, { label: string; hint: string }> = {
  HERO: { label: 'Hero (grande bannière)', hint: "Bannière principale en haut de la page d'accueil" },
  PROMO_DUAL: { label: 'Promo double', hint: 'Deux cartes côte à côte sous le hero' },
  PROMO_MIDDLE: { label: 'Promo milieu', hint: 'Cartes au milieu de la page, entre les carrousels' },
};

export const PROMO_TYPE: Record<PromoType, string> = {
  PERCENT: 'Pourcentage',
  FIXED: 'Montant fixe',
  FREE_SHIPPING: 'Livraison gratuite',
};

export const ADMIN_ROLE: Record<AdminRole, { label: string; description: string }> = {
  OWNER: { label: 'Propriétaire', description: 'Accès total, y compris la gestion de l’équipe' },
  ADMIN: { label: 'Administrateur', description: 'Accès total sauf la suppression du propriétaire' },
  EDITOR: { label: 'Éditeur', description: 'Catalogue, contenu et promotions' },
  SUPPORT: { label: 'Support', description: 'Commandes, clients et avis' },
};

export type { Tone };
