export const MENU_HUB_SLUGS = new Set([
  'actualite',
  'actualites',
  'culture',
  'emploi',
  'infos-pratiques',
  'medias',
  'message-du-temps',
  'religion',
  'science-tech',
  'sport',
]);

export function isMenuHubSlug(slug: string | undefined | null) {
  return Boolean(slug && MENU_HUB_SLUGS.has(slug));
}

export function uniqueMenuLinks<T extends { href: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    if (seen.has(item.href)) {
      return false;
    }
    seen.add(item.href);
    return true;
  });
}
