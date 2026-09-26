import type { Metadata } from 'next';
import './admin-theme.css';
import Providers from './providers';

export const metadata: Metadata = {
  title: "ECLORA Admin | Panneau d'Administration",
  description: "Panneau d'administration Eclora : commandes, catalogue, contenu de la boutique et livraison.",
  robots: { index: false, follow: false },
};

/**
 * Wraps every /admin route. `eclora-admin` swaps in the admin colour palette
 * (see admin-theme.css) without affecting the storefront.
 */
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="eclora-admin min-h-screen">
      <Providers>{children}</Providers>
    </div>
  );
}
