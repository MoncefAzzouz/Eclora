import React from 'react';
import PanierPage from '@/components/PanierPage';

export const metadata = {
  title: 'Mon Panier | ECLORA',
  description: 'Consultez et validez les articles de votre panier sur Eclora.',
};

export default function CartRoutePage() {
  return <PanierPage />;
}
