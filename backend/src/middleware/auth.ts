import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { AdminRole } from '@prisma/client';
import { env } from '../lib/env.js';
import { forbidden, unauthorized } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';

export interface AuthUser {
  id: string;
  email: string;
  role: AdminRole;
  name: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      admin?: AuthUser;
    }
  }
}

export function signToken(user: { id: string }): string {
  return jwt.sign({ sub: user.id }, env.jwtSecret, { expiresIn: '7d' });
}

/** Requires a valid admin token. Attaches req.admin. */
export async function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw unauthorized();
    const token = header.slice(7);

    let payload: jwt.JwtPayload;
    try {
      payload = jwt.verify(token, env.jwtSecret) as jwt.JwtPayload;
    } catch {
      throw unauthorized('Session expirée');
    }

    const user = await prisma.adminUser.findUnique({ where: { id: String(payload.sub) } });
    if (!user || !user.isActive) throw unauthorized('Compte désactivé ou inexistant');

    req.admin = { id: user.id, email: user.email, role: user.role, name: user.name };
    next();
  } catch (e) {
    next(e);
  }
}

/** Restricts a route to the given roles. Use after requireAdmin. */
export function requireRole(...roles: AdminRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.admin) return next(unauthorized());
    if (!roles.includes(req.admin.role)) return next(forbidden("Votre rôle ne permet pas cette action"));
    next();
  };
}

export const MANAGERS: AdminRole[] = ['OWNER', 'ADMIN'];
export const CATALOG: AdminRole[] = ['OWNER', 'ADMIN', 'EDITOR'];
export const SALES: AdminRole[] = ['OWNER', 'ADMIN', 'SUPPORT'];
