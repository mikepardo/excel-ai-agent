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

function createPublicContext(): TrpcContext {
  return {
    user: undefined,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("template operations", () => {
  it("should list all available templates", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.template.list();
    
    expect(Array.isArray(templates)).toBe(true);
    expect(templates.length).toBeGreaterThan(0);
    
    // Check template structure
    const firstTemplate = templates[0];
    expect(firstTemplate).toHaveProperty('id');
    expect(firstTemplate).toHaveProperty('name');
    expect(firstTemplate).toHaveProperty('description');
    expect(firstTemplate).toHaveProperty('category');
    expect(firstTemplate).toHaveProperty('data');
  });

  it("should include specific templates", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const templates = await caller.template.list();
    const templateIds = templates.map(t => t.id);
    
    expect(templateIds).toContain('empty');
    expect(templateIds).toContain('budget');
    expect(templateIds).toContain('profit-loss');
    expect(templateIds).toContain('dcf');
  });

  it("should create spreadsheet from template", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.template.createFromTemplate({
      templateId: 'empty',
      name: 'My New Spreadsheet',
    });

    expect(result).toHaveProperty('id');
    expect(typeof result.id).toBe('number');
  });

  it("should fail with invalid template ID", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.template.createFromTemplate({
        templateId: 'nonexistent',
        name: 'Test',
      })
    ).rejects.toThrow();
  });
});
