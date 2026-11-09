'use client';

import React from 'react';
import Link from 'next/link';
import ShopShell from '@/components/ShopShell';
import { formatDA, shopApi } from '@/lib/shop/api';
import { useAsyncData } from '@/lib/useAsyncData';

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-b border-gray-200 py-8">
      <h2 className="text-xl font-black">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-gray-700">{children}</div>
    </section>
  );
}

export default function HelpPage() {
  const { data: settings } = useAsyncData(() => shopApi.settings());
  const threshold = settings?.freeShippingThreshold ?? 0;

  return (
    <ShopShell>
      <div className="mx-auto max-w-3xl px-4 pb-24 pt-8 sm:px-6">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Aide</h1>

        <Section id="livraison" title="Livraison">
          <p>
            Nous livrons dans toute l’Algérie avec <strong>Yalidine</strong>, au choix à votre domicile ou dans le bureau Yalidine de votre choix
            (moins cher).
          </p>
          <p>
            Les frais dépendent de votre wilaya et de votre commune. Ils s’affichent avant la validation de la commande, avec le montant total à payer.
            {threshold > 0 && <> La livraison est <strong>offerte dès {formatDA(threshold)} d’achats</strong>.</>}
          </p>
          <p>
            Après votre commande, nous vous appelons pour la confirmer puis l’expédions. Vous pouvez la suivre à tout moment sur{' '}
            <Link href="/suivi" className="font-bold underline">Suivre ma commande</Link>.
          </p>
        </Section>

        <Section id="paiement" title="Paiement">
          <p>Vous payez <strong>en espèces à la livraison</strong>, au livreur ou au bureau Yalidine. Le montant est celui affiché à la commande, livraison comprise.</p>
        </Section>

        <Section id="retours" title="Retours">
          <p>Un produit abîmé ou non conforme ? Contactez-nous dès la réception avec votre numéro de commande, nous trouverons une solution.</p>
        </Section>

        <Section id="contact" title="Nous contacter">
          <ul className="space-y-1">
            {settings?.contactPhone && (
              <li>Téléphone : <a className="font-bold underline" href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}>{settings.contactPhone}</a></li>
            )}
            {settings?.contactEmail && (
              <li>Email : <a className="font-bold underline" href={`mailto:${settings.contactEmail}`}>{settings.contactEmail}</a></li>
            )}
            {settings?.address && <li>Adresse : {settings.address}</li>}
          </ul>
        </Section>
      </div>
    </ShopShell>
  );
}
