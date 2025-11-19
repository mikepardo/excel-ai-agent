import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return ctx;
}

describe("spreadsheet operations", () => {
  it("should list user spreadsheets", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const spreadsheets = await caller.spreadsheet.list();
    
    expect(Array.isArray(spreadsheets)).toBe(true);
  });

  it("should create a new spreadsheet", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.spreadsheet.create({
      name: "Test Spreadsheet",
      fileKey: "test/file.xlsx",
      fileUrl: "https://example.com/test.xlsx",
      fileType: "xlsx",
      originalFileName: "test.xlsx",
    });

    expect(result).toHaveProperty("id");
    expect(typeof result.id).toBe("number");
  });

  it("should prevent unauthorized access to spreadsheets", async () => {
    const ctx1 = createAuthContext(1);
    const ctx2 = createAuthContext(2);
    const caller1 = appRouter.createCaller(ctx1);
    const caller2 = appRouter.createCaller(ctx2);

    // User 1 creates a spreadsheet
    const result = await caller1.spreadsheet.create({
      name: "Private Spreadsheet",
      fileKey: "user1/private.xlsx",
      fileUrl: "https://example.com/private.xlsx",
      fileType: "xlsx",
    });

    // User 2 should not be able to access it
    await expect(
      caller2.spreadsheet.get({ id: result.id })
    ).rejects.toThrow();
  });
});

describe("chat operations", () => {
  it("should get empty messages for new spreadsheet", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a spreadsheet first
    const spreadsheet = await caller.spreadsheet.create({
      name: "Chat Test",
      fileKey: "test/chat.xlsx",
      fileUrl: "https://example.com/chat.xlsx",
      fileType: "xlsx",
    });

    const messages = await caller.chat.getMessages({
      spreadsheetId: spreadsheet.id,
    });

    expect(Array.isArray(messages)).toBe(true);
    expect(messages.length).toBe(0);
  });
});

describe("checkpoint operations", () => {
  it("should list checkpoints for a spreadsheet", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a spreadsheet first
    const spreadsheet = await caller.spreadsheet.create({
      name: "Checkpoint Test",
      fileKey: "test/checkpoint.xlsx",
      fileUrl: "https://example.com/checkpoint.xlsx",
      fileType: "xlsx",
    });

    const checkpoints = await caller.checkpoint.list({
      spreadsheetId: spreadsheet.id,
    });

    expect(Array.isArray(checkpoints)).toBe(true);
  });
});
