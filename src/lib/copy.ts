import { normalizeLocale, type SupportedLocale } from '@/lib/i18n';

export function pickCopy(
  locale: string | null | undefined,
  copies: Partial<Record<SupportedLocale, string>> & { fr: string }
) {
  const normalized = normalizeLocale(locale);
  return copies[normalized] || copies.en || copies.fr;
}

export function getDateLocale(locale?: string | null) {
  switch (normalizeLocale(locale)) {
    case 'en':
      return 'en-US';
    case 'es':
      return 'es-ES';
    case 'sw':
      return 'sw-KE';
    case 'rw':
      return 'rw-RW';
    default:
      return 'fr-FR';
  }
}

export function localeFromPathname(pathname?: string | null) {
  return normalizeLocale(pathname?.split('/').filter(Boolean)[0]);
}

export const newsCardClass =
  'group overflow-hidden border border-border bg-card text-card-foreground transition duration-300 hover:-translate-y-1 hover:border-secondary';

export const copies = {
  read: {
    fr: 'Lire',
    en: 'Read',
    es: 'Leer',
    sw: 'Soma',
    ln: 'Tanga',
    rw: 'Soma',
  },
  readMore: {
    fr: 'Lire la suite',
    en: 'Read more',
    es: 'Leer más',
    sw: 'Soma zaidi',
    ln: 'Tanga mingi',
    rw: 'Soma byinshi',
  },
  featured: {
    fr: 'À la une',
    en: 'Featured',
    es: 'Destacadas',
    sw: 'Habari kuu',
    ln: 'Makambo ya liboso',
    rw: 'Amakuru ya mbere',
  },
  latestNews: {
    fr: 'Dernières actualités',
    en: 'Latest news',
    es: 'Últimas noticias',
    sw: 'Habari za hivi karibuni',
    ln: 'Makambo ya sika',
    rw: 'Amakuru mashya',
  },
  latestStories: {
    fr: 'Dernières informations',
    en: 'Latest stories',
    es: 'Últimas informaciones',
    sw: 'Habari mpya',
    ln: 'Sango ya sika',
    rw: 'Amakuru mashya',
  },
  news: {
    fr: 'Actualités',
    en: 'News',
    es: 'Noticias',
    sw: 'Habari',
    ln: 'Sango',
    rw: 'Amakuru',
  },
  noArticles: {
    fr: 'Aucun article disponible pour le moment.',
    en: 'No articles available yet.',
    es: 'Todavía no hay artículos disponibles.',
    sw: 'Bado hakuna makala.',
    ln: 'Article ezali naino te.',
    rw: 'Nta nkuru zirimo.',
  },
  backHome: {
    fr: "Retour à l'accueil",
    en: 'Back to home',
    es: 'Volver al inicio',
    sw: 'Rudi nyumbani',
    ln: 'Zonga na ebandeli',
    rw: 'Subira ku ntangiriro',
  },
  allNews: {
    fr: 'Toutes les actualités',
    en: 'All news',
    es: 'Todas las noticias',
    sw: 'Habari zote',
    ln: 'Sango nionso',
    rw: 'Amakuru yose',
  },
  seeNews: {
    fr: 'Voir les actualités',
    en: 'See the news',
    es: 'Ver las noticias',
    sw: 'Tazama habari',
    ln: 'Tala sango',
    rw: 'Reba amakuru',
  },
  noArticlesInSection: {
    fr: 'Aucun article n’est encore publié dans cette rubrique.',
    en: 'No articles have been published in this section yet.',
    es: 'Todavía no hay artículos en esta sección.',
    sw: 'Bado hakuna makala katika sehemu hii.',
    ln: 'Article ezali naino te na eteni oyo.',
    rw: 'Nta nkuru zirimo muri iki cyiciro.',
  },
  checkBackSoon: {
    fr: 'Revenez bientôt ou parcourez les dernières actualités.',
    en: 'Please check back soon or browse the latest news.',
    es: 'Vuelve pronto o consulta las últimas noticias.',
    sw: 'Rudi tena hivi karibuni au tazama habari mpya.',
    ln: 'Zonga naino to tala sango ya sika.',
    rw: 'Garuka vuba cyangwa usome amakuru mashya.',
  },
  liveEvents: {
    fr: 'Événements en direct',
    en: 'Live events',
    es: 'Eventos en directo',
    sw: 'Matukio ya moja kwa moja',
    ln: 'Ba événement na direct',
    rw: 'Ibirori kuri live',
  },
  followLives: {
    fr: 'Suivez nos diffusions en direct',
    en: 'Follow our live broadcasts',
    es: 'Sigue nuestras emisiones en directo',
    sw: 'Fuata matangazo yetu moja kwa moja',
    ln: 'Landá ba diffusion na biso na direct',
    rw: 'Kurikira ibiganiro byacu kuri live',
  },
  live: {
    fr: 'EN DIRECT',
    en: 'LIVE',
    es: 'EN DIRECTO',
    sw: 'MOJA KWA MOJA',
    ln: 'NA DIRECT',
    rw: 'LIVE',
  },
  scheduled: {
    fr: 'PROGRAMMÉ',
    en: 'SCHEDULED',
    es: 'PROGRAMADO',
    sw: 'IMEPANGWA',
    ln: 'EPONAMI',
    rw: 'BYTEGANIJWE',
  },
  viewers: {
    fr: 'spectateurs',
    en: 'viewers',
    es: 'espectadores',
    sw: 'watazamaji',
    ln: 'ba talaka',
    rw: 'abareba',
  },
  previous: {
    fr: 'Précédent',
    en: 'Previous',
    es: 'Anterior',
    sw: 'Iliyotangulia',
    ln: 'Ya liboso',
    rw: 'Ibanjirije',
  },
  next: {
    fr: 'Suivant',
    en: 'Next',
    es: 'Siguiente',
    sw: 'Ifuatayo',
    ln: 'Ya nsima',
    rw: 'Ikurikira',
  },
  all: {
    fr: 'Toutes',
    en: 'All',
    es: 'Todas',
    sw: 'Zote',
    ln: 'Nionso',
    rw: 'Byose',
  },
  localEdition: {
    fr: 'Edition locale',
    en: 'Local edition',
    es: 'Edición local',
    sw: 'Toleo la ndani',
    ln: 'Edition ya mboka',
    rw: 'Inyandiko yo mu gihugu',
  },
  loading: {
    fr: 'Chargement...',
    en: 'Loading...',
    es: 'Cargando...',
    sw: 'Inapakia...',
    ln: 'Ezali ko charger...',
    rw: 'Birimo gupakira...',
  },
  emailPlaceholder: {
    fr: 'Votre adresse email',
    en: 'Your email address',
    es: 'Tu correo electrónico',
    sw: 'Barua pepe yako',
    ln: 'Adresse email na yo',
    rw: 'Imeri yawe',
  },
  sending: {
    fr: 'Envoi...',
    en: 'Sending...',
    es: 'Enviando...',
    sw: 'Inatuma...',
    ln: 'Ezali kotinda...',
    rw: 'Kohereza...',
  },
  invalidEmail: {
    fr: 'Veuillez saisir une adresse email valide.',
    en: 'Please enter a valid email address.',
    es: 'Introduce un correo electrónico válido.',
    sw: 'Tafadhali weka barua pepe sahihi.',
    ln: 'Tyá adresse email ya solo.',
    rw: 'Shyiramo imeri nyayo.',
  },
  newsletterThanks: {
    fr: 'Merci, vous êtes inscrit à la newsletter.',
    en: 'Thank you, you are subscribed to the newsletter.',
    es: 'Gracias, te has suscrito al boletín.',
    sw: 'Asante, umejiandikisha kwa jarida.',
    ln: 'Matondi, okoti na newsletter.',
    rw: 'Murakoze, mwiyandikishije kuri newsletter.',
  },
  newsletterAlreadySubscribed: {
    fr: 'Cet email est déjà inscrit à la newsletter.',
    en: 'This email is already subscribed to the newsletter.',
    es: 'Este correo ya está suscrito al boletín.',
    sw: 'Barua pepe hii tayari imesajiliwa kwenye jarida.',
    ln: 'Email oyo ekoti na newsletter déjà.',
    rw: 'Iyi imeri yamaze kwiyandikisha kuri newsletter.',
  },
  newsletterError: {
    fr: 'Une erreur est survenue.',
    en: 'An error occurred.',
    es: 'Se ha producido un error.',
    sw: 'Hitilafu imetokea.',
    ln: 'Erreur ekomi.',
    rw: 'Hari ikosa ryabaye.',
  },
  fromFavorites: {
    fr: 'Depuis vos favoris',
    en: 'From your favorites',
    es: 'Desde tus favoritos',
    sw: 'Kutoka kwa vipendwa vyako',
    ln: 'Uta na ba favori na yo',
    rw: 'Kuva mu byo ukunda',
  },
  close: {
    fr: 'Fermer',
    en: 'Close',
    es: 'Cerrar',
    sw: 'Funga',
    ln: 'Fungola',
    rw: 'Funga',
  },
  readThisArticle: {
    fr: 'Lire cet article',
    en: 'Read this article',
    es: 'Leer este artículo',
    sw: 'Soma makala hii',
    ln: 'Tanga article oyo',
    rw: 'Soma iyi nkuru',
  },
} as const;

