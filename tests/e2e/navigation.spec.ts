import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
	test('homepage loads with correct title', async ({ page }) => {
		await page.goto('/');

		// Verify the site title is displayed
		await expect(page.locator('h1')).toContainText('Posts');
		await expect(page.locator('.site-title')).toContainText('Contours');
	});

	test('homepage displays posts list', async ({ page }) => {
		await page.goto('/');

		// Verify posts section exists
		const postsSection = page.locator('section');
		await expect(postsSection).toBeVisible();

		// Verify at least one post link exists (or 'No posts yet' message)
		const hasPosts = await page.locator('a.post-title').count();
		if (hasPosts === 0) {
			await expect(page.locator('text=No posts yet.')).toBeVisible();
		}
	});

	test('navigation links in header work', async ({ page }) => {
		await page.goto('/');

		// Click on Stories link
		await page.click('text=Stories');
		await expect(page).toHaveURL(/.*stories/);
		await expect(page.locator('h1')).toContainText('Stories');

		// Navigate back and click Search
		await page.goto('/');
		await page.click('text=Search');
		await expect(page).toHaveURL(/.*search/);
		await expect(page.locator('h1')).toContainText('Search');

		// Navigate back and click About
		await page.goto('/');
		await page.click('text=About');
		await expect(page).toHaveURL(/.*about/);
		await expect(page.locator('h1')).toContainText('About');
	});

	test('site title links to homepage', async ({ page }) => {
		// Start on search page
		await page.goto('/search');
		await expect(page.locator('h1')).toContainText('Search');

		// Click site title to go home
		await page.click('.site-title');
		await expect(page).toHaveURL('/');
		await expect(page.locator('h1')).toContainText('Posts');
	});

	test('theme toggle switches between light and dark', async ({ page }) => {
		await page.goto('/');

		// Find the theme toggle button
		const themeToggle = page.locator('button[aria-label="Toggle theme"]');
		await expect(themeToggle).toBeVisible();

		// Get initial theme
		const initialTheme = await page.evaluate(() => {
			return localStorage.getItem('theme');
		});

		// Click the toggle
		await themeToggle.click();

		// Wait a bit for the theme to change
		await page.waitForTimeout(100);

		// Verify theme has changed in localStorage
		const newTheme = await page.evaluate(() => {
			return localStorage.getItem('theme');
		});
		expect(newTheme).not.toBe(initialTheme);

		// Verify data-theme attribute is set on document
		const dataTheme = await page.evaluate(() => {
			return document.documentElement.getAttribute('data-theme');
		});
		expect(dataTheme).toBe(newTheme);

		// Toggle back
		await themeToggle.click();
		await page.waitForTimeout(100);

		// Verify it toggled back
		const finalTheme = await page.evaluate(() => {
			return localStorage.getItem('theme');
		});
		expect(finalTheme).toBe(initialTheme);
	});

	test('theme persists after page reload', async ({ page }) => {
		await page.goto('/');

		// Set theme to dark
		await page.evaluate(() => {
			localStorage.setItem('theme', 'dark');
		});

		// Reload the page
		await page.reload();

		// Verify theme is still dark
		const theme = await page.evaluate(() => {
			return localStorage.getItem('theme');
		});
		expect(theme).toBe('dark');

		// Verify data-theme attribute
		const dataTheme = await page.evaluate(() => {
			return document.documentElement.getAttribute('data-theme');
		});
		expect(dataTheme).toBe('dark');
	});

	test('footer is displayed with copyright', async ({ page }) => {
		await page.goto('/');

		// Verify footer exists and contains current year
		const footer = page.locator('footer');
		await expect(footer).toBeVisible();

		const currentYear = new Date().getFullYear().toString();
		await expect(footer).toContainText(currentYear);
		await expect(footer).toContainText('Contours');
	});

	test('post links navigate to individual post pages', async ({ page }) => {
		await page.goto('/');

		// Find the first post link if any exist
		const firstPostLink = page.locator('a.post-title').first();
		const postCount = await page.locator('a.post-title').count();

		if (postCount > 0) {
			// Get the href of the first post
			const href = await firstPostLink.getAttribute('href');

			// Click on the post
			await firstPostLink.click();

			// Verify we're on the post page
			await expect(page).toHaveURL(href!);

			// Verify the page has content
			const heading = page.locator('h1');
			await expect(heading).toBeVisible();
		}
	});

	test('category links filter posts by category', async ({ page }) => {
		await page.goto('/');

		// Find the first category tag if any exist
		const firstCategory = page.locator('a.category-tag').first();
		const categoryCount = await page.locator('a.category-tag').count();

		if (categoryCount > 0) {
			// Get the href of the first category
			const href = await firstCategory.getAttribute('href');

			// Click on the category
			await firstCategory.click();

			// Verify we're on the category page
			await expect(page).toHaveURL(href!);

			// Verify the page shows filtered results
			await expect(page.locator('h1')).toBeVisible();
		}
	});
});
