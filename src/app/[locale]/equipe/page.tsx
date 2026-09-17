import { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SITE_NAME } from '@/lib/site-legal';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Notre équipe - Malakinfo.com',
  description: 'Les journalistes, rédacteurs et contributeurs de MalakInfo, le média d’information basé à Kinshasa.',
};

type TeamAuthor = {
  id: string;
  name: string;
  slug: string;
  role: string | null;
  bio: string | null;
  email: string | null;
  imageUrl: string | null;
  imageAlt: string | null;
  _count: { articles: number; media: number };
};

function normalizeRole(role: string | null | undefined) {
  return (role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function AuthorCard({
  author,
  locale,
  isFrench,
}: {
  author: TeamAuthor;
  locale: string;
  isFrench: boolean;
}) {
  const articleCount = author._count?.articles ?? 0;

  return (
    <Link
      href={`/${locale}/equipe/${author.slug}`}
      className="group flex flex-col border border-border bg-card rounded-xl overflow-hidden transition-colors hover:border-primary/40"
    >
      <div className="aspect-[4/3] bg-muted overflow-hidden">
        {author.imageUrl ? (
          <img
            src={author.imageUrl}
            alt={author.imageAlt || author.name}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <div className="flex h-full items-center justify-center font-heading text-5xl font-bold text-primary/25">
            {author.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-xl font-bold text-foreground group-hover:text-primary">
          {author.name}
        </h3>
        <p className="mt-1 text-sm text-primary">
          {author.role || (isFrench ? 'Contributeur' : 'Contributor')}
        </p>
        {author.bio && (
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
            {author.bio}
          </p>
        )}
        <p className="mt-auto pt-4 text-xs text-muted-foreground">
          {articleCount} {isFrench ? (articleCount > 1 ? 'articles' : 'article') : articleCount === 1 ? 'article' : 'articles'}
        </p>
      </div>
    </Link>
  );
}

function RoleSection({
  title,
  authors,
  locale,
  isFrench,
}: {
  title: string;
  authors: TeamAuthor[];
  locale: string;
  isFrench: boolean;
}) {
  if (authors.length === 0) return null;

  return (
    <section>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-6">{title}</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {authors.map((author) => (
          <AuthorCard key={author.id} author={author} locale={locale} isFrench={isFrench} />
        ))}
      </div>
    </section>
  );
}

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isFrench = locale === 'fr';
  let authors: TeamAuthor[] = [];

  try {
    authors = await prisma.author.findMany({
      include: { _count: { select: { articles: true, media: true } } },
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    console.error('Team page database error:', error);
  }

  const hasRole = (author: TeamAuthor, pattern: RegExp) => pattern.test(normalizeRole(author.role));
  const leadershipAuthors = authors.filter((author) =>
    hasRole(author, /directeur general|direction generale|directeur de la redaction|directeur de publication/)
  );
  const operationsAuthors = authors.filter((author) =>
    hasRole(author, /developp|base de donnees|database|technique|developer|developpeur/)
  );
  const editorialAuthors = authors.filter((author) => hasRole(author, /redact|journaliste|editor/));
  const assignedIds = new Set(
    [...leadershipAuthors, ...operationsAuthors, ...editorialAuthors].map((author) => author.id)
  );
  const otherAuthors = authors.filter((author) => !assignedIds.has(author.id));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="font-heading text-4xl font-bold text-foreground mb-4">
          {isFrench ? 'Notre équipe' : 'Our team'}
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground mb-12">
          {isFrench
            ? `Les visages de ${SITE_NAME} : une rédaction à Kinshasa, des contributeurs en Afrique et dans le monde. Cliquez sur un profil pour lire leurs articles.`
            : `The faces of ${SITE_NAME}: a newsroom in Kinshasa, contributors across Africa and beyond. Open a profile to read their stories.`}
        </p>

        {authors.length === 0 ? (
          <p className="text-muted-foreground">
            {isFrench ? 'Les profils de l’équipe seront bientôt publiés.' : 'Team profiles will be published soon.'}
          </p>
        ) : (
          <div className="space-y-14">
            <RoleSection
              title={isFrench ? 'Direction' : 'Leadership'}
              authors={leadershipAuthors}
              locale={locale}
              isFrench={isFrench}
            />
            <RoleSection
              title={isFrench ? 'Rédaction' : 'Newsroom'}
              authors={editorialAuthors}
              locale={locale}
              isFrench={isFrench}
            />
            <RoleSection
              title={isFrench ? 'Technique' : 'Technology'}
              authors={operationsAuthors}
              locale={locale}
              isFrench={isFrench}
            />
            <RoleSection
              title={
                leadershipAuthors.length + editorialAuthors.length + operationsAuthors.length > 0
                  ? isFrench
                    ? 'Contributeurs'
                    : 'Contributors'
                  : isFrench
                    ? 'Rédaction'
                    : 'Newsroom'
              }
              authors={otherAuthors}
              locale={locale}
              isFrench={isFrench}
            />
          </div>
        )}

        <p className="mt-14 text-muted-foreground">
          {isFrench ? 'Vous souhaitez écrire pour ' : 'Want to write for '}
          {SITE_NAME}
          {isFrench ? ' ? ' : '? '}
          <Link href={`/${locale}/contact`} className="text-primary hover:underline font-medium">
            {isFrench ? 'Contactez-nous' : 'Get in touch'}
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
