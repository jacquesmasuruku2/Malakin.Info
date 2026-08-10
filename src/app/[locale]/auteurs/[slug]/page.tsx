import Link from 'next/link';
import { Calendar, Clock, ArrowRight, User, BookOpen } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';

async function getAuthorBySlug(slug: string) {
  try {
    console.log('Fetching author with slug:', slug);
    const author = await prisma.author.findUnique({
      where: { slug },
      include: {
        articles: {
          include: {
            category: true,
          },
          orderBy: {
            publishedAt: 'desc',
          },
        },
      },
    });

    console.log('Author found:', author ? author.name : 'null');
    return author;
  } catch (error) {
    console.error('Error fetching author:', error);
    console.error('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    return null;
  }
}

export default async function AuthorPage({ params }: { params: { slug: string } }) {
  const author = await getAuthorBySlug(params.slug);

  if (!author) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/" className="text-gray-300 hover:text-white mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <div className="flex items-center gap-6 mt-4">
            {author.imageUrl && (
              <img
                src={author.imageUrl}
                alt={author.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-white/30"
              />
            )}
            <div>
              <h1 className="font-heading text-4xl font-bold mb-2">{author.name}</h1>
              {author.role && (
                <p className="text-xl text-gray-200">{author.role}</p>
              )}
              <p className="text-gray-300 mt-2">
                {author.articles.length} publication{author.articles.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {author.bio && (
            <p className="text-gray-200 mt-6 max-w-3xl leading-relaxed">
              {author.bio}
            </p>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="font-heading text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Publications de {author.name}
          </h2>
        </div>

        {author.articles.length === 0 ? (
          <div className="bg-card rounded-lg p-12 text-center">
            <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Aucune publication trouvée pour cet auteur.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {author.articles.map((article) => (
              <article
                key={article.id}
                className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border-l-4 border-primary"
              >
                <div className="flex items-start gap-4">
                  {article.mainImageUrl && (
                    <img
                      src={article.mainImageUrl}
                      alt={article.mainImageAlt || article.title}
                      className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
                    />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {article.category.title}
                      </span>
                      {article.featured && (
                        <span className="px-3 py-1 bg-accent/10 text-accent text-xs font-medium rounded-full">
                          À la une
                        </span>
                      )}
                    </div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2 hover:text-primary transition-colors">
                      <Link href={`/${article.slug}`}>
                        {article.title}
                      </Link>
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                      {article.readTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {article.readTime}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {article.views.toString()} vues
                      </span>
                    </div>
                    <Link
                      href={`/${article.slug}`}
                      className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm mt-4"
                    >
                      Lire l'article
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
