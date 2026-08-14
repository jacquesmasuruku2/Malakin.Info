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

const responsiveNewsletterCss = `
  <style>
    @media only screen and (max-width: 620px) {
      .newsletter-shell { width: 100% !important; }
      .newsletter-content { width: 100% !important; }
      .newsletter-mobile-padding { padding-left: 16px !important; padding-right: 16px !important; }
      .newsletter-hero-image { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .newsletter-card-image { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .newsletter-stack { display: block !important; width: 100% !important; }
      .newsletter-stack-cell { display: block !important; width: 100% !important; max-width: 100% !important; }
      .newsletter-stack-cell img { width: 100% !important; max-width: 100% !important; height: auto !important; }
      .newsletter-button-cell { display: block !important; width: 100% !important; }
      .newsletter-button-link { display: block !important; width: auto !important; text-align: center !important; }
      .newsletter-social-cell { display: inline-block !important; padding: 0 4px 8px 4px !important; }
      .newsletter-social-link { display: inline-block !important; }
      .newsletter-title { font-size: 24px !important; line-height: 30px !important; }
      .newsletter-subtitle { font-size: 18px !important; line-height: 24px !important; }
    }
  </style>
`;

export function generateMalakinfoNewsletterHtml(articles: NewsletterArticle[]) {
  if (!articles || articles.length === 0) {
    return '<p>Pas d’articles sélectionnés.</p>';
  }

  const orderedArticles = articles.slice(0, 6);

  if (orderedArticles.length < 1 || orderedArticles.length > 6) {
    throw new Error('La newsletter doit contenir entre 1 et 6 articles.');
  }

  const hero = orderedArticles[0];
  const secondary = orderedArticles.slice(1);

  const heroUrl = buildArticleUrl(hero);
  const heroImage = hero.mainImageUrl || 'https://placehold.co/1200x700/0f172a/ffffff?text=Malakinfo';
  const heroCategory = hero.category?.title || 'Actualités';
  const heroExcerpt = normalizeText(hero.excerpt, 220);
  const footerSocialLinks = [
    {
      label: 'Site web',
      href: 'https://www.malakinfo.com',
      bgColor: '#0F172A',
      iconSvg: `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:18px; height:18px; fill: currentColor;">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm6.9 9h-3.1a15.7 15.7 0 0 0-1.2-5.3A8 8 0 0 1 18.9 11zm-8.9-5.3A15.7 15.7 0 0 0 9 11H5.9A8 8 0 0 1 10 5.7zM5.9 13H9a15.7 15.7 0 0 0 1.2 5.3A8 8 0 0 1 5.9 13zm6.1 5.3A15.7 15.7 0 0 0 15 13h3.1a8 8 0 0 1-4.1 5.3zm4.1-7.3H15A15.7 15.7 0 0 0 13.8 5.7 8 8 0 0 1 16.1 11zm-8.2 0H9A15.7 15.7 0 0 1 10.2 5.7 8 8 0 0 1 7.9 11zm3.3 0h2.6A13.7 13.7 0 0 1 12 18.3 13.7 13.7 0 0 1 11.2 11zm-2.6 0A13.7 13.7 0 0 1 12 5.7 13.7 13.7 0 0 1 12.8 11H8.6z"/>
        </svg>
      `,
    },
    {
      label: 'Facebook',
      href: 'https://web.facebook.com/profile.php?id=61593119312402&locale=fr_FR',
      bgColor: '#1877F2',
      iconSvg: `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:18px; height:18px; fill: currentColor;">
          <path d="M13.5 22v-8h2.7l.4-3.1h-3.1V7.6c0-.9.3-1.6 1.6-1.6h1.7V3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.4H7.5V14h2.6v8h3.4z"/>
        </svg>
      `,
    },
    {
      label: 'X',
      href: 'https://x.com/',
      bgColor: '#000000',
      iconSvg: `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:18px; height:18px; fill: currentColor;">
          <path d="M18.9 2h3.4l-7.4 8.5L22.9 22h-6.7l-5.2-7.2L5.1 22H1.7l7.9-9.1L1 2h6.9l4.7 6.5L18.9 2zm-1.2 18h1.9L7.2 3.9H5.2L17.7 20z"/>
        </svg>
      `,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/',
      bgColor: '#E1306C',
      iconSvg: `
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:18px; height:18px; fill: currentColor;">
          <defs>
            <linearGradient id="igGradientNewsletter" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="#FFD600"/>
              <stop offset="25%" stop-color="#FF7A00"/>
              <stop offset="50%" stop-color="#FF0069"/>
              <stop offset="75%" stop-color="#D300C5"/>
              <stop offset="100%" stop-color="#7638FA"/>
            </linearGradient>
          </defs>
          <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5A5.5 5.5 0 1 1 6.5 13 5.5 5.5 0 0 1 12 7.5zm0 2A3.5 3.5 0 1 0 15.5 13 3.5 3.5 0 0 0 12 9.5zm5.3-3.2a1.2 1.2 0 1 1-1.2 1.2 1.2 1.2 0 0 1 1.2-1.2z" fill="url(#igGradientNewsletter)"/>
        </svg>
      `,
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="newsletter-stack">
            <tr>
              <td width="200" valign="top" class="newsletter-stack-cell" style="padding: 0 16px 0 0; width: 200px; max-width: 200px;">
                <a href="${articleUrl}" style="display:block; text-decoration:none;">
                  <img src="${image}" alt="${title}" width="200" class="newsletter-card-image" style="display:block; width:200px; max-width:100%; height:auto; border-radius:8px; border:0; background:#f3f4f6;" />
                </a>
              </td>
              <td valign="top" class="newsletter-stack-cell" style="width: auto;">
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
    ${responsiveNewsletterCss}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="newsletter-shell" style="background:#f5f6f8; margin:0; padding:0;">
      <tr>
        <td align="center" style="padding: 32px 16px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" class="newsletter-content" style="max-width:600px; background:#ffffff; border-collapse:collapse; margin:0 auto;">
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
                  <img src="${heroImage}" alt="${escapeHtml(hero.title)}" width="600" class="newsletter-hero-image" style="display:block; width:100%; max-width:600px; height:auto; border:0; background:#e5e7eb;" />
                </a>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 20px 24px 8px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 12px; font-weight: bold; color:#c81f2d; text-transform: uppercase; letter-spacing: 1px;">
                  ${escapeHtml(heroCategory)}
                </div>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px;">
                <a href="${heroUrl}" class="newsletter-title" style="font-family: Arial, sans-serif; font-size: 30px; line-height: 38px; color:#111827; text-decoration:none; font-weight:bold;">
                  ${escapeHtml(hero.title)}
                </a>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 12px 24px 18px 24px;">
                <div style="font-family: Arial, sans-serif; font-size: 15px; line-height: 24px; color:#222222;">
                  ${escapeHtml(heroExcerpt)}
                </div>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 24px 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
                  <tr>
                    <td bgcolor="#c81f2d" class="newsletter-button-cell" style="border-radius: 4px;">
                      <a href="${heroUrl}" class="newsletter-button-link" style="display:inline-block; padding: 12px 20px; font-family: Arial, sans-serif; font-size: 13px; line-height: 18px; color:#ffffff; text-decoration:none; font-weight:bold; text-transform: uppercase;">
                        LIRE LA SUITE
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 12px 24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;">
                  ${secondaryCards}
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 0 24px 18px 24px; text-align:center;">
                <div style="font-family: Arial, sans-serif; font-size: 13px; line-height: 20px; color:#0f172a; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; margin: 0 0 14px 0; border-top: 1px solid #e5e7eb; padding-top: 18px;">
                  Suivez-nous
                </div>
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto; border-collapse: separate;">
                  <tr>
                    ${footerSocialLinks.map((item) => `
                      <td class="newsletter-social-cell" style="padding: 0 8px;">
                        <a href="${item.href}" aria-label="${escapeHtml(item.label)}" class="newsletter-social-link" style="display:inline-flex; align-items:center; justify-content:center; width: 42px; height: 42px; background:${item.bgColor}; color:#ffffff; text-decoration:none; border-radius: 50%; vertical-align: middle; box-shadow: 0 4px 10px rgba(15,23,42,0.12); border: 1px solid rgba(255,255,255,0.25);">
                          ${item.iconSvg}
                        </a>
                      </td>
                    `).join('')}
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td class="newsletter-mobile-padding" style="padding: 18px 24px 28px 24px; font-family: Arial, sans-serif; font-size: 12px; line-height: 18px; color:#666666; text-align:center;">
                Malakinfo • Actualités, analyses et perspectives
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}
