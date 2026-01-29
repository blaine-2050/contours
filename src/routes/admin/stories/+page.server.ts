import { createStory } from '$lib/server/stories';
import { redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const formData = await request.formData();
		const title = formData.get('title') as string;
		const date = formData.get('date') as string;
		const time = formData.get('time') as string | null;
		const content = formData.get('content') as string;
		const author = (formData.get('author') as string) || 'Blaine';
		const summary = formData.get('summary') as string | null;

		if (!title || !date || !content) {
			return { error: 'Title, date, and content are required' };
		}

		const slug = await createStory({
			title,
			date,
			time: time || undefined,
			content,
			author,
			summary: summary || undefined
		});

		throw redirect(303, `/stories/${slug}`);
	}
};
