CREATE TABLE `conditionalFormats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`cellRange` varchar(100) NOT NULL,
	`ruleType` varchar(50) NOT NULL,
	`config` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conditionalFormats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `namedRanges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`cellRange` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `namedRanges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `validationRules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`cellRange` varchar(100) NOT NULL,
	`validationType` varchar(50) NOT NULL,
	`config` text NOT NULL,
	`errorMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `validationRules_id` PRIMARY KEY(`id`)
);
