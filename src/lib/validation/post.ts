import { z } from 'zod';

/**
 * Post validation schema
 * Used for validating post creation form data
 */
export const postSchema = z.object({
	title: z.string().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
	time: z
		.string()
		.regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format (24-hour)')
		.optional()
		.or(z.literal('')),
	content: z
		.string()
		.min(1, 'Content is required')
		.max(50000, 'Content must be 50,000 characters or less'),
	author: z.string().default('Blaine'),
	categories: z.array(z.string()).default([]),
});

/**
 * Type inferred from postSchema
 */
export type PostInput = z.infer<typeof postSchema>;

/**
 * Validate post form data and return formatted errors
 * @param formData - The FormData from the request
 * @returns Object with either data or errors
 */
export function validatePost(
	formData: FormData
): { success: true; data: PostInput } | { success: false; errors: Record<string, string> } {
	const rawData = {
		title: formData.get('title') as string,
		date: formData.get('date') as string,
		time: (formData.get('time') as string) || undefined,
		content: formData.get('content') as string,
		author: (formData.get('author') as string) || 'Blaine',
		categories: formData.getAll('categories') as string[],
	};

	const result = postSchema.safeParse(rawData);

	if (result.success) {
		return { success: true, data: result.data };
	}

	// Format errors into a simple record
	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const field = issue.path[0] as string;
		if (!errors[field]) {
			errors[field] = issue.message;
		}
	}

	return { success: false, errors };
}
