# Donastag Engineering OS

Self-hosted Engineering Operating System kernel. Single environment (Donastag Node,
Z620 Proxmox VM), deployed via Coolify watching this repo's `main` branch.

See `VERSIONING.md` for the tag/rollback convention and `CHANGELOG.md` for history.

## Current phase: Phase 0 → Phase 1

- [x] `docker-compose.yml` — Postgres, Redis, n8n baseline
- [x] Capability Registry schema (`migrations/001_capability_registry.sql`)
- [ ] Thin AI Router
- [ ] Minimal Policy Engine
- [ ] Thin Telegram Concierge
- [ ] Thin Engineering Intelligence Director (Phase 2)

## Setup

1. Copy `.env.example` to `.env`, fill in real values (never commit `.env`).
2. Push to `main` — Coolify auto-deploys.
3. On first deploy, `migrations/001_capability_registry.sql` runs automatically via
   Postgres's init-db mount (only fires on an empty data volume — for schema changes
   after that, add a new numbered migration file and run it manually or via a
   migration tool once the registry has real usage).

## Architecture boundary (do not violate)

Donastag kernel services live **only** on the Donastag Node. Project code
(Electro.mart, DukaSmart, etc.) lives on its own separate node and talks to Donastag
only over the network (API calls, webhooks) — never co-hosted, never shares this repo.
