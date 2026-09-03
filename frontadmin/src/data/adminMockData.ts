export interface SubCategory {
  id: string;
  name: string;
  itemCount: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  badgeColor?: 'pink' | 'red' | 'default';
  isHighlighted?: boolean;
  subcategories: SubCategory[];
}

export interface Banner {
  id: string;
  type: 'hero' | 'promo-dual' | 'promo-middle';
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  buttonText: string;
  imageUrl: string;
  targetLink: string;
  isActive: boolean;
  position: number;
}

export interface MainPageSection {
  id: string;
  title: string;
  type: 'carousel' | 'banner-grid';
  assignedProductIds: string[];
  position: number;
  isVisible: boolean;
}

export interface OrderItem {
  id: string;
  title: string;
  brand: string;
  price: string;
  quantity: number;
  image: string;
  shade?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  shippingAddress: string;
  city: string;
  postalCode: string;
  country: string;
  status: 'En cours' | 'Expédié' | 'Livré' | 'En attente' | 'Annulé';
  items: OrderItem[];
  totalPrice: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  totalOrders: number;
  totalSpent: string;
  loyaltyTier: 'Classic' | 'Gold' | 'VIP';
  joinedDate: string;
  status: 'Actif' | 'Inactif';
}

export interface AdminProduct {
  id: string;
  brand: string;
  title: string;
  price: string;
  category: string;
  stock: number;
  image: string;
  badge?: string;
}

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Maquillage',
    slug: 'maquillage',
    subcategories: [
      { id: 'sub-1', name: 'Teint', itemCount: 420 },
      { id: 'sub-2', name: 'Yeux', itemCount: 310 },
      { id: 'sub-3', name: 'Lèvres', itemCount: 280 },
      { id: 'sub-4', name: 'Palettes', itemCount: 95 },
      { id: 'sub-5', name: 'Pinceaux & Accessoires', itemCount: 140 },
    ],
  },
  {
    id: 'cat-2',
    name: 'Parfum',
    slug: 'parfum',
    subcategories: [
      { id: 'sub-6', name: 'Parfum femme', itemCount: 520 },
      { id: 'sub-7', name: 'Parfum homme', itemCount: 380 },
      { id: 'sub-8', name: 'Coffrets Parfum', itemCount: 180 },
      { id: 'sub-9', name: 'Notes olfactives', itemCount: 110 },
    ],
  },
  {
    id: 'cat-3',
    name: 'Soin Visage',
    slug: 'soin-visage',
    subcategories: [
      { id: 'sub-10', name: 'Nettoyant & Démaquillant', itemCount: 190 },
      { id: 'sub-11', name: 'Sérum & Traitement', itemCount: 240 },
      { id: 'sub-12', name: 'Crème de jour', itemCount: 160 },
    ],
  },
  {
    id: 'cat-4',
    name: 'Eclora Collection',
    slug: 'eclora-collection',
    badgeColor: 'pink',
    isHighlighted: true,
    subcategories: [
      { id: 'sub-13', name: 'Meilleurs Prix', itemCount: 85 },
      { id: 'sub-14', name: 'Soins Verts', itemCount: 60 },
    ],
  },
  {
    id: 'cat-5',
    name: 'Dernière chance -40%',
    slug: 'derniere-chance',
    badgeColor: 'red',
    isHighlighted: true,
    subcategories: [
      { id: 'sub-15', name: 'Ventes Flash', itemCount: 45 },
    ],
  },
];

