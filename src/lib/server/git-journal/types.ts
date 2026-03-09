/**
 * Git Journal Types
 * TypeScript interfaces for the git journal API
 */

/** Represents a single git commit */
export interface Commit {
	sha: string;
	message: string;
	date: string; // YYYY-MM-DD
	author: string;
	summary?: string; // Optional AI or manual summary
}

/** Frontmatter for a generated journal post */
export interface PostFrontmatter {
	title: string;
	date: string; // YYYY-MM-DD
	time?: string; // HH:MM in 24-hour GMT
	author: string;
	categories: string[];
	draft?: boolean;
}

/** A complete generated post with frontmatter and content */
export interface GeneratedPost {
	frontmatter: PostFrontmatter;
	content: string;
}

/** Input for commit retrieval */
export interface CommitQuery {
	since: string; // YYYY-MM-DD
	until: string; // YYYY-MM-DD
}

/** Input for post generation */
export interface GeneratePostInput {
	commits: Commit[];
	weekStart: string; // YYYY-MM-DD
}

/** Input for creating a draft */
export interface CreateDraftInput {
	post: GeneratedPost;
}

/** API response for commit list */
export interface CommitsResponse {
	commits: Commit[];
	count: number;
	since: string;
	until: string;
}

/** API response for generated post */
export interface GenerateResponse {
	frontmatter: PostFrontmatter;
	content: string;
	preview: string;
}

/** API response for draft creation */
export interface CreateDraftResponse {
	success: boolean;
	filepath?: string;
	slug?: string;
	error?: string;
}

/** Commit type classification */
export type CommitType = 'feat' | 'fix' | 'docs' | 'style' | 'refactor' | 'test' | 'chore' | 'other';

/** Grouped commits by type */
export interface GroupedCommits {
	[type: string]: Commit[];
}

/** Options for multi-repo post generation */
export interface GeneratorOptions {
	repoName?: string;    // e.g., "track-workout" (defaults to "Contours")
	repoOwner?: string;   // e.g., "blaine-2050"
	author?: string;      // defaults to "Contours Bot"
}

/** Tracking data per repo for duplicate prevention */
export interface RepoTrackingData {
	repo: string;                // "blaine-2050/contours"
	processedWeeks: string[];    // sorted YYYY-MM-DD (Monday start)
	lastChecked: string;         // YYYY-MM-DD
}
