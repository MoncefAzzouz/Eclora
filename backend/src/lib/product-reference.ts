import { badRequest } from './http.js';

interface ReferenceProduct {
  name: string;
  stock: number;
  images: string[];
  shades: { name: string; stock: number; images: string[] }[];
}

/** Resolve the order image and stock from server data, never browser images. */
export function resolveProductReference(product: ReferenceProduct, name: string | undefined, quantity: number) {
  const reference = product.shades.find((item) => item.name === name);
  if ((product.shades.length > 0 && !reference) || (name && !reference)) {
    throw badRequest(`Choisissez une référence valide pour « ${product.name} »`);
  }
  const stock = Math.min(product.stock, reference?.stock ?? product.stock);
  if (stock < quantity) throw badRequest(`Stock insuffisant pour « ${product.name}${reference ? ` — ${reference.name}` : ''} » (${stock} restant)`);
  return {
    image: reference?.images[0] ?? product.images[0] ?? '',
    shade: reference?.name ?? null,
  };
}