export const INITIAL_BANNERS: Banner[] = [
  {
    id: 'ban-hero-1',
    type: 'hero',
    title: 'Dior',
    subtitle: 'Campagne Miss Dior',
    description: 'Miss Dior Eau de Parfum, la nouvelle icône couture aux notes vanillées et sensuelles.',
    buttonText: 'Découvrir',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1800&q=85',
    targetLink: '/product/dior-sauvage',
    isActive: true,
    position: 1,
  },
  {
    id: 'ban-promo-1',
    type: 'promo-dual',
    title: 'Exclusivité web',
    subtitle: 'Jusqu\'à -30%',
    description: 'sur une sélection de produits*. Offre fidélité en Algérie.',
    buttonText: 'Découvrir',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    targetLink: '/shop/maquillage',
    isActive: true,
    position: 2,
  },
  {
    id: 'ban-promo-2',
    type: 'promo-dual',
    title: 'Place au renouveau',
    description: 'Préparez-vous à une nouvelle saison beauté avec nos favoris.',
    buttonText: 'Découvrir',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80',
    targetLink: '/shop/soin-visage',
    isActive: true,
    position: 3,
  },
  {
    id: 'ban-middle-1',
    type: 'promo-middle',
    title: 'Plus qu\'un parfum, une émotion',
    description: 'Senteurs fruitées, florales ou chaleureuses à votre image.',
    buttonText: 'Découvrir',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
    targetLink: '/shop/parfum',
    isActive: true,
    position: 4,
  },
];

