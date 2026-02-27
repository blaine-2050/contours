CREATE TABLE `contours_categories` (
	`id` varchar(255) NOT NULL,
	`name` varchar(500) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contours_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contours_images` (
	`id` int AUTO_INCREMENT NOT NULL,
	`filename` varchar(500) NOT NULL,
	`mime_type` varchar(100) NOT NULL,
	`data` mediumblob NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contours_images_id` PRIMARY KEY(`id`),
	CONSTRAINT `contours_images_filename_unique` UNIQUE(`filename`)
);
--> statement-breakpoint
CREATE TABLE `contours_post_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`post_slug` varchar(255) NOT NULL,
	`category_id` varchar(255) NOT NULL,
	CONSTRAINT `contours_post_categories_id` PRIMARY KEY(`id`),
	CONSTRAINT `post_category_unique` UNIQUE(`post_slug`,`category_id`)
);
--> statement-breakpoint
CREATE TABLE `contours_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`date` varchar(10) NOT NULL,
	`time` varchar(5),
	`author` varchar(255) NOT NULL DEFAULT 'Blaine',
	`image` varchar(500),
	`content` text NOT NULL,
	`content_hash` varchar(64) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contours_posts_id` PRIMARY KEY(`id`),
	CONSTRAINT `contours_posts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `contours_stories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(255) NOT NULL,
	`title` varchar(500) NOT NULL,
	`date` varchar(10) NOT NULL,
	`time` varchar(5),
	`author` varchar(255) NOT NULL DEFAULT 'Blaine',
	`summary` text,
	`content` text NOT NULL,
	`content_hash` varchar(64) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `contours_stories_id` PRIMARY KEY(`id`),
	CONSTRAINT `contours_stories_slug_unique` UNIQUE(`slug`)
);
