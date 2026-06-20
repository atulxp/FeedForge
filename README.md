# ZPF Social Command Center

The internal operating system for the Zero Point Five Show: one place to
measure brand health, plan content, publish across channels, and preserve a
performance history the platforms do not keep.

The product direction follows `zpf-social-command-center-PRD-v2.pdf`
(June 8, 2026). The implementation starts with the PRD's Phase 1:

- Executive analytics with account scope and data freshness
- Raw-count metric storage and query-time derived rates
- Podcast and social performance in one view
- Owned daily history in PostgreSQL
- A foundation for publishing, scheduling, retries, and approvals

## Current Status

The repository contains a working local product slice:

- Live executive dashboard backed by the local API
- Durable development accounts and content stored across restarts
- Content pipeline with draft, approval, schedule, failure, and archive states
- Multi-platform composer with Instagram and Threads validation
- Calendar controls for approval, retry, and archive operations

```text
apps/
  web/                    Next.js App Router dashboard
  api/                    NestJS REST API
packages/
  database/               Drizzle schema and relations
  shared/                 Typed API contracts
infra/
  docker/                 PostgreSQL, Redis, MinIO, and local tools
```

Until PostgreSQL is available, the API uses durable file-backed development
storage at `apps/api/data/local-state.json`. The repository boundary is kept
inside the NestJS service so it can be replaced by Drizzle/PostgreSQL without
rewriting controllers or frontend pages.

## Prerequisites

- Node.js 20 or newer
- pnpm 9 or newer
- Docker Desktop for local infrastructure

## Run The Dashboard

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

On this Windows machine, if `pnpm` is not globally available, use the local
shim:

```powershell
.\.tools\pnpm.CMD dev
```

The API runs at `http://localhost:4000/api`; health is available at
`http://localhost:4000/api/health`.

## Run Local Infrastructure

```bash
pnpm docker:dev
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`
- MinIO API on `localhost:9000`
- MinIO console on `localhost:9001`

Optional admin tools:

```bash
docker compose -f infra/docker/docker-compose.dev.yml --profile tools up -d
```

## Architecture

- Frontend: Next.js App Router
- API: NestJS, introduced with the first live account adapter
- Database: PostgreSQL with Drizzle ORM
- Queue/cache: Redis and BullMQ
- Media/raw payloads: S3-compatible storage
- Publishing: unified provider first, direct adapters where strategic
- Analytics: PostgreSQL first; ClickHouse only when volume requires it

## Product Build Order

1. Executive dashboard and database foundation
2. Authentication, organization roles, and account scope
3. YouTube and podcast-host read adapters
4. Daily metric ingestion, freshness, exports, and backfills
5. Unified-provider publishing and content calendar
6. Retries, failure surfacing, and approval workflow
7. Content intelligence and human-approved AI assistance

## Important Platform Constraints

- Spotify and Apple Podcasts do not expose creator analytics or posting APIs.
  Podcast performance must come from the hosting platform, IAB-certified
  download tracking, or an approved third party.
- Publishing should use a unified provider in v1 to avoid making Meta review,
  TikTok audit, and LinkedIn partnership approval block the product.
- X read and URL-write spend must have explicit caps.
- Daily normalized metric snapshots are retained indefinitely; they are the
  product's compounding asset.


### Zero Point Five Show — Complete Product & Technical Reference

> **Version:** 2.0 | **Prepared:** June 2026 | **Status:** Active Build  
> **Client:** Zero Point Five Show (single-client build)  
> **Purpose:** This document is the single source of truth for everyone building, using, or reviewing this product.

---

## Table of Contents

