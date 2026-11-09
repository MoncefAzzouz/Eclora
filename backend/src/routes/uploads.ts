import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { GetObjectCommand, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { Router } from 'express';
import multer from 'multer';
import { badRequest, handler } from '../lib/http.js';
import { r2Storage, uploadObjectKey } from '../lib/r2.js';

/** Local fallback for development and files uploaded before R2 was enabled. */
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
  storage: r2Storage ? multer.memoryStorage() : multer.diskStorage({
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

// R2 stays private: the backend authenticates reads and serves only image keys
// in the uploads/ namespace. Keeping the URL same-origin also supports next/image.
export const uploadImagesRouter = Router();
uploadImagesRouter.get('/:filename', handler(async (req, res, next) => {
  const filename = req.params.filename;
  if (!r2Storage || !filename || !/^[a-zA-Z0-9_-]{1,200}\.(jpg|jpeg|png|webp|avif|gif)$/.test(filename)) {
    next();
    return;
  }

  try {
    const input = { Bucket: r2Storage.bucket, Key: uploadObjectKey(filename) };
    const object = req.method === 'HEAD'
      ? await r2Storage.client.send(new HeadObjectCommand(input))
      : await r2Storage.client.send(new GetObjectCommand(input));

    const extension = path.extname(filename).toLowerCase();
    const contentType = [...ALLOWED].find(([, ext]) => ext === extension)?.[0] ?? 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    if (object.ETag) res.setHeader('ETag', object.ETag);
    if (object.LastModified) res.setHeader('Last-Modified', object.LastModified.toUTCString());

    if (req.fresh) {
      if ('Body' in object && object.Body instanceof Readable) object.Body.destroy();
      res.status(304).end();
      return;
    }
    if (object.ContentLength !== undefined) res.setHeader('Content-Length', object.ContentLength);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    if (!('Body' in object) || !(object.Body instanceof Readable)) throw new Error('R2 returned no image stream');
    await pipeline(object.Body, res);
  } catch (error) {
    if (res.headersSent) {
      res.destroy();
      return;
    }
    if ((error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404) {
      next();
      return;
    }
    throw error;
  }
}));

uploadsRouter.post(
  '/',
  upload.single('file'),
  handler(async (req, res) => {
    if (!req.file) throw badRequest('Aucun fichier reçu.');
    if (r2Storage) {
      const filename = `${Date.now()}-${randomUUID()}${ALLOWED.get(req.file.mimetype)}`;
      await r2Storage.client.send(new PutObjectCommand({
        Bucket: r2Storage.bucket,
        Key: uploadObjectKey(filename),
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }));
      req.file.filename = filename;
    }
    // Relative on purpose: the storefront proxies /uploads to this API, so the
    // image stays same-origin and next/image can optimise it.
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url, filename: req.file.filename, size: req.file.size });
  }),
);
