/** Lightweight Prisma select for article listing grids (never fetch `content`). */
export const articleListingSelect = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  mainImageUrl: true,
  mainImageAlt: true,
  publishedAt: true,
  readTime: true,
  category: {
    select: { id: true, slug: true, title: true },
  },
  author: {
    select: { name: true, slug: true },
  },
} as const;
