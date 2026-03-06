import { error } from '@sveltejs/kit';
import { getAdapter } from '$lib/server/persistence';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;
	const image = await getAdapter().getImage(filename);

	if (!image) {
		throw error(404, 'Image not found');
	}

	return new Response(new Uint8Array(image.data), {
		headers: {
			'Content-Type': image.mimeType,
			'Cache-Control': 'public, max-age=31536000',
		},
	});
};
