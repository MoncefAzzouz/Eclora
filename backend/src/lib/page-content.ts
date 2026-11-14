import { z } from 'zod';

const title = z.string().trim().min(1).max(180);
const text = z.string().trim().max(10000);
const image = z.string().trim().max(2048).refine(
  (value) => {
    if (value === '') return true;
    if (/[\u0000-\u001f]/.test(value)) return false;
    if (/^\/(?!\/)/.test(value)) return true;
    try { return ['http:', 'https:'].includes(new URL(value).protocol); }
    catch { return false; }
  },
  'Image : utilisez un fichier importé ou une URL http(s)'
);

export const pagesSchema = z.object({
  about: z.object({
    title, intro: text, heroImage: image,
    storyTitle: title, storyText: text, storyImage: image,
    missionTitle: title, missionText: text,
    valuesTitle: title,
    values: z.array(z.object({ title, text })).min(1).max(6),
    closingTitle: title, closingText: text,
  }),
  contact: z.object({ title, intro: text, image, hours: text, note: text }),
});

export const pageSettingsSchema = z.object({
  pages: pagesSchema,
  contactEmail: z.string().trim().email('Email invalide'),
  contactPhone: z.string().trim().max(100),
  address: z.string().trim().max(2000),
});
