import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Spreadsheet files uploaded by users
 */
export const spreadsheets = mysqlTable("spreadsheets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  originalFileName: varchar("originalFileName", { length: 255 }),
  fileKey: text("fileKey").notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // xlsx, xlsm, csv
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Spreadsheet = typeof spreadsheets.$inferSelect;
export type InsertSpreadsheet = typeof spreadsheets.$inferInsert;

/**
 * Checkpoints for spreadsheet versions (auto-saved after AI actions)
 */
export const checkpoints = mysqlTable("checkpoints", {
  id: int("id").autoincrement().primaryKey(),
  spreadsheetId: int("spreadsheetId").notNull(),
  userId: int("userId").notNull(),
  fileKey: text("fileKey").notNull(),
  fileUrl: text("fileUrl").notNull(),
  description: text("description"), // What changed in this checkpoint
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Checkpoint = typeof checkpoints.$inferSelect;
export type InsertCheckpoint = typeof checkpoints.$inferInsert;

export const comments = mysqlTable('comments', {
  id: int('id').autoincrement().primaryKey(),
  spreadsheetId: int('spreadsheetId').notNull(),
  userId: int('userId').notNull(),
  cellRef: varchar('cellRef', { length: 20 }).notNull(), // e.g., "A1", "B5"
  content: text('content').notNull(),
  parentId: int('parentId'), // For threaded replies
  resolved: int('resolved').default(0).notNull(), // 0 = unresolved, 1 = resolved
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;

export const macros = mysqlTable('macros', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  actions: text('actions').notNull(), // JSON string of recorded actions
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Macro = typeof macros.$inferSelect;
export type InsertMacro = typeof macros.$inferInsert;

/**
 * Chat messages between user and AI
 */
export const chatMessages = mysqlTable("chatMessages", {
  id: int("id").autoincrement().primaryKey(),
  spreadsheetId: int("spreadsheetId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant", "system"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;