# Learner Compass

Learner Compass is a React + TypeScript learning platform with a production-focused Fastify backend for stable, ranked search across tracks and courses.

## What was improved

- Added a real backend service in `server/` with Fastify.
- Added resilient search API: `GET /api/search`.
- Added overload/stability protections:
  - Rate limiting
  - Under-pressure protection (event loop + memory checks)
  - Compression + security headers
  - Health/readiness endpoints
  - Graceful shutdown on `SIGINT`/`SIGTERM`
- Added ranked search engine:
  - Tokenized + weighted field ranking (BM25-style)
  - Prefix and fuzzy typo matching
  - Branch-aware filtering
  - Snippet generation
  - TTL + LRU result caching
- Added global `Ctrl/Cmd + K` search in the UI.
- Upgraded tracks page search to backend-driven ranked results (tracks + courses).
- Added live multi-language IDE + compiler execution flow (Judge0-compatible provider API).
- Added adaptive `Today Mission` + `Learner DNA` personalization engine.
- Added OpenAI-backed adaptive coaching APIs:
  - Login profile insights
  - Gap analysis after failed runs
  - Hint-only stuck guidance (no full-solution output)
- Added YouTube personalized learning feed APIs and UI integration.
  - Includes curated fallback recommendations when YouTube API key is not configured.

## Project structure

- Frontend: `/src`
- Backend: `/server`
- Shared search logic: `/src/shared/catalogSearch.ts`

## Run locally

1. Install dependencies:

```bash
npm install
```

2. Start backend (port `4000` by default):

```bash
npm run server:dev
```

3. In another terminal, start frontend (port `8080` by default):

```bash
npm run dev
```

The Vite dev server proxies `/api`, `/healthz`, `/readyz`, and `/metrics` to the backend.

To enable live compiler execution, configure backend code-execution env vars in `.env.backend.example`.
To enable adaptive coaching and personalized videos, also configure `OPENAI_*` and `YOUTUBE_*` env vars.

### Compiler API key setup (Judge0 / RapidAPI / Piston)

1. Choose provider:
   - Self-hosted or managed Judge0: `CODE_EXEC_PROVIDER=judge0`
   - RapidAPI Judge0: `CODE_EXEC_PROVIDER=rapidapi-judge0`
   - Self-hosted Piston: `CODE_EXEC_PROVIDER=piston`
2. Set backend env vars:
   - `CODE_EXEC_API_URL`
   - `CODE_EXEC_API_KEY` (required for RapidAPI)
   - `CODE_EXEC_API_HOST` (RapidAPI host)
3. Configure fallback:
   - `CODE_EXEC_FALLBACK_PROVIDER=local-js` for stable JS fallback
   - `CODE_EXEC_FALLBACK_API_URL` only when you run an external fallback compiler
4. If `CODE_EXEC_API_URL` is empty, backend uses built-in local JS sandbox.
5. Restart backend.
6. Verify:

```bash
curl http://127.0.0.1:4000/api/code/languages
```

## Run with Docker Desktop

1. Start Docker Desktop.
2. Set keys in `/Users/supreetpatil/AMD_Slingshot/learner-compass/.env.docker`:
   - `YOUTUBE_API_KEY` for personalized videos
   - `OPENAI_API_KEY` for AI profile/hints
3. From project root:

```bash
npm run docker:up
```

4. Open:
- App: `http://localhost:8090` (or `FRONTEND_PORT` if set)
- Backend API: `http://localhost:4000/api/search?q=ml`

5. Stop containers:

```bash
npm run docker:down
```

6. Follow logs:

```bash
npm run docker:logs
```

## Production deployment (recommended)

Best uptime path:

1. Deploy backend to Google Cloud Run (autoscaling, health checks, revision rollout).
2. Deploy frontend to Vercel (global edge CDN).
3. Set Vercel env var `VITE_API_BASE_URL` to your Cloud Run backend URL.

This setup is stateless and scales horizontally without sticky sessions.

### Deploy both services to Cloud Run

From project root:

```bash
PROJECT_ID=<your-project-id> REGION=us-central1 npm run deploy:gcp
```

This script:

1. Builds and deploys backend (`Dockerfile.backend`).
2. Reads backend URL.
3. Builds frontend with `VITE_API_BASE_URL=<backend-url>`.
4. Deploys frontend (`Dockerfile.frontend`).

Optional for cross-instance cache consistency:

```bash
PROJECT_ID=<your-project-id> REGION=us-central1 REDIS_URL=redis://<host>:6379 npm run deploy:gcp
```

### Deploy frontend to Vercel

1. Import this repo into Vercel.
2. Framework preset: `Vite`.
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Environment variable:
   - `VITE_API_BASE_URL=https://<your-cloud-run-backend-url>`

`/Users/supreetpatil/AMD_Slingshot/learner-compass/vercel.json` already includes SPA route fallback.

## Backend endpoints

