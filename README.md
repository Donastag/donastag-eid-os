# Donastag Engineering OS

Self-hosted Engineering Operating System kernel. Single environment (Donastag Node,
Z620 Proxmox VM), deployed via Coolify watching this repo's `main` branch.

See `VERSIONING.md` for the tag/rollback convention and `CHANGELOG.md` for history.

## Current phase: Phase 0 → Phase 2

- [x] `docker-compose.yml` — Postgres, Redis, n8n baseline
- [x] Capability Registry schema (`migrations/001_capability_registry.sql`)
- [x] Thin AI Router
- [x] Minimal Policy Engine
- [x] Thin Telegram Concierge
- [x] Thin Engineering Intelligence Director (Phase 2)

## Setup

1. Push this repo to GitHub, connect it to Coolify (deploy key or GitHub App), and
   create the Docker Compose resource pointing at `docker-compose.yml`.
2. **No manual secrets needed.** `POSTGRES_PASSWORD`, `REDIS_PASSWORD`, and
   `N8N_ENCRYPTION_KEY` use Coolify's magic environment variables
   (`SERVICE_PASSWORD_POSTGRES`, `SERVICE_PASSWORD_REDIS`, `SERVICE_REALBASE64_64_N8N`) —
   Coolify generates and injects these automatically on first deploy. You can view
   (but don't need to set) them afterward in the resource's Environment Variables tab.
3. The only thing worth checking before deploy: `N8N_HOST` defaults to the VM's
   current static IP (`192.168.3.211`) — update the default in `docker-compose.yml`
   or override it in Coolify's env tab if your IP changes.
4. Push to `main` — Coolify auto-deploys.
5. On first deploy, `migrations/001_capability_registry.sql` runs automatically via
   Postgres's init-db mount (only fires on an empty data volume — for schema changes
   after that, add a new numbered migration file and run it manually or via a
   migration tool once the registry has real usage).

## Architecture boundary (do not violate)

Donastag kernel services live **only** on the Donastag Node. Project code
(Electro.mart, DukaSmart, etc.) lives on its own separate node and talks to Donastag
only over the network (API calls, webhooks) — never co-hosted, never shares this repo.
