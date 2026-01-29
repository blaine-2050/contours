import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Post Publication', () => {
	test('publish hello world post to local server', async ({ page }) => {
		// Navigate to admin create page
		await page.goto('/admin/create');

		// Verify we're on the create page
		await expect(page.locator('h1')).toContainText('Create New Post');

		// Fill the form
		await page.fill('[name="title"]', 'Hello World Test');
		await page.fill('[name="date"]', '2026-01-08');
		await page.fill('[name="content"]', '# Hello World\n\nThis is a test post created by the E2E test.');

		// Submit the form
		await page.click('button[type="submit"]');

		// Wait for navigation to the new post
		await page.waitForURL(/\/posts\/hello-world-test/);

		// Verify the post content is displayed
		await expect(page.locator('h1')).toContainText('Hello World Test');

		// Verify the markdown file was created
		const postPath = path.join(process.cwd(), 'posts', 'hello-world-test.md');
		expect(fs.existsSync(postPath)).toBe(true);

		// Read and verify the content
		const content = fs.readFileSync(postPath, 'utf8');
		expect(content).toContain('title: Hello World Test');
		expect(content).toContain('date: 2026-01-08');
		expect(content).toContain('author: Blaine');

		// Clean up the test post
		fs.unlinkSync(postPath);
	});

	test('post appears in home page listing', async ({ page }) => {
		// Navigate to home page
		await page.goto('/');

		// Verify the existing hello-world post is listed
		await expect(page.locator('a[href="/posts/hello-world"]')).toBeVisible();

		// Verify the title is shown
		await expect(page.locator('text=Hello World')).toBeVisible();
	});

	test('can navigate from home to post and back', async ({ page }) => {
		// Start at home
		await page.goto('/');

		// Click on the hello-world post
		await page.click('a[href="/posts/hello-world"]');

		// Verify we're on the post page
		await expect(page.locator('h1')).toContainText('Hello World');

		// Navigate back to home
		await page.click('text=Back to all posts');

		// Verify we're back on home
		await expect(page.locator('h1')).toContainText('Contours');
	});
});
