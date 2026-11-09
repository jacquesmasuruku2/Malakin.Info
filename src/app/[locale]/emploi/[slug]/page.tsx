import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { notFound } from 'next/navigation';
import JobOfferDetail from './JobOfferDetail';
import type { Metadata } from 'next';
import { SITE_URL } from '@/lib/site-legal';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const jobOffer = await withRetry(() => prisma.jobOffer.findUnique({ where: { slug } }));

  if (!jobOffer || jobOffer.publishedAt > new Date()) {
    return {
      title: locale === 'en' ? 'Job offer unavailable | MalakInfo' : 'Offre indisponible | MalakInfo',
      robots: { index: false, follow: true },
    };
  }

  const title = `${jobOffer.title} | MalakInfo`;
  const description = jobOffer.description.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const canonical = `${SITE_URL}/${locale}/emploi/${slug}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', url: canonical, title, description, siteName: 'MalakInfo' },
  };
}

export default async function JobOfferPage({ 
  params 
}: { 
  params: Promise<{ locale: string; slug: string }> 
}) {
  const { locale, slug } = await params;

  const jobOffer = await withRetry(() => prisma.jobOffer.findUnique({
    where: { slug },
  }));

  if (!jobOffer) {
    notFound();
  }

  return <JobOfferDetail locale={locale} jobOffer={jobOffer} />;
}
