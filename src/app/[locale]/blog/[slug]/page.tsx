import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import ReadAlsoRenderer from '@/components/ReadAlsoRenderer';
import BlogViewIncrementer from '@/components/BlogViewIncrementer';
import ShareButtons from '@/components/ShareButtons';
import { getLocalizedBlogPost } from '@/lib/blog-translations';
import { normalizeArticleHtmlContent } from '@/lib/tags';
import { SITE_URL } from '@/lib/site-legal';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await getLocalizedBlogPost(slug, locale);
  if (!post) {
    return {
      title: locale === 'en' ? 'Blog post unavailable | MalakInfo' : 'Billet indisponible | MalakInfo',
      robots: { index: false, follow: true },
    };
  }

  const canonical = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const languageAlternates = Object.fromEntries(
    post.availableLocales
      .filter((item) => item === 'fr' || item === 'en')
      .map((item) => [item === 'fr' ? 'fr-FR' : 'en-US', `${SITE_URL}/${item}/blog/${post.slug}`]),
  );
  const title = post.seoTitle || post.title;
  const description = post.seoDescription || post.excerpt;
  const image = post.mainImageUrl
    ? (post.mainImageUrl.startsWith('http') ? post.mainImageUrl : `${SITE_URL}${post.mainImageUrl}`)
    : undefined;

  return {
    title,
    description,
    authors: post.author ? [{ name: post.author.name }] : [{ name: 'MalakInfo' }],
    alternates: { canonical, languages: languageAlternates },
    openGraph: {
      type: 'article',
      locale: locale === 'en' ? 'en_US' : 'fr_FR',
      url: canonical,
      title,
      description,
      siteName: 'MalakInfo',
      publishedTime: post.publishedAt.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      images: image ? [{ url: image, alt: post.mainImageAlt || post.title }] : [],
    },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : [] },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = await getLocalizedBlogPost(slug, locale);
  if (!post) notFound();

  const content = normalizeArticleHtmlContent(post.content);
  const canonical = `${SITE_URL}/${locale}/blog/${post.slug}`;
  const localeLabels: Record<string, string> = { fr: 'Français', en: 'English' };

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <article>
        <BlogViewIncrementer blogPostId={post.id} />
        <Link href={`/${locale}/blog`} className="mb-6 inline-flex font-medium text-primary">
          {locale === 'en' ? 'All blogs' : 'Tous les blogs'}
        </Link>
        <header className="mb-8">
          <p className="mb-3 text-sm text-muted-foreground">
            {new Intl.DateTimeFormat(locale, { dateStyle: 'long' }).format(post.publishedAt)}
            {post.author?.name ? ` · ${post.author.name}` : ''}
          </p>
          <h1 className="font-heading text-3xl font-bold leading-tight text-foreground md:text-5xl">{post.title}</h1>
          <p className="mt-5 text-lg text-muted-foreground">{post.excerpt}</p>
        </header>
        {post.mainImageUrl && (
          <figure className="mb-8">
            <img src={post.mainImageUrl} alt={post.mainImageAlt || post.title} className="h-auto w-full rounded-lg object-cover" />
            {post.mainImageAlt && <figcaption className="mt-2 text-sm italic text-muted-foreground">{post.mainImageAlt}</figcaption>}
          </figure>
        )}
        <div className="mb-6">
          <ShareButtons title={post.title} url={canonical} locale={locale} />
        </div>
        <ReadAlsoRenderer content={content} locale={locale} />
        <nav aria-label={locale === 'en' ? 'Available languages' : 'Langues disponibles'} className="mt-10 flex gap-4 border-t border-border pt-5">
          {post.availableLocales.filter((item) => item !== locale && localeLabels[item]).map((item) => (
            <Link key={item} href={`/${item}/blog/${post.slug}`} hrefLang={item} className="font-medium text-primary">
              {localeLabels[item]}
            </Link>
          ))}
        </nav>
      </article>
    </main>
  );
}
