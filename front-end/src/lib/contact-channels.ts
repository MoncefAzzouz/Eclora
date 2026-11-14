import type { SitePages } from './site-pages';

export interface MessagingSettings {
  chatEnabled: boolean;
  whatsappNumber: string;
  chatPhoneNumber: string;
  viberNumber: string;
}

export function viberLink(contact: SitePages['contact']): string {
  if (contact.viberNumber !== undefined) {
    const digits = contact.viberNumber.replace(/\D/g, '');
    return digits ? `viber://chat?number=${encodeURIComponent(`+${digits}`)}` : '';
  }
  return contact.viberUrl;
}
