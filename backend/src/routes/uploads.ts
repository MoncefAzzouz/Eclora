import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { Router } from 'express';
import multer from 'multer';
import { badRequest, handler } from '../lib/http.js';

/** Files land here; server.ts serves this folder at /uploads. */
export const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
mkdirSync(UPLOAD_DIR, { recursive: true });

// Only raster formats the storefront can render. SVG is deliberately excluded:
// it can carry script, and these files are served from our own origin.
const ALLOWED = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
  ['image/avif', '.avif'],
  ['image/gif', '.gif'],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
    // Never trust the client filename — generate our own.
    filename: (_req, file, cb) => cb(null, `${Date.now()}-${randomUUID()}${ALLOWED.get(file.mimetype)}`),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(badRequest('Format non supporté. Utilisez JPG, PNG, WEBP, AVIF ou GIF.'));
    }
    cb(null, true);
  },
});

export const uploadsRouter = Router();

uploadsRouter.post(
  '/',
  upload.single('file'),
  handler(async (req, res) => {
    if (!req.file) throw badRequest('Aucun fichier reçu.');
    // Relative on purpose: the storefront proxies /uploads to this API, so the
    // image stays same-origin and next/image can optimise it.
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url, filename: req.file.filename, size: req.file.size });
  }),
);
