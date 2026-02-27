import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const hasDbUrl = !!process.env.RAILWAY_DB_URL;
	return { hasDbUrl };
};
