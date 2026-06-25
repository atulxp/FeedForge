# FeedForge

FeedForge is a local-first social command center for connecting brand channels, syncing real performance data, composing content, scheduling/publishing posts, viewing analytics, using AI-assisted recommendations, and exporting reports.

The app is currently a working local product slice. It is intentionally honest about data: dashboards should show real connected-channel data or clear empty states, not fake filler metrics.

## What Works Now

- Login, signup, logout, and HTTP-only cookie sessions.
- User-isolated workspaces so one signed-in user cannot see another user's accounts, posts, reports, or tokens.
- Frontend dashboard for overview, analytics, content, calendar, reports, AI insights, and settings.
- Brand/channel connection setup from the Settings dashboard.
- Per-workspace platform credentials saved from the frontend.
- Encrypted storage for platform client secrets and OAuth tokens.
- YouTube OAuth connection, account validation, channel metrics, and recent upload backfill.
- Reddit OAuth callback flow.
- X OAuth callback flow with PKCE.
- Sample channel connection for local testing on all supported platforms.
- Connected-channel cards with freshness indicators.
- Overview metrics, daily reach chart, latest published content, top content, and upcoming posts.
- Analytics page with metric selector, denominator selector, account summary, ranked content, clearer heatmap, trends, and clip attribution empty states.
- Composer with multi-account selection, content type rules, per-platform overrides, scheduling, approval submission, immediate publish action, and AI caption generation.
- Calendar list with status filters, sorting, retry, publish now, archive, and readable published/scheduled dates.
- Reports page with new report creation, CSV export, and report deletion.
- AI Insights page using stored workspace data and local Ollama when available.
- AI suggestions can be sent into the composer.
- Local durable storage in `apps/api/data/local-state.json` for development.

## Current Platform Status

| Platform | Current Status | Notes |
|---|---|---|
| YouTube | Live OAuth, account sync, analytics, recent upload backfill | This is the most complete direct adapter. |
| Reddit | Real OAuth callback and token storage | Publishing/read depth still needs expansion for production. |
| X | Real OAuth callback, PKCE, token storage | Cost/rate limits must be handled carefully before production scale. |
| Instagram | Credential setup UI and OAuth URL shell | Requires Meta app review and final callback/publishing adapter. |
| Facebook | Credential setup UI and OAuth URL shell | Requires Meta app review and Page permissions. |
| Threads | Credential setup UI and OAuth URL shell | Requires Meta app review and token refresh handling. |
| TikTok | Credential setup UI and OAuth URL shell | Requires TikTok audit; content may remain private until approved. |
| LinkedIn | Credential setup UI and OAuth URL shell | Direct analytics/publishing may require partner approval. |

For unsupported or not-yet-approved live platforms, the app provides a sample channel option so the UI workflow can be tested without pretending the integration is production-ready.

## Tech Stack

| Layer | Technology | Current Use |
|---|---|---|
| Monorepo | pnpm workspaces + Turbo | Runs web, API, shared packages, and database package. |
| Frontend | Next.js App Router + React + TypeScript | Dashboard pages and interactive UI. |
| API | NestJS + TypeScript | Auth, accounts, OAuth callbacks, dashboard, analytics, posts, reports, AI. |
| Shared contracts | TypeScript package `@zpf/shared` | Shared API/domain types between web and API. |
| Database package | Drizzle schema package | Production schema foundation. |
| Local storage | JSON file store | Current development persistence at `apps/api/data/local-state.json`. |
| Styling | Plain CSS in `apps/web/src/app/globals.css` | Product UI styling. |
| AI | Ollama-compatible local API | Uses `llama3.2` by default for captions/recommendations. |
| Infrastructure | Docker Compose | PostgreSQL, Redis, MinIO, and optional tools are scaffolded. |

## How To Run Locally

### 1. Install prerequisites

- Node.js 20 or newer.
- pnpm 9 or newer. Corepack is recommended.
- Git.
- Optional: Docker Desktop for Postgres/Redis/MinIO.
- Optional: Ollama for local AI features.

If pnpm is not installed globally, enable it through Corepack:

```powershell
corepack enable
corepack prepare pnpm@9.0.0 --activate
```

### 2. Install dependencies

```powershell
pnpm install
```

### 3. Create `.env`

Copy `.env.example` to `.env`.

