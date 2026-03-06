import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import type { LayoutServerLoad } from './$types';

// Cookie name for admin session
const SESSION_COOKIE = 'admin_session';

// Session validity: 24 hours in milliseconds
const SESSION_MAX_AGE = 60 * 60 * 24 * 1000;

export const load: LayoutServerLoad = async ({ cookies, url }) => {
	// In development mode, skip authentication entirely for convenience
	if (dev) {
		return {
			isAuthenticated: true,
			isProduction: false
		};
	}

	// In production, check for valid session
	if (process.env.NODE_ENV === 'production') {
		const session = cookies.get(SESSION_COOKIE);
		
		// Check if we're already on the login page to avoid redirect loop
		const isLoginPage = url.pathname === '/admin/login';
		
		if (!session || !verifySession(session)) {
			// No valid session - redirect to login (unless already there)
			if (!isLoginPage) {
				throw redirect(302, '/admin/login');
			}
		} else {
			// Valid session exists - if on login page, redirect to create
			if (isLoginPage) {
				throw redirect(302, '/admin/create');
			}
		}
		
		return {
			isAuthenticated: true,
			isProduction: true
		};
	}

	// For any other environment configuration, allow access
	return {
		isAuthenticated: true,
		isProduction: false
	};
};

/**
 * Verify if a session token is valid (not expired)
 */
function verifySession(token: string): boolean {
	const [timestampStr] = token.split('.');
	if (!timestampStr) return false;
	
	const timestamp = parseInt(timestampStr, 36);
	const now = Date.now();
	const maxAge = SESSION_MAX_AGE;
	
	return now - timestamp < maxAge;
}
