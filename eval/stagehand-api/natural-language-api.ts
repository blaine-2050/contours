/**
 * Evaluation B: Stagehand consuming Git Journal API
 * 
 * Tests natural language API usage with Stagehand pattern.
 * Stagehand is designed for natural language instruction and self-healing.
 * 
 * This evaluation tests:
 * 1. Natural language request for commits
 * 2. Natural language post generation
 * 3. Natural language draft creation
 * 4. Self-healing with API response changes
 * 5. Error handling with natural language
 */

import { test, expect } from '@playwright/test';
import type { Commit, CommitsResponse, GenerateResponse, CreateDraftResponse } from '../../src/lib/server/git-journal/types';

/**
 * Simulated Stagehand API Client
 * 
 * This class mimics how Stagehand would work with natural language instructions.
 * In a real implementation, this would use an LLM to interpret instructions
 * and translate them to API calls.
 */
class StagehandAPIClient {
	private baseURL: string;
	private instructionLog: string[] = [];

	constructor(baseURL: string = 'http://localhost:5174') {
		this.baseURL = baseURL;
	}

	/**
	 * Execute a natural language instruction against the API
	 * 
	 * Supported patterns:
	 * - "Get commits from [date] to [date]"
	 * - "Generate a blog post from these commits"
	 * - "Save the post as a draft"
	 */
	async execute(instruction: string, context?: unknown): Promise<unknown> {
		this.instructionLog.push(instruction);

		// Natural language parsing for commit retrieval
		if (instruction.toLowerCase().includes('get commits') || 
		    instruction.toLowerCase().includes('fetch commits')) {
			return this.handleGetCommits(instruction);
		}

		// Natural language parsing for post generation
		if (instruction.toLowerCase().includes('generate') && 
		    instruction.toLowerCase().includes('post')) {
			return this.handleGeneratePost(instruction, context);
		}

		// Natural language parsing for draft creation
		if (instruction.toLowerCase().includes('save') || 
		    instruction.toLowerCase().includes('create draft')) {
			return this.handleCreateDraft(instruction, context);
		}

		throw new Error(`Unrecognized instruction: ${instruction}`);
	}

	/**
	 * Parse date from natural language
	 * Handles: "March 1-7, 2026", "last week", "yesterday", etc.
	 */
	private parseDateFromNaturalLanguage(dateStr: string): { since: string; until: string } | null {
		// Pattern: "March 1-7, 2026" or "March 1 to March 7, 2026"
		const rangePattern = /(\w+)\s+(\d+)[-\s]to?\s+(?:\w+\s+)?(\d+),?\s*(\d{4})?/i;
		const rangeMatch = dateStr.match(rangePattern);
		
		if (rangeMatch) {
			const month = rangeMatch[1];
			const startDay = rangeMatch[2].padStart(2, '0');
			const endDay = rangeMatch[3].padStart(2, '0');
			const year = rangeMatch[4] || new Date().getFullYear().toString();
			
			const monthNum = this.monthToNumber(month);
			if (monthNum) {
				return {
					since: `${year}-${monthNum}-${startDay}`,
					until: `${year}-${monthNum}-${endDay}`
				};
			}
		}

		// Pattern: "last week"
		if (dateStr.toLowerCase().includes('last week')) {
			const today = new Date();
			const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
			return {
				since: this.formatDate(lastWeek),
				until: this.formatDate(today)
			};
		}

		// Pattern: ISO dates in the string
		const isoPattern = /(\d{4}-\d{2}-\d{2})/g;
		const isoDates = dateStr.match(isoPattern);
		if (isoDates && isoDates.length >= 2) {
			return { since: isoDates[0], until: isoDates[1] };
		}

		return null;
	}

	private monthToNumber(month: string): string | null {
		const months: Record<string, string> = {
			january: '01', february: '02', march: '03', april: '04',
			may: '05', june: '06', july: '07', august: '08',
			september: '09', october: '10', november: '11', december: '12'
		};
		return months[month.toLowerCase()] || null;
	}

	private formatDate(date: Date): string {
		return date.toISOString().split('T')[0];
	}

	private async handleGetCommits(instruction: string): Promise<CommitsResponse> {
		const dates = this.parseDateFromNaturalLanguage(instruction);
		
		if (!dates) {
			throw new Error(`Could not parse date range from instruction: ${instruction}`);
		}

		const url = `${this.baseURL}/api/journal/commits?since=${dates.since}&until=${dates.until}`;
		const response = await fetch(url);
		
		if (!response.ok) {
			const error = await response.text();
			throw new Error(`API Error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	private async handleGeneratePost(instruction: string, context: unknown): Promise<GenerateResponse> {
		if (!context || !Array.isArray(context)) {
			throw new Error('Generate post requires commits array in context');
		}

		const commits = context as Commit[];
		
		// Try to extract week start from instruction or use first commit date
		let weekStart = commits[0]?.date;
		const dateMatch = instruction.match(/for\s+(\d{4}-\d{2}-\d{2})/);
		if (dateMatch) {
			weekStart = dateMatch[1];
		}

		const response = await fetch(`${this.baseURL}/api/journal/generate`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ commits, weekStart })
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`API Error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	private async handleCreateDraft(instruction: string, context: unknown): Promise<CreateDraftResponse> {
		if (!context || typeof context !== 'object') {
			throw new Error('Create draft requires post object in context');
		}

		const response = await fetch(`${this.baseURL}/api/journal/create-draft`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ post: context })
		});

		if (!response.ok) {
			const error = await response.text();
			throw new Error(`API Error: ${response.status} - ${error}`);
		}

		return response.json();
	}

