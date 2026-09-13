import CategoryArticlesList from '@/components/CategoryArticlesList';

export default async function SecuritePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['securite']}
      title={locale === 'fr' ? 'Sécurité' : 'Security'}
      description={locale === 'fr'
        ? 'Actualité sécurité, défense et maintien de l’ordre.'
        : 'Security, defense and public-order news.'}
      backHref={`/${locale}/actualites`}
      backLabel={locale === 'fr' ? 'Retour aux actualités' : 'Back to news'}
    />
  );
}