export function t(locale: string | null | undefined, key: keyof typeof copies) {
  return pickCopy(locale, copies[key]);
}

export const accountCopies = {
  settings: {
    fr: 'Paramètres',
    en: 'Settings',
    es: 'Ajustes',
    sw: 'Mipangilio',
    ln: 'Paramètre',
    rw: 'Igenamiterere',
  },
  settingsSubtitle: {
    fr: 'Gérez vos préférences de compte',
    en: 'Manage your account preferences',
    es: 'Gestiona las preferencias de tu cuenta',
    sw: 'Dhibiti mapendeleo ya akaunti yako',
    ln: 'Tonga ba préférences ya compte na yo',
    rw: 'Tegura ibyo ukunda kuri konti yawe',
  },
  loginRequired: {
    fr: 'Connexion requise',
    en: 'Sign in required',
    es: 'Inicio de sesión obligatorio',
    sw: 'Unahitaji kuingia',
    ln: 'Okoki koya',
    rw: 'Ugomba kwinjira',
  },
  loginRequiredHint: {
    fr: 'Connectez-vous pour gérer la langue et le thème du site.',
    en: 'Sign in to manage the site language and theme.',
    es: 'Inicia sesión para gestionar el idioma y el tema del sitio.',
    sw: 'Ingia ili kudhibiti lugha na mandhari ya tovuti.',
    ln: 'Kota mpo na kotonga monoko mpe thème ya site.',
    rw: 'Injira kugira ngo uhindure ururimi n’insanganyamatsiko.',
  },
  signIn: {
    fr: 'Se connecter',
    en: 'Sign in',
    es: 'Iniciar sesión',
    sw: 'Ingia',
    ln: 'Kota',
    rw: 'Injira',
  },
  notifications: {
    fr: 'Notifications',
    en: 'Notifications',
    es: 'Notificaciones',
    sw: 'Arifa',
    ln: 'Ba notification',
    rw: 'Amatangazo',
  },
  emailNewsletter: {
    fr: 'Newsletter par email',
    en: 'Email newsletter',
    es: 'Boletín por correo',
    sw: 'Jarida la barua pepe',
    ln: 'Newsletter na email',
    rw: 'Newsletter kuri imeri',
  },
  emailNewsletterHint: {
    fr: 'Recevoir les actualités par email',
    en: 'Receive news by email',
    es: 'Recibir las noticias por correo',
    sw: 'Pokea habari kwa barua pepe',
    ln: 'Zwa sango na email',
    rw: 'Akira amakuru kuri imeri',
  },
  dailyDigest: {
    fr: 'Digest quotidien',
    en: 'Daily digest',
    es: 'Resumen diario',
    sw: 'Muhtasari wa kila siku',
    ln: 'Résumé ya mokolo',
    rw: 'Incamake ya buri munsi',
  },
  dailyDigestHint: {
    fr: 'Résumé quotidien des articles',
    en: 'Daily summary of articles',
    es: 'Resumen diario de artículos',
    sw: 'Muhtasari wa makala kila siku',
    ln: 'Résumé ya ba article ya mokolo',
    rw: 'Incamake y’inkuru buri munsi',
  },
  language: {
    fr: 'Langue',
    en: 'Language',
    es: 'Idioma',
    sw: 'Lugha',
    ln: 'Monoko',
    rw: 'Ururimi',
  },
  theme: {
    fr: 'Thème',
    en: 'Theme',
    es: 'Tema',
    sw: 'Mandhari',
    ln: 'Thème',
    rw: 'Insanganyamatsiko',
  },
  light: {
    fr: 'Clair',
    en: 'Light',
    es: 'Claro',
    sw: 'Mwanga',
    ln: 'Pembe',
    rw: 'Urumuri',
  },
  dark: {
    fr: 'Sombre bleu / noir',
    en: 'Dark blue / black',
    es: 'Azul oscuro / negro',
    sw: 'Bluu nyeusi / nyeusi',
    ln: 'Bleu ya molili / moindo',
    rw: 'Ubururu bwijimye / umukara',
  },
  security: {
    fr: 'Sécurité',
    en: 'Security',
    es: 'Seguridad',
    sw: 'Usalama',
    ln: 'Sécurité',
    rw: 'Umutekano',
  },
  changePassword: {
    fr: 'Changer mon mot de passe',
    en: 'Change my password',
    es: 'Cambiar mi contraseña',
    sw: 'Badilisha nenosiri langu',
    ln: 'Bongola mot de passe na ngai',
    rw: 'Hindura ijambo ry’ibanga',
  },
  enable2fa: {
    fr: "Activer l'authentification à deux facteurs",
    en: 'Enable two-factor authentication',
    es: 'Activar la autenticación en dos pasos',
    sw: 'Washa uthibitishaji wa hatua mbili',
    ln: 'Tinda authentification ya ba facteur mibale',
    rw: 'Fungura kwemeza mu buryo bubiri',
  },
  deleteAccount: {
    fr: 'Supprimer mon compte',
    en: 'Delete my account',
    es: 'Eliminar mi cuenta',
    sw: 'Futa akaunti yangu',
    ln: 'Longola compte na ngai',
    rw: 'Siba konti yanjye',
  },
  saveChanges: {
    fr: 'Enregistrer les modifications',
    en: 'Save changes',
    es: 'Guardar cambios',
    sw: 'Hifadhi mabadiliko',
    ln: 'Bomba ba changement',
    rw: 'Bika impinduka',
  },
  saving: {
    fr: 'Enregistrement...',
    en: 'Saving...',
    es: 'Guardando...',
    sw: 'Inahifadhi...',
    ln: 'Ezali kobomba...',
    rw: 'Birimo kubika...',
  },
  logout: {
    fr: 'Déconnexion',
    en: 'Sign out',
    es: 'Cerrar sesión',
    sw: 'Toka',
    ln: 'Bima',
    rw: 'Sohoka',
  },
} as const;

export function tAccount(locale: string | null | undefined, key: keyof typeof accountCopies) {
  return pickCopy(locale, accountCopies[key]);
}

