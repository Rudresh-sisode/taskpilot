# TaskPilot — AI-Powered Task Management

TaskPilot is a production-oriented fullstack task manager where authenticated users can create, edit, delete, categorize, and summarize tasks. Each task supports notes/context, status, labels, and an AI-generated summary with suggested next steps streamed to the UI in real time.

**Live URLs**
- Frontend: `https://<vercel-domain>` *(replace before submission)*
- Backend API: `https://<railway-or-render-domain>` *(replace before submission)*

## Architecture

```text
                 TASKPILOT REQUEST FLOW

  +---------------------------+        auth session         +------------------+
  |                           |--------------------------->|                  |
  |   Browser / React / Vite  |                            |  Supabase Auth   |
  |                           |<---------------------------|                  |
  +-------------+-------------+        access token         +------------------+
                |
                | REST + Bearer token
                v
  +-------------+-------------------------------------------------------------+
  |                         Express API on Railway                            |
  |                                                                           |
  |  +----------------+     +----------------+     +-----------------------+  |
  |  | Auth middleware|---->| Task CRUD API  |---->| Supabase Postgres     |  |
  |  +----------------+     | /api/tasks     |     | tasks + ai_summaries  |  |
  |                         +----------------+     +-----------------------+  |
  |                                  |                         ^              |
  |                                  | cache hit / persist      |              |
  |                                  v                         |              |
  |                         +----------------+                  |              |
  |                         | AI SSE stream  |------------------+              |
  |                         | /ai/stream     |                                 |
  |                         +-------+--------+                                 |
  +---------------------------------+-----------------------------------------+
                                    |
                                    | streamed tokens
                                    v
                           +------------------+
                           | OpenAI Chat API  |
                           +------------------+

  The browser receives SSE token events progressively, then a final structured
  summary + action item payload is cached against the task content hash.
```

## Features

- Email/password authentication with Supabase Auth.
- Task CRUD with title, notes, status, and labels.
- Task detail editor with debounced autosave and manual save shortcut.
- AI summary panel that streams generated text progressively.
- AI response caching by task content hash to avoid unnecessary regeneration.
- Status and label filtering on the task list.
- Accessible destructive confirmation dialog for deleting tasks.
- Consistent API response envelope and input validation.
- Backend rate limiting, Helmet headers, CORS configuration, and RLS-backed data isolation.

## API

All successful responses use:

```json
{ "ok": true, "data": {} }
```

Errors use:

```json
{ "ok": false, "error": { "code": "ERROR_CODE", "message": "Human readable message" } }
```

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Liveness check |
| `GET` | `/api/tasks` | List current user's tasks |
| `POST` | `/api/tasks` | Create a task |
| `GET` | `/api/tasks/:id` | Get task plus latest AI summary |
| `PATCH` | `/api/tasks/:id` | Update title, notes, status, or labels |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `GET` | `/api/tasks/:id/ai/stream` | Stream AI summary with SSE |

## Streaming Choice

The AI endpoint uses **Server-Sent Events** instead of WebSockets. The stream is one-way from server to browser, so SSE keeps the implementation simple, works over normal HTTP, avoids sticky-session/socket upgrade requirements on common hosting platforms, and gives the browser built-in reconnect behavior. The frontend can cancel a stream by closing the `EventSource`, and the backend aborts the OpenAI request when the client disconnects.

## AI Prompt

System prompt used for generation:

```text
You are a concise project assistant. Given a task title and notes, produce:
1) A 1–2 sentence summary capturing the intent.
2) 3–6 concrete, actionable next steps as imperative bullets (start with a verb).
Return STRICT JSON: {"summary": string, "action_items": string[]}.
Do not include markdown, code fences, or commentary.
```

User message template:

```text
Title: <task title>
Notes: <task notes, truncated to 4000 chars>
```

## Database

Supabase Postgres is used as the primary database.

- `tasks`: typed task data, user ownership, notes, status, labels, timestamps.
- `ai_summaries`: generated summary history/cache linked to tasks.
- Indexes:
  - `tasks(user_id, created_at desc)`
  - `ai_summaries(task_id, input_hash)` unique cache key
  - `ai_summaries(task_id, created_at desc)`
  - GIN index on `tasks.labels`
- Row Level Security is enabled on task-owned data.

Run migrations in Supabase SQL Editor in order:

```text
backend/db/migrations/0001_init.sql
backend/db/migrations/0002_status_and_labels.sql
```

## Local Setup

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend runs on `http://localhost:8080`.

Backend environment:

```text
PORT=8080
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
ALLOWED_ORIGINS=http://localhost:5173
```

Frontend environment:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8080
```

The Supabase service role key must only be used by the backend. The frontend should only use the Supabase anon/public key.

## Docker

The full local stack can be run with Docker Compose:

```bash
docker compose up
```

This starts:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080`

Compose reads backend settings from `backend/.env` and frontend settings from `frontend/.env`. The frontend container runs the Vite dev server with a bind mount, so local frontend edits are picked up without rebuilding.

Useful Docker commands:

```bash
docker compose up --build
docker compose up --build -d
docker compose logs -f backend frontend
docker compose down
```

## Quality Checks

Backend:

```bash
cd backend
npm run lint
npm run typecheck
npm run build
npm test
```

Frontend:

```bash
cd frontend
npm run lint
npm run typecheck
npm run build
```

GitHub Actions runs these checks on `push` and `pull_request`, and can also be triggered manually from the Actions tab.

## Deployment

Suggested deployment path:

1. **Supabase**
   - Create a project.
   - Run both SQL migrations listed above.
   - Enable/configure email auth.
   - Copy the project URL, anon key, and service role key.

2. **Backend: Railway, Render, or Fly.io**
   - Deploy from the `backend/` directory.
   - Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `OPENAI_MODEL`, and `ALLOWED_ORIGINS`.
   - Set `ALLOWED_ORIGINS` to the deployed frontend URL.

3. **Frontend: Vercel**
   - Deploy from the `frontend/` directory.
   - Set `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_API_BASE_URL`.
   - Set `VITE_API_BASE_URL` to the deployed backend API URL.

4. Update the live URLs at the top of this README before submission.

## Tradeoffs & Future Improvements

- **Automatic AI retry/backoff:** the app supports user-triggered regenerate and stream cancellation, but automatic retry policy could be stronger.
- **E2E coverage:** backend API tests exist; Playwright coverage would better prove the full signup/task/AI flow.
- **Background jobs:** AI generation is request-driven today. A queue such as BullMQ would help for longer-running jobs or quotas.
- **Usage quotas:** per-user AI token tracking would protect costs in production.
- **Observability:** Sentry or OpenTelemetry would improve production debugging.
- **Deployment hardening:** add preview/prod environment separation and stricter CORS validation.
