import { describe, it, expect } from 'vitest';
import { formatDateGMT, formatDateTimeGMT } from '../../src/lib/utils/date.js';

describe('Date Utilities', () => {
	describe('formatDateGMT', () => {
		it('formats date string to GMT format', () => {
			const result = formatDateGMT('2026-01-08');
			expect(result).toBe('Thu, Jan 08, 2026');
		});

		it('formats different dates correctly', () => {
			expect(formatDateGMT('2026-12-25')).toBe('Fri, Dec 25, 2026');
			expect(formatDateGMT('2026-07-04')).toBe('Sat, Jul 04, 2026');
			expect(formatDateGMT('2026-02-28')).toBe('Sat, Feb 28, 2026');
		});

		it('handles leap year dates', () => {
			expect(formatDateGMT('2024-02-29')).toBe('Thu, Feb 29, 2024');
		});

		it('formats year boundary dates', () => {
			expect(formatDateGMT('2026-01-01')).toBe('Thu, Jan 01, 2026');
			expect(formatDateGMT('2025-12-31')).toBe('Wed, Dec 31, 2025');
		});
	});

	describe('formatDateTimeGMT', () => {
		it('formats date without time', () => {
			const result = formatDateTimeGMT('2026-01-08');
			expect(result).toBe('Thu, Jan 08, 2026');
		});

		it('formats date with time', () => {
			const result = formatDateTimeGMT('2026-01-08', '14:30');
			expect(result).toBe('Thu, Jan 08, 2026 14:30 GMT');
		});

		it('formats midnight time correctly', () => {
			const result = formatDateTimeGMT('2026-01-08', '00:00');
			expect(result).toBe('Thu, Jan 08, 2026 00:00 GMT');
		});

		it('formats late night time correctly', () => {
			const result = formatDateTimeGMT('2026-01-08', '23:59');
			expect(result).toBe('Thu, Jan 08, 2026 23:59 GMT');
		});

		it('formats various times correctly', () => {
			expect(formatDateTimeGMT('2026-06-15', '09:00')).toBe('Mon, Jun 15, 2026 09:00 GMT');
			expect(formatDateTimeGMT('2026-06-15', '12:00')).toBe('Mon, Jun 15, 2026 12:00 GMT');
			expect(formatDateTimeGMT('2026-06-15', '18:45')).toBe('Mon, Jun 15, 2026 18:45 GMT');
		});

		it('handles empty string time as no time', () => {
			const result = formatDateTimeGMT('2026-01-08', '');
			expect(result).toBe('Thu, Jan 08, 2026');
		});

		it('handles undefined time as no time', () => {
			const result = formatDateTimeGMT('2026-01-08', undefined);
			expect(result).toBe('Thu, Jan 08, 2026');
		});
	});
});
