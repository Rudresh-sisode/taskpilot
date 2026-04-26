import { Router } from "express";
import { supabase } from "../lib/supabase.js";
import { openai, MODEL } from "../lib/openai.js";
import { SYSTEM_PROMPT, buildUserMessage } from "../lib/prompt.js";
import { computeHash, getCached, persistSummary } from "../lib/cache.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import type { AuthRequest } from "../middleware/auth.js";

export const aiRouter = Router();

aiRouter.get("/:id/ai/stream", aiLimiter, async (req: AuthRequest, res) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // Load task & verify ownership
    const { data: task } = await supabase
      .from("tasks")
      .select("id, title, notes")
      .eq("id", req.params.id)
      .eq("user_id", req.userId!)
      .single();

    if (!task) {
      res.write(`event: error\ndata: ${JSON.stringify({ message: "Task not found" })}\n\n`);
      res.end();
      return;
    }

    // Cache check
    const hash = computeHash(task.title, task.notes);
    const cached = await getCached(task.id, hash);
    if (cached) {
      res.write(`event: done\ndata: ${JSON.stringify({ summary: cached.summary, action_items: cached.action_items, cached: true })}\n\n`);
      res.end();
      return;
    }

    // Stream from OpenAI
    const controller = new AbortController();
    req.on("close", () => controller.abort());

    const stream = await openai.chat.completions.create(
      {
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: buildUserMessage(task.title, task.notes) },
        ],
        stream: true,
      },
      { signal: controller.signal },
    );

    let accumulated = "";

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content;
      if (text) {
        accumulated += text;
        res.write(`event: token\ndata: ${JSON.stringify({ text })}\n\n`);
      }
    }

    // Parse and persist
    let parsed: { summary: string; action_items: string[] };
    try {
      parsed = JSON.parse(accumulated);
    } catch {
      parsed = { summary: accumulated, action_items: [] };
    }

    await persistSummary(task.id, hash, parsed.summary, parsed.action_items);
    res.write(`event: done\ndata: ${JSON.stringify(parsed)}\n\n`);
    res.end();
  } catch (err) {
    if ((err as Error).name === "AbortError") return;
    const message = err instanceof Error ? err.message : "AI generation failed";
    res.write(`event: error\ndata: ${JSON.stringify({ message })}\n\n`);
    res.end();
  }
});
