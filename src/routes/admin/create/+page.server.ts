import { getAdapter } from '$lib/server/persistence';
import { redirect, fail } from '@sveltejs/kit';
import { validatePost } from '$lib/validation/post';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = await getAdapter().getCategories();
	return { categories };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const imageFile = formData.get('image') as File | null;

		// Validate form data using Zod schema
		const validation = validatePost(formData);
		if (!validation.success) {
			return fail(400, {
				error: 'Please fix the validation errors below',
				errors: validation.errors,
				data: Object.fromEntries(formData),
			});
		}

		const data = validation.data;

		// Generate slug first for image naming
		const slug = data.title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		const adapter = getAdapter();

		// Save image if provided
		let imageName: string | undefined;
		if (imageFile && imageFile.size > 0) {
			imageName = await adapter.savePostImage(imageFile, slug);
		}

		await adapter.createPost({
			title: data.title,
			date: data.date,
			time: data.time,
			content: data.content,
			author: data.author,
			categories: data.categories,
			image: imageName,
		});
		throw redirect(303, `/posts/${slug}`);
	},
};