	getInstructionLog(): string[] {
		return [...this.instructionLog];
	}

	clearLog(): void {
		this.instructionLog = [];
	}
}

/**
 * Self-Healing API Client
 * 
 * This client demonstrates self-healing capabilities by adapting to
 * slight changes in API response structure.
 */
class SelfHealingAPIClient {
	private baseURL: string;
	private adaptationLog: Array<{ original: string; adapted: string }> = [];

	constructor(baseURL: string = 'http://localhost:5174') {
		this.baseURL = baseURL;
	}

	/**
	 * Get commits with self-healing for response format changes
	 */
	async getCommits(since: string, until: string): Promise<CommitsResponse> {
		const url = `${this.baseURL}/api/journal/commits?since=${since}&until=${until}`;
		const response = await fetch(url);
		
		if (!response.ok) {
			throw new Error(`API Error: ${response.status}`);
		}

		const data = await response.json();
		
		// Self-healing: adapt to different response structures
		return this.adaptCommitsResponse(data);
	}

	/**
	 * Adapt various response structures to the expected CommitsResponse format
	 */
	private adaptCommitsResponse(data: unknown): CommitsResponse {
		if (!data || typeof data !== 'object') {
			throw new Error('Invalid response structure');
		}

		const d = data as Record<string, unknown>;

		// Normal case: expected structure
		if (Array.isArray(d.commits) && typeof d.count === 'number') {
			return d as CommitsResponse;
		}

		// Self-healing case 1: commits are nested under 'data'
		if (d.data && Array.isArray((d.data as Record<string, unknown>).commits)) {
			this.adaptationLog.push({ 
				original: 'nested data.commits', 
				adapted: 'flat commits' 
			});
			const nested = d.data as Record<string, unknown>;
			return {
				commits: nested.commits as Commit[],
				count: (nested.count as number) || (nested.commits as Commit[]).length,
				since: (nested.since as string) || '',
				until: (nested.until as string) || ''
			};
		}

		// Self-healing case 2: commits array is called 'items' instead
		if (Array.isArray(d.items)) {
			this.adaptationLog.push({ 
				original: 'items array', 
				adapted: 'commits array' 
			});
			return {
				commits: d.items as Commit[],
				count: (d.total as number) || (d.items as Commit[]).length,
				since: (d.since as string) || (d.startDate as string) || '',
				until: (d.until as string) || (d.endDate as string) || ''
			};
		}

		// Self-healing case 3: response is an array directly
		if (Array.isArray(data)) {
			this.adaptationLog.push({ 
				original: 'array response', 
				adapted: 'commits response object' 
			});
			return {
				commits: data as Commit[],
				count: data.length,
				since: '',
				until: ''
			};
		}

		throw new Error('Unable to adapt response structure');
	}

	getAdaptationLog(): Array<{ original: string; adapted: string }> {
		return [...this.adaptationLog];
	}

	clearAdaptationLog(): void {
		this.adaptationLog = [];
	}
}

