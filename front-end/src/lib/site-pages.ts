export interface SitePages {
  about: {
    title: string; intro: string; heroImage: string;
    storyTitle: string; storyText: string; storyImage: string;
    missionTitle: string; missionText: string;
    valuesTitle: string; values: { title: string; text: string }[];
    closingTitle: string; closingText: string;
  };
  contact: {
    title: string; intro: string; image: string; hours: string; note: string;
    formEnabled: boolean; chatEnabled: boolean;
    formTitle: string; formIntro: string; submitLabel: string; successMessage: string;
    nameLabel: string; emailFieldLabel: string; phoneFieldLabel: string; messageLabel: string;
    emailLabel: string; phoneLabel: string; addressLabel: string; hoursLabel: string;
    chatTitle: string; chatIntro: string; whatsappNumber: string; viberUrl: string;
  };
}

export type PageContent = { [K in keyof SitePages]?: Partial<SitePages[K]> };

export const DEFAULT_PAGES: SitePages = {
  about: {
    title: 'La beauté,\nà votre façon.',
    intro: 'Des découvertes, des essentiels et ce petit plaisir de prendre soin de soi. Bienvenue dans l’univers Eclora.',
    heroImage: '/images/eclora-about-campaign-v1.webp',
    storyTitle: 'Un univers beauté.\nLe vôtre.',
    storyText: 'Eclora réunit les soins, le maquillage et les essentiels qui accompagnent vos envies de beauté.\n\nNotre idée est simple : vous aider à composer une routine qui vous ressemble, à votre rythme, avec des produits à découvrir et à aimer au quotidien.',
    storyImage: '/images/eclora-about-products-v1.webp',
    missionTitle: 'Faire de chaque jour\nun moment pour vous.',
    missionText: 'Un soin que l’on aime appliquer. Une couleur que l’on ose enfin. Un nouveau rituel, juste pour soi. Nous croyons aux petits gestes qui font du bien et à une beauté qui laisse à chacun la liberté d’être soi.',
    valuesTitle: 'Ce qui nous anime.',
    values: [
      { title: 'La découverte', text: 'Des univers et des marques à explorer, pour trouver vos prochains essentiels.' },
      { title: 'La proximité', text: 'Une équipe à votre écoute, pour vous accompagner dans vos choix et vos commandes.' },
      { title: 'Votre liberté', text: 'Votre peau, vos cheveux, votre style. Une beauté qui se construit selon vos envies.' },
    ],
    closingTitle: 'Votre prochain coup de cœur\nvous attend.',
    closingText: 'Explorez notre sélection et faites une place à vos nouvelles envies.',
  },
  contact: {
    title: 'Parlons beauté.\nEt de vous.',
    intro: 'Un conseil, une question sur un produit ou votre commande ? Nous sommes à votre écoute.',
    image: '/images/eclora-contact-campaign-v1.webp', hours: '',
    note: 'Pour une question concernant une commande, pensez à nous communiquer votre numéro de commande afin de faciliter nos échanges.',
    formEnabled: true, chatEnabled: true,
    formTitle: 'Un message,\net on en parle.',
    formIntro: 'Laissez-nous vos coordonnées et votre question. Notre équipe vous recontactera.',
    submitLabel: 'Envoyer mon message', successMessage: 'Merci ! Votre message a bien été reçu. Notre équipe vous recontactera avec les coordonnées indiquées.',
    nameLabel: 'Nom et prénom', emailFieldLabel: 'Adresse email', phoneFieldLabel: 'Téléphone', messageLabel: 'Votre message',
    emailLabel: 'Écrivez-nous', phoneLabel: 'Appelez-nous', addressLabel: 'Notre adresse', hoursLabel: 'Nos horaires',
    chatTitle: 'Parlons ensemble', chatIntro: 'Choisissez le moyen qui vous convient.', whatsappNumber: '', viberUrl: '',
  },
};

export function resolvePages(content?: PageContent | null): SitePages {
  return {
    about: { ...DEFAULT_PAGES.about, ...content?.about },
    contact: { ...DEFAULT_PAGES.contact, ...content?.contact },
  };
}
