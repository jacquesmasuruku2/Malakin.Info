type RevalidateArticleInput = {
  slug?: string | null;
  categorySlug?: string | null;
};

/**
 * Ask the public Next.js site to invalidate ISR caches after admin mutations.
 * Failures are logged but never block article save.
 */
export async function revalidatePublicArticle(article?: RevalidateArticleInput) {
  const mainSiteUrl = process.env.NEXT_PUBLIC_MAIN_SITE_URL?.replace(/\/$/, '');
  const secret = process.env.REVALIDATE_SECRET || process.env.CRON_SECRET;

  if (!mainSiteUrl || !secret) {
    console.warn(
      '[revalidate] Skipped: NEXT_PUBLIC_MAIN_SITE_URL or REVALIDATE_SECRET/CRON_SECRET missing',
    );
    return;
  }

  try {
    const response = await fetch(`${mainSiteUrl}/api/revalidate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-revalidate-secret': secret,
      },
      body: JSON.stringify({
        slug: article?.slug || undefined,
        categorySlug: article?.categorySlug || undefined,
      }),
    });

    if (!response.ok) {
      const payload = await response.text().catch(() => '');
      console.error('[revalidate] Failed:', response.status, payload);
    }
  } catch (error) {
    console.error('[revalidate] Request error:', error);
  }
}
