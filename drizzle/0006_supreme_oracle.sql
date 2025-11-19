CREATE TABLE `annotations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`sheetId` int,
	`userId` int NOT NULL,
	`type` varchar(50) NOT NULL,
	`data` text NOT NULL,
	`layer` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `annotations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`data` text NOT NULL,
	`order` int NOT NULL DEFAULT 0,
	`visible` int NOT NULL DEFAULT 1,
	`protected` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sheets_id` PRIMARY KEY(`id`)
);
