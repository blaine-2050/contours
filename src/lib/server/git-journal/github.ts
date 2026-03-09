/**
 * GitHub API Module
 * Fetches commit data from GitHub repos via the gh CLI
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { Commit } from './types';

const execAsync = promisify(exec);

/**
 * List public repos for a GitHub user
 * @param owner - GitHub username
 * @returns Array of repo names
 */
export async function listPublicRepos(owner: string): Promise<string[]> {
	const command = `gh api "users/${owner}/repos?per_page=100&type=public" --jq '.[].name'`;

	try {
		const { stdout } = await execAsync(command, { encoding: 'utf-8' });
		if (!stdout || stdout.trim() === '') return [];
		return stdout.trim().split('\n').filter(Boolean);
	} catch (error) {
		throw new Error(`Failed to list repos for ${owner}: ${error instanceof Error ? error.message : 'Unknown error'}`);
	}
}

/**
 * Fetch commits from a GitHub repo within a date range
 * @param owner - GitHub username
 * @param repo - Repository name
 * @param since - Start date (ISO 8601, e.g., "2026-03-03T00:00:00Z")
 * @param until - End date (ISO 8601, e.g., "2026-03-09T23:59:59Z")
 * @returns Array of Commit objects
 */
export async function getGitHubCommits(
	owner: string,
	repo: string,
	since: string,
	until: string
): Promise<Commit[]> {
	const commits: Commit[] = [];
	let page = 1;

	while (true) {
		// Use jq to extract first line of message only (avoid multiline issues with @tsv)
		const command = `gh api "repos/${owner}/${repo}/commits?since=${since}&until=${until}&per_page=100&page=${page}" --jq '.[] | [.sha, (.commit.message | split("\\n")[0]), .commit.author.date, .commit.author.name] | @tsv'`;

		try {
			const { stdout } = await execAsync(command, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });

			if (!stdout || stdout.trim() === '') break;

			const lines = stdout.trim().split('\n').filter(Boolean);
			if (lines.length === 0) break;

			for (const line of lines) {
				const parts = line.split('\t');
				if (parts.length >= 4) {
					const dateStr = parts[2].trim();
					const date = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;

					commits.push({
						sha: parts[0].trim(),
						message: parts[1].trim(),
						date,
						author: parts[3].trim()
					});
				}
			}

			// If we got fewer than 100, we're done
			if (lines.length < 100) break;
			page++;
		} catch (error) {
			// Empty repo or no commits in range
			if (error instanceof Error && error.message.includes('409')) break; // Git Repository is empty
			if (error instanceof Error && error.message.includes('422')) break; // No commit found
			throw new Error(`Failed to fetch commits for ${owner}/${repo}: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	}

	return commits;
}

/**
 * Get the date of the earliest commit in a GitHub repo
 * @param owner - GitHub username
 * @param repo - Repository name
 * @returns ISO date string (YYYY-MM-DD) or null if repo is empty
 */
export async function getEarliestCommitDate(owner: string, repo: string): Promise<string | null> {
	try {
		// Get the default branch first
		const branchCmd = `gh api "repos/${owner}/${repo}" --jq '.default_branch'`;
		const { stdout: branch } = await execAsync(branchCmd, { encoding: 'utf-8' });
		const defaultBranch = branch.trim();

		if (!defaultBranch) return null;

		// Get the first commit by walking to the root
		// GitHub API doesn't have a direct "first commit" endpoint
		// Use the commits endpoint sorted ascending via per_page=1 on last page
		// Simpler approach: get total commit count then fetch last page
		const countCmd = `gh api "repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=1" --include 2>&1 | grep -i '^link:' || echo ''`;
		const { stdout: linkHeader } = await execAsync(countCmd, { encoding: 'utf-8' });

		let lastPage = 1;
		if (linkHeader && linkHeader.includes('rel="last"')) {
			const match = linkHeader.match(/page=(\d+)>; rel="last"/);
			if (match) lastPage = parseInt(match[1], 10);
		}

		// Fetch the last page to get the earliest commit
		const firstCommitCmd = `gh api "repos/${owner}/${repo}/commits?sha=${defaultBranch}&per_page=1&page=${lastPage}" --jq '.[0].commit.author.date'`;
		const { stdout: dateStr } = await execAsync(firstCommitCmd, { encoding: 'utf-8' });

		if (!dateStr || dateStr.trim() === '' || dateStr.trim() === 'null') return null;

		return dateStr.trim().split('T')[0];
	} catch {
		return null;
	}
}
