import { json } from '@sveltejs/kit';
import { getAdapter } from '$lib/server/persistence';
import { version } from '../../../package.json';

export const GET = async () => {
	const adapter = getAdapter();
	const timestamp = new Date().toISOString();

	try {
		// Quick DB connectivity check - getAllPosts is lightweight
		await adapter.getAllPosts();

		return json({
			status: 'ok',
			timestamp,
			version: version || '0.0.1',
		});
	} catch (_error) {
		return json(
			{
				status: 'error',
				timestamp,
				version: version || '0.0.1',
				message: 'Database connectivity check failed',
			},
			{ status: 503 }
		);
	}
};
