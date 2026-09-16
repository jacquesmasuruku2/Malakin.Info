import Link from 'next/link';
import { Calendar } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { applyArticleLocales } from '@/lib/translation';
import { getDateLocale, pickCopy, t } from '@/lib/copy';
import { getMessages } from '@/lib/i18n';

export const dynamic = 'force-dynamic';

export default async function InfosPratiquesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;
  const messages = getMessages(locale);

  let articles: any[] = await prisma.article.findMany({
    where: {
      category: {
        slug: 'infos-pratiques',
      },
    },
    include: {
      category: true,
      author: true,
    },
    orderBy: {
      publishedAt: 'desc',
    },
    take: 12,
  } as any);

  articles = await applyArticleLocales(articles, locale);

  const guides = articles.slice(0, 8).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Guide',
    categorySlug: article.category?.slug || 'infos-pratiques',
    title: article.title,
    description: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(getDateLocale(locale), { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">{messages.nav.practicalInfo}</h1>
          <p className="text-xl text-gray-200">
            {pickCopy(locale, {
              fr: 'Guides, tutoriels et ressources pour vous accompagner au quotidien',
              en: 'Guides, tutorials and resources to help you every day',
              es: 'Guías, tutoriales y recursos para acompañarte cada día',
              sw: 'Miongozo, mafunzo na rasilimali za kila siku',
              ln: 'Ba guide, ba tutoriel mpe ba ressource mpo na mokolo na mokolo',
              rw: 'Amabwiriza, amahugurwa n’ibikoresho bya buri munsi',
            })}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.length > 0 ? (
            guides.map((guide) => (
              <article
                key={guide.id}
                className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link href={`/${locale}/${guide.slug}`} className="block">
                  <div className="relative h-48">
                    <img
                      src={guide.image || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop'}
                      alt={guide.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                      {guide.category}
                    </span>
                  </div>
                </Link>
                <div className="p-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {guide.date}
                    </span>
                    <span>{guide.readTime}</span>
                  </div>
                  <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                    <Link href={`/${locale}/${guide.slug}`} className="hover:text-primary transition-colors">
                      {guide.title}
                    </Link>
                  </h3>
                  <p className="text-muted-foreground line-clamp-2">
                    {guide.description}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-2 bg-card rounded-lg p-12 text-center">
              <p className="text-muted-foreground text-lg">{t(locale, 'noArticles')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
