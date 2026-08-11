import frMessages from '../../messages/fr.json';

export const defaultLocale = 'fr';
export const supportedLocales = ['fr', 'en', 'es', 'sw', 'ln', 'rw'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

const createMessages = (overrides: Record<string, any> = {}) => ({
  ...frMessages,
  ...overrides,
  common: {
    ...frMessages.common,
    ...(overrides.common || {}),
  },
  footer: {
    ...frMessages.footer,
    ...(overrides.footer || {}),
  },
  home: {
    ...frMessages.home,
    ...(overrides.home || {}),
  },
  article: {
    ...frMessages.article,
    ...(overrides.article || {}),
  },
  nav: {
    ...frMessages.nav,
    ...(overrides.nav || {}),
  },
});

const translations: Record<SupportedLocale, typeof frMessages> = {
  fr: frMessages,
  en: createMessages({
    common: {
      home: 'Home',
      about: 'About',
      contact: 'Contact',
      search: 'Search',
      readMore: 'Read more',
      share: 'Share',
      back: 'Back',
    },
    footer: {
      description: 'News that crosses borders. Informing, educating and connecting Africa through independent journalism.',
      news: 'News',
      sections: 'Sections',
      about: 'About',
      legal: 'Legal',
      copyright: 'All rights reserved.',
      madeWith: 'Made with ❤️ for Africa',
      inTheNews: 'IN THE NEWS',
      africanNews2026: 'African News 2026',
      aboutMalakin: 'ABOUT MALAKIN',
      whoAreWe: 'Who are we?',
      ourMission: 'Our Mission',
      ourTeam: 'Our Team',
      advertising: 'Advertising',
      malakinMediaNetwork: 'MALAKIN MEDIA NETWORK',
      malakinRadioAfrica: 'Malakin Radio Africa',
      focusEco: 'Focus Eco',
      youthTribune: 'Youth Tribune',
      malakinDocu: 'Malakin Docu',
      mediaObservatory: 'Media Observatory',
      partnerships: 'Partnerships',
      services: 'SERVICES',
      newsletters: 'Newsletters',
      rssFeeds: 'RSS Feeds',
      applications: 'APPLICATIONS',
      downloadApp: 'Download the Malakinfo.com app on mobile and tablet',
      legalNotices: 'Legal Notices',
      privacyPolicy: 'Privacy Policy',
      termsOfUse: 'Terms of Use',
      cookies: 'Cookies',
      notifications: 'Notifications',
      contactEmail: 'contact@malakinfo.com',
      phoneNumber: '+243 000 000 000',
      location: 'Kinshasa, Democratic Republic of Congo',
    },
    home: {
      featuredNews: 'Featured News',
      latestNews: 'Latest News',
      categories: 'Categories',
    },
    article: {
      backTo: 'Back to',
      readTime: 'min read',
      share: 'Share',
      relatedArticles: 'Related Articles',
      seeAllArticles: 'See all articles by this author',
      teamMalakin: 'Malakin Team',
    },
    nav: {
      home: 'Home',
      news: 'News',
      economy: 'Economy',
      scienceTech: 'Science & Tech',
      culture: 'Culture',
      sport: 'Sport',
      supportUs: 'Support Us',
      media: 'Media',
      pressReleases: 'Press Releases',
      practicalInfo: 'Practical Info',
      religion: 'Religion',
      employment: 'Employment',
      blog: 'Blog',
      about: 'About',
      contact: 'Contact',
      allNews: 'All News',
      politics: 'Politics',
      society: 'Society',
      health: 'Health',
      security: 'Security',
      environment: 'Environment',
      photos: 'Photos',
      videos: 'Videos',
      podcasts: 'Podcasts',
      live: 'Live',
      meditations: 'Meditations',
      homilies: 'Homilies',
      sacredMusic: 'Sacred Music',
      religiousAgenda: 'Religious Agenda',
      messageOfTime: 'Message of Time',
      music: 'Music',
      cinema: 'Cinema',
      arts: 'Arts',
      trends: 'Trends',
      football: 'Football',
      basketball: 'Basketball',
      athletics: 'Athletics',
      tennis: 'Tennis',
      events: 'Events',
      database: 'Database',
      dataAnalysis: 'Data Analysis',
      natureEnvironment: 'Nature & Environment',
      offersBySector: 'Offers by Sector',
      careerAdvice: 'Career Advice',
      scholarshipsInternships: 'Scholarships & Internships',
      guides: 'Guides',
      tutorials: 'Tutorials',
      resources: 'Resources',
      government: 'Government',
      religious: 'Religious',
      ngo: 'NGO',
      educational: 'Educational',
      tribunes: 'Tribunes',
      chronicles: 'Chronicles',
      investigations: 'Investigations',
      polls: 'Polls',
      mission: 'Mission',
      team: 'Team',
      charter: 'Charter',
      moreServices: 'More Services',
      servicesMalakin: 'Malakin Services',
      search: 'Search',
      archives: 'Archives',
      radioAfrica: 'Radio Africa',
      forumAfrica: 'Forum Africa',
      partnerships: 'Partnerships',
      support: 'Support',
      login: 'Login',
      jobOffers: 'Job offers',
      directs: 'Live',
      shopping: 'Shopping',
      newsletter: 'News in your inbox',
      menu: 'Menu',
      searchPlaceholder: 'Search...',
      magazine: 'Magazine',
      myProfile: 'My profile',
      myComments: 'My comments',
      myLikes: 'My likes',
      favorites: 'Favorites',
      settings: 'Settings',
      logout: 'Logout',
      close: 'Close',
      services: 'Services',
      subscribe: 'Subscribe',
      searchBarPlaceholder: 'Search articles, videos and news...',
      pressEscToClose: 'to close',
      pressEnterToSearch: 'to search',
      rankings: '20 COUNTRIES WITH THE BEST PERFORMANCE',
    },
  }),
  es: createMessages({
    common: {
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto',
      search: 'Buscar',
      readMore: 'Leer más',
      share: 'Compartir',
      back: 'Volver',
    },
    footer: {
      description: 'Noticias que cruzan fronteras. Informar, educar y conectar África mediante un periodismo independiente.',
      news: 'Noticias',
      sections: 'Secciones',
      about: 'Acerca de',
      legal: 'Legal',
      copyright: 'Todos los derechos reservados.',
      inTheNews: 'EN LAS NOTICIAS',
      aboutMalakin: 'SOBRE MALAKIN',
      whoAreWe: '¿Quiénes somos?',
      ourMission: 'Nuestra misión',
      ourTeam: 'Nuestro equipo',
      advertising: 'Publicidad',
      services: 'SERVICIOS',
      newsletters: 'Boletines',
      rssFeeds: 'RSS',
      applications: 'APLICACIONES',
      legalNotices: 'Avisos legales',
      privacyPolicy: 'Política de privacidad',
      termsOfUse: 'Términos de uso',
      cookies: 'Cookies',
      notifications: 'Notificaciones',
      contactEmail: 'contact@malakinfo.com',
      location: 'Kinshasa, República Democrática del Congo',
    },
    home: {
      featuredNews: 'Destacadas',
      latestNews: 'Últimas noticias',
      categories: 'Categorías',
    },
    article: {
      backTo: 'Volver a',
      readTime: 'min de lectura',
      share: 'Compartir',
      relatedArticles: 'Artículos relacionados',
      seeAllArticles: 'Ver todos los artículos de este autor',
      teamMalakin: 'Equipo Malakinfo',
    },
    nav: {
      home: 'Inicio',
      news: 'Noticias',
      economy: 'Economía',
      scienceTech: 'Ciencia y tecnología',
      culture: 'Cultura',
      sport: 'Deporte',
      supportUs: 'Apóyanos',
      media: 'Medios',
      pressReleases: 'Comunicados',
      practicalInfo: 'Información práctica',
      religion: 'Religión',
      employment: 'Empleo',
      blog: 'Blog',
      about: 'Acerca de',
      contact: 'Contacto',
      search: 'Buscar',
      login: 'Iniciar sesión',
      jobOffers: 'Ofertas de empleo',
      directs: 'Directos',
      shopping: 'Compra',
      newsletter: 'La información en tu correo',
      menu: 'Menú',
      searchPlaceholder: 'Buscar...',
      magazine: 'Revista',
      myProfile: 'Mi perfil',
      myComments: 'Mis comentarios',
      myLikes: 'Mis me gustas',
      favorites: 'Favoritos',
      settings: 'Configuración',
      logout: 'Cerrar sesión',
      close: 'Cerrar',
      services: 'Servicios',
      subscribe: 'Suscribirse',
      searchBarPlaceholder: 'Buscar artículos, videos y noticias...',
      pressEscToClose: 'para cerrar',
      pressEnterToSearch: 'para buscar',
      rankings: '20 PAÍSES CON MEJOR RENDIMIENTO',
    },
  }),
  sw: createMessages({
    common: {
      home: 'Mwanzo',
      about: 'Kuhusu',
      contact: 'Mawasiliano',
      search: 'Tafuta',
      readMore: 'Soma zaidi',
      share: 'Shiriki',
      back: 'Rudi',
    },
    home: {
      featuredNews: 'Habari za Mbele',
      latestNews: 'Habari za hivi karibuni',
      categories: 'Aina',
    },
    article: {
      backTo: 'Rudi kwa',
      readTime: 'dakika za kusoma',
      share: 'Shiriki',
      relatedArticles: 'Makala yanayohusiana',
      seeAllArticles: 'Ona makala zote ya mwandishi huyu',
      teamMalakin: 'Timu ya Malakinfo',
    },
    nav: {
      home: 'Mwanzo',
      news: 'Habari',
      economy: 'Uchumi',
      scienceTech: 'Sayansi na Teknolojia',
      culture: 'Utamaduni',
      sport: 'Michezo',
      supportUs: 'Tutegemeze',
      media: 'Vyombo vya habari',
      pressReleases: 'Taarifa',
      practicalInfo: 'Habari muhimu',
      religion: 'Dini',
      employment: 'Ajira',
      blog: 'Blogi',
      about: 'Kuhusu',
      contact: 'Mawasiliano',
      search: 'Tafuta',
      login: 'Ingia',
      jobOffers: 'Misala ya mosala',
      directs: 'Bokanga',
      shopping: 'Zua',
      newsletter: 'Makambo na poso na yo',
      menu: 'Mibale',
      searchPlaceholder: 'Koluka...',
      magazine: 'Magasini',
      myProfile: 'Profilo na ngai',
      myComments: 'Maye nakomoni',
      myLikes: 'Nalingi',
      favorites: 'Baloki',
      settings: 'Mikanda',
      logout: 'Kobima',
      close: 'Kanga',
      services: 'Misala',
      subscribe: 'Kota',
      searchBarPlaceholder: 'Koluka mikanda, video na makambo...',
      pressEscToClose: 'pamba na kobanga',
      pressEnterToSearch: 'pamba na koluka',
      rankings: '20 BANA PAYS YA KOBETELA',
    },
  }),
  ln: createMessages({
    common: {
      home: 'Ndako',
      about: 'Na ntina',
      contact: 'Kokisa',
      search: 'Koluka',
      readMore: 'Tanga mosala',
      share: 'Kobakisa',
      back: 'Zonga',
    },
    home: {
      featuredNews: 'Makambo ya liboso',
      latestNews: 'Makambo ya sika',
      categories: 'Bikotisa',
    },
    nav: {
      home: 'Ndako',
      news: 'Makambo',
      economy: 'Mbongo',
      scienceTech: 'Sansi mpe teknoloji',
      culture: 'Miziki',
      sport: 'Mikanda',
      supportUs: 'Tonda lisalisi',
      contact: 'Kokisa',
      search: 'Koluka',
      login: 'Kota',
    },
  }),
  rw: createMessages({
    common: {
      home: 'Ahabanza',
      about: 'Ibyerekeye',
      contact: 'Twandikire',
      search: 'Shakisha',
      readMore: 'Soma byinshi',
      share: 'Sangiza',
      back: 'Subira',
    },
    home: {
      featuredNews: 'Amakuru ya mbere',
      latestNews: 'Amakuru mashya',
      categories: 'Ibyiciro',
    },
    nav: {
      home: 'Ahabanza',
      news: 'Amakuru',
      economy: 'Ubukungu',
      scienceTech: 'Ikoranabuhanga',
      culture: 'Umuco',
      sport: 'Imikino',
      supportUs: 'Dufashe',
      contact: 'Twandikire',
      search: 'Shakisha',
      login: 'Injira',
      jobOffers: "Amahirwe y'akazi",
      directs: 'Aho gutambuka',
      shopping: 'Gugura',
      newsletter: 'Amakuru mu ibaruwa yawe',
      menu: 'Ibyo menu',
      searchPlaceholder: 'Shakisha...',
      magazine: 'Ikinyamakuru',
      myProfile: 'Iprofile yanjye',
      myComments: 'Ibisobanuro byanjye',
      myLikes: 'Ibyanjye nkunda',
      favorites: 'Ibyahisemo',
      settings: 'Igenamiterere',
      logout: 'Gusohoka',
      close: 'Gufunga',
      services: 'Service',
      subscribe: 'Kwiyandikisha',
      searchBarPlaceholder: 'Shakisha inkuru, videwo n’amakuru...',
      pressEscToClose: 'kugirango ufunge',
      pressEnterToSearch: 'kugirango ushake',
      rankings: '20 BISHIMI BYA HIGARI',
    },
  }),
};

export function normalizeLocale(locale?: string | null): SupportedLocale {
  const value = locale?.toLowerCase();
  if (value === 'en') return 'en';
  if (value === 'fr') return 'fr';
  if (value === 'es') return 'es';
  if (value === 'sw') return 'sw';
  if (value === 'ln') return 'ln';
  if (value === 'rw') return 'rw';
  return defaultLocale;
}

export function isSupportedLocale(locale?: string | null): locale is SupportedLocale {
  return supportedLocales.includes(locale as SupportedLocale);
}

export function getMessages(locale?: string | null) {
  const normalized = normalizeLocale(locale);
  return translations[normalized] || translations[defaultLocale];
}

export function getLocaleFromPathname(pathname?: string | null) {
  const segments = pathname?.split('/').filter(Boolean) || [];
  const first = segments[0];
  if (first && isSupportedLocale(first)) {
    return first as SupportedLocale;
  }
  return defaultLocale;
}

export function getLocalizedPath(pathname: string, locale: string) {
  const normalized = normalizeLocale(locale);
  const pathSegments = pathname.split('/').filter(Boolean);
  const currentLocale = pathSegments[0] && isSupportedLocale(pathSegments[0]) ? pathSegments[0] : null;

  if (currentLocale) {
    pathSegments[0] = normalized;
  } else {
    pathSegments.unshift(normalized);
  }

  return `/${pathSegments.join('/')}`;
}

export function getLanguageOptions() {
  return [
    { value: 'fr', short: 'FR', label: 'Français' },
    { value: 'en', short: 'EN', label: 'English' },
    { value: 'es', short: 'ES', label: 'Español' },
    { value: 'sw', short: 'SW', label: 'Kiswahili' },
    { value: 'ln', short: 'LN', label: 'Lingala' },
    { value: 'rw', short: 'RW', label: 'Kinyarwanda' },
  ];
}

export function getLocaleDisplayName(locale?: string | null) {
  const option = getLanguageOptions().find((item) => item.value === normalizeLocale(locale));
  return option?.label || 'Français';
}
