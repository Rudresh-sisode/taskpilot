# TaskPilot — AI-Powered Task Management

A fullstack task manager where users create/edit/delete tasks, attach notes, and receive AI-generated summaries and action items streamed in real time via SSE.

**Live URLs:**
- Frontend: `https://<vercel-domain>` *(update after deploy)*
- Backend: `https://<railway-domain>` *(update after deploy)*

## Architecture

```
Browser (React + Vite)
  │
  ├── Auth ──► Supabase Auth (client-side)
  │
  └── API ──► Express on Railway
                  ├── CRUD ──► Supabase Postgres
                  └── SSE  ──► OpenAI (gpt-4o-mini, streaming)
                                  │
                                  └── persists to ai_summaries table
```

## API

All responses use envelope: `{ ok: true, data }` / `{ ok: false, error: { code, message } }`

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Liveness check |
| GET | `/api/tasks` | List current user's tasks |
| POST | `/api/tasks` | Create task |
| GET | `/api/tasks/:id` | Get task + latest AI summary |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| GET | `/api/tasks/:id/ai/stream` | SSE — stream AI summary |

## Streaming: SSE over WebSocket

AI token streaming is one-way (server → client). SSE is plain HTTP — works through Railway/Vercel without sticky sessions or socket upgrade issues, auto-reconnects in the browser, and is trivially testable with `curl`. WebSocket would add infra friction for no benefit here.

## AI Prompt

System prompt used for generation:

```
You are a concise project assistant. Given a task title and notes, produce:
1) A 1–2 sentence summary capturing the intent.
2) 3–6 concrete, actionable next steps as imperative bullets (start with a verb).
Return STRICT JSON: {"summary": string, "action_items": string[]}.
Do not include markdown, code fences, or commentary.
```

User message template:
```
Title: <task title>
Notes: <task notes, truncated to 4000 chars>
```

## Local Setup

```bash
git clone <repo-url> && cd taskpilot

# Backend
cd backend
cp .env.example .env   # fill in real values
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env.local   # fill in real values
npm install
npm run dev
```

Or with Docker:
```bash
docker compose up      # starts backend on :8080
cd frontend && npm run dev   # Vite dev server on :5173
```

## Deployment

1. **Vercel** — import repo, root = `frontend/`, framework = Vite. Set env vars.
2. **Supabase** — create project, run `backend/db/migrations/0001_init.sql`, enable RLS.
3. **Railway** — import repo, root = `backend/`, set env vars. Note public URL.
4. Wire `VITE_API_BASE_URL` in Vercel → Railway URL. Add Vercel domain to `ALLOWED_ORIGINS` in Railway.

## Tradeoffs & Future Improvements

- **E2E tests** — would add Playwright for full flow coverage
- **Error monitoring** — Sentry integration
- **Per-user AI quotas** — track token usage per user
- **Background queue** — BullMQ for async AI generation
- **Summary diffing** — only regenerate changed sections
- **Image attachments** — file upload to Supabase Storage
- **Mobile polish** — responsive refinements
