import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveProductReference } from '../dist/lib/product-reference.js';

const product = {
  name: 'Produit', stock: 8, images: ['/uploads/general.png'],
  shades: [
    { name: 'REF-A', stock: 3, images: ['/uploads/a.png', '/uploads/a-detail.png'] },
    { name: 'REF-B', stock: 5, images: ['/uploads/b.png'] },
    { name: 'LEGACY', stock: 0, images: [] },
  ],
};
test('the order snapshots the selected reference image and name', () => {
  assert.deepEqual(resolveProductReference(product, 'REF-B', 1), { image: '/uploads/b.png', shade: 'REF-B' });
});
test('a legacy reference without images uses the general product image', () => {
  const p = { ...product, shades: [{ name: 'LEGACY', stock: 2, images: [] }] };
  assert.equal(resolveProductReference(p, 'LEGACY', 1).image, '/uploads/general.png');
});
test('missing and invented references are rejected', () => {
  assert.throws(() => resolveProductReference(product, undefined, 1), { status: 400 });
  assert.throws(() => resolveProductReference(product, 'INVENTED', 1), { status: 400 });
});
test('another reference stock cannot cover an unavailable or excessive selection', () => {
  assert.throws(() => resolveProductReference(product, 'LEGACY', 1), { status: 400 });
  assert.throws(() => resolveProductReference(product, 'REF-A', 4), { status: 400 });
});
test('products without references keep their original checkout behavior', () => {
  assert.deepEqual(resolveProductReference({ ...product, shades: [] }, undefined, 1), { image: '/uploads/general.png', shade: null });
});
