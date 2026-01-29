import { getPostsByCategory } from '$lib/server/posts';
import { getCategories } from '$lib/server/categories';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const categories = getCategories();
	const category = categories.find((c) => c.id === params.id);

	if (!category) {
		throw error(404, 'Category not found');
	}

	const posts = getPostsByCategory(params.id);

	return {
		category,
		posts
	};
};
