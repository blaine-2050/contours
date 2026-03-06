import {
	mysqlTable,
	varchar,
	text,
	datetime,
	uniqueIndex,
	int,
	customType,
} from 'drizzle-orm/mysql-core';
import { sql } from 'drizzle-orm';

const mediumblob = customType<{ data: Buffer; driverData: Buffer }>({
	dataType() {
		return 'mediumblob';
	},
});

export const contoursPosts = mysqlTable('contours_posts', {
	id: int('id').primaryKey().autoincrement(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 500 }).notNull(),
	date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
	time: varchar('time', { length: 5 }), // HH:MM
	author: varchar('author', { length: 255 }).notNull().default('Blaine'),
	image: varchar('image', { length: 500 }),
	content: text('content').notNull(),
	contentHash: varchar('content_hash', { length: 64 }).notNull(), // SHA-256 hex
	createdAt: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: datetime('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const contoursPostCategories = mysqlTable(
	'contours_post_categories',
	{
		id: int('id').primaryKey().autoincrement(),
		postSlug: varchar('post_slug', { length: 255 }).notNull(),
		categoryId: varchar('category_id', { length: 255 }).notNull(),
	},
	(table) => [uniqueIndex('post_category_unique').on(table.postSlug, table.categoryId)]
);

export const contoursCategories = mysqlTable('contours_categories', {
	id: varchar('id', { length: 255 }).primaryKey(),
	name: varchar('name', { length: 500 }).notNull(),
	createdAt: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const contoursStories = mysqlTable('contours_stories', {
	id: int('id').primaryKey().autoincrement(),
	slug: varchar('slug', { length: 255 }).notNull().unique(),
	title: varchar('title', { length: 500 }).notNull(),
	date: varchar('date', { length: 10 }).notNull(),
	time: varchar('time', { length: 5 }),
	author: varchar('author', { length: 255 }).notNull().default('Blaine'),
	summary: text('summary'),
	content: text('content').notNull(),
	contentHash: varchar('content_hash', { length: 64 }).notNull(),
	createdAt: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
	updatedAt: datetime('updated_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});

export const contoursImages = mysqlTable('contours_images', {
	id: int('id').primaryKey().autoincrement(),
	filename: varchar('filename', { length: 500 }).notNull().unique(),
	mimeType: varchar('mime_type', { length: 100 }).notNull(),
	data: mediumblob('data').notNull(),
	createdAt: datetime('created_at')
		.default(sql`CURRENT_TIMESTAMP`)
		.notNull(),
});
