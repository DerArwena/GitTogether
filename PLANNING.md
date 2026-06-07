# GitTogether — Product Planning Document

> **Status:** Pre-foundation
> **Date:** June 2026

---

## 1. Product Positioning

### What it is

GitTogether is a **project collaboration layer for GitHub repositories**. It gives every GitHub project a dedicated hub where teams manage membership, track issues across repos, and control who has access — without leaving the developer workflow.

### Who it is for

- **Open-source maintainers** who want a clean project presence and structured contributor onboarding
- **Small-to-medium project teams** (2–20 people) building around one or more GitHub repos
- **Self-hosting developers** who want full control over their collaboration infrastructure

### What problem it solves

GitHub is excellent for code hosting, pull requests, and line-level collaboration. But it has gaps:

| Gap | GitTogether solution |
|-----|---------------------|
| No project-level identity beyond the repo README | Dedicated project profile page with description, links, team, and purpose |
| Team roles are tied to GitHub org teams or commit bit | Fine-grained roles (owner → viewer) per project |
| No structured onboarding for contributors | Join requests and invite system |
| Issues are scattered across repos | Aggregated issue feed across all linked repos |
| No "workspace" view of your projects | Personal dashboard with all projects and activity |

### Why not just use GitHub?

For many projects, GitHub's built-in tools (Issues, Projects, Discussions, Teams) **are** enough. GitTogether is for projects that have outgrown a single repo or want a clearer identity than what a GitHub org page provides. It sits **alongside** GitHub, not on top of it.

### Positioning statement

> GitTogether is the project HQ for your GitHub repositories. Manage your team, see your issues, and control access — in one clean place.

---

## 2. MVP Scope

### Strictly included (v1)

- Project creation and profile (name, description, logo, links)
- GitHub repository linking (one or more repos per project)
- Five-role member management (owner, admin, maintainer, member, viewer)
- Invite-only access via invite codes and email invites
- Join request workflow (request → approve/deny)
- Aggregated issue feed from linked GitHub repos
- Personal dashboard (your projects, pending invites, recent activity)
- Email + GitHub OAuth authentication
- Docker Compose for self-hosting
- Role-based access control on all pages and actions

### Strictly excluded (v1)

| Feature | Reason for deferral |
|---------|-------------------|
| Real-time chat or messaging | Requires WebSockets, adds major infra complexity |
| Kanban / Scrum boards | Would compete with GitHub Projects; not the differentiator |
| CI/CD integration | Each project has different CI; too many edge cases |
| Analytics or metrics | Nice-to-have, not core to collaboration |
| Public REST/GraphQL API | Premature without known consumer needs |
| Billing / subscriptions | No monetization in v1; open-source first |
| Organizations/teams above project level | Can be added later; a single project is the right unit |
| Built-in commenting on issues | GitHub has this; linking to GitHub is better |
| File attachments / asset storage | Adds storage cost and complexity |
| Mobile app | Responsive web is sufficient for v1 |
| SSO / OIDC | Deferred to v1.1; Auth.js makes it easy to add later |
| Webhooks | Only needed when we have an API |
| Audit logs | Important but not critical for initial launch |

### Design constraint

Every feature must answer: **"Does this help a project team collaborate around GitHub repos?"** If the answer is unclear, it does not go in v1.

---

## 3. Core Features (v1)

### 3.1 Project HQ

A dedicated page for each project with:
- Project name, description, and logo
- Website and documentation links
- Linked GitHub repositories (with metadata)
- Member grid with role badges
- Quick stats (open issues, member count, linked repos)
- Clean, minimal layout — no clutter

This is the **primary identity page** for a project on GitTogether.

### 3.2 GitHub Repository Linking

- Connect one or more GitHub repos to a project
- Store repo metadata (name, URL, description, default branch)
- Fetch issue counts and basic info via the GitHub REST API
- Display linked repos on the project page
- Only the project owner/admin can link/unlink repos

### 3.3 Member Management

- Add and remove members
- Assign roles (owner, admin, maintainer, member, viewer)
- Visual member grid on project page
- Dedicated members page with management controls (admin+)
- Leave project flow for members

### 3.4 Aggregated Issue Feed

- Displays open issues from all linked repos in a single feed
- Filters: by repo, by label (future), text search
- Each issue links back to GitHub
- Shows issue status, number, title, and repo badge
- Read-only view — no creating or editing issues from GitTogether

