import { supabase } from "./supabase";
import type { TaskStatus } from "./status";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function getToken() {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? "";
}

async function request<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...opts.headers,
    },
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error?.message || "Request failed");
  return json.data;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  status: TaskStatus;
  labels: string[];
  created_at: string;
  updated_at: string;
  ai_summary?: { id: string; summary: string; action_items: string[]; created_at: string } | null;
}

type TaskPayload = Omit<Task, "labels"> & {
  labels?: unknown;
};

function normalizeLabels(labels: unknown): string[] {
  return Array.isArray(labels)
    ? labels.filter((label): label is string => typeof label === "string")
    : [];
}

function normalizeTask(task: TaskPayload): Task {
  return {
    ...task,
    labels: normalizeLabels(task.labels),
  };
}

export interface TaskListPage {
  items: Task[];
  total: number;
  nextOffset: number | null;
}

interface TaskListPagePayload {
  items: TaskPayload[];
  total: number;
  nextOffset: number | null;
}

export interface ListTasksParams {
  limit?: number;
  offset?: number;
  status?: TaskStatus;
}

export const api = {
  listTasks: async (params: ListTasksParams = {}): Promise<TaskListPage> => {
    const qs = new URLSearchParams();
    qs.set("limit", String(params.limit ?? 10));
    qs.set("offset", String(params.offset ?? 0));
    if (params.status) qs.set("status", params.status);
    const page = await request<TaskListPagePayload>(`/api/tasks?${qs.toString()}`);
    return {
      items: page.items.map(normalizeTask),
      total: page.total,
      nextOffset: page.nextOffset,
    };
  },
  getTask: async (id: string) => {
    const task = await request<TaskPayload>(`/api/tasks/${id}`);
    return normalizeTask(task);
  },
  createTask: (body: { title: string; notes?: string; labels?: string[] }) =>
    request<TaskPayload>("/api/tasks", { method: "POST", body: JSON.stringify(body) }).then(
      normalizeTask,
    ),
  updateTask: (
    id: string,
    body: Partial<Pick<Task, "title" | "notes" | "status" | "labels">>,
  ) =>
    request<TaskPayload>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }).then(normalizeTask),
  deleteTask: (id: string) =>
    request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
};
