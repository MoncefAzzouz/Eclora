import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { handler, unauthorized } from '../lib/http.js';
import * as s from '../lib/serialize.js';
import { requireAdmin, signToken } from '../middleware/auth.js';

export const authRouter = Router();

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

authRouter.post(
  '/login',
  handler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.adminUser.findUnique({ where: { email: email.toLowerCase().trim() } });

    // Same message either way so the form can't be used to discover emails.
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw unauthorized('Email ou mot de passe incorrect');
    }
    if (!user.isActive) throw unauthorized('Ce compte est désactivé');

    await prisma.adminUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    res.json({ token: signToken(user), user: s.adminUser(user) });
  })
);

authRouter.get(
  '/me',
  requireAdmin,
  handler(async (req, res) => {
    const user = await prisma.adminUser.findUniqueOrThrow({ where: { id: req.admin!.id } });
    res.json(s.adminUser(user));
  })
);
