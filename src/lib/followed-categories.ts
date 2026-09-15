export type FollowedCategory = {
  id: string;
  title: string;
};

const FOLLOWED_KEY = 'malakinfo.followedCategories';
const LAST_NOTIFY_KEY = 'malakinfo.lastCategoryNotifyAt';
const NOTIFY_COOLDOWN_MS = 6 * 60 * 60 * 1000;

export function getFollowedCategories(): FollowedCategory[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(FOLLOWED_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => item?.id && item?.title) : [];
  } catch {
    return [];
  }
}

export function followCategory(category: FollowedCategory) {
  if (typeof window === 'undefined' || !category.id) return;

  const current = getFollowedCategories().filter((item) => item.id !== category.id);
  window.localStorage.setItem(FOLLOWED_KEY, JSON.stringify([category, ...current].slice(0, 12)));
}

export function canNotifyFollowedCategory() {
  if (typeof window === 'undefined') return false;

  const last = Number(window.localStorage.getItem(LAST_NOTIFY_KEY) || 0);
  return !last || Date.now() - last > NOTIFY_COOLDOWN_MS;
}

export function markFollowedCategoryNotified() {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LAST_NOTIFY_KEY, String(Date.now()));
}

export type SuggestedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  mainImageUrl: string | null;
  categoryTitle: string | null;
};

export async function fetchCategorySuggestion(categoryId: string, excludeId?: string) {
  const params = new URLSearchParams({ categoryId });
  if (excludeId) params.set('excludeId', excludeId);

  const response = await fetch(`/api/articles/suggest?${params.toString()}`);
  if (!response.ok) return null;

  const data = await response.json();
  return (data?.article as SuggestedArticle | null) ?? null;
}

export function showCategoryNotification(
  locale: string,
  categoryTitle: string,
  article: SuggestedArticle,
) {
  if (typeof window === 'undefined' || !('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const url = `/${locale}/${article.slug}`;
  const notification = new Notification(
    locale === 'fr' ? `À lire aussi · ${categoryTitle}` : `More in ${categoryTitle}`,
    {
      body: article.title,
      icon: article.mainImageUrl || '/images/logo.png',
      tag: `malakinfo-category-${article.id}`,
    },
  );

  notification.onclick = () => {
    window.focus();
    window.location.href = url;
    notification.close();
  };

  return true;
}
