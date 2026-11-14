import { z } from 'zod';

export const contactMessageSchema = z.object({
  name: z.string().trim().min(2, 'Indiquez votre nom et prénom').max(120, 'Nom trop long'),
  email: z.string().trim().max(254).email('Indiquez une adresse email valide'),
  phone: z.string().trim().min(6, 'Indiquez votre téléphone').max(40).regex(/^[+\d\s().-]+$/, 'Téléphone invalide').refine((value) => value.replace(/\D/g, '').length >= 6, 'Téléphone invalide'),
  message: z.string().trim().min(10, 'Votre message doit contenir au moins 10 caractères').max(5000, '5 000 caractères maximum'),
  website: z.string().max(200).optional().default(''),
});
