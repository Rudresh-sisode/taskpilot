import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { useAiStream } from "../hooks/useAiStream";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Checkbox } from "../components/Checkbox";

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: task, isLoading } = useQuery({ queryKey: ["task", id], queryFn: () => api.getTask(id!) });

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (task) { setTitle(task.title); setNotes(task.notes); }
  }, [task]);

  const update = useMutation({
    mutationFn: (body: Parameters<typeof api.updateTask>[1]) => api.updateTask(id!, body),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["task", id] }); setDirty(false); },
  });

  const del = useMutation({
    mutationFn: () => api.deleteTask(id!),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); navigate("/"); },
  });

  const ai = useAiStream(id!);

  const isStale = task?.ai_summary && task.updated_at > task.ai_summary.created_at;

  if (isLoading) return <div className="flex h-screen items-center justify-center">Loading…</div>;
  if (!task) return <div className="flex h-screen items-center justify-center">Task not found</div>;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link to="/" className="text-sm text-blue-600 hover:underline">← Back to tasks</Link>

      <div className="mt-4 space-y-4">
        <Input label="Title" value={title} onChange={(v) => { setTitle(v); setDirty(true); }} />
        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            rows={4}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setDirty(true); }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            checked={task.status === "done"}
            onChange={(checked) => update.mutate({ status: checked ? "done" : "open" })}
            label={task.status === "done" ? "Completed" : "Mark as done"}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={() => update.mutate({ title, notes })} disabled={!dirty || update.isPending}>
            {update.isPending ? "Saving…" : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => del.mutate()} className="text-red-500">Delete</Button>
        </div>
      </div>

      {/* AI Summary Section */}
      <div className="mt-8">
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-semibold">AI Summary</h2>
          {isStale && (
            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-700">
              Notes changed — regenerate
            </span>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          <Button onClick={ai.start} disabled={ai.status === "streaming"}>
            {ai.status === "streaming" ? "Generating…" : "Generate summary"}
          </Button>
          {ai.status === "streaming" && (
            <Button variant="ghost" onClick={ai.cancel}>Cancel</Button>
          )}
        </div>

        {ai.status === "streaming" && (
          <Card className="font-mono text-sm whitespace-pre-wrap">
            {ai.tokens}<span className="animate-pulse">▊</span>
          </Card>
        )}

        {ai.status === "error" && (
          <p className="text-sm text-red-600" role="alert">{ai.error}</p>
        )}

        {(ai.status === "done" || (ai.status === "idle" && task.ai_summary)) && (
          <Card>
            <p className="mb-3 text-sm">{ai.summary || task.ai_summary?.summary}</p>
            <ul className="space-y-1">
              {(ai.actionItems.length ? ai.actionItems : task.ai_summary?.action_items ?? []).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-500 mt-0.5">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}
