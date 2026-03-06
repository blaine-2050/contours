/**
 * GET /api/journal/commits?since=YYYY-MM-DD&until=YYYY-MM-DD
 * Returns commits from git log within the specified date range
 */

import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getCommits, validateCommitQuery } from '$lib/server/git-journal';
import { logger } from '$lib/server/logger';

export const GET: RequestHandler = async ({ url }) => {
	const since = url.searchParams.get('since') || undefined;
	const until = url.searchParams.get('until') || undefined;

	logger.debug('journal commits request', { since, until });

	const validation = validateCommitQuery({ since, until });
	
	if (!validation.valid) {
		logger.warn('journal commits validation failed', { error: validation.error });
		throw error(400, validation.error);
	}

	try {
		const commits = await getCommits(validation.since, validation.until);

		logger.info('journal commits retrieved', { 
			count: commits.length, 
			since: validation.since, 
			until: validation.until 
		});

		return json({
			commits,
			count: commits.length,
			since: validation.since,
			until: validation.until
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to fetch commits';
		logger.error('journal commits error', { error: message });
		throw error(500, message);
	}
};
