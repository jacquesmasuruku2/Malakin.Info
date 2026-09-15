import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export default async function NatureEnvironnementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['nature-environnement', 'environnement']}
      title={messages.nav.natureEnvironment}
      description={pickCopy(locale, {
        fr: 'Géographie, climat et écologie du continent africain.',
        en: 'Geography, climate and ecology across Africa.',
        es: 'Geografía, clima y ecología del continente africano.',
        sw: 'Jiografia, hali ya hewa na ekolojia ya Afrika.',
        ln: 'Géographie, climat mpe écologie ya Afrique.',
        rw: 'Iyi si, ikirere n’ibidukikije by’Afurika.',
      })}
      backHref={`/${locale}/science-tech`}
      backLabel={messages.nav.scienceTech}
    />
  );
}
