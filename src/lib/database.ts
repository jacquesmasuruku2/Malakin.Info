/**
 * Utilitaires pour améliorer la fiabilité des opérations de base de données
 */

function getErrorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error && 'code' in error) {
    const code = (error as { code?: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

/**
 * Réessaie une opération avec un délai exponentiel entre les tentatives
 * @param operation - L'opération asynchrone à exécuter
 * @param maxRetries - Nombre maximum de tentatives (défaut: 2)
 * @param initialDelay - Délai initial en ms (défaut: 250)
 * @returns Le résultat de l'opération ou null si toutes les tentatives échouent
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries = 2,
  initialDelay = 250
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Database operation attempt ${attempt} failed:`, error);
      const code = getErrorCode(error);
      const message = error instanceof Error ? error.message : String(error);
      const isUnreachable =
        code === 'P1001' ||
        code === 'P1002' ||
        /Can't reach database server/i.test(message) ||
        /Database timeout/i.test(message);

      if (isUnreachable || attempt === maxRetries) {
        console.error('Max retries reached for database operation');
        return null;
      }
      const delay = initialDelay * Math.pow(2, attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
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
    options?.maxRetries || 2,
    options?.delay || 250
  );
}
