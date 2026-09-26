import type { NextFunction, Request, RequestHandler, Response } from 'express';

/** Error with an HTTP status — thrown anywhere, turned into a JSON response by errorHandler. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const badRequest = (message: string) => new HttpError(400, message);
export const unauthorized = (message = 'Non authentifié') => new HttpError(401, message);
export const forbidden = (message = 'Accès refusé') => new HttpError(403, message);
export const notFound = (message = 'Introuvable') => new HttpError(404, message);

/** Reads a route parameter that must be present (Express types it as optional). */
export function param(req: Request, name: string): string {
  const value = req.params[name];
  if (!value) throw new HttpError(400, `Paramètre manquant : ${name}`);
  return value;
}

/** Wraps an async handler so rejected promises reach the error middleware. */
export function handler(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
