/**
 * Git Module
 * Extracts commit history using git log command
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { Commit, CommitType, GroupedCommits } from './types';

const execAsync = promisify(exec);

/**
 * Get commits from git log within a date range
 * @param since - Start date (YYYY-MM-DD)
 * @param until - End date (YYYY-MM-DD)
 * @returns Array of commits
 */
export async function getCommits(since: string, until: string): Promise<Commit[]> {
	// Validate date format (YYYY-MM-DD)
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(since) || !dateRegex.test(until)) {
		throw new Error('Invalid date format. Use YYYY-MM-DD');
	}

	const format = '%H|%s|%ad|%an';
	const command = `git log --since="${since} 00:00:00" --until="${until} 23:59:59" --pretty=format:"${format}" --date=short`;

	try {
		const { stdout } = await execAsync(command, {
			cwd: process.cwd(),
			encoding: 'utf-8'
		});

		if (!stdout || stdout.trim() === '') {
			return [];
		}

		return parseGitLog(stdout);
	} catch (error) {
		// Handle case where git command fails (e.g., not a git repo)
		if (error instanceof Error && 'stderr' in error) {
			const execError = error as { stderr: string };
			if (execError.stderr?.includes('not a git repository')) {
				throw new Error('Not a git repository');
			}
		}
		// If no commits found or other error, return empty array
		return [];
	}
}

/**
 * Parse git log output into Commit objects
 * @param logOutput - Raw git log output
 * @returns Array of parsed commits
 */
function parseGitLog(logOutput: string): Commit[] {
	const lines = logOutput.trim().split('\n');
	const commits: Commit[] = [];

	for (const line of lines) {
		const parts = line.split('|');
		if (parts.length >= 4) {
			commits.push({
				sha: parts[0].trim(),
				message: parts[1].trim(),
				date: parts[2].trim(),
				author: parts[3].trim()
			});
		}
	}

	return commits;
}

/**
 * Get short SHA (first 7 characters)
 * @param sha - Full SHA
 * @returns Short SHA
 */
export function getShortSha(sha: string): string {
	return sha.substring(0, 7);
}

/**
 * Classify commit message type based on conventional commits
 * @param message - Commit message
 * @returns Commit type
 */
export function classifyCommit(message: string): CommitType {
	const lower = message.toLowerCase();
	
	if (lower.startsWith('feat') || lower.startsWith('feature')) return 'feat';
	if (lower.startsWith('fix')) return 'fix';
	if (lower.startsWith('docs')) return 'docs';
	if (lower.startsWith('style')) return 'style';
	if (lower.startsWith('refactor')) return 'refactor';
	if (lower.startsWith('test')) return 'test';
	if (lower.startsWith('chore')) return 'chore';
	
	return 'other';
}

/**
 * Group commits by their type
 * @param commits - Array of commits
 * @returns Grouped commits
 */
export function groupCommitsByType(commits: Commit[]): GroupedCommits {
	const grouped: GroupedCommits = {
		feat: [],
		fix: [],
		docs: [],
		style: [],
		refactor: [],
		test: [],
		chore: [],
		other: []
	};

	for (const commit of commits) {
		const type = classifyCommit(commit.message);
		grouped[type].push(commit);
	}

	// Remove empty groups
	for (const key of Object.keys(grouped)) {
		if (grouped[key].length === 0) {
			delete grouped[key];
		}
	}

	return grouped;
}

/**
 * Get latest commit from the repository
 * @returns The most recent commit or null
 */
export async function getLatestCommit(): Promise<Commit | null> {
	try {
		const { stdout } = await execAsync(
			'git log -1 --pretty=format:"%H|%s|%ad|%an" --date=short',
			{ cwd: process.cwd(), encoding: 'utf-8' }
		);

		if (!stdout) return null;

		const parts = stdout.trim().split('|');
		if (parts.length >= 4) {
			return {
				sha: parts[0].trim(),
				message: parts[1].trim(),
				date: parts[2].trim(),
				author: parts[3].trim()
			};
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Get the date of the first commit in the repository
 * @returns Date string or null
 */
export async function getFirstCommitDate(): Promise<string | null> {
	try {
		const { stdout } = await execAsync(
			'git log --reverse --pretty=format:"%ad" --date=short | head -1',
			{ cwd: process.cwd(), encoding: 'utf-8' }
		);

		return stdout?.trim() || null;
	} catch {
		return null;
	}
}
