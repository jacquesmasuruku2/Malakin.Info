export type NewsletterArticle = {
  id: string;
  title: string;
  excerpt?: string | null;
  slug?: string | null;
  mainImageUrl?: string | null;
  publishedAt?: string | Date | null;
  category?: {
    title?: string | null;
    slug?: string | null;
  } | null;
};

const escapeHtml = (value: string | null | undefined) =>
  (value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const normalizeText = (value: string | null | undefined, maxLength = 200) => {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return '';
  return text.length > maxLength ? `${text.slice(0, maxLength).trim()}...` : text;
};

const buildArticleUrl = (article: NewsletterArticle) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://malakinfo.com';
  const categorySlug = article.category?.slug || 'actualites';
  const slug = article.slug || '';
  return `${baseUrl.replace(/\/$/, '')}/${categorySlug}/${slug}`;
};

export function generateMalakinfoNewsletterHtml(articles: NewsletterArticle[]) {
  if (!articles || articles.length === 0) {
    return '<p>Pas d’articles sélectionnés.</p>';
  }

  const orderedArticles = articles.slice(0, 6);

  if (orderedArticles.length !== 3 && orderedArticles.length !== 6) {
    throw new Error('La newsletter doit contenir 3 ou 6 articles.');
  }

  const hero = orderedArticles[0];
  const secondary = orderedArticles.slice(1);

  const heroUrl = buildArticleUrl(hero);
  const heroImage = hero.mainImageUrl || 'https://placehold.co/1200x700/0f172a/ffffff?text=Malakinfo';
  const heroCategory = hero.category?.title || 'Actualités';
  const heroExcerpt = normalizeText(hero.excerpt, 220);
  const footerSocialLinks = [
    {
      label: 'Facebook',
      href: 'https://web.facebook.com/profile.php?id=61593119312402&locale=fr_FR',
      bgColor: '#1877F2',
    },
    {
      label: 'X',
      href: 'https://x.com/',
      bgColor: '#000000',
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      bgColor: '#E1306C',
    },
  ];

  const secondaryCards = secondary.map((article) => {
    const articleUrl = buildArticleUrl(article);
    const image = article.mainImageUrl || 'https://placehold.co/600x400/dc2626/ffffff?text=Malakinfo';
    const category = article.category?.title || 'Actualités';
    const title = escapeHtml(article.title);
    const excerpt = escapeHtml(normalizeText(article.excerpt, 120));

    return `
      <tr>
        <td style="padding: 0 0 20px 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
            <tr>
              <td width="200" valign="top" style="padding: 0 16px 0 0;">
                <a href="${articleUrl}" style="display:block; text-decoration:none;">
                  <img src="${image}" alt="${title}" width="200" style="display:block; width:200px; max-width:100%; height:auto; border-radius:8px; border:0; background:#f3f4f6;" />
                </a>
              </td>
              <td valign="top">
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color: #c81f2d; letter-spacing: 0.8px; text-transform: uppercase; margin: 0 0 8px 0;">
                  ${escapeHtml(category)}
                </div>
                <a href="${articleUrl}" style="font-family: Arial, sans-serif; font-size: 20px; line-height: 28px; color: #111827; text-decoration: none; font-weight: bold;">
                  ${title}
                </a>
                <div style="font-family: Arial, sans-serif; font-size: 14px; line-height: 22px; color: #444; margin-top: 8px;">
                  ${excerpt}
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    `;
  }).join('');

  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f5f6f8; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px; background:#ffffff; border-collapse:collapse; margin:0 auto;">
            <tr>
              <td style="padding: 18px 24px; background:#0d1b3d; text-align:center;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; letter-spacing: 2px; color:#ffffff; text-transform: uppercase; font-weight: bold;">
                  MALAKINFO
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0;">
                <a href="${heroUrl}" style="display:block; text-decoration:none;">
                  <img src="${heroImage}" alt="${escapeHtml(hero.title)}" width="600" style="display:block; width:100%; max-width:600px; height:auto; border:0; background:#e5e7eb;" />
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding: 20px 24px 8px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color:#c81f2d; text-transform: uppercase; letter-spacing: 1px;">
                  ${escapeHtml(heroCategory)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 24px;">
                <a href="${heroUrl}" style="font-family: Arial, sans-serif; font-size: 30px; line-height: 38px; color:#111827; text-decoration:none; font-weight:bold;">
                  ${escapeHtml(hero.title)}
                </a>
              </td>
            </tr>

            <tr>
              <td style="padding: 12px 24px 18px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 24px; color:#222222;">
                  ${escapeHtml(heroExcerpt)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 24px 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td bgcolor="#c81f2d" style="border-radius: 4px;">
                      <a href="${heroUrl}" style="display:inline-block; padding: 12px 20px; font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color:#ffffff; text-decoration:none; font-weight:bold; text-transform: uppercase;">
                        LIRE LA SUITE
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 24px 12px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  ${secondaryCards}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 0 24px 16px 24px; text-align:center;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color:#666666; font-weight: bold; letter-spacing: 1.2px; text-transform: uppercase; margin-bottom: 10px;">
                  Suivez-nous
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate;">
                  <tr>
                    ${footerSocialLinks.map((item) => `
                      <td style="padding: 0 6px;">
                        <a href="${item.href}" style="display:inline-block; background:${item.bgColor}; color:#ffffff; font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; text-decoration:none; border-radius: 999px; padding: 8px 14px; line-height: 18px;">
                          ${escapeHtml(item.label)}
                        </a>
                      </td>
                    `).join('')}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding: 18px 24px 28px 24px; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color:#666666; text-align:center;">
                Malakinfo • Actualités, analyses et perspectives
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
