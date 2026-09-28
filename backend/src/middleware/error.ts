import type { ErrorRequestHandler, RequestHandler } from 'express';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { HttpError } from '../lib/http.js';

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: `Route inconnue : ${req.method} ${req.path}` });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const first = err.errors[0];
    res.status(400).json({
      error: first ? `${first.path.join('.')} : ${first.message}` : 'Données invalides',
      details: err.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
    });
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint / missing record, translated to something the UI can show.
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[] | undefined) ?? [];
      const MESSAGES: Record<string, string> = {
        email: 'Cet email est déjà utilisé',
        phone: 'Ce numéro de téléphone est déjà enregistré',
        sku: 'Ce SKU existe déjà',
        slug: 'Ce slug existe déjà',
        code: 'Ce code existe déjà',
        number: 'Numéro de commande déjà utilisé, veuillez réessayer',
      };
      const known = fields.map((f) => MESSAGES[f]).find(Boolean);
      res.status(409).json({ error: known ?? 'Cette valeur existe déjà' });
      return;
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Enregistrement introuvable' });
      return;
    }
    if (err.code === 'P2003') {
      res.status(409).json({ error: 'Impossible : cet élément est utilisé ailleurs' });
      return;
    }
  }

  console.error('[error]', err);
  res.status(500).json({ error: 'Erreur interne du serveur' });
};
