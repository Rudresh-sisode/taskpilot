import { supabase } from "./supabase";
import type { TaskStatus } from "./status";

const BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const AUTH_EXPIRED_MESSAGE = "Your session expired. Please sign in again.";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

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
  if (res.status === 401 || json.error?.code === "UNAUTHORIZED") {
    await supabase.auth.signOut();
    throw new ApiError(AUTH_EXPIRED_MESSAGE, 401, "UNAUTHORIZED");
  }
  if (!json.ok) {
    throw new ApiError(
      json.error?.message || "Request failed",
      res.status,
      json.error?.code,
    );
  }
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

function trimTaskText<T extends { title?: string; notes?: string }>(body: T): T {
  return {
    ...body,
    ...(body.title !== undefined ? { title: body.title.trim() } : {}),
    ...(body.notes !== undefined ? { notes: body.notes.trim() } : {}),
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
    request<TaskPayload>("/api/tasks", {
      method: "POST",
      body: JSON.stringify(trimTaskText(body)),
    }).then(normalizeTask),
  updateTask: (
    id: string,
    body: Partial<Pick<Task, "title" | "notes" | "status" | "labels">>,
  ) =>
    request<TaskPayload>(`/api/tasks/${id}`, {
      method: "PATCH",
      body: JSON.stringify(trimTaskText(body)),
    }).then(normalizeTask),
  deleteTask: (id: string) =>
    request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
};
