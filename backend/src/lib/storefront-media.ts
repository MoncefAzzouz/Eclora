import { copyFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BACKEND_ROOT = path.resolve(fileURLToPath(new URL('../..', import.meta.url)));
const SOURCE_DIR = path.resolve(BACKEND_ROOT, '../front-end/public/images');
const UPLOAD_DIR = path.resolve(BACKEND_ROOT, 'uploads');

interface StorefrontMediaFile {
  source: string;
  filename: string;
}

export const PRODUCT_MEDIA: StorefrontMediaFile[] = [
  { source: 'image.png', filename: 'eclora-product-01.png' },
  { source: 'image copy.png', filename: 'eclora-product-02.png' },
  { source: 'image copy 2.png', filename: 'eclora-product-03.png' },
  { source: 'image copy 3.png', filename: 'eclora-product-04.png' },
  { source: 'image copy 4.png', filename: 'eclora-product-05.png' },
  { source: 'image copy 5.png', filename: 'eclora-product-06.png' },
  { source: 'image copy 6.png', filename: 'eclora-product-07.png' },
  { source: 'image copy 7.png', filename: 'eclora-product-08.png' },
  { source: 'image copy 8.png', filename: 'eclora-product-09.png' },
  { source: 'image copy 9.png', filename: 'eclora-product-10.png' },
];

export const BANNER_MEDIA = {
  heroPrimary: { source: '2.png', filename: 'eclora-hero-01.png' },
  heroSecondary: { source: '3.png', filename: 'eclora-hero-02.png' },
  renewal: { source: 'image copy 11.png', filename: 'eclora-promo-renouveau.png' },
  exclusive: { source: 'image copy 12.png', filename: 'eclora-promo-exclusivite.png' },
  fragrance: { source: 'image copy 13.png', filename: 'eclora-promo-parfum.png' },
  skincare: { source: 'image copy 10.png', filename: 'eclora-promo-soin.png' },
} satisfies Record<string, StorefrontMediaFile>;

const publicUrl = (media: StorefrontMediaFile) => `/uploads/${media.filename}`;

export const productImageUrl = (index: number) => publicUrl(PRODUCT_MEDIA[index % PRODUCT_MEDIA.length]!);

export const BANNER_URLS = {
  heroPrimary: publicUrl(BANNER_MEDIA.heroPrimary),
  heroSecondary: publicUrl(BANNER_MEDIA.heroSecondary),
  renewal: publicUrl(BANNER_MEDIA.renewal),
  exclusive: publicUrl(BANNER_MEDIA.exclusive),
  fragrance: publicUrl(BANNER_MEDIA.fragrance),
  skincare: publicUrl(BANNER_MEDIA.skincare),
};

/**
 * Copies the approved storefront artwork into the same upload directory used
 * by the admin. Database records can therefore be edited or replaced later
 * from the normal product and banner screens.
 */
export async function syncStorefrontMediaFiles() {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const files = [...PRODUCT_MEDIA, ...Object.values(BANNER_MEDIA)];
  await Promise.all(files.map((media) => copyFile(path.join(SOURCE_DIR, media.source), path.join(UPLOAD_DIR, media.filename))));
  return files.length;
}