1. [What Is This Product?](#1-what-is-this-product)
2. [Why It Needs to Exist](#2-why-it-needs-to-exist)
3. [Who Uses It](#3-who-uses-it)
4. [The 9 Platforms](#4-the-9-platforms)
5. [The 6 Core Modules](#5-the-6-core-modules)
6. [Tech Stack](#6-tech-stack)
7. [Project Structure](#7-project-structure)
8. [Database Design](#8-database-design)
9. [API Design](#9-api-design)
10. [AI Features](#10-ai-features)
11. [Publishing Engine](#11-publishing-engine)
12. [Analytics System](#12-analytics-system)
13. [Security](#13-security)
14. [Role-Based Access Control](#14-role-based-access-control)
15. [Build Phases & Roadmap](#15-build-phases--roadmap)
16. [Platform API Setup](#16-platform-api-setup)
17. [Environment Variables](#17-environment-variables)
18. [Local Development Setup](#18-local-development-setup)
19. [Build Order (Step by Step)](#19-build-order-step-by-step)
20. [Risks & Known Limitations](#20-risks--known-limitations)
21. [Competitor Analysis](#21-competitor-analysis)
22. [Cost Estimates](#22-cost-estimates)

---

## 1. What Is This Product?

The **ZPF Social Command Center** is a custom internal dashboard built exclusively for the Zero Point Five Show media brand. It replaces 9 separate browser tabs, manual spreadsheets, and fragmented workflows with a single operating surface.

**In one sentence:** One screen to plan, publish, measure, and learn across every channel the brand lives on.

### What it replaces today
| Problem Today | Solution |
|---|---|
| 9 separate logins, 9 separate UIs | One dashboard, one login |
| "Engagement rate" means different things on every platform | Normalized metrics with clear labels |
| Weekly reports assembled by hand | Automated reporting, always fresh |
| No view connecting clip performance to podcast downloads | Clip-to-episode linkage built in |
| Content scheduled by memory and chat messages | Calendar with approval workflows |
| Platform analytics deleted after 90 days | Permanent owned history in our database |
| Cross-posting = manual re-uploading everywhere | Write once, publish everywhere |

### What it is NOT
- It is not a competitor research tool (that's Brandwatch)
- It is not a CRM (that's HubSpot)
- It is not a social listening tool (though basic comment management is included)
- It is not built for multiple clients in v1 — it is single-tenant, for Zero Point Five only

---

## 2. Why It Needs to Exist

### The core problem
The Zero Point Five Show is a podcast-first media brand with presence on 9 platforms. The operational and analytical friction is not creative — it's logistical. No off-the-shelf tool solves this specific combination:

1. **Podcast performance** (Spotify, Apple Podcasts) unified with **social performance** (Instagram, YouTube, TikTok, etc.) in one view
2. **Owned, permanent analytics history** — platforms delete data after 30–90 days; we need to own it forever
3. **Clip-to-episode economics** — did the 60-second clip on TikTok actually drive people to listen to the full episode?

### Why not just buy an existing tool?
| Tool | Gap |
|---|---|
| Hootsuite, Buffer, Sprout | No podcast data integration |
| Metricool | No clip-to-episode linkage, limited AI |
| All of them | Don't own your data — it's held hostage in their platform |

### The compounding asset
Every day this system runs, it stores a daily snapshot of metrics across all platforms. After 1 year, you have a queryable history that no platform, no tool, and no competitor can take from you. This compounds in value over time.

### Business goals
- Reduce weekly time spent pulling numbers and cross-posting from **hours → minutes**
- Increase on-schedule content output by removing manual coordination
- Build a proprietary performance history that compounds in value
- Create an internal capability that could later be productized for other creators

---

## 3. Who Uses It

Eight personas, each with different needs:

### Podcast Founder
- **Goal:** 30-second read on brand health — is the show growing?
- **Uses:** Executive dashboard (big numbers, trend arrows, week-over-week)
- **Does NOT want:** Raw data, operational noise, things requiring interpretation
- **Key metrics:** Total reach, follower growth, episode downloads, top content this week

### Content Manager
- **Goal:** Ship the calendar on schedule, repurpose long-form into clips
- **Uses:** Content calendar, composer, bulk scheduler, failure alerts
- **Does NOT want:** Surprises — a post failed 6 hours ago and nobody knew
- **Key metrics:** Posts shipped on schedule, publish success rate, clips per episode

### Social Media Manager
- **Goal:** Engagement, community, timely posting
- **Uses:** Per-platform engagement view, comment surfacing, best-time guidance
- **Does NOT want:** To open 6 apps to see if anyone commented
- **Key metrics:** Engagement rate, follower growth, comment response time

### Video Editor
- **Goal:** Get clips approved and scheduled, learn which clip styles perform
- **Uses:** Asset library, clip upload with episode tagging, clip performance view
- **Does NOT want:** To wonder which episode a clip came from 3 months later
- **Key metrics:** Clip views, retention, clip-to-episode referral rate

### Marketing Lead
- **Goal:** Connect content to audience growth
- **Uses:** Campaign tagging, format/topic breakdowns, UTM traffic view
- **Does NOT want:** Likes — wants subscriber conversions
- **Key metrics:** CTR, traffic to owned properties, subscriber conversion

### Analyst
- **Goal:** Raw numbers, exports, custom slicing
- **Uses:** CSV/Sheet exports, custom date ranges, raw metric access
- **Does NOT want:** Dashboards that hide underlying data
- **Key metrics:** Data completeness and query flexibility

### Agency Partner (optional, scoped)
- **Goal:** Manage assigned accounts, report to the brand
- **Uses:** Draft → submit for approval flow, scoped report export
- **Cannot see:** Other accounts, billing, cross-group data

### Executive Stakeholder (investor/advisor)
- **Goal:** High-level health snapshot
- **Uses:** Read-only summary, shareable link or scheduled PDF
- **Does NOT want:** Any operational detail

---

## 4. The 9 Platforms

> **Critical distinction:** The 9 platforms are three different types of thing. Understanding this prevents the biggest architectural mistakes.

### Type 1: Full social networks (publish + read APIs)
Instagram, Facebook, LinkedIn, X, YouTube, TikTok

### Type 2: Young social API (publish works, analytics thin)
Threads — public API since June 2024, analytics still limited

### Type 3: Podcast distribution directories (NO posting API, NO analytics API)
Spotify Podcasts, Apple Podcasts — these are RSS-based. There is no API to post to them and no API to read creator analytics from them. Pull data from the **podcast host** (Transistor, Buzzsprout, etc.) instead.

---

### Platform Details

#### Instagram
- **Post via API?** Yes (two-step container model)
- **Analytics API?** Yes (Business/Creator accounts only)
- **Auth:** OAuth 2.0 via Facebook Login, requires Meta App Review (2–4 weeks)
- **Key limit:** ~25 posts per 24h (query the runtime limit endpoint — the actual cap varies)
- **Supports:** Feed images, carousels, Reels, Stories
- **Does NOT support:** Text-only posts
- **Cost:** Free (engineering + review time only)
- **Watch out for:** Dynamic rate limits — always query `/{igid}/content_publishing_limit` before posting

#### Facebook
- **Post via API?** Yes (Pages only)
- **Analytics API?** Yes (Page insights)
- **Auth:** OAuth 2.0, Meta App Review
- **Supports:** Text, links, images, video, Reels
- **Cost:** Free
- **Watch out for:** Some Page insight metrics deprecated across Graph API versions — verify the current list

#### LinkedIn
- **Post via API?** Yes (organization pages only, NOT personal profiles)
- **Analytics API?** Yes (for approved partners only)
- **Auth:** OAuth 2.0, requires **Marketing Developer Platform partner approval** (weeks to months, possible denial)
- **Cost:** Partner contract — reported $10,000–$50,000+/year
- **v1 strategy:** Use Ayrshare or Zernio to bypass the partner approval entirely
- **Watch out for:** Closed member permissions — you cannot read personal profile data

#### X (Twitter)
- **Post via API?** Yes
- **Analytics API?** Yes (cost scales with access tier)
- **Auth:** OAuth 2.0
- **Cost (pay-per-use as of Feb 2026):**
  - Read per post: $0.005
  - Standard write: $0.015
  - **Write with URL: $0.20** ← this kills a media brand that auto-posts episode links
  - 2M reads/month cap before Enterprise ($42,000+/month) is required
- **Watch out for:** Pricing changed twice in 2026. Budget X costs explicitly. Cache reads aggressively.

#### YouTube
- **Post via API?** Yes (video upload)
- **Analytics API?** Yes — the best analytics API of all 9 platforms
- **Auth:** OAuth 2.0
- **Cost:** Free (quota-based)
- **Quota:** 10,000 units/day default. Video upload = 100 units (reduced from ~1,600 in December 2025). ~100 uploads/day on default quota.
- **Supports:** Videos, Shorts, scheduled publish via `publishAt`
- **Watch out for:** `search.list` costs 100 units per call — avoid in workers

#### TikTok
- **Post via API?** Yes (but read the warning below)
- **Analytics API?** Yes (approved scopes only)
- **Auth:** OAuth 2.0, requires **audit approval (2–6 weeks)**
- **Critical:** ALL API-posted content is **forced private (SELF_ONLY)** until audit passes
- **Daily cap:** ~25 videos/account/day for audited apps
- **Required UX:** Must show creator username/avatar and a privacy selector before posting (hard in-app requirement)
- **Cost:** Free API, audit cost is time
- **Watch out for:** Behavioral detection can restrict even compliant automation

#### Threads
- **Post via API?** Yes
- **Analytics API?** Yes but very thin — no per-post link clicks, no best-time data, no native CSV export
- **Auth:** OAuth 2.0, Meta App Review
- **Token expiry:** 60 days — requires user re-engagement to refresh
- **Daily caps:** ~250 posts, ~1,000 replies per profile
- **Cost:** Free
- **Watch out for:** Weak analytics — supplement with UTM-based click tracking

#### Spotify Podcasts
- **Post via API?** ❌ NO. Distribution is RSS via your podcast host.
- **Analytics API?** ❌ NO. Show analytics only live in the Spotify for Creators dashboard.
- **Strategy:** Pull data from your podcast host's API (Transistor, Buzzsprout, etc.) + IAB-certified download prefix tracking
- **Watch out for:** Tools that claim to access Spotify creator analytics via API are reverse-engineering the dashboard — fragile and Terms of Service violation risk

#### Apple Podcasts
- **Post via API?** ❌ NO. Distribution via RSS submitted to Apple Podcasts Connect.
- **Analytics API?** ❌ NO. No sanctioned public creator analytics API exists.
- **Strategy:** Same as Spotify — podcast host API + download tracking
- **Watch out for:** Same scraping risk as Spotify

---

## 5. The 6 Core Modules

### Module 1: Auth & Account Management
Connect social accounts via OAuth, store encrypted tokens, manage multiple accounts per platform, handle token refresh automatically.

**Key flows:**
- User connects an account → OAuth → tokens stored encrypted → initial backfill queued
- Token expires → worker detects it → user prompted to re-authorize
- Account disconnected → graceful handling, historical data preserved

### Module 2: Unified Analytics Dashboard
Pull daily metrics from each platform, store permanently in our database, display in one normalized view.

**What's stored daily (per account):**
Reach, impressions, views, watch time, likes, comments, shares, saves, bookmarks, clicks, followers, subscribers, podcast downloads, episode completion rate, profile visits, website clicks.

**Key principle:** Store raw counts. Compute rates (engagement rate, growth %) at query time. Never store pre-computed rates — they can't be recomputed if the formula changes.

### Module 3: Content Calendar
Visual calendar showing every post across all platforms: Draft, Scheduled, Published, Failed, Archived.

**Key features:**
- Drag-to-reschedule
- Failed post shows platform error + one-click retry
- Per-account color coding
- Filter by account/group/status
- Multi-platform composer (write once, override per platform)
- Approval workflow (Editor drafts → Approver approves → Queue publishes)

### Module 4: Publishing Engine
The system that actually sends posts to platforms at scheduled times.

**Architecture:** BullMQ queue holds a job for each scheduled post. At the scheduled time, the worker fires the publish call, polls for status, and updates the database. Every attempt is logged with status, platform response, and retry metadata.

**v1 strategy:** Route through a unified provider (Ayrshare or Zernio) rather than building 9 adapters. Build YouTube direct first (free, unrestricted), add others as volume justifies.

### Module 5: AI Features Layer
Thin, swappable AI layer. Uses Ollama locally (your RTX 2050) with cloud fallback.

**Features (in order of build priority):**
1. Auto-generated captions (cheapest, highest ROI — build first)
2. Content repurposing (episode transcript → platform-specific drafts)
3. Best posting time prediction (built from your own engagement history)
4. Viral score prediction (probability of beating your own format median)
5. Podcast clip suggestions (from transcript — timestamp-based nominations)
6. Engagement forecasting (account-level growth projection)

### Module 6: Team Workflow & RBAC
Five roles, approval workflows, audit logs for every action.

---

## 6. Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Server components for data-heavy views, client components for interactive calendar |
| Styling | Tailwind CSS | Utility-first, no CSS file maintenance |
| State | TanStack Query | Server state management, caching, background refetch |
| Backend | NestJS + TypeScript | Modular by domain, typed contracts |
| Database | PostgreSQL 16 | Relational, excellent JSON support, proven at scale |
| ORM | Drizzle ORM | Type-safe queries, fast migrations, excellent TypeScript |
| Cache | Redis 7 | Sessions, hot dashboard aggregates, rate-limit counters, idempotency keys |
| Queues | BullMQ (Redis-backed) | Publish jobs, metric pulls, token refresh, retries with backoff |
| Storage | MinIO (local) / S3 (prod) | Media files + raw API payload backups |
| AI Local | Ollama | Runs on your RTX 2050, completely free, no API costs |
| AI Cloud | Gemini Flash / OpenRouter | Free tier fallback when Ollama is too slow |
| Transcription | Deepgram | 45hrs free lifetime tier for podcast clips |
| Monorepo | Turborepo + pnpm workspaces | Parallel builds, shared packages |
| Monitoring | OpenTelemetry | Traces, metrics, logs across all services |
| Deploy | Docker containers | Dev parity, easy to move to any cloud |

### Why NOT ClickHouse yet
ClickHouse is the right analytics database at scale. For a single-brand build with one team, PostgreSQL handles it easily. Add ClickHouse only when query performance becomes a problem (probably never at single-client scale).

---

## 7. Project Structure

```
zpf-command-center/                    ← Monorepo root
│
├── apps/
│   ├── web/                           ← Next.js 14 frontend
│   │   └── src/
│   │       ├── app/                   ← App Router pages
│   │       │   ├── auth/              ← Login, register, forgot password
│   │       │   ├── dashboard/         ← Executive overview (home)
│   │       │   ├── analytics/         ← Detailed metrics + exports
│   │       │   ├── calendar/          ← Content calendar
│   │       │   ├── publishing/        ← Post composer
│   │       │   ├── ai-insights/       ← AI suggestions panel
│   │       │   ├── reports/           ← Scheduled reports
│   │       │   └── settings/          ← Org + account settings
│   │       ├── components/
│   │       │   ├── ui/                ← Base UI components (Button, Card, etc.)
│   │       │   ├── dashboard/         ← Metric tiles, platform cards, charts
│   │       │   ├── calendar/          ← Calendar grid, post chips, status badges
│   │       │   ├── composer/          ← Post editor, platform toggles, preview
│   │       │   ├── analytics/         ← Charts, comparison tables, export button
│   │       │   └── ai/                ← Suggestion cards, AI action buttons
│   │       ├── lib/
│   │       │   ├── api/               ← API client (typed fetch wrappers)
│   │       │   ├── hooks/             ← Custom React hooks
│   │       │   ├── stores/            ← Zustand stores (UI state)
│   │       │   └── utils/             ← Date formatting, number formatting, etc.
│   │       └── types/                 ← Frontend-only TypeScript types
│   │
│   ├── api/                           ← NestJS REST API
│   │   └── src/
│   │       ├── modules/
│   │       │   ├── auth/              ← JWT auth, OAuth flows per platform
│   │       │   ├── accounts/          ← Social account connect/disconnect
│   │       │   ├── publishing/        ← Post CRUD + scheduling
│   │       │   ├── analytics/         ← Metric queries + aggregation
│   │       │   ├── ai/                ← Ollama/Gemini AI endpoints
│   │       │   ├── comments/          ← Comment inbox
│   │       │   ├── campaigns/         ← Campaign management
│   │       │   ├── webhooks/          ← Receive platform webhooks
│   │       │   └── reports/           ← Generate + schedule reports
│   │       ├── common/
│   │       │   ├── guards/            ← JWT guard, roles guard
│   │       │   ├── decorators/        ← @CurrentUser, @Roles, @OrgId
│   │       │   ├── filters/           ← Global exception filter
│   │       │   ├── interceptors/      ← Logging, response transform
│   │       │   └── pipes/             ← Validation pipe
│   │       └── config/                ← Config service (reads .env)
│   │
│   └── worker/                        ← BullMQ background workers
│       └── src/
│           ├── jobs/
│           │   ├── metrics/           ← Pull daily metrics per platform
│           │   ├── publish/           ← Execute scheduled post jobs
│           │   ├── token-refresh/     ← Refresh expiring OAuth tokens
│           │   └── ai/                ← Async AI generation jobs
│           └── processors/            ← Job processor classes
│
├── packages/
│   ├── shared/                        ← Types + constants used by ALL apps
│   │   └── src/
│   │       ├── types/                 ← Platform, Role, PostStatus, MetricKey, etc.
│   │       └── constants/             ← Character limits, rate limits, X pricing, etc.
│   │
│   └── database/                      ← Drizzle schema + migrations
│       └── src/
│           ├── schema/                ← All 13 database tables defined here
│           └── migrations/            ← Auto-generated SQL migration files
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.dev.yml     ← Postgres + Redis + MinIO for local dev
│   │   └── init/
│   │       └── postgres-init.sql      ← Enable extensions, create test DB
│   └── scripts/                       ← Deploy and maintenance scripts
│
├── docs/                              ← Architecture diagrams, ADRs
│
├── .env.example                       ← Every environment variable documented
├── package.json                       ← Root scripts (dev, build, test, migrate)
├── turbo.json                         ← Turborepo pipeline
├── pnpm-workspace.yaml                ← Workspace definition
└── tsconfig.json                      ← Base TypeScript config
```

---

## 8. Database Design

All 13 tables. The **metrics_daily** table is the product's compounding asset — never delete rows from it.

### Table Overview

| Table | Purpose |
|---|---|
| `organizations` | The brand (Zero Point Five) |
| `users` | Team members |
| `org_members` | User ↔ Org junction with role |
| `account_groups` | Group accounts (e.g. "ZPF Main", "ZPF Clips") |
| `accounts` | One row per connected social profile |
| `account_tokens` | Encrypted OAuth tokens (never plaintext) |
| `posts` | Content drafts, scheduled posts |
| `post_targets` | One row per platform a post goes to |
| `post_assets` | Post ↔ Media file junction |
| `content_assets` | Media files (images, videos, audio) |
| `metrics_daily` | **The permanent analytics store** — daily metric per account |
| `followers_daily` | Daily follower/subscriber snapshots |
| `comments` | Ingested comments from platforms |
| `campaigns` | Campaign grouping for posts |
| `episodes` | Podcast episodes from the hosting platform |
| `audit_logs` | Immutable record of all significant actions |

### Key Design Decisions

**Store raw counts, compute rates at query time.**
Never store engagement_rate in the database. Store likes, comments, shares, reach. Compute `(likes + comments + shares) / reach` when the dashboard queries. This way, if you change your formula, you can recompute everything historically.

**One post → many post_targets.**
A single post can go to Instagram, TikTok, LinkedIn, and Threads simultaneously. Each platform gets its own `post_target` row with its own status, platform-returned ID, error message, and retry count.

**Encrypted tokens, always.**
`account_tokens` stores AES-256 encrypted access and refresh tokens. The encryption key lives in your environment variables. Never log tokens. Never store them in plaintext.

**Idempotent metric ingestion.**
`metrics_daily` has a unique constraint on `(account_id, date, metric_key)`. Running the same metric pull job twice won't create duplicate rows — it upserts.

### Entity Relationships (simplified)

```
Organization
  ├── has many Users (through org_members with role)
  ├── has many Accounts (one per connected social profile)
  │     ├── has one AccountToken (encrypted OAuth tokens)
  │     ├── has many MetricsDaily (the permanent history)
  │     ├── has many FollowersDaily
  │     └── has many Comments
  ├── has many Posts
  │     └── has many PostTargets (one per platform)
  ├── has many Episodes (from podcast host)
  ├── has many ContentAssets (media files, linked to episodes)
  └── has many AuditLogs
```

### Indexing Strategy

```sql
-- Calendar/queue queries (most frequent)
INDEX (org_id, status, scheduled_at) ON posts

-- Metric time-series queries (dashboard)
INDEX (account_id, date) ON metrics_daily
INDEX (account_id, date) ON followers_daily

-- Post publish status (worker polling)
INDEX (status) ON post_targets

-- Comment deduplication (webhook ingest)
UNIQUE (account_id, platform_comment_id) ON comments
```

---

## 9. API Design

### Architecture
**NestJS** with modules per domain. Each module has: Controller (routes), Service (business logic), Repository (database queries).

### Base URL
```
Development:  http://localhost:4000/api/v1
Production:   https://api.yourdomain.com/api/v1
```

### Authentication
All endpoints require a JWT Bearer token except `/auth/*`.

```
Authorization: Bearer <jwt_token>
```

### Core Endpoints (planned)

```
AUTH
POST   /auth/register          Create account
POST   /auth/login             Get JWT tokens
POST   /auth/refresh           Refresh access token
POST   /auth/logout            Invalidate session
GET    /auth/me                Current user info

ACCOUNTS (social profiles)
GET    /accounts               List connected accounts
POST   /accounts/connect       Start OAuth flow
DELETE /accounts/:id           Disconnect account
GET    /accounts/:id/status    Token health + last sync

ANALYTICS
GET    /analytics/overview     Executive summary (reach, followers, top content)
GET    /analytics/metrics      Time-series metrics (filters: account, date, metric)
GET    /analytics/growth       Follower/subscriber growth
GET    /analytics/top-content  Best/worst performing posts
GET    /analytics/heatmap      Engagement by day+hour grid
GET    /analytics/export       CSV export

POSTS
GET    /posts                  List posts (filters: status, account, date)
POST   /posts                  Create post
PATCH  /posts/:id              Update draft
DELETE /posts/:id              Delete draft
POST   /posts/:id/schedule     Move to scheduled
POST   /posts/:id/approve      Approve (admin/owner only)
POST   /posts/:id/publish-now  Publish immediately
POST   /posts/:id/retry        Retry failed post

CALENDAR
GET    /calendar               Posts in date range (for calendar view)

CAMPAIGNS
GET    /campaigns              List campaigns
POST   /campaigns              Create campaign
PATCH  /campaigns/:id          Update campaign

EPISODES (podcast)
GET    /episodes               List podcast episodes
GET    /episodes/:id           Episode detail + performance
POST   /episodes/sync          Trigger sync from podcast host

AI
POST   /ai/caption             Generate captions for a post
POST   /ai/repurpose           Repurpose episode text to platform drafts
GET    /ai/best-times          Suggested posting times per platform
POST   /ai/clip-suggestions    Nominate clip timestamps from transcript

REPORTS
GET    /reports                List report templates
POST   /reports/generate       Generate report (PDF/CSV)
POST   /reports/schedule       Schedule recurring report

WEBHOOKS (receive from platforms)
POST   /webhooks/meta          Instagram + Facebook + Threads
POST   /webhooks/youtube       YouTube (WebSub)
```

---

## 10. AI Features

All AI features are thin, swappable layers. The model can be changed without touching the feature code.

### Local AI — Ollama on your RTX 2050

Your RTX 2050 has ~8GB VRAM.

### Cloud Fallback (Free Tiers)

| Provider | Free Tier | Set in .env |
|---|---|---|
| Gemini Flash | 15 RPM, 1M tokens/day | `AI_PROVIDER=gemini` |
| OpenRouter (DeepSeek V3) | Free tier available | `AI_PROVIDER=openrouter` |

### Feature 1: Auto-Generated Captions (Build First)
**What it does:** Given a topic/transcript snippet, generates platform-appropriate captions for each platform simultaneously.

**Why build first:** Lowest engineering effort, highest daily value. Every post benefits.

**How it works:**
```
Input:  Episode title + key points + target platforms
Prompt: "Generate captions for [platforms]. 
         Instagram: 2200 chars max, hashtags OK.
         X: 280 chars max, no hashtags spam.
         LinkedIn: Professional tone, 3000 chars.
         [brand voice examples]"
Output: One caption per platform, character-count validated
```

### Feature 2: Content Repurposing
**What it does:** Takes a podcast episode transcript and generates platform-specific content: LinkedIn post, X thread, Threads text, Instagram caption, YouTube Shorts hook.

**How it works:**
```
Input:  Episode transcript (text file or Deepgram output)
Output: 
  - LinkedIn: 1 long-form post with key insight
  - X: 5-tweet thread with quotes
  - Threads: 3 short punchy posts
  - Instagram: Caption + hashtag suggestions
  - YouTube Shorts: 3 hook options with timestamps
```

### Feature 3: Best Posting Time
**What it does:** Suggests the best time to post on each platform based on your own historical engagement data.

**How it works:** NOT a platform API field (most platforms don't expose this). Built from our stored data:
```
For each account:
  For each day-of-week + hour-of-day combination:
    Calculate median engagement for posts published in that slot
Display as a heatmap grid
Suggest top 3 slots per platform
```

### Feature 4: Viral Score Prediction
**What it does:** Scores a draft post with the probability it will outperform the account's format median.

**How it works:** Gradient-boosted classifier trained on historical post data. Features: format, length, topic tags, posting time slot, account baselines.

### Feature 5: Podcast Clip Suggestions
**What it does:** Reads the episode transcript and nominates the best segments for short-form clips, with timestamps.

**How it works:**
```
Input:  Full episode transcript with timestamps (from Deepgram)
Prompt: "Identify the 5 most quotable/shareable moments. 
         For each: timestamp range, quote, why it works for clips, 
         suggested platform (TikTok/Reels/Shorts)"
Output: Timestamped clip nominations the editor can act on
```

---

## 11. Publishing Engine

### How a post gets published

```
1. Editor writes post in Composer
   └── Selects target accounts (Instagram, TikTok, LinkedIn...)
   └── Optionally overrides text per platform
   └── Attaches media from Asset Library
   └── Sets scheduled time

2. Post saved to database with status: 'scheduled'
   └── One post_target row created per platform

3. At scheduled time, BullMQ fires the publish job
   └── Worker picks up the job
   └── Calls platform adapter for each target

4. Platform adapter sends to API (or unified provider)
   └── Instagram: POST container → poll → publish (2-step)
   └── TikTok: POST video → poll for status
   └── Others: Single POST call

5. Platform returns post ID
   └── post_target updated: status='published', platform_post_id='xyz'

6. If failure:
   └── post_target updated: status='failed', error='...'
   └── Auto-retry with exponential backoff (3 attempts)
   └── After 3 failures: alert surfaces in dashboard
   └── One-click manual retry available
```

### Per-Platform Publishing Details

| Platform | Method | Key Gotcha |
|---|---|---|
| Instagram | Two-step container model | No text-only posts. Query publishing cap first. |
| Facebook | Single POST | Requires `pages_manage_posts` scope |
| LinkedIn | Via provider (v1) | Direct requires partner approval ($10k+/yr) |
| X | Direct POST | URL in post = $0.20 write cost. Budget it. |
| YouTube | Resumable upload + `publishAt` | 100 unit quota cost per upload |
| TikTok | Via provider (v1) | Private-only until audit passes |
| Threads | Single POST | 60-day token refresh required |
| Spotify | ❌ Not supported | RSS-only distribution |
| Apple | ❌ Not supported | RSS-only distribution |

### v1 Strategy: Unified Provider First

Rather than building 9 platform adapters from scratch, v1 routes through **Ayrshare** or **Zernio**. This skips:
- LinkedIn partner approval (months + $10k+)
- TikTok audit (2–6 weeks)
- Meta App Review for publishing scopes
- Building and maintaining 9 adapters

Build **YouTube direct** from day one (free, no gating, excellent API).

Replace provider adapters with direct ones as volume and need justify it.

---

## 12. Analytics System

### Data Flow

```
Platform APIs
    │
    ▼ (daily worker jobs)
Raw API payloads → S3 (90-day hot storage, then cold)
    │
    ▼ (ETL normalize)
metrics_daily table (PostgreSQL) ← permanent, never deleted
followers_daily table
    │
    ▼ (query time computation)
Dashboard renders:
  - Engagement rate = (likes + comments + shares + saves) / reach
  - Growth = followers_today - followers_yesterday
  - Trend = current_period vs previous_period
```

### Metric Definitions (Normalized)

| Metric | Formula | Note |
|---|---|---|
| Reach | Platform-reported unique accounts | Direct from API |
| Impressions | Total times content served | Direct from API |
| Views | Video/Reel/Short plays | Each platform counts differently — labeled, not merged |
| Watch Time | Sum of seconds watched | YouTube + Instagram/TikTok where available |
| Engagement Rate | (likes + comments + shares + saves) / reach | Computed at query time from raw counts |
| Follower Growth | followers_today − followers_yesterday | From daily snapshot |
| CTR | clicks / impressions | Threads has no link clicks — use UTM there |
| Podcast Downloads | IAB-certified downloads | From podcast host API |

### Dashboard Widgets to Build

1. **Executive summary tiles** — Reach, Total Followers, Growth %, Top Content (week)
2. **Per-platform performance cards** — each platform's key metrics at a glance
3. **Cross-platform comparison chart** — side-by-side normalized metrics
4. **Follower/subscriber growth chart** — trend lines per account
5. **Top/bottom content table** — ranked by configurable metric + date range
6. **Posting cadence vs performance overlay** — did posting more help?
7. **Podcast episode performance panel** — downloads, completion, clips derived
8. **Data freshness indicator** — when each platform was last synced

### Metric Pull Schedule

| Platform | Pull Interval | Reason |
|---|---|---|
| YouTube | Every 60 min | Free + good API |
| Instagram | Every 120 min | Dynamic rate limits |
| Facebook | Every 120 min | Same as Instagram |
| X | Every 180 min | Expensive reads — cache hard |
| TikTok | Every 120 min | Audit-gated limits |
| LinkedIn | Every 240 min | Slower API, partner tier limits |
| Threads | Every 240 min | Weak analytics, thin endpoints |
| Podcast host | Every 360 min | Downloads update slowly |

---

## 13. Security

### Token Storage
OAuth tokens are **never stored in plaintext**. Flow:
```
Token received → AES-256 encrypt with ENCRYPTION_KEY → store in account_tokens
Token needed   → fetch from DB → decrypt in memory → use → discard
Never log, never expose in API responses, never include in audit logs
```

### Auth Flow
- JWT access tokens (7 day expiry)
- JWT refresh tokens (30 day expiry, rotated on use)
- All tokens stored in httpOnly cookies (not localStorage)
- Per-user and per-org rate limiting via Redis

### Data Privacy (GDPR + India DPDP)
The show is Mumbai-based and may handle EU audience data (commenters, followers). Build for both:
- Minimal data collection (only what's needed)
- Clear retention policies
- Export-and-delete path for any personal data ingested (commenter info)
- Lawful basis documentation

### Audit Logs
Every significant action is logged immutably:
- Account connect/disconnect
- Role changes
- Post publish/approve/delete
- Data export
- User deletion

Audit logs are visible to Owner and Admin roles only.

### Rate Limiting
- Our own API: per-user (100 req/min) and per-org limits via Redis
- Platform APIs: tracked per platform, alerts before hitting caps
- X reads: hard ceiling with dollar-amount alert
- YouTube quota: tracked as a first-class metric

---

## 14. Role-Based Access Control

| Capability | Owner | Admin | Editor | Analyst | Viewer |
|---|:---:|:---:|:---:|:---:|:---:|
| Manage billing/plan | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage members & roles | ✅ | ✅ | ❌ | ❌ | ❌ |
| Connect/disconnect accounts | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create/edit drafts | ✅ | ✅ | ✅ | ❌ | ❌ |
| Schedule/publish posts | ✅ | ✅ | ✅ (or via approval) | ❌ | ❌ |
| Approve content | ✅ | ✅ | Optional | ❌ | ❌ |
| View analytics | ✅ | ✅ | ✅ | ✅ | ✅ |
| Export data | ✅ | ✅ | ✅ | ✅ | ❌ |
| Manage AI settings | ✅ | ✅ | ❌ | ❌ | ❌ |
| View audit logs | ✅ | ✅ | ❌ | ❌ | ❌ |

**Agency Partner** = Editor role scoped to specific account group only. Cannot see other accounts, billing, or member list.

---

## 15. Build Phases & Roadmap

### Phase 0 — Start Immediately (No Code, Admin Only)
**Timeline:** Day 1, runs in parallel with everything else

Submit all platform API applications now — they take weeks:
- Meta App Review (Instagram + Facebook + Threads): 2–4 weeks
- TikTok Content Posting API audit: 2–6 weeks
- LinkedIn Marketing Developer Platform: weeks to months (use provider in v1)
- Sign up for Ayrshare or Zernio (unified provider for v1 publishing)

---

### Phase 1 — Foundation + Read-Only Dashboard
**Timeline:** ~6–10 weeks  
**Goal:** A working dashboard that shows all platform analytics in one place

What gets built:
- Project setup (monorepo, packages, config) ✅ Done
- Database schema + migrations ← Next
- NestJS API foundation (auth, org, users, RBAC)
- OAuth account connections (YouTube first — no gating)
- Daily metric pull workers (YouTube, Instagram, X reads)
- Podcast data integration (transistor/buzzsprout API)
- Analytics dashboard UI (Next.js)
- CSV export

**Milestone:** The team can open one dashboard and see all platform performance without logging into any platform.

---

### Phase 2 — Publishing + Calendar
**Timeline:** ~6–8 weeks  
**Goal:** Schedule and publish from one place

What gets built:
- Unified provider integration (Ayrshare/Zernio)
- Post composer (write once, override per platform)
- Content calendar UI (month/week/day views)
- BullMQ publish queue + workers
- Retry logic + failure surfacing
- Approval workflow
- Asset library (S3 upload + management)

**Milestone:** Content manager can schedule a full week of cross-platform content in one sitting.

---

### Phase 3 — Content Intelligence + AI
**Timeline:** ~6–10 weeks  
**Goal:** The dashboard tells you what to make next

What gets built:
- Top/bottom content tables
- Engagement heatmaps (day × hour grids)
- Viral detection (N standard deviations above format median)
- Clip-to-episode linkage (UTM attribution)
- Ollama integration (local AI on RTX 2050)
- Auto-caption generation
- Episode repurposing (transcript → platform drafts)
- Deepgram transcription + clip suggestions

**Milestone:** Video editor gets AI-generated clip nominations with timestamps.

---

### Phase 4 — Direct Integrations + Hardening
**Timeline:** ~8–12 weeks (gated by external approvals)  
**Goal:** Replace provider with direct integrations where volume justifies it

What gets built:
- YouTube direct (already possible from Phase 1)
- LinkedIn direct (if partner approval came through)
- TikTok direct (if audit passed)
- Best-time prediction model (ML upgrade)
- Engagement forecasting
- Scheduled PDF reports
- Full audit logging
- Comment inbox where APIs allow

**Total timeline to mature product:** 6–9 months for a small senior team.

---

## 16. Platform API Setup

Do these on **Day 1** — they run in parallel with coding.

### Meta (Instagram + Facebook + Threads)
1. Go to https://developers.facebook.com
2. Create App → Select "Business" type
3. Add products: Instagram Graph API, Facebook Login for Business
4. Set OAuth redirect: `http://localhost:4000/auth/meta/callback`
5. Request permissions: `instagram_basic`, `instagram_content_publish`, `pages_manage_posts`, `threads_content_publish`
6. Submit for App Review → wait 2–4 weeks
7. Copy App ID + Secret to `.env`

### YouTube
1. Go to https://console.cloud.google.com
2. Create project → Enable: YouTube Data API v3, YouTube Analytics API, YouTube Reporting API
3. Create OAuth 2.0 credentials → Web application
4. Set redirect: `http://localhost:4000/auth/google/callback`
5. Copy Client ID + Secret to `.env`
6. **Works immediately — no review required**

### X (Twitter)
1. Go to https://developer.x.com → Apply for access
2. Create app → Enable OAuth 2.0
3. Set redirect: `http://localhost:4000/auth/x/callback`
4. Set `X_DAILY_READ_BUDGET_USD=5.00` as a cost safeguard
5. **Budget every URL-containing post at $0.20 write cost**

### TikTok
1. Go to https://developers.tiktok.com
2. Create app → Apply for Content Posting API access
3. Submit for audit (2–6 weeks)
4. **All posted content will be private until audit passes**
5. In the meantime, use Ayrshare/Zernio as proxy

### LinkedIn
1. Go to https://developer.linkedin.com → Create app
2. Apply for Marketing Developer Platform
3. **This is slow and may be denied — use Ayrshare/Zernio in v1**
4. If approved: Development tier first, then apply for Standard tier

### Podcast Host
Connect whichever host the show uses:
- **Transistor:** https://transistor.fm → API keys in account settings
- **Buzzsprout:** https://buzzsprout.com → API token in account settings
- **Captivate:** https://captivate.fm → API credentials in settings

---

## 17. Environment Variables

See `.env.example` for the complete annotated list. Required minimum for local dev:

```env
# Database
DATABASE_URL=postgresql://zpf_user:zpf_pass@localhost:5432/zpf_db

# Redis
REDIS_URL=redis://localhost:6379

# JWT (any 32+ character string for local dev)
JWT_SECRET=local-dev-secret-change-in-production
JWT_REFRESH_SECRET=local-dev-refresh-secret-change-this

# Encryption key for OAuth tokens (64 hex chars = 32 bytes)
ENCRYPTION_KEY=0000000000000000000000000000000000000000000000000000000000000000

# AI (local Ollama)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.2:3b

# App URLs
APP_URL=http://localhost:3000
API_URL=http://localhost:4000
```

---

## 18. Local Development Setup

### Prerequisites

| Tool | Min Version | Install |
|---|---|---|
| Node.js | 20.x | https://nodejs.org |
| pnpm | 9.x | `npm install -g pnpm` |
| Docker Desktop | Latest | https://docker.com |
| Ollama | Latest | https://ollama.com |
| Git | Latest | https://git-scm.com |

### Step-by-Step

```bash
# 1. Install dependencies
pnpm install

# 2. Copy and fill environment variables
cp .env.example .env
# Edit .env — minimum required fields listed above

# 3. Start Docker services (Postgres + Redis + MinIO)
docker compose -f infra/docker/docker-compose.dev.yml up -d

# 4. Pull Ollama model (fits your RTX 2050)
ollama pull llama3.2:3b
ollama pull nomic-embed-text

# 5. Run database migrations
pnpm db:migrate

# 6. Seed sample data (optional)
pnpm db:seed

# 7. Start all services
pnpm dev
```

### Service URLs

| Service | URL | Credentials |
|---|---|---|
| Web App | http://localhost:3000 | — |
| API | http://localhost:4000 | — |
| API Docs | http://localhost:4000/docs | — |
| PostgreSQL | localhost:5432 | zpf_user / zpf_pass |
| pgAdmin | http://localhost:5050 | admin@zpf.local / admin |
| MinIO Console | http://localhost:9001 | minio_admin / minio_password |
| Redis | localhost:6379 | — |
| Redis Insight | http://localhost:8001 | — |

> pgAdmin and Redis Insight: add `--profile tools` to the docker compose command

### Useful Commands

```bash
pnpm dev              # Start all apps (web + api + worker)
pnpm build            # Build all apps
pnpm lint             # Lint all apps

pnpm db:migrate       # Run pending migrations
pnpm db:generate      # Generate migration from schema changes
pnpm db:studio        # Open Drizzle Studio (visual DB browser)
pnpm db:seed          # Seed sample data

pnpm docker:dev       # Start Docker services
pnpm docker:down      # Stop Docker services
```

---

## 19. Build Order (Step by Step)

Progress tracker for the build:

- [x] **Step 1:** Project structure, config files, shared packages, database schema
- [ ] **Step 2:** NestJS API bootstrap — `main.ts`, app module, config service, Swagger
- [ ] **Step 3:** Auth module — JWT, register, login, refresh, guards
- [ ] **Step 4:** Database module — Drizzle connection, migrations, seeds
- [ ] **Step 5:** Accounts module — OAuth flows (YouTube first), token encryption, account CRUD
- [ ] **Step 6:** Metric workers — BullMQ setup, YouTube daily pull, Instagram pull
- [ ] **Step 7:** Analytics API — metric queries, aggregation, growth calculations
- [ ] **Step 8:** Next.js web app — layout, auth pages, dashboard skeleton
- [ ] **Step 9:** Dashboard UI — metric tiles, charts, platform cards
- [ ] **Step 10:** Content calendar — calendar grid, post chips, drag-to-reschedule
- [ ] **Step 11:** Post composer — write once, platform overrides, media upload
- [ ] **Step 12:** Publishing engine — provider integration, BullMQ publish jobs, retry logic
- [ ] **Step 13:** Podcast integration — transistor/buzzsprout API, episode sync worker
- [ ] **Step 14:** Ollama AI integration — caption generation, repurposing
- [ ] **Step 15:** Clip-to-episode linkage — UTM tracking, performance attribution
- [ ] **Step 16:** Reports — PDF/CSV generation, scheduled email delivery
- [ ] **Step 17:** Direct API integrations — replace provider where justified
- [ ] **Step 18:** Hardening — error handling, monitoring, rate limit guards, audit logs

---

## 20. Risks & Known Limitations

### The biggest avoidable mistakes

**1. Treating Spotify and Apple Podcasts as if they have analytics APIs.**
They do not. Any tool or tutorial claiming otherwise is either scraping the dashboard (ToS violation, breaks without warning) or lying. Pull podcast data from your **hosting platform** (Transistor, Buzzsprout, etc.).

**2. Building a direct LinkedIn integration without partner approval.**
The Community Management API requires a paid partnership. Do not build toward it in v1. Use Ayrshare/Zernio.

**3. Not budgeting X URL write costs.**
Every post containing a URL costs $0.20 to publish via the API. A media brand that posts episode links will burn through money fast. Set the `X_DAILY_READ_BUDGET_USD` safeguard and track it.

**4. Building against last year's documented API behavior.**
Platform APIs change. X changed pricing twice in 2026. YouTube cut upload quota costs in December 2025. Instagram's publishing cap is still contested between 25/50/100 per 24h. **Always verify the current behavior before building to it.**

**5. Not starting platform approvals on Day 1.**
Meta App Review = 2–4 weeks. TikTok audit = 2–6 weeks. LinkedIn partner approval = months (possibly denied). If you start coding before applying, your publishing features will be done and still blocked.

### Per-Platform Risk Summary

| Platform | Key Risk | Mitigation |
|---|---|---|
| Instagram | Dynamic publishing cap, app review dependency | Query runtime limit endpoint before every post |
| X | Volatile pricing, $0.20 URL writes | Budget explicitly, cache reads aggressively, set daily spend cap |
| LinkedIn | Partner approval slow/denied | Use provider in v1, apply for direct in parallel |
| TikTok | Private until audit, behavioral detection | Use provider in v1, start audit Day 1 |
| Threads | 60-day token churn, weak analytics | Build token refresh, supplement with UTM |
| YouTube | Daily quota exhaustion (search.list = 100 units) | Avoid search in workers, use Reporting API for bulk data |

---

## 21. Competitor Analysis

### The gap none of them fill
No existing tool unifies podcast performance (Spotify, Apple) with short-form social performance, AND gives you an owned, queryable performance history.

| Tool | Strengths | Weaknesses | Our Advantage |
|---|---|---|---|
| Hootsuite | Broad, mature, agency reporting | Expensive, heavy, no podcast data | Lighter + podcast-aware |
| Sprout Social | Best-in-class analytics, polished | $199–399/seat/month | We own the history they ignore |
| Buffer | Simple, cheap, developer-friendly | Light analytics, no podcast | We add intelligence + podcast view |
| Metricool | Strong analytics, budget-friendly | Less agency workflow | We unify podcasts + clip economics |
| SocialPilot | Affordable, agency features | Fewer advanced analytics | Tailored to media brand, not generic |
| Brandwatch | Best-in-class social listening | Enterprise pricing, not publishing | We combine publishing + owned analytics |

### Our actual differentiation
1. Podcast + social in one view (nobody does this)
2. Owned, permanent, queryable performance history (platforms delete after 30–90 days)
3. Brand-tuned AI repurposing (trained on your own content and voice)
4. Clip-to-episode economics (did the TikTok clip drive podcast listens?)
5. Workflow built for a media brand, not a generic marketing team

---

## 22. Cost Estimates

### Monthly Infrastructure (single-brand scale)

| Item | Estimate |
|---|---|
| Hosting / compute | $50–150/month |
| Managed PostgreSQL + Redis | $50–100/month |
| S3 / MinIO storage | $10–30/month |
| Unified provider (Ayrshare) | $149/month |
| Unified provider (Zernio — budget) | $19/month |
| AI (Ollama local) | $0 (your RTX 2050) |
| AI cloud fallback (Gemini free) | $0 |
| Transcription (Deepgram free tier) | $0 |
| X API reads (variable) | Budget $20–50/month, set hard cap |
| Email (Resend free tier) | $0 |
| **Total (Ayrshare)** | **~$300–500/month** |
| **Total (Zernio)** | **~$150–350/month** |

### Development Timeline

| Phase | Duration | Dependency |
|---|---|---|
| Phase 0 (admin/approvals) | Starts Day 1, outcomes in weeks | None — start immediately |
| Phase 1 (analytics dashboard) | 6–10 weeks | YouTube API works immediately |
| Phase 2 (publishing + calendar) | 6–8 weeks | Meta App Review must be approved |
| Phase 3 (AI + intelligence) | 6–10 weeks | Requires Phase 1 data to be meaningful |
| Phase 4 (direct integrations) | 8–12 weeks | Gated by LinkedIn/TikTok approvals |
| **Total to mature product** | **6–9 months** | External approvals are the binding constraint |

---

*This document is maintained alongside the codebase. Update it when platform APIs change, when the roadmap shifts, or when a new risk is discovered. The "Verification and accuracy note" from the original PRD applies: platform API details are volatile. Re-verify the load-bearing numbers before committing engineering time to any integration.*
