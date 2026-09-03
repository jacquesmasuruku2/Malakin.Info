import Link from 'next/link';
import { Calendar, ArrowRight, PenTool, FileText, Search, BarChart3, User } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface Post {
  id: string;
  category: string;
  author: string;
  authorSlug?: string;
  title: string;
  excerpt?: string;
  image: string;
  date: string;
  readTime: string;
  slug: string;
}

export const dynamic = 'force-dynamic';

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  let posts: any[] = [];
  
  try {
    posts = await prisma.blogPost.findMany({
      include: {
        author: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
    } as any);
  } catch (error) {
    console.error('Database connection error:', error);
  }

  const categories = [
    { name: 'Tribunes', href: '/blog/tribunes', icon: PenTool, count: 34 },
    { name: 'Chroniques', href: '/blog/chroniques', icon: FileText, count: 56 },
    { name: 'Enquêtes', href: '/blog/enquetes', icon: Search, count: 23 },
    { name: 'Sondages', href: '/blog/sondages', icon: BarChart3, count: 18 },
  ];

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  const featuredPosts = posts.slice(0, 3).map((post: any) => ({
    id: post.id,
    category: post.type || 'Article',
    author: post.author?.name || 'Anonyme',
    authorSlug: post.author?.slug,
    title: post.title,
    excerpt: post.excerpt || post.content?.substring(0, 150) + '...' || '',
    image: post.mainImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
    date: formatDate(post.publishedAt),
    readTime: post.readTime ? `${post.readTime} min` : '5 min',
    slug: post.slug,
  }));

  const latestPosts = posts.slice(3).map((post: any) => ({
    id: post.id,
    category: post.type || 'Article',
    author: post.author?.name || 'Anonyme',
    authorSlug: post.author?.slug,
    title: post.title,
    date: formatDate(post.publishedAt),
    readTime: post.readTime ? `${post.readTime} min` : '5 min',
    slug: post.slug,
    image: post.mainImageUrl || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop',
  }));

  // Fallback to mock data if no posts from Sanity
  const displayFeaturedPosts = featuredPosts.length > 0 ? featuredPosts : [
    {
      id: 1,
      category: 'Tribune',
      author: 'Jean Dupont',
      authorSlug: undefined,
      title: 'L\'avenir du journalisme en Afrique à l\'ère numérique',
      excerpt: 'Analyse des défis et des opportunités pour la presse africaine face à la transformation numérique.',
      image: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop',
      date: '27 Juin 2026',
      readTime: '8 min',
      slug: '1',
    },
    {
      id: 2,
      category: 'Enquête',
      author: 'Marie Koffi',
      authorSlug: undefined,
      title: 'Enquête exclusive : Les coulisses du marché informel à Kinshasa',
      excerpt: 'Une plongée dans l\'économie informelle qui fait vivre des millions de Congolais.',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
      date: '26 Juin 2026',
      readTime: '12 min',
      slug: '2',
    },
    {
      id: 3,
      category: 'Chronique',
      author: 'Ahmed Benali',
      authorSlug: undefined,
      title: 'Chronique : La jeunesse africaine, moteur du changement',
      excerpt: 'Comment la nouvelle génération redéfinit le futur du continent.',
      image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=800&h=400&fit=crop',
      date: '25 Juin 2026',
      readTime: '6 min',
      slug: '3',
    },
  ];

  const displayLatestPosts = latestPosts.length > 0 ? latestPosts : [
    {
      id: 4,
      category: 'Sondage',
      author: 'Équipe Malakin',
      authorSlug: undefined,
      title: 'Sondage : Les Africains et leur confiance dans les médias',
      date: '27 Juin 2026',
      readTime: '5 min',
      slug: '4',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=400&h=300&fit=crop',
    },
    {
      id: 5,
      category: 'Tribune',
      author: 'Grace Okafor',
      authorSlug: undefined,
      title: 'La culture africaine comme vecteur d\'unité',
      date: '26 Juin 2026',
      readTime: '7 min',
      slug: '5',
      image: 'https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400&h=300&fit=crop',
    },
    {
      id: 6,
      category: 'Chronique',
      author: 'Pierre Mwamba',
      authorSlug: undefined,
      title: 'Le sport comme outil de développement social',
      date: '25 Juin 2026',
      readTime: '4 min',
      slug: '6',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&h=300&fit=crop',
    },
  ];

  return (
    <div className="flex flex-col">
      <section className="bg-gradient-to-r from-secondary to-secondary/80 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-gray-200">
            Tribunes, chroniques, enquêtes et sondages : des analyses approfondies sur l'Afrique
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#081C3D] mb-3">Des analyses et des points de vue</h2>
          <p className="text-base leading-relaxed text-gray-700">
            Le blog met en lumière les idées, les dossiers et les réflexions qui dépassent l’actualité pour donner du sens aux grands changements sociaux, politiques et culturels du continent.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="space-y-8">
            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">À la une</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayFeaturedPosts.map((post: Post) => (
                  <article
                    key={post.id}
                    className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className="relative h-48">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-4 left-4 px-3 py-1 bg-accent text-white text-xs font-medium rounded-full">
                        {post.category}
                      </span>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span>{post.readTime}</span>
                        {post.authorSlug ? (
                          <Link
                            href={`/${locale}/equipe/${post.authorSlug}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <User className="w-4 h-4" />
                            {post.author}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                        )}
                      </div>
                      <h3 className="font-heading text-xl font-semibold text-foreground mb-2 line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-muted-foreground line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>
                      <Link
                        href={`/${locale}/blog/${post.slug}`}
                        className="inline-flex items-center text-primary hover:text-primary/80 font-medium text-sm"
                      >
                        Lire
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-heading text-2xl font-bold mb-6">Derniers articles</h2>
              <div className="space-y-4">
                {displayLatestPosts.map((post: Post) => (
                  <article
                    key={post.id}
                    className="flex gap-4 p-4 bg-card rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <span className="inline-block px-2 py-1 bg-accent/10 text-accent text-xs font-medium rounded mb-2">
                        {post.category}
                      </span>
                      <h3 className="font-heading font-semibold text-foreground mb-1 line-clamp-2">
                        <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-primary transition-colors">
                          {post.title}
                        </Link>
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {post.date}
                        </span>
                        <span>{post.readTime}</span>
                        {post.authorSlug ? (
                          <Link
                            href={`/${locale}/equipe/${post.authorSlug}`}
                            className="flex items-center gap-1 hover:text-primary transition-colors"
                          >
                            <User className="w-4 h-4" />
                            {post.author}
                          </Link>
                        ) : (
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author}
                          </span>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
