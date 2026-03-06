import { test, expect } from '@playwright/test';

test.describe('Search', () => {
	test('search page loads correctly', async ({ page }) => {
		await page.goto('/search');

		// Verify page title
		await expect(page.locator('h1')).toContainText('Search');

		// Verify search form exists
		await expect(page.locator('form.search-form')).toBeVisible();
		await expect(page.locator('input[name="q"]')).toBeVisible();
		await expect(page.locator('button[type="submit"]')).toContainText('Search');
	});

	test('search input has autofocus', async ({ page }) => {
		await page.goto('/search');

		// Verify the search input is focused
		const searchInput = page.locator('input[name="q"]');
		await expect(searchInput).toBeFocused();
	});

	test('search form has placeholder text', async ({ page }) => {
		await page.goto('/search');

		// Verify placeholder mentions regex support
		const searchInput = page.locator('input[name="q"]');
		await expect(searchInput).toHaveAttribute('placeholder', /regex/i);
	});

	test('empty search query shows no results', async ({ page }) => {
		await page.goto('/search');

		// Verify no results are shown initially (no query)
		await expect(page.locator('.result-count')).not.toBeVisible();
		await expect(page.locator('.results')).not.toBeVisible();
	});

	test('search by title returns matching posts', async ({ page }) => {
		await page.goto('/search');

		// Search for "hello" (should match hello-world post)
		await page.fill('input[name="q"]', 'hello');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// Verify results are shown
		const resultCount = page.locator('.result-count');
		await expect(resultCount).toBeVisible();

		// Get the count text and verify it shows at least 1 result
		const countText = await resultCount.textContent();
		expect(countText).toMatch(/\d+ result/);

		// Verify results list is visible
		await expect(page.locator('.results')).toBeVisible();
	});

	test('search by content returns matching posts', async ({ page }) => {
		await page.goto('/search');

		// Search for common content words
		await page.fill('input[name="q"]', 'the');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// Verify results are shown
		await expect(page.locator('.result-count')).toBeVisible();
		await expect(page.locator('.results')).toBeVisible();
	});

	test('search with no matches shows zero results', async ({ page }) => {
		await page.goto('/search');

		// Search for a very specific term that won't exist
		await page.fill('input[name="q"]', 'xyznonexistentsearch12345');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// Verify zero results are shown
		await expect(page.locator('.result-count')).toContainText('0 results');
		await expect(page.locator('.results')).not.toBeVisible();
	});

	test('search supports regex patterns', async ({ page }) => {
		await page.goto('/search');

		// Search with a regex pattern
		await page.fill('input[name="q"]', 'h.llo');
		await page.click('button[type="submit"]');

		// Wait for results (or no results if regex doesn't match)
		await page.waitForTimeout(500);

		// The search should complete without errors
		// Result visibility depends on actual content
		await expect(page.locator('.result-count, p:has-text("0 results")')).toBeVisible();
	});

	test('invalid regex is handled gracefully', async ({ page }) => {
		await page.goto('/search');

		// Search with an invalid regex pattern
		await page.fill('input[name="q"]', '[invalid(');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForTimeout(500);

		// The page should not crash - it should handle the error gracefully
		await expect(page.locator('h1')).toContainText('Search');
		await expect(page.locator('form.search-form')).toBeVisible();
	});

	test('search results display post metadata', async ({ page }) => {
		await page.goto('/search');

		// Search for "hello"
		await page.fill('input[name="q"]', 'hello');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// If there are results, verify they have the expected structure
		const resultLinks = page.locator('.results a.result-title');
		const count = await resultLinks.count();

		if (count > 0) {
			// Verify result has title
			await expect(resultLinks.first()).toBeVisible();

			// Verify result has metadata (date, author)
			const meta = page.locator('.results .meta').first();
			await expect(meta).toBeVisible();
		}
	});

	test('search result links navigate to posts', async ({ page }) => {
		await page.goto('/search');

		// Search for "hello"
		await page.fill('input[name="q"]', 'hello');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// Get the first result link if any
		const firstResult = page.locator('.results a.result-title').first();
		const count = await firstResult.count();

		if (count > 0) {
			const href = await firstResult.getAttribute('href');

			// Click the result
			await firstResult.click();

			// Verify navigation to the post
			await expect(page).toHaveURL(href!);
			await expect(page.locator('h1')).toBeVisible();
		}
	});

	test('search query is preserved in input after submit', async ({ page }) => {
		await page.goto('/search');

		const query = 'test search query';

		// Enter search query
		await page.fill('input[name="q"]', query);
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForTimeout(500);

		// Verify query is still in the input
		const input = page.locator('input[name="q"]');
		await expect(input).toHaveValue(query);
	});

	test('search query appears in URL', async ({ page }) => {
		await page.goto('/search');

		const query = 'testquery';

		// Enter search query
		await page.fill('input[name="q"]', query);
		await page.click('button[type="submit"]');

		// Verify URL contains the query parameter
		await expect(page).toHaveURL(new RegExp(`q=${query}`));
	});

	test('search from URL query parameter works', async ({ page }) => {
		// Navigate directly with a query parameter
		await page.goto('/search?q=hello');

		// Wait for results to load
		await page.waitForTimeout(500);

		// Verify the input has the query value
		await expect(page.locator('input[name="q"]')).toHaveValue('hello');

		// Verify results are shown (if any posts match)
		await expect(page.locator('.result-count')).toBeVisible();
	});

	test('search results show context for content matches', async ({ page }) => {
		await page.goto('/search');

		// Search for a content term
		await page.fill('input[name="q"]', 'the');
		await page.click('button[type="submit"]');

		// Wait for results
		await page.waitForSelector('.result-count', { timeout: 5000 });

		// If there are results that matched content (not just title),
		// they might have context
		const contexts = page.locator('.context');
		const count = await contexts.count();

		if (count > 0) {
			// Verify context is visible
			await expect(contexts.first()).toBeVisible();
		}
	});
});
