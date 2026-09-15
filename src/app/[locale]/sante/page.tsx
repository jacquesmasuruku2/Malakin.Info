import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export default async function SantePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['sante']}
      title={messages.nav.health}
      description={pickCopy(locale, {
        fr: 'Actualité santé, médecine et bien-être.',
        en: 'Health, medicine and wellbeing news.',
        es: 'Actualidad de salud, medicina y bienestar.',
        sw: 'Habari za afya, dawa na ustawi.',
        ln: 'Sango ya santé, médecine mpe malamu ya nzoto.',
        rw: 'Amakuru y’ubuzima, ubuvuzi n’imibereho myiza.',
      })}
      backHref={`/${locale}`}
    />
  );
}
