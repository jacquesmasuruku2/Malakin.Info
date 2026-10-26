export type SocialEmbedPlatform = 'x' | 'facebook';

export interface SocialEmbedData {
  platform: SocialEmbedPlatform;
  url: string;
  src: string;
  title: string;
  height: number;
}

export function normalizeSocialEmbed(
  platform: SocialEmbedPlatform,
  value: string
): SocialEmbedData | null {
  let url: URL;
  try {
    url = new URL(value.trim());
  } catch {
    return null;
  }

  if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
  if (url.username || url.password) return null;

  const hostname = url.hostname.toLowerCase();
  if (platform === 'x') {
    if (!['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'].includes(hostname)) {
      return null;
    }

    const statusId = url.pathname.match(/\/status(?:es)?\/(\d+)(?:\/|$)/i)?.[1];
    if (!statusId) return null;

    const canonicalUrl = `https://x.com/i/status/${statusId}`;
    return {
      platform,
      url: canonicalUrl,
      src: `https://platform.twitter.com/embed/Tweet.html?id=${statusId}&dnt=true`,
      title: 'Publication X',
      height: 600,
    };
  }

  if (!['facebook.com', 'www.facebook.com', 'm.facebook.com', 'web.facebook.com'].includes(hostname)) {
    return null;
  }

  const isPostPath = /\/(?:posts|permalink|photos|videos|watch|reel|share\/[pv])(?:\/|$)/i.test(url.pathname);
  const isPhoto = /\/photo\.php$/i.test(url.pathname) && url.searchParams.has('fbid');
  const isStory = /\/story\.php$/i.test(url.pathname) && url.searchParams.has('story_fbid');
  if (!isPostPath && !isPhoto && !isStory) return null;

  url.protocol = 'https:';
  url.hash = '';
  const canonicalUrl = url.toString();
  const embedUrl = new URL('https://www.facebook.com/plugins/post.php');
  embedUrl.searchParams.set('href', canonicalUrl);
  embedUrl.searchParams.set('show_text', 'true');
  embedUrl.searchParams.set('width', '500');

  return {
    platform,
    url: canonicalUrl,
    src: embedUrl.toString(),
    title: 'Publication Facebook',
    height: 700,
  };
}
