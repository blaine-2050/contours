import { AsyncLocalStorage } from 'async_hooks';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3
};

interface LogContext {
	correlationId?: string;
	requestId?: string;
	path?: string;
	method?: string;
	[key: string]: unknown;
}

// AsyncLocalStorage for request context propagation
const asyncStorage = new AsyncLocalStorage<LogContext>();

function getConfiguredLevel(): number {
	const env = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
	return LEVELS[env ?? 'info'] ?? LEVELS.info;
}

let threshold = getConfiguredLevel();

function generateCorrelationId(): string {
	return `${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 9)}`;
}

function emit(level: LogLevel, message: string, meta?: Record<string, unknown>) {
	if (LEVELS[level] < threshold) return;

	// Get context from AsyncLocalStorage if available
	const context = asyncStorage.getStore() ?? {};

	const entry: Record<string, unknown> = {
		timestamp: new Date().toISOString(),
		level,
		msg: message,
		...context,
		...meta
	};

	// Remove undefined values
	Object.keys(entry).forEach(key => {
		if (entry[key] === undefined) {
			delete entry[key];
		}
	});

	const line = JSON.stringify(entry);

	if (level === 'error') {
		console.error(line);
	} else if (level === 'warn') {
		console.warn(line);
	} else {
		console.log(line);
	}
}

export const logger = {
	debug: (msg: string, meta?: Record<string, unknown>) => emit('debug', msg, meta),
	info: (msg: string, meta?: Record<string, unknown>) => emit('info', msg, meta),
	warn: (msg: string, meta?: Record<string, unknown>) => emit('warn', msg, meta),
	error: (msg: string, meta?: Record<string, unknown>) => emit('error', msg, meta),

	/** Reload threshold from env (useful after env changes in tests) */
	reload: () => {
		threshold = getConfiguredLevel();
	},

	/** Get current log level threshold */
	getLevel: (): LogLevel => {
		const current = Object.entries(LEVELS).find(([, val]) => val === threshold);
		return (current?.[0] as LogLevel) ?? 'info';
	},

	/** Run a function within a request context */
	withContext: <T>(context: LogContext, fn: () => T): T => {
		const correlationId = context.correlationId ?? generateCorrelationId();
		return asyncStorage.run({ ...context, correlationId }, fn);
	},

	/** Get current context (useful for passing to external services) */
	getContext: (): LogContext | undefined => {
		return asyncStorage.getStore();
	}
};

// Export types for consumers
export type { LogLevel, LogContext };
