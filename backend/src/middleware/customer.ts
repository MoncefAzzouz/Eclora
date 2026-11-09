// Customer (storefront) sessions. Separate from admin sessions: the token
// carries typ: 'client', and requireAdmin refuses any token that has it.
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { Client } from '@prisma/client';
import { env } from '../lib/env.js';
import { HttpError, unauthorized } from '../lib/http.js';
import { prisma } from '../lib/prisma.js';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      customer?: Client;
    }
  }
}

export function signCustomerToken(client: { id: string }): string {
  return jwt.sign({ sub: client.id, typ: 'client' }, env.jwtSecret, { expiresIn: '30d' });
}

async function resolve(req: Request): Promise<Client | null> {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return null;
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(header.slice(7), env.jwtSecret) as jwt.JwtPayload;
  } catch {
    return null;
  }
  if (payload.typ !== 'client') return null;
  const client = await prisma.client.findUnique({ where: { id: String(payload.sub) } });
  if (!client || client.isGuest || client.status === 'BLOCKED') return null;
  return client;
}

/** Attaches req.customer when a valid customer token is sent; never rejects. */
export async function optionalCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    req.customer = (await resolve(req)) ?? undefined;
    next();
  } catch (e) {
    next(e);
  }
}

export async function requireCustomer(req: Request, _res: Response, next: NextFunction) {
  try {
    const client = await resolve(req);
    if (!client) throw unauthorized('Connectez-vous pour continuer');
    req.customer = client;
    next();
  } catch (e) {
    next(e);
  }
}

/**
 * Small in-memory limiter for login and sign-up: `max` attempts per `windowMs`
 * per IP. One API process, so memory is enough; it resets on restart.
 */
export function rateLimit(max: number, windowMs: number) {
  const hits = new Map<string, { count: number; reset: number }>();
  return (req: Request, _res: Response, next: NextFunction) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);
    if (!entry || entry.reset < now) {
      hits.set(key, { count: 1, reset: now + windowMs });
      if (hits.size > 10_000) for (const [k, v] of hits) if (v.reset < now) hits.delete(k);
      return next();
    }
    entry.count++;
    if (entry.count > max) {
      return next(new HttpError(429, 'Trop de tentatives. Réessayez dans quelques minutes.'));
    }
    next();
  };
}
