import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';

  return getLocalizedPageMetadata(
    locale,
    '/science-tech/intelligence-artificielle',
    english ? 'Artificial intelligence news in Africa' : 'Intelligence artificielle en Afrique',
    english
      ? 'News, analysis and innovation in artificial intelligence across Africa and the world.'
      : 'Actualités, analyses et innovations en intelligence artificielle en Afrique et dans le monde.',
  );
}

export default async function ArtificialIntelligencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['intelligence-artificielle', 'artificial-intelligence', 'ia']}
      title={locale === 'en' ? 'Artificial Intelligence' : 'Intelligence artificielle'}
      description={pickCopy(locale, {
        fr: 'Les actualités, recherches et innovations en intelligence artificielle en Afrique et dans le monde.',
        en: 'Artificial intelligence news, research and innovation across Africa and the world.',
        es: 'Noticias, investigación e innovación sobre inteligencia artificial en África y el mundo.',
        sw: 'Habari, utafiti na uvumbuzi kuhusu akili bandia barani Afrika na duniani.',
        ln: 'Sango, bolukiluki mpe bokeli ya sika na mayele ya bokeli na Afrique mpe mokili.',
        rw: 'Amakuru, ubushakashatsi n’udushya mu bwenge buhangano muri Afurika no ku isi.',
      })}
      backHref={`/${locale}/science-tech`}
      backLabel={messages.nav.scienceTech}
    />
  );
}
