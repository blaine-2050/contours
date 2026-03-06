import NodeCache from 'node-cache';
import { logger } from './logger.js';

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

const ttlSeconds = parseInt(process.env.CACHE_TTL || '', 10);
const stdTTL = isNaN(ttlSeconds) ? DEFAULT_TTL_SECONDS : ttlSeconds;

export const cache = new NodeCache({
	stdTTL,
	checkperiod: 60, // Check for expired keys every 60 seconds
	useClones: true, // Clone values to prevent mutations
});

// Log cache events in debug mode
cache.on('expired', (key: string) => {
	logger.debug('Cache key expired: ' + key);
});

cache.on('flush', () => {
	logger.debug('Cache flushed');
});

export interface CacheOptions {
	ttl?: number; // Override TTL for specific operations (in seconds)
}

/**
 * Cache wrapper for get operations
 * @param key Cache key
 * @param fetchFn Function to fetch data if not in cache
 * @param options Optional cache configuration
 * @returns Cached or fetched data
 */
export async function getCached<T>(
	key: string,
	fetchFn: () => Promise<T>,
	options?: CacheOptions
): Promise<T> {
	const cached = cache.get<T>(key);
	if (cached !== undefined) {
		logger.debug('Cache hit: ' + key);
		return cached;
	}

	logger.debug('Cache miss: ' + key);
	const data = await fetchFn();
	if (options?.ttl !== undefined) {
		cache.set(key, data, options.ttl);
	} else {
		cache.set(key, data);
	}
	return data;
}

/**
 * Set a value in the cache
 * @param key Cache key
 * @param value Value to cache
 * @param ttl Optional TTL override (in seconds)
 */
export function setCache<T>(key: string, value: T, ttl?: number): void {
	if (ttl !== undefined) {
		cache.set(key, value, ttl);
	} else {
		cache.set(key, value);
	}
	logger.debug('Cache set: ' + key);
}

/**
 * Delete a key from the cache
 * @param key Cache key to delete
 */
export function deleteCache(key: string): void {
	cache.del(key);
	logger.debug('Cache deleted: ' + key);
}

/**
 * Delete multiple keys matching a pattern
 * Note: NodeCache doesn't support pattern matching natively,
 * so we iterate through all keys
 * @param pattern String to match in keys
 */
export function deleteCachePattern(pattern: string): void {
	const keys = cache.keys();
	const matchingKeys = keys.filter((key) => key.includes(pattern));
	if (matchingKeys.length > 0) {
		cache.del(matchingKeys);
		logger.debug('Cache pattern deleted: ' + pattern);
	}
}

/**
 * Flush all cache
 */
export function flushCache(): void {
	cache.flushAll();
	logger.info('Cache flushed');
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { keys: number; hits: number; misses: number } {
	const stats = cache.getStats();
	return {
		keys: cache.keys().length,
		hits: stats.hits,
		misses: stats.misses,
	};
}

// Cache key constants
export const CACHE_KEYS = {
	POSTS_ALL: 'posts:all',
	STORIES_ALL: 'stories:all',
	CATEGORIES_ALL: 'categories:all',
} as const;

logger.info('Cache initialized with TTL: ' + stdTTL);
