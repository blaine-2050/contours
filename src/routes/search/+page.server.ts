import { searchPosts } from '$lib/server/search';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') || '';
	const results = query ? searchPosts(query) : [];

	return {
		query,
		results
	};
};