```powershell
Copy-Item .env.example .env
```

At minimum for local development, set:

```env
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENCRYPTION_KEY=<64-character-hex-key>
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CORS_ORIGINS=http://localhost:3000
```

Generate an encryption key in PowerShell:

```powershell
-join ((1..32) | ForEach-Object { '{0:x2}' -f (Get-Random -Minimum 0 -Maximum 256) })
```

Do not commit `.env`.

### 4. Start the app

```powershell
pnpm dev
```

Open:

```text
http://localhost:3000
```

API health:

```text
http://localhost:4000/api/health
```

### 5. Create a workspace

Use the signup page to create a workspace, then connect channels from Settings.

## Useful Commands

```powershell
pnpm dev
pnpm typecheck
pnpm lint
pnpm build
pnpm docker:dev
pnpm docker:down
```

## Local AI Setup

FeedForge can use Ollama running on your machine.

Install Ollama, then run:

```powershell
ollama pull llama3.2
ollama serve
```

Set in `.env`:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

AI features are intentionally human-confirmed. FeedForge should suggest and draft; the user approves before publishing.

## Channel Connection Workflow

The intended user flow is:

1. User signs in to FeedForge.
2. User opens Settings.
3. User chooses a platform.
4. User adds that brand's platform Client ID and Client Secret.
5. FeedForge saves those credentials encrypted for that workspace.
6. User clicks Connect.
7. FeedForge starts the platform OAuth flow using the required scopes.
8. User authorizes on the platform's sign-in screen.
9. FeedForge validates the connection with a low-cost read call where available.
10. Tokens are saved encrypted.
11. Account appears in Settings and channel selectors.
12. FeedForge queues or performs initial backfill where implemented.

This design means each brand can configure its own platform apps from the dashboard without editing backend code.

## OAuth Redirect URLs

Use these local callback URLs when configuring platform apps:

```text
YouTube: http://localhost:4000/api/accounts/oauth/youtube/callback
Reddit:  http://localhost:4000/api/accounts/oauth/reddit/callback
X:       http://localhost:4000/api/accounts/oauth/x/callback
```

Other platform shells use:

```text
http://localhost:4000/api/accounts/oauth/<platform>/callback
```

In production, replace `localhost` with the production API domain and update platform app settings.

## How Keys And Tokens Are Secured

FeedForge has two types of sensitive values:

1. Platform app credentials:
   - Client ID
   - Client Secret

2. Connected account tokens:
   - Access token
   - Refresh token
   - Expiry
   - Granted scopes

Security behavior in the current local app:

- Secrets are never exposed as public frontend environment variables.
- Per-brand credentials are entered from Settings and sent to the API.
- Client secrets and OAuth tokens are encrypted before being written to local state.
- Encryption uses an app-level `ENCRYPTION_KEY`.
- Session cookies are HTTP-only.
- OAuth state is validated.
- X uses PKCE verifier/challenge flow.
- Connected accounts are scoped by user/workspace.
- Deleting/disconnecting a channel removes stored tokens for that channel.

Production hardening still required:

- Store encryption keys in a secret manager, not `.env` on disk.
- Rotate encryption keys with a migration plan.
- Move local JSON storage to PostgreSQL.
- Add audit logs for account connect/disconnect, report export, publish, delete, and credential changes.
- Add rate limiting.
- Add CSRF protection or same-site plus explicit mutation safeguards.
- Add request logging that redacts secrets and tokens.
- Add role-based access control.
- Add backup and restore strategy.
- Add error monitoring such as Sentry or OpenTelemetry.

## User And Workspace Isolation

Every user has isolated local state:

- Accounts are filtered by signed-in user.
- Posts are filtered by signed-in user.
- Reports are filtered by signed-in user.
- Provider credentials are filtered by signed-in user.
- OAuth tokens are tied to the account and user.

This prevents cross-user leakage in the local app. For production, this should become organization/workspace-level isolation with database constraints and role permissions.

## Product Modules

### Overview

The Overview page shows:

- Selected date range.
- Metric tiles with explanations.
- Connected platform cards.
- Freshness indicators.
- Daily reach chart.
- Latest published content.
- Top content ranked by real metrics.
- Upcoming publishing items.

Date ranges:

- 28 days.
- 90 days.
- Custom range.

