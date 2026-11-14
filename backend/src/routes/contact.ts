import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { contactMessageSchema } from '../lib/contact-message.js';
import { handler, param, HttpError } from '../lib/http.js';
import { rateLimit } from '../middleware/customer.js';

export const publicContactRouter = Router();
publicContactRouter.post('/', rateLimit(5, 15 * 60 * 1000), handler(async (req, res) => {
  const input = contactMessageSchema.parse(req.body);
  if (input.website) return res.json({ ok: true });
  const settings = await prisma.storeSettings.findUnique({ where: { id: 1 }, select: { pages: true } });
  const pages = settings?.pages as { contact?: { formEnabled?: boolean } } | undefined;
  if (pages?.contact?.formEnabled === false) throw new HttpError(403, 'Le formulaire est momentanément indisponible. Contactez-nous par email ou téléphone.');
  const { website: _website, ...data } = input;
  await prisma.contactMessage.create({ data });
  res.status(201).json({ ok: true });
}));

// Mounted behind admin authentication and the settings manager role check.
export const contactInboxRouter = Router();
contactInboxRouter.get('/', handler(async (req, res) => {
  const { page, filter } = z.object({ page: z.coerce.number().int().min(1).max(100000).default(1), filter: z.enum(['all', 'unread']).default('all') }).parse(req.query);
  const where = filter === 'unread' ? { isRead: false } : {};
  const [total, unread, items] = await Promise.all([
    prisma.contactMessage.count({ where }), prisma.contactMessage.count({ where: { isRead: false } }),
    prisma.contactMessage.findMany({ where, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], take: 20, skip: (page - 1) * 20 }),
  ]);
  res.json({ items, total, unread, page, pages: Math.max(1, Math.ceil(total / 20)) });
}));
contactInboxRouter.patch('/:id', handler(async (req, res) => {
  const data = z.object({ isRead: z.boolean() }).parse(req.body);
  res.json(await prisma.contactMessage.update({ where: { id: param(req, 'id') }, data }));
}));
contactInboxRouter.delete('/:id', handler(async (req, res) => {
  await prisma.contactMessage.delete({ where: { id: param(req, 'id') } });
  res.status(204).end();
}));
