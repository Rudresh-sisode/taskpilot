import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  Sparkles,
  StopCircle,
  Copy,
  Check,
  AlertCircle,
  RefreshCw,
  Wand2,
  Loader2,
  CloudCheck,
  CloudOff,
  Clock,
} from "lucide-react";
import { api, type Task } from "../lib/api";
import { useAiStream } from "../hooks/useAiStream";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";
import { Textarea } from "../components/Textarea";
import { Badge } from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import { StatusPicker } from "../components/StatusPicker";
import { LabelPicker } from "../components/LabelPicker";
import { celebrate } from "../components/Celebration";
import { type TaskStatus } from "../lib/status";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/AlertDialog";

const AUTOSAVE_MS = 800;

export default function TaskDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", id],
    queryFn: () => api.getTask(id!),
  });

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [savedSnap, setSavedSnap] = useState({ title: "", notes: "" });
  const [deleteOpen, setDeleteOpen] = useState(false);
  const lastSavedAtRef = useRef<number | null>(null);
  const [, force] = useState(0);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setNotes(task.notes);
      setSavedSnap({ title: task.title, notes: task.notes });
    }
  }, [task]);

  const update = useMutation({
    mutationFn: (body: Parameters<typeof api.updateTask>[1]) =>
      api.updateTask(id!, body),
    onSuccess: (data) => {
      qc.setQueryData<Task>(["task", id], (prev) => ({
        ...data,
        ai_summary: data.ai_summary ?? prev?.ai_summary ?? null,
      }));
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setSavedSnap({ title: data.title, notes: data.notes });
      lastSavedAtRef.current = Date.now();
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const dirty = title !== savedSnap.title || notes !== savedSnap.notes;

  // Autosave (debounced) for content fields
  useEffect(() => {
    if (!task || !dirty) return;
    const handle = setTimeout(() => {
      update.mutate({ title, notes });
    }, AUTOSAVE_MS);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, notes, dirty, task]);

  // Cmd/Ctrl+S to force save
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (dirty && !update.isPending) update.mutate({ title, notes });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dirty, title, notes, update]);

  // Tick to refresh "saved Xs ago" indicator
  useEffect(() => {
    const t = setInterval(() => force((n) => n + 1), 30_000);
    return () => clearInterval(t);
  }, []);

  const del = useMutation({
    mutationFn: () => api.deleteTask(id!),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      navigate("/");
    },
    onError: () => toast.error("Couldn't delete task"),
  });

  const patch = useMutation({
    mutationFn: (body: Partial<Pick<Task, "status" | "labels">>) =>
      api.updateTask(id!, body),
    onMutate: async (body) => {
      await qc.cancelQueries({ queryKey: ["task", id] });
      const prev = qc.getQueryData<Task>(["task", id]);
      if (prev) qc.setQueryData<Task>(["task", id], { ...prev, ...body });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(["task", id], ctx.prev);
      toast.error("Couldn't update task");
    },
    onSuccess: (data) => {
      qc.setQueryData<Task>(["task", id], (prev) => ({
        ...data,
        ai_summary: data.ai_summary ?? prev?.ai_summary ?? null,
      }));
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  function setStatus(status: TaskStatus) {
    if (status === "done" && task?.status !== "done") {
      celebrate();
    }
    patch.mutate({ status });
  }
  function setLabels(labels: string[]) {
    patch.mutate({ labels });
  }

  const ai = useAiStream(id!);

  if (isLoading) return <TaskDetailSkeleton />;
  if (!task) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">Task not found.</p>
        <Link
          to="/"
          className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
        >
          ← Back to tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="focus-ring inline-flex items-center gap-1.5 rounded-md text-sm text-zinc-500 transition hover:text-zinc-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All tasks
        </Link>
        <div className="flex items-center gap-3">
          <SaveIndicator
            dirty={dirty}
            saving={update.isPending}
            error={update.isError}
            lastSavedAt={lastSavedAtRef.current}
          />
          <AlertDialog
            open={deleteOpen}
            onOpenChange={(open) => {
              if (!del.isPending) setDeleteOpen(open);
            }}
          >
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Trash2 className="h-3.5 w-3.5" />}
                className="text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete task?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{task.title}" and its AI summary
                  history. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={del.isPending} />
                <Button
                  variant="destructive"
                  loading={del.isPending}
                  onClick={() => del.mutate()}
                >
                  Delete task
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Editor */}
        <div className="space-y-5">
          <Card className="space-y-5">
            <Input
              label="Title"
              value={title}
              onChange={setTitle}
              className="h-11 text-base font-medium"
              placeholder="Untitled task"
            />
            <Textarea
              label="Notes"
              value={notes}
              onChange={setNotes}
              rows={10}
              placeholder="Add details, context, or anything else worth remembering…"
              hint="Tip: ⌘+S to save · changes autosave"
            />
          </Card>

          <Card className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900">Properties</h3>
              <span className="text-xs text-zinc-400">
                Updated {formatRelative(task.updated_at)}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-[7rem_minmax(0,1fr)] sm:items-start">
              <span className="pt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Status
              </span>
              <div>
                <StatusPicker value={task.status} onChange={setStatus} />
              </div>

              <span className="pt-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                Labels
              </span>
              <div>
                <LabelPicker value={task.labels} onChange={setLabels} />
                {task.labels.length === 0 && (
                  <p className="mt-1.5 text-xs text-zinc-400">
                    Categorize this task with one or more labels.
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* AI panel */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <AiPanel task={task} ai={ai} dirty={dirty} />
        </aside>
      </div>
    </div>
  );
}

/* -------------------- Save indicator -------------------- */

function SaveIndicator({
  dirty,
  saving,
  error,
  lastSavedAt,
}: {
  dirty: boolean;
  saving: boolean;
  error: boolean;
  lastSavedAt: number | null;
}) {
  if (error) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-red-600">
        <CloudOff className="h-3.5 w-3.5" />
        Failed to save
      </span>
    );
  }
  if (saving) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Saving…
      </span>
    );
  }
  if (dirty) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-amber-600">
        <Clock className="h-3.5 w-3.5" />
        Unsaved changes
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600">
      <CloudCheck className="h-3.5 w-3.5" />
      Saved{lastSavedAt ? ` ${formatRelative(new Date(lastSavedAt).toISOString())}` : ""}
    </span>
  );
}

