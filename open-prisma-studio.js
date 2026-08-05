const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function testConnection() {
  try {
    console.log('🔗 Testing database connection...');
    await prisma.$connect();
    console.log('✅ Connected to database successfully!');
    
    console.log('\n📊 Database statistics:');
    
    const articles = await prisma.article.count();
    console.log(`   Articles: ${articles}`);
    
    const authors = await prisma.author.count();
    console.log(`   Authors: ${authors}`);
    
    const categories = await prisma.category.count();
    console.log(`   Categories: ${categories}`);
    
    const lives = await prisma.liveEvent.count();
    console.log(`   Live Events: ${lives}`);
    
    const liveEvents = await prisma.liveEvent.findMany({
      orderBy: { startTime: 'desc' },
      take: 5
    });
    
    if (liveEvents.length > 0) {
      console.log('\n📺 Recent Live Events:');
      liveEvents.forEach((live, index) => {
        console.log(`   ${index + 1}. ${live.title} (${live.status})`);
      });
    } else {
      console.log('\n   No live events found in database');
    }
    
    console.log('\n🚀 Opening Prisma Studio...');
    console.log('   Run: npx prisma studio');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();
