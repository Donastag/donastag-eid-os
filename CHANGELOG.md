# Changelog

## v0.5.0-phase7 — 2026-07-23
- Phase 7: production readiness.
- Add backup/restore scripts and migration runner.
- Add Prometheus metrics exporter (`monitoring_exporter`, `8016`).
- Add alertmanager rule file under `monitoring/alertmanager/rules.yml`.
- Add `/ops` dashboard page and API health route.
- Complete Studio sidebar wiring for all Phase 0–7 pages.
- Expand README with Phase 7 checklist, healthchecks, backup/restore, and architecture boundary.
- Add deploy-time healthchecks for core services in `docker-compose.yml`.

## v0.4.0-phase5 — 2026-07-23
- Phase 5: Asset Evolution Engine, Collaboration Engine, Marketplace, Expert System.
- Telegram deep integration with /status, /verify, /inbox commands.
- Studio full sidebar wiring for all Phase 4-5 pages.
- Services: asset_evolution (8012), collaboration (8013), marketplace (8014), expert_system (8015).
- Migrations 012-015 added.

## v0.3.0-phase4 — 2026-07-23
- Phase 4: Engineering Inbox, Knowledge Graph, Workflow Intelligence Engine, Engineering Journal, Engineering Score, Architecture Fitness Functions.
- Services: inbox (8006), kg (8007), workflow (8008), journal (8009), score (8010), fitness (8011).
- Migrations 007-011 added.

## v0.1.0-infra-baseline — (pending first deploy)
Initial docker-compose baseline: Postgres, Redis, n8n. Capability Registry schema added.
