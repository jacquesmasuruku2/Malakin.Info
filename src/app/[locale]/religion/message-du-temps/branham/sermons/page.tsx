import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export default async function SermonsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  let articles: Array<{ id: string; slug: string; title: string; excerpt: string }> = [];
  try {
    articles = await prisma.article.findMany({
      where: {
        OR: [
          { category: { slug: 'religion' } },
          { category: { slug: 'message-du-temps' } },
        ],
      },
      select: { id: true, slug: true, title: true, excerpt: true },
      orderBy: { publishedAt: 'desc' },
      take: 12,
    });
  } catch (error) {
    console.error('Error loading sermon-related articles:', error);
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href={`/${locale}/religion`} className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à Religion
          </Link>
          <h1 className="font-heading text-4xl font-bold mb-4">Message du temps</h1>
          <p className="text-xl text-gray-200">
            Réflexions et articles de la rubrique religieuse de MalakInfo
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <p className="text-muted-foreground text-lg">
          Cette page rassemble les publications religieuses réellement disponibles sur MalakInfo. Nous ne publions que des contenus que nous pouvons présenter et sourcer.
        </p>

        {articles.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center text-muted-foreground">
            Aucun article n’est encore publié dans cette rubrique.
          </div>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <article key={article.id} className="border border-border bg-card p-6">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-2">{article.title}</h2>
                <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                <Link href={`/${locale}/${article.slug}`} className="text-primary hover:underline font-medium">
                  Lire l’article
                </Link>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
