/**
 * Format a date string (YYYY-MM-DD) to "Thu Jan 08 2026" format in GMT
 */
export function formatDateGMT(dateStr: string): string {
	const date = new Date(dateStr + 'T00:00:00Z');
	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		year: 'numeric',
		month: 'short',
		day: '2-digit',
		timeZone: 'UTC',
	});
}

/**
 * Format date and optional time to "Thu Jan 08 2026 14:30 GMT" format
 */
export function formatDateTimeGMT(dateStr: string, timeStr?: string): string {
	const formattedDate = formatDateGMT(dateStr);
	if (timeStr) {
		return `${formattedDate} ${timeStr} GMT`;
	}
	return formattedDate;
}
