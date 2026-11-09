import type { Metadata } from 'next';
import { getLocalizedPageMetadata } from '@/lib/page-metadata';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const english = locale === 'en';
  return getLocalizedPageMetadata(
    locale,
    '/contact',
    english ? 'Contact the MalakInfo newsroom' : 'Contacter la rédaction MalakInfo',
    english
      ? 'Contact the MalakInfo newsroom with questions, corrections, or story ideas.'
      : 'Contactez la rédaction MalakInfo pour une question, une correction ou une proposition de reportage.',
  );
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}