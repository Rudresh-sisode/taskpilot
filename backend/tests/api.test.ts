import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";

// Mock all external deps before importing routes
vi.mock("../src/lib/supabase.js", () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock("../src/lib/openai.js", () => ({
  openai: { chat: { completions: { create: vi.fn() } } },
  MODEL: "gpt-4o-mini",
}));

vi.mock("../src/middleware/auth.js", () => ({
  auth: (req: any, _res: any, next: any) => {
    req.userId = "test-user-id";
    next();
  },
}));

vi.mock("../src/middleware/rateLimit.js", () => ({
  globalLimiter: (_req: any, _res: any, next: any) => next(),
  aiLimiter: (_req: any, _res: any, next: any) => next(),
}));

vi.mock("../src/middleware/error.js", () => ({
  errorHandler: (err: any, _req: any, res: any, _next: any) => {
    res.status(500).json({ ok: false, error: { code: "INTERNAL_ERROR", message: err.message } });
  },
}));

vi.mock("pino", () => ({
  default: () => ({ info: vi.fn(), error: vi.fn() }),
}));

import { supabase } from "../src/lib/supabase.js";
import { openai } from "../src/lib/openai.js";

function buildApp() {
  const app = express();
  app.use(express.json());

  // Inline auth mock
  app.use((req: any, _res, next) => {
    req.userId = "test-user-id";
    next();
  });

  // We need to import routes dynamically after mocks
  return import("../src/routes/tasks.js").then(({ tasksRouter }) =>
    import("../src/routes/ai.js").then(({ aiRouter }) => {
      app.use("/api/tasks", tasksRouter);
      app.use("/api/tasks", aiRouter);
      return app;
    }),
  );
}

// Helper to build a chainable supabase mock
function mockChain(finalResult: any) {
  const chain: any = {};
  const methods = ["select", "insert", "update", "delete", "eq", "order", "limit", "single", "upsert"];
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }
  // The last call in the chain resolves to the result
  chain.single.mockResolvedValue(finalResult);
  chain.select.mockReturnValue(chain);
  chain.order.mockResolvedValue(finalResult);
  return chain;
}

describe("Tasks CRUD", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("GET /api/tasks returns task list", async () => {
    const tasks = [{ id: "1", title: "Test", notes: "", status: "open" }];
    const chain = mockChain({ data: tasks, error: null });
    chain.order.mockResolvedValue({ data: tasks, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const res = await request(app).get("/api/tasks");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.data).toEqual(tasks);
  });

  it("POST /api/tasks creates a task", async () => {
    const task = { id: "1", title: "New task", notes: "", status: "open" };
    const chain = mockChain({ data: task, error: null });
    (supabase.from as any).mockReturnValue(chain);

    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "New task" });

    expect(res.status).toBe(201);
    expect(res.body.ok).toBe(true);
  });

  it("POST /api/tasks rejects empty title", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .send({ title: "" });

    expect(res.status).toBe(400);
    expect(res.body.ok).toBe(false);
  });

  it("DELETE /api/tasks/:id deletes a task", async () => {
    const chain = mockChain({ error: null });
    // delete().eq().eq() chain needs to resolve properly
    chain.delete.mockReturnValue(chain);
    chain.eq.mockReturnValue(chain);
    // Make the final eq call resolve as a promise
    let eqCount = 0;
    chain.eq.mockImplementation(() => {
      eqCount++;
      if (eqCount >= 2) return Promise.resolve({ error: null });
      return chain;
    });
    (supabase.from as any).mockReturnValue(chain);

    const res = await request(app).delete("/api/tasks/some-id");
    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
  });
});

describe("AI SSE stream", () => {
  let app: express.Express;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = await buildApp();
  });

  it("returns cached summary when available", async () => {
    const task = { id: "t1", title: "Test", notes: "notes" };
    const cached = { id: "s1", summary: "cached summary", action_items: ["do x"], model: "gpt-4o-mini", created_at: "2024-01-01" };

    const taskChain = mockChain({ data: task, error: null });
    const cacheChain = mockChain({ data: cached, error: null });

    let callCount = 0;
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "tasks") return taskChain;
      if (table === "ai_summaries") {
        callCount++;
        return cacheChain;
      }
      return taskChain;
    });

    const res = await request(app)
      .get("/api/tasks/t1/ai/stream")
      .set("Accept", "text/event-stream");

    expect(res.status).toBe(200);
    expect(res.text).toContain("event: done");
    expect(res.text).toContain("cached summary");
  });

  it("streams tokens from OpenAI when no cache", async () => {
    const task = { id: "t1", title: "Test", notes: "notes" };

    const taskChain = mockChain({ data: task, error: null });
    const noCacheChain = mockChain({ data: null, error: { code: "PGRST116" } });
    const upsertChain = mockChain({ data: null, error: null });

    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "tasks") return taskChain;
      if (table === "ai_summaries") return noCacheChain;
      return upsertChain;
    });

    // Mock OpenAI streaming
    const mockStream = (async function* () {
      yield { choices: [{ delta: { content: '{"summary":"test",' } }] };
      yield { choices: [{ delta: { content: '"action_items":["a"]}' } }] };
    })();

    (openai.chat.completions.create as any).mockResolvedValue(mockStream);

    // Need to re-mock supabase.from for the persist call
    const persistChain = mockChain({ data: null, error: null });
    persistChain.upsert.mockResolvedValue({ data: null, error: null });

    let fromCallCount = 0;
    (supabase.from as any).mockImplementation((table: string) => {
      if (table === "tasks") return taskChain;
      if (table === "ai_summaries") {
        fromCallCount++;
        // First call is cache check (returns null), subsequent calls are persist
        return fromCallCount === 1 ? noCacheChain : persistChain;
      }
      return taskChain;
    });

    const res = await request(app)
      .get("/api/tasks/t1/ai/stream")
      .set("Accept", "text/event-stream");

    expect(res.status).toBe(200);
    expect(res.text).toContain("event: token");
    expect(res.text).toContain("event: done");
  });
});
