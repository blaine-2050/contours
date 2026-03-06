import { z } from 'zod';

/**
 * Category validation schema
 * Used for validating category form data
 */
export const categorySchema = z.object({
	name: z
		.string()
		.min(1, 'Category name is required')
		.max(100, 'Category name must be 100 characters or less')
		.transform((val) => val.trim()),
});

/**
 * Category ID validation for removal
 */
export const categoryIdSchema = z.object({
	id: z.string().min(1, 'Category ID is required'),
});

/**
 * Type inferred from categorySchema
 */
export type CategoryInput = z.infer<typeof categorySchema>;

/**
 * Validate category name
 * @param formData - The FormData from the request
 * @returns Object with either data or errors
 */
export function validateCategory(
	formData: FormData
): { success: true; data: CategoryInput } | { success: false; errors: Record<string, string> } {
	const rawData = {
		name: formData.get('name') as string,
	};

	const result = categorySchema.safeParse(rawData);

	if (result.success) {
		return { success: true, data: result.data };
	}

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const field = issue.path[0] as string;
		if (!errors[field]) {
			errors[field] = issue.message;
		}
	}

	return { success: false, errors };
}

/**
 * Validate category ID for removal
 * @param formData - The FormData from the request
 * @returns Object with either id or errors
 */
export function validateCategoryId(
	formData: FormData
): { success: true; id: string } | { success: false; errors: Record<string, string> } {
	const rawData = {
		id: formData.get('id') as string,
	};

	const result = categoryIdSchema.safeParse(rawData);

	if (result.success) {
		return { success: true, id: result.data.id };
	}

	const errors: Record<string, string> = {};
	for (const issue of result.error.issues) {
		const field = issue.path[0] as string;
		if (!errors[field]) {
			errors[field] = issue.message;
		}
	}

	return { success: false, errors };
}
