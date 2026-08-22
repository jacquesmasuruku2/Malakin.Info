/**
 * Utilitaires pour améliorer la fiabilité des opérations de base de données
 */

/**
 * Réessaie une opération avec un délai exponentiel entre les tentatives
 * @param operation - L'opération asynchrone à exécuter
 * @param maxRetries - Nombre maximum de tentatives (défaut: 3)
 * @param initialDelay - Délai initial en ms (défaut: 500)
 * @returns Le résultat de l'opération ou null si toutes les tentatives échouent
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 500
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        console.error('Max retries reached for database operation');
        return null;
      }
      // Délai exponentiel : 500ms, 1000ms, 2000ms...
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  return null;
}

/**
 * Wrapper pour les requêtes Prisma avec retry automatique
 * Utiliser pour les opérations critiques qui peuvent échouer temporairement
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options?: { maxRetries?: number; delay?: number }
): Promise<T | null> {
  return retryOperation(
    operation,
    options?.maxRetries || 3,
    options?.delay || 500
  );
}
