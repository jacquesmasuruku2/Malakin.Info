import { prisma } from '@/lib/prisma';
import { withRetry } from '@/lib/database';
import { notFound } from 'next/navigation';
import JobOfferDetail from './JobOfferDetail';

export const dynamic = 'force-dynamic';

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
