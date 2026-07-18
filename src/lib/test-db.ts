import 'dotenv/config'
import { prisma } from './prisma'

async function testConnection() {
  try {
    console.log('Test de connexion à la base de données...')
    
    // Test de connexion simple
    await prisma.$connect()
    console.log('✅ Connexion réussie à la base de données')
    
    // Test de lecture des catégories
    const categories = await prisma.category.findMany()
    console.log(`✅ ${categories.length} catégories trouvées`)
    
    // Test de lecture des auteurs
    const authors = await prisma.author.findMany()
    console.log(`✅ ${authors.length} auteurs trouvés`)
    
    // Test de lecture des articles
    const articles = await prisma.article.findMany()
    console.log(`✅ ${articles.length} articles trouvés`)
    
    await prisma.$disconnect()
    console.log('✅ Déconnexion réussie')
    
    return { success: true, categories, authors, articles }
  } catch (error) {
    console.error('❌ Erreur de connexion:', error)
    await prisma.$disconnect()
    return { success: false, error }
  }
}

// Exécuter le test si ce fichier est exécuté directement
if (require.main === module) {
  testConnection()
}

export { testConnection }
