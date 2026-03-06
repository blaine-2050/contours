/**
 * Generator Module
 * Generates blog posts from git commit history
 */

import type { Commit, GeneratedPost, PostFrontmatter, GroupedCommits } from './types';
import { groupCommitsByType, getShortSha, classifyCommit } from './git';

/**
 * Generate a blog post from commits
 * @param commits - Array of commits
 * @param weekStart - Start of the week (YYYY-MM-DD)
 * @returns Generated post with frontmatter and content
 */
export function generatePost(commits: Commit[], weekStart: string): GeneratedPost {
	const frontmatter = createFrontmatter(commits, weekStart);
	const content = generateContent(commits, weekStart);

	return {
		frontmatter,
		content
	};
}

/**
 * Create frontmatter for the generated post
 * @param commits - Array of commits
 * @param weekStart - Start of the week (YYYY-MM-DD)
 * @returns Post frontmatter
 */
function createFrontmatter(commits: Commit[], weekStart: string): PostFrontmatter {
	const commitCount = commits.length;
	const endOfWeek = getEndOfWeek(weekStart);
	
	return {
		title: `Week of ${weekStart} - ${commitCount} commits`,
		date: weekStart,
		time: '12:00',
		author: 'Contours Bot',
		categories: ['dev-journal'],
		draft: true
	};
}

/**
 * Generate markdown content from commits
 * @param commits - Array of commits
 * @param weekStart - Start of the week (YYYY-MM-DD)
 * @returns Markdown content
 */
function generateContent(commits: Commit[], weekStart: string): string {
	if (commits.length === 0) {
		return generateEmptyContent(weekStart);
	}

	const lines: string[] = [];
	const endOfWeek = getEndOfWeek(weekStart);
	
	// Summary paragraph
	lines.push(`This week we made **${commits.length} commits** to the Contours project.`);
	lines.push('');
	
	// Add date range
	lines.push(`**Period:** ${weekStart} to ${endOfWeek}`);
	lines.push('');

	// Group commits by type
	const grouped = groupCommitsByType(commits);
	
	// Generate sections for each type
	const typeOrder = ['feat', 'fix', 'docs', 'refactor', 'test', 'chore', 'style', 'other'];
	
	for (const type of typeOrder) {
		if (grouped[type] && grouped[type].length > 0) {
			lines.push(`## ${formatTypeName(type)}`);
			lines.push('');
			
			for (const commit of grouped[type]) {
				const shortSha = getShortSha(commit.sha);
				const cleanMessage = cleanCommitMessage(commit.message);
				lines.push(`- \`${shortSha}\` ${cleanMessage}`);
			}
			
			lines.push('');
		}
	}

	// Add commit activity section
	lines.push('## Commit Activity');
	lines.push('');
	lines.push('| Date | Commits |');
	lines.push('|------|---------|');
	
	const commitsByDate = groupCommitsByDate(commits);
	const sortedDates = Object.keys(commitsByDate).sort();
	
	for (const date of sortedDates) {
		const count = commitsByDate[date].length;
		lines.push(`| ${date} | ${count} |`);
	}
	
	lines.push('');

	return lines.join('\n');
}

/**
 * Generate content when no commits found
 * @param weekStart - Start of the week
 * @returns Default content
 */
function generateEmptyContent(weekStart: string): string {
	const lines: string[] = [];
	lines.push('No commits were made this week.');
	lines.push('');
	lines.push('Sometimes the best work is the work you don\'t commit — thinking, planning, and preparing for what\'s next.');
	lines.push('');
	return lines.join('\n');
}

/**
 * Format commit type for display
 * @param type - Commit type
 * @returns Formatted type name
 */
function formatTypeName(type: string): string {
	const names: Record<string, string> = {
		feat: '✨ Features',
		fix: '🐛 Bug Fixes',
		docs: '📚 Documentation',
		style: '💎 Code Style',
		refactor: '♻️ Refactoring',
		test: '🧪 Tests',
		chore: '🔧 Chores',
		other: '📝 Other'
	};
	return names[type] || type;
}

/**
 * Clean commit message by removing type prefix
 * @param message - Raw commit message
 * @returns Cleaned message
 */
function cleanCommitMessage(message: string): string {
	// Remove conventional commit prefixes like "feat:", "fix:", etc.
	const prefixRegex = /^(feat|fix|docs|style|refactor|test|chore)(\([^)]+\))?!?:\s*/i;
	return message.replace(prefixRegex, '');
}

/**
 * Group commits by date
 * @param commits - Array of commits
 * @returns Commits grouped by date
 */
function groupCommitsByDate(commits: Commit[]): Record<string, Commit[]> {
	const grouped: Record<string, Commit[]> = {};
	
	for (const commit of commits) {
		if (!grouped[commit.date]) {
			grouped[commit.date] = [];
		}
		grouped[commit.date].push(commit);
	}
	
	return grouped;
}

/**
 * Calculate end of week (6 days after start)
 * @param weekStart - Start date (YYYY-MM-DD)
 * @returns End date (YYYY-MM-DD)
 */
function getEndOfWeek(weekStart: string): string {
	const date = new Date(weekStart);
	date.setDate(date.getDate() + 6);
	return date.toISOString().split('T')[0];
}

/**
 * Generate a slug from the week start date
 * @param weekStart - Start of the week
 * @returns URL-friendly slug
 */
export function generateSlug(weekStart: string): string {
	return `dev-journal-week-of-${weekStart}`;
}

/**
 * Format post as markdown with frontmatter
 * @param post - Generated post
 * @returns Complete markdown document
 */
export function formatAsMarkdown(post: GeneratedPost): string {
	const fm = post.frontmatter;
	const lines: string[] = [];
	
	// Frontmatter
	lines.push('---');
	lines.push(`title: ${fm.title}`);
	lines.push(`date: ${fm.date}`);
	if (fm.time) lines.push(`time: ${fm.time}`);
	lines.push(`author: ${fm.author}`);
	lines.push(`categories: [${fm.categories.map(c => `"${c}"`).join(', ')}]`);
	if (fm.draft) lines.push('draft: true');
	lines.push('---');
	lines.push('');
	
	// Content
	lines.push(post.content);
	
	return lines.join('\n');
}
