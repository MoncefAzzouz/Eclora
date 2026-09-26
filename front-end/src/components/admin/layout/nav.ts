import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  FolderTree,
  Tag,
  Star,
  Image as ImageIcon,
  SlidersHorizontal,
  TicketPercent,
  Truck,
  Settings,
} from 'lucide-react';
import type { AdminRole } from '@/types/admin';

export type AlertKey = 'pendingOrders' | 'pendingReviews' | 'outOfStock';

export interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: AlertKey;
  roles?: AdminRole[];
}

const ALL: AdminRole[] = ['OWNER', 'ADMIN', 'EDITOR', 'SUPPORT'];
const MANAGERS: AdminRole[] = ['OWNER', 'ADMIN'];
const CATALOG: AdminRole[] = ['OWNER', 'ADMIN', 'EDITOR'];
const SALES: AdminRole[] = ['OWNER', 'ADMIN', 'SUPPORT'];

export const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Général',
    items: [{ href: '/admin/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ALL }],
  },
  {
    title: 'Ventes',
    items: [
      { href: '/admin/orders', label: 'Commandes', icon: ShoppingBag, badge: 'pendingOrders', roles: SALES },
      { href: '/admin/clients', label: 'Clients', icon: Users, roles: SALES },
      { href: '/admin/reviews', label: 'Avis clients', icon: Star, badge: 'pendingReviews', roles: [...SALES, 'EDITOR'] },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { href: '/admin/products', label: 'Produits', icon: Package, badge: 'outOfStock', roles: CATALOG },
      { href: '/admin/categories', label: 'Catégories', icon: FolderTree, roles: CATALOG },
      { href: '/admin/brands', label: 'Marques', icon: Tag, roles: CATALOG },
    ],
  },
  {
    title: 'Boutique',
    items: [
      { href: '/admin/homepage', label: "Page d'accueil", icon: SlidersHorizontal, roles: CATALOG },
      { href: '/admin/banners', label: 'Bannières', icon: ImageIcon, roles: CATALOG },
      { href: '/admin/promo-codes', label: 'Codes promo', icon: TicketPercent, roles: CATALOG },
      { href: '/admin/delivery', label: 'Livraison', icon: Truck, roles: MANAGERS },
      { href: '/admin/settings', label: 'Paramètres', icon: Settings, roles: MANAGERS },
    ],
  },
];

export function canAccess(pathname: string, role: AdminRole): boolean {
  const item = NAV_GROUPS.flatMap((g) => g.items).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return !item?.roles || item.roles.includes(role);
}

export function titleFor(pathname: string): string {
  const item = NAV_GROUPS.flatMap((g) => g.items).find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));
  return item?.label ?? 'Eclora Admin';
}