export const INITIAL_MAIN_PAGE_SECTIONS: MainPageSection[] = [
  {
    id: 'sec-1',
    title: 'Meilleures ventes maquillage',
    type: 'carousel',
    assignedProductIds: ['huda-easy-bake', 'charlotte-airbrush', 'too-faced-chocolate', 'onesize-dawn', 'eclora-fluff-fix', 'mario-softsculpt'],
    position: 1,
    isVisible: true,
  },
  {
    id: 'sec-2',
    title: 'Derniers meileurs',
    type: 'carousel',
    assignedProductIds: ['armani-stronger-with-you', 'dior-sauvage', 'merit-flush-balm', 'sol-de-janeiro-leite', 'dior-homme-intense', 'jpg-le-male'],
    position: 2,
    isVisible: true,
  },
  {
    id: 'sec-3',
    title: 'Tendances TikTok Beauté',
    type: 'carousel',
    assignedProductIds: ['huda-easy-bake', 'sol-de-janeiro-leite', 'refy-lash-sculpt', 'kosas-cloud-set'],
    position: 3,
    isVisible: true,
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: '#ORD-9842',
    clientName: 'Amina Benali',
    clientPhone: '+213 550 12 34 56',
    clientEmail: 'amina.benali@gmail.com',
    shippingAddress: '15 Rue Didouche Mourad',
    city: 'Alger',
    postalCode: '16000',
    country: 'Algérie',
    status: 'Expédié',
    totalPrice: '27 300 DA',
    createdAt: '03 Sept 2026 14:15',
    items: [
      {
        id: 'huda-easy-bake',
        title: 'Easy Bake Loose Baking Powder',
        brand: 'HUDA BEAUTY',
        price: '8 500 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
        shade: 'Pound Cake (20 g)',
      },
      {
        id: 'dior-sauvage',
        title: 'Sauvage Eau de Parfum',
        brand: 'DIOR',
        price: '18 800 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'ord-102',
    orderNumber: '#ORD-9843',
    clientName: 'Karim Mansouri',
    clientPhone: '+213 661 98 76 54',
    clientEmail: 'karim.mansouri@gmail.com',
    shippingAddress: '42 Boulevard de la Soummam',
    city: 'Oran',
    postalCode: '31000',
    country: 'Algérie',
    status: 'En cours',
    totalPrice: '16 800 DA',
    createdAt: '03 Sept 2026 11:40',
    items: [
      {
        id: 'armani-stronger-with-you',
        title: 'Stronger with You Intensely',
        brand: 'ARMANI',
        price: '16 800 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'ord-103',
    orderNumber: '#ORD-9844',
    clientName: 'Sarah Khelifi',
    clientPhone: '+213 770 45 89 12',
    clientEmail: 'sarah.khelifi@yahoo.fr',
    shippingAddress: '8 Avenue Aouati Mostefa',
    city: 'Constantine',
    postalCode: '25000',
    country: 'Algérie',
    status: 'Livré',
    totalPrice: '11 500 DA',
    createdAt: '02 Sept 2026 18:25',
    items: [
      {
        id: 'charlotte-airbrush',
        title: 'Airbrush Flawless Setting Spray',
        brand: 'CHARLOTTE TILBURY',
        price: '8 500 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'eclora-fluff-fix',
        title: 'FLUFF & FIX BROW WAX',
        brand: 'ECLORA COLLECTION',
        price: '3 000 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    id: 'ord-104',
    orderNumber: '#ORD-9845',
    clientName: 'Yassine Belkacem',
    clientPhone: '+213 555 22 11 44',
    clientEmail: 'yassine.belkacem@gmail.com',
    shippingAddress: '29 Rue de la Liberté',
    city: 'Sétif',
    postalCode: '19000',
    country: 'Algérie',
    status: 'En attente',
    totalPrice: '21 500 DA',
    createdAt: '01 Sept 2026 09:15',
    items: [
      {
        id: 'dior-homme-intense',
        title: 'Dior Homme Intense Eau de Parfum',
        brand: 'DIOR',
        price: '21 500 DA',
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

export const INITIAL_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Amina Benali',
    email: 'amina.benali@gmail.com',
    phone: '+213 550 12 34 56',
    city: 'Alger',
    country: 'Algérie',
    totalOrders: 14,
    totalSpent: '142 000 DA',
    loyaltyTier: 'VIP',
    joinedDate: '12 Jan 2025',
    status: 'Actif',
  },
  {
    id: 'cli-2',
    name: 'Karim Mansouri',
    email: 'karim.mansouri@gmail.com',
    phone: '+213 661 98 76 54',
    city: 'Oran',
    country: 'Algérie',
    totalOrders: 6,
    totalSpent: '64 000 DA',
    loyaltyTier: 'Gold',
    joinedDate: '04 Mars 2025',
    status: 'Actif',
  },
  {
    id: 'cli-3',
    name: 'Sarah Khelifi',
    email: 'sarah.khelifi@yahoo.fr',
    phone: '+213 770 45 89 12',
    city: 'Constantine',
    country: 'Algérie',
    totalOrders: 9,
    totalSpent: '92 500 DA',
    loyaltyTier: 'Gold',
    joinedDate: '19 Mai 2025',
    status: 'Actif',
  },
  {
    id: 'cli-4',
    name: 'Yassine Belkacem',
    email: 'yassine.belkacem@gmail.com',
    phone: '+213 555 22 11 44',
    city: 'Sétif',
    country: 'Algérie',
    totalOrders: 3,
    totalSpent: '45 000 DA',
    loyaltyTier: 'Classic',
    joinedDate: '11 Aoû 2025',
    status: 'Actif',
  },
];

export const INITIAL_PRODUCTS: AdminProduct[] = [
  {
    id: 'huda-easy-bake',
    brand: 'HUDA BEAUTY',
    title: 'Easy Bake Loose Baking & Setting Powder',
    price: '8 500 DA',
    category: 'Maquillage',
    stock: 148,
    badge: 'Exclu',
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'charlotte-airbrush',
    brand: 'CHARLOTTE TILBURY',
    title: 'Airbrush Flawless Finish Setting Spray',
    price: '5 200 DA',
    category: 'Maquillage',
    stock: 92,
    badge: 'Best seller',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'armani-stronger-with-you',
    brand: 'ARMANI',
    title: 'Stronger with You Intensely Eau de Parfum',
    price: '16 800 DA',
    category: 'Parfum',
    stock: 64,
    badge: 'Offre fidélité web',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'dior-sauvage',
    brand: 'DIOR',
    title: 'Sauvage Eau de parfum pour homme',
    price: '19 500 DA',
    category: 'Parfum',
    stock: 110,
    badge: 'Gravure',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=600&q=80',
  },
];
