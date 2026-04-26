import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import { supabase } from "../lib/supabase";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Card } from "../components/Card";

export default function TaskList() {
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const { data: tasks, isLoading } = useQuery({ queryKey: ["tasks"], queryFn: api.listTasks });

  const create = useMutation({
    mutationFn: api.createTask,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["tasks"] }); setTitle(""); },
  });

  const del = useMutation({
    mutationFn: api.deleteTask,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    create.mutate({ title: title.trim() });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Tasks</h1>
        <Button variant="ghost" onClick={() => supabase.auth.signOut()}>Sign out</Button>
      </div>

      <form onSubmit={handleCreate} className="mb-6 flex gap-2">
        <Input placeholder="New task title…" value={title} onChange={setTitle} className="flex-1" />
        <Button type="submit" disabled={create.isPending}>Add</Button>
      </form>

      {isLoading && <p className="text-gray-500">Loading…</p>}

      {tasks?.length === 0 && (
        <p className="text-center text-gray-400 py-12">No tasks yet. Create one above!</p>
      )}

      <div className="space-y-2">
        {tasks?.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <Link to={`/tasks/${t.id}`} className="flex-1 truncate hover:text-blue-600">
              <span className={t.status === "done" ? "line-through text-gray-400" : ""}>{t.title}</span>
            </Link>
            <Button variant="ghost" onClick={() => del.mutate(t.id)} className="text-red-500 text-sm ml-2">
              Delete
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}
