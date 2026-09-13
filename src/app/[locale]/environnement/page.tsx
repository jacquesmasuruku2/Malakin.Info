import CategoryArticlesList from '@/components/CategoryArticlesList';

export default async function EnvironnementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['environnement', 'nature-environnement']}
      title={locale === 'fr' ? 'Environnement' : 'Environment'}
      description={locale === 'fr'
        ? 'Climat, biodiversité et enjeux environnementaux en Afrique.'
        : 'Climate, biodiversity and environmental issues in Africa.'}
      backHref={`/${locale}`}
    />
  );
}
