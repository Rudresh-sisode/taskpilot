import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { createTaskSchema, updateTaskSchema } from "../schemas/task.js";
import type { AuthRequest } from "../middleware/auth.js";

export const tasksRouter = Router();

// List tasks (paginated)
tasksRouter.get("/", async (req: AuthRequest, res, next) => {
  try {
    const limit = Math.min(
      Math.max(parseInt(String(req.query.limit ?? "10"), 10) || 10, 1),
      100,
    );
    const offset = Math.max(
      parseInt(String(req.query.offset ?? "0"), 10) || 0,
      0,
    );
    const status = typeof req.query.status === "string" ? req.query.status : "";

    let q = supabase
      .from("tasks")
      .select("*", { count: "exact" })
      .eq("user_id", req.userId!);

    if (["open", "in_progress", "done", "cancelled"].includes(status)) {
      q = q.eq("status", status);
    }

    q = q
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, error, count } = await q;
    if (error) throw error;

    const total = count ?? 0;
    const nextOffset = offset + (data?.length ?? 0) < total ? offset + limit : null;

    res.json({
      ok: true,
      data: { items: data ?? [], total, nextOffset },
    });
  } catch (e) {
    next(e);
  }
});

// Create task
tasksRouter.post("/", async (req: AuthRequest, res, next) => {
  try {
    const parsed = createTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: { code: "VALIDATION", message: parsed.error.issues } });
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert({ ...parsed.data, user_id: req.userId! })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

// Get single task + latest AI summary
tasksRouter.get("/:id", async (req: AuthRequest, res, next) => {
  try {
    const { data: task, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", req.params.id)
      .eq("user_id", req.userId!)
      .single();

    if (error || !task) {
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Task not found" } });
      return;
    }

    const { data: summary } = await supabase
      .from("ai_summaries")
      .select("id, summary, action_items, model, created_at")
      .eq("task_id", task.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    res.json({ ok: true, data: { ...task, ai_summary: summary } });
  } catch (e) {
    next(e);
  }
});

// Update task
tasksRouter.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const parsed = updateTaskSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ ok: false, error: { code: "VALIDATION", message: parsed.error.issues } });
      return;
    }

    const { data, error } = await supabase
      .from("tasks")
      .update({ ...parsed.data, updated_at: new Date().toISOString() })
      .eq("id", req.params.id)
      .eq("user_id", req.userId!)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ ok: false, error: { code: "NOT_FOUND", message: "Task not found" } });
      return;
    }
    res.json({ ok: true, data });
  } catch (e) {
    next(e);
  }
});

// Delete task
tasksRouter.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.userId!);

    if (error) throw error;
    res.json({ ok: true, data: null });
  } catch (e) {
    next(e);
  }
});
