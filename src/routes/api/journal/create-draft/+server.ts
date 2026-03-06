/**
 * POST /api/journal/create-draft
 * Body: { post: GeneratedPost }
 * Action: Creates draft post in ./posts/
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createDraft, validateCreateDraftInput } from '$lib/server/git-journal';
import { logger } from '$lib/server/logger';
import { dev } from '$app/environment';

export const POST: RequestHandler = async ({ request }) => {
	// Only allow in development mode to prevent unauthorized post creation
	if (!dev) {
		logger.warn('journal create-draft blocked in production');
		throw error(403, 'Draft creation only allowed in development mode');
	}

	let body: unknown;
	
	try {
		body = await request.json();
	} catch {
		logger.warn('journal create-draft invalid JSON');
		throw error(400, 'Invalid JSON body');
	}

	logger.debug('journal create-draft request');

	const validation = validateCreateDraftInput(body);
	
	if (!validation.valid) {
		logger.warn('journal create-draft validation failed', { error: validation.error });
		throw error(400, validation.error);
	}

	try {
		const { post } = validation.data;
		const result = await createDraft(post);

		if (!result.success) {
			logger.error('journal create-draft failed', { error: result.error });
			throw error(500, result.error || 'Failed to create draft');
		}

		logger.info('journal draft created', { 
			slug: result.slug,
			filepath: result.filepath 
		});

		return json({
			success: true,
			slug: result.slug,
			filepath: result.filepath,
			message: `Draft created at ${result.filepath}`
		});
	} catch (err) {
		// Don't double-throw if it's already an HTTP error
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		
		const message = err instanceof Error ? err.message : 'Failed to create draft';
		logger.error('journal create-draft error', { error: message });
		throw error(500, message);
	}
};
