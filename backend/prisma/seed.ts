// Seeds the database with the Eclora demo catalogue, staff, and sample orders.
// Safe to re-run: it clears the tables it owns first.
import { PrismaClient, type OrderStatus, type PaymentMethod, type Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { WILAYAS } from '../src/lib/wilayas.js';
import { BANNER_URLS, productImageUrl, syncStorefrontMediaFiles } from '../src/lib/storefront-media.js';

const prisma = new PrismaClient();

const img = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=600&q=80`;
const slugify = (v: string) =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const DAY = 86_400_000;
const now = Date.now();
const daysAgo = (d: number) => new Date(now - d * DAY);

/** Deterministic pseudo-random so re-seeding gives the same demo data. */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

const BRANDS = [
  'ANASTASIA BEVERLY HILLS', 'ARMANI', 'CHARLOTTE TILBURY', 'COLOR WOW', 'DIOR', 'ECLORA COLLECTION',
  'FENTY BEAUTY', 'HUDA BEAUTY', 'KOSAS', 'LANEIGE', 'REFY', 'REM BEAUTY', 'TARTE', 'TOO FACED',
];
const FEATURED = ['DIOR', 'HUDA BEAUTY', 'ECLORA COLLECTION', 'CHARLOTTE TILBURY'];

const CATEGORIES = [
  { name: 'Maquillage', subs: ['Teint', 'Yeux', 'Lèvres', 'Palettes', 'Pinceaux & Accessoires'] },
  { name: 'Parfum', subs: ['Parfum femme', 'Parfum homme', 'Coffrets parfum'] },
  { name: 'Soin', subs: ['Nettoyant & Démaquillant', 'Sérum & Traitement', 'Crème hydratante', 'Lèvres', 'Cheveux'] },
  { name: 'Eclora Collection', subs: ['Meilleurs prix'], highlight: 'PINK' as const },
  { name: 'Dernière chance -40%', subs: ['Ventes flash'], highlight: 'RED' as const },
];

interface SeedProduct {
  slug: string;
  name: string;
  brand: string;
  category: string;
  sub?: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  volume?: string;
  badge?: string;
  badgeType?: 'BLACK' | 'PINK' | 'RED' | 'GOLD';
  isNew?: boolean;
  isBestSeller?: boolean;
  status?: 'ACTIVE' | 'DRAFT';
  image: string;
  shades?: { name: string; hex: string; stock: number }[];
  description?: string;
}

const PRODUCTS: SeedProduct[] = [
  { slug: 'huda-easy-bake', name: 'Easy Bake Loose Baking & Setting Powder', brand: 'HUDA BEAUTY', category: 'Maquillage', sub: 'Teint', price: 8500, stock: 148, volume: '20 g', badge: 'Nouveauté', badgeType: 'BLACK', isBestSeller: true, image: img('photo-1596462502278-27bfdc403348'),
    description: 'Poudre libre ultra-fine qui fixe le maquillage et floute les pores pour un fini velouté longue tenue.',
    shades: [
      { name: 'Pound Cake', hex: '#EBD2B5', stock: 60 },
      { name: 'Banana Bread', hex: '#E8C07D', stock: 48 },
      { name: 'Cherry Blossom', hex: '#F5D5D5', stock: 40 },
    ] },
  { slug: 'charlotte-airbrush', name: 'Airbrush Flawless Finish Setting Spray', brand: 'CHARLOTTE TILBURY', category: 'Maquillage', sub: 'Teint', price: 5200, stock: 92, volume: '100 ml', badge: 'Best seller', badgeType: 'BLACK', isBestSeller: true, image: img('photo-1620916566398-39f1143ab7be'),
    description: 'Brume fixatrice qui prolonge la tenue du maquillage toute la journée, même par forte chaleur.' },
  { slug: 'armani-stronger-with-you', name: 'Stronger with You Intensely Eau de Parfum', brand: 'ARMANI', category: 'Parfum', sub: 'Parfum homme', price: 16800, compareAtPrice: 24000, stock: 64, volume: '100 ml', badge: 'Offre fidélité web', badgeType: 'PINK', image: img('photo-1592945403244-b3fbafd7f539'),
    description: 'Un boisé ambré intense aux notes de châtaigne glacée, lavande et vanille.' },
  { slug: 'dior-sauvage', name: 'Sauvage Eau de parfum pour homme', brand: 'DIOR', category: 'Parfum', sub: 'Parfum homme', price: 19500, compareAtPrice: 36000, stock: 110, volume: '100 ml', badge: 'Gravure', badgeType: 'GOLD', isBestSeller: true, image: img('photo-1523293182086-7651a899d37f'),
    description: 'Composition fraîche et puissante : bergamote de Calabre, poivre de Sichuan et ambroxan.' },
  { slug: 'color-wow-money', name: 'Money Laundering Après-shampoing', brand: 'COLOR WOW', category: 'Soin', sub: 'Cheveux', price: 7200, stock: 34, volume: '250 ml', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, image: img('photo-1535585209827-a15fcdbc4c2d') },
  { slug: 'laneige-lip-sleeping-mask', name: 'Lip Sleeping Mask Smoothie Açaï', brand: 'LANEIGE', category: 'Soin', sub: 'Lèvres', price: 5400, stock: 7, volume: '20 g', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, image: img('photo-1571781926291-c477ebfd024b'),
    description: 'Masque de nuit nourrissant : des lèvres douces et repulpées au réveil.' },
  { slug: 'eclora-stretch-mascara', name: 'Stretch Mascara Volume & Longueur', brand: 'ECLORA COLLECTION', category: 'Eclora Collection', sub: 'Meilleurs prix', price: 3200, stock: 220, volume: '8 ml', badge: 'Nouveauté', badgeType: 'PINK', isNew: true, image: img('photo-1631729371254-42c2892f0e6e') },
  { slug: 'eclora-fluff-fix', name: 'Fluff & Fix Brow Wax', brand: 'ECLORA COLLECTION', category: 'Eclora Collection', sub: 'Meilleurs prix', price: 3000, stock: 0, volume: '10 g', image: img('photo-1631729371254-42c2892f0e6e') },
  { slug: 'refy-lash-sculpt', name: 'Lash Sculpt Mascara liftant et allongeant', brand: 'REFY', category: 'Maquillage', sub: 'Yeux', price: 5300, stock: 41, volume: '10 ml', badge: 'Nouveauté', badgeType: 'BLACK', isNew: true, image: img('photo-1512496015851-a90fb38ba796') },
  { slug: 'kosas-cloud-set', name: 'Cloud Set Poudre libre fixante', brand: 'KOSAS', category: 'Maquillage', sub: 'Teint', price: 8500, stock: 18, volume: '20 g', isNew: true, image: img('photo-1631214540553-ff044a3ff1d4') },
  { slug: 'tarte-cc-serum', name: 'CC Color-Correcting Tinted Serum', brand: 'TARTE', category: 'Maquillage', sub: 'Teint', price: 8500, stock: 26, volume: '55 ml', image: img('photo-1522337360788-8b13dee7a37e') },
  { slug: 'dior-forever-set-powder', name: 'Dior Forever On Set Powder', brand: 'DIOR', category: 'Maquillage', sub: 'Teint', price: 13500, stock: 4, volume: '20 g', image: img('photo-1596462502278-27bfdc403348') },
  { slug: 'refy-watercolour-blush', name: 'Watercolour Blush Fard à joues liquide', brand: 'REFY', category: 'Maquillage', sub: 'Teint', price: 4800, stock: 57, volume: '7 g', image: img('photo-1516975080664-ed2fc6a32937') },
  { slug: 'rem-beauty-blur-butter', name: 'Blur Butter - Baume à lèvres nourrissant', brand: 'REM BEAUTY', category: 'Maquillage', sub: 'Lèvres', price: 5900, stock: 63, volume: '3 g', image: img('photo-1620916566398-39f1143ab7be') },
  { slug: 'too-faced-chocolate', name: 'Born This Way Palette Chocolate', brand: 'TOO FACED', category: 'Dernière chance -40%', sub: 'Ventes flash', price: 6900, compareAtPrice: 11500, stock: 12, badge: '-40%', badgeType: 'RED', image: img('photo-1512496015851-a90fb38ba796') },
  { slug: 'fenty-gloss-bomb', name: 'Gloss Bomb Universal Lip Luminizer', brand: 'FENTY BEAUTY', category: 'Maquillage', sub: 'Lèvres', price: 4600, stock: 0, volume: '9 ml', status: 'DRAFT', image: img('photo-1586495777744-4413f21062fa') },
];

const CLIENTS: [string, string, string, number][] = [
  ['Amina Benali', 'amina.benali@gmail.com', '0550123456', 16],
  ['Karim Mansouri', 'karim.mansouri@gmail.com', '0661987654', 31],
  ['Sarah Khelifi', 'sarah.khelifi@yahoo.fr', '0770458912', 25],
  ['Yassine Belkacem', 'yassine.belkacem@gmail.com', '0555221144', 19],
  ['Lina Haddad', 'lina.haddad@gmail.com', '0698342109', 9],
  ['Nour El Houda Saidi', 'nour.saidi@outlook.com', '0541765520', 6],
  ['Meriem Boudiaf', 'meriem.boudiaf@gmail.com', '0662109987', 15],
  ['Rania Cherif', 'rania.cherif@gmail.com', '0779881203', 23],
  ['Imane Ziani', 'imane.ziani@gmail.com', '0556436711', 13],
  ['Sofiane Amrani', 'sofiane.amrani@gmail.com', '0667204578', 5],
];

const ZONE_PRICES = {
  CENTER: [400, 250, '24-48h'],
  NORTH: [600, 400, '2-3 jours'],
  HIGHLANDS: [700, 450, '2-4 jours'],
  SOUTH: [1100, 800, '4-7 jours'],
} as const;

async function main() {
  await syncStorefrontMediaFiles();
  console.log('Clearing existing data...');
  await prisma.$transaction([
    prisma.orderEvent.deleteMany(),
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.review.deleteMany(),
    prisma.homeSectionProduct.deleteMany(),
    prisma.homeSection.deleteMany(),
    prisma.shade.deleteMany(),
    prisma.product.deleteMany(),
    prisma.subcategory.deleteMany(),
    prisma.category.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.client.deleteMany(),
    prisma.banner.deleteMany(),
    prisma.promoCode.deleteMany(),
    prisma.shippingRate.deleteMany(),
    prisma.adminUser.deleteMany(),
  ]);

  // ─── Staff ──────────────────────────────────────────────────────────────
  await prisma.adminUser.createMany({
    data: [
      { name: 'Admin Eclora', email: 'admin@eclora.dz', passwordHash: await bcrypt.hash('admin123', 10), role: 'OWNER', lastLoginAt: daysAgo(0.1) },
      { name: 'Samira Support', email: 'support@eclora.dz', passwordHash: await bcrypt.hash('support123', 10), role: 'SUPPORT', lastLoginAt: daysAgo(2) },
    ],
  });

  // ─── Catalogue ──────────────────────────────────────────────────────────
  await prisma.brand.createMany({
    data: BRANDS.map((name) => ({ name, slug: slugify(name), isFeatured: FEATURED.includes(name) })),
  });
  const brands = await prisma.brand.findMany();
  const brandId = (name: string) => brands.find((b) => b.name === name)!.id;

  for (const [i, cat] of CATEGORIES.entries()) {
    await prisma.category.create({
      data: {
        name: cat.name,
        slug: slugify(cat.name),
        position: i + 1,
        isHighlighted: !!cat.highlight,
        badgeColor: cat.highlight ?? null,
        subcategories: { create: cat.subs.map((name, j) => ({ name, slug: slugify(name), position: j + 1 })) },
      },
    });
  }
  const categories = await prisma.category.findMany({ include: { subcategories: true } });
  const catOf = (name: string) => categories.find((c) => c.name === name)!;

  for (const [i, p] of PRODUCTS.entries()) {
    const category = catOf(p.category);
    await prisma.product.create({
      data: {
        slug: p.slug,
        name: p.name,
        sku: `ECL-${1001 + i}`,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        stock: p.shades ? p.shades.reduce((t, s) => t + s.stock, 0) : p.stock,
        volume: p.volume ?? null,
        images: [productImageUrl(i)],
        badge: p.badge ?? null,
        badgeType: p.badgeType ?? null,
        isNew: p.isNew ?? false,
        isBestSeller: p.isBestSeller ?? false,
        status: p.status ?? 'ACTIVE',
        description: p.description ?? null,
        brandId: brandId(p.brand),
        categoryId: category.id,
        subcategoryId: p.sub ? category.subcategories.find((s) => s.name === p.sub)?.id ?? null : null,
        createdAt: daysAgo(60 - i * 2),
        shades: p.shades ? { create: p.shades } : undefined,
      },
    });
  }
  const products = await prisma.product.findMany({ include: { brand: true } });
  const pid = (slug: string) => products.find((p) => p.slug === slug)!;

  // ─── Delivery ───────────────────────────────────────────────────────────
  await prisma.shippingRate.createMany({
    data: WILAYAS.map((w) => {
      const [home, stopdesk, days] = ZONE_PRICES[w.zone];
      return {
        wilayaCode: w.code,
        wilayaName: w.name,
        homePrice: home,
        stopdeskPrice: stopdesk,
        deliveryDays: days,
        isActive: ![50, 54].includes(w.code),
      };
    }),
  });

  // ─── Clients ────────────────────────────────────────────────────────────
  await prisma.client.createMany({
    data: CLIENTS.map(([name, email, phone, wilayaCode], i) => ({
      name,
      email,
      phone,
      wilayaCode,
      status: i === 9 ? ('BLOCKED' as const) : ('ACTIVE' as const),
      adminNote: i === 9 ? 'Deux commandes refusées à la livraison.' : null,
      isGuest: i > 5,
      createdAt: daysAgo(300 - i * 25),
    })),
  });
  const clients = await prisma.client.findMany({ orderBy: { createdAt: 'asc' } });

  // ─── Orders ─────────────────────────────────────────────────────────────
  const rand = rng(42);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)]!;
  const active = products.filter((p) => p.status === 'ACTIVE');
  const rates = await prisma.shippingRate.findMany();
  const communes: Record<number, string> = { 16: 'Hydra', 31: 'Bir El Djir', 25: 'El Khroub', 19: 'El Eulma', 9: 'Boufarik', 6: 'Akbou', 15: 'Azazga', 23: 'El Bouni', 13: 'Mansourah', 5: 'Barika' };

  for (let i = 0; i < 38; i++) {
    const client = clients.filter((c) => c.status === 'ACTIVE')[Math.floor(rand() * 9)] ?? clients[0]!;
    const ageDays = i < 5 ? rand() * 0.6 : rand() * 20 + 0.3;
    const createdAt = daysAgo(ageDays);

    const lines = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
      const product = pick(active);
      return {
        productId: product.id,
        name: product.name,
        brand: product.brand.name,
        image: product.images[0] ?? '',
        shade: null,
        unitPrice: product.price,
        quantity: rand() > 0.8 ? 2 : 1,
      };
    });

    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
    const deliveryType = rand() > 0.35 ? 'HOME' : 'STOPDESK';
    const rate = rates.find((r) => r.wilayaCode === client.wilayaCode)!;
    const shippingFee = subtotal >= 15000 ? 0 : deliveryType === 'HOME' ? rate.homePrice : rate.stopdeskPrice;
    const discount = rand() > 0.85 ? Math.round(subtotal * 0.1) : 0;

    const status: OrderStatus =
      ageDays < 1 ? (rand() > 0.3 ? 'PENDING' : 'CONFIRMED')
      : ageDays < 3 ? pick(['CONFIRMED', 'SHIPPED', 'SHIPPED', 'CANCELLED'] as OrderStatus[])
      : pick(['DELIVERED', 'DELIVERED', 'DELIVERED', 'DELIVERED', 'SHIPPED', 'RETURNED', 'CANCELLED'] as OrderStatus[]);

    const flow: OrderStatus[] = ['PENDING'];
    if (status !== 'PENDING' && status !== 'CANCELLED') flow.push('CONFIRMED');
    if (['SHIPPED', 'DELIVERED', 'RETURNED'].includes(status)) flow.push('SHIPPED');
    if (status === 'DELIVERED') flow.push('DELIVERED');
    if (status === 'RETURNED') flow.push('RETURNED');
    if (status === 'CANCELLED') flow.push('CANCELLED');

    const paymentMethod: PaymentMethod = rand() > 0.8 ? pick(['BARIDIMOB', 'CIB'] as PaymentMethod[]) : 'COD';

    await prisma.order.create({
      data: {
        number: `ECL-${26000 + i}`,
        clientId: client.id,
        customerName: client.name,
        customerPhone: client.phone,
        customerEmail: client.email,
        wilayaCode: client.wilayaCode,
        commune: communes[client.wilayaCode] ?? 'Centre-ville',
        address: `${10 + Math.floor(rand() * 90)} Rue ${pick(['Didouche Mourad', 'Larbi Ben M’hidi', 'Emir Abdelkader', 'du 1er Novembre'])}`,
        deliveryType,
        subtotal,
        shippingFee,
        discount,
        promoCode: discount ? 'BIENVENUE10' : null,
        total: subtotal + shippingFee - discount,
        paymentMethod,
        paymentStatus: status === 'DELIVERED' || paymentMethod !== 'COD' ? 'PAID' : 'PENDING',
        status,
        trackingNumber: flow.includes('SHIPPED') ? `YAL-${Math.floor(100000 + rand() * 899999)}` : null,
        createdAt,
        items: { create: lines },
        history: {
          create: flow.map((s, idx) => ({
            status: s,
            at: new Date(Math.min(createdAt.getTime() + idx * DAY * 0.9, now)),
            by: idx === 0 ? 'Client' : 'Admin Eclora',
          })),
        },
      },
    });
  }

  // ─── Reviews ────────────────────────────────────────────────────────────
  const reviews: Prisma.ReviewCreateManyInput[] = [
    { productId: pid('huda-easy-bake').id, authorName: 'Amina B.', rating: 5, title: 'Magnifique poudre', text: 'Fixe parfaitement mon maquillage toute la journée, même avec la chaleur d’Alger.', status: 'APPROVED', createdAt: daysAgo(6) },
    { productId: pid('dior-sauvage').id, authorName: 'Karim M.', rating: 5, title: 'Un classique', text: 'Tenue incroyable, livraison rapide à Oran. Merci Eclora !', status: 'APPROVED', createdAt: daysAgo(4) },
    { productId: pid('laneige-lip-sleeping-mask').id, authorName: 'Lina H.', rating: 4, title: 'Très bon produit', text: 'Mes lèvres sont très douces le matin, le parfum est léger.', status: 'PENDING', createdAt: daysAgo(1) },
    { productId: pid('charlotte-airbrush').id, authorName: 'Rania C.', rating: 3, title: 'Correct', text: 'Bon spray mais un peu cher pour la quantité.', status: 'PENDING', createdAt: daysAgo(0.4) },
    { productId: pid('eclora-stretch-mascara').id, authorName: 'Visiteur', rating: 1, title: 'Arnaque !!!', text: 'Contactez-moi sur WhatsApp pour des prix moins chers www.exemple-spam.com', status: 'PENDING', createdAt: daysAgo(0.2) },
    { productId: pid('armani-stronger-with-you').id, authorName: 'Sofiane A.', rating: 5, title: 'Parfait', text: 'Mon parfum préféré, authentique et bien emballé.', status: 'APPROVED', createdAt: daysAgo(9) },
    { productId: pid('refy-lash-sculpt').id, authorName: 'Imane Z.', rating: 2, title: 'Déçue', text: 'Le mascara coule un peu en fin de journée.', status: 'REJECTED', createdAt: daysAgo(12) },
  ];
  await prisma.review.createMany({ data: reviews });

  // Ratings reflect approved reviews only.
  for (const product of products) {
    const approved = reviews.filter((r) => r.productId === product.id && r.status === 'APPROVED');
    if (approved.length) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          rating: Math.round((approved.reduce((s, r) => s + r.rating, 0) / approved.length) * 10) / 10,
          reviewsCount: approved.length,
        },
      });
    }
  }

  // ─── Storefront content ─────────────────────────────────────────────────
  await prisma.banner.createMany({
    data: [
      { placement: 'HERO', title: 'Beauty, in every form.', subtitle: 'The Eclora edit', description: 'Makeup, skincare, hair, fragrance — discover iconic favourites and the emerging brands worth knowing.', buttonText: 'Explore Eclora', imageUrl: BANNER_URLS.heroPrimary, link: '/shop/maquillage', position: 1 },
      { placement: 'HERO', title: 'Une nouvelle saison beauté', subtitle: 'Gracias Premium', description: 'Découvrez une sélection colorée de soins et de parfums pour votre nouvelle routine.', buttonText: 'Découvrir', imageUrl: BANNER_URLS.heroSecondary, link: '/shop/nouveautes', position: 2 },
      { placement: 'PROMO_DUAL', title: 'Exclusivité web', subtitle: "Jusqu'à -30%", description: 'sur une sélection de produits*.', buttonText: 'Découvrir', imageUrl: BANNER_URLS.exclusive, link: '/shop/maquillage', position: 1 },
      { placement: 'PROMO_DUAL', title: 'Place au renouveau', description: 'Préparez-vous à une nouvelle saison beauté avec nos favoris.', buttonText: 'Découvrir', imageUrl: BANNER_URLS.renewal, link: '/shop/soin', position: 2 },
      { placement: 'PROMO_MIDDLE', title: "Plus qu'un parfum, une émotion", description: 'Senteurs fruitées, florales ou chaleureuses à votre image.', buttonText: 'Découvrir', imageUrl: BANNER_URLS.fragrance, link: '/shop/parfum', position: 1 },
      { placement: 'PROMO_MIDDLE', title: 'Avant-première soin', badge: 'Bientôt', description: 'Une nouvelle routine soin arrive chez Eclora.', buttonText: 'En savoir plus', imageUrl: BANNER_URLS.skincare, link: '/shop/soin', isActive: false, position: 2 },
    ],
  });

  const sections = [
    { title: 'Meilleures ventes maquillage', slugs: ['huda-easy-bake', 'charlotte-airbrush', 'too-faced-chocolate', 'eclora-fluff-fix', 'kosas-cloud-set'] },
    { title: 'Nouveautés parfum', slugs: ['armani-stronger-with-you', 'dior-sauvage'] },
    { title: 'Tendances TikTok Beauté', slugs: ['huda-easy-bake', 'refy-lash-sculpt', 'kosas-cloud-set', 'laneige-lip-sleeping-mask'] },
  ];
  for (const [i, section] of sections.entries()) {
    await prisma.homeSection.create({
      data: {
        title: section.title,
        position: i + 1,
        products: { create: section.slugs.map((slug, j) => ({ productId: pid(slug).id, position: j })) },
      },
    });
  }

  await prisma.promoCode.createMany({
    data: [
      { code: 'BIENVENUE10', type: 'PERCENT', value: 10, minOrder: 5000, usedCount: 42 },
      { code: 'LIVRAISON0', type: 'FREE_SHIPPING', value: 0, minOrder: 8000, maxUses: 200, usedCount: 87, endsAt: new Date(now + 20 * DAY) },
      { code: 'RENTREE1000', type: 'FIXED', value: 1000, minOrder: 10000, maxUses: 100, usedCount: 100, isActive: false, endsAt: daysAgo(2) },
    ],
  });

  await prisma.storeSettings.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      storeName: 'Eclora',
      contactEmail: 'contact@eclora.dz',
      contactPhone: '0550 00 00 00',
      address: 'Hydra, Alger, Algérie',
      announcementText: 'Livraison gratuite dès 15 000 DA dans les 58 wilayas',
      freeShippingThreshold: 15000,
      payCod: true,
      payBaridimob: true,
      instagram: 'https://instagram.com/eclora.dz',
    },
    update: {},
  });

  console.log('Seed complete:');
  console.log(`  ${BRANDS.length} brands · ${CATEGORIES.length} categories · ${PRODUCTS.length} products`);
  console.log(`  ${CLIENTS.length} clients · 38 orders · ${reviews.length} reviews · ${WILAYAS.length} wilayas`);
  console.log('  admin@eclora.dz / admin123   support@eclora.dz / support123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
