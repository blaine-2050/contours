ALTER TABLE `contours_categories` ADD `updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `contours_images` ADD `updated_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `contours_post_categories` ADD `created_at` datetime DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_categories_name` ON `contours_categories` (`name`);--> statement-breakpoint
CREATE INDEX `idx_posts_date` ON `contours_posts` (`date`);--> statement-breakpoint
CREATE INDEX `idx_posts_slug` ON `contours_posts` (`slug`);