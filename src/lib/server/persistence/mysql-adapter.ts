import { createHash } from 'crypto';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import { eq, desc, sql } from 'drizzle-orm';
import { getCached, deleteCache, CACHE_KEYS } from '../cache.js';
import {
	contoursPosts,
	contoursPostCategories,
	contoursCategories,
	contoursStories,
	contoursImages,
} from './schema.js';
import type { Post, PostMeta, Category, Story, StoryMeta, SearchResult } from './models.js';
import type { PersistenceAdapter, CreatePostData, CreateStoryData, ImageData } from './types.js';

function contentHash(content: string): string {
	return createHash('sha256').update(content).digest('hex');
}

const mimeTypes: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
};

// Pool configuration for connection pooling
const POOL_CONFIG = {
	connectionLimit: 10,
	acquireTimeout: 60000,
	timeout: 60000,
	queueLimit: 0, // unlimited queue
};

// Global pool instance for cleanup
let globalPool: mysql.Pool | null = null;

/**
 * Cleanup function to end the MySQL pool.
 * Should be called on server shutdown to gracefully close connections.
 */
export async function cleanupMySQLPool(): Promise<void> {
	if (globalPool) {
		await globalPool.end();
		globalPool = null;
	}
}

/**
 * Get the current pool instance (for health checks, etc.)
 */
export function getMySQLPool(): mysql.Pool | null {
	return globalPool;
}

export class MysqlAdapter implements PersistenceAdapter {
	private db;
	private pool: mysql.Pool;

	constructor(databaseUrl: string) {
		this.pool = mysql.createPool({
			uri: databaseUrl,
			...POOL_CONFIG,
		});
		globalPool = this.pool;
		this.db = drizzle(this.pool);
	}

	// --- Posts ---

	async getAllPosts(): Promise<PostMeta[]> {
		return getCached(CACHE_KEYS.POSTS_ALL, async () => {
			const rows = await this.db
				.select()
				.from(contoursPosts)
				.orderBy(desc(contoursPosts.date), desc(contoursPosts.time));

			const posts: PostMeta[] = [];
			for (const row of rows) {
				const cats = await this.db
					.select()
					.from(contoursPostCategories)
					.where(eq(contoursPostCategories.postSlug, row.slug));

				posts.push({
					slug: row.slug,
					title: row.title,
					date: row.date,
					time: row.time ?? undefined,
					author: row.author,
					categories: cats.map((c) => c.categoryId),
					image: row.image ?? undefined,
				});
			}
			return posts;
		});
	}

	async getPostsByCategory(categoryId: string): Promise<PostMeta[]> {
		const posts = await this.getAllPosts();
		return posts.filter((p) => p.categories.includes(categoryId));
	}

	async getPostBySlug(slug: string): Promise<Post | null> {
		const rows = await this.db
			.select()
			.from(contoursPosts)
			.where(eq(contoursPosts.slug, slug))
			.limit(1);

		if (rows.length === 0) return null;
		const row = rows[0];

		const cats = await this.db
			.select()
			.from(contoursPostCategories)
			.where(eq(contoursPostCategories.postSlug, slug));

		return {
			slug: row.slug,
			title: row.title,
			date: row.date,
			time: row.time ?? undefined,
			author: row.author,
			categories: cats.map((c) => c.categoryId),
			image: row.image ?? undefined,
			content: row.content,
		};
	}

	async createPost(data: CreatePostData): Promise<string> {
		const slug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const hash = contentHash(data.content);

		await this.db.insert(contoursPosts).values({
			slug,
			title: data.title,
			date: data.date,
			time: data.time ?? null,
			author: data.author || 'Blaine',
			image: data.image ?? null,
			content: data.content,
			contentHash: hash,
		});

		if (data.categories && data.categories.length > 0) {
			await this.db.insert(contoursPostCategories).values(
				data.categories.map((catId) => ({
					postSlug: slug,
					categoryId: catId,
				}))
			);
		}

		// Invalidate posts cache
		deleteCache(CACHE_KEYS.POSTS_ALL);

		return slug;
	}

	// --- Images ---

