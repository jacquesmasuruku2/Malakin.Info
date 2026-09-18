import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const revalidate = 60;

export default async function EnvironnementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['environnement', 'nature-environnement']}
      title={messages.nav.environment}
      description={pickCopy(locale, {
        fr: 'Climat, biodiversité et enjeux environnementaux en Afrique.',
        en: 'Climate, biodiversity and environmental issues in Africa.',
        es: 'Clima, biodiversidad y retos ambientales en África.',
        sw: 'Hali ya hewa, bioanuwai na masuala ya mazingira Afrika.',
        ln: 'Climat, biodiversité mpe ba enjeu ya environnement na Afrique.',
        rw: 'Ikirere, ibidukikije n’ibibazo by’ibidukikije mu Afurika.',
      })}
      backHref={`/${locale}`}
    />
  );
}