This is intentionally **not** a full issue manager. It is a **window** into GitHub issues.

### 3.5 Join Requests

- Any authenticated user can request to join a public project
- Request form with optional message ("I want to help with X")
- Admins/moderators see pending requests and can approve or deny
- Accepted requests assign the default role (member)
- Optional email notification for new requests (stretch)

### 3.6 Invite System

- Project admins can generate invite links
- Links can have: expiration, max uses, role assignment
- Invite links are one-click to accept
- Optional email invites (requires email transport configured)
- Invite-only mode on hosted version requires an invite to join

### 3.7 Workspace Dashboard

- `/dashboard` is the first page after login
- List of projects the user is a member of
- Pending invite count
- Quick-action buttons (create project, accept invite)
- Clean, focused — no news feed or notifications noise

### 3.8 Role-Based Access Control

See Section 4. Every page and action checks the user's role.

---

## 4. User Roles and Permissions

### Role hierarchy

```
Owner
  │
  ├── Admin
  │     │
  │     ├── Maintainer
  │     │     │
  │     │     ├── Member
  │     │     │     │
  │     │     │     └── Viewer
```

Each role inherits permissions from roles below it.

### Permission matrix

| Action | Owner | Admin | Maintainer | Member | Viewer |
|--------|-------|-------|------------|--------|--------|
| View project page | ✓ | ✓ | ✓ | ✓ | ✓ |
| View issues | ✓ | ✓ | ✓ | ✓ | ✓ |
| View members | ✓ | ✓ | ✓ | ✓ | ✓ |
| Leave project | ✓ | ✓ | ✓ | ✓ | — |
| Invite members | ✓ | ✓ | ✓ | — | — |
| Manage issues† | ✓ | ✓ | ✓ | — | — |
| Link/unlink repos | ✓ | ✓ | ✓ | — | — |
| Approve join requests | ✓ | ✓ | — | — | — |
| Manage members (roles) | ✓ | ✓ | — | — | — |
| Edit project settings | ✓ | ✓ | — | — | — |
| Delete project | ✓ | — | — | — | — |
| Transfer ownership | ✓ | — | — | — | — |

† "Manage issues" means syncing/refreshing issue data from GitHub. Not creating issues on GitHub.

### Design notes

- **Owner** is a singleton per project. Owner can transfer ownership to another user.
- **Admin** is the operational "co-owner" — can do everything except delete or transfer.
- **Maintainer** is the working lead — manages repos and invites, but not member roles.
- **Member** is the default for most contributors.
- **Viewer** is for read-only access (e.g., stakeholders, sponsors).
- No custom roles in v1. Five is the right number.

### Invite-only access

- **Hosted version:** Registration requires an invite code. New users can sign up but cannot create or join projects without an invite. Public project pages may be visible to non-members (configurable per project).
- **Self-hosted version:** Configurable via environment variable `APP_INVITE_ONLY=true/false`. When true, same behavior as hosted. When false, any registered user can create projects.
- **Per-project:** Projects can be public (visible to anyone, join requests allowed) or private (hidden, membership by invite only).

---

## 5. Auth and Self-Hosting Model

### Auth strategy

Use **Auth.js** (NextAuth v5) with the following providers:

| Provider | Status | Notes |
|----------|--------|-------|
| Email (magic link) | ✅ v1 core | Primary auth method; no password management |
| GitHub OAuth | ✅ v1 core | Preferred for developer audience |
| Google OAuth | ✅ v1 core | Common fallback; low effort to add |
| OIDC / SSO | ⏳ v1.1 | Important for self-hosted enterprise; Auth.js makes this trivial to add later |

### Auth flow

1. User visits `/auth/signin`
2. Options: "Continue with GitHub", "Continue with Google", "Email magic link"
3. On first sign-in, user account is created
4. If `APP_INVITE_ONLY=true` and user is not on the allowed list, registration is blocked with a message

### Invite code system

- Invite codes are generated by project admins (`/projects/[slug]/settings/invites`)
- Codes encode: project ID, role, optional expiration
- Global invite codes (for instance-level access) can be set via `APP_INVITE_CODE` env var
- Database-backed invite codes table for ongoing management

### Self-hosting model

