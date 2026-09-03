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
  unitPrice?: string;
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
  { name: 'ANASTASIA BEVERLY HILLS', count: 56 },
  { name: 'CHARLOTTE TILBURY', count: 42 },
  { name: 'COLOR WOW', count: 18 },
  { name: 'DIOR', count: 68 },
  { name: 'ECLORA COLLECTION', count: 124 },
  { name: 'FENTY BEAUTY', count: 53 },
  { name: 'HUDA BEAUTY', count: 39 },
  { name: 'KOSAS', count: 18 },
  { name: 'LANEIGE', count: 24 },
  { name: 'ONESIZE', count: 12 },
  { name: 'REFY', count: 14 },
  { name: 'TARTE', count: 35 },
  { name: 'TOO FACED', count: 31 },
];

export const HUDA_EASY_BAKE_PRODUCT: Product = {
  id: 'huda-easy-bake',
  brand: 'HUDA BEAUTY',
  title: 'Easy Bake Loose Baking & Setting Powder - Poudre Libre',
  subtitle: 'Pound Cake',
  volume: '20 g',
  price: '8 500 DA',
  unitPrice: '425 DA / 100g',
  rating: 4.8,
  reviewsCount: 12805,
  badge: 'Nouveauté',
  badgeType: 'black',
  shadeInfo: 'Ce produit existe en plusieurs teintes',
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
    'Même formule, nouveau look. Poudre libre iconique baking & setting aux pigments ultra-fins pour un fini mat flouté toute la journée.',
  usageTips:
    'Appliquez une couche généreuse de poudre sous les yeux et sur la zone T à l\'aide d\'une houppette.',
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
      text: "Meilleure poudre libre au monde, elle floute et matifie tout au long de la journée !",
      recommended: true,
      helpfulCount: 1,
      unhelpfulCount: 0,
    },
  ],
};

export const SHOP_PRODUCTS: Product[] = [
  {
    id: 'color-wow-money',
    brand: 'COLOR WOW',
    title: 'Money Laundering Après-shampoing B...',
    subtitle: '250 ml',
    volume: '250 ml',
    price: '7 200 DA',
    unitPrice: '2 880 DA / 100ml',
    rating: 5,
    reviewsCount: 220,
    badge: 'Nouveauté',
    category: 'soin',
    image: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'laneige-lip-sleeping-mask',
    brand: 'LANEIGE',
    title: 'Lip Sleeping Mask Smoothie Açaï...',
    subtitle: 'Smoothie Açaï...',
    volume: '20 g',
    price: '5 400 DA',
    unitPrice: '27 000 DA / 100g',
    rating: 5,
    reviewsCount: 5978,
    badge: 'Nouveauté',
    category: 'soin',
    image: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'eclora-stretch-mascara',
    brand: 'ECLORA COLLECTION',
    title: "IT'S A STRETCH Mascara tubing volume et longueur",
    subtitle: '00 Ultra black (8 ml)',
    volume: '8 ml',
    price: '3 200 DA',
    unitPrice: '40 000 DA / 100ml',
    rating: 5,
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
    volume: '10 ml',
    price: '5 300 DA',
    unitPrice: '53 000 DA / 100ml',
    rating: 5,
    reviewsCount: 1328,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 2 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'kosas-cloud-set',
    brand: 'KOSAS',
    title: 'Cloud Set Loose Skin-Tone Poudre libre fixante',
    subtitle: 'Translucent Sway (20 g)',
    volume: '20 g',
    price: '8 500 DA',
    unitPrice: '42 500 DA / 100g',
    rating: 5,
    reviewsCount: 230,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 5 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1608248597349-4c6328318182?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'tarte-cc-serum',
    brand: 'TARTE',
    title: 'CC Color-Correcting Tinted Serum Correcteur',
    subtitle: 'light (55 ml)',
    volume: '55 ml',
    price: '8 500 DA',
    unitPrice: '15 450 DA / 100ml',
    rating: 5,
    reviewsCount: 44,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 6 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dior-forever-set-powder',
    brand: 'DIOR',
    title: 'Dior Forever On Set Powder Poudre libre fixatrice',
    subtitle: '00 Translucent (20 g)',
    volume: '20 g',
    price: '13 500 DA',
    unitPrice: '67 500 DA / 100g',
    rating: 5,
    reviewsCount: 59,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 5 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'refy-watercolour-blush',
    brand: 'REFY',
    title: 'Watercolour Blush Fard à joues liquide léger',
    subtitle: 'Apricot (7 g)',
    volume: '7 g',
    price: '4 800 DA',
    unitPrice: '68 500 DA / 100g',
    rating: 5,
    reviewsCount: 20,
    badge: 'Nouveauté',
    shadeInfo: 'Existe en 3 teintes',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'rem-beauty-blur-butter',
    brand: 'REM BEAUTY',
    title: 'Blur Butter - Baume à lèvres nourrissant',
    subtitle: 'dusty pink (3 g)',
    volume: '3 g',
    price: '5 900 DA',
    rating: 5,
    reviewsCount: 193,
    badge: 'Nouveauté',
    category: 'maquillage',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
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
    title: 'Stronger with You Intensely Eau de Parfum',
    price: '16 800 DA',
    originalPrice: '24 000 DA',
    unitPrice: '16 800 DA / 100ml',
    rating: 5,
    reviewsCount: 535,
    badge: 'Offre fidélité web',
    category: 'parfum',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dior-sauvage',
    brand: 'DIOR',
    title: 'Sauvage Eau de parfum pour homme',
    price: '19 500 DA',
    originalPrice: '36 000 DA',
    unitPrice: '19 500 DA / 100ml',
    rating: 5,
    reviewsCount: 1848,
    badge: 'Gravure',
    category: 'parfum',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
  },
];

export function getProductById(id: string): Product {
  const found = [...BEST_SELLERS, ...NEW_LAUNCHES, ...SHOP_PRODUCTS].find((p) => p.id === id);
  if (found) return found;
  return HUDA_EASY_BAKE_PRODUCT;
}
