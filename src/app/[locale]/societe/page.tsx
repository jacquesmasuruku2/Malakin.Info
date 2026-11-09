import CategoryArticlesList from '@/components/CategoryArticlesList';
import { pickCopy } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';
import type { Metadata } from 'next';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';
  return getLocalizedPageMetadata(locale, '/societe',
    english ? 'Society and daily life in Africa' : 'Société et vie quotidienne en Afrique',
    english ? 'Stories on daily life, education and social issues across Africa.' : 'Reportages sur la vie quotidienne, l’éducation et les enjeux de société en Afrique.');
}

export default async function SocietePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const messages = getMessages(locale);

  return (
    <CategoryArticlesList
      locale={locale}
      slugs={['societe']}
      title={messages.nav.society}
      description={pickCopy(locale, {
        fr: 'Vie quotidienne, éducation, culture populaire et débats de société.',
        en: 'Daily life, education, popular culture and social debates.',
        es: 'Vida cotidiana, educación, cultura popular y debates sociales.',
        sw: 'Maisha ya kila siku, elimu, utamaduni na mijadala ya jamii.',
        ln: 'Bomoi ya mokolo na mokolo, éducation, culture populaire mpe ba débat ya société.',
        rw: 'Ubuzima bwa buri munsi, uburezi, umuco n’ibiganiro by’abaturage.',
      })}
      backHref={`/${locale}`}
    />
  );
}
