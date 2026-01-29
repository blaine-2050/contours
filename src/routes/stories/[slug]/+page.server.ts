import { getStoryBySlug } from '$lib/server/stories';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const story = getStoryBySlug(params.slug);

	if (!story) {
		throw error(404, 'Story not found');
	}

	return { story };
};
