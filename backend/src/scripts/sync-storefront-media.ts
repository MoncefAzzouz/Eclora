import 'dotenv/config';
import type { BannerPlacement, Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { BANNER_URLS, productImageUrl, syncStorefrontMediaFiles } from '../lib/storefront-media.js';

const PRODUCT_SLUGS = [
  'huda-easy-bake',
  'charlotte-airbrush',
  'armani-stronger-with-you',
  'dior-sauvage',
  'color-wow-money',
  'laneige-lip-sleeping-mask',
  'eclora-stretch-mascara',
  'eclora-fluff-fix',
  'refy-lash-sculpt',
  'kosas-cloud-set',
  'tarte-cc-serum',
  'dior-forever-set-powder',
  'refy-watercolour-blush',
  'rem-beauty-blur-butter',
  'too-faced-chocolate',
  'fenty-gloss-bomb',
];

type ManagedBanner = Omit<Prisma.BannerCreateInput, 'position'> & { position: number };

const MANAGED_BANNERS: ManagedBanner[] = [
  {
    placement: 'HERO',
    title: 'Beauty, in every form.',
    subtitle: 'The Eclora edit',
    description: 'Makeup, skincare, hair, fragrance — discover iconic favourites and the emerging brands worth knowing.',
    buttonText: 'Explore Eclora',
    imageUrl: BANNER_URLS.heroPrimary,
    link: '/shop/maquillage',
    isActive: true,
    position: 1,
  },
  {
    placement: 'HERO',
    title: 'Une nouvelle saison beauté',
    subtitle: 'Gracias Premium',
    description: 'Découvrez une sélection colorée de soins et de parfums pour votre nouvelle routine.',
    buttonText: 'Découvrir',
    imageUrl: BANNER_URLS.heroSecondary,
    link: '/shop/nouveautes',
    isActive: true,
    position: 2,
  },
  {
    placement: 'PROMO_DUAL',
    title: 'Exclusivité web',
    subtitle: "Jusqu'à -30%",
    description: 'sur une sélection de produits*.',
    buttonText: 'Découvrir',
    imageUrl: BANNER_URLS.exclusive,
    link: '/shop/maquillage',
    isActive: true,
    position: 1,
  },
  {
    placement: 'PROMO_DUAL',
    title: 'Place au renouveau',
    description: 'Préparez-vous à une nouvelle saison beauté avec nos favoris.',
    buttonText: 'Découvrir',
    imageUrl: BANNER_URLS.renewal,
    link: '/shop/soin',
    isActive: true,
    position: 2,
  },
  {
    placement: 'PROMO_MIDDLE',
    title: "Plus qu'un parfum, une émotion",
    description: 'Senteurs fruitées, florales ou chaleureuses à votre image.',
    buttonText: 'Découvrir',
    imageUrl: BANNER_URLS.fragrance,
    link: '/shop/parfum',
    isActive: true,
    position: 1,
  },
];

async function upsertManagedBanner(input: ManagedBanner) {
  const existing = await prisma.banner.findFirst({
    where: { placement: input.placement as BannerPlacement, position: input.position },
    orderBy: { id: 'asc' },
  });

  if (existing) {
    await prisma.banner.update({ where: { id: existing.id }, data: input });
    return;
  }

  await prisma.banner.create({ data: input });
}

async function main() {
  const copied = await syncStorefrontMediaFiles();

  const productUpdates = PRODUCT_SLUGS.map((slug, index) =>
    prisma.product.updateMany({ where: { slug }, data: { images: [productImageUrl(index)] } })
  );
  const productResults = await prisma.$transaction(productUpdates);
  const updatedProducts = productResults.reduce((sum, result) => sum + result.count, 0);

  for (const banner of MANAGED_BANNERS) await upsertManagedBanner(banner);

  console.log(`Storefront media synced: ${copied} files, ${updatedProducts} products, ${MANAGED_BANNERS.length} banners.`);
  console.log('The records are now visible and editable in the admin panel.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
