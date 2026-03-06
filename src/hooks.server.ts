import type { Handle, HandleServerError } from '@sveltejs/kit';
import { initAdapter } from '$lib/server/persistence';
import { logger } from '$lib/server/logger';
import { cleanupMySQLPool } from '$lib/server/persistence/mysql-adapter.js';

// Initialize the persistence adapter at server startup.
const _adapter = await initAdapter();
logger.info('persistence adapter initialized', { mode: process.env.PERSISTENCE || 'file' });

// Register shutdown handlers for graceful pool cleanup
async function handleShutdown(signal: string): Promise<void> {
	logger.info(`received ${signal}, cleaning up MySQL pool...`);
	try {
		await cleanupMySQLPool();
		logger.info('MySQL pool cleaned up successfully');
	} catch (error) {
		logger.error('error during MySQL pool cleanup', { 
			error: error instanceof Error ? error.message : String(error) 
		});
	}
	process.exit(0);
}

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT')); // Handle Ctrl+C

export const handle: Handle = async ({ event, resolve }) => {
	const { method, url } = event.request;
	const path = new URL(url).pathname;

	// Skip logging for static assets
	if (path.startsWith('/_app/') || path.startsWith('/favicon')) {
		return resolve(event);
	}

	// Run request handling within a logging context with correlation ID
	return logger.withContext({ method, path }, async () => {
		const start = performance.now();
		const response = await resolve(event);
		const duration = Math.round(performance.now() - start);

		logger.info('request completed', {
			status: response.status,
			duration_ms: duration
		});

		return response;
	});
};

export const handleError: HandleServerError = async ({ error, event, status, message }) => {
	const path = event?.url?.pathname ?? 'unknown';

	logger.error('unhandled error', {
		path,
		status,
		message,
		error_type: error instanceof Error ? error.constructor.name : typeof error,
		stack: error instanceof Error ? error.stack : undefined
	});

	return { message: 'Internal error' };
};
