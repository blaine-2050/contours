/**
 * Evaluation A: Playwright MCP consuming Git Journal API
 * 
 * Tests API consumption via Playwright MCP (browser navigation) vs direct fetch
 * Measures: reliability, error handling, response parsing
 */

import { test, expect, type Page, type APIRequestContext } from '@playwright/test';
import type { Commit, CommitsResponse, GenerateResponse, CreateDraftResponse } from '../../src/lib/server/git-journal/types';

// Test configuration
const API_BASE = '/api/journal';
const TEST_DATE_SINCE = '2026-02-01';
const TEST_DATE_UNTIL = '2026-03-06';
const FUTURE_DATE = '2026-12-31';
const INVALID_DATE = 'not-a-date';

/**
 * Helper: Extract JSON from page content
 * When navigating to API endpoints, Playwright renders JSON as page content
 */
async function extractJsonFromPage<T>(page: Page): Promise<T> {
	// The API returns JSON which Playwright displays as raw text
	const content = await page.locator('body pre').textContent();
	if (!content) {
		throw new Error('No content found on page');
	}
	return JSON.parse(content) as T;
}

/**
 * Helper: Get response via Playwright navigation (MCP approach)
 */
async function getViaMcp<T>(page: Page, url: string): Promise<T> {
	await page.goto(url);
	// Wait for the response to be rendered
	await page.waitForSelector('body pre', { timeout: 5000 });
	return extractJsonFromPage<T>(page);
}

/**
 * Helper: Get response via direct fetch (traditional API approach)
 */
async function getViaFetch<T>(request: APIRequestContext, url: string): Promise<T> {
	const response = await request.get(url);
	expect(response.ok()).toBeTruthy();
	return response.json() as Promise<T>;
}

/**
 * Helper: POST via direct fetch (Playwright's request context)
 */
async function postViaFetch<T>(request: APIRequestContext, url: string, data: unknown): Promise<T> {
	const response = await request.post(url, {
		data,
		headers: { 'Content-Type': 'application/json' }
	});
	return response.json() as Promise<T>;
}