- `GET /healthz` - liveness
- `GET /readyz` - readiness and cache/index status
- `GET /metrics` - runtime counters
- `GET /api/search?q=<query>&type=all|track|course&branch=<branchId>&limit=<n>`
- `GET /api/code/languages` - available compiler runtimes
- `POST /api/code/execute` - run source code against test cases
- `POST /api/ai/profile-insight` - concise personalized profile
- `POST /api/ai/gap-analysis` - failure-pattern and plan analysis
- `POST /api/ai/hint` - hint-only guidance for stuck code
- `POST /api/learning/videos` - personalized YouTube recommendations

## Personalized UX features

- `/mission` route with daily adaptive tasks:
  - Recovery sprint (weak area)
  - Momentum builder (strong area)
  - Stretch challenge (growth area)
- Learner DNA metrics:
  - Streak
  - Acceptance rate
  - Strongest and focus language
  - Failure-memory patterns (repeated error types)
- Mission auto-completion when a mission task run passes all tests from practice IDE.
- Login-triggered concise AI learner profile (stored client-side with fallback mode).
- Adaptive gap-analysis + hint-only coaching in practice IDE.
- Personalized YouTube recommendations in dashboard and course player.

Example:

```bash
curl "http://127.0.0.1:4000/api/search?q=machine%20learning&type=all&limit=10"
```

## Environment variables

- `PORT` (default `4000`)
- `HOST` (default `0.0.0.0`)
- `MAX_SEARCH_RESULTS` (default `50`)
- `SEARCH_CACHE_TTL_MS` (default `30000`)
- `SEARCH_CACHE_MAX_ENTRIES` (default `2000`)
- `REQUEST_TIMEOUT_MS` (default `12000`)
- `KEEP_ALIVE_TIMEOUT_MS` (default `72000`)
- `RATE_LIMIT_MAX_PER_MINUTE` (default `300`)
- `REDIS_URL` (optional, enables distributed cache/rate-limit store across instances)
- `SEARCH_CACHE_REDIS_KEY_PREFIX` (default `search:`)
- `CODE_EXEC_PROVIDER` (`judge0`, `rapidapi-judge0`, `piston`, or `local-js`)
- `CODE_EXEC_API_URL` (Judge0-compatible API URL)
- `CODE_EXEC_API_KEY` (optional for Judge0; required for RapidAPI)
- `CODE_EXEC_API_HOST` (required for RapidAPI host routing)
- `CODE_EXEC_FALLBACK_PROVIDER` (default `local-js`)
- `CODE_EXEC_FALLBACK_API_URL` (optional external fallback endpoint)
- `CODE_EXEC_REQUEST_TIMEOUT_MS` (default `12000`)
- `CODE_EXEC_POLL_INTERVAL_MS` (default `700`)
- `CODE_EXEC_POLL_ATTEMPTS` (default `20`)
- `CODE_EXEC_MAX_TEST_CASES` (default `20`)
- `CODE_EXEC_MAX_SOURCE_CHARS` (default `20000`)
- `OPENAI_API_KEY` (required for adaptive AI endpoints)
- `OPENAI_API_URL` (default `https://api.openai.com/v1`)
- `OPENAI_MODEL` (default `gpt-4.1-mini`)
- `OPENAI_REQUEST_TIMEOUT_MS` (default `18000`)
- `OPENAI_MAX_CONTEXT_CHARS` (default `12000`)
- `YOUTUBE_API_KEY` (required for personalized video endpoints)
- `YOUTUBE_API_URL` (default `https://www.googleapis.com/youtube/v3`)
- `YOUTUBE_DEFAULT_MAX_RESULTS` (default `6`)
- `YOUTUBE_REQUEST_TIMEOUT_MS` (default `10000`)
- `VITE_API_BASE_URL` (optional frontend override for API base URL)

Example env templates:

- Backend: `/Users/supreetpatil/AMD_Slingshot/learner-compass/.env.backend.example`
- Frontend: `/Users/supreetpatil/AMD_Slingshot/learner-compass/.env.frontend.example`
- Docker Compose overrides: `/Users/supreetpatil/AMD_Slingshot/learner-compass/.env.docker.example`
- Active Docker env file used by scripts: `/Users/supreetpatil/AMD_Slingshot/learner-compass/.env.docker`

## Validation

- Tests:

```bash
npm test
```

- Build:

```bash
npm run build
```

## Scaling to 10k+ users (recommended deployment setup)

Use this backend with:

1. 2-4 stateless API replicas behind a load balancer.
2. Sticky-free routing (cache is local and safe to miss).
3. Autoscaling based on CPU + latency (`Cloud Run` min instances >= 1).
4. Optional Redis (`REDIS_URL`) for cross-instance cache/rate-limit consistency.
5. Standard observability (request latency, error rate, saturation).

This codebase now includes the backend-level protections and search architecture needed to support that rollout safely.
