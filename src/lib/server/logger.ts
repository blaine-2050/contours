type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVELS: Record<LogLevel, number> = {
	debug: 0,
	info: 1,
	warn: 2,
	error: 3,
};

function getConfiguredLevel(): number {
	const env = process.env.LOG_LEVEL?.toLowerCase() as LogLevel | undefined;
	return LEVELS[env ?? 'info'] ?? LEVELS.info;
}

let threshold = getConfiguredLevel();

function emit(level: LogLevel, message: string, data?: Record<string, unknown>) {
	if (LEVELS[level] < threshold) return;

	const entry = {
		ts: new Date().toISOString(),
		level,
		msg: message,
		...data,
	};

	const line = JSON.stringify(entry);

	if (level === 'error') {
		console.error(line);
	} else {
		console.log(line);
	}
}

export const logger = {
	debug: (msg: string, data?: Record<string, unknown>) => emit('debug', msg, data),
	info: (msg: string, data?: Record<string, unknown>) => emit('info', msg, data),
	warn: (msg: string, data?: Record<string, unknown>) => emit('warn', msg, data),
	error: (msg: string, data?: Record<string, unknown>) => emit('error', msg, data),

	/** Reload threshold from env (useful after env changes in tests) */
	reload: () => {
		threshold = getConfiguredLevel();
	},
};