	async savePostImage(file: File, slug: string): Promise<string> {
		const ext = file.name.split('.').pop() || 'jpg';
		const filename = `${slug}.${ext}`;
		const mimeType = mimeTypes[`.${ext}`] || 'application/octet-stream';
		const buffer = Buffer.from(await file.arrayBuffer());

		// Upsert: delete existing then insert
		await this.db.delete(contoursImages).where(eq(contoursImages.filename, filename));
		await this.db.insert(contoursImages).values({
			filename,
			mimeType,
			data: buffer,
		});

		return filename;
	}

	async deletePostImage(filename: string): Promise<boolean> {
		const result = await this.db
			.delete(contoursImages)
			.where(eq(contoursImages.filename, filename));
		return (result[0] as unknown as { affectedRows: number }).affectedRows > 0;
	}

	async getImage(filename: string): Promise<ImageData | null> {
		const rows = await this.db
			.select()
			.from(contoursImages)
			.where(eq(contoursImages.filename, filename))
			.limit(1);

		if (rows.length === 0) return null;

		return {
			data: Buffer.from(rows[0].data),
			mimeType: rows[0].mimeType,
		};
	}

	// --- Categories ---

	async getCategories(): Promise<Category[]> {
		return getCached(CACHE_KEYS.CATEGORIES_ALL, async () => {
			const rows = await this.db.select().from(contoursCategories);
			return rows.map((r) => ({ id: r.id, name: r.name }));
		});
	}

	async addCategory(name: string): Promise<Category> {
		const id = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const existing = await this.db
			.select()
			.from(contoursCategories)
			.where(eq(contoursCategories.id, id))
			.limit(1);

		if (existing.length > 0) {
			return { id: existing[0].id, name: existing[0].name };
		}

		await this.db.insert(contoursCategories).values({ id, name });

		// Invalidate categories cache
		deleteCache(CACHE_KEYS.CATEGORIES_ALL);

		return { id, name };
	}

	async removeCategory(id: string): Promise<boolean> {
		const result = await this.db.delete(contoursCategories).where(eq(contoursCategories.id, id));
		const success = (result[0] as unknown as { affectedRows: number }).affectedRows > 0;

		if (success) {
			// Invalidate categories cache
			deleteCache(CACHE_KEYS.CATEGORIES_ALL);
		}

		return success;
	}

	// --- Stories ---

	async getAllStories(): Promise<StoryMeta[]> {
		return getCached(CACHE_KEYS.STORIES_ALL, async () => {
			const rows = await this.db
				.select()
				.from(contoursStories)
				.orderBy(desc(contoursStories.date), desc(contoursStories.time));

			return rows.map((r) => ({
				slug: r.slug,
				title: r.title,
				date: r.date,
				time: r.time ?? undefined,
				author: r.author,
				summary: r.summary ?? undefined,
			}));
		});
	}

	async getStoryBySlug(slug: string): Promise<Story | null> {
		const rows = await this.db
			.select()
			.from(contoursStories)
			.where(eq(contoursStories.slug, slug))
			.limit(1);

		if (rows.length === 0) return null;
		const row = rows[0];

		return {
			slug: row.slug,
			title: row.title,
			date: row.date,
			time: row.time ?? undefined,
			author: row.author,
			summary: row.summary ?? undefined,
			content: row.content,
		};
	}

	async createStory(data: CreateStoryData): Promise<string> {
		const slug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const hash = contentHash(data.content);

		await this.db.insert(contoursStories).values({
			slug,
			title: data.title,
			date: data.date,
			time: data.time ?? null,
			author: data.author || 'Blaine',
			summary: data.summary ?? null,
			content: data.content,
			contentHash: hash,
		});

		// Invalidate stories cache
		deleteCache(CACHE_KEYS.STORIES_ALL);

		return slug;
	}

	// --- Search ---

