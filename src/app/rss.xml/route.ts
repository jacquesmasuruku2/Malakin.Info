import { prisma } from '@/lib/prisma'
import { SITE_NAME, SITE_URL } from '@/lib/site-legal'
import { getArticleUrl } from '@/lib/article-url'

export async function GET() {
  let items = ''

  try {
    const articles = await prisma.article.findMany({
      where: { publishedAt: { lte: new Date() } },
      orderBy: { publishedAt: 'desc' },
      take: 30,
      select: {
        title: true,
        slug: true,
        excerpt: true,
        publishedAt: true,
      },
    })

    items = articles
      .map((article) => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <link>${SITE_URL}${getArticleUrl('fr', article.slug, article.publishedAt)}</link>
      <guid>${SITE_URL}${getArticleUrl('fr', article.slug, article.publishedAt)}</guid>
      <description><![CDATA[${article.excerpt}]]></description>
      <pubDate>${article.publishedAt.toUTCString()}</pubDate>
    </item>`)
      .join('')
  } catch (error) {
    console.error('Error generating RSS feed:', error)
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${SITE_NAME}</title>
    <link>${SITE_URL}</link>
    <description>Actualités et analyses de ${SITE_NAME} (Malaki / Malaki Info)</description>
    <language>fr</language>
    ${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
