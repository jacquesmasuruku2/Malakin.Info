import Link from 'next/link';
import type { Metadata } from 'next';
import { getLocalizedBlogPosts } from '@/lib/blog-translations';
import { SITE_URL } from '@/lib/site-legal';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === 'en' ? 'Blogs | MalakInfo' : 'Blogs | MalakInfo';
  return {
    title,
    description: locale === 'en'
      ? 'Stories, analysis and perspectives from MalakInfo.'
      : 'Récits, analyses et points de vue de MalakInfo.',
    alternates: {
      canonical: `${SITE_URL}/${locale}/blog`,
      languages: { 'fr-FR': `${SITE_URL}/fr/blog`, 'en-US': `${SITE_URL}/en/blog` },
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const posts = await getLocalizedBlogPosts(locale);
  const english = locale === 'en';

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="mb-10 border-b border-border pb-6">
        <h1 className="font-heading text-4xl font-bold text-foreground">
          {english ? 'Blogs' : 'Blogs'}
        </h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          {english ? 'Stories, analysis and perspectives from our contributors.' : 'Récits, analyses et points de vue de nos contributeurs.'}
        </p>
      </header>
      {posts.length ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-xl border border-border bg-card">
              {post.mainImageUrl && (
                <Link href={`/${locale}/blog/${post.slug}`} aria-label={post.title}>
                  <img src={post.mainImageUrl} alt={post.mainImageAlt || post.title} className="aspect-video w-full object-cover" />
                </Link>
              )}
              <div className="space-y-3 p-5">
                <p className="text-sm text-muted-foreground">
                  {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(post.publishedAt)}
                  {post.author?.name ? ` · ${post.author.name}` : ''}
                </p>
                <h2 className="font-heading text-xl font-bold text-foreground">
                  <Link href={`/${locale}/blog/${post.slug}`} className="hover:text-primary">{post.title}</Link>
                </h2>
                <p className="line-clamp-3 text-muted-foreground">{post.excerpt}</p>
                <Link href={`/${locale}/blog/${post.slug}`} className="inline-flex font-semibold text-primary">
                  {english ? 'Read more' : 'Lire la suite'}
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {english ? 'No blog posts are available in this language yet.' : 'Aucun billet n’est encore disponible dans cette langue.'}
        </p>
      )}
    </main>
  );
}
