import CategoryArticlesList from '@/components/CategoryArticlesList';

export default async function SantePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['sante']}
      title={locale === 'fr' ? 'Santé' : 'Health'}
      description={locale === 'fr'
        ? 'Actualité santé, médecine et bien-être.'
        : 'Health, medicine and wellbeing news.'}
      backHref={`/${locale}`}
    />
  );
}
