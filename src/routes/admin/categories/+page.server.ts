import { getAdapter } from '$lib/server/persistence';
import { fail } from '@sveltejs/kit';
import { validateCategory, validateCategoryId } from '$lib/validation/category';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = await getAdapter().getCategories();
	return { categories };
};

export const actions: Actions = {
	add: async ({ request }) => {
		const formData = await request.formData();

		// Validate category name using Zod schema
		const validation = validateCategory(formData);
		if (!validation.success) {
			return fail(400, {
				error: validation.errors.name,
				errors: validation.errors,
			});
		}

		await getAdapter().addCategory(validation.data.name);
		return { success: true };
	},

	remove: async ({ request }) => {
		const formData = await request.formData();

		// Validate category ID using Zod schema
		const validation = validateCategoryId(formData);
		if (!validation.success) {
			return fail(400, {
				error: validation.errors.id,
				errors: validation.errors,
			});
		}

		await getAdapter().removeCategory(validation.id);
		return { success: true };
	},
};
