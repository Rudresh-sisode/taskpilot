import { useCallback, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { notifyError } from "../lib/errorMascot";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

type Status = "idle" | "streaming" | "done" | "error";

export interface AiStreamResult {
  status: Status;
  tokens: string;
  summary: string;
  actionItems: string[];
  error: string;
  start: () => void;
  cancel: () => void;
}

export function useAiStream(taskId: string): AiStreamResult {
  const [status, setStatus] = useState<Status>("idle");
  const [tokens, setTokens] = useState("");
  const [summary, setSummary] = useState("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [error, setError] = useState("");
  const esRef = useRef<EventSource | null>(null);

  const cancel = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    if (status === "streaming") setStatus("idle");
  }, [status]);

  const start = useCallback(async () => {
    cancel();
    setTokens("");
    setSummary("");
    setActionItems([]);
    setError("");
    setStatus("streaming");

    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token ?? "";

    const es = new EventSource(
      `${BASE}/api/tasks/${taskId}/ai/stream?token=${encodeURIComponent(token)}`,
    );
    esRef.current = es;

    es.addEventListener("token", (e) => {
      const { text } = JSON.parse(e.data);
      setTokens((prev) => prev + text);
    });

    es.addEventListener("done", (e) => {
      const parsed = JSON.parse(e.data);
      setSummary(parsed.summary);
      setActionItems(parsed.action_items);
      setStatus("done");
      es.close();
    });

    es.addEventListener("error", (e) => {
      let message = "Connection lost";
      if (e instanceof MessageEvent) {
        try {
          const parsed = JSON.parse(e.data);
          message = parsed.message || message;
        } catch {
          message = e.data || message;
        }
      }
      setError(message);
      notifyError(message);
      setStatus("error");
      es.close();
    });
  }, [taskId, cancel]);

  return { status, tokens, summary, actionItems, error, start, cancel };
}
