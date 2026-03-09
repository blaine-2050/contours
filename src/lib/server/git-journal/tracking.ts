/**
 * Tracking Module
 * Prevents duplicate journal post generation by tracking processed weeks per repo
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import type { RepoTrackingData } from './types';

const TRACKING_DIR = join(process.cwd(), 'data', 'journal-tracking');

/**
 * Load tracking data for a repo
 * @param repo - Repo name (used as filename, e.g., "contours")
 * @returns Tracking data, or default if file doesn't exist
 */
export async function loadTracking(repo: string): Promise<RepoTrackingData> {
	const filepath = join(TRACKING_DIR, `${repo}.json`);

	try {
		const raw = await readFile(filepath, 'utf-8');
		return JSON.parse(raw) as RepoTrackingData;
	} catch {
		// File doesn't exist or is invalid — return default
		return {
			repo,
			processedWeeks: [],
			lastChecked: ''
		};
	}
}

/**
 * Save tracking data for a repo
 * @param repo - Repo name
 * @param data - Tracking data to save
 */
export async function saveTracking(repo: string, data: RepoTrackingData): Promise<void> {
	await mkdir(TRACKING_DIR, { recursive: true });
	const filepath = join(TRACKING_DIR, `${repo}.json`);
	await writeFile(filepath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
}

/**
 * Check if a week has already been processed
 * @param data - Tracking data
 * @param weekStart - Monday date (YYYY-MM-DD)
 * @returns True if already processed
 */
export function isWeekProcessed(data: RepoTrackingData, weekStart: string): boolean {
	return data.processedWeeks.includes(weekStart);
}

/**
 * Mark a week as processed and return updated tracking data
 * @param data - Current tracking data
 * @param weekStart - Monday date to mark (YYYY-MM-DD)
 * @returns New tracking data with the week added in sorted position
 */
export function markWeekProcessed(data: RepoTrackingData, weekStart: string): RepoTrackingData {
	if (data.processedWeeks.includes(weekStart)) return data;

	const weeks = [...data.processedWeeks, weekStart].sort();
	return {
		...data,
		processedWeeks: weeks
	};
}
