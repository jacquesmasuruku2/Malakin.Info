import { BRAND_ALIASES, SITE_EMAIL, SITE_NAME, SITE_URL } from '@/lib/site-legal';

/**
 * Organization + WebSite JSON-LD so search engines associate
 * brand aliases (Malaki, Malaki Info, etc.) with malakinfo.com.
 */
export default function SiteJsonLd() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    '@id': `${SITE_URL}/#organization`,
    name: SITE_NAME,
    alternateName: [...BRAND_ALIASES],
    url: SITE_URL,
    description:
      'MalakInfo (aussi appelé Malaki ou Malaki Info) est un média d’information indépendant basé à Kinshasa, consacré à l’Afrique et au monde.',
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/images/logo.png`,
    },
    sameAs: [
      'https://www.facebook.com/profile.php?id=61593119312402',
      'https://x.com/Malakinfo1',
      'https://www.instagram.com/malakinfo/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: SITE_EMAIL,
      availableLanguage: ['French', 'English'],
    },
  };

  const website = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: SITE_NAME,
    alternateName: [...BRAND_ALIASES],
    url: SITE_URL,
    description:
      'Actualités et analyses de MalakInfo (Malaki / Malaki Info) — média africain indépendant.',
    publisher: { '@id': `${SITE_URL}/#organization` },
    inLanguage: ['fr', 'en'],
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/fr/recherche?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organization) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
