export const CONSENT_STORAGE_KEY = 'malakinfo_cookie_consent';
export const CONSENT_PREFERENCES_KEY = 'malakinfo_cookie_preferences';
export const CONSENT_UPDATED_EVENT = 'malakinfo:consent-updated';

export type ConsentPreferences = Record<string, boolean>;

export function readConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;

  const consent = window.localStorage.getItem(CONSENT_STORAGE_KEY);
  if (!consent) return null;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(CONSENT_PREFERENCES_KEY) || '{}') as ConsentPreferences;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function allowsAnalytics(preferences: ConsentPreferences | null) {
  if (!preferences) return false;
  return Boolean(
    preferences.deviceAnalytics ||
      preferences.contentPerformance ||
      preferences.improveServices
  );
}

export function allowsAds(preferences: ConsentPreferences | null) {
  if (!preferences) return false;
  return Boolean(
    preferences.adsPersonalization ||
      preferences.profilePersonalization ||
      preferences.personalizedContent
  );
}
