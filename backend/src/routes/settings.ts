// Store settings and the admin team.
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { badRequest, forbidden, handler } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { MANAGERS, requireRole } from '../middleware/auth.js';

// ─── Settings ───────────────────────────────────────────────────────────────

export const settingsRouter = Router();

const settingsSchema = z.object({
  storeName: z.string().min(1),
  contactEmail: z.string().email('Email invalide'),
  contactPhone: z.string(),
  address: z.string(),
  announcementText: z.string().max(120),
  announcementEnabled: z.boolean(),
  freeShippingThreshold: z.number().int().min(0),
  payments: z.object({ COD: z.boolean(), BARIDIMOB: z.boolean(), CIB: z.boolean() }),
  socials: z.object({ instagram: z.string(), facebook: z.string(), tiktok: z.string() }),
  maintenanceMode: z.boolean(),
});

/** There is exactly one settings row, id = 1. */
export async function getSettings() {
  return prisma.storeSettings.upsert({ where: { id: 1 }, create: { id: 1 }, update: {} });
}

settingsRouter.get(
  '/',
  handler(async (_req, res) => {
    res.json(s.settings(await getSettings()));
  })
);

settingsRouter.put(
  '/',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const input = settingsSchema.parse(req.body);
    if (!Object.values(input.payments).some(Boolean)) throw badRequest('Activez au moins un moyen de paiement');

    const updated = await prisma.storeSettings.upsert({
      where: { id: 1 },
      create: {
        id: 1,
        ...input,
        payCod: input.payments.COD,
        payBaridimob: input.payments.BARIDIMOB,
        payCib: input.payments.CIB,
        ...input.socials,
        payments: undefined,
        socials: undefined,
      } as never,
      update: {
        storeName: input.storeName,
        contactEmail: input.contactEmail,
        contactPhone: input.contactPhone,
        address: input.address,
        announcementText: input.announcementText,
        announcementEnabled: input.announcementEnabled,
        freeShippingThreshold: input.freeShippingThreshold,
        payCod: input.payments.COD,
        payBaridimob: input.payments.BARIDIMOB,
        payCib: input.payments.CIB,
        instagram: input.socials.instagram,
        facebook: input.socials.facebook,
        tiktok: input.socials.tiktok,
        maintenanceMode: input.maintenanceMode,
      },
    });
    res.json(s.settings(updated));
  })
);

// ─── Team ───────────────────────────────────────────────────────────────────

export const teamRouter = Router();

const userSchema = z.object({
  name: z.string().min(1, 'Le nom est obligatoire'),
  email: z.string().email('Email invalide'),
  role: z.enum(['OWNER', 'ADMIN', 'EDITOR', 'SUPPORT']),
  isActive: z.boolean().default(true),
  password: z.string().min(8, 'Mot de passe : 8 caractères minimum').optional(),
});

teamRouter.get(
  '/',
  handler(async (_req, res) => {
    const users = await prisma.adminUser.findMany({ orderBy: { createdAt: 'asc' } });
    res.json(users.map(s.adminUser));
  })
);

teamRouter.post(
  '/',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const input = userSchema.parse(req.body);
    if (!input.password) throw badRequest('Mot de passe obligatoire');
    if (input.role === 'OWNER') throw badRequest('Il ne peut y avoir qu’un seul propriétaire');

    const created = await prisma.adminUser.create({
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role,
        isActive: input.isActive,
        passwordHash: await bcrypt.hash(input.password, 10),
      },
    });
    res.status(201).json(s.adminUser(created));
  })
);

teamRouter.put(
  '/:id',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const input = userSchema.parse(req.body);
    const target = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.params.id } });

    if (target.role === 'OWNER' && (input.role !== 'OWNER' || !input.isActive)) {
      throw badRequest('Le propriétaire ne peut pas être rétrogradé ou désactivé');
    }
    if (target.role !== 'OWNER' && input.role === 'OWNER') {
      throw badRequest('Il ne peut y avoir qu’un seul propriétaire');
    }

    const updated = await prisma.adminUser.update({
      where: { id: target.id },
      data: {
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role,
        isActive: input.isActive,
        ...(input.password ? { passwordHash: await bcrypt.hash(input.password, 10) } : {}),
      },
    });
    res.json(s.adminUser(updated));
  })
);

teamRouter.delete(
  '/:id',
  requireRole(...MANAGERS),
  handler(async (req, res) => {
    const target = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.params.id } });
    if (target.role === 'OWNER') throw badRequest('Le propriétaire ne peut pas être supprimé');
    if (target.id === req.admin?.id) throw forbidden('Vous ne pouvez pas supprimer votre propre compte');

    await prisma.adminUser.delete({ where: { id: target.id } });
    res.status(204).end();
  })
);
