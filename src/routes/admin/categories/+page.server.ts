import { getAdapter } from '$lib/server/persistence';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = await getAdapter().getCategories();
	return { categories };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;

		if (!name || !name.trim()) {
			return { error: 'Category name is required' };
		}

		await getAdapter().addCategory(name.trim());
		return { success: true };
	},

	remove: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return { error: 'Category ID is required' };
		}

		await getAdapter().removeCategory(id);
		return { success: true };
	},
};
