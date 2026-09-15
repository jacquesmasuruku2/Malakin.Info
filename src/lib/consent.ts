export const CONSENT_STORAGE_KEY = 'malakinfo_cookie_consent';
export const CONSENT_PREFERENCES_KEY = 'malakinfo_cookie_preferences';
export const CONSENT_UPDATED_EVENT = 'malakinfo:consent-updated';

export type ConsentPreferences = Record<string, boolean>;

export const CONSENT_CATEGORIES = [
  { key: 'improveServices', label: 'Développer et améliorer les services', required: false },
  { key: 'adsPersonalization', label: 'Publicité et contenus personnalisés', required: false },
  { key: 'deviceAnalytics', label: "Analyser activement les caractéristiques de l'appareil pour l'identification", required: false },
  { key: 'profilePersonalization', label: 'Créer des profils de contenus personnalisés', required: false },
  { key: 'contentPerformance', label: 'Mesurer la performance des contenus', required: false },
  { key: 'preciseLocation', label: 'Utiliser des données de géolocalisation précises', required: false },
  { key: 'functionality', label: 'Fonctionnement', required: true },
  { key: 'personalizedContent', label: 'Utiliser mes informations personnelles pour des contenus ciblés', required: false },
] as const;

export const DEFAULT_CONSENT_PREFERENCES: ConsentPreferences = Object.fromEntries(
  CONSENT_CATEGORIES.map((category) => [category.key, true]),
);

export function hasCustomizedConsent() {
  if (typeof window === 'undefined') return false;
  return window.localStorage.getItem(CONSENT_STORAGE_KEY) === 'configured';
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
