import { test } from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { prisma } from '../dist/lib/prisma.js';
import { publicContactRouter, contactInboxRouter } from '../dist/routes/contact.js';
import { requireAdmin, requireRole, signToken, MANAGERS } from '../dist/middleware/auth.js';
import { errorHandler } from '../dist/middleware/error.js';

test('contact requests persist once, stay private, support the inbox and reject spam/disabled submissions', async () => {
  const messages = []; let enabled = true;
  const delegates = [prisma.storeSettings, prisma.contactMessage, prisma.adminUser];
  const originals = delegates.map((delegate) => Object.fromEntries(['findUnique', 'create', 'count', 'findMany', 'update', 'delete'].filter((key) => typeof delegate[key] === 'function').map((key) => [key, delegate[key]])));
  prisma.storeSettings.findUnique = async () => ({ pages: { contact: { formEnabled: enabled } } });
  prisma.adminUser.findUnique = async ({ where }) => ({ id: where.id, isActive: true, role: where.id === 'owner' ? 'OWNER' : 'EDITOR', email: 'test@example.com', name: 'Test' });
  prisma.contactMessage.create = async ({ data }) => { const row = { id: String(messages.length + 1), ...data, isRead: false, createdAt: new Date() }; messages.push(row); return row; };
  prisma.contactMessage.count = async ({ where } = {}) => messages.filter((m) => where?.isRead === undefined || where.isRead === m.isRead).length;
  prisma.contactMessage.findMany = async ({ where, skip, take }) => messages.filter((m) => where.isRead === undefined || where.isRead === m.isRead).slice(skip, skip + take);
  prisma.contactMessage.update = async ({ where, data }) => { const row = messages.find((m) => m.id === where.id); Object.assign(row, data); return row; };
  prisma.contactMessage.delete = async ({ where }) => messages.splice(messages.findIndex((m) => m.id === where.id), 1)[0];
  const app = express(); app.use(express.json());
  app.use('/api/shop/contact', publicContactRouter);
  app.use('/api/admin/settings/messages', requireAdmin, requireRole(...MANAGERS), contactInboxRouter);
  app.use(errorHandler);
  const server = app.listen(0, '127.0.0.1'); await new Promise((resolve) => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const body = { name: ' Test client ', email: 'test@example.com', phone: '+213 555 11 22 33', message: '<script>text only</script> Une question sur un produit.', website: '' };
  const send = (value) => fetch(base + '/api/shop/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
  const auth = { Authorization: `Bearer ${signToken({ id: 'owner' })}`, 'Content-Type': 'application/json' };
  try {
    assert.equal((await send(body)).status, 201);
    assert.equal(messages.length, 1); assert.equal(messages[0].name, 'Test client'); assert.equal(messages[0].message, body.message); assert.equal('website' in messages[0], false);
    assert.equal((await send({ ...body, email: 'invalid' })).status, 400); assert.equal(messages.length, 1);
    assert.equal((await send({ ...body, website: 'spam.example' })).status, 200); assert.equal(messages.length, 1);
    enabled = false; assert.equal((await send(body)).status, 403); assert.equal(messages.length, 1);
    enabled = true; assert.equal((await send(body)).status, 201); assert.equal(messages.length, 2);
    assert.equal((await send(body)).status, 429); assert.equal(messages.length, 2);
    assert.equal((await fetch(base + '/api/admin/settings/messages')).status, 401);
    assert.equal((await fetch(base + '/api/admin/settings/messages', { headers: { Authorization: `Bearer ${signToken({ id: 'editor' })}` } })).status, 403);
    const inbox = await (await fetch(base + '/api/admin/settings/messages', { headers: auth })).json();
    assert.equal(inbox.total, 2); assert.equal(inbox.unread, 2); assert.equal(inbox.items[0].message, body.message);
    assert.equal((await fetch(base + '/api/admin/settings/messages/1', { method: 'PATCH', headers: auth, body: JSON.stringify({ isRead: true }) })).status, 200);
    const unread = await (await fetch(base + '/api/admin/settings/messages?filter=unread', { headers: auth })).json();
    assert.equal(unread.total, 1); assert.equal(unread.unread, 1);
    assert.equal((await fetch(base + '/api/admin/settings/messages/2', { method: 'DELETE', headers: auth })).status, 204); assert.equal(messages.length, 1);
  } finally {
    server.closeAllConnections(); await new Promise((resolve) => server.close(resolve));
    delegates.forEach((delegate, index) => Object.assign(delegate, originals[index]));
    await prisma.$disconnect();
  }
});
