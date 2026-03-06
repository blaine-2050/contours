/**
 * Git Journal API
 * Main exports for the git journal module
 */

import { writeFile } from 'fs/promises';
import { join } from 'path';
import type { 
	Commit, 
	GeneratedPost, 
	CreateDraftResponse, 
	CommitQuery,
	GeneratePostInput,
	CreateDraftInput 
} from './types';
import { getCommits, getLatestCommit, getFirstCommitDate } from './git';
import { generatePost, generateSlug, formatAsMarkdown } from './generator';

// Re-export all types and functions
export * from './types';
export { 
	getCommits, 
	getLatestCommit, 
	getFirstCommitDate,
	getShortSha,
	classifyCommit,
	groupCommitsByType 
} from './git.js';
export { 
	generatePost, 
	generateSlug, 
	formatAsMarkdown 
} from './generator.js';

/**
 * Validate date format (YYYY-MM-DD)
 * @param date - Date string to validate
 * @returns True if valid
 */
export function isValidDate(date: string): boolean {
	const regex = /^\d{4}-\d{2}-\d{2}$/;
	if (!regex.test(date)) return false;
	
	// Check if it's a real date
	const parsed = new Date(date);
	return !isNaN(parsed.getTime());
}

/**
 * Validate commit query parameters
 * @param query - Query object with since and until
 * @returns Validation result
 */
export function validateCommitQuery(query: { since?: string; until?: string }): 
	{ valid: true; since: string; until: string } | { valid: false; error: string } {
	
	const { since, until } = query;
	
	if (!since) {
		return { valid: false, error: 'Missing required parameter: since' };
	}
	
	if (!until) {
		return { valid: false, error: 'Missing required parameter: until' };
	}
	
	if (!isValidDate(since)) {
		return { valid: false, error: 'Invalid since date format. Use YYYY-MM-DD' };
	}
	
	if (!isValidDate(until)) {
		return { valid: false, error: 'Invalid until date format. Use YYYY-MM-DD' };
	}
	
	// Check that since is not after until
	if (new Date(since) > new Date(until)) {
		return { valid: false, error: 'since date cannot be after until date' };
	}
	
	return { valid: true, since, until };
}

/**
 * Validate generate post input
 * @param input - Input to validate
 * @returns Validation result
 */
export function validateGenerateInput(input: unknown): 
	{ valid: true; data: GeneratePostInput } | { valid: false; error: string } {
	
	if (!input || typeof input !== 'object') {
		return { valid: false, error: 'Invalid input: expected object' };
	}
	
	const data = input as Record<string, unknown>;
	
	if (!Array.isArray(data.commits)) {
		return { valid: false, error: 'Missing or invalid commits array' };
	}
	
	if (!data.weekStart || typeof data.weekStart !== 'string') {
		return { valid: false, error: 'Missing or invalid weekStart' };
	}
	
	if (!isValidDate(data.weekStart)) {
		return { valid: false, error: 'Invalid weekStart date format. Use YYYY-MM-DD' };
	}
	
	// Validate each commit has required fields
	for (const commit of data.commits) {
		if (!commit || typeof commit !== 'object') {
			return { valid: false, error: 'Invalid commit in array' };
		}
		const c = commit as Record<string, unknown>;
		if (!c.sha || !c.message || !c.date || !c.author) {
			return { valid: false, error: 'Commit missing required fields (sha, message, date, author)' };
		}
	}
	
	return { 
		valid: true, 
		data: { 
			commits: data.commits as Commit[], 
			weekStart: data.weekStart 
		} 
	};
}

/**
 * Validate create draft input
 * @param input - Input to validate
 * @returns Validation result
 */
export function validateCreateDraftInput(input: unknown):
	{ valid: true; data: CreateDraftInput } | { valid: false; error: string } {
	
	if (!input || typeof input !== 'object') {
		return { valid: false, error: 'Invalid input: expected object' };
	}
	
	const data = input as Record<string, unknown>;
	
	if (!data.post || typeof data.post !== 'object') {
		return { valid: false, error: 'Missing or invalid post object' };
	}
	
	const post = data.post as Record<string, unknown>;
	
	if (!post.frontmatter || typeof post.frontmatter !== 'object') {
		return { valid: false, error: 'Missing or invalid frontmatter' };
	}
	
	if (!post.content || typeof post.content !== 'string') {
		return { valid: false, error: 'Missing or invalid content' };
	}
	
	const fm = post.frontmatter as Record<string, unknown>;
	
	if (!fm.title || typeof fm.title !== 'string') {
		return { valid: false, error: 'Missing or invalid title in frontmatter' };
	}
	
	if (!fm.date || typeof fm.date !== 'string') {
		return { valid: false, error: 'Missing or invalid date in frontmatter' };
	}
	
	return {
		valid: true,
		data: {
			post: {
				frontmatter: {
					title: fm.title,
					date: fm.date,
					time: typeof fm.time === 'string' ? fm.time : undefined,
					author: typeof fm.author === 'string' ? fm.author : 'Contours Bot',
					categories: Array.isArray(fm.categories) ? fm.categories as string[] : ['dev-journal'],
					draft: typeof fm.draft === 'boolean' ? fm.draft : true
				},
				content: post.content
			}
		}
	};
}

/**
 * Create a draft post file in ./posts/
 * @param post - Generated post
 * @returns Result of the operation
 */
export async function createDraft(post: GeneratedPost): Promise<CreateDraftResponse> {
	try {
		const slug = generateSlug(post.frontmatter.date);
		const filename = `${slug}.md`;
		const filepath = join(process.cwd(), 'posts', filename);
		const markdown = formatAsMarkdown(post);
		
		await writeFile(filepath, markdown, 'utf-8');
		
		return {
			success: true,
			filepath,
			slug
		};
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error'
		};
	}
}
