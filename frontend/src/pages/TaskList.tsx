import { useMemo, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Trash2,
  Sparkles,
  CheckCircle2,
  Circle,
  ListTodo,
  Inbox,
} from "lucide-react";
import { api, type Task } from "../lib/api";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Badge } from "../components/Badge";
import { Skeleton } from "../components/Skeleton";
import { cn } from "../lib/cn";

type Filter = "all" | "open" | "done";

const FILTERS: { value: Filter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: "all", label: "All", icon: ListTodo },
  { value: "open", label: "Open", icon: Circle },
  { value: "done", label: "Done", icon: CheckCircle2 },
];

export default function TaskList() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

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
        notes: "",
        status: "open",
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
      qc.setQueryData<Task[]>(["tasks"], (old) => old?.filter((t) => t.id !== id) ?? []);
      return { prev };
    },
    onError: (_err, _id, ctx) => {
      qc.setQueryData(["tasks"], ctx?.prev);
      toast.error("Couldn't delete task");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const toggle = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "open" | "done" }) =>
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
      toast.error("Couldn't update task");
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const filtered = useMemo(() => {
    let out = tasks ?? [];
    if (filter !== "all") out = out.filter((t) => t.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      out = out.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.notes.toLowerCase().includes(q),
      );
    }
    return out;
  }, [tasks, filter, search]);

  const counts = useMemo(() => {
    const all = tasks?.length ?? 0;
    const open = tasks?.filter((t) => t.status === "open").length ?? 0;
    const done = all - open;
    return { all, open, done };
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
        onClick: () => create.mutate({ title: t.title, notes: t.notes }),
      },
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      {/* Heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
          Your tasks
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {counts.all === 0
            ? "Add your first task to get started."
            : `${counts.open} open · ${counts.done} done`}
        </p>
      </div>

      {/* Quick add */}
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

      {/* Filters + search */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1 shadow-soft">
          {FILTERS.map(({ value, label, icon: Icon }) => {
            const active = filter === value;
            const count = counts[value];
            return (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={cn(
                  "focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition",
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
          containerClassName="sm:w-64"
          leftIcon={<Search className="h-4 w-4" />}
        />
      </div>

      {/* List */}
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
          filter={filter}
          search={search}
          onClear={() => {
            setSearch("");
            setFilter("all");
          }}
        />
      ) : (
        <ul className="space-y-2">
          {filtered.map((t) => (
            <li key={t.id}>
              <TaskRow
                task={t}
                onToggle={(status) => toggle.mutate({ id: t.id, status })}
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
  onToggle,
  onDelete,
}: {
  task: Task;
  onToggle: (s: "open" | "done") => void;
  onDelete: () => void;
}) {
  const done = task.status === "done";
  const hasSummary = !!task.ai_summary;

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-zinc-200/70 bg-white p-3 pr-2 shadow-soft transition hover:border-zinc-300 hover:shadow-md",
        done && "bg-zinc-50/60",
      )}
    >
      <button
        onClick={() => onToggle(done ? "open" : "done")}
        aria-label={done ? "Mark as open" : "Mark as done"}
        className="focus-ring flex h-9 w-9 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700"
      >
        {done ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>

      <Link
        to={`/tasks/${task.id}`}
        className="focus-ring -my-2 flex flex-1 flex-col gap-0.5 overflow-hidden rounded-lg py-2 pr-2"
      >
        <span
          className={cn(
            "truncate text-sm font-medium text-zinc-900 transition-colors",
            done && "text-zinc-400 line-through",
          )}
        >
          {task.title}
        </span>
        {task.notes && (
          <span className="truncate text-xs text-zinc-500">{task.notes}</span>
        )}
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

function EmptyState({
  hasAny,
  filter,
  search,
  onClear,
}: {
  hasAny: boolean;
  filter: Filter;
  search: string;
  onClear: () => void;
}) {
  if (search || filter !== "all") {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-white/50 px-6 py-16 text-center">
        <Search className="mb-3 h-6 w-6 text-zinc-400" />
        <p className="text-sm font-medium text-zinc-900">No matching tasks</p>
        <p className="mt-1 text-xs text-zinc-500">
          Try a different search or filter.
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
