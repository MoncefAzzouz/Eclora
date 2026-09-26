// Seed data for the mock API. Replaced by the real database once the backend exists.
import type {
  AdminUser,
  Banner,
  Brand,
  Category,
  Client,
  HomeSection,
  Order,
  OrderStatus,
  PaymentMethod,
  Product,
  PromoCode,
  Review,
  ShippingRate,
  StoreSettings,
} from '@/types/admin';
import { WILAYAS } from '@/lib/admin/wilayas';
import { slugify } from '@/lib/admin/format';

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;

export const seedBrands: Brand[] = [
  'ANASTASIA BEVERLY HILLS', 'ARMANI', 'CHARLOTTE TILBURY', 'COLOR WOW', 'DIOR', 'ECLORA COLLECTION',
  'FENTY BEAUTY', 'HUDA BEAUTY', 'KOSAS', 'LANEIGE', 'REFY', 'REM BEAUTY', 'TARTE', 'TOO FACED',
].map((name) => ({
  id: `brand_${slugify(name)}`,
  name,
  slug: slugify(name),
  isFeatured: ['DIOR', 'HUDA BEAUTY', 'ECLORA COLLECTION', 'CHARLOTTE TILBURY'].includes(name),
}));

const brandId = (name: string) => `brand_${slugify(name)}`;

export const seedCategories: Category[] = [
  {
    id: 'cat_maquillage', name: 'Maquillage', slug: 'maquillage', position: 1, isVisible: true, isHighlighted: false,
    subcategories: ['Teint', 'Yeux', 'Lèvres', 'Palettes', 'Pinceaux & Accessoires'].map((n, i) => ({
      id: `sub_${slugify(n)}`, name: n, slug: slugify(n), position: i + 1,
    })),
  },
  {
    id: 'cat_parfum', name: 'Parfum', slug: 'parfum', position: 2, isVisible: true, isHighlighted: false,
    subcategories: ['Parfum femme', 'Parfum homme', 'Coffrets parfum'].map((n, i) => ({
      id: `sub_${slugify(n)}`, name: n, slug: slugify(n), position: i + 1,
    })),
  },
  {
    id: 'cat_soin', name: 'Soin', slug: 'soin', position: 3, isVisible: true, isHighlighted: false,
    subcategories: ['Nettoyant & Démaquillant', 'Sérum & Traitement', 'Crème hydratante', 'Lèvres', 'Cheveux'].map((n, i) => ({
      id: `sub_soin_${slugify(n)}`, name: n, slug: slugify(n), position: i + 1,
    })),
  },
  {
    id: 'cat_eclora', name: 'Eclora Collection', slug: 'eclora-collection', position: 4, isVisible: true,
    isHighlighted: true, badgeColor: 'PINK',
    subcategories: [{ id: 'sub_meilleurs-prix', name: 'Meilleurs prix', slug: 'meilleurs-prix', position: 1 }],
  },
  {
    id: 'cat_derniere-chance', name: 'Dernière chance -40%', slug: 'derniere-chance', position: 5, isVisible: true,
    isHighlighted: true, badgeColor: 'RED',
    subcategories: [{ id: 'sub_ventes-flash', name: 'Ventes flash', slug: 'ventes-flash', position: 1 }],
  },
];

type P = Partial<Product> & Pick<Product, 'id' | 'name' | 'brandId' | 'categoryId' | 'price' | 'stock' | 'images'>;

