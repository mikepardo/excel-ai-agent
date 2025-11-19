import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, comments, InsertComment, spreadsheets, InsertSpreadsheet, checkpoints, InsertCheckpoint, chatMessages, InsertChatMessage, macros, InsertMacro } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Spreadsheet queries
export async function createSpreadsheet(data: InsertSpreadsheet) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(spreadsheets).values(data);
  return result[0].insertId;
}

export async function getUserSpreadsheets(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(spreadsheets).where(eq(spreadsheets.userId, userId)).orderBy(desc(spreadsheets.updatedAt));
}

export async function getSpreadsheetById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(spreadsheets).where(eq(spreadsheets.id, id)).limit(1);
  return result[0];
}

export async function updateSpreadsheet(id: number, data: Partial<InsertSpreadsheet>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(spreadsheets).set(data).where(eq(spreadsheets.id, id));
}

export async function deleteSpreadsheet(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(spreadsheets).where(eq(spreadsheets.id, id));
}

// Checkpoint queries
export async function createCheckpoint(data: InsertCheckpoint) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(checkpoints).values(data);
  return result[0].insertId;
}

export async function getSpreadsheetCheckpoints(spreadsheetId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(checkpoints).where(eq(checkpoints.spreadsheetId, spreadsheetId)).orderBy(desc(checkpoints.createdAt));
}

export async function getCheckpointById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(checkpoints).where(eq(checkpoints.id, id)).limit(1);
  return result[0];
}

// Chat message queries
export async function createChatMessage(data: InsertChatMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(chatMessages).values(data);
  return result[0].insertId;
}

export async function getSpreadsheetMessages(spreadsheetId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(chatMessages).where(eq(chatMessages.spreadsheetId, spreadsheetId)).orderBy(chatMessages.createdAt);
}

export async function deleteChatMessages(spreadsheetId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(chatMessages).where(eq(chatMessages.spreadsheetId, spreadsheetId));
}

// Comment operations
export async function createComment(comment: InsertComment) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(comments).values(comment);
  return result[0].insertId;
}

export async function getCommentsBySpreadsheet(spreadsheetId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(comments).where(eq(comments.spreadsheetId, spreadsheetId));
}

export async function getCommentsByCell(spreadsheetId: number, cellRef: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(comments)
    .where(and(eq(comments.spreadsheetId, spreadsheetId), eq(comments.cellRef, cellRef)));
}

export async function updateComment(id: number, content: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(comments).set({ content }).where(eq(comments.id, id));
}

export async function resolveComment(id: number, resolved: boolean) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(comments).set({ resolved: resolved ? 1 : 0 }).where(eq(comments.id, id));
}

export async function deleteComment(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.delete(comments).where(eq(comments.id, id));
}

// Macro operations
export async function createMacro(macro: InsertMacro) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(macros).values(macro);
  return result[0].insertId;
}

export async function getUserMacros(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(macros).where(eq(macros.userId, userId));
}

export async function getMacroById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(macros).where(eq(macros.id, id)).limit(1);
  return result[0];
}

export async function updateMacro(id: number, data: Partial<InsertMacro>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.update(macros).set(data).where(eq(macros.id, id));
}

export async function deleteMacro(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  await db.delete(macros).where(eq(macros.id, id));
}
