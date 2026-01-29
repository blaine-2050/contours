import { getAllStories } from '$lib/server/stories';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const stories = getAllStories();
	return { stories };
};
