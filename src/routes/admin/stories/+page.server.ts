import { getAdapter } from '$lib/server/persistence';
import { redirect, fail } from '@sveltejs/kit';
import { validateStory } from '$lib/validation/story';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();

		// Validate form data using Zod schema
		const validation = validateStory(formData);
		if (!validation.success) {
			return fail(400, {
				error: 'Please fix the validation errors below',
				errors: validation.errors,
				data: Object.fromEntries(formData),
			});
		}

		const data = validation.data;

		const slug = await getAdapter().createStory({
			title: data.title,
			date: data.date,
			time: data.time,
			content: data.content,
			author: data.author,
			summary: data.summary,
		});

		throw redirect(303, `/stories/${slug}`);
	},
};
