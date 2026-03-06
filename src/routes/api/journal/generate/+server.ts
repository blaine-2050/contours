/**
 * POST /api/journal/generate
 * Body: { commits: Commit[], weekStart: string }
 * Returns: { frontmatter: PostFrontmatter, content: string, preview: string }
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generatePost, validateGenerateInput, formatAsMarkdown } from '$lib/server/git-journal';
import { logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ request }) => {
	let body: unknown;
	
	try {
		body = await request.json();
	} catch {
		logger.warn('journal generate invalid JSON');
		throw error(400, 'Invalid JSON body');
	}

	logger.debug('journal generate request', { 
		commitCount: body && typeof body === 'object' && 'commits' in body 
			? Array.isArray(body.commits) ? body.commits.length : 0 
			: 0 
	});

	const validation = validateGenerateInput(body);
	
	if (!validation.valid) {
		logger.warn('journal generate validation failed', { error: validation.error });
		throw error(400, validation.error);
	}

	try {
		const { commits, weekStart } = validation.data;
		const post = generatePost(commits, weekStart);
		const preview = formatAsMarkdown(post).substring(0, 500) + '...';

		logger.info('journal post generated', { 
			weekStart, 
			commitCount: commits.length,
			title: post.frontmatter.title 
		});

		return json({
			frontmatter: post.frontmatter,
			content: post.content,
			preview
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to generate post';
		logger.error('journal generate error', { error: message });
		throw error(500, message);
	}
};
