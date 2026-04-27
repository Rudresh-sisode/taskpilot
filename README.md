# TaskPilot — AI-Powered Task Management

> Submitted as an assignment by **Rudresh Sisodiya** (rudresh.sisode@creolestudios.com).

TaskPilot is a production-oriented fullstack task manager where authenticated users can create, edit, delete, categorize, and summarize tasks. Each task supports notes/context, status, labels, and an AI-generated summary with suggested next steps streamed to the UI in real time.

## Live URLs

- **Frontend:** `<FILL IN: https://your-vercel-domain>`
- **Backend API:** `<FILL IN: https://your-backend-domain>`

## Demo Credentials

Use the following account to log in and review the app without signing up:

```
Email:    <FILL IN: demo@taskpilot.app>
Password: <FILL IN: demo password>
```

Signup is also open if you'd prefer to create your own account — email confirmation is disabled in this Supabase project so you can log in immediately after signup.

## Tech Stack

**Frontend:** React 19, TypeScript, Vite 6, React Router 7, TanStack Query 5, Tailwind CSS 3, Radix UI primitives, Sonner (toasts), Lucide icons.

**Backend:** Node.js, Express 4, TypeScript, Zod (validation), Pino (logging), Helmet, express-rate-limit, OpenAI SDK.

**Data & Auth:** Supabase Postgres with Row Level Security, Supabase Auth (email/password, JWT).

**AI:** OpenAI Chat Completions (`gpt-4o-mini` by default), streamed to the browser over Server-Sent Events.

**Tooling:** ESLint 9, Prettier, Vitest + Supertest (backend tests), Docker Compose, GitHub Actions CI.

## Project Structure

```
taskpilot/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express bootstrap
│   │   ├── routes/                # tasks.ts, ai.ts (SSE)
│   │   ├── middleware/            # auth, rate limit, error envelope
│   │   ├── lib/                   # supabase, openai, prompt, cache
│   │   └── schemas/               # Zod request/response schemas
│   ├── db/migrations/             # SQL migrations (run in order)
│   └── tests/                     # Vitest + Supertest API tests
├── frontend/
│   ├── src/
│   │   ├── pages/                 # Login, Signup, TaskList, TaskDetail, ...
│   │   ├── components/            # UI primitives + feature components
│   │   ├── context/, hooks/, lib/ # auth context, query hooks, api client
│   │   └── App.tsx, main.tsx
│   └── nginx.conf, vercel.json    # production serving config
└── docker-compose.yml
```

## Auth Flow

1. The frontend signs the user in via the Supabase JS client (`@supabase/supabase-js` with the **anon** key).
2. Supabase returns a JWT access token, which the frontend attaches as `Authorization: Bearer <token>` to every backend request.
3. The Express backend verifies the JWT using the Supabase **service role** key and resolves the calling `user_id`.
4. All `tasks` and `ai_summaries` queries run as that user, and Postgres Row Level Security ensures a user can only read/write their own rows even if the API layer is bypassed.

The service role key never leaves the backend. The frontend only ever holds the anon key.

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

### Example requests

Create a task:

```bash
curl -X POST https://<backend>/api/tasks \
  -H "Authorization: Bearer $SUPABASE_JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"Ship onboarding flow","notes":"Wire up signup + email verify","status":"todo","labels":["frontend","auth"]}'
```

Sample response:

```json
{
  "ok": true,
  "data": {
    "id": "f1c4...",
    "title": "Ship onboarding flow",
    "notes": "Wire up signup + email verify",
    "status": "todo",
    "labels": ["frontend", "auth"],
    "created_at": "2026-04-27T07:21:04.000Z",
    "updated_at": "2026-04-27T07:21:04.000Z"
  }
}
```

Stream an AI summary (SSE):

```bash
curl -N https://<backend>/api/tasks/<task-id>/ai/stream \
  -H "Authorization: Bearer $SUPABASE_JWT"
```

Each event is one of:

```text
event: token
data: "next "

event: done
data: {"summary":"...","action_items":["...","..."]}
```

Validation error envelope:

```json
{
  "ok": false,
  "error": { "code": "VALIDATION_ERROR", "message": "title is required" }
}
```

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

