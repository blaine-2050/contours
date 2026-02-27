import { getAdapter } from '$lib/server/persistence';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const results = query ? await getAdapter().searchPosts(query) : [];

	return {
		query,
		results
	};
};
