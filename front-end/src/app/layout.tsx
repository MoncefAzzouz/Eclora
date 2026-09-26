import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/lib/shop/cart";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ECLORA | Parfumerie, Maquillage, Soin, Cheveux & Beauté",
  description: "Découvrez l'univers Eclora : maquillage, parfums pour homme et femme, soins du visage et du corps, soins cheveux et marques exclusives.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // suppressHydrationWarning: browser extensions inject attributes on <html>/<body>
    // before hydration. It only ignores attribute diffs on these elements, not the app tree.
    <html lang="fr" className={`${montserrat.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-white text-black font-sans" suppressHydrationWarning>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
