CREATE TABLE `apiConnections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`config` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'active',
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `apiConnections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `dataSyncs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`spreadsheetId` int NOT NULL,
	`syncConfig` text NOT NULL,
	`status` varchar(50) NOT NULL DEFAULT 'pending',
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `dataSyncs_id` PRIMARY KEY(`id`)
);
