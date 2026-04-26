-- Tasks table
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  notes text not null default '',
  status text not null default 'open' check (status in ('open','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_user_created_idx on tasks(user_id, created_at desc);

-- RLS for tasks
alter table tasks enable row level security;
create policy "Users manage own tasks" on tasks
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- AI summaries table (1:N, keeps regeneration history, enables caching)
create table ai_summaries (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  input_hash text not null,
  model text not null,
  summary text not null,
  action_items text[] not null default '{}',
  created_at timestamptz not null default now()
);

create unique index ai_summaries_task_hash_idx on ai_summaries(task_id, input_hash);
create index ai_summaries_task_created_idx on ai_summaries(task_id, created_at desc);

-- RLS for ai_summaries (via tasks ownership)
alter table ai_summaries enable row level security;
create policy "Users read own summaries" on ai_summaries
  for select using (
    exists (select 1 from tasks where tasks.id = ai_summaries.task_id and tasks.user_id = auth.uid())
  );
