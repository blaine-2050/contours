import { getAdapter } from '$lib/server/persistence';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const stories = await getAdapter().getAllStories();
	return { stories };
};
