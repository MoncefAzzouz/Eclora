// Customer accounts: sign up, log in, profile, order history.
// Ordering without an account keeps working; an account only saves details and
// lists past orders.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { Client } from '@prisma/client';
import { prisma } from '../lib/prisma.js';
import { badRequest, handler, unauthorized } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { rateLimit, requireCustomer, signCustomerToken } from '../middleware/customer.js';

export const accountRouter = Router();

/** 0550 12 34 56, +213 550 12 34 56 → 0550123456 */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '');
  if (digits.startsWith('+213')) return `0${digits.slice(4)}`;
  if (digits.startsWith('00213')) return `0${digits.slice(5)}`;
  return digits;
}

const phoneSchema = z
  .string()
  .transform(normalizePhone)
  .refine((p) => /^0[5-7]\d{8}$/.test(p) || /^0[2-4]\d{7}$/.test(p), 'Numéro de téléphone invalide (ex. 0550 12 34 56)');

function profile(c: Client) {
  return {
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email ?? '',
    wilayaCode: c.wilayaCode,
    address: c.address ?? '',
    createdAt: c.createdAt.toISOString(),
  };
}

const session = (c: Client) => ({ token: signCustomerToken(c), customer: profile(c) });

accountRouter.post(
  '/register',
  rateLimit(10, 15 * 60_000),
  handler(async (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(2, 'Votre nom complet est requis'),
        phone: phoneSchema,
        email: z.string().trim().toLowerCase().email('Email invalide').optional().or(z.literal('')),
        password: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(100),
      })
      .parse(req.body);

    const email = input.email || null;
    if (email) {
      const taken = await prisma.client.findFirst({ where: { email, isGuest: false, NOT: { phone: input.phone } } });
      if (taken) throw badRequest('Un compte existe déjà avec cet email');
    }

    const existing = await prisma.client.findUnique({ where: { phone: input.phone } });
    if (existing && !existing.isGuest) throw badRequest('Un compte existe déjà avec ce numéro. Connectez-vous.');
    if (existing?.status === 'BLOCKED') throw badRequest('Inscription impossible. Merci de nous contacter.');

    const data = {
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
      isGuest: false,
      registeredAt: new Date(),
    };
    // A guest who ordered before becomes a registered client (same phone).
    const client = existing
      ? await prisma.client.update({ where: { id: existing.id }, data })
      : await prisma.client.create({ data: { ...data, phone: input.phone, wilayaCode: 16 } });

    res.status(201).json(session(client));
  })
);

accountRouter.post(
  '/login',
  rateLimit(10, 15 * 60_000),
  handler(async (req, res) => {
    const { identifier, password } = z
      .object({ identifier: z.string().trim().min(3, 'Téléphone ou email requis'), password: z.string().min(1) })
      .parse(req.body);

    const where = identifier.includes('@')
      ? { email: identifier.toLowerCase(), isGuest: false }
      : { phone: normalizePhone(identifier), isGuest: false };
    const client = await prisma.client.findFirst({ where });

    const ok = client?.passwordHash ? await bcrypt.compare(password, client.passwordHash) : false;
    if (!client || !ok) throw unauthorized('Identifiants incorrects');
    if (client.status === 'BLOCKED') throw unauthorized('Compte désactivé. Merci de nous contacter.');

    res.json(session(client));
  })
);

accountRouter.get(
  '/me',
  requireCustomer,
  handler(async (req, res) => {
    res.json(profile(req.customer!));
  })
);

accountRouter.put(
  '/me',
  requireCustomer,
  handler(async (req, res) => {
    const input = z
      .object({
        name: z.string().trim().min(2, 'Votre nom complet est requis'),
        email: z.string().trim().toLowerCase().email('Email invalide').optional().or(z.literal('')),
        wilayaCode: z.number().int().min(1).max(99),
        address: z.string().trim().max(300).optional(),
      })
      .parse(req.body);

    const email = input.email || null;
    if (email) {
      const taken = await prisma.client.findFirst({ where: { email, isGuest: false, NOT: { id: req.customer!.id } } });
      if (taken) throw badRequest('Cet email est déjà utilisé par un autre compte');
    }
    const updated = await prisma.client.update({
      where: { id: req.customer!.id },
      data: { name: input.name, email, wilayaCode: input.wilayaCode, address: input.address || null },
    });
    res.json(profile(updated));
  })
);

accountRouter.put(
  '/password',
  requireCustomer,
  rateLimit(10, 15 * 60_000),
  handler(async (req, res) => {
    const { current, next } = z
      .object({ current: z.string().min(1), next: z.string().min(8, 'Mot de passe : 8 caractères minimum').max(100) })
      .parse(req.body);
    const ok = req.customer!.passwordHash ? await bcrypt.compare(current, req.customer!.passwordHash) : false;
    if (!ok) throw badRequest('Mot de passe actuel incorrect');
    await prisma.client.update({ where: { id: req.customer!.id }, data: { passwordHash: await bcrypt.hash(next, 10) } });
    res.status(204).end();
  })
);

accountRouter.get(
  '/orders',
  requireCustomer,
  handler(async (req, res) => {
    const c = req.customer!;
    const orders = await prisma.order.findMany({
      where: { clientId: c.id, ...(c.registeredAt ? { createdAt: { gte: c.registeredAt } } : {}) },
      include: { items: true, history: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders.map((o) => {
      const full = s.order(o);
      // The customer's view: no internal notes.
      return { ...full, adminNote: undefined };
    }));
  })
);
