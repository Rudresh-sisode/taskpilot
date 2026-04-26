import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Sparkles,
  ListTodo,
  Inbox,
  Tags,
  X,
} from "lucide-react";
import { api, type Task } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import { LabelChip } from "../components/LabelChip";
import { STATUSES, getStatus, type TaskStatus } from "../lib/status";
import { LABELS } from "../lib/labels";
import { cn } from "../lib/cn";

type Filter = "all" | TaskStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  ...STATUSES.map((s) => ({ value: s.value, label: s.label })),
];

export default function TaskList() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [labelFilter, setLabelFilter] = useState<string[]>([]);
  const [labelMenuOpen, setLabelMenuOpen] = useState(false);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks"],
    queryFn: api.listTasks,
  });

  const create = useMutation({
    mutationFn: api.createTask,
    onMutate: async (vars) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      const optimistic: Task = {
        id: `temp-${Date.now()}`,
        title: vars.title,
        notes: vars.notes ?? "",
        status: "open",
        labels: vars.labels ?? [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ai_summary: null,
      };
      qc.setQueryData<Task[]>(["tasks"], (old) => [optimistic, ...(old ?? [])]);
      setTitle("");
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["tasks"], ctx?.prev);
      toast.error("Couldn't create task");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const del = useMutation({
    mutationFn: api.deleteTask,
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        old?.filter((t) => t.id !== id) ?? [],
      );
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["tasks"], ctx?.prev);
      toast.error("Couldn't delete task");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      api.updateTask(id, { status }),
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: ["tasks"] });
      const prev = qc.getQueryData<Task[]>(["tasks"]);
      qc.setQueryData<Task[]>(["tasks"], (old) =>
        old?.map((t) => (t.id === id ? { ...t, status } : t)) ?? [],
      );
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      qc.setQueryData(["tasks"], ctx?.prev);
      toast.error("Couldn't update status");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = useMemo(() => {
    let out = tasks ?? [];
    if (filter !== "all") out = out.filter((t) => t.status === filter);
    if (labelFilter.length) {
      out = out.filter((t) => labelFilter.every((l) => t.labels.includes(l)));
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q),
      );
    }
    return out;
  }, [tasks, filter, search, labelFilter]);

  const counts = useMemo(() => {
    const c: Record<Filter, number> = {
      all: tasks?.length ?? 0,
      open: 0,
      in_progress: 0,
      done: 0,
      cancelled: 0,
    };
    tasks?.forEach((t) => (c[t.status] = (c[t.status] ?? 0) + 1));
    return c;
  }, [tasks]);

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title: title.trim() });
  }

  function handleDelete(t: Task) {
    del.mutate(t.id);
    toast("Task deleted", {
      description: t.title,
      action: {
        label: "Undo",
        onClick: () =>
          create.mutate({ title: t.title, notes: t.notes, labels: t.labels }),
      },
    });
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {counts.all === 0
            ? "Add your first task to get started."
            : `${counts.open} open · ${counts.in_progress} in progress · ${counts.done} done`}
        </p>
      </div>

      <form
        onSubmit={handleCreate}
        className="group mb-5 flex items-center gap-2 rounded-2xl border border-zinc-200/70 bg-white p-1.5 shadow-soft transition focus-within:border-brand-300 focus-within:shadow-glow"
      >
        <span className="pl-3 text-zinc-400">
          <Plus className="h-4 w-4" />
        </span>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs doing?"
          className="h-9 flex-1 bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none"
        />
        <Button
          type="submit"
          size="sm"
          loading={create.isPending}
          disabled={!title.trim()}
        >
          Add task
        </Button>
      </form>

      {/* Filters row */}
      <div className="mb-4 grid gap-3 md:grid-cols-[minmax(0,1fr)_18rem] md:items-center">
        <div className="flex min-w-0 flex-wrap items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-soft">
          {FILTERS.map(({ value, label }) => {
            const active = filter === value;
            const count = counts[value];
            const Icon =
              value === "all" ? ListTodo : getStatus(value as TaskStatus).icon;
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "focus-ring inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition",
                  active
                    ? "bg-zinc-900 text-white shadow-soft"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
                <span
                  className={cn(
                    "ml-0.5 rounded-md px-1.5 text-[10px]",
                    active ? "bg-white/15 text-white" : "bg-zinc-100 text-zinc-500",
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
        <Input
          value={search}
          onChange={setSearch}
          placeholder="Search tasks…"
          containerClassName="md:w-72"
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* Label filter row */}
      <div className="mb-6 flex flex-wrap items-center gap-1.5">
        <div className="relative">
          <button
            onClick={() => setLabelMenuOpen((v) => !v)}
            onBlur={() => setTimeout(() => setLabelMenuOpen(false), 150)}
            className="focus-ring inline-flex h-7 items-center gap-1 rounded-full border border-dashed border-zinc-300 bg-white px-2.5 text-xs font-medium text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
          >
            <Tags className="h-3 w-3" />
            Filter labels
            {labelFilter.length > 0 && (
              <span className="ml-1 rounded-full bg-zinc-900 px-1.5 text-[10px] text-white">
                {labelFilter.length}
              </span>
            )}
          </button>
          <div
            className={cn(
              "absolute left-0 z-20 mt-2 w-64 origin-top-left rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg transition-all",
              labelMenuOpen
                ? "scale-100 opacity-100"
                : "pointer-events-none scale-95 opacity-0",
            )}
          >
            <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
              Filter by label
            </p>
            <div className="max-h-64 overflow-y-auto">
              {LABELS.map((l) => {
                const sel = labelFilter.includes(l.slug);
                return (
                  <button
                    key={l.slug}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setLabelFilter((prev) =>
                        sel ? prev.filter((x) => x !== l.slug) : [...prev, l.slug],
                      );
                    }}
                    className={cn(
                      "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition",
                      sel ? "bg-zinc-100" : "hover:bg-zinc-50",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", l.dot)} />
                    <span className="flex-1 text-zinc-800">{l.name}</span>
                    {sel && <span className="text-[10px] text-zinc-500">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        {labelFilter.map((slug) => (
          <LabelChip
            key={slug}
            slug={slug}
            onRemove={() =>
              setLabelFilter((prev) => prev.filter((x) => x !== slug))
            }
          />
        ))}
        {labelFilter.length > 0 && (
          <button
            onClick={() => setLabelFilter([])}
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900"
          >
            <X className="h-3 w-3" /> clear
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-4"
            >
              <Skeleton className="h-5 w-5 rounded-md" />
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          hasAny={counts.all > 0}
          hasFilters={!!search || filter !== "all" || labelFilter.length > 0}
          onClear={() => {
            setSearch("");
            setFilter("all");
            setLabelFilter([]);
          }}
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <TaskRow
                task={t}
                onStatusChange={(status) =>
                  updateStatus.mutate({ id: t.id, status })
                }
                onDelete={() => handleDelete(t)}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function TaskRow({
  task,
  onStatusChange,
  onDelete,
}: {
  task: Task;
  onStatusChange: (s: TaskStatus) => void;
  onDelete: () => void;
}) {
  const status = getStatus(task.status);
  const StatusIcon = status.icon;
  const dim = task.status === "done" || task.status === "cancelled";
  const hasSummary = !!task.ai_summary;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-3 pr-2 shadow-soft transition hover:border-zinc-300 hover:shadow-md",
        dim && "bg-zinc-50/60",
      )}
    >
      {/* Status pill (compact picker hidden behind icon button) */}
      <div className="shrink-0">
        <CompactStatusButton
          status={task.status}
          onChange={onStatusChange}
        />
      </div>

      <Link
        to={`/tasks/${task.id}`}
        className="focus-ring -my-2 flex flex-1 flex-col gap-1 overflow-hidden rounded-lg py-2 pr-2"
      >
        <span
          className={cn(
            "truncate text-sm font-medium text-zinc-900 transition-colors",
            task.status === "done" && "text-zinc-400 line-through",
            task.status === "cancelled" && "text-zinc-400 line-through",
          )}
        >
          {task.title}
        </span>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={cn("inline-flex items-center gap-1 text-[11px]", status.iconColor)}>
            <StatusIcon className="h-3 w-3" />
            <span className="text-zinc-500">{status.label}</span>
          </span>
          {task.labels.slice(0, 3).map((slug) => (
            <LabelChip key={slug} slug={slug} />
          ))}
          {task.labels.length > 3 && (
            <span className="text-[11px] text-zinc-400">
              +{task.labels.length - 3}
            </span>
          )}
        </div>
      </Link>

      <div className="flex shrink-0 items-center gap-1.5">
        {hasSummary && (
          <Badge tone="brand" icon={<Sparkles className="h-3 w-3" />}>
            AI
          </Badge>
        )}
        <button
          onClick={onDelete}
          aria-label="Delete task"
          className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 focus-visible:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function CompactStatusButton({
  status,
  onChange,
}: {
  status: TaskStatus;
  onChange: (s: TaskStatus) => void;
}) {
  const def = getStatus(status);
  const Icon = def.icon;
  // Cycle through statuses on click for fast triage; full picker is in detail page.
  const order: TaskStatus[] = ["open", "in_progress", "done", "cancelled"];
  function next() {
    const i = order.indexOf(status);
    onChange(order[(i + 1) % order.length]);
  }
  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        next();
      }}
      title={`${def.label} — click to advance`}
      className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg transition hover:bg-zinc-100"
    >
      <Icon className={cn("h-5 w-5", def.iconColor)} />
    </button>
  );
}

function EmptyState({
  hasAny,
  hasFilters,
  onClear,
}: {
  hasAny: boolean;
  hasFilters: boolean;
  onClear: () => void;
}) {
  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 px-6 py-16 text-center">
        <Search className="mb-3 h-6 w-6 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-900">No matching tasks</p>
        <p className="mt-1 text-xs text-zinc-500">
          Try a different search, status, or label.
        </p>
        <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
          Clear filters
        </Button>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 px-6 py-16 text-center">
      <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500/10 to-fuchsia-500/10 text-brand-600">
        <Inbox className="h-6 w-6" />
      </span>
      <p className="text-base font-medium text-zinc-900">
        {hasAny ? "Nothing here yet" : "Your inbox is empty"}
      </p>
      <p className="mt-1 max-w-xs text-sm text-zinc-500">
        Capture an idea above — TaskPilot will help you turn it into clear next
        steps.
      </p>
    </div>
  );
}
