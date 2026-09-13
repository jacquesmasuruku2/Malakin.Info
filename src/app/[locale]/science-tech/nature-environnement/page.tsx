import CategoryArticlesList from '@/components/CategoryArticlesList';

export default async function NatureEnvironnementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['nature-environnement', 'environnement']}
      title={locale === 'fr' ? 'Nature & Environnement' : 'Nature & Environment'}
      description={locale === 'fr'
        ? 'Géographie, climat et écologie du continent africain.'
        : 'Geography, climate and ecology across Africa.'}
      backHref={`/${locale}/science-tech`}
      backLabel={locale === 'fr' ? 'Retour à Science & Tech' : 'Back to Science & Tech'}
    />
  );
}
