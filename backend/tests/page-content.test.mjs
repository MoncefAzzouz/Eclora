import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageSettingsSchema } from '../dist/lib/page-content.js';

const content = () => ({
  pages: {
    about: { title: 'Eclora', intro: 'Bienvenue', heroImage: '/uploads/hero.webp', storyTitle: 'Notre histoire', storyText: 'Une histoire', storyImage: 'https://example.com/story.jpg', missionTitle: 'Notre mission', missionText: 'Notre philosophie', valuesTitle: 'Nos valeurs', values: [{ title: 'Écoute', text: 'À votre écoute' }], closingTitle: 'Découvrir', closingText: 'La boutique' },
    contact: { title: 'Contact', intro: 'Parlons beauté', image: '', hours: 'Dimanche – jeudi\n9h – 18h', note: 'Votre numéro de commande' },
  },
  contactEmail: 'contact@example.com', contactPhone: '+213 555 00 00 00', address: 'Algérie',
});

test('page content accepts multiline copy, local uploads, and optional contact sections', () => {
  const result = pageSettingsSchema.parse(content());
  assert.equal(result.pages.contact.hours, 'Dimanche – jeudi\n9h – 18h');
  assert.equal(result.pages.contact.image, '');
  assert.equal(result.pages.about.heroImage, '/uploads/hero.webp');
});

test('page images reject executable protocols, malformed URLs, and protocol-relative URLs', () => {
  for (const image of ['javascript:alert(1)', 'data:text/html,test', '//other.example/image.jpg', 'https://', '/uploads/\nfile.jpg']) {
    const input = content(); input.pages.about.heroImage = image;
    assert.equal(pageSettingsSchema.safeParse(input).success, false, image);
  }
});

test('a page save cannot carry payment, delivery or account changes', () => {
  const input = { ...content(), payments: { COD: false }, yalidine: { autoSync: false }, role: 'OWNER' };
  const parsed = pageSettingsSchema.parse(input);
  assert.deepEqual(Object.keys(parsed).sort(), ['address', 'contactEmail', 'contactPhone', 'pages']);
});

test('invalid contact email, blank titles, and excessive values are rejected', () => {
  const email = content(); email.contactEmail = 'invalid';
  assert.equal(pageSettingsSchema.safeParse(email).success, false);
  const title = content(); title.pages.about.storyTitle = ' ';
  assert.equal(pageSettingsSchema.safeParse(title).success, false);
  const values = content(); values.pages.about.values = Array(7).fill({ title: 'Valeur', text: '' });
  assert.equal(pageSettingsSchema.safeParse(values).success, false);
});

test('contact controls accept legacy content and reject unsafe messaging links', () => {
  assert.equal(pageSettingsSchema.safeParse(content()).success, true);
  const input = content();
  input.pages.contact = { ...input.pages.contact, formEnabled: true, chatEnabled: true, whatsappNumber: '+213 555 11 22 33', viberUrl: 'viber://chat?number=%2B213555112233' };
  assert.equal(pageSettingsSchema.safeParse(input).success, true);
  input.pages.contact.viberUrl = 'javascript:alert(1)';
  assert.equal(pageSettingsSchema.safeParse(input).success, false);
});
