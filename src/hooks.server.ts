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

// Security headers configuration
const SECURITY_HEADERS = {
	// Prevent clickjacking attacks
	'X-Frame-Options': 'DENY',
	// Prevent MIME type sniffing
	'X-Content-Type-Options': 'nosniff',
	// Control referrer information
	'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Content Security Policy directives
const CSP_DIRECTIVES = {
	'default-src': ["'self'"],
	'script-src': ["'self'"],
	'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
	'font-src': ["'self'", 'https://fonts.gstatic.com'],
	'img-src': ["'self'", 'data:', 'blob:'],
	'connect-src': ["'self'"],
	'frame-ancestors': ["'none'"],
	'base-uri': ["'self'"],
	'form-action': ["'self'"]
};

// Build CSP header string from directives
function buildCSP(): string {
	return Object.entries(CSP_DIRECTIVES)
		.map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
		.join('; ');
}

function addSecurityHeaders(response: Response): void {
	for (const [header, value] of Object.entries(SECURITY_HEADERS)) {
		response.headers.set(header, value);
	}
	response.headers.set('Content-Security-Policy', buildCSP());
}

export const handle: Handle = async ({ event, resolve }) => {
	const { method, url } = event.request;
	const path = new URL(url).pathname;

	// Skip logging for static assets
	if (path.startsWith('/_app/') || path.startsWith('/favicon')) {
		const response = await resolve(event);
		addSecurityHeaders(response);
		return response;
	}

	// Run request handling within a logging context with correlation ID
	return logger.withContext({ method, path }, async () => {
		const start = performance.now();
		const response = await resolve(event);
		const duration = Math.round(performance.now() - start);

		// Add security headers to all responses
		addSecurityHeaders(response);

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
