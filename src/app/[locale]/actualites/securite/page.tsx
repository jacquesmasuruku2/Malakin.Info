import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export default async function ActualitesSecuritePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['securite']}
      title={messages.nav.security}
      description={pickCopy(locale, {
        fr: 'Actualité sécurité, défense et maintien de l’ordre.',
        en: 'Security, defense and public-order news.',
        es: 'Actualidad de seguridad, defensa y orden público.',
        sw: 'Habari za usalama, ulinzi na utulivu.',
        ln: 'Sango ya sécurité, défense mpe bobateli ya kimya.',
        rw: 'Amakuru y’umutekano, zirikana n’umutekano rusange.',
      })}
      backHref={`/${locale}/actualites`}
      backLabel={t(locale, 'allNews')}
    />
  );
}
