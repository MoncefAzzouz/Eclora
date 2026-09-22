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
import type { AdminRole } from '@/types';

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
    items: [{ href: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard, roles: ALL }],
  },
  {
    title: 'Ventes',
    items: [
      { href: '/orders', label: 'Commandes', icon: ShoppingBag, badge: 'pendingOrders', roles: SALES },
      { href: '/clients', label: 'Clients', icon: Users, roles: SALES },
      { href: '/reviews', label: 'Avis clients', icon: Star, badge: 'pendingReviews', roles: [...SALES, 'EDITOR'] },
    ],
  },
  {
    title: 'Catalogue',
    items: [
      { href: '/products', label: 'Produits', icon: Package, badge: 'outOfStock', roles: CATALOG },
      { href: '/categories', label: 'Catégories', icon: FolderTree, roles: CATALOG },
      { href: '/brands', label: 'Marques', icon: Tag, roles: CATALOG },
    ],
  },
  {
    title: 'Boutique',
    items: [
      { href: '/homepage', label: "Page d'accueil", icon: SlidersHorizontal, roles: CATALOG },
      { href: '/banners', label: 'Bannières', icon: ImageIcon, roles: CATALOG },
      { href: '/promo-codes', label: 'Codes promo', icon: TicketPercent, roles: CATALOG },
      { href: '/delivery', label: 'Livraison', icon: Truck, roles: MANAGERS },
      { href: '/settings', label: 'Paramètres', icon: Settings, roles: MANAGERS },
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
