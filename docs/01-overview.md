<h1 align="center">Repository Overview</h1>

<p align="center">
  Nx monorepo containing a React client and a Python FastAPI server for video upload, audio processing, and real-time playback.
</p>

---

## Table of Contents

- [Table of Contents](#table-of-contents)
- [What this repository is](#what-this-repository-is)
- [Monorepo structure](#monorepo-structure)
- [Apps](#apps)
    - [Client — `apps/client`](#client--appsclient)
    - [Server — `apps/server`](#server--appsserver)
- [Tooling](#tooling)
- [Running everything](#running-everything)
    - [Local development](#local-development)
    - [Testing \& utilities](#testing--utilities)

---

## What this repository is

This is an **Nx monorepo** that houses two applications sharing a single workspace:

| App           | Language / Framework         | Role                                                     |
| ------------- | ---------------------------- | -------------------------------------------------------- |
| `apps/client` | TypeScript · React 19 · Vite | Browser UI — upload, playback, real-time status          |
| `apps/server` | Python 3.12 · FastAPI        | REST API + background worker — video processing pipeline |

The two apps are developed, linted, tested, and built through a unified set of Nx targets so you never need to jump between separate repos or remember different toolchains.

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Monorepo structure

```
panjaya-video-task/
├── apps/
│   ├── client/                 — React + TypeScript frontend
│   │   ├── src/
│   │   ├── project.json        — Nx targets: serve, build, lint, test, e2e
│   │   └── vite.config.ts
│   └── server/                 — Python FastAPI backend
│       ├── video_audio_server/ — application source
│       ├── tests/              — unit + integration + (future) BDD
│       ├── docker/             — docker-compose files for local dev and CI
│       ├── Dockerfile          — API image (uvicorn)
│       ├── Dockerfile.worker   — Worker image (arq)
│       └── project.json        — Nx targets: serve, test, lint
├── docs/                       — all documentation (this directory)
├── packages/                   — shared libs (currently empty, reserved)
├── nx.json                     — Nx workspace config, task pipeline
├── package.json                — root npm workspace, Nx CLI, shared dev deps
└── pyproject.toml / poetry.lock (per-app, under apps/server/)
```

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Apps

### Client — `apps/client`

- **React 19** with the React Compiler enabled.
- **Vite** for dev server and production builds.
- **TanStack Query** for server-state management (assets list, polling).
- **Redux Toolkit** for UI state (auth tokens, playback mode).
- **React Router v6** for client-side routing.
- **i18next** for internationalisation.
- **CSS modules** for component-scoped styles.
- **Vitest + Testing Library** for unit tests; **Playwright** for end-to-end.

See [02-client.md](02-client.md) for the full client architecture.

### Server — `apps/server`

- **FastAPI** (async throughout) served by **Uvicorn**.
- **PostgreSQL** via **SQLAlchemy 2.0 async** + **Alembic** migrations.
- **Redis** for JWT, SSE pub/sub fan-out, and the arq job queue.
- **arq** background workers that run the **FFmpeg** video/audio pipeline.
- **S3-compatible object storage** (MinIO locally, AWS S3 in production) for all media.
- Two Docker images sharing the same build: API (`uvicorn`) and Worker (`arq`).

See [03-server.md](03-server.md) for the full server architecture.

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Tooling

| Tool                    | Purpose                                              |
| ----------------------- | ---------------------------------------------------- |
| **Nx 22**               | Task orchestration, affected-graph analysis, caching |
| **@nxlv/python**        | Nx plugin that adds Python/Poetry project support    |
| **npm workspaces**      | JS package hoisting across `apps/` and `packages/`   |
| **Poetry**              | Python dependency management and virtual env         |
| **ESLint + Prettier**   | JS/TS linting and formatting                         |
| **Ruff**                | Python linting and formatting (via lint-staged)      |
| **Mypy**                | Python static type checking                          |
| **Husky + lint-staged** | Pre-commit hooks — auto-format staged files          |
| **Docker Compose**      | Local dev stack and ephemeral CI test infrastructure |

<p align="left"><a href="#">↑ Back to top</a></p>

---

## Running everything

### Local development

Running the full stack locally requires **four** processes. Start them in order:

```bash
# 1. Install all JS dependencies (once)
npm install

# 2. Start infrastructure — Postgres, Redis, MinIO (keep running)
npm run server:docker:up

# 3. Start the API server (terminal 1)
npm run server:start              # FastAPI on localhost:8000

# 4. Start the arq worker (terminal 2)
npm run worker:start              # Processes video jobs from the queue

# 5. Start the client (terminal 3)
npm run client:start              # Vite dev server on localhost:5173
```

### Testing & utilities

```bash
# ── Testing ─────────────────────────────────────────────────────────
npm test                          # Run all Nx-affected tests
npm run server:test               # Server tests (spins up test containers)

# ── Nx shortcuts ────────────────────────────────────────────────────
npm run graph                     # Visualise the project dependency graph
npm run graph:affected            # Show only affected projects
```

<p align="left"><a href="#">↑ Back to top</a></p>