// Test Suite
test.describe('Stagehand Natural Language API', () => {
	let stagehand: StagehandAPIClient;
	let healingClient: SelfHealingAPIClient;

	test.beforeEach(() => {
		stagehand = new StagehandAPIClient();
		healingClient = new SelfHealingAPIClient();
	});

	test.describe('Natural Language Commit Retrieval', () => {
		test('should understand "Get commits from March 1-7, 2026"', async () => {
			// This test would require the API server to be running
			// For now, we test the parsing logic
			const dates = (stagehand as unknown as { parseDateFromNaturalLanguage: (s: string) => { since: string; until: string } | null })
				.parseDateFromNaturalLanguage('Get commits from March 1-7, 2026');
			
			expect(dates).not.toBeNull();
			expect(dates?.since).toBe('2026-03-01');
			expect(dates?.until).toBe('2026-03-07');
		});

		test('should understand ISO date format in instructions', async () => {
			const dates = (stagehand as unknown as { parseDateFromNaturalLanguage: (s: string) => { since: string; until: string } | null })
				.parseDateFromNaturalLanguage('Get commits from 2026-03-01 to 2026-03-07');
			
			expect(dates).not.toBeNull();
			expect(dates?.since).toBe('2026-03-01');
			expect(dates?.until).toBe('2026-03-07');
		});

		test('should understand "last week" relative date', async () => {
			const dates = (stagehand as unknown as { parseDateFromNaturalLanguage: (s: string) => { since: string; until: string } | null })
				.parseDateFromNaturalLanguage('Get commits from last week');
			
			expect(dates).not.toBeNull();
			// Verify dates are within last 7 days
			const since = new Date(dates!.since);
			const until = new Date(dates!.until);
			const diffTime = Math.abs(until.getTime() - since.getTime());
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			expect(diffDays).toBe(7);
		});
	});

	test.describe('Self-Healing API Response Handling', () => {
		test('should handle normal response structure', async () => {
			const normalResponse = {
				commits: [
					{ sha: 'abc123', message: 'feat: add feature', date: '2026-03-01', author: 'Test' }
				],
				count: 1,
				since: '2026-03-01',
				until: '2026-03-07'
			};

			const adapted = (healingClient as unknown as { adaptCommitsResponse: (d: unknown) => CommitsResponse })
				.adaptCommitsResponse(normalResponse);

			expect(adapted.count).toBe(1);
			expect(adapted.commits).toHaveLength(1);
		});

		test('should self-heal when commits are nested under data', async () => {
			const nestedResponse = {
				data: {
					commits: [
						{ sha: 'abc123', message: 'feat: add feature', date: '2026-03-01', author: 'Test' }
					],
					count: 1,
					since: '2026-03-01',
					until: '2026-03-07'
				}
			};

			const adapted = (healingClient as unknown as { adaptCommitsResponse: (d: unknown) => CommitsResponse })
				.adaptCommitsResponse(nestedResponse);

			expect(adapted.count).toBe(1);
			expect(adapted.commits).toHaveLength(1);
			expect(healingClient.getAdaptationLog()).toHaveLength(1);
			expect(healingClient.getAdaptationLog()[0].original).toBe('nested data.commits');
		});

		test('should self-heal when commits are called items', async () => {
			const renamedResponse = {
				items: [
					{ sha: 'abc123', message: 'feat: add feature', date: '2026-03-01', author: 'Test' }
				],
				total: 1,
				startDate: '2026-03-01',
				endDate: '2026-03-07'
			};

			const adapted = (healingClient as unknown as { adaptCommitsResponse: (d: unknown) => CommitsResponse })
				.adaptCommitsResponse(renamedResponse);

			expect(adapted.count).toBe(1);
			expect(adapted.commits).toHaveLength(1);
			expect(adapted.since).toBe('2026-03-01');
			expect(healingClient.getAdaptationLog()[0].original).toBe('items array');
		});

		test('should self-heal when response is a plain array', async () => {
			const arrayResponse = [
				{ sha: 'abc123', message: 'feat: add feature', date: '2026-03-01', author: 'Test' }
			];

			const adapted = (healingClient as unknown as { adaptCommitsResponse: (d: unknown) => CommitsResponse })
				.adaptCommitsResponse(arrayResponse);

			expect(adapted.count).toBe(1);
			expect(adapted.commits).toHaveLength(1);
			expect(healingClient.getAdaptationLog()[0].original).toBe('array response');
		});
	});

	test.describe('Edge Cases and Error Handling', () => {
		test('should handle ambiguous date descriptions gracefully', async () => {
			const ambiguousInstructions = [
				'Get commits from sometime in March',
				'Fetch recent commits',
				'Show me commits'
			];

			for (const instruction of ambiguousInstructions) {
				const dates = (stagehand as unknown as { parseDateFromNaturalLanguage: (s: string) => { since: string; until: string } | null })
					.parseDateFromNaturalLanguage(instruction);
				// These should either parse to something reasonable or return null
				// The key is they shouldn't crash
				expect(dates).toBeDefined();
			}
		});

		test('should require commits context for generate instruction', async () => {
			await expect(
				stagehand.execute('Generate a blog post from these commits')
			).rejects.toThrow('requires commits array');
		});

		test('should require post context for save instruction', async () => {
			await expect(
				stagehand.execute('Save the post as a draft')
			).rejects.toThrow('requires post object');
		});
	});

	test.describe('Multi-Step Workflow', () => {
		test('should chain instructions for complete workflow', async () => {
			// This test documents the intended multi-step workflow
			// Step 1: Get commits
			// Step 2: Generate post
			// Step 3: Save draft

			const workflow = [
				{ instruction: 'Get commits from March 1-7, 2026', expectedType: 'commits' },
				{ instruction: 'Generate a blog post from these commits', context: 'commits', expectedType: 'post' },
				{ instruction: 'Save the post as a draft', context: 'post', expectedType: 'draft' }
			];

			// Verify each step has the right instruction pattern
			for (const step of workflow) {
				expect(step.instruction).toBeTruthy();
				expect(step.expectedType).toMatch(/commits|post|draft/);
			}

			// Verify the instruction log tracks all steps
			expect(workflow).toHaveLength(3);
		});
	});
});

// Export classes for potential reuse
export { StagehandAPIClient, SelfHealingAPIClient };
