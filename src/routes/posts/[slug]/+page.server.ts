import { getAdapter } from '$lib/server/persistence';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const post = await getAdapter().getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	return { post };
};
