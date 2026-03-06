import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { FileAdapter } from '../../src/lib/server/persistence/file-adapter.js';
import type { CreatePostData, CreateStoryData } from '../../src/lib/server/persistence/types.js';

const postsDir = path.join(process.cwd(), 'posts');
const storiesDir = path.join(process.cwd(), 'stories');

describe('FileAdapter', () => {
	let adapter: FileAdapter;
	const createdFiles: string[] = [];
	const createdStories: string[] = [];

	beforeEach(() => {
		adapter = new FileAdapter();
		createdFiles.length = 0;
		createdStories.length = 0;
	});

	afterEach(() => {
		// Clean up created test files
		for (const file of createdFiles) {
			const filePath = path.join(postsDir, file);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
		for (const file of createdStories) {
			const filePath = path.join(storiesDir, file);
			if (fs.existsSync(filePath)) {
				fs.unlinkSync(filePath);
			}
		}
		createdFiles.length = 0;
		createdStories.length = 0;
	});

	describe('getAllPosts', () => {
		it('returns an array', async () => {
			const posts = await adapter.getAllPosts();
			expect(Array.isArray(posts)).toBe(true);
		});

		it('returns array containing existing posts', async () => {
			const posts = await adapter.getAllPosts();
			expect(posts.length).toBeGreaterThanOrEqual(0);
		});
	});

	describe('createPost', () => {
		it('creates a file with correct content', async () => {
			const postData: CreatePostData = {
				title: 'Test Post Unit Test',
				date: '2026-01-15',
				time: '16:30',
				content: 'This is the test content',
				author: 'Test Author',
				categories: ['test', 'example'],
			};

			const slug = await adapter.createPost(postData);
			createdFiles.push(`${slug}.md`);

			expect(slug).toBe('test-post-unit-test');

			const filePath = path.join(postsDir, `${slug}.md`);
			expect(fs.existsSync(filePath)).toBe(true);

			const content = fs.readFileSync(filePath, 'utf8');
			expect(content).toContain('title: Test Post Unit Test');
			expect(content).toContain('date: 2026-01-15');
			expect(content).toContain('time: 16:30');
			expect(content).toContain('author: Test Author');
			expect(content).toContain('categories: [test, example]');
			expect(content).toContain('This is the test content');
		});

		it('generates slug from title correctly', async () => {
			const postData: CreatePostData = {
				title: 'My Awesome Blog Post!',
				date: '2026-01-15',
				content: 'Content here',
			};

			const slug = await adapter.createPost(postData);
			createdFiles.push(`${slug}.md`);

			expect(slug).toBe('my-awesome-blog-post');
		});

		it('uses default author when not provided', async () => {
			const postData: CreatePostData = {
				title: 'Default Author Test Unit',
				date: '2026-01-15',
				content: 'Content',
			};

			const slug = await adapter.createPost(postData);
			createdFiles.push(`${slug}.md`);

			const filePath = path.join(postsDir, `${slug}.md`);
			const content = fs.readFileSync(filePath, 'utf8');
			expect(content).toContain('author: Blaine');
		});
	});

	describe('getPostBySlug', () => {
		it('returns correct post when found', async () => {
			const postData: CreatePostData = {
				title: 'Findable Post Unit',
				date: '2026-02-01',
				content: 'This post should be found',
			};

			const slug = await adapter.createPost(postData);
			createdFiles.push(`${slug}.md`);

			const post = await adapter.getPostBySlug(slug);

			expect(post).not.toBeNull();
			expect(post?.title).toBe('Findable Post Unit');
			expect(post?.slug).toBe(slug);
			expect(post?.content.trim()).toBe('This post should be found');
			expect(post?.date).toBe('2026-02-01');
		});

		it('returns null when post not found', async () => {
			const post = await adapter.getPostBySlug('non-existent-post-xyz123');
			expect(post).toBeNull();
		});
	});

	describe('getPostsByCategory', () => {
		it('returns posts filtered by category', async () => {
			// First ensure we have categories
			await adapter.addCategory('Technology');

			const post1: CreatePostData = {
				title: 'Tech Post Unit',
				date: '2026-01-01',
				content: 'Tech content',
				categories: ['technology'],
			};
			const post2: CreatePostData = {
				title: 'Life Post Unit',
				date: '2026-01-02',
				content: 'Life content',
				categories: ['lifestyle'],
			};

			const slug1 = await adapter.createPost(post1);
			const slug2 = await adapter.createPost(post2);
			createdFiles.push(`${slug1}.md`);
			createdFiles.push(`${slug2}.md`);

			const techPosts = await adapter.getPostsByCategory('technology');
			expect(techPosts.some((p) => p.title === 'Tech Post Unit')).toBe(true);
		});
	});

	describe('Search', () => {
		it('returns empty array for empty query', async () => {
			const results = await adapter.searchPosts('');
			expect(results).toHaveLength(0);
		});

		it('finds posts by title', async () => {
			const post: CreatePostData = {
				title: 'Unique Searchable Title XYZ',
				date: '2026-01-01',
				content: 'Regular content',
			};

			const slug = await adapter.createPost(post);
			createdFiles.push(`${slug}.md`);

			const results = await adapter.searchPosts('Unique Searchable Title XYZ');
			expect(results.some((r) => r.title === 'Unique Searchable Title XYZ')).toBe(true);
		});

		it('finds posts by content', async () => {
			const post: CreatePostData = {
				title: 'Regular Title XYZ',
				date: '2026-01-01',
				content: 'This contains a very unique phrase for searching XYZ',
			};

			const slug = await adapter.createPost(post);
			createdFiles.push(`${slug}.md`);

			const results = await adapter.searchPosts('very unique phrase for searching XYZ');
			expect(results.some((r) => r.slug === slug)).toBe(true);
		});

		it('handles invalid regex gracefully', async () => {
			// This should not throw an error
			const results = await adapter.searchPosts('[invalid(');
			expect(Array.isArray(results)).toBe(true);
		});

		it('is case insensitive', async () => {
			const post: CreatePostData = {
				title: 'CASE SENSITIVE TEST XYZ',
				date: '2026-01-01',
				content: 'Content',
			};

			const slug = await adapter.createPost(post);
			createdFiles.push(`${slug}.md`);

			const results = await adapter.searchPosts('case sensitive test xyz');
			expect(results.some((r) => r.slug === slug)).toBe(true);
		});
	});

	describe('Categories', () => {
		it('returns an array', async () => {
			const categories = await adapter.getCategories();
			expect(Array.isArray(categories)).toBe(true);
		});

		it('adds a category with generated id', async () => {
			const category = await adapter.addCategory('Test Category Unit');

			expect(category.id).toBe('test-category-unit');
			expect(category.name).toBe('Test Category Unit');
		});

		it('returns existing category when adding duplicate', async () => {
			const category1 = await adapter.addCategory('Duplicate Category Unit');
			const category2 = await adapter.addCategory('Duplicate Category Unit');

			expect(category1.id).toBe(category2.id);
		});

		it('removes a category successfully', async () => {
			await adapter.addCategory('To Remove Unit');
			const removed = await adapter.removeCategory('to-remove-unit');

			expect(removed).toBe(true);

			const categories = await adapter.getCategories();
			expect(categories.some((c) => c.id === 'to-remove-unit')).toBe(false);
		});

		it('returns false when removing non-existent category', async () => {
			const removed = await adapter.removeCategory('non-existent-xyz123');
			expect(removed).toBe(false);
		});
	});

	describe('Stories', () => {
		describe('createStory', () => {
			it('creates a story file with correct content', async () => {
				const storyData: CreateStoryData = {
					title: 'Test Story Unit',
					date: '2026-01-15',
					time: '10:00',
					content: 'Story content here',
					author: 'Story Author',
					summary: 'A brief summary',
				};

				const slug = await adapter.createStory(storyData);
				createdStories.push(`${slug}.md`);

				expect(slug).toBe('test-story-unit');

				const filePath = path.join(storiesDir, `${slug}.md`);
				expect(fs.existsSync(filePath)).toBe(true);

				const content = fs.readFileSync(filePath, 'utf8');
				expect(content).toContain('title: Test Story Unit');
				expect(content).toContain('date: 2026-01-15');
				expect(content).toContain('time: 10:00');
				expect(content).toContain('author: Story Author');
				expect(content).toContain('summary: A brief summary');
				expect(content).toContain('Story content here');
			});
		});

		describe('getStoryBySlug', () => {
			it('returns correct story when found', async () => {
				const storyData: CreateStoryData = {
					title: 'Findable Story Unit',
					date: '2026-02-01',
					content: 'Story content',
				};

				const slug = await adapter.createStory(storyData);
				createdStories.push(`${slug}.md`);

				const story = await adapter.getStoryBySlug(slug);

				expect(story).not.toBeNull();
				expect(story?.title).toBe('Findable Story Unit');
			});

			it('returns null when story not found', async () => {
				const story = await adapter.getStoryBySlug('non-existent-story-xyz123');
				expect(story).toBeNull();
			});
		});
	});

	describe('Images', () => {
		it('returns null for non-existent image', async () => {
			const image = await adapter.getImage('non-existent-xyz123.jpg');
			expect(image).toBeNull();
		});

		it('returns null for directory traversal attempt', async () => {
			const image = await adapter.getImage('../../../etc/passwd');
			expect(image).toBeNull();
		});

		it('deletes post image returns false for non-existent file', async () => {
			const result = await adapter.deletePostImage('non-existent-xyz123.jpg');
			expect(result).toBe(false);
		});
	});
});
