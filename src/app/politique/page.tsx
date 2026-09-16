import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ArticleListingGrid from '@/components/ArticleListingGrid';

export const dynamic = 'force-dynamic';

export default async function PolitiquePage() {
  const category = await prisma.category.findUnique({
    where: { slug: 'politique' },
  });

  const articles = category
    ? await prisma.article.findMany({
        where: { categoryId: category.id },
        include: { category: true },
        orderBy: { publishedAt: 'desc' },
        take: 12,
      })
    : [];

  return (
    <div className="tag-page bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-14">
        <Link href="/" className="mb-8 inline-block text-sm text-muted-foreground hover:text-foreground">
          ← Accueil
        </Link>
        <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight mb-3 sm:mb-4">
          Politique
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mb-8 sm:mb-10 max-w-3xl">
          Analyse, institutions, diplomatie et enjeux politiques du continent et du monde
        </p>

        {articles.length === 0 ? (
          <div className="py-10 text-muted-foreground">
            Aucun article politique disponible pour le moment.
          </div>
        ) : (
          <ArticleListingGrid articles={articles} locale="fr" hrefFor={(item) => `/${item.slug}`} />
        )}
      </div>
    </div>
  );
}
