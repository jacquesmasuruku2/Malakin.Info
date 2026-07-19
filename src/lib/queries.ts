import { client } from './sanity'

export async function getArticles() {
  if (!client) return []
  return await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      readTime,
      featured,
      mainImage,
      category->{
        _id,
        title,
        slug,
        color,
        icon
      },
      author->{
        name,
        image
      }
    }
  `)
}

export async function getFeaturedArticles() {
  if (!client) return []
  return await client.fetch(`
    *[_type == "article" && featured == true] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      readTime,
      mainImage,
      category->{
        _id,
        title,
        slug,
        color
      }
    }[0...3]
  `)
}

export async function getLatestArticles() {
  if (!client) return []
  return await client.fetch(`
    *[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      readTime,
      mainImage,
      category->{
        _id,
        title,
        slug
      }
    }[0...6]
  `)
}

export async function getArticleBySlug(slug: string) {
  if (!client) return null
  return await client.fetch(`
    *[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      content,
      publishedAt,
      readTime,
      mainImage,
      category->{
        _id,
        title,
        slug,
        color
      },
      author->{
        name,
        bio,
        image
      }
    }
  `, { slug })
}

export async function getArticlesByCategory(categorySlug: string) {
  if (!client) return []
  return await client.fetch(`
    *[_type == "article" && category->slug.current == $categorySlug] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      publishedAt,
      readTime,
      mainImage,
      category->{
        _id,
        title,
        slug
      }
    }
  `, { categorySlug })
}

export async function getCategories() {
  if (!client) return []
  return await client.fetch(`
    *[_type == "category"] | order(title asc) {
      _id,
      title,
      slug,
      color,
      icon,
      description
    }
  `)
}

export async function getCategoryBySlug(slug: string) {
  if (!client) return null
  return await client.fetch(`
    *[_type == "category" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      color,
      icon,
      description
    }
  `, { slug })
}

export async function searchArticles(query: string) {
  if (!client) return []
  const searchQuery = `*[_type == "article" && (title match "*${query}*" || excerpt match "*${query}*")] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    publishedAt,
    readTime,
    mainImage,
    category->{
      _id,
      title,
      slug
    }
  }`
  return await client.fetch(searchQuery as any)
}

export async function getPosts() {
  if (!client) return []
  return await client.fetch(`
    *[_type == "post"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      content,
      publishedAt,
      mainImage,
      author->{
        name
      }
    }
  `)
}
