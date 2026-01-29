import { createPost, savePostImage } from '$lib/server/posts';
import { getCategories } from '$lib/server/categories';
import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const categories = getCategories();
	return { categories };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string | null;
		const content = formData.get('content') as string;
		const author = (formData.get('author') as string) || 'Blaine';
		const categories = formData.getAll('categories') as string[];
		const imageFile = formData.get('image') as File | null;

		if (!title || !date || !content) {
			return { error: 'Title, date, and content are required' };
		}

		// Generate slug first for image naming
		const slug = title
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');

		// Save image if provided
		let imageName: string | undefined;
		if (imageFile && imageFile.size > 0) {
			imageName = await savePostImage(imageFile, slug);
		}

		await createPost({
			title,
			date,
			time: time || undefined,
			content,
			author,
			categories,
			image: imageName
		});
		throw redirect(303, `/posts/${slug}`);
	}
};
