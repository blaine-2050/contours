import { getAdapter } from '$lib/server/persistence';
import { redirect, fail, error } from '@sveltejs/kit';
import { validatePost } from '$lib/validation/post';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const adapter = getAdapter();
	const post = await adapter.getPostBySlug(params.slug);

	if (!post) {
		throw error(404, 'Post not found');
	}

	const categories = await adapter.getCategories();
	return { post, categories };
};

export const actions: Actions = {
	default: async ({ request, params }) => {
		const formData = await request.formData();
		const imageFile = formData.get('image') as File | null;
		const technical = formData.get('technical') === 'on';

		const validation = validatePost(formData);
		if (!validation.success) {
			return fail(400, {
				error: 'Please fix the validation errors below',
				errors: validation.errors,
				data: Object.fromEntries(formData),
			});
		}

		const data = validation.data;
		const adapter = getAdapter();

		// Get existing post to preserve image if not replaced
		const existing = await adapter.getPostBySlug(params.slug);
		let imageName = existing?.image;

		// Save new image if provided
		if (imageFile && imageFile.size > 0) {
			imageName = await adapter.savePostImage(imageFile, params.slug);
		}

		await adapter.updatePost(params.slug, {
			title: data.title,
			date: data.date,
			time: data.time,
			content: data.content,
			author: data.author,
			categories: data.categories,
			image: imageName,
			technical,
		});

		throw redirect(303, `/posts/${params.slug}`);
	},
};
