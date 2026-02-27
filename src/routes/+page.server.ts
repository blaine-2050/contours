import { getAdapter } from '$lib/server/persistence';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const posts = await getAdapter().getAllPosts();
	return { posts };
};
