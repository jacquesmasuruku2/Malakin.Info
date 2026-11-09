import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import type { Metadata } from 'next';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';
  return getLocalizedPageMetadata(locale, '/sante',
    english ? 'Health and medicine news' : 'Actualités santé et médecine',
    english ? 'Health, medicine, public health and wellbeing news from Africa and the world.' : 'Actualités de la santé, de la médecine, de la santé publique et du bien-être en Afrique et dans le monde.');
}

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
