import { getAdapter } from '$lib/server/persistence';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const adapter = getAdapter();
	const categories = await adapter.getCategories();
	const category = categories.find((c) => c.id === params.id);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const posts = await adapter.getPostsByCategory(params.id);

	return {
		category,
		posts
	};
};
