export interface Shade {
  id: string;
  name: string;
  hex: string;
  volume: string;
}

export interface ReviewItem {
  id: string;
  author: string;
  ageGroup: string;
  isVerified: boolean;
  userDuration?: string;
  rating: number;
  date: string;
  title: string;
  text: string;
  recommended: boolean;
  helpfulCount: number;
  unhelpfulCount: number;
}

export interface Product {
  id: string;
  brand: string;
  title: string;
  subtitle?: string;
  volume?: string;
  price: string;
  originalPrice?: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  badgeType?: 'black' | 'pink' | 'red' | 'gold';
  tags?: string[];
  image: string;
  images?: string[];
  shadeInfo?: string;
  shades?: Shade[];
  category: 'maquillage' | 'parfum' | 'soin';
  subcategory?: string;
  isBestSeller?: boolean;
  isNew?: boolean;
  description?: string;
  usageTips?: string;
  testResults?: string;
  ingredients?: string;
  reviews?: ReviewItem[];
}

export interface BrandFilterItem {
  name: string;
  count: number;
}

export const SHOP_BRANDS: BrandFilterItem[] = [
  { name: 'A-DERMA', count: 1 },
  { name: 'AIME', count: 1 },
  { name: 'ANASTASIA BEVERLY HILLS', count: 56 },
  { name: 'ANUA', count: 1 },
  { name: 'ARMANI', count: 27 },
  { name: 'AUGUSTINUS BADER', count: 2 },
  { name: 'AVENE', count: 7 },
  { name: 'BEAUTYBLENDER', count: 6 },
  { name: 'CHARLOTTE TILBURY', count: 42 },
  { name: 'DIOR', count: 68 },
  { name: 'ECLORA COLLECTION', count: 124 },
  { name: 'FENTY BEAUTY', count: 53 },
  { name: 'HUDA BEAUTY', count: 39 },
  { name: 'KOSAS', count: 18 },
  { name: 'REFY', count: 14 },
  { name: 'TOO FACED', count: 31 },
];

export const HUDA_EASY_BAKE_PRODUCT: Product = {
  id: 'huda-easy-bake',
  brand: 'HUDA BEAUTY',
  title: 'Easy Bake Loose Baking & Setting Powder - Poudre Libre',
  subtitle: 'Pound Cake',
  volume: '20 g',
  price: '8 500 DA',
  rating: 4.8,
  reviewsCount: 12805,
  badge: 'Exclu',
  badgeType: 'black',
  shadeInfo: 'Ce produit existe en plusieurs teintes :',
  category: 'maquillage',
  subcategory: 'Teint',
  isBestSeller: true,
  image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
  images: [
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1608248597349-4c6328318182?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=800&q=80',
  ],
  shades: [
    { id: 'pound-cake', name: 'Pound Cake (20 g)', hex: '#f2d2b6', volume: '20 g' },
    { id: 'sugar-cookie', name: 'Sugar Cookie (20 g)', hex: '#f7f4ed', volume: '20 g' },
    { id: 'cupcake', name: 'Cupcake (20 g)', hex: '#fce3e7', volume: '20 g' },
    { id: 'banana-bread', name: 'Banana Bread (20 g)', hex: '#ebd09e', volume: '20 g' },
    { id: 'blondie', name: 'Blondie (20 g)', hex: '#dfb788', volume: '20 g' },
  ],
  description:
    'Même formule, nouveau look. Vous pouvez recevoir l\'ancien ou le nouvel emballage, les deux contiennent la même poudre iconique baking & setting aux pigments ultra-fins.',
  usageTips:
    'Appliquez une couche généreuse de poudre sous les yeux, sur la zone T, les contours du nez et le menton à l\'aide d\'une éponge ou d\'une houpette.',
  reviews: [
    {
      id: 'rev-1',
      author: 'Amina (Alger)',
      ageGroup: '18-24 ans',
      isVerified: true,
      userDuration: 'Utilise ce produit depuis 1 an et plus',
      rating: 5,
      date: '03 sept. 2026',
      title: "Huda je t'aime !!",
      text: "Meilleure poudre libre au monde, elle floute elle matifie et même après mes longues journées à Alger ! Mon teint reste impeccable sans s'assécher.",
      recommended: true,
      helpfulCount: 1,
      unhelpfulCount: 0,
    },
  ],
};

