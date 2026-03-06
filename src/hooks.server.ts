import type { Handle, HandleServerError } from '@sveltejs/kit';
import { initAdapter } from '$lib/server/persistence';
import { logger } from '$lib/server/logger';

// Initialize the persistence adapter at server startup.
const _adapter = await initAdapter();
logger.info('persistence adapter initialized', { mode: process.env.PERSISTENCE || 'file' });

export const handle: Handle = async ({ event, resolve }) => {
	const { method, url } = event.request;
	const path = new URL(url).pathname;

	// Skip logging for static assets
	if (path.startsWith('/_app/') || path.startsWith('/favicon')) {
		return resolve(event);
	}

	const start = performance.now();
	const response = await resolve(event);
	const duration = Math.round(performance.now() - start);

	logger.info('request', {
		method,
		path,
		status: response.status,
		duration_ms: duration,
	});

	return response;
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const path = event?.url?.pathname ?? 'unknown';

	logger.error('unhandled error', {
		path,
		status,
		message,
		stack: error instanceof Error ? error.stack : String(error),
	});

	return { message: 'Internal error' };
};
