import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { prisma } from '../dist/lib/prisma.js';
import { shopRouter } from '../dist/routes/storefront.js';
import { errorHandler } from '../dist/middleware/error.js';

test('recommendations prefer the subcategory, exclude unavailable catalogue entries and send only card content', async () => {
  const row = (id, subcategoryId, extra = {}) => ({
    id, slug: id, name: id, status: 'ACTIVE', categoryId: 'skin', subcategoryId,
    price: 1200, stock: 3, images: ['/uploads/main.png', '/uploads/detail.png'],
    tags: [], description: 'Long description', usageTips: 'Long usage', ingredients: 'Long ingredients',
    createdAt: new Date(), updatedAt: new Date(),
    brand: { name: 'Test', slug: 'test' }, category: { name: 'Skin', slug: 'skin' },
    subcategory: subcategoryId ? { name: subcategoryId, slug: subcategoryId } : null,
    shades: [{ id: 'ref', name: 'A', hex: '', stock: 3, images: ['/uploads/reference.png'] }],
    ...extra,
  });
  const rows = [
    row('source', 'serum'), row('different-subcategory', 'cream'), row('same-subcategory', 'serum'),
    row('draft', 'serum', { status: 'DRAFT' }), row('another-category', 'serum', { categoryId: 'hair' }),
    ...Array.from({ length: 20 }, (_, index) => row(`other-${index}`, 'cream')),
  ];
  const matches = (item, where) => item.status === where.status
    && (!where.categoryId || item.categoryId === where.categoryId)
    && (!where.subcategoryId || item.subcategoryId === where.subcategoryId)
    && (!where.OR || where.OR.some((clause) => item.id === clause.id || item.slug === clause.slug))
    && (!where.id?.not || item.id !== where.id.not)
    && (!where.id?.notIn || !where.id.notIn.includes(item.id));
  const originals = { findFirst: prisma.product.findFirst, findMany: prisma.product.findMany };
  prisma.product.findFirst = async ({ where }) => rows.find((item) => matches(item, where)) ?? null;
  prisma.product.findMany = async ({ where, take }) => rows.filter((item) => matches(item, where)).slice(0, take);
  const app = express(); app.use('/api/shop', shopRouter); app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/api/shop/products`;
  try {
    const response = await fetch(`${base}/source/related`);
    assert.equal(response.status, 200);
    const cards = await response.json();
    assert.equal(cards.length, 12);
    assert.equal(cards[0].id, 'same-subcategory');
    assert.equal(new Set(cards.map((item) => item.id)).size, 12);
    assert.equal(cards.some((item) => ['source', 'draft', 'another-category'].includes(item.id)), false);
    assert.deepEqual(cards[0].images, ['/uploads/main.png']);
    assert.deepEqual(cards[0].shades, [{ id: 'ref', name: 'A', hex: '', stock: 3 }]);
    assert.equal('description' in cards[0], false);
    assert.equal('ingredients' in cards[0], false);
    assert.equal('usageTips' in cards[0], false);
    assert.equal((await fetch(`${base}/missing/related`)).status, 404);
    assert.equal((await fetch(`${base}/draft/related`)).status, 404);
    rows[0].subcategoryId = null;
    const withoutSubcategory = await (await fetch(`${base}/source/related`)).json();
    assert.equal(withoutSubcategory.length, 12);
    assert.equal(withoutSubcategory.some((item) => item.id === 'source'), false);
  } finally {
    server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
    Object.assign(prisma.product, originals);
    await prisma.$disconnect();
  }
});