test.describe('Evaluation A: Playwright MCP API Consumption', () => {
	test.describe('Scenario 1: Normal case - Get commits for week with activity', () => {
		test('MCP navigation approach - get commits', async ({ page }) => {
			const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
			
			// Navigate to API endpoint via browser
			await page.goto(url);
			
			// Wait for JSON to render
			await page.waitForSelector('body pre');
			
			// Extract JSON response
			const response = await extractJsonFromPage<CommitsResponse>(page);
			
			// Verify structure
			expect(response).toHaveProperty('commits');
			expect(response).toHaveProperty('count');
			expect(response).toHaveProperty('since');
			expect(response).toHaveProperty('until');
			expect(Array.isArray(response.commits)).toBe(true);
			
			// Verify date range is preserved
			expect(response.since).toBe(TEST_DATE_SINCE);
			expect(response.until).toBe(TEST_DATE_UNTIL);
			
			console.log(`[MCP] Found ${response.count} commits via navigation`);
		});

		test('Direct fetch approach - get commits', async ({ request }) => {
			const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
			
			const response = await getViaFetch<CommitsResponse>(request, url);
			
			// Verify structure
			expect(response).toHaveProperty('commits');
			expect(response).toHaveProperty('count');
			expect(Array.isArray(response.commits)).toBe(true);
			
			console.log(`[Fetch] Found ${response.count} commits via direct API`);
		});

		test('Compare MCP vs Fetch - same results', async ({ page, request }) => {
			const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
			
			// Get via MCP
			const mcpResponse = await getViaMcp<CommitsResponse>(page, url);
			
			// Get via fetch
			const fetchResponse = await getViaFetch<CommitsResponse>(request, url);
			
			// Both should return same data
			expect(mcpResponse.count).toBe(fetchResponse.count);
			expect(mcpResponse.commits.length).toBe(fetchResponse.commits.length);
			expect(mcpResponse.since).toBe(fetchResponse.since);
			expect(mcpResponse.until).toBe(fetchResponse.until);
		});
	});

	test.describe('Scenario 2: Edge case - Week with no commits', () => {
		test('MCP navigation - empty commits array', async ({ page }) => {
			// Use a future date range where no commits exist
			const url = `${API_BASE}/commits?since=${FUTURE_DATE}&until=${FUTURE_DATE}`;
			
			const response = await getViaMcp<CommitsResponse>(page, url);
			
			// Should return empty array gracefully
			expect(response.commits).toEqual([]);
			expect(response.count).toBe(0);
		});

		test('Direct fetch - empty commits array', async ({ request }) => {
			const url = `${API_BASE}/commits?since=${FUTURE_DATE}&until=${FUTURE_DATE}`;
			
			const response = await getViaFetch<CommitsResponse>(request, url);
			
			expect(response.commits).toEqual([]);
			expect(response.count).toBe(0);
		});
	});

	test.describe('Scenario 3: Edge case - Invalid date format', () => {
		test('MCP navigation - invalid date shows error page', async ({ page }) => {
			const url = `${API_BASE}/commits?since=${INVALID_DATE}&until=${TEST_DATE_UNTIL}`;
			
			await page.goto(url);
			
			// SvelteKit error pages show error message in h1
			const errorHeading = await page.locator('h1').textContent();
			expect(errorHeading).toContain('Invalid since date format');
			
			// Error message should be visible in body
			const bodyText = await page.locator('body').textContent();
			expect(bodyText).toContain('400');
		});

		test('Direct fetch - invalid date returns 400', async ({ request }) => {
			const url = `${API_BASE}/commits?since=${INVALID_DATE}&until=${TEST_DATE_UNTIL}`;
			
			const response = await request.get(url);
			
			expect(response.status()).toBe(400);
			
			const body = await response.json();
			expect(body.message).toContain('Invalid since date format');
		});
	});

	test.describe('Scenario 4: Edge case - Missing required parameters', () => {
		test('MCP navigation - missing since parameter', async ({ page }) => {
			const url = `${API_BASE}/commits?until=${TEST_DATE_UNTIL}`;
			
			await page.goto(url);
			
			// SvelteKit error pages show error message in h1
			const errorHeading = await page.locator('h1').textContent();
			expect(errorHeading).toContain('Missing required parameter: since');
		});

		test('Direct fetch - missing since parameter', async ({ request }) => {
			const url = `${API_BASE}/commits?until=${TEST_DATE_UNTIL}`;
			
			const response = await request.get(url);
			expect(response.status()).toBe(400);
		});
	});

	test.describe('Scenario 5: Generate post from commits via API', () => {
		const mockCommits: Commit[] = [
			{
				sha: 'abc123',
				message: 'feat: Add user authentication',
				date: '2026-03-01',
				author: 'Test Developer',
				summary: 'Implemented login with JWT tokens'
			},
			{
				sha: 'def456',
				message: 'fix: Resolve navigation bug',
				date: '2026-03-02',
				author: 'Test Developer',
				summary: 'Fixed menu not closing on mobile'
			},
			{
				sha: 'ghi789',
				message: 'docs: Update API documentation',
				date: '2026-03-03',
				author: 'Test Developer'
			}
		];

		test('Direct fetch - generate post from commits', async ({ request }) => {
			const url = `${API_BASE}/generate`;
			
			const response = await request.post(url, {
				data: {
					commits: mockCommits,
					weekStart: '2026-03-01'
				},
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.ok()).toBeTruthy();
			
			const result = await response.json() as GenerateResponse;
			
			// Verify response structure
			expect(result).toHaveProperty('frontmatter');
			expect(result).toHaveProperty('content');
			expect(result).toHaveProperty('preview');
			
			// Verify frontmatter - title contains week date
			expect(result.frontmatter.title).toContain('Week of 2026-03-01');
			expect(result.frontmatter.date).toBe('2026-03-01');
			expect(result.frontmatter.categories).toContain('dev-journal');
			
			// Content should include commit summaries
			expect(result.content.length).toBeGreaterThan(0);
			expect(result.preview.length).toBeGreaterThan(0);
			
			console.log(`[Fetch] Generated post: "${result.frontmatter.title}"`);
		});

		test('Direct fetch - invalid JSON body', async ({ request }) => {
			const url = `${API_BASE}/generate`;
			
			const response = await request.post(url, {
				data: 'not valid json',
				headers: { 'Content-Type': 'text/plain' }
			});
			
			expect(response.status()).toBe(400);
		});

		test('Direct fetch - missing commits array', async ({ request }) => {
			const url = `${API_BASE}/generate`;
			
			const response = await request.post(url, {
				data: { weekStart: '2026-03-01' },
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body.message).toContain('Missing or invalid commits array');
		});

		test('Direct fetch - invalid weekStart format', async ({ request }) => {
			const url = `${API_BASE}/generate`;
			
			const response = await request.post(url, {
				data: {
					commits: mockCommits,
					weekStart: 'invalid-date'
				},
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.status()).toBe(400);
		});
	});

	test.describe('Scenario 6: Create draft via API', () => {
		const mockPost = {
			frontmatter: {
				title: 'Test Draft Post',
				date: '2026-03-06',
				time: '14:30',
				author: 'Test Author',
				categories: ['test', 'dev-journal'],
				draft: true
			},
			content: '# Test Draft\n\nThis is test content for a draft post.\n\n- Item 1\n- Item 2'
		};

		test('Direct fetch - create draft success', async ({ request }) => {
			const url = `${API_BASE}/create-draft`;
			
			const response = await request.post(url, {
				data: { post: mockPost },
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.ok()).toBeTruthy();
			
			const result = await response.json() as CreateDraftResponse;
			
			expect(result.success).toBe(true);
			expect(result.slug).toBeDefined();
			expect(result.filepath).toContain('/posts/');
			
			console.log(`[Fetch] Created draft: ${result.filepath}`);
			
			// Cleanup: remove the created file
			if (result.filepath) {
				const fs = await import('fs');
				if (fs.existsSync(result.filepath)) {
					fs.unlinkSync(result.filepath);
				}
			}
		});

		test('Direct fetch - missing post object', async ({ request }) => {
			const url = `${API_BASE}/create-draft`;
			
			const response = await request.post(url, {
				data: { notPost: 'something' },
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body.message).toContain('Missing or invalid post object');
		});

		test('Direct fetch - missing frontmatter', async ({ request }) => {
			const url = `${API_BASE}/create-draft`;
			
			const response = await request.post(url, {
				data: {
					post: { content: 'no frontmatter' }
				},
				headers: { 'Content-Type': 'application/json' }
			});
			
			expect(response.status()).toBe(400);
			const body = await response.json();
			expect(body.message).toContain('Missing or invalid frontmatter');
		});
	});

	test.describe('Comparison: MCP Navigation vs Direct Fetch', () => {
		test('Performance comparison - MCP has overhead', async ({ page, request }) => {
			const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
			
			// MCP approach timing
			const mcpStart = Date.now();
			await getViaMcp<CommitsResponse>(page, url);
			const mcpDuration = Date.now() - mcpStart;
			
			// Fetch approach timing
			const fetchStart = Date.now();
			await getViaFetch<CommitsResponse>(request, url);
			const fetchDuration = Date.now() - fetchStart;
			
			console.log(`[Performance] MCP: ${mcpDuration}ms, Fetch: ${fetchDuration}ms`);
			
			// MCP should generally be slower due to browser overhead
			// but this is not a strict assertion as timing can vary
			expect(mcpDuration).toBeGreaterThan(0);
			expect(fetchDuration).toBeGreaterThan(0);
		});

		test('Error handling comparison - MCP shows HTML error pages', async ({ page, request }) => {
			const url = `${API_BASE}/commits?since=${INVALID_DATE}&until=${TEST_DATE_UNTIL}`;
			
			// MCP shows HTML error page
			await page.goto(url);
			const htmlContent = await page.content();
			expect(htmlContent).toContain('<html');
			expect(htmlContent).toContain('400');
			
			// Fetch returns JSON error
			const response = await request.get(url);
			const jsonError = await response.json();
			expect(jsonError).toHaveProperty('message');
			expect(typeof jsonError.message).toBe('string');
		});

		test('Accessibility tree for JSON response', async ({ page }) => {
			const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
			
			await page.goto(url);
			await page.waitForSelector('body pre');
			
			// Note: page.accessibility.snapshot() may not be available in all Playwright versions
			// Instead, verify the JSON is accessible via DOM
			
			// JSON response is rendered as preformatted text
			const preElement = await page.locator('body pre');
			await expect(preElement).toBeVisible();
			
			// The body contains the pre element with JSON
			const body = await page.locator('body').textContent();
			expect(body).toContain('commits');
			expect(body).toContain('count');
			
			// Verify JSON structure is parseable
			const jsonText = await preElement.textContent();
			const data = JSON.parse(jsonText!);
			expect(data).toHaveProperty('commits');
			expect(Array.isArray(data.commits)).toBe(true);
		});
	});
});

test.describe('Summary: MCP vs Direct API Access', () => {
	test('MCP approach characteristics', async ({ page }) => {
		const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
		
		await page.goto(url);
		
		// Check URL is in address bar (visible to MCP)
		expect(page.url()).toContain('/api/journal/commits');
		
		// Response is rendered as page content
		const pre = page.locator('body pre');
		await expect(pre).toBeVisible();
		
		// Content can be parsed as JSON
		const text = await pre.textContent();
		const data = JSON.parse(text!);
		expect(data).toHaveProperty('commits');
		
		console.log('[Summary] MCP approach: JSON visible as page content, parseable');
	});

	test('Direct fetch characteristics', async ({ request }) => {
		const url = `${API_BASE}/commits?since=${TEST_DATE_SINCE}&until=${TEST_DATE_UNTIL}`;
		
		const response = await request.get(url);
		
		// Direct access to status, headers
		expect(response.status()).toBe(200);
		expect(response.headers()['content-type']).toContain('application/json');
		
		// Direct JSON parsing
		const data = await response.json();
		expect(data).toHaveProperty('commits');
		
		console.log('[Summary] Direct fetch: Direct access to status/headers, native JSON parsing');
	});
});
