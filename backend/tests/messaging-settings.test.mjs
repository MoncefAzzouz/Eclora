import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { prisma } from '../dist/lib/prisma.js';
import { settingsRouter } from '../dist/routes/settings.js';
import { requireAdmin, signToken } from '../dist/middleware/auth.js';
import { errorHandler } from '../dist/middleware/error.js';

test('managers configure contact numbers without changing page content or financial settings', async () => {
  let settings = {
    id: 1, contactEmail: 'contact@example.com', contactPhone: '+213 555 00 00 00', address: 'Algérie',
    payCod: true, payCib: false, yalidineAutoSync: true,
    pages: {
      about: { title: 'Eclora', intro: 'Bienvenue', heroImage: '', storyTitle: 'Histoire', storyText: '', storyImage: '', missionTitle: 'Mission', missionText: '', valuesTitle: 'Valeurs', values: [{ title: 'Écoute', text: '' }], closingTitle: 'Découvrir', closingText: '' },
      contact: { title: 'Contact', intro: 'Bonjour', image: '', hours: '', note: '', viberUrl: 'viber://chat?number=%2B213555112233', formEnabled: true },
    },
  };
  const originalSettings = { upsert: prisma.storeSettings.upsert, findUnique: prisma.storeSettings.findUnique };
  const originalUser = prisma.adminUser.findUnique;
  prisma.storeSettings.findUnique = async () => settings;
  prisma.storeSettings.upsert = async ({ update }) => { settings = { ...settings, ...update }; return settings; };
  prisma.adminUser.findUnique = async ({ where }) => ({ id: where.id, isActive: true, role: where.id === 'owner' ? 'OWNER' : 'EDITOR' });
  const app = express(); app.use(express.json()); app.use('/settings', requireAdmin, settingsRouter); app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1'); await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}/settings`;
  const headers = { Authorization: `Bearer ${signToken({ id: 'owner' })}`, 'Content-Type': 'application/json' };
  const values = { chatEnabled: true, whatsappNumber: '+213 555 12 34 56', chatPhoneNumber: '+213 555 65 43 21', viberNumber: '+213 555 98 76 54' };
  const save = (body, auth = headers) => fetch(base + '/messaging', { method: 'PUT', headers: auth, body: JSON.stringify(body) });
  try {
    assert.equal((await fetch(base + '/messaging')).status, 401);
    assert.equal((await save(values, { ...headers, Authorization: `Bearer ${signToken({ id: 'editor' })}` })).status, 403);
    const legacy = await (await fetch(base + '/messaging', { headers })).json();
    assert.equal(legacy.chatPhoneNumber, settings.contactPhone);
    assert.equal(legacy.viberNumber, '+213555112233');
    const response = await save({ ...values, payments: { COD: false }, contactPhone: 'overwrite', pages: {} });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), values);
    assert.equal(settings.pages.about.title, 'Eclora');
    assert.equal(settings.pages.contact.formEnabled, true);
    assert.equal(settings.contactPhone, '+213 555 00 00 00');
    assert.equal(settings.payCod, true); assert.equal(settings.yalidineAutoSync, true);
    for (const bad of ['javascript:alert(1)', 'https://example.com', 'abc', '+213 555 12345678901234567890']) {
      assert.equal((await save({ ...values, viberNumber: bad })).status, 400);
    }
    // A stale page form cannot put older messaging values back.
    const pages = structuredClone(settings.pages);
    Object.assign(pages.contact, { whatsappNumber: '+213 555 00 00 01', chatEnabled: false, chatPhoneNumber: '', viberNumber: '' });
    assert.equal((await fetch(base + '/pages', { method: 'PUT', headers, body: JSON.stringify({ pages, contactEmail: settings.contactEmail, contactPhone: settings.contactPhone, address: settings.address }) })).status, 200);
    for (const [key, value] of Object.entries(values)) assert.equal(settings.pages.contact[key], value);
    assert.equal((await save({ chatEnabled: false, whatsappNumber: '', chatPhoneNumber: '', viberNumber: '' })).status, 200);
    assert.equal(settings.pages.contact.chatEnabled, false);
    assert.equal(settings.pages.contact.viberNumber, '');
  } finally {
    server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
    Object.assign(prisma.storeSettings, originalSettings); prisma.adminUser.findUnique = originalUser;
    await prisma.$disconnect();
  }
});