### Analytics

The Analytics page shows:

- Metric selector.
- Denominator selector.
- Connected account summary.
- Best performers.
- Post-level rankings when available.
- Channel-level fallback summary when post-level data is not yet available.
- Engagement heatmap by day and hour.
- Trends from tagged content.
- Clip-to-episode attribution area.

Metric rules:

- Raw counts are stored.
- Rates are computed at query time.
- Platform-specific definitions are labeled rather than falsely merged.

### Composer

The Composer supports:

- Internal title.
- Master post copy.
- Content type.
- Campaign tag.
- Target account selection.
- Per-platform overrides.
- Threads character validation.
- Instagram no-text-only validation.
- Schedule time.
- Submit for approval.
- Publish now.
- AI caption generation.
- AI Insight suggestions prefilled into composer.

### Calendar

The Calendar supports:

- Status filters.
- Sorting by latest, oldest, status, or title.
- Published and scheduled date display.
- Approval action.
- Retry action.
- Publish now action.
- Archive action.
- Long description clamping for readability.

### Reports

The Reports page supports:

- Create new report.
- Date/time-based report naming.
- CSV export.
- Delete report.
- Authenticated export using the current user's owned data.

Generated report names look like:

```text
Analytics Report - 21 Jun 2026, 12:08 am
```

### AI Insights

AI Insights includes:

- Best posting time suggestions from stored engagement history.
- Viral score estimates from real stored post metrics.
- Recommendations from stored workspace data.
- Clip nominations placeholder until transcripts/source links exist.
- Buttons that send suggestions into Composer.

The AI layer should stay thin and swappable. Local Ollama is the current default, but production can add cloud fallback later.

### Settings

Settings supports:

- Connected channel list.
- Disconnect channel.
- Add platform credentials.
- Remove saved credentials.
- Start OAuth connect flow.
- Use sample channel for local testing.
- Platform logos/colors.
- Connection guide.

## Backend API Areas

Main controllers:

- `auth`: signup, login, logout, current user.
- `accounts`: list accounts, configure credentials, start connect flow, OAuth callbacks, disconnect.
- `dashboard`: overview metrics and content summary.
- `analytics`: metric ranking, heatmap, trends, attribution.
- `posts`: create, update status, retry, publish.
- `reports`: list, save, export CSV, delete.
- `ai-insights`: insights and caption generation.
- `health`: API health check.

Important local API URLs:

```text
GET  /api/health
GET  /api/dashboard
GET  /api/analytics
GET  /api/accounts
GET  /api/posts
GET  /api/reports
POST /api/reports
GET  /api/reports/:id/export.csv
DELETE /api/reports/:id
GET  /api/ai-insights
POST /api/ai-insights/caption
```

## File Structure