/* -------------------- AI Panel -------------------- */

function AiPanel({
  task,
  ai,
  dirty,
}: {
  task: Task;
  ai: ReturnType<typeof useAiStream>;
  dirty: boolean;
}) {
  const streaming = ai.status === "streaming";
  const hasExisting = !!task.ai_summary;
  const showResult =
    ai.status === "done" || (ai.status === "idle" && hasExisting);

  const isStale = useMemo(() => {
    if (!task.ai_summary) return false;
    return task.updated_at > task.ai_summary.created_at;
  }, [task]);

  const summaryText = ai.summary || task.ai_summary?.summary || "";
  const items = ai.actionItems.length
    ? ai.actionItems
    : task.ai_summary?.action_items ?? [];

  const [copied, setCopied] = useState(false);
  function handleCopy() {
    const text = `${summaryText}\n\nYour Action Items:\n${items.map((i) => `• ${i}`).join("\n")}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  }

  // auto-scroll while streaming
  const streamRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (streaming && streamRef.current) {
      streamRef.current.scrollTop = streamRef.current.scrollHeight;
    }
  }, [ai.tokens, streaming]);

  return (
    <Card className="overflow-hidden p-0">
      {/* Header */}
      <div className="relative overflow-hidden border-b border-zinc-100 px-5 py-4">
        <div
          aria-hidden
          className="absolute inset-0 -z-0 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(at 0% 0%, rgb(99 102 241 / 0.15) 0px, transparent 60%), radial-gradient(at 100% 100%, rgb(217 70 239 / 0.12) 0px, transparent 60%)",
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 via-violet-500 to-fuchsia-500 text-white shadow-glow">
              <Sparkles className="h-3.5 w-3.5" />
            </span>
            <h2 className="text-sm font-semibold text-zinc-900">AI Summary</h2>
          </div>
          {streaming ? (
            <Badge tone="brand">
              <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-brand-500" />
              Streaming
            </Badge>
          ) : isStale ? (
            <Badge tone="warning">Out of date</Badge>
          ) : hasExisting ? (
            <Badge tone="success">Up to date</Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-5 py-4">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {streaming ? (
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<StopCircle className="h-3.5 w-3.5" />}
              onClick={ai.cancel}
              className="w-full"
            >
              Stop generating
            </Button>
          ) : (
            <Button
              size="sm"
              className="w-full"
              leftIcon={
                hasExisting ? (
                  <RefreshCw className="h-3.5 w-3.5" />
                ) : (
                  <Wand2 className="h-3.5 w-3.5" />
                )
              }
              onClick={ai.start}
              disabled={dirty}
            >
              {hasExisting ? "Regenerate summary" : "Generate summary"}
            </Button>
          )}
        </div>

        {dirty && !streaming && (
          <p className="flex items-center gap-1.5 text-xs text-amber-600">
            <Clock className="h-3 w-3" />
            Save your changes first to summarize.
          </p>
        )}

        {isStale && !streaming && (
          <p className="text-xs text-zinc-500">
            The task changed since this summary was generated. Regenerate for
            fresh insights.
          </p>
        )}

        {/* Streaming view */}
        {streaming && (
          <div
            ref={streamRef}
            className="max-h-72 overflow-y-auto rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50/50 to-fuchsia-50/30 p-4 text-sm leading-relaxed text-zinc-800"
          >
            {ai.tokens ? (
              <span className="whitespace-pre-wrap">
                {ai.tokens}
                <span className="ml-0.5 inline-block h-4 w-1.5 -translate-y-0.5 animate-caret-blink rounded-sm bg-brand-500 align-middle" />
              </span>
            ) : (
              <StreamingPlaceholder />
            )}
          </div>
        )}

        {/* Error */}
        {ai.status === "error" && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Couldn't generate summary</p>
              <p className="text-xs text-red-600/80">{ai.error}</p>
            </div>
            <Button size="sm" variant="ghost" onClick={ai.start}>
              Retry
            </Button>
          </div>
        )}

        {/* Result */}
        {showResult && !streaming && summaryText && (
          <div className="space-y-4 animate-fade-in">
            <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-4">
              <p className="text-sm leading-relaxed text-zinc-800">
                {summaryText}
              </p>
            </div>

            {items.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                  Your Action Items
                </p>
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2.5 text-sm text-zinc-800"
                    >
                      <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleCopy}
              className="focus-ring inline-flex items-center gap-1.5 rounded-md text-xs text-zinc-500 transition hover:text-zinc-900"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  Copy summary
                </>
              )}
            </button>
          </div>
        )}

        {/* Empty state */}
        {ai.status === "idle" && !hasExisting && (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-white px-4 py-6 text-center">
            <Sparkles className="mx-auto mb-2 h-5 w-5 text-zinc-300" />
            <p className="text-xs text-zinc-500">
              Generate an AI summary to extract a TL;DR and clear next steps
              from your notes.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

function StreamingPlaceholder() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-3 w-11/12" />
      <Skeleton className="h-3 w-9/12" />
      <Skeleton className="h-3 w-10/12" />
    </div>
  );
}

/* -------------------- Skeleton page -------------------- */

function TaskDetailSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Skeleton className="h-4 w-24" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <Card className="space-y-4">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-32 w-full" />
        </Card>
        <Card className="space-y-3">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-20 w-full" />
        </Card>
      </div>
    </div>
  );
}

/* -------------------- helpers -------------------- */

function formatRelative(iso: string) {
  const then = new Date(iso).getTime();
  const diff = Date.now() - then;
  const sec = Math.floor(diff / 1000);
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString();
}
