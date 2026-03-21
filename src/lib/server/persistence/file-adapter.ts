import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { getCached, deleteCache, CACHE_KEYS } from '../cache.js';
import type { Post, PostMeta, Category, Story, StoryMeta, SearchResult } from './models.js';
import type { PersistenceAdapter, CreatePostData, UpdatePostData, CreateStoryData, ImageData } from './types.js';

const postsDirectory = path.join(process.cwd(), 'posts');
const storiesDirectory = path.join(process.cwd(), 'stories');
const categoriesFile = path.join(process.cwd(), 'data', 'categories.json');

const mimeTypes: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
};

function parseCategories(data: Record<string, unknown>): string[] {
	if (!data.categories) return [];
	if (Array.isArray(data.categories)) return data.categories.map(String);
	if (typeof data.categories === 'string') {
		return data.categories
			.split(',')
			.map((c) => c.trim())
			.filter(Boolean);
	}
	return [];
}

function parseDate(value: unknown): string {
	if (!value) return new Date().toISOString().split('T')[0];
	if (value instanceof Date) {
		return value.toISOString().split('T')[0];
	}
	return String(value);
}

function parseTime(value: unknown): string | undefined {
	if (!value) return undefined;
	const str = String(value);
	// Already HH:MM format
	if (/^\d{1,2}:\d{2}$/.test(str)) return str.padStart(5, '0');
	// Numeric: YAML parsed "07:20" as 720, "13:08" as 1308
	if (/^\d{1,4}$/.test(str)) {
		const padded = str.padStart(4, '0');
		return `${padded.slice(0, 2)}:${padded.slice(2)}`;
	}
	return str;
}

