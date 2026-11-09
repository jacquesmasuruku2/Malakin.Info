import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NewsletterSubscriptionForm from '@/components/NewsletterSubscriptionForm';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return getLocalizedPageMetadata(
    locale,
    '/newsletter',
    isEnglish ? 'MalakInfo Newsletter' : 'Newsletter MalakInfo',
    isEnglish
      ? 'Subscribe to MalakInfo newsletters and choose the topics you want in your inbox.'
      : 'Inscrivez-vous aux newsletters MalakInfo et choisissez les sujets qui vous intéressent.',
  );
}

export default async function NewsletterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEnglish = locale === 'en';

  return (
    <div className="min-h-full bg-slate-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-[#0b3b8b]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {isEnglish ? 'Back to MalakInfo' : 'Retour à MalakInfo'}
        </Link>

        <header className="mb-7 mt-8 border-l-4 border-[#d4af37] pl-5 sm:mb-8 sm:mt-10 sm:pl-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#0b3b8b]">MalakInfo</p>
          <h1 className="mt-2 font-heading text-3xl font-bold text-[#081c3d] sm:text-4xl">
            {isEnglish ? 'Stay informed with our newsletter' : 'La newsletter MalakInfo'}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
            {isEnglish
              ? 'Get the stories that matter, delivered to your inbox. Choose the topics you care about.'
              : 'Recevez l’essentiel de l’actualité directement dans votre boîte mail et choisissez les sujets qui vous intéressent.'}
          </p>
        </header>

        <NewsletterSubscriptionForm locale={locale} />
      </div>
    </div>
  );
}
