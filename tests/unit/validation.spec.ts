import { describe, it, expect } from 'vitest';
import { postSchema, validatePost } from '../../src/lib/validation/post.js';
import { categorySchema, categoryIdSchema, validateCategory, validateCategoryId } from '../../src/lib/validation/category.js';
import { storySchema, validateStory } from '../../src/lib/validation/story.js';

describe('Validation', () => {
	describe('Post Validation', () => {
		describe('postSchema', () => {
			it('validates a valid post', () => {
				const validPost = {
					title: 'Test Post',
					date: '2026-01-15',
					time: '14:30',
					content: 'This is valid content',
					author: 'Test Author',
					categories: ['test', 'example'],
				};

				const result = postSchema.safeParse(validPost);
				expect(result.success).toBe(true);
			});

			it('rejects empty title', () => {
				const invalidPost = {
					title: '',
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.path[0] === 'title')).toBe(true);
				}
			});

			it('rejects title too long', () => {
				const invalidPost = {
					title: 'a'.repeat(201),
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.message.includes('200'))).toBe(true);
				}
			});

			it('rejects invalid date format', () => {
				const invalidPost = {
					title: 'Valid Title',
					date: '01-15-2026',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.path[0] === 'date')).toBe(true);
				}
			});

			it('rejects invalid time format', () => {
				const invalidPost = {
					title: 'Valid Title',
					date: '2026-01-15',
					time: '2:30 PM',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.path[0] === 'time')).toBe(true);
				}
			});

			it('accepts empty time', () => {
				const validPost = {
					title: 'Valid Title',
					date: '2026-01-15',
					time: '',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(validPost);
				expect(result.success).toBe(true);
			});

			it('rejects empty content', () => {
				const invalidPost = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: '',
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.path[0] === 'content')).toBe(true);
				}
			});

			it('rejects content too long', () => {
				const invalidPost = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'a'.repeat(50001),
				};

				const result = postSchema.safeParse(invalidPost);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.message.includes('50,000'))).toBe(true);
				}
			});

			it('uses default author when not provided', () => {
				const postWithoutAuthor = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(postWithoutAuthor);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.author).toBe('Blaine');
				}
			});

			it('uses default empty categories when not provided', () => {
				const postWithoutCategories = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = postSchema.safeParse(postWithoutCategories);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.categories).toEqual([]);
				}
			});
		});

		describe('validatePost', () => {
			it('returns success for valid form data', () => {
				const formData = new FormData();
				formData.append('title', 'Valid Title');
				formData.append('date', '2026-01-15');
				formData.append('content', 'Valid content');

				const result = validatePost(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.title).toBe('Valid Title');
				}
			});

			it('returns errors for invalid form data', () => {
				const formData = new FormData();
				formData.append('title', '');
				formData.append('date', 'invalid-date');
				formData.append('content', '');

				const result = validatePost(formData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(Object.keys(result.errors)).toContain('title');
					expect(Object.keys(result.errors)).toContain('date');
					expect(Object.keys(result.errors)).toContain('content');
				}
			});

			it('handles multiple categories', () => {
				const formData = new FormData();
				formData.append('title', 'Valid Title');
				formData.append('date', '2026-01-15');
				formData.append('content', 'Valid content');
				formData.append('categories', 'cat1');
				formData.append('categories', 'cat2');

				const result = validatePost(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.categories).toEqual(['cat1', 'cat2']);
				}
			});
		});
	});

	describe('Category Validation', () => {
		describe('categorySchema', () => {
			it('validates a valid category', () => {
				const validCategory = { name: 'Valid Category' };
				const result = categorySchema.safeParse(validCategory);
				expect(result.success).toBe(true);
			});

			it('rejects empty name', () => {
				const invalidCategory = { name: '' };
				const result = categorySchema.safeParse(invalidCategory);
				expect(result.success).toBe(false);
			});

			it('rejects name too long', () => {
				const invalidCategory = { name: 'a'.repeat(101) };
				const result = categorySchema.safeParse(invalidCategory);
				expect(result.success).toBe(false);
			});

			it('trims whitespace from name', () => {
				const categoryWithWhitespace = { name: '  Category Name  ' };
				const result = categorySchema.safeParse(categoryWithWhitespace);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.name).toBe('Category Name');
				}
			});
		});

		describe('categoryIdSchema', () => {
			it('validates a valid category id', () => {
				const validId = { id: 'valid-id' };
				const result = categoryIdSchema.safeParse(validId);
				expect(result.success).toBe(true);
			});

			it('rejects empty id', () => {
				const invalidId = { id: '' };
				const result = categoryIdSchema.safeParse(invalidId);
				expect(result.success).toBe(false);
			});
		});

		describe('validateCategory', () => {
			it('returns success for valid category name', () => {
				const formData = new FormData();
				formData.append('name', 'Valid Category');

				const result = validateCategory(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.name).toBe('Valid Category');
				}
			});

			it('returns errors for empty name', () => {
				const formData = new FormData();
				formData.append('name', '');

				const result = validateCategory(formData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(Object.keys(result.errors)).toContain('name');
				}
			});
		});

		describe('validateCategoryId', () => {
			it('returns success for valid category id', () => {
				const formData = new FormData();
				formData.append('id', 'category-id');

				const result = validateCategoryId(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.id).toBe('category-id');
				}
			});

			it('returns errors for empty id', () => {
				const formData = new FormData();
				formData.append('id', '');

				const result = validateCategoryId(formData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(Object.keys(result.errors)).toContain('id');
				}
			});
		});
	});

	describe('Story Validation', () => {
		describe('storySchema', () => {
			it('validates a valid story', () => {
				const validStory = {
					title: 'Test Story',
					date: '2026-01-15',
					time: '14:30',
					content: 'This is valid story content',
					author: 'Test Author',
					summary: 'A brief summary',
				};

				const result = storySchema.safeParse(validStory);
				expect(result.success).toBe(true);
			});

			it('rejects empty title', () => {
				const invalidStory = {
					title: '',
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
			});

			it('rejects title too long', () => {
				const invalidStory = {
					title: 'a'.repeat(201),
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
			});

			it('rejects invalid date format', () => {
				const invalidStory = {
					title: 'Valid Title',
					date: '15-01-2026',
					content: 'Valid content',
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
			});

			it('accepts empty time', () => {
				const validStory = {
					title: 'Valid Title',
					date: '2026-01-15',
					time: '',
					content: 'Valid content',
				};

				const result = storySchema.safeParse(validStory);
				expect(result.success).toBe(true);
			});

			it('rejects empty content', () => {
				const invalidStory = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: '',
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
			});

			it('rejects content too long', () => {
				const invalidStory = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'a'.repeat(50001),
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
			});

			it('rejects summary too long', () => {
				const invalidStory = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'Valid content',
					summary: 'a'.repeat(1001),
				};

				const result = storySchema.safeParse(invalidStory);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(result.error.issues.some((i) => i.path[0] === 'summary')).toBe(true);
				}
			});

			it('accepts empty summary', () => {
				const validStory = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'Valid content',
					summary: '',
				};

				const result = storySchema.safeParse(validStory);
				expect(result.success).toBe(true);
			});

			it('uses default author when not provided', () => {
				const storyWithoutAuthor = {
					title: 'Valid Title',
					date: '2026-01-15',
					content: 'Valid content',
				};

				const result = storySchema.safeParse(storyWithoutAuthor);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.author).toBe('Blaine');
				}
			});
		});

		describe('validateStory', () => {
			it('returns success for valid form data', () => {
				const formData = new FormData();
				formData.append('title', 'Valid Title');
				formData.append('date', '2026-01-15');
				formData.append('content', 'Valid content');

				const result = validateStory(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.title).toBe('Valid Title');
				}
			});

			it('returns errors for invalid form data', () => {
				const formData = new FormData();
				formData.append('title', '');
				formData.append('date', 'invalid-date');
				formData.append('content', '');

				const result = validateStory(formData);
				expect(result.success).toBe(false);
				if (!result.success) {
					expect(Object.keys(result.errors)).toContain('title');
					expect(Object.keys(result.errors)).toContain('date');
					expect(Object.keys(result.errors)).toContain('content');
				}
			});

			it('handles summary field', () => {
				const formData = new FormData();
				formData.append('title', 'Valid Title');
				formData.append('date', '2026-01-15');
				formData.append('content', 'Valid content');
				formData.append('summary', 'A brief summary');

				const result = validateStory(formData);
				expect(result.success).toBe(true);
				if (result.success) {
					expect(result.data.summary).toBe('A brief summary');
				}
			});
		});
	});
});
