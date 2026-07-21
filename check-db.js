const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking Articles ===');
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        author: true,
      },
    });
    
    console.log(`Found ${articles.length} articles:`);
    articles.forEach(article => {
      console.log(`- Title: ${article.title}`);
      console.log(`  Slug: ${article.slug}`);
      console.log(`  Category: ${article.category?.title} (slug: ${article.category?.slug})`);
      console.log(`  Author: ${article.author?.name}`);
      console.log('---');
    });

    console.log('\n=== Checking Categories ===');
    const categories = await prisma.category.findMany();
    console.log(`Found ${categories.length} categories:`);
    categories.forEach(category => {
      console.log(`- ${category.title} (slug: ${category.slug}, id: ${category.id})`);
    });

    console.log('\n=== Checking Article Category IDs ===');
    articles.forEach(article => {
      console.log(`- Article: ${article.title}`);
      console.log(`  Category ID: ${article.categoryId}`);
      console.log(`  Category object:`, article.category);
      console.log('---');
    });

    console.log('\n=== Checking Blog Posts ===');
    const blogPosts = await prisma.blogPost.findMany({
      include: {
        author: true,
      },
    });
    
    console.log(`Found ${blogPosts.length} blog posts:`);
    blogPosts.forEach(post => {
      console.log(`- Title: ${post.title}`);
      console.log(`  Slug: ${post.slug}`);
      console.log(`  Type: ${post.type}`);
      console.log(`  Author: ${post.author?.name}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
