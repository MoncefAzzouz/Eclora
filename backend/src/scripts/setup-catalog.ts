// Sets up the ECLORA catalogue structure: the 6 main categories with their
// subcategories, the brands with their logos, and starter delivery prices.
//
//   npm run catalog:setup              apply
//   npm run catalog:setup -- --dry-run show what would change
//
// Safe on the live shop and safe to re-run: it only creates what is missing and
// never deletes. Existing names, logos uploaded from the admin, and delivery
// prices are left as they are.
import { readFile, copyFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '../lib/prisma.js';
import { r2Storage, uploadObjectKey } from '../lib/r2.js';
import { WILAYAS } from '../lib/wilayas.js';

const dryRun = process.argv.includes('--dry-run');
const ASSETS = path.resolve(process.cwd(), 'assets/brands');
const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');

const slugify = (v: string) =>
  v.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const CATEGORIES: { name: string; slug: string; description: string; subs: string[] }[] = [
  {
    name: 'Skin Care',
    slug: 'skin-care',
    description: 'Soins du visage',
    subs: ['Nettoyants visage', 'Eaux micellaires', 'Sérums visage', 'Crèmes hydratantes', 'Soins anti-imperfections', 'Soins anti-âge', 'Protection solaire', 'Masques et exfoliants'],
  },
  {
    name: 'Body Care',
    slug: 'body-care',
    description: 'Soins du corps',
    subs: ['Gels douche', 'Savons', 'Déodorants et anti-transpirants', 'Laits et crèmes corporelles', 'Brumes corporelles (Body Mist)', 'Soins des mains et des pieds'],
  },
  {
    name: 'Hair Care',
    slug: 'hair-care',
    description: 'Soins capillaires',
    subs: ['Shampoings', 'Après-shampoings', 'Masques capillaires', 'Sérums et huiles capillaires', 'Crèmes sans rinçage', 'Sprays biphasés', 'Laques et sprays coiffants', 'Gels et produits coiffants'],
  },
  {
    name: 'Coloration & Technique',
    slug: 'coloration-technique',
    description: 'Coloration capillaire',
    subs: ['Colorations permanentes', 'Oxydants et révélateurs', 'Poudres décolorantes', 'Produits techniques de coloration'],
  },
  {
    name: 'Makeup',
    slug: 'makeup',
    description: 'Maquillage',
    subs: ['Teint', 'Yeux', 'Lèvres', 'Ongles', 'Accessoires de maquillage'],
  },
  {
    name: 'Men Care',
    slug: 'men-care',
    description: 'Soins pour hommes',
    subs: ['Rasage', 'Soins de la barbe', 'Déodorants homme', 'Soins visage et corps homme'],
  },
];

/** Display name → slug. The slug is the logo file name and the /marques/<slug> URL. */
export const BRANDS: [string, string][] = [
  ['GRACIAS', 'gracias'],
  ['AQUASOFT', 'aquasoft'],
  ['MARIGOLD', 'marigold'],
  ['MORFOSE', 'morfose'],
  ['AVÈNE', 'avene'],
  ['LA ROCHE-POSAY', 'la-roche-posay'],
  ['GARNIER', 'garnier'],
  ["L'ORÉAL ELSEVE", 'loreal-elseve'],
  ['BYPHASSE', 'byphasse'],
  ['DOVE', 'dove'],
  ['REXONA', 'rexona'],
  ['GILLETTE', 'gillette'],
  ['NIVEA', 'nivea'],
  ['MONSAVON', 'monsavon'],
  ["JOHNSON'S", 'johnsons'],
  ['TULIPÁN NEGRO', 'tulipan-negro'],
  ['KREME', 'kreme'],
  ['SANEX', 'sanex'],
  ['MAYBELLINE', 'maybelline'],
  ['KIKO MILANO', 'kiko-milano'],
  ['CAUDALIE', 'caudalie'],
  ['VICHY', 'vichy'],
  ['NUXE', 'nuxe'],
  ['GLISS', 'gliss'],
  ['ODESSA', 'odessa'],
];

/** Starter prices so checkout works before the first Yalidine sync replaces them. */
const ZONE_PRICES = {
  CENTER: [500, 350, '2-3 jours'],
  NORTH: [600, 400, '2-3 jours'],
  HIGHLANDS: [600, 400, '2-4 jours'],
  SOUTH: [1100, 800, '4-7 jours'],
} as const;

const log = (msg: string) => console.log(`${dryRun ? '[dry-run] ' : ''}${msg}`);

async function publishLogo(slug: string): Promise<string | null> {
  const source = path.join(ASSETS, `${slug}.png`);
  if (!existsSync(source)) return null;
  const filename = `brand-${slug}.png`;

  if (dryRun) return `/uploads/${filename}`;
  if (r2Storage) {
    const key = uploadObjectKey(filename);
    const exists = await r2Storage.client
      .send(new HeadObjectCommand({ Bucket: r2Storage.bucket, Key: key }))
      .then(() => true, () => false);
    if (!exists) {
      await r2Storage.client.send(
        new PutObjectCommand({
          Bucket: r2Storage.bucket,
          Key: key,
          Body: await readFile(source),
          ContentType: 'image/png',
          CacheControl: 'public, max-age=31536000, immutable',
        })
      );
      log(`  logo uploaded to R2: ${key}`);
    }
  } else {
    await mkdir(UPLOAD_DIR, { recursive: true });
    await copyFile(source, path.join(UPLOAD_DIR, filename));
  }
  return `/uploads/${filename}`;
}

async function main() {
  console.log(`Storage for logos: ${r2Storage ? `R2 bucket "${r2Storage.bucket}"` : 'local uploads/ folder'}`);

  // ─── Categories ───────────────────────────────────────────────────────────
  for (const [index, cat] of CATEGORIES.entries()) {
    let category = await prisma.category.findUnique({ where: { slug: cat.slug } });
    if (!category) {
      log(`+ category ${cat.name}`);
      if (!dryRun) {
        category = await prisma.category.create({
          data: { name: cat.name, slug: cat.slug, description: cat.description, position: index + 1, isVisible: true },
        });
      }
    } else if (!category.description) {
      if (!dryRun) await prisma.category.update({ where: { id: category.id }, data: { description: cat.description } });
    }

    for (const [subIndex, name] of cat.subs.entries()) {
      const slug = slugify(name);
      const exists = category && (await prisma.subcategory.findUnique({ where: { categoryId_slug: { categoryId: category.id, slug } } }));
      if (!exists) {
        log(`  + ${cat.name} › ${name}`);
        if (!dryRun && category) {
          await prisma.subcategory.create({ data: { name, slug, position: subIndex + 1, categoryId: category.id } });
        }
      }
    }
  }

  // ─── Brands ───────────────────────────────────────────────────────────────
  for (const [index, [name, slug]] of BRANDS.entries()) {
    const brand = await prisma.brand.findUnique({ where: { slug } });
    // Only fill the logo when there is none, or it is still the one this script set.
    const ownLogo = !brand?.logoUrl || brand.logoUrl === `/uploads/brand-${slug}.png`;
    const logoUrl = ownLogo ? await publishLogo(slug) : brand!.logoUrl;
    if (!logoUrl) log(`  ! no logo file for ${name} (assets/brands/${slug}.png) — add one from the admin`);

    if (!brand) {
      log(`+ brand ${name}${logoUrl ? '' : ' (no logo)'}`);
      if (!dryRun) await prisma.brand.create({ data: { name, slug, logoUrl, position: index + 1 } });
    } else if (ownLogo && logoUrl && brand.logoUrl !== logoUrl) {
      log(`~ brand ${name}: logo set`);
      if (!dryRun) await prisma.brand.update({ where: { id: brand.id }, data: { logoUrl } });
    }
  }

  // ─── Delivery ─────────────────────────────────────────────────────────────
  const rates = await prisma.shippingRate.count();
  if (rates === 0) {
    log(`+ ${WILAYAS.length} starter delivery prices (replace with "Synchroniser Yalidine" in the admin)`);
    if (!dryRun) {
      await prisma.shippingRate.createMany({
        data: WILAYAS.map((w) => {
          const [home, stopdesk, days] = ZONE_PRICES[w.zone];
          return { wilayaCode: w.code, wilayaName: w.name, homePrice: home, stopdeskPrice: stopdesk, deliveryDays: days, isActive: true };
        }),
      });
    }
  } else {
    console.log(`Delivery prices: ${rates} wilayas already configured, left unchanged.`);
  }

  console.log('Catalogue setup done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
