import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AuthorBio from '@/components/AuthorBio';
import { plainTextFromBio } from '@/lib/author-bio';
import { prisma } from '@/lib/prisma';

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const author = await prisma.author.findUnique({
    where: { slug },
    select: { name: true, bio: true, role: true },
  });

  if (!author) {
    return { title: 'Équipe - Malakinfo.com' };
  }

  const plainBio = plainTextFromBio(author.bio);

  return {
    title: `${author.name} - Malakinfo.com`,
    description: plainBio.slice(0, 160) || `${author.name}${author.role ? `, ${author.role}` : ''} — MalakInfo.`,
  };
}

export default async function ContributorProfilePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const isFrench = locale === 'fr';
  const author = await prisma.author.findUnique({
    where: { slug },
    include: {
      articles: { include: { category: true }, orderBy: { publishedAt: 'desc' } },
      media: { orderBy: { publishedAt: 'desc' } },
    },
  });

  if (!author) notFound();

  const articleLabel = isFrench
    ? author.articles.length > 1
      ? 'articles'
      : 'article'
    : author.articles.length === 1
      ? 'article'
      : 'articles';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Link href={`/${locale}/equipe`} className="text-sm text-primary hover:underline">
          {isFrench ? '← Retour à l’équipe' : '← Back to the team'}
        </Link>

        <header className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="h-28 w-28 shrink-0 overflow-hidden rounded-full bg-muted sm:h-32 sm:w-32">
            {author.imageUrl ? (
              <img
                src={author.imageUrl}
                alt={author.imageAlt || author.name}
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full items-center justify-center font-heading text-4xl font-bold text-primary/25">
                {author.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <h1 className="font-heading text-4xl font-bold text-foreground">{author.name}</h1>
            <p className="mt-2 text-primary">
              {author.role || (isFrench ? 'Contributeur' : 'Contributor')}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              {author.articles.length} {articleLabel}
              {author.media.length > 0
                ? ` · ${author.media.length} ${isFrench ? (author.media.length > 1 ? 'médias' : 'média') : author.media.length === 1 ? 'media' : 'media items'}`
                : ''}
            </p>
            {author.email && (
              <a href={`mailto:${author.email}`} className="mt-3 inline-block text-sm text-primary hover:underline">
                {isFrench ? 'Écrire un message' : 'Send a message'}
              </a>
            )}
          </div>
        </header>

        <section className="mt-10">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-4">
            {isFrench ? 'À propos' : 'About'}
          </h2>
          {author.bio ? (
            <AuthorBio html={author.bio} />
          ) : (
            <p className="text-muted-foreground leading-7">
              {isFrench
                ? 'La biographie de ce contributeur sera bientôt publiée.'
                : 'This contributor biography will be published soon.'}
            </p>
          )}
        </section>

        <section className="mt-12">
          <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
            {isFrench ? 'Articles' : 'Articles'}
          </h2>

          {author.articles.length === 0 ? (
            <p className="text-muted-foreground">
              {isFrench ? 'Aucun article publié pour le moment.' : 'No articles published yet.'}
            </p>
          ) : (
            <ul className="space-y-4">
              {author.articles.map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/${locale}/${article.slug}`}
                    className="group flex flex-col gap-4 border border-border rounded-xl overflow-hidden bg-card sm:flex-row hover:border-primary/40 transition-colors"
                  >
                    <div className="h-40 w-full shrink-0 bg-muted sm:h-auto sm:w-48">
                      {article.mainImageUrl && (
                        <img
                          src={article.mainImageUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 p-4 sm:py-5 sm:pr-5">
                      {article.category?.title && (
                        <p className="text-xs uppercase tracking-wide text-primary">{article.category.title}</p>
                      )}
                      <h3 className="mt-1 font-heading text-xl font-bold text-foreground group-hover:text-primary">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{article.excerpt}</p>
                      )}
                      {article.publishedAt && (
                        <p className="mt-3 text-xs text-muted-foreground">
                          {new Date(article.publishedAt).toLocaleDateString(isFrench ? 'fr-FR' : 'en-US', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
