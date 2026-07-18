# Donastag Engineering OS — Versioning & Rollback Convention

Donastag runs as a single, self-hosted environment (Z620 Donastag Node). There is no
staging/production split for the kernel itself — versioning exists purely to give us
safe, deliberate rollback points as engines come online.

---

## 1. Branching

- `main` is the only long-lived branch. No environment branches (`dev`/`staging`) —
  those exist per-*project* (Electro.mart etc.), not for Donastag itself.
- Feature work happens on short-lived branches (`feature/capability-registry`,
  `feature/ai-router`), merged into `main` via fast-forward or squash merge.
- **Never force-push to `main`.** History must stay linear so every past state is
  genuinely recoverable.

## 2. Tagging convention

Tag `main` only at meaningful milestones — when a kernel engine reaches a working,
demoable state — not on every commit.

**Format:** `vMAJOR.MINOR.PATCH-<milestone-slug>`

| Version | Meaning |
|---|---|
| `v0.x.x` | Pre-kernel-complete (any of the 15 kernel engines still missing) |
| `v1.0.0` | All 15 frozen kernel engines are live in at least thin form |
| `MINOR` bump | A new kernel engine goes live |
| `PATCH` bump | Bug fix / config change to an already-live engine, no new capability added |

**Example progression (Phase 0–2):**

```
v0.1.0-infra-baseline      Coolify + Postgres/Redis/n8n running, auto-deploy confirmed
v0.2.0-capability-registry Capability Registry live
v0.3.0-ai-router           Thin AI Router live
v0.4.0-policy-engine       Minimal Policy Engine live
v0.5.0-telegram-concierge  Thin Telegram Concierge live
v0.6.0-eid                 Thin Engineering Intelligence Director live
```

Tag immediately after confirming the deploy works, not before:

```bash
git tag -a v0.2.0-capability-registry -m "Capability Registry: schema + basic CRUD live"
git push origin v0.2.0-capability-registry
```

## 3. Rollback procedures

**Fast / emergency rollback** (something just broke in production use):
- In Coolify, redeploy the last known-good tag or commit SHA instead of latest `main`.
- Does not touch git history — just changes what's currently running.

**Clean / permanent rollback** (the bad change needs to be undone properly):
```bash
git revert <bad-commit-sha>
git push origin main
```
- Never use `git reset --hard` + force-push on `main` — that destroys history other
  tags/commits may depend on.
- Coolify auto-redeploys `main` on push, so the revert ships automatically.

## 4. What git rollback does NOT cover

- **Database schema changes.** A code rollback does not undo a Postgres migration.
  Once Capability Registry's schema is live, schema changes must go through a
  migration tool (e.g. a lightweight migration folder with up/down scripts) so they
  can be reversed independently of app code rollback.
- **Secrets / environment variables.** Never commit `.env` files, even to a private
  repo. Use Coolify's built-in secrets management per service. Rolling back code
  will not roll back an env var change made directly in Coolify.

## 5. Changelog

Maintain `CHANGELOG.md` at repo root, updated at each tag — one line per tag, plain
language, e.g.:

```
## v0.3.0-ai-router — 2026-08-02
Added thin AI Router: routes to Claude API via Capability Registry lookups.
No caching, failover, or token tracking yet.
```

This becomes the plain-English companion to the tag list — useful when deciding
which tag to roll back to without having to read commit diffs.
