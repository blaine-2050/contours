import NodeCache from 'node-cache';
import { logger } from './logger.js';

const DEFAULT_TTL_SECONDS = 300; // 5 minutes

const ttlSeconds = parseInt(process.env.CACHE_TTL || '', 10);
const stdTTL = isNaN(ttlSeconds) ? DEFAULT_TTL_SECONDS : ttlSeconds;

export const cache = new NodeCache({
	stdTTL,
	checkperiod: 60,
	useClones: true,
});

cache.on('expired', (key: string) => {
	logger.debug('Cache key expired', { key });
});

cache.on('flush', () => {
	logger.debug('Cache flushed');
});

export interface CacheOptions {
	ttl?: number;
}

export async function getCached<T>(
	key: string,
	fetchFn: () => Promise<T>,
	options?: CacheOptions
): Promise<T> {
	const cached = cache.get<T>(key);
	if (cached !== undefined) {
		logger.debug('Cache hit', { key });
		return cached;
	}

	logger.debug('Cache miss', { key });
	const data = await fetchFn();
	if (options?.ttl !== undefined) {
		cache.set(key, data, options.ttl);
	} else {
		cache.set(key, data);
	}
	return data;
}

export function setCache<T>(key: string, value: T, ttl?: number): void {
	if (ttl !== undefined) {
		cache.set(key, value, ttl);
	} else {
		cache.set(key, value);
	}
	logger.debug('Cache set', { key });
}

export function deleteCache(key: string): void {
	cache.del(key);
	logger.debug('Cache deleted', { key });
}

export function deleteCachePattern(pattern: string): void {
	const keys = cache.keys();
	const matchingKeys = keys.filter((key) => key.includes(pattern));
	if (matchingKeys.length > 0) {
		cache.del(matchingKeys);
		logger.debug('Cache pattern deleted', { pattern, keys: matchingKeys });
	}
}

export function flushCache(): void {
	cache.flushAll();
	logger.info('Cache flushed');
}

export function getCacheStats(): { keys: number; hits: number; misses: number } {
	const stats = cache.getStats();
	return {
		keys: cache.keys().length,
		hits: stats.hits,
		misses: stats.misses,
	};
}

export const CACHE_KEYS = {
	POSTS_ALL: 'posts:all',
	STORIES_ALL: 'stories:all',
	CATEGORIES_ALL: 'categories:all',
} as const;

logger.info('Cache initialized', { stdTTL });
