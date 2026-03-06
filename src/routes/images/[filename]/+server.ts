import { error } from '@sveltejs/kit';
import { getAdapter } from '$lib/server/persistence';
import type { RequestHandler } from './$types';
import sharp from 'sharp';

const MAX_DIMENSION = 2000;
const CACHE_DURATION = 86400; // 1 day in seconds

interface ProcessOptions {
	width?: number;
	format?: 'webp' | 'original';
}

function parseOptions(url: URL): ProcessOptions {
	const options: ProcessOptions = {};

	// Parse width query param
	const widthParam = url.searchParams.get('w');
	if (widthParam) {
		const width = parseInt(widthParam, 10);
		if (!isNaN(width) && width > 0) {
			options.width = Math.min(width, MAX_DIMENSION);
		}
	}

	// Check for explicit format query param
	const formatParam = url.searchParams.get('format');
	if (formatParam === 'webp') {
		options.format = 'webp';
	}

	return options;
}

function shouldServeWebP(request: Request): boolean {
	// Check Accept header for WebP support
	const acceptHeader = request.headers.get('Accept') || '';
	return acceptHeader.includes('image/webp');
}

export const GET: RequestHandler = async ({ params, url, request }) => {
	const { filename } = params;
	const image = await getAdapter().getImage(filename);

	if (!image) {
		throw error(404, 'Image not found');
	}

	const options = parseOptions(url);
	const acceptWebP = shouldServeWebP(request);

	// Determine output format
	let outputFormat: 'webp' | 'original' = options.format || 'original';
	if (acceptWebP && !options.format) {
		// Auto-detect WebP support if no explicit format requested
		outputFormat = 'webp';
	}

	// Check if any processing is needed
	const needsProcessing = options.width || outputFormat === 'webp';

	if (!needsProcessing) {
		// Return original image with cache headers
		return new Response(new Uint8Array(image.data), {
			headers: {
				'Content-Type': image.mimeType,
				'Cache-Control': `public, max-age=${CACHE_DURATION}`,
			},
		});
	}

	try {
		// Process image with Sharp
		let sharpInstance = sharp(image.data);

		// Get original metadata
		const metadata = await sharpInstance.metadata();

		// Resize if width is specified
		if (options.width) {
			sharpInstance = sharpInstance.resize({
				width: options.width,
				height: undefined, // Maintain aspect ratio
				fit: 'inside',
				withoutEnlargement: true, // Don't upscale small images
			});
		}

		// Convert to WebP if requested
		if (outputFormat === 'webp') {
			sharpInstance = sharpInstance.webp({
				quality: 80,
				effort: 4, // Balance between speed and compression
			});
		}

		// Process the image
		const processedBuffer = await sharpInstance.toBuffer();

		// Determine content type
		const contentType = outputFormat === 'webp' ? 'image/webp' : image.mimeType;

		return new Response(new Uint8Array(processedBuffer), {
			headers: {
				'Content-Type': contentType,
				'Cache-Control': `public, max-age=${CACHE_DURATION}`,
				'Vary': 'Accept', // Cache varies based on Accept header
			},
		});
	} catch (err) {
		// Log error but fall back to original image
		console.error('Image processing failed:', err);

		// Return original image as fallback
		return new Response(new Uint8Array(image.data), {
			headers: {
				'Content-Type': image.mimeType,
				'Cache-Control': `public, max-age=${CACHE_DURATION}`,
			},
		});
	}
};
