import Link from 'next/link';
import { Calendar, ArrowRight, BookOpen, ListChecks, FileText, GraduationCap } from 'lucide-react';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function InfosPratiquesPage({ 
  params 
}: { 
  params: Promise<{ locale: string }> 
}) {
  const { locale } = await params;

  // Fetch articles from infos-pratiques category
  const articles = await prisma.article.findMany({
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

  const categories = [
    { name: 'Guides', href: `/${locale}/infos-pratiques/guides`, icon: BookOpen, count: articles.filter((a: any) => a.title.toLowerCase().includes('guide')).length },
    { name: 'Tutoriels', href: `/${locale}/infos-pratiques/tutoriels`, icon: FileText, count: articles.filter((a: any) => a.title.toLowerCase().includes('tutoriel')).length },
    { name: 'Checklists', href: `/${locale}/infos-pratiques/checklists`, icon: ListChecks, count: articles.filter((a: any) => a.title.toLowerCase().includes('checklist')).length },
    { name: 'Ressources Éducatives', href: `/${locale}/infos-pratiques/ressources-educatives`, icon: GraduationCap, count: articles.filter((a: any) => a.title.toLowerCase().includes('ressource') || a.title.toLowerCase().includes('formation')).length },
  ];

  const guides = articles.slice(0, 8).map((article: any) => ({
    id: article.id,
    category: article.category?.title || 'Guide',
    categorySlug: article.category?.slug || 'infos-pratiques',
    title: article.title,
    description: article.excerpt,
    image: article.mainImageUrl,
    date: article.publishedAt ? new Date(article.publishedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '',
    readTime: article.readTime || '5 min',
    slug: article.slug,
  }));

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Infos Pratiques</h1>
          <p className="text-xl text-gray-200">
            Guides, tutoriels et ressources pour vous accompagner au quotidien
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Des repères utiles tous les jours</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Des guides pratiques, des tutoriels et des ressources pour faciliter les démarches, mieux comprendre les services publics et gagner en autonomie dans la vie quotidienne.
          </p>
        </div>

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
                    {guide.title}
                  </h3>
                  <p className="text-muted-foreground line-clamp-2 mb-4">
                    {guide.description}
                  </p>
                  <Link
                    href={`/${locale}/${guide.slug}`}
                    className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                  >
                    Accéder
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-2 bg-card rounded-lg p-12 text-center">
              <p className="text-muted-foreground text-lg">Aucun article disponible pour le moment.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
