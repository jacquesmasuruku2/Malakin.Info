/**
 * Translation Cache System
 * Provides caching for translations to improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class TranslationCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 1000 * 60 * 60; // 1 hour default TTL

  /**
   * Generate cache key
   */
  private generateKey(type: string, id: string, locale: string): string {
    return `${type}:${id}:${locale}`;
  }

  /**
   * Get cached data
   */
  get<T>(type: string, id: string, locale: string): T | null {
    const key = this.generateKey(type, id, locale);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cached data
   */
  set<T>(type: string, id: string, locale: string, data: T, ttl?: number): void {
    const key = this.generateKey(type, id, locale);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    };

    this.cache.set(key, entry);
  }

  /**
   * Delete cached data
   */
  delete(type: string, id: string, locale: string): void {
    const key = this.generateKey(type, id, locale);
    this.cache.delete(key);
  }

  /**
   * Clear all cache for a specific type
   */
  clearType(type: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache for a specific ID
   */
  clearId(id: string): void {
    const keysToDelete: string[] = [];
    
    for (const key of this.cache.keys()) {
      if (key.includes(`:${id}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Export singleton instance
export const translationCache = new TranslationCache();

/**
 * Cache decorator for translation functions
 */
export function withCache<T>(
  type: string,
  fetchFn: (id: string, locale: string) => Promise<T>,
  ttl?: number
) {
  return async (id: string, locale: string): Promise<T> => {
    // Try to get from cache first
    const cached = translationCache.get<T>(type, id, locale);
    if (cached !== null) {
      return cached;
    }

    // Fetch fresh data
    const data = await fetchFn(id, locale);

    // Store in cache
    translationCache.set(type, id, locale, data, ttl);

    return data;
  };
}