export const SHOP_PRODUCTS: Product[] = [
  {
    id: 'eclora-stretch-mascara',
    brand: 'ECLORA COLLECTION',
    title: "IT'S A STRETCH Mascara tubing volume et longueur",
    subtitle: '00 Ultra black (8 ml)',
    price: '3 200 DA',
    rating: 4.8,
    reviewsCount: 384,
    badge: 'Nouveauté',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'refy-lash-sculpt',
    brand: 'REFY',
    title: 'Lash Sculpt Mascara liftant et allongeant',
    subtitle: 'Nero (10 ml)',
    price: '5 300 DA',
    rating: 4.7,
    reviewsCount: 1328,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 2 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kosas-cloud-set',
    brand: 'KOSAS',
    title: 'Cloud Set Loose Skin-Tone Poudre libre fixante et translucide',
    subtitle: 'Translucent Sway (20 g)',
    price: 'À partir de 8 500 DA',
    rating: 4.9,
    reviewsCount: 230,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 5 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1608248597349-4c6328318182?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tarte-cc-serum',
    brand: 'TARTE',
    title: 'CC Color-Correcting Tinted Serum Sérum teinté correcteur de couleur',
    subtitle: 'light (55 ml)',
    price: '8 500 DA',
    rating: 4.7,
    reviewsCount: 44,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 6 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dior-forever-set-powder',
    brand: 'DIOR',
    title: 'Dior Forever On Set Powder Poudre libre fixatrice fini mat floutant i...',
    subtitle: '00 Translucent (20 g)',
    price: '13 500 DA',
    rating: 4.9,
    reviewsCount: 59,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 5 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'refy-watercolour-blush',
    brand: 'REFY',
    title: 'Watercolour Blush Fard à joues liquide léger à base d\'eau',
    subtitle: 'Apricot (7 g)',
    price: '4 800 DA',
    rating: 4.6,
    reviewsCount: 20,
    shadeInfo: 'Existe en 3 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rem-beauty-blur-butter',
    brand: 'REM BEAUTY',
    title: 'Blur Butter - Baume à lèvres',
    subtitle: 'dusty pink (3 g)',
    price: '5 900 DA',
    rating: 4.8,
    reviewsCount: 193,
    shadeInfo: 'Existe en 6 formats',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'fenty-diamond-bomb',
    brand: 'FENTY BEAUTY',
    title: 'Midnight Diamonds All-Over Diamond Veil - Illuminateur d...',
    subtitle: 'How Many Carats ?! (8 g)',
    price: '8 500 DA',
    rating: 4.9,
    reviewsCount: 3,
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=600&q=80',
  },
];

export const BEST_SELLERS: Product[] = [
  HUDA_EASY_BAKE_PRODUCT,
  ...SHOP_PRODUCTS,
];

export const NEW_LAUNCHES: Product[] = [
  {
    id: 'armani-stronger-with-you',
    brand: 'ARMANI',
    title: 'Stronger with You Intensely Eau de Parfum ambrée boisée',
    price: 'À partir de 16 800 DA',
    originalPrice: 'Prix d\'origine : 24 000 DA',
    rating: 4.9,
    reviewsCount: 535,
    badge: 'Offre fidélité web',
    shadeInfo: 'Existe en 3 formats',
    category: 'parfum',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dior-sauvage',
    brand: 'DIOR',
    title: 'Sauvage Eau de parfum pour homme',
    price: 'À partir de 19 500 DA',
    originalPrice: 'Prix d\'origine : 36 000 DA',
    rating: 4.9,
    reviewsCount: 1848,
    badge: 'Gravure',
    shadeInfo: 'Existe en 6 formats',
    category: 'parfum',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
  },
];

export function getProductById(id: string): Product {
  const found = [...BEST_SELLERS, ...NEW_LAUNCHES, ...SHOP_PRODUCTS].find((p) => p.id === id);
  if (found) return found;
  return HUDA_EASY_BAKE_PRODUCT;
}
