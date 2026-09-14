import { Metadata } from 'next';
import Link from 'next/link';
import { getArchiveYears } from '@/lib/archives';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Archives - Malakinfo.com',
  description: 'Retrouvez les articles de MalakInfo classés par année de publication.',
};

export default async function ArchivesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isFrench = locale === 'fr';
  const years = await getArchiveYears();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
          {isFrench ? 'Archives' : 'Archives'}
        </h1>
        <p className="text-lg text-muted-foreground mb-10">
          {isFrench
            ? 'Parcourez les articles publiés sur MalakInfo, année par année.'
            : 'Browse MalakInfo articles year by year.'}
        </p>

        {years.length === 0 ? (
          <p className="text-muted-foreground">
            {isFrench ? 'Aucun article n’est encore archivé.' : 'No archived articles yet.'}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${locale}/archives/${year}`}
                className="inline-flex min-w-[4.5rem] items-center justify-center rounded-full border border-border px-4 py-2 text-sm text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {year}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
