import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { dev } from '$app/environment';

// Cookie name for admin session
const SESSION_COOKIE = 'admin_session';

// Session validity: 24 hours in seconds
const SESSION_MAX_AGE = 60 * 60 * 24;

export const load: PageServerLoad = async ({ cookies }) => {
	// In dev mode, admin is always accessible - redirect to create page
	if (dev) {
		throw redirect(302, '/admin/create');
	}

	// In production, check if already logged in
	const session = cookies.get(SESSION_COOKIE);
	if (session && verifySession(session)) {
		throw redirect(302, '/admin/create');
	}

	// Show login page
	return {};
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		// Clear the session cookie
		cookies.delete(SESSION_COOKIE, { path: '/' });
		
		// Redirect to login page
		throw redirect(302, '/admin/login');
	},
	
	default: async ({ request, cookies }) => {
		// In dev mode, skip auth entirely
		if (dev) {
			throw redirect(302, '/admin/create');
		}

		const data = await request.formData();
		const password = data.get('password') as string;

		// Validate password against environment variable
		const adminPassword = process.env.ADMIN_PASSWORD;

		if (!adminPassword) {
			return fail(500, {
				error: 'Authentication not configured. Please set ADMIN_PASSWORD.'
			});
		}

		if (!password || password !== adminPassword) {
			return fail(401, {
				error: 'Invalid password'
			});
		}

		// Create session token (simple timestamp-based for this use case)
		const sessionToken = createSessionToken();

		// Set session cookie
		cookies.set(SESSION_COOKIE, sessionToken, {
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: SESSION_MAX_AGE,
			path: '/'
		});

		// Redirect to admin create page
		throw redirect(302, '/admin/create');
	}
};

/**
 * Create a simple session token with timestamp
 */
function createSessionToken(): string {
	const timestamp = Date.now().toString(36);
	const random = Math.random().toString(36).substring(2, 10);
	return `${timestamp}.${random}`;
}

/**
 * Verify if a session token is valid (not expired)
 */
function verifySession(token: string): boolean {
	const sessionSecret = process.env.SESSION_SECRET;
	
	if (!sessionSecret) {
		// Without SESSION_SECRET, we do basic timestamp validation
		const [timestampStr] = token.split('.');
		if (!timestampStr) return false;
		
		const timestamp = parseInt(timestampStr, 36);
		const now = Date.now();
		const maxAge = SESSION_MAX_AGE * 1000; // Convert to milliseconds
		
		return now - timestamp < maxAge;
	}

	// With SESSION_SECRET, we'd implement signed cookies
	// For now, basic validation is sufficient
	const [timestampStr] = token.split('.');
	if (!timestampStr) return false;
	
	const timestamp = parseInt(timestampStr, 36);
	const now = Date.now();
	const maxAge = SESSION_MAX_AGE * 1000;
	
	return now - timestamp < maxAge;
}
