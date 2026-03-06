import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Admin Create Post', () => {
	test('navigate to admin create page', async ({ page }) => {
		await page.goto('/admin/create');

		// Verify we're on the create page
		await expect(page.locator('h1')).toContainText('Create New Post');

		// Verify form elements exist
		await expect(page.locator('[name="title"]')).toBeVisible();
		await expect(page.locator('[name="date"]')).toBeVisible();
		await expect(page.locator('[name="content"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toBeVisible();
	});

	test('create post flow - fill form and submit', async ({ page }) => {
		const testTitle = 'E2E Test Post ' + Date.now();
		const testSlug = testTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Navigate to admin create page
		await page.goto('/admin/create');

		// Fill the form
		await page.fill('[name="title"]', testTitle);
		await page.fill('[name="date"]', '2026-01-08');
		await page.fill('[name="time"]', '14:30');
		await page.fill('[name="content"]', '# Test Content\n\nThis is a test post created by E2E test.');

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for navigation to the new post
		await page.waitForURL(/\/posts\/.+/);

		// Verify the post content is displayed
		await expect(page.locator('h1')).toContainText(testTitle);

		// Verify the markdown file was created
		const postPath = path.join(process.cwd(), 'posts', `${testSlug}.md`);
		expect(fs.existsSync(postPath)).toBe(true);

		// Clean up the test post
		fs.unlinkSync(postPath);
	});

	test('create post with categories', async ({ page }) => {
		const testTitle = 'E2E Category Test ' + Date.now();
		const testSlug = testTitle
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Navigate to admin create page
		await page.goto('/admin/create');

		// Fill the form
		await page.fill('[name="title"]', testTitle);
		await page.fill('[name="date"]', '2026-01-08');
		await page.fill('[name="content"]', 'Post with categories');

		// Select categories if available
		const categoryCheckboxes = page.locator('input[type="checkbox"][name="categories"]');
		const count = await categoryCheckboxes.count();
		if (count > 0) {
			await categoryCheckboxes.first().check();
		}

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for navigation
		await page.waitForURL(/\/posts\/.+/);

		// Verify we're on the post page
		await expect(page.locator('h1')).toContainText(testTitle);

		// Clean up
		const postPath = path.join(process.cwd(), 'posts', `${testSlug}.md`);
		if (fs.existsSync(postPath)) {
			fs.unlinkSync(postPath);
		}
	});

	test('form validation - required fields', async ({ page }) => {
		await page.goto('/admin/create');

		// Try to submit empty form
		await page.click('button[type="submit"]');

		// Should still be on create page (validation error)
		await expect(page.locator('h1')).toContainText('Create New Post');
	});

	test('back link navigation', async ({ page }) => {
		await page.goto('/admin/create');

		// Click back to home
		await page.click('text=Back to home');

		// Verify we're on the home page
		await expect(page.locator('h1')).toContainText('Contours');
	});
});

test.describe('Admin Categories', () => {
	test('navigate to categories page', async ({ page }) => {
		await page.goto('/admin/categories');

		// Verify we're on the categories page
		await expect(page.locator('h1')).toContainText('Manage Categories');

		// Verify form exists
		await expect(page.locator('[name="name"]')).toBeVisible();
	});
});

test.describe('Admin Stories', () => {
	test('navigate to stories page', async ({ page }) => {
		await page.goto('/admin/stories');

		// Verify we're on the stories page
		await expect(page.locator('h1')).toContainText('Stories');
	});
});