	async searchPosts(query: string): Promise<SearchResult[]> {
		if (!query.trim()) return [];

		// Use MySQL REGEXP for search
		const rows = await this.db
			.select()
			.from(contoursPosts)
			.where(
				sql`(${contoursPosts.title} REGEXP ${query} OR ${contoursPosts.content} REGEXP ${query})`
			)
			.orderBy(desc(contoursPosts.date), desc(contoursPosts.time));

		const results: SearchResult[] = [];
		for (const row of rows) {
			const cats = await this.db
				.select()
				.from(contoursPostCategories)
				.where(eq(contoursPostCategories.postSlug, row.slug));

			let matchContext: string | undefined;
			const titleRegex = new RegExp(query, 'i');
			if (titleRegex.test(row.title)) {
				matchContext = `Title: ${row.title}`;
			} else {
				const match = row.content.match(titleRegex);
				if (match && match.index !== undefined) {
					const start = Math.max(0, match.index - 50);
					const end = Math.min(row.content.length, match.index + match[0].length + 50);
					let context = row.content.substring(start, end);
					if (start > 0) context = '...' + context;
					if (end < row.content.length) context = context + '...';
					matchContext = context;
				}
			}

			results.push({
				slug: row.slug,
				title: row.title,
				date: row.date,
				time: row.time ?? undefined,
				author: row.author,
				categories: cats.map((c) => c.categoryId),
				image: row.image ?? undefined,
				matchContext,
			});
		}

		return results;
	}

	// --- Publish helpers (used by publish endpoint) ---

	async upsertPost(
		post: Post & { contentHash: string }
	): Promise<'inserted' | 'updated' | 'skipped'> {
		const existing = await this.db
			.select({ slug: contoursPosts.slug, contentHash: contoursPosts.contentHash })
			.from(contoursPosts)
			.where(eq(contoursPosts.slug, post.slug))
			.limit(1);

		if (existing.length === 0) {
			await this.db.insert(contoursPosts).values({
				slug: post.slug,
				title: post.title,
				date: post.date,
				time: post.time ?? null,
				author: post.author,
				image: post.image ?? null,
				content: post.content,
				contentHash: post.contentHash,
			});

			// Insert categories
			if (post.categories.length > 0) {
				await this.db.insert(contoursPostCategories).values(
					post.categories.map((catId) => ({
						postSlug: post.slug,
						categoryId: catId,
					}))
				);
			}
			return 'inserted';
		}

		if (existing[0].contentHash === post.contentHash) {
			return 'skipped';
		}

		// Update post
		await this.db
			.update(contoursPosts)
			.set({
				title: post.title,
				date: post.date,
				time: post.time ?? null,
				author: post.author,
				image: post.image ?? null,
				content: post.content,
				contentHash: post.contentHash,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(contoursPosts.slug, post.slug));

		// Replace categories
		await this.db
			.delete(contoursPostCategories)
			.where(eq(contoursPostCategories.postSlug, post.slug));
		if (post.categories.length > 0) {
			await this.db.insert(contoursPostCategories).values(
				post.categories.map((catId) => ({
					postSlug: post.slug,
					categoryId: catId,
				}))
			);
		}

		return 'updated';
	}

	async upsertStory(
		story: Story & { contentHash: string }
	): Promise<'inserted' | 'updated' | 'skipped'> {
		const existing = await this.db
			.select({ slug: contoursStories.slug, contentHash: contoursStories.contentHash })
			.from(contoursStories)
			.where(eq(contoursStories.slug, story.slug))
			.limit(1);

		if (existing.length === 0) {
			await this.db.insert(contoursStories).values({
				slug: story.slug,
				title: story.title,
				date: story.date,
				time: story.time ?? null,
				author: story.author,
				summary: story.summary ?? null,
				content: story.content,
				contentHash: story.contentHash,
			});
			return 'inserted';
		}

		if (existing[0].contentHash === story.contentHash) {
			return 'skipped';
		}

		await this.db
			.update(contoursStories)
			.set({
				title: story.title,
				date: story.date,
				time: story.time ?? null,
				author: story.author,
				summary: story.summary ?? null,
				content: story.content,
				contentHash: story.contentHash,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(contoursStories.slug, story.slug));

		return 'updated';
	}

	async upsertCategory(category: Category): Promise<void> {
		const existing = await this.db
			.select()
			.from(contoursCategories)
			.where(eq(contoursCategories.id, category.id))
			.limit(1);

		if (existing.length === 0) {
			await this.db.insert(contoursCategories).values({
				id: category.id,
				name: category.name,
			});
		}
	}

	async saveImageBlob(filename: string, data: Buffer, mimeType: string): Promise<void> {
		await this.db.delete(contoursImages).where(eq(contoursImages.filename, filename));
		await this.db.insert(contoursImages).values({
			filename,
			mimeType,
			data,
		});
	}

	async close(): Promise<void> {
		await this.pool.end();
	}
}
