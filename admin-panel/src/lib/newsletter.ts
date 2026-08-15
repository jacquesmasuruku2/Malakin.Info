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
      .newsletter-mobile-padding { padding-left: 12px !important; padding-right: 12px !important; }
      .newsletter-hero-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 260px !important;
        min-height: 260px !important;
        object-fit: cover !important;
        display: block !important;
      }
      .newsletter-card-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 220px !important;
        object-fit: cover !important;
        float: none !important;
        display: block !important;
        margin: 0 0 10px 0 !important;
        border-radius: 10px !important;
      }
      .newsletter-stack {
        width: 100% !important;
        display: block !important;
      }
      .newsletter-stack-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 !important;
      }
      .newsletter-stack-cell img {
        width: 100% !important;
        max-width: 100% !important;
        height: auto !important;
      }
      .newsletter-secondary-row {
        display: block !important;
        width: 100% !important;
      }
      .newsletter-secondary-image-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding: 0 0 10px 0 !important;
      }
      .newsletter-secondary-text-cell {
        display: block !important;
        width: 100% !important;
        max-width: 100% !important;
        padding-top: 0 !important;
      }
      .newsletter-secondary-image {
        width: 100% !important;
        max-width: 100% !important;
        height: 220px !important;
        min-height: 220px !important;
        object-fit: cover !important;
        display: block !important;
        margin: 0 !important;
      }
      .newsletter-button-cell { display: block !important; width: 100% !important; }
      .newsletter-button-link { display: block !important; width: auto !important; text-align: center !important; }
      .newsletter-social-cell { display: inline-block !important; padding: 0 4px 8px 4px !important; }
      .newsletter-social-link { display: inline-block !important; }
      .newsletter-title { font-size: 24px !important; line-height: 30px !important; }
      .newsletter-subtitle { font-size: 18px !important; line-height: 24px !important; }
      .newsletter-text-content { overflow: hidden !important; display: block !important; }
      .newsletter-secondary-row td { padding-bottom: 8px !important; }
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
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:20px; height:20px; fill: currentColor;">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
      `,
    },
    {
      label: 'Facebook',
      href: 'https://web.facebook.com/profile.php?id=61593119312402&locale=fr_FR',
      bgColor: '#1877F2',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:20px; height:20px; fill: currentColor;">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      `,
    },
    {
      label: 'X',
      href: 'https://x.com/Malakinfo1',
      bgColor: '#000000',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:20px; height:20px; fill: currentColor;">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      `,
    },
    {
      label: 'Instagram',
      href: 'https://www.instagram.com/malakinfo/',
      bgColor: '#E1306C',
      iconSvg: `
        <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false" style="display:block; width:20px; height:20px; fill: currentColor;">
          <defs>
            <linearGradient id="igGradientNewsletter" x1="0%" x2="100%" y1="0%" y2="100%">
              <stop offset="0%" stop-color="#FFD600"/>
              <stop offset="25%" stop-color="#FF7A00"/>
              <stop offset="50%" stop-color="#FF0069"/>
              <stop offset="75%" stop-color="#D300C5"/>
              <stop offset="100%" stop-color="#7638FA"/>
            </linearGradient>
          </defs>
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" fill="url(#igGradientNewsletter)"/>
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
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse: collapse;" class="newsletter-stack newsletter-secondary-row">
            <tr>
              <td colspan="2" class="newsletter-stack-cell newsletter-secondary-image-cell" style="padding: 0 0 10px 0; width: 100%; display:block;">
                <a href="${articleUrl}" style="display:block; text-decoration:none;">
                  <img src="${image}" alt="${title}" width="600" class="newsletter-card-image newsletter-secondary-image" style="display:block; width:100%; max-width:100%; height:auto; border-radius:8px; border:0; background:#f3f4f6;" />
                </a>
              </td>
            </tr>
            <tr>
              <td colspan="2" valign="top" class="newsletter-text-content newsletter-secondary-text-cell" style="width: 100%; display:block;">
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
