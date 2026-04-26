-- Extend task status enum (open → in_progress → done, plus cancelled)
alter table tasks drop constraint if exists tasks_status_check;
alter table tasks
  add constraint tasks_status_check
  check (status in ('open', 'in_progress', 'done', 'cancelled'));

-- Labels: array of label slugs (catalog defined client-side)
alter table tasks
  add column if not exists labels text[] not null default '{}';

create index if not exists tasks_labels_gin_idx on tasks using gin (labels);
