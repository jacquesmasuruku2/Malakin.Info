export const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_ID || 'ca-pub-4621769509750492';

export const ADSENSE_SLOTS = {
  home: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME?.trim() || '',
  inArticle: process.env.NEXT_PUBLIC_ADSENSE_SLOT_IN_ARTICLE?.trim() || '',
  sidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SIDEBAR?.trim() || '',
};
