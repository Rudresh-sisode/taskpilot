import { supabase } from "./supabase";

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
  status: "open" | "done";
  created_at: string;
  updated_at: string;
  ai_summary?: { id: string; summary: string; action_items: string[]; created_at: string } | null;
}

export const api = {
  listTasks: () => request<Task[]>("/api/tasks"),
  getTask: (id: string) => request<Task>(`/api/tasks/${id}`),
  createTask: (body: { title: string; notes?: string }) =>
    request<Task>("/api/tasks", { method: "POST", body: JSON.stringify(body) }),
  updateTask: (id: string, body: Partial<Pick<Task, "title" | "notes" | "status">>) =>
    request<Task>(`/api/tasks/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteTask: (id: string) =>
    request<null>(`/api/tasks/${id}`, { method: "DELETE" }),
};