**Requirements for a smooth self-host experience:**
- Single `docker compose up` to run the full stack
- PostgreSQL as the only external dependency
- Environment variables for all configuration
- No reliance on third-party services (except GitHub API)
- Clear documentation for common setups (reverse proxy, custom domain, SSL)

**Docker Compose services (v1):**
1. `web` — Next.js app
2. `db` — PostgreSQL

**Environment config:**
```
DATABASE_URL=postgresql://...
AUTH_SECRET=...
AUTH_GITHUB_ID=...
AUTH_GITHUB_SECRET=...
AUTH_GOOGLE_ID=...
AUTH_GOOGLE_SECRET=...
APP_INVITE_ONLY=true
APP_INVITE_CODE=optional-initial-invite-code
APP_NAME=GitTogether
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 6. Main Pages

| Page | Route | Purpose | Access |
|------|-------|---------|--------|
| Landing | `/` | Project intro, sign-up CTA | Public |
| Sign In | `/auth/signin` | Auth page with providers | Public |
| Dashboard | `/dashboard` | User's projects, invites | Authenticated |
| Project Home | `/projects/[slug]` | Project profile page | Member+ |
| Project Issues | `/projects/[slug]/issues` | Aggregated issue feed | Member+ |
| Project Members | `/projects/[slug]/members` | Member list & management | Member+ |
| Project Settings | `/projects/[slug]/settings` | Edit project, repos, invites | Admin+ |
| Join Requests | `/projects/[slug]/requests` | Approve/deny requests | Admin+ |
| Create Project | `/projects/new` | Project creation form | Authenticated |
| User Settings | `/settings` | Profile, account, appearance | Authenticated |
| Invite Accept | `/invite/[code]` | Accept an invite link | Authenticated |

### Page design constraints

- No sidebar mega-menus. Clean top navigation with project context.
- Each project page has a sub-nav: Home, Issues, Members, Settings (if permitted).
- Dark mode support from day one (Tailwind makes this trivial).
- Consistent empty states for every list page.

---

## 7. Data Model

### Entity relationship diagram (text)

```
User ──< Account (Auth.js)
  │
  ├──< Project (as owner)
  │
  ├──< ProjectMember
  │
  ├──< JoinRequest
  │
  └──< Invite (as creator)

Project ──< ProjectMember
  ├──< LinkedRepo
  ├──< Invite
  └──< JoinRequest
