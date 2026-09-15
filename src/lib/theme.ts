export const THEME_STORAGE_KEY = 'malakinfo.theme';
export const USER_UPDATED_EVENT = 'malakinfo-user-updated';
export const THEME_CHANGED_EVENT = 'malakinfo-theme-changed';

export type SiteTheme = 'light' | 'dark';

export function getStoredTheme(): SiteTheme {
  if (typeof window === 'undefined') return 'light';
  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: SiteTheme) {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
}

export function clearTheme() {
  if (typeof document === 'undefined') return;

  const root = document.documentElement;
  root.classList.remove('dark');
  root.style.colorScheme = 'light';
  window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
}

export function notifyUserUpdated() {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(USER_UPDATED_EVENT));
}

export function persistLocalUser(user: Record<string, unknown>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('user', JSON.stringify(user));
  notifyUserUpdated();
}

export function logoutLocalSession() {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem('user');
  window.localStorage.removeItem('token');
  clearTheme();
  notifyUserUpdated();
  void fetch('/api/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {
    // Local session is already cleared even if the cookie request fails.
  });
}
