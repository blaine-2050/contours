import { createHash } from 'crypto';
import { json, error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { FileAdapter } from '$lib/server/persistence';
import { MysqlAdapter } from '$lib/server/persistence/mysql-adapter.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async () => {
	if (!dev) {
		throw error(404, 'Not found');
	}

	const dbUrl = process.env.RAILWAY_DB_URL;
	if (!dbUrl) {
		throw error(500, 'RAILWAY_DB_URL is not configured');
	}

	const source = new FileAdapter();
	const target = new MysqlAdapter(dbUrl);

	const results = {
		categories: { inserted: 0, skipped: 0 },
		posts: { inserted: 0, updated: 0, skipped: 0 },
		stories: { inserted: 0, updated: 0, skipped: 0 },
		images: { synced: 0 },
		errors: [] as string[]
	};

	try {
		// 1. Sync categories
		const categories = await source.getCategories();
		for (const cat of categories) {
			try {
				await target.upsertCategory(cat);
				results.categories.inserted++;
			} catch {
				results.categories.skipped++;
			}
		}

		// 2. Sync posts (with images)
		const postMetas = await source.getAllPosts();
		for (const meta of postMetas) {
			try {
				const post = await source.getPostBySlug(meta.slug);
				if (!post) continue;

				const hash = createHash('sha256').update(post.content).digest('hex');
				const outcome = await target.upsertPost({ ...post, contentHash: hash });
				results.posts[outcome]++;

				// Sync image if post has one
				if (post.image) {
					const imageData = await source.getImage(post.image);
					if (imageData) {
						await target.saveImageBlob(post.image, imageData.data, imageData.mimeType);
						results.images.synced++;
					}
				}
			} catch (err) {
				results.errors.push(`Post "${meta.slug}": ${String(err)}`);
			}
		}

		// 3. Sync stories
		const storyMetas = await source.getAllStories();
		for (const meta of storyMetas) {
			try {
				const story = await source.getStoryBySlug(meta.slug);
				if (!story) continue;

				const hash = createHash('sha256').update(story.content).digest('hex');
				const outcome = await target.upsertStory({ ...story, contentHash: hash });
				results.stories[outcome]++;
			} catch (err) {
				results.errors.push(`Story "${meta.slug}": ${String(err)}`);
			}
		}
	} finally {
		await target.close();
	}

	return json(results);
};
