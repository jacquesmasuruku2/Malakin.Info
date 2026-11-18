export const CONSENT_STORAGE_KEY = 'malakinfo_cookie_consent';
export const CONSENT_PREFERENCES_KEY = 'malakinfo_cookie_preferences';
export const CONSENT_SAVED_AT_KEY = 'malakinfo_cookie_consent_saved_at';
export const CONSENT_UPDATED_EVENT = 'malakinfo:consent-updated';
export const NON_ESSENTIAL_NOTIFICATIONS_DELAY_MS = 3 * 60 * 1000;

export type ConsentPreferences = Record<string, boolean>;

export const CONSENT_CATEGORIES = [
  {
    key: 'improveServices',
    label: 'Développer et améliorer les services',
    description: 'Ces cookies aident à comprendre comment le site est utilisé, afin de repérer ce qui fonctionne bien et ce qui peut être amélioré.',
    required: false,
  },
  {
    key: 'adsPersonalization',
    label: 'Publicité et contenus personnalisés',
    description: 'Ils permettent de proposer des publicités et des contenus plus proches de vos centres d’intérêt. Si vous les refusez, vous pourrez toujours voir des publicités, mais elles seront moins personnalisées.',
    required: false,
  },
  {
    key: 'deviceAnalytics',
    label: "Analyser activement les caractéristiques de l'appareil pour l'identification",
    description: 'Ces cookies peuvent utiliser des informations techniques comme le navigateur ou le type d’appareil pour mesurer l’utilisation du site et contribuer à son bon fonctionnement.',
    required: false,
  },
  {
    key: 'profilePersonalization',
    label: 'Créer des profils de contenus personnalisés',
    description: 'Ils peuvent rapprocher vos préférences et votre activité sur le site pour établir des centres d’intérêt et adapter les contenus qui vous sont proposés.',
    required: false,
  },
  {
    key: 'contentPerformance',
    label: 'Mesurer la performance des contenus',
    description: 'Ils servent à mesurer les articles consultés et les interactions avec les contenus, afin de comprendre ce qui intéresse les lecteurs et d’améliorer leur présentation.',
    required: false,
  },
  {
    key: 'preciseLocation',
    label: 'Utiliser des données de géolocalisation précises',
    description: 'Si vous l’autorisez, des services intégrés peuvent utiliser la position précise de votre appareil pour adapter certains services ou contenus à votre emplacement.',
    required: false,
  },
  {
    key: 'functionality',
    label: 'Fonctionnement',
    description: 'Ces cookies mémorisent les réglages indispensables, comme votre choix de consentement, et permettent aux fonctions essentielles du site de fonctionner. Ils ne peuvent pas être désactivés.',
    required: true,
  },
  {
    key: 'personalizedContent',
    label: 'Utiliser mes informations personnelles pour des contenus ciblés',
    description: 'Ils autorisent l’utilisation des informations que vous partagez et de votre activité pour vous proposer des contenus adaptés à vos centres d’intérêt.',
    required: false,
  },
] as const;

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = Object.fromEntries(
  CONSENT_CATEGORIES.map((category) => [category.key, category.required]),
);

export function hasCustomizedConsent() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'configured';
}

export function getConsentSavedAt() {
  if (typeof window === 'undefined' || !hasCustomizedConsent()) return null;
  const savedAt = Number(window.localStorage.getItem(CONSENT_SAVED_AT_KEY));
  return Number.isFinite(savedAt) && savedAt > 0 ? savedAt : null;
}

export function readConsentPreferences(): ConsentPreferences {
  if (typeof window === 'undefined' || !hasCustomizedConsent()) {
    return { ...DEFAULT_CONSENT_PREFERENCES };
  }

  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(CONSENT_PREFERENCES_KEY) || '{}',
    ) as ConsentPreferences;
    return parsed && typeof parsed === 'object'
      ? { ...DEFAULT_CONSENT_PREFERENCES, ...parsed }
      : { ...DEFAULT_CONSENT_PREFERENCES };
  } catch {
    return { ...DEFAULT_CONSENT_PREFERENCES };
  }
}

export function allowsAnalytics(preferences: ConsentPreferences | null) {
  const resolved = preferences ?? DEFAULT_CONSENT_PREFERENCES;
  return Boolean(
    resolved.deviceAnalytics ||
      resolved.contentPerformance ||
      resolved.improveServices,
  );
}

export function allowsAds(preferences: ConsentPreferences | null) {
  const resolved = preferences ?? DEFAULT_CONSENT_PREFERENCES;
  return Boolean(
    resolved.adsPersonalization ||
      resolved.profilePersonalization ||
      resolved.personalizedContent,
  );
}
