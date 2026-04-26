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

export const api = {
  listTasks: async () => {
    const tasks = await request<TaskPayload[]>("/api/tasks");
    return tasks.map(normalizeTask);
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
