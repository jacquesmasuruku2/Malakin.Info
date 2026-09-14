import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getArchiveYears } from '@/lib/archives'
import { SITE_URL } from '@/lib/site-legal'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date()
  const locales = ['fr', 'en'] as const

  const staticPaths = [
    '',
    '/actualites',
    '/politique',
    '/economie',
    '/societe',
    '/sante',
    '/securite',
    '/environnement',
    '/culture',
    '/sport',
    '/religion',
    '/science-tech',
    '/emploi',
    '/contact',
    '/a-propos',
    '/mission',
    '/equipe',
    '/charte',
    '/mentions-legales',
    '/politique-confidentialite',
    '/cookies',
    '/conditions-utilisation',
    '/nous-soutenir',
    '/partenariats',
    '/archives',
  ]

  const staticPages: MetadataRoute.Sitemap = locales.flatMap((locale) =>
    staticPaths.map((path) => ({
      url: `${SITE_URL}/${locale}${path}`,
      lastModified: currentDate,
      changeFrequency: path === '' || path === '/actualites' ? 'daily' : 'weekly',
      priority: path === '' ? 1 : 0.7,
    }))
  )

  try {
    const articles = await prisma.article.findMany({
      select: { slug: true, updatedAt: true },
      orderBy: { publishedAt: 'desc' },
      take: 1000,
    })

    const articlePages: MetadataRoute.Sitemap = articles.flatMap((article) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/${article.slug}`,
        lastModified: article.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    )

    const archiveYears = await getArchiveYears()
    const archiveYearPages: MetadataRoute.Sitemap = archiveYears.flatMap((year) =>
      locales.map((locale) => ({
        url: `${SITE_URL}/${locale}/archives/${year}`,
        lastModified: currentDate,
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    )

    return [...staticPages, ...articlePages, ...archiveYearPages]
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return staticPages
  }
}
