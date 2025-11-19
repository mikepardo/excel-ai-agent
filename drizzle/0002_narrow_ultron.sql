CREATE TABLE `comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`userId` int NOT NULL,
	`cellRef` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`parentId` int,
	`resolved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comments_id` PRIMARY KEY(`id`)
);
