import { getAllPosts, getPostBySlug } from './posts';
import type { PostMeta } from './posts';

export interface SearchResult extends PostMeta {
	matchContext?: string;
}

export function searchPosts(query: string): SearchResult[] {
	if (!query.trim()) return [];

	let regex: RegExp;
	try {
		regex = new RegExp(query, 'i');
	} catch {
		// If invalid regex, treat as literal string
		regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
	}

	const allPosts = getAllPosts();
	const results: SearchResult[] = [];

	for (const post of allPosts) {
		// Check title
		if (regex.test(post.title)) {
			results.push({ ...post, matchContext: `Title: ${post.title}` });
			continue;
		}

		// Check content
		const fullPost = getPostBySlug(post.slug);
		if (fullPost && regex.test(fullPost.content)) {
			// Extract context around match
			const match = fullPost.content.match(regex);
			if (match && match.index !== undefined) {
				const start = Math.max(0, match.index - 50);
				const end = Math.min(fullPost.content.length, match.index + match[0].length + 50);
				let context = fullPost.content.substring(start, end);
				if (start > 0) context = '...' + context;
				if (end < fullPost.content.length) context = context + '...';
				results.push({ ...post, matchContext: context });
			} else {
				results.push({ ...post });
			}
		}
	}

	return results;
}