```

### Tables

**User**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| name | String | |
| email | String | Unique, indexed |
| emailVerified | DateTime | Nullable |
| avatarUrl | String | Nullable |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Account** (Auth.js)
Standard Auth.js account model for OAuth provider accounts.

**Session** (Auth.js)
Standard Auth.js session model.

**VerificationToken** (Auth.js)
Standard Auth.js verification token model for magic links.

**Project**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| slug | String | Unique, URL-friendly |
| name | String | |
| description | Text | Nullable |
| logoUrl | String | Nullable |
| websiteUrl | String | Nullable |
| isPublic | Boolean | Default: true |
| ownerId | UUID | FK → User.id |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**ProjectMember**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| projectId | UUID | FK → Project.id |
| userId | UUID | FK → User.id |
| role | Enum | owner, admin, maintainer, member, viewer |
| createdAt | DateTime | |
| | | Unique on (projectId, userId) |

**LinkedRepo**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| projectId | UUID | FK → Project.id |
| githubRepoId | BigInt | GitHub's repo ID |
| githubRepoName | String | "owner/repo" |
| githubRepoUrl | String | Full URL |
| defaultBranch | String | Default: "main" |
| createdAt | DateTime | |

**Invite**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| code | String | Unique, short UUID |
| projectId | UUID | FK → Project.id |
| role | Enum | Default role for new members |
| maxUses | Int | Nullable (unlimited) |
| usedCount | Int | Default: 0 |
| expiresAt | DateTime | Nullable |
| createdById | UUID | FK → User.id |
| createdAt | DateTime | |

**JoinRequest**
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| projectId | UUID | FK → Project.id |
| userId | UUID | FK → User.id |
| status | Enum | pending, approved, denied |
| message | Text | Nullable |
| reviewedById | UUID | FK → User.id, nullable |
| createdAt | DateTime | |
| reviewedAt | DateTime | Nullable |

### Key index considerations

- `Project.slug` — unique index (used in URLs)
- `ProjectMember (projectId, userId)` — unique composite index
- `JoinRequest (projectId, userId)` — unique composite index (one pending request per user per project)
- `Invite.code` — unique index
- `LinkedRepo.githubRepoId` — index for dedup

---

## 8. Tech Stack Recommendation

### Confirmed stack (from your preferences)

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Best DX for full-stack web apps; excellent for this use case |
| Language | TypeScript | Non-negotiable for serious projects |
| Styling | Tailwind CSS | Perfect for clean, restrained design |
| Components | shadcn/ui | High-quality, customizable, developer-first |
| Database | PostgreSQL | Right choice for relational data |
| ORM | Prisma | Best-in-class schema management and DX |
| Containerization | Docker + Compose | Essential for self-hosting |

### Additional recommendations

| Concern | Choice | Why |
|---------|--------|-----|
| Auth | Auth.js (NextAuth v5) | Most flexible Next.js auth; supports email, OAuth, OIDC |
| GitHub API | octokit | Official GitHub SDK; handles rate limiting, pagination |
| Validation | Zod | TypeScript-first; works great with Prisma and forms |
| Forms | React Hook Form + shadcn | Lightweight, performant, good DX |
| Icons | Lucide React | Pairs naturally with shadcn/ui |
| HTTP layer | Next.js Server Actions | No need for tRPC or REST in v1; Server Actions are sufficient |
| Date handling | date-fns | Lightweight, tree-shakeable |
| Monorepo | pnpm workspaces (simple) | Not TurboRepo yet; simple workspaces are enough for v1 |

### Why NOT these choices

| Considered | Rejected because |
|-----------|-----------------|
| tRPC | Adds abstraction layer not needed with Server Actions |
| GraphQL | Overkill for v1; would slow down development |
| Redis | Not needed for v1; session handling via database is fine |
| S3/file storage | No file uploads in v1 |
| Tailwind UI (paid) | shadcn/ui is free and more customizable |
| Planetscale | Great option but adds complexity; standard Postgres is simpler |

---

## 9. Repository Structure

### Recommended structure (flat, no monorepo for v1)

```
shipwithgit/
│
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (marketing)/        # Landing page routes
│   │   │   └── page.tsx
│   │   ├── (dashboard)/        # Authenticated routes (group)
│   │   │   ├── dashboard/
│   │   │   ├── projects/
│   │   │   └── settings/
│   │   ├── auth/               # Auth page routes
│   │   ├── invite/
│   │   └── api/                # API routes (auth callbacks, etc.)
│   │
│   ├── components/             # Shared UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   ├── projects/           # Project-specific components
│   │   ├── members/            # Member-specific components
│   │   ├── issues/             # Issue-specific components
│   │   └── layout/             # Layout components (nav, sidebar, etc.)
│   │
│   ├── lib/                    # Shared utilities
│   │   ├── auth.ts             # Auth.js configuration
│   │   ├── db.ts               # Prisma client
│   │   ├── github.ts           # GitHub API helpers
│   │   └── utils.ts            # General utilities
│   │
│   ├── server/                 # Server-only logic
│   │   ├── actions/            # Server Actions
│   │   │   ├── project.ts
│   │   │   ├── member.ts
│   │   │   ├── invite.ts
│   │   │   ├── join-request.ts
│   │   │   └── repo.ts
│   │   └── permissions.ts      # RBAC checks
│   │
│   └── styles/                 # Global styles
│       └── globals.css
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                 # Optional seed data
│
├── public/
│   ├── logo.svg
│   └── og-image.png
│
├── docker/
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── CODE_OF_CONDUCT.md
│   ├── CONTRIBUTING.md
│   └── SECURITY.md
│
├── docs/
│   ├── architecture.md
│   └── self-hosting.md
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.mjs
└── components.json            # shadcn/ui config
```

### Why no monorepo?

- v1 has one deployable: the Next.js app
- A monorepo adds tooling complexity (build orchestration, workspace management) with no benefit at this scale
- If a shared `@shipwithgit/ui` or `@shipwithgit/shared` package becomes valuable later, extracting it is straightforward
- pnpm workspaces can be added in 5 minutes when needed

---

## 10. 7-Day MVP Roadmap

### Day 1 — Foundation

**Goal:** Bootable project with auth

- Initialize Next.js with App Router + TypeScript
- Configure Tailwind CSS + shadcn/ui (base components: button, card, input, etc.)
- Set up Prisma with PostgreSQL schema (User, Account, Session, VerificationToken)
- Run initial migration
- Configure Auth.js with Email + GitHub providers
- Set up Docker Compose for local development (web + db)
- Create base layout (navbar, footer, theme provider)
- Verify: user can sign in with email magic link and GitHub OAuth

### Day 2 — User & Auth UI

**Goal:** Complete auth flow and user settings

- Sign in page (`/auth/signin`) with provider buttons
- Auth callback handling
- User menu in navbar (avatar, name, sign out)
- User settings page (`/settings`): edit name, avatar
- Session utility functions (getCurrentUser, requireAuth)
- Auth middleware to protect routes
- Basic empty landing page (`/`)

### Day 3 — Projects Core

**Goal:** Create and view projects

- Prisma schema: Project, ProjectMember
- Create project form (`/projects/new`) — name, slug, description
- Auto-create owner as ProjectMember on project creation
- Project page (`/projects/[slug]`) — name, description, members list
- Project settings page (`/projects/[slug]/settings`) — edit details
- Project list on dashboard (`/dashboard`)
- Slug uniqueness validation (Zod)
- Error pages (404, 403)

### Day 4 — Members & RBAC

**Goal:** Full member management with permission checks

- Members page (`/projects/[slug]/members`) — grid view
- Role change controls (admin+)
- Remove member (admin+)
- Permission utility: `requireRole(projectId, userId, minRole)`
- Guard components for conditional UI rendering
- Leave project flow (member+)
- Owner transfer flow (owner only)

### Day 5 — GitHub Integration

**Goal:** Link repos, see issues

- Prisma schema: LinkedRepo
- Link repo form — input GitHub repo URL, validate, fetch metadata via octokit
- Display linked repos on project page
- Fetch and cache open issues from linked repos via GitHub REST API
- Issues page (`/projects/[slug]/issues`) — aggregated feed
- Issue filters: by repo, text search
- Each issue links back to GitHub
- Rate limit handling (GitHub API)

### Day 6 — Invites & Join Requests

**Goal:** Complete access control workflow

- Prisma schema: Invite, JoinRequest
- Invite generation page (in project settings)
- Invite link acceptance (`/invite/[code]`)
- Join request form on public project page
- Join requests management page (`/projects/[slug]/requests`)
- Approval/denial flow (creates ProjectMember on approval)
- Invite-only mode toggle in project settings
- Instance-level invite-only mode (`APP_INVITE_ONLY`)

### Day 7 — Polish & Open-Source

**Goal:** Production-ready and public

- Loading states (skeleton components)
- Empty states for every list page
- Error boundaries
- Toast notifications for actions (shadcn/sonner)
- Responsive design pass (mobile layouts)
- Docker Compose for production deployment
- Environment documentation in `.env.example`
- Write README.md, LICENSE (MIT), CONTRIBUTING.md
- Add CODE_OF_CONDUCT.md, SECURITY.md
- Create issue templates and PR template
- Final testing pass (auth flows, CRUD, edge cases)
- `docker compose up` end-to-end verification

---

## 11. Open-Source Setup

### File list with requirements

| File | Content |
|------|---------|
| `README.md` | Project name, tagline, screenshot, features, quick start (3 commands), self-hosting link, contributing link, license badge |
| `LICENSE` | MIT (recommended for maximum adoption) |
| `CONTRIBUTING.md` | Dev setup (clone, install, env, migrate, run), coding standards (TS, Prettier), commit conventions (`feat:`, `fix:`, etc.), PR process |
| `CODE_OF_CONDUCT.md` | Contributor Covenant v2.1 (standard, copy from https://www.contributor-covenant.org/) |
| `SECURITY.md` | How to report vulnerabilities privately, expected response time |
| `.github/ISSUE_TEMPLATE/bug_report.md` | Bug description, reproduction steps, expected vs actual, environment |
| `.github/ISSUE_TEMPLATE/feature_request.md` | Problem statement, proposed solution, alternatives considered |
| `.github/PULL_REQUEST_TEMPLATE.md` | Checklist (tested, linted, typed), description, screenshots if UI |
| `.env.example` | Every env var with a comment explaining its purpose and where to get it |
| `.gitignore` | Node.js standard, `.env`, `.next/`, `prisma/*.db` |
| `docker-compose.yml` | Production-ready: app + postgres, env vars, volumes, health checks |
| `Dockerfile` | Multi-stage build: deps → build → run |

### Commit conventions

Adopt [Conventional Commits](https://www.conventionalcommits.org/) from day one:
- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `chore:` — tooling, config
- `refactor:` — code restructuring
- `style:` — formatting (no logic change)

### Branch strategy

- `main` — production-ready
- `dev` — integration branch (optional for v1; `main` might be enough)
- Feature branches: `feat/github-integration`, `fix/invite-expiry`

---

## 12. Risks and Scope Control

### Risk 1: Feature creep from "just one more thing"

**Problem:** Every stakeholder will suggest valuable features. If we add them all, v1 ships in 6 months instead of 7 days.

**Solution:**
- Maintain a public `ROADMAP.md` with a "v2 considerations" section
- When a feature request comes in, ask: "Does this belong in v1 or v2?"
- The v1 test: "Can a project team use GitTogether without this feature?"

### Risk 2: Duplicating GitHub functionality

**Problem:** If we build an issue tracker, project board, or code review tool, we're competing with GitHub instead of complementing it.

**Solution:**
- Issues are **read-only aggregated views** of GitHub issues, not a full issue manager
- No commenting on GitTogether — link to GitHub
- No code review — GitHub does this better
- **North star:** GitTogether should make GitHub more accessible, not replace it

### Risk 3: Permission model complexity

**Problem:** Everyone wants custom roles, granular permissions, and per-feature toggles.

**Solution:**
- Five fixed roles. No custom roles in v1.
- If someone needs fewer permissions, the answer is "use a lower role."
- Permission matrix is documented and stable.

### Risk 4: Self-hosting becoming a maintenance burden

**Problem:** Supporting "any deployment" (Kubernetes, bare metal, Heroku, etc.) creates infinite support requests.

**Solution:**
- Support exactly one deployment method: Docker Compose
- Document it thoroughly
- Everything else is community-supported
- No environment-specific code paths

### Risk 5: GitHub API rate limits

**Problem:** Without careful caching, the app will hit GitHub API limits with multiple projects.

**Solution:**
- Cache issue data with a TTL (30 seconds minimum)
- Use conditional requests (ETags) where possible
- Display last-sync timestamp on issue feeds
- Show a clear error if rate-limited

### Risk 6: Building for "everyone"

**Problem:** Trying to serve open-source projects, enterprises, indie devs, and enterprise teams simultaneously will make the product generic.

**Solution:**
- **v1 is for open-source maintainers and small teams**
- Enterprise features (SSO, audit logs, orgs) come after product-market fit
- Every design decision optimizes for the primary persona: the maintainer

### Scope control checklist

Before adding any v1 feature, ask:

- [ ] Does it make a project team more effective at collaborating around GitHub?
- [ ] Is it something GitHub doesn't already do well?
- [ ] Can we remove it without breaking the core flow?
- [ ] Does it require fewer than 3 new database tables? (If yes, it's probably too big)
- [ ] Can it be built in less than a day? (If no, defer to v2)
- [ ] Does it require real-time connections? (If yes, defer)
- [ ] Does it require external services beyond Postgres? (If yes, defer)
- [ ] Is a simpler version good enough for v1? (If no, simplify it)

---

## Final Recommendation

### The MVP direction

Build **one thing well**: a project hub for GitHub repositories with member management and issue visibility.

### The starting point

```
Next.js + Auth.js + Prisma + PostgreSQL + shadcn/ui + Tailwind + Docker
```

### The first 7-day sprint

1. Foundation and auth
2. Project CRUD
3. Members and roles
4. GitHub repo linking
5. Issue aggregation
6. Invites and join requests
7. Polish and open-source launch

### The launch target

**10 real open-source projects using GitTogether** before adding any new features.

### The hard constraints

- 5 roles, no custom permissions
- Read-only issue view, no issue management
- Docker Compose, single deployment method
- MIT licensed, community-first
- No billing, no API, no real-time, no file storage

### Why this will work

GitTogether fills a real gap: GitHub projects need a clean identity and structured membership without leaving the GitHub ecosystem. This MVP delivers that in a week, with a clear path to grow based on real user feedback.

**Start here. Ship fast. Listen to maintainers. Don't add features until someone asks for them.**