function ensureDataDir() {
	const dataDir = path.dirname(categoriesFile);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

export class FileAdapter implements PersistenceAdapter {
	// --- Posts ---

	async getAllPosts(): Promise<PostMeta[]> {
		return getCached(CACHE_KEYS.POSTS_ALL, async () => {
			if (!fs.existsSync(postsDirectory)) {
				return [];
			}

			const files = fs.readdirSync(postsDirectory).filter((file) => file.endsWith('.md'));

			const posts = files.map((filename) => {
				const slug = filename.replace(/\.md$/, '');
				const filePath = path.join(postsDirectory, filename);
				const fileContents = fs.readFileSync(filePath, 'utf8');
				const { data } = matter(fileContents);

				return {
					slug,
					title: data.title || slug,
					date: parseDate(data.date),
					time: parseTime(data.time),
					author: data.author || 'Blaine',
					categories: parseCategories(data),
					image: data.image ? String(data.image) : undefined,
					technical: data.technical === true,
				};
			});

			return posts.sort((a, b) => {
				const dateA = new Date(`${a.date}T${a.time || '00:00'}:00Z`);
				const dateB = new Date(`${b.date}T${b.time || '00:00'}:00Z`);
				return dateB.getTime() - dateA.getTime();
			});
		});
	}

	async getPostsByCategory(categoryId: string): Promise<PostMeta[]> {
		const posts = await this.getAllPosts();
		return posts.filter((post) => post.categories.includes(categoryId));
	}

	async getPostBySlug(slug: string): Promise<Post | null> {
		const filePath = path.join(postsDirectory, `${slug}.md`);

		if (!fs.existsSync(filePath)) {
			return null;
		}

		const fileContents = fs.readFileSync(filePath, 'utf8');
		const { data, content } = matter(fileContents);

		return {
			slug,
			title: data.title || slug,
			date: parseDate(data.date),
			time: parseTime(data.time),
			author: data.author || 'Blaine',
			categories: parseCategories(data),
			image: data.image ? String(data.image) : undefined,
			technical: data.technical === true,
			content,
		};
	}

	async createPost(data: CreatePostData): Promise<string> {
		const slug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const categoriesLine =
			data.categories && data.categories.length > 0
				? `categories: [${data.categories.join(', ')}]\n`
				: '';

		const timeLine = data.time ? `time: ${data.time}\n` : '';
		const imageLine = data.image ? `image: ${data.image}\n` : '';
		const technicalLine = data.technical ? `technical: true\n` : '';

		const frontmatter = `---
title: ${data.title}
date: ${data.date}
${timeLine}author: ${data.author || 'Blaine'}
${categoriesLine}${imageLine}${technicalLine}---

${data.content}`;

		const filePath = path.join(postsDirectory, `${slug}.md`);
		fs.writeFileSync(filePath, frontmatter);

		// Invalidate posts cache
		deleteCache(CACHE_KEYS.POSTS_ALL);

		return slug;
	}

	async updatePost(slug: string, data: UpdatePostData): Promise<void> {
		const filePath = path.join(postsDirectory, `${slug}.md`);
		if (!fs.existsSync(filePath)) {
			throw new Error(`Post not found: ${slug}`);
		}

		const categoriesLine =
			data.categories && data.categories.length > 0
				? `categories: [${data.categories.join(', ')}]\n`
				: '';

		const timeLine = data.time ? `time: ${data.time}\n` : '';
		const imageLine = data.image ? `image: ${data.image}\n` : '';
		const technicalLine = data.technical ? `technical: true\n` : '';

		const frontmatter = `---
title: ${data.title}
date: ${data.date}
${timeLine}author: ${data.author || 'Blaine'}
${categoriesLine}${imageLine}${technicalLine}---

${data.content}`;

		fs.writeFileSync(filePath, frontmatter);
		deleteCache(CACHE_KEYS.POSTS_ALL);
	}

	// --- Images ---

	async savePostImage(file: File, slug: string): Promise<string> {
		const imagesDir = path.join(postsDirectory, 'images');
		if (!fs.existsSync(imagesDir)) {
			fs.mkdirSync(imagesDir, { recursive: true });
		}

		const ext = file.name.split('.').pop() || 'jpg';
		const filename = `${slug}.${ext}`;
		const filePath = path.join(imagesDir, filename);

		const buffer = Buffer.from(await file.arrayBuffer());
		fs.writeFileSync(filePath, buffer);

		return filename;
	}

	async deletePostImage(filename: string): Promise<boolean> {
		const filePath = path.join(postsDirectory, 'images', filename);
		if (fs.existsSync(filePath)) {
			fs.unlinkSync(filePath);
			return true;
		}
		return false;
	}

	async getImage(filename: string): Promise<ImageData | null> {
		const imagesDir = path.join(postsDirectory, 'images');
		const filePath = path.join(imagesDir, filename);

		// Security: prevent directory traversal
		if (!filePath.startsWith(imagesDir)) {
			return null;
		}

		if (!fs.existsSync(filePath)) {
			return null;
		}

		const ext = path.extname(filename).toLowerCase();
		const mimeType = mimeTypes[ext] || 'application/octet-stream';
		const data = fs.readFileSync(filePath);

		return { data, mimeType };
	}

	// --- Categories ---

	async getCategories(): Promise<Category[]> {
		return getCached(CACHE_KEYS.CATEGORIES_ALL, async () => {
			ensureDataDir();
			if (!fs.existsSync(categoriesFile)) {
				return [];
			}
			const data = fs.readFileSync(categoriesFile, 'utf8');
			const categories = JSON.parse(data);
			// Filter out timestamp fields, return only id and name for interface compatibility
			return categories.map((c: { id: string; name: string }) => ({ id: c.id, name: c.name }));
		});
	}

	async addCategory(name: string): Promise<Category> {
		const categories = await this.getCategories();
		const id = name
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		if (categories.some((c) => c.id === id)) {
			return categories.find((c) => c.id === id)!;
		}

		const now = new Date().toISOString();
		// Store with timestamps for DB compatibility
		const categoryWithTimestamps = { id, name, createdAt: now, updatedAt: now };
		const category: Category = { id, name };

		// Read raw file to preserve timestamps
		ensureDataDir();
		let rawCategories: Array<{ id: string; name: string; createdAt?: string; updatedAt?: string }> = [];
		if (fs.existsSync(categoriesFile)) {
			const data = fs.readFileSync(categoriesFile, 'utf8');
			rawCategories = JSON.parse(data);
		}
		rawCategories.push(categoryWithTimestamps);
		fs.writeFileSync(categoriesFile, JSON.stringify(rawCategories, null, 2));

		// Invalidate categories cache
		deleteCache(CACHE_KEYS.CATEGORIES_ALL);

		return category;
	}

	async removeCategory(id: string): Promise<boolean> {
		ensureDataDir();
		if (!fs.existsSync(categoriesFile)) {
			return false;
		}

		const data = fs.readFileSync(categoriesFile, 'utf8');
		const rawCategories: Array<{ id: string; name: string; createdAt?: string; updatedAt?: string }> = JSON.parse(data);
		const filtered = rawCategories.filter((c) => c.id !== id);

		if (filtered.length === rawCategories.length) {
			return false;
		}

		fs.writeFileSync(categoriesFile, JSON.stringify(filtered, null, 2));

		// Invalidate categories cache
		deleteCache(CACHE_KEYS.CATEGORIES_ALL);

		return true;
	}

	// --- Stories ---

	async getAllStories(): Promise<StoryMeta[]> {
		return getCached(CACHE_KEYS.STORIES_ALL, async () => {
			if (!fs.existsSync(storiesDirectory)) {
				return [];
			}

			const files = fs.readdirSync(storiesDirectory).filter((file) => file.endsWith('.md'));

			const stories = files.map((filename) => {
				const slug = filename.replace(/\.md$/, '');
				const filePath = path.join(storiesDirectory, filename);
				const fileContents = fs.readFileSync(filePath, 'utf8');
				const { data } = matter(fileContents);

				return {
					slug,
					title: data.title || slug,
					date: parseDate(data.date),
					time: parseTime(data.time),
					author: data.author || 'Blaine',
					summary: data.summary ? String(data.summary) : undefined,
				};
			});

			return stories.sort((a, b) => {
				const dateA = new Date(`${a.date}T${a.time || '00:00'}:00Z`);
				const dateB = new Date(`${b.date}T${b.time || '00:00'}:00Z`);
				return dateB.getTime() - dateA.getTime();
			});
		});
	}

	async getStoryBySlug(slug: string): Promise<Story | null> {
		const filePath = path.join(storiesDirectory, `${slug}.md`);

		if (!fs.existsSync(filePath)) {
			return null;
		}

		const fileContents = fs.readFileSync(filePath, 'utf8');
		const { data, content } = matter(fileContents);

		return {
			slug,
			title: data.title || slug,
			date: parseDate(data.date),
			time: parseTime(data.time),
			author: data.author || 'Blaine',
			summary: data.summary ? String(data.summary) : undefined,
			content,
		};
	}

	async createStory(data: CreateStoryData): Promise<string> {
		if (!fs.existsSync(storiesDirectory)) {
			fs.mkdirSync(storiesDirectory, { recursive: true });
		}

		const slug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const timeLine = data.time ? `time: ${data.time}\n` : '';
		const summaryLine = data.summary ? `summary: ${data.summary}\n` : '';

		const frontmatter = `---
title: ${data.title}
date: ${data.date}
${timeLine}author: ${data.author || 'Blaine'}
${summaryLine}---

${data.content}`;

		const filePath = path.join(storiesDirectory, `${slug}.md`);
		fs.writeFileSync(filePath, frontmatter);

		// Invalidate stories cache
		deleteCache(CACHE_KEYS.STORIES_ALL);

		return slug;
	}

	// --- Search ---

	async searchPosts(query: string): Promise<SearchResult[]> {
		if (!query.trim()) return [];

		let regex: RegExp;
		try {
			regex = new RegExp(query, 'i');
		} catch {
			regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
		}

		const allPosts = await this.getAllPosts();
		const results: SearchResult[] = [];

		for (const post of allPosts) {
			if (regex.test(post.title)) {
				results.push({ ...post, matchContext: `Title: ${post.title}` });
				continue;
			}

			const fullPost = await this.getPostBySlug(post.slug);
			if (fullPost && regex.test(fullPost.content)) {
				const match = fullPost.content.match(regex);
				if (match && match.index !== undefined) {
					const start = Math.max(0, match.index - 50);
					const end = Math.min(fullPost.content.length, match.index + match[0].length + 50);
					let context = fullPost.content.substring(start, end);
					if (start > 0) context = '...' + context;
					if (end < fullPost.content.length) context = context + '...';
					results.push({ ...post, matchContext: context });
				} else {
					results.push({ ...post });
				}
			}
		}

		return results;
	}
}
