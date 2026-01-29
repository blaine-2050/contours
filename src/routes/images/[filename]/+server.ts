import { error } from '@sveltejs/kit';
import fs from 'fs';
import path from 'path';
import type { RequestHandler } from './$types';

const imagesDirectory = path.join(process.cwd(), 'posts', 'images');

const mimeTypes: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml'
};

export const GET: RequestHandler = async ({ params }) => {
	const { filename } = params;
	const filePath = path.join(imagesDirectory, filename);

	// Security: prevent directory traversal
	if (!filePath.startsWith(imagesDirectory)) {
		throw error(403, 'Forbidden');
	}

	if (!fs.existsSync(filePath)) {
		throw error(404, 'Image not found');
	}

	const ext = path.extname(filename).toLowerCase();
	const contentType = mimeTypes[ext] || 'application/octet-stream';

	const fileBuffer = fs.readFileSync(filePath);

	return new Response(fileBuffer, {
		headers: {
			'Content-Type': contentType,
			'Cache-Control': 'public, max-age=31536000'
		}
	});
};
