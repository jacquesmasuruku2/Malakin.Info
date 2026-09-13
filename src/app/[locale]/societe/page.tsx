import CategoryArticlesList from '@/components/CategoryArticlesList';

export default async function SocietePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['societe']}
      title={locale === 'fr' ? 'Société' : 'Society'}
      description={locale === 'fr'
        ? 'Vie quotidienne, éducation, culture populaire et débats de société.'
        : 'Daily life, education, popular culture and social debates.'}
      backHref={`/${locale}`}
    />
  );
}
