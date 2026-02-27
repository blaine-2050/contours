import { getAdapter } from '$lib/server/persistence';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const story = await getAdapter().getStoryBySlug(params.slug);

	if (!story) {
		throw error(404, 'Story not found');
	}

	return { story };
};
