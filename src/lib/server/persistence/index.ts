import { FileAdapter } from './file-adapter.js';
import type { PersistenceAdapter } from './types.js';
import { logger } from '../logger.js';

export type { PersistenceAdapter, CreatePostData, CreateStoryData, ImageData } from './types.js';
export type { Post, PostMeta, Category, Story, StoryMeta, SearchResult } from './models.js';
export { FileAdapter } from './file-adapter.js';

let _adapter: PersistenceAdapter | null = null;
let _adapterPromise: Promise<PersistenceAdapter> | null = null;

export function getAdapter(): PersistenceAdapter {
	if (_adapter) return _adapter;

	// Default to file adapter (synchronous, always available)
	_adapter = new FileAdapter();
	return _adapter;
}

export async function initAdapter(): Promise<PersistenceAdapter> {
	if (_adapter) return _adapter;
	if (_adapterPromise) return _adapterPromise;

	const mode = process.env.PERSISTENCE || 'file';
	logger.info('selecting persistence adapter', { mode });

	if (mode === 'mysql') {
		_adapterPromise = import('./mysql-adapter.js').then(({ MysqlAdapter }) => {
			_adapter = new MysqlAdapter(process.env.DATABASE_URL!);
			logger.info('mysql adapter initialized');
			return _adapter;
		});
		return _adapterPromise;
	}

	_adapter = new FileAdapter();
	logger.info('file adapter initialized');
	return _adapter;
}
