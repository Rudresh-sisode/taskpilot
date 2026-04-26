import { createHash } from "node:crypto";
import { supabase } from "./supabase.js";
import { MODEL } from "./openai.js";

export function computeHash(title: string, notes: string): string {
  return createHash("sha256")
    .update(`${title}\n${notes}\n${MODEL}`)
    .digest("hex");
}

export interface AiSummary {
  id: string;
  summary: string;
  action_items: string[];
  model: string;
  created_at: string;
}

export async function getCached(
  taskId: string,
  hash: string,
): Promise<AiSummary | null> {
  const { data } = await supabase
    .from("ai_summaries")
    .select("id, summary, action_items, model, created_at")
    .eq("task_id", taskId)
    .eq("input_hash", hash)
    .single();
  return data;
}

export async function persistSummary(
  taskId: string,
  hash: string,
  summary: string,
  actionItems: string[],
) {
  await supabase.from("ai_summaries").upsert(
    {
      task_id: taskId,
      input_hash: hash,
      model: MODEL,
      summary,
      action_items: actionItems,
    },
    { onConflict: "task_id,input_hash" },
  );
}
