import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	// Admin routes are only available in development mode.
	// In production, return 404 so the routes are invisible.
	if (!dev) {
		throw error(404, 'Not found');
	}

	return {
		isAuthenticated: true,
		isProduction: false
	};
};