```text
.
|-- apps
|   |-- api
|   |   |-- data
|   |   |   `-- local-state.json
|   |   |-- src
|   |   |   |-- auth
|   |   |   |   `-- http-session.ts
|   |   |   |-- modules
|   |   |   |   |-- accounts
|   |   |   |   |-- ai
|   |   |   |   |-- analytics
|   |   |   |   |-- auth
|   |   |   |   |-- dashboard
|   |   |   |   |-- health
|   |   |   |   |-- posts
|   |   |   |   `-- reports
|   |   |   |-- store
|   |   |   |   |-- local.store.ts
|   |   |   |   `-- seed.ts
|   |   |   |-- app.module.ts
|   |   |   `-- main.ts
|   |   `-- package.json
|   `-- web
|       |-- src
|       |   |-- app
|       |   |   |-- ai-insights
|       |   |   |-- analytics
|       |   |   |-- calendar
|       |   |   |-- content
|       |   |   |-- login
|       |   |   |-- reports
|       |   |   |-- settings
|       |   |   |-- signup
|       |   |   |-- globals.css
|       |   |   |-- layout.tsx
|       |   |   `-- page.tsx
|       |   |-- components
|       |   `-- lib
|       `-- package.json
|-- packages
|   |-- database
|   |   `-- src
|   |       |-- schema.ts
|   |       |-- seed.ts
|   |       `-- index.ts
|   `-- shared
|       `-- src
|           `-- index.ts
|-- infra
|   `-- docker
|       `-- docker-compose.dev.yml
|-- scripts
|   `-- run-turbo.ps1
|-- .env.example
|-- package.json
`-- README.md
```

## Important Files And What They Do

### Root

- `package.json`: monorepo scripts and workspace config.
- `.env.example`: documented environment variable template.
- `.env`: local secrets and config. Do not commit.
- `scripts/run-turbo.ps1`: Windows-friendly Turbo runner used by scripts.

### API

- `apps/api/src/main.ts`: starts NestJS, CORS, API prefix, port.
- `apps/api/src/app.module.ts`: registers controllers and store.
- `apps/api/src/auth/http-session.ts`: session cookie helpers and current-user lookup.
- `apps/api/src/store/local.store.ts`: current local persistence layer, encryption, auth, accounts, posts, analytics, reports, YouTube sync.
- `apps/api/src/store/seed.ts`: seed users/data.
- `apps/api/src/modules/accounts/accounts.controller.ts`: credentials, connect flows, OAuth callbacks, disconnect.
- `apps/api/src/modules/accounts/account-oauth.ts`: platform OAuth URL generation and scope notes.
- `apps/api/src/modules/dashboard/dashboard.controller.ts`: overview data.
- `apps/api/src/modules/analytics/analytics.controller.ts`: analytics snapshot.
- `apps/api/src/modules/posts/posts.controller.ts`: content lifecycle endpoints.
- `apps/api/src/modules/reports/reports.controller.ts`: reports CRUD/export.
- `apps/api/src/modules/ai/ai.controller.ts`: AI insights and captions.

### Web

- `apps/web/src/app/layout.tsx`: global app shell and providers.
- `apps/web/src/components/app-shell.tsx`: sidebar, nav, profile, topbar.
- `apps/web/src/components/auth-provider.tsx`: session loading and auth state.
- `apps/web/src/lib/api.ts`: frontend API client.
- `apps/web/src/lib/format.ts`: display helpers for platforms, dates, freshness, numbers.
- `apps/web/src/app/page.tsx`: Overview page.
- `apps/web/src/app/analytics/page.tsx`: Analytics page.
- `apps/web/src/app/content/page.tsx`: Content list.
- `apps/web/src/app/content/new/page.tsx`: Composer.
- `apps/web/src/app/calendar/page.tsx`: Calendar list.
- `apps/web/src/app/reports/page.tsx`: Reports page.
- `apps/web/src/app/ai-insights/page.tsx`: AI Insights page.
- `apps/web/src/app/settings/page.tsx`: Channel connection and credentials UI.
- `apps/web/src/app/globals.css`: all current styling.

### Shared And Database

- `packages/shared/src/index.ts`: shared domain and API types.
- `packages/database/src/schema.ts`: Drizzle schema foundation for production database.
- `packages/database/src/seed.ts`: database seed foundation.

## Data Storage

Current local development storage:

```text
apps/api/data/local-state.json
```

This stores local users, sessions, provider credentials, accounts, posts, reports, OAuth states, and tokens. Sensitive values are encrypted before being written.

Production target:

- PostgreSQL for durable relational data.
- Redis/BullMQ for background jobs and scheduled publishing.
- S3/MinIO for assets and raw payload archives.
- Optional ClickHouse later only if analytics volume grows enough to justify it.

## Production-Grade API Guidance

Before using this as a production web app, the following must be completed.

### Platform API availability and approvals

- YouTube:
  - Enable YouTube Data API v3.
  - Enable YouTube Analytics API.
  - Create OAuth web app credentials.
  - Add production redirect URI.
  - Submit verification if requesting sensitive/restricted scopes outside testing.

- Meta: Instagram, Facebook, Threads:
  - Create Meta business app.
  - Add needed products.
  - Configure OAuth redirect URIs.
  - Submit App Review for publishing and insight scopes.
  - Use Business/Creator accounts where required.

- TikTok:
  - Create TikTok developer app.
  - Apply for Content Posting API.
  - Complete audit.
  - Implement required privacy selector UX.
  - Expect content to be private until audit passes.

- LinkedIn:
  - Create LinkedIn developer app.
  - Apply for Marketing Developer Platform or use a unified provider.
  - Organization posting is more realistic than personal profile posting.

- X:
  - Create developer app.
  - Enable OAuth 2.0.
  - Track read/write costs.
  - Add hard spend/rate limits.

- Reddit:
  - Create a Reddit web app.
  - Set correct user agent.
  - Respect subreddit posting rules and API limits.

### Recommended v1 production path

Use direct YouTube first because it is strong and relatively accessible.

For Meta/TikTok/LinkedIn, consider a unified provider such as Ayrshare or Zernio for v1 publishing while direct app approvals run in parallel. Replace provider-backed adapters with direct adapters later where volume, cost, or control justifies it.

## Need Attention / Known Gaps

These are the important open items:

- Move from `local-state.json` to PostgreSQL for production.
- Implement background job queue for scheduled publishing instead of request-time behavior.
- Add full direct adapters for Instagram, Facebook, Threads, TikTok, and LinkedIn after approvals.
- Add token refresh workers for every OAuth platform.
- Add platform-specific posting validation for media requirements, aspect ratios, privacy settings, and rate limits.
- Add media upload and S3/MinIO asset library.
- Add PDF report export and scheduled email reports.
- Add report templates with editable metric sets/date ranges.
- Add team roles and permissions.
- Add audit log.
- Add production observability.
- Add database migrations for all local-store entities.
- Add automated tests for auth, account isolation, OAuth callbacks, reporting, and publishing.
- Add CSRF strategy for mutations.
- Add production-safe secrets management.
- Add backup/restore plan.
- Add podcast host integration for real podcast downloads.
- Add transcript ingestion for clip nomination.

## Security Checklist For Production

Minimum before public production:

- HTTPS only.
- Secure cookies in production.
- HTTP-only session cookies.
- SameSite cookie policy.
- CSRF protection for mutations.
- Rate limiting per IP and per user.
- Strong password hashing.
- Secret manager for encryption keys and platform app secrets.
- Encrypted OAuth token storage.
- Key rotation plan.
- Audit logs.
- Role-based access control.
- Strict CORS allowlist.
- Redacted logs.
- Database row-level ownership checks.
- Backups with restore testing.
- Error monitoring.
- Dependency scanning.

## Environment Variables

The full template lives in `.env.example`.

Important local variables:

```env
NODE_ENV=development
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
NEXT_PUBLIC_API_URL=http://localhost:4000/api
ENCRYPTION_KEY=<64-character-hex-key>
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
CORS_ORIGINS=http://localhost:3000
```

Production variables will also need:

- Database URL.
- Redis URL.
- S3 credentials.
- Email provider key.
- Monitoring DSN.
- Platform app credentials.
- Unified provider API key if used.

## Troubleshooting

### App is stuck on checking session

Make sure the API is running:

```text
http://localhost:4000/api/health
```

If the API is down, restart:

```powershell
pnpm dev
```

### Browser shows an old error overlay

Close the red overlay or refresh the page. Next.js keeps old runtime overlays until the page reloads.

### Google says redirect URI mismatch

The redirect URI in Google Cloud must exactly match:

```text
http://localhost:4000/api/accounts/oauth/youtube/callback
```

For production, add the production callback too.

### Google says app not verified

For local testing, add your Google account as a test user in the OAuth consent screen. For production, complete Google's verification process.

### AI insights are empty

AI Insights needs real connected accounts and/or stored posts. For local Ollama, confirm:

```powershell
ollama list
```

and make sure `.env` has:

```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

### Top Content is empty

Top Content requires published posts with metrics. After connecting YouTube, refresh Overview; the API syncs recent uploads into local posts.

### Reports CSV is empty

Reports export the current signed-in user's accounts and posts. Connect a channel or create/sync content first.

## Development Rules For Future Work

- Do not add fake dashboard metrics.
- Empty states should explain what real data is missing.
- Store raw metrics, compute derived rates at query time.
- Keep AI human-approved.
- Keep provider/platform adapters replaceable.
- Keep frontend copy user-facing, not implementation-facing.
- Preserve user/workspace isolation for every new endpoint.
- Never return secrets or tokens to the frontend.
- Add tests when touching auth, sessions, account isolation, token handling, reports, or publish flows.

## Verification

Useful checks:

```powershell
pnpm typecheck
pnpm lint
```

API health:

```powershell
Invoke-RestMethod http://localhost:4000/api/health
```

Web health:

```powershell
(Invoke-WebRequest -Uri http://localhost:3000 -UseBasicParsing).StatusCode
```
