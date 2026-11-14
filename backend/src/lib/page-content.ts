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
  contact: z.object({
    title, intro: text, image, hours: text, note: text,
    formEnabled: z.boolean().optional(), chatEnabled: z.boolean().optional(),
    formTitle: title.optional(), formIntro: text.optional(), submitLabel: title.optional(), successMessage: text.optional(),
    nameLabel: title.optional(), emailFieldLabel: title.optional(), phoneFieldLabel: title.optional(), messageLabel: title.optional(),
    emailLabel: title.optional(), phoneLabel: title.optional(), addressLabel: title.optional(), hoursLabel: title.optional(),
    chatTitle: title.optional(), chatIntro: text.optional(),
    whatsappNumber: z.string().trim().max(40).refine((value) => !value || /^\+?[1-9][\d\s().-]{6,38}$/.test(value), 'Utilisez le format international, par exemple +213…').optional(),
    viberUrl: z.string().trim().max(2048).refine((value) => {
      if (!value) return true;
      try { return ['viber:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
    }, 'Lien Viber invalide (viber://… ou https://…)').optional(),
  }),
});

export const pageSettingsSchema = z.object({
  pages: pagesSchema,
  contactEmail: z.string().trim().email('Email invalide'),
  contactPhone: z.string().trim().max(100),
  address: z.string().trim().max(2000),
});