const baseProducts: P[] = [
  { id: 'huda-easy-bake', name: 'Easy Bake Loose Baking & Setting Powder', brandId: brandId('HUDA BEAUTY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 8500, stock: 148, volume: '20 g', badge: 'Nouveauté', badgeType: 'BLACK', isBestSeller: true, rating: 4.8, reviewsCount: 12805, images: [img('photo-1596462502278-27bfdc403348')],
    shades: [
      { id: 'sh_pound', name: 'Pound Cake', hex: '#EBD2B5', stock: 60 },
      { id: 'sh_banana', name: 'Banana Bread', hex: '#E8C07D', stock: 48 },
      { id: 'sh_cherry', name: 'Cherry Blossom', hex: '#F5D5D5', stock: 40 },
    ] },
  { id: 'charlotte-airbrush', name: 'Airbrush Flawless Finish Setting Spray', brandId: brandId('CHARLOTTE TILBURY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 5200, stock: 92, volume: '100 ml', badge: 'Best seller', badgeType: 'BLACK', isBestSeller: true, rating: 4.7, reviewsCount: 3120, images: [img('photo-1620916566398-39f1143ab7be')] },
  { id: 'armani-stronger-with-you', name: 'Stronger with You Intensely Eau de Parfum', brandId: brandId('ARMANI'), categoryId: 'cat_parfum', subcategoryId: 'sub_parfum-homme', price: 16800, compareAtPrice: 24000, stock: 64, volume: '100 ml', badge: 'Offre fidélité web', badgeType: 'PINK', rating: 4.9, reviewsCount: 845, images: [img('photo-1592945403244-b3fbafd7f539')] },
  { id: 'dior-sauvage', name: 'Sauvage Eau de parfum pour homme', brandId: brandId('DIOR'), categoryId: 'cat_parfum', subcategoryId: 'sub_parfum-homme', price: 19500, compareAtPrice: 36000, stock: 110, volume: '100 ml', badge: 'Gravure', badgeType: 'GOLD', isBestSeller: true, rating: 4.8, reviewsCount: 2210, images: [img('photo-1523293182086-7651a899d37f')] },
  { id: 'color-wow-money', name: 'Money Laundering Après-shampoing', brandId: brandId('COLOR WOW'), categoryId: 'cat_soin', subcategoryId: 'sub_soin_cheveux', price: 7200, stock: 34, volume: '250 ml', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, rating: 4.5, reviewsCount: 112, images: [img('photo-1535585209827-a15fcdbc4c2d')] },
  { id: 'laneige-lip-sleeping-mask', name: 'Lip Sleeping Mask Smoothie Açaï', brandId: brandId('LANEIGE'), categoryId: 'cat_soin', subcategoryId: 'sub_soin_levres', price: 5400, stock: 7, volume: '20 g', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, rating: 4.7, reviewsCount: 3480, images: [img('photo-1571781926291-c477ebfd024b')] },
  { id: 'eclora-stretch-mascara', name: 'Stretch Mascara Volume & Longueur', brandId: brandId('ECLORA COLLECTION'), categoryId: 'cat_eclora', subcategoryId: 'sub_meilleurs-prix', price: 3200, stock: 220, volume: '8 ml', badge: 'Nouveauté', badgeType: 'PINK', isNew: true, rating: 4.4, reviewsCount: 610, images: [img('photo-1631729371254-42c2892f0e6e')] },
  { id: 'eclora-fluff-fix', name: 'Fluff & Fix Brow Wax', brandId: brandId('ECLORA COLLECTION'), categoryId: 'cat_eclora', subcategoryId: 'sub_meilleurs-prix', price: 3000, stock: 0, volume: '10 g', rating: 4.3, reviewsCount: 290, images: [img('photo-1631729371254-42c2892f0e6e')] },
  { id: 'refy-lash-sculpt', name: 'Lash Sculpt Mascara liftant et allongeant', brandId: brandId('REFY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_yeux', price: 5300, stock: 41, volume: '10 ml', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, rating: 4.6, reviewsCount: 205, images: [img('photo-1512496015851-a90fb38ba796')] },
  { id: 'kosas-cloud-set', name: 'Cloud Set Poudre libre fixante', brandId: brandId('KOSAS'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 8500, stock: 18, volume: '20 g', isNew: true, rating: 4.5, reviewsCount: 180, images: [img('photo-1631214540553-ff044a3ff1d4')] },
  { id: 'tarte-cc-serum', name: 'CC Color-Correcting Tinted Serum', brandId: brandId('TARTE'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 8500, stock: 26, volume: '55 ml', rating: 4.2, reviewsCount: 95, images: [img('photo-1522337360788-8b13dee7a37e')] },
  { id: 'dior-forever-set-powder', name: 'Dior Forever On Set Powder', brandId: brandId('DIOR'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 13500, stock: 4, volume: '20 g', rating: 4.6, reviewsCount: 402, images: [img('photo-1596462502278-27bfdc403348')] },
  { id: 'refy-watercolour-blush', name: 'Watercolour Blush Fard à joues liquide', brandId: brandId('REFY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_teint', price: 4800, stock: 57, volume: '7 g', rating: 4.4, reviewsCount: 133, images: [img('photo-1516975080664-ed2fc6a32937')] },
  { id: 'rem-beauty-blur-butter', name: 'Blur Butter - Baume à lèvres nourrissant', brandId: brandId('REM BEAUTY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_levres', price: 5900, stock: 63, volume: '3 g', rating: 4.3, reviewsCount: 76, images: [img('photo-1620916566398-39f1143ab7be')] },
  { id: 'too-faced-chocolate', name: 'Born This Way Palette Chocolate', brandId: brandId('TOO FACED'), categoryId: 'cat_derniere-chance', subcategoryId: 'sub_ventes-flash', price: 6900, compareAtPrice: 11500, stock: 12, badge: '-40%', badgeType: 'RED', rating: 4.5, reviewsCount: 988, images: [img('photo-1512496015851-a90fb38ba796')] },
  { id: 'fenty-gloss-bomb', name: 'Gloss Bomb Universal Lip Luminizer', brandId: brandId('FENTY BEAUTY'), categoryId: 'cat_maquillage', subcategoryId: 'sub_levres', price: 4600, stock: 0, status: 'DRAFT', volume: '9 ml', rating: 0, reviewsCount: 0, images: [img('photo-1586495777744-4413f21062fa')] },
];

const now = Date.now();
const DAY = 86_400_000;
const iso = (msAgo: number) => new Date(now - msAgo).toISOString();

export const seedProducts: Product[] = baseProducts.map((p, i) => ({
  slug: slugify(p.name),
  sku: `ECL-${String(1001 + i)}`,
  lowStockThreshold: 10,
  shades: [],
  tags: [],
  isNew: false,
  isBestSeller: false,
  status: 'ACTIVE',
  rating: 0,
  reviewsCount: 0,
  description: '',
  createdAt: iso(DAY * (60 - i * 2)),
  updatedAt: iso(DAY * (10 - (i % 10))),
  ...p,
}));

export const seedClients: Client[] = [
  ['Amina Benali', 'amina.benali@gmail.com', '0550 12 34 56', 16],
  ['Karim Mansouri', 'karim.mansouri@gmail.com', '0661 98 76 54', 31],
  ['Sarah Khelifi', 'sarah.khelifi@yahoo.fr', '0770 45 89 12', 25],
  ['Yassine Belkacem', 'yassine.belkacem@gmail.com', '0555 22 11 44', 19],
  ['Lina Haddad', 'lina.haddad@gmail.com', '0698 34 21 09', 9],
  ['Nour El Houda Saidi', 'nour.saidi@outlook.com', '0541 76 55 20', 6],
  ['Meriem Boudiaf', 'meriem.boudiaf@gmail.com', '0662 10 99 87', 15],
  ['Rania Cherif', 'rania.cherif@gmail.com', '0779 88 12 03', 23],
  ['Imane Ziani', 'imane.ziani@gmail.com', '0556 43 67 11', 13],
  ['Sofiane Amrani', 'sofiane.amrani@gmail.com', '0667 20 45 78', 5],
].map(([name, email, phone, w], i) => ({
  id: `cli_${i + 1}`,
  name: name as string,
  email: email as string,
  phone: phone as string,
  wilayaCode: w as number,
  status: i === 9 ? 'BLOCKED' : 'ACTIVE',
  adminNote: i === 9 ? 'Deux commandes refusées à la livraison.' : undefined,
  createdAt: iso(DAY * (300 - i * 25)),
}));

export const seedShippingRates: ShippingRate[] = WILAYAS.map((w) => {
  const prices = {
    CENTER: [400, 250, '24-48h'],
    NORTH: [600, 400, '2-3 jours'],
    HIGHLANDS: [700, 450, '2-4 jours'],
    SOUTH: [1100, 800, '4-7 jours'],
  }[w.zone];
  return {
    wilayaCode: w.code,
    wilayaName: w.name,
    homePrice: prices[0] as number,
    stopdeskPrice: prices[1] as number,
    deliveryDays: prices[2] as string,
    isActive: ![50, 54].includes(w.code),
  };
});

// Deterministic pseudo-random generator so the seed is stable.
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

function buildOrders(): Order[] {
  const rand = rng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]!;
  const active = seedProducts.filter((p) => p.status === 'ACTIVE');
  const brandName = (id: string) => seedBrands.find((b) => b.id === id)?.name ?? '';
  const communes: Record<number, string> = { 16: 'Hydra', 31: 'Bir El Djir', 25: 'El Khroub', 19: 'El Eulma', 9: 'Boufarik', 6: 'Akbou', 15: 'Azazga', 23: 'El Bouni', 13: 'Mansourah', 5: 'Barika' };
  const orders: Order[] = [];

  for (let i = 0; i < 38; i++) {
    const client = seedClients[Math.floor(rand() * 9)]!; // never the blocked one
    const ageMs = Math.floor(rand() * 20 * DAY) + (i < 5 ? 0 : DAY * 0.3);
    const createdAt = iso(i < 5 ? Math.floor(rand() * DAY * 0.6) : ageMs);
    const itemCount = 1 + Math.floor(rand() * 3);
    const items = Array.from({ length: itemCount }, () => {
      const p = pick(active);
      return {
        productId: p.id,
        name: p.name,
        brand: brandName(p.brandId),
        image: p.images[0]!,
        shade: p.shades[0]?.name,
        unitPrice: p.price,
        quantity: rand() > 0.8 ? 2 : 1,
      };
    });
    const subtotal = items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
    const deliveryType = rand() > 0.35 ? 'HOME' : 'STOPDESK';
    const rate = seedShippingRates.find((r) => r.wilayaCode === client.wilayaCode)!;
    const shippingFee = subtotal >= 15000 ? 0 : deliveryType === 'HOME' ? rate.homePrice : rate.stopdeskPrice;
    const discount = rand() > 0.85 ? Math.round(subtotal * 0.1) : 0;

    const ageDays = (now - new Date(createdAt).getTime()) / DAY;
    let status: OrderStatus;
    if (ageDays < 1) status = rand() > 0.3 ? 'PENDING' : 'CONFIRMED';
    else if (ageDays < 3) status = pick(['CONFIRMED', 'SHIPPED', 'SHIPPED', 'CANCELLED']);
    else status = pick(['DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'RETURNED', 'CANCELLED']);

    const flow: OrderStatus[] = ['PENDING'];
    if (status !== 'PENDING' && status !== 'CANCELLED') flow.push('CONFIRMED');
    if (['SHIPPED', 'DELIVERED', 'RETURNED'].includes(status)) flow.push('SHIPPED');
    if (status === 'DELIVERED') flow.push('DELIVERED');
    if (status === 'RETURNED') flow.push('RETURNED');
    if (status === 'CANCELLED') flow.push('CANCELLED');

    const start = new Date(createdAt).getTime();
    const history = flow.map((s, idx) => ({
      status: s,
      at: new Date(Math.min(start + idx * DAY * 0.9, now)).toISOString(),
      by: idx === 0 ? 'Client' : 'Admin Eclora',
    }));

    const paymentMethod: PaymentMethod = rand() > 0.8 ? pick(['BARIDIMOB', 'CIB']) : 'COD';

    orders.push({
      id: `ord_${1000 + i}`,
      number: `ECL-${String(26000 + i)}`,
      clientId: client.id,
      customerName: client.name,
      customerPhone: client.phone,
      customerEmail: client.email,
      wilayaCode: client.wilayaCode,
      commune: communes[client.wilayaCode] ?? 'Centre-ville',
      address: `${10 + Math.floor(rand() * 90)} Rue ${pick(['Didouche Mourad', 'Larbi Ben M’hidi', 'des Frères Bouadou', 'Emir Abdelkader', 'du 1er Novembre'])}`,
      deliveryType,
      items,
      subtotal,
      shippingFee,
      discount,
      promoCode: discount ? 'BIENVENUE10' : undefined,
      total: subtotal + shippingFee - discount,
      paymentMethod,
      paymentStatus: status === 'DELIVERED' || paymentMethod !== 'COD' ? 'PAID' : 'PENDING',
      status,
      trackingNumber: flow.includes('SHIPPED') ? `YAL-${Math.floor(100000 + rand() * 899999)}` : undefined,
      history,
      createdAt,
    });
  }
  return orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const seedOrders: Order[] = buildOrders();

export const seedReviews: Review[] = [
  { id: 'rev_1', productId: 'huda-easy-bake', authorName: 'Amina B.', rating: 5, title: 'Magnifique poudre', text: 'Fixe parfaitement mon maquillage toute la journée, même avec la chaleur d’Alger.', status: 'APPROVED', createdAt: iso(DAY * 6) },
  { id: 'rev_2', productId: 'dior-sauvage', authorName: 'Karim M.', rating: 5, title: 'Un classique', text: 'Tenue incroyable, livraison rapide à Oran. Merci Eclora !', status: 'APPROVED', createdAt: iso(DAY * 4) },
  { id: 'rev_3', productId: 'laneige-lip-sleeping-mask', authorName: 'Lina H.', rating: 4, title: 'Très bon produit', text: 'Mes lèvres sont très douces le matin, le parfum est léger.', status: 'PENDING', createdAt: iso(DAY * 1) },
  { id: 'rev_4', productId: 'charlotte-airbrush', authorName: 'Rania C.', rating: 3, title: 'Correct', text: 'Bon spray mais un peu cher pour la quantité.', status: 'PENDING', createdAt: iso(DAY * 0.4) },
  { id: 'rev_5', productId: 'eclora-stretch-mascara', authorName: 'Visiteur', rating: 1, title: 'Arnaque !!!', text: 'Contactez-moi sur WhatsApp pour des prix moins chers www.exemple-spam.com', status: 'PENDING', createdAt: iso(DAY * 0.2) },
  { id: 'rev_6', productId: 'armani-stronger-with-you', authorName: 'Sofiane A.', rating: 5, title: 'Parfait', text: 'Mon parfum préféré, authentique et bien emballé.', status: 'APPROVED', createdAt: iso(DAY * 9) },
  { id: 'rev_7', productId: 'refy-lash-sculpt', authorName: 'Imane Z.', rating: 2, title: 'Déçue', text: 'Le mascara coule un peu en fin de journée.', status: 'REJECTED', createdAt: iso(DAY * 12) },
];

export const seedBanners: Banner[] = [
  { id: 'ban_hero_1', placement: 'HERO', title: 'Eclora Beauty', subtitle: 'Nouvelle saison', description: 'Découvrez les nouveautés maquillage et parfum de la rentrée.', buttonText: 'Découvrir', imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=85', link: '/shop/maquillage', isActive: true, position: 1 },
  { id: 'ban_dual_1', placement: 'PROMO_DUAL', title: 'Exclusivité web', subtitle: "Jusqu'à -30%", description: 'sur une sélection de produits*. Offre fidélité en Algérie.', buttonText: 'Découvrir', imageUrl: img('photo-1522337360788-8b13dee7a37e'), link: '/shop/maquillage', isActive: true, position: 1 },
  { id: 'ban_dual_2', placement: 'PROMO_DUAL', title: 'Place au renouveau', description: 'Préparez-vous à une nouvelle saison beauté avec nos favoris.', buttonText: 'Découvrir', imageUrl: img('photo-1570172619644-dfd03ed5d881'), link: '/shop/soin', isActive: true, position: 2 },
  { id: 'ban_mid_1', placement: 'PROMO_MIDDLE', title: "Plus qu'un parfum, une émotion", description: 'Senteurs fruitées, florales ou chaleureuses à votre image.', buttonText: 'Découvrir', imageUrl: img('photo-1592945403244-b3fbafd7f539'), link: '/shop/parfum', isActive: true, position: 1 },
  { id: 'ban_mid_2', placement: 'PROMO_MIDDLE', title: 'Avant-première Erborian', badge: 'Bientôt', description: 'Le soin coréen arrive chez Eclora.', buttonText: 'En savoir plus', imageUrl: img('photo-1570172619644-dfd03ed5d881'), link: '/shop/soin', isActive: false, position: 2 },
];

export const seedHomeSections: HomeSection[] = [
  { id: 'sec_1', title: 'Meilleures ventes maquillage', productIds: ['huda-easy-bake', 'charlotte-airbrush', 'too-faced-chocolate', 'eclora-fluff-fix', 'kosas-cloud-set'], position: 1, isVisible: true },
  { id: 'sec_2', title: 'Nouveautés parfum', productIds: ['armani-stronger-with-you', 'dior-sauvage'], position: 2, isVisible: true },
  { id: 'sec_3', title: 'Tendances TikTok Beauté', productIds: ['huda-easy-bake', 'refy-lash-sculpt', 'kosas-cloud-set', 'laneige-lip-sleeping-mask'], position: 3, isVisible: true },
];

export const seedPromoCodes: PromoCode[] = [
  { id: 'promo_1', code: 'BIENVENUE10', type: 'PERCENT', value: 10, minOrder: 5000, usedCount: 42, isActive: true },
  { id: 'promo_2', code: 'LIVRAISON0', type: 'FREE_SHIPPING', value: 0, minOrder: 8000, maxUses: 200, usedCount: 87, isActive: true, endsAt: new Date(now + DAY * 20).toISOString() },
  { id: 'promo_3', code: 'RENTREE1000', type: 'FIXED', value: 1000, minOrder: 10000, maxUses: 100, usedCount: 100, isActive: false, endsAt: iso(DAY * 2) },
];

export const seedSettings: StoreSettings = {
  storeName: 'Eclora',
  contactEmail: 'contact@eclora.dz',
  contactPhone: '0550 00 00 00',
  address: 'Hydra, Alger, Algérie',
  announcementText: 'Livraison gratuite dès 15 000 DA dans les 58 wilayas',
  announcementEnabled: true,
  freeShippingThreshold: 15000,
  payments: { COD: true, BARIDIMOB: true, CIB: false },
  socials: { instagram: 'https://instagram.com/eclora.dz', facebook: '', tiktok: '' },
  maintenanceMode: false,
};

export const seedAdmins: (AdminUser & { password: string })[] = [
  { id: 'adm_1', name: 'Admin Eclora', email: 'admin@eclora.dz', password: 'admin123', role: 'OWNER', isActive: true, lastLoginAt: iso(DAY * 0.1), createdAt: iso(DAY * 400) },
  { id: 'adm_2', name: 'Samira Support', email: 'support@eclora.dz', password: 'support123', role: 'SUPPORT', isActive: true, lastLoginAt: iso(DAY * 2), createdAt: iso(DAY * 120) },
];
