import { initAdapter } from '$lib/server/persistence';

// Initialize the persistence adapter at server startup.
// For PERSISTENCE=mysql, this dynamically imports the MySQL adapter.
// For PERSISTENCE=file (default), this is a no-op.
await initAdapter();
