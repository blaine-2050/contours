#!/usr/bin/env npx tsx
/**
 * Multi-Repo Journal Generator
 *
 * Generates weekly dev-journal blog posts from:
 * 1. All public repos on GitHub (blaine-2050)
 * 2. Local git repos listed in LOCAL_REPOS
 *
 * Usage: npm run journal:generate
 */

import { join } from 'path';
import { writeFile } from 'fs/promises';
import { listPublicRepos, getGitHubCommits, getEarliestCommitDate } from '../src/lib/server/git-journal/github';
import { getCommits, getFirstCommitDate } from '../src/lib/server/git-journal/git';
import { loadTracking, saveTracking, isWeekProcessed, markWeekProcessed } from '../src/lib/server/git-journal/tracking';
import { generatePost, generateSlug, formatAsMarkdown } from '../src/lib/server/git-journal/generator';
import type { Commit, GeneratorOptions } from '../src/lib/server/git-journal/types';

const OWNER = 'blaine-2050';
const POSTS_DIR = join(process.cwd(), 'posts');
const PROJECTS_ROOT = '/Users/dev/Athenia/projects';

/** Local repos: name → path relative to PROJECTS_ROOT */
const LOCAL_REPOS: Record<string, string> = {
	'ble': 'ble',
	'body-metrics': 'body-metrics',
	'med-search': 'med-search',
	'pushing-to-web': 'pushing-to-web',
	'ai-search': 'shared/ai-search',
	'vault-search': 'vault-search',
	'weight-core': 'weight-core',
};

/**
 * Get the Monday (start of ISO week) for a given date
 */
function getMonday(date: Date): Date {
	const d = new Date(date);
	const day = d.getUTCDay();
	const diff = day === 0 ? -6 : 1 - day;
	d.setUTCDate(d.getUTCDate() + diff);
	d.setUTCHours(0, 0, 0, 0);
	return d;
}

/**
 * Format a date as YYYY-MM-DD
 */
function formatDate(d: Date): string {
	return d.toISOString().split('T')[0];
}

/**
 * Generate all Monday start dates from `earliest` to the current week
 */
function generateWeekStarts(earliest: string): string[] {
	const weeks: string[] = [];
	const start = getMonday(new Date(earliest + 'T00:00:00Z'));
	const now = getMonday(new Date());

	const current = new Date(start);
	while (current <= now) {
		weeks.push(formatDate(current));
		current.setUTCDate(current.getUTCDate() + 7);
	}

	return weeks;
}

interface RepoResult {
	created: number;
	skipped: number;
}

/**
 * Shared logic: iterate weeks, generate posts, update tracking
 */
async function processWeeks(
	repoName: string,
	repoLabel: string,
	earliest: string,
	fetchCommits: (since: string, until: string) => Promise<Commit[]>,
	options: GeneratorOptions
): Promise<RepoResult> {
	let created = 0;
	let skipped = 0;

	let tracking = await loadTracking(repoName);

	const allWeeks = generateWeekStarts(earliest);
	console.log(`  Total weeks: ${allWeeks.length}`);

	for (const weekStart of allWeeks) {
		if (isWeekProcessed(tracking, weekStart)) {
			skipped++;
			continue;
		}

		const untilDate = new Date(weekStart + 'T00:00:00Z');
		untilDate.setUTCDate(untilDate.getUTCDate() + 6);
		const untilStr = formatDate(untilDate);

		const commits = await fetchCommits(weekStart, untilStr);

		if (commits.length === 0) {
			tracking = markWeekProcessed(tracking, weekStart);
			skipped++;
			continue;
		}

		const post = generatePost(commits, weekStart, options);
		const slug = generateSlug(weekStart, repoName);
		const markdown = formatAsMarkdown(post);

		const filepath = join(POSTS_DIR, `${slug}.md`);
		await writeFile(filepath, markdown, 'utf-8');

		console.log(`  Created: ${slug}.md (${commits.length} commits)`);
		created++;

		tracking = markWeekProcessed(tracking, weekStart);
	}

	tracking = { ...tracking, repo: repoLabel, lastChecked: formatDate(new Date()) };
	await saveTracking(repoName, tracking);

	return { created, skipped };
}

/**
 * Process a GitHub repo
 */
async function processGitHubRepo(repo: string): Promise<RepoResult> {
	console.log(`\n--- ${repo} (github) ---`);

	const earliest = await getEarliestCommitDate(OWNER, repo);
	if (!earliest) {
		console.log(`  No commits found, skipping`);
		return { created: 0, skipped: 0 };
	}
	console.log(`  Earliest commit: ${earliest}`);

	return processWeeks(
		repo,
		`${OWNER}/${repo}`,
		earliest,
		(since, until) => getGitHubCommits(OWNER, repo, `${since}T00:00:00Z`, `${until}T23:59:59Z`),
		{ repoName: repo, repoOwner: OWNER, author: 'Contours Bot' }
	);
}

/**
 * Process a local git repo
 */
async function processLocalRepo(name: string, relativePath: string): Promise<RepoResult> {
	const repoPath = join(PROJECTS_ROOT, relativePath);
	console.log(`\n--- ${name} (local: ${relativePath}) ---`);

	const earliest = await getFirstCommitDate(repoPath);
	if (!earliest) {
		console.log(`  No commits found, skipping`);
		return { created: 0, skipped: 0 };
	}
	console.log(`  Earliest commit: ${earliest}`);

	return processWeeks(
		name,
		`local/${name}`,
		earliest,
		(since, until) => getCommits(since, until, repoPath),
		{ repoName: name, author: 'Contours Bot' }
	);
}

async function main() {
	let totalCreated = 0;
	let totalSkipped = 0;

	// --- GitHub repos ---
	console.log(`Fetching public repos for ${OWNER}...`);
	let githubRepos: string[];
	try {
		githubRepos = await listPublicRepos(OWNER);
	} catch (error) {
		console.error(`Failed to list GitHub repos: ${error}`);
		githubRepos = [];
	}
	console.log(`Found ${githubRepos.length} GitHub repos: ${githubRepos.join(', ')}`);

	for (const repo of githubRepos) {
		try {
			const result = await processGitHubRepo(repo);
			totalCreated += result.created;
			totalSkipped += result.skipped;
		} catch (error) {
			console.error(`  Error processing ${repo}: ${error}`);
		}
	}

	// --- Local repos ---
	const localNames = Object.keys(LOCAL_REPOS);
	console.log(`\nProcessing ${localNames.length} local repos: ${localNames.join(', ')}`);

	for (const [name, path] of Object.entries(LOCAL_REPOS)) {
		try {
			const result = await processLocalRepo(name, path);
			totalCreated += result.created;
			totalSkipped += result.skipped;
		} catch (error) {
			console.error(`  Error processing ${name}: ${error}`);
		}
	}

	console.log(`\n=== Summary ===`);
	console.log(`Posts created: ${totalCreated}`);
	console.log(`Weeks skipped: ${totalSkipped}`);
}

main().catch((error) => {
	console.error('Fatal error:', error);
	process.exit(1);
});