### Backend environment (`backend/.env`)

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | no | `8080` | Port Express listens on. Defaults to 8080. |
| `SUPABASE_URL` | yes | `https://abc.supabase.co` | Supabase project URL. |
| `SUPABASE_SERVICE_ROLE_KEY` | yes | `eyJhbGciOi...` | Service role key. Used to verify JWTs and bypass RLS for admin reads. **Never expose to the frontend.** |
| `OPENAI_API_KEY` | yes | `sk-...` | OpenAI API key used for summary generation. |
| `OPENAI_MODEL` | no | `gpt-4o-mini` | Chat model to use. Defaults to `gpt-4o-mini`. |
| `ALLOWED_ORIGINS` | yes | `http://localhost:5173,https://app.example.com` | Comma-separated CORS allowlist. |

### Frontend environment (`frontend/.env`)

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `VITE_SUPABASE_URL` | yes | `https://abc.supabase.co` | Supabase project URL. |
| `VITE_SUPABASE_ANON_KEY` | yes | `eyJhbGciOi...` | Public anon key — safe to ship to the browser. |
| `VITE_API_BASE_URL` | yes | `http://localhost:8080` | Base URL of the deployed Express API. |

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

## Testing

The backend ships with a Vitest + Supertest suite at [backend/tests/api.test.ts](backend/tests/api.test.ts) covering:

- `GET /api/tasks` returns the task list for the authenticated user.
- `POST /api/tasks` creates a task and returns the expected response envelope.
- `POST /api/tasks` rejects an empty title with a `VALIDATION_ERROR`.
- `DELETE /api/tasks/:id` deletes a task.
- `GET /api/tasks/:id/ai/stream` returns a cached summary when one already exists for the task content hash.
- `GET /api/tasks/:id/ai/stream` streams tokens from OpenAI when no cache entry exists.

Run with:

```bash
cd backend
npm test
```

The frontend currently relies on type checking (`tsc -b`), ESLint, and manual QA. End-to-end coverage with Playwright is listed under [Future Improvements](#future-improvements).

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

## Known Limitations

Honest notes on what is *not* polished in this submission:

- **No automatic retry on AI failure.** If the OpenAI request fails mid-stream, the user has to click *Regenerate* manually. There's no exponential backoff or circuit breaker.
- **No frontend test coverage.** Only the backend has automated tests. The React side is verified via type checking, ESLint, and manual QA.
- **No per-user AI usage quota.** A logged-in user could repeatedly trigger generation; cost protection relies on the OpenAI account-level limit, not per-user metering.
- **Rate limiting is in-memory.** `express-rate-limit` uses the default in-process store, which doesn't share state across multiple backend instances. Fine for a single Railway/Render dyno; would need Redis for horizontal scale.
- **CORS allowlist is comma-separated env var.** Works, but doesn't support wildcards or preview deployments without redeploying the backend.
- **No observability stack.** Pino logs to stdout; there's no Sentry, OpenTelemetry, or structured error tracking wired up.
- **AI summary is JSON-parsed from a model response.** The prompt asks for strict JSON, but a malformed model response would surface as a generic error rather than degrading gracefully.
- **Email confirmation is disabled** in the demo Supabase project so reviewers can sign up instantly. A production deployment would re-enable it.

## Future Improvements

Given more time, the priorities would be:

- **Playwright E2E suite** covering signup → create task → stream summary → cache hit.
- **Background job queue** (BullMQ + Redis) so AI generation can be retried, throttled, and observed independently of the request lifecycle.
- **Per-user token/credit tracking** stored alongside `ai_summaries` to enforce quotas.
- **Sentry + OpenTelemetry** for error tracking and request tracing across frontend and backend.
- **Preview environments** — per-PR Vercel previews wired to a staging Supabase project, with stricter CORS validated against an env-driven regex.
- **Optimistic mutations on the frontend** for create/update/delete to make the UI feel instant on slow connections.
- **Search and pagination** on the task list once the per-user task count grows beyond what fits on one screen.

## Contact

Submitted by **Rudresh Sisodiya** — [rudresh.sisode@creolestudios.com](mailto:rudresh.sisode@creolestudios.com).

For review questions, please reply to the original submission email thread.

## License

Released under the [MIT License](LICENSE).

```
MIT License

Copyright (c) 2026 Rudresh Sisodiya

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
