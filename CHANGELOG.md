# Changelog

## v0.7.3-capability-constraints — 2026-07-27
- Add `capability_constraints` table with migration 019 for structured version/compatibility knowledge.
- Add `POST /constraints` and `GET /constraints?capability_name=X` endpoints to project_intake.
- Wire constraints into `generate_plan()`: prompt now includes known issues/constraints before requesting JSON.
- Add second validation pass: blocker-level constraints on recommended capabilities are flagged in `stack_validation.constraint_violations`.
- Verified: seaweedfs blocker constraint stored; Electro.mart plan respects it by excluding seaweedfs from recommendations; `stack_validation.valid=true`, `constraint_violations=[]`.

## v0.7.2-stack-validation — 2026-07-27
- Add code-level stack recommendation validation to project_intake plan generation.
- Prompt now repeats the available components list as a hard constraint twice.
- After parsing AI response, validate all `tech_recommendations` values against registered `capabilities` (`type='oss_stack_component'`).
- Unrecognized recommendations are flagged in `architectural_plan.stack_validation.unrecognized` rather than rejecting the whole plan.
- Cleaned JSON parsing strips markdown code blocks before `json.loads()`.
- Verified: Electro.mart plan now recommends only registered components (`fastapi`, `postgresql`, `nextjs`, `react`, `stripe`, `paystack`, etc.) with `stack_validation.valid=true`.

## v0.7.1-project-intake-director — 2026-07-27
- Replace project_intake's hardcoded plan generator with Director-driven, Capability-Registry-constrained proposal.
- `POST /intakes/{id}/plan` now queries `capabilities` for `oss_stack_component` entries, builds a constrained prompt, and calls Director's `/orchestrate` endpoint.
- Added approval gate: `POST /intakes/{id}/approve` and `POST /intakes/{id}/reject` with execution_notes history.
- Added policy rule `project_intake.generate_plan/write` (owner_project=NULL) so plan generation is auto-allowed; human approval is explicit via `/approve`.
- Verified: Electro.mart intake plan is AI-generated and project-specific; Director requests log confirms routing through Policy Engine; approval flow sets status to `approved`.

## v0.7.0-policy-project-scoping — 2026-07-25
- Add `owner_project` scoping to `policy_rules` via migration 018.
- Director `get_policy()` now queries in priority order: exact scoped match → general rule (owner_project IS NULL) → fail-closed default.
- `DirectorRequest` accepts optional `owner_project`; `/orchestrate` passes it through.
- Verified: `electromart.check_stock/read` with `owner_project=electromart` returns `allowed=true`; `electromart.delete_order/write` with same project returns `allowed=false`.
- Unique index on `(capability, action, COALESCE(owner_project, ''))` prevents duplicate scoped rules.

## v0.6.1-policy-scoping — 2026-07-25
- Add `owner_project` scoping to `policy_rules` via migration 018.
- Director `get_policy()` now queries in priority order: exact scoped match → general rule (owner_project IS NULL) → fail-closed default.
- `DirectorRequest` accepts optional `owner_project`; `/orchestrate` passes it through.
- Verified: `electromart.check_stock/read` with `owner_project=electromart` returns `allowed=true`; `electromart.delete_order/write` with same project returns `allowed=false`.
- Unique index on `(capability, action, COALESCE(owner_project, ''))` prevents duplicate scoped rules.

## v0.6.0-eid-orchestration-confirmed — 2026-07-24
- Director orchestration chain verified end-to-end with working policy gate.
- Telegram Concierge now routes through Director (`POST /orchestrate`) before AI Router.
- Policy Engine enforcement confirmed live: flipped `policy_rules.requires_human_approval` to `true` for `default/default`, sent test request, confirmed `allowed=false` with reason returned and **no** call to AI Router.
- Acceptance test reproducible: see `src/director/main.py` `route_request()` — policy query happens before `httpx` call to AI Router, and `requires_human_approval=true` short-circuits the call.
- Renamed Director endpoint from `/direct` to `/orchestration` to reflect actual behavior.
- Removed duplicate request persistence in Director endpoint handler.

## v0.5.0-phase7 — 2026-07-23
- Phase 7: production readiness.
- Add backup/restore scripts and migration runner.
- Add Prometheus metrics exporter (`monitoring_exporter`, `8016`).
- Add alertmanager rule file under `monitoring/alertmanager/rules.yml`.
- Add `/ops` dashboard page and API health route.
- Complete Studio sidebar wiring for all Phase 0–7 pages.
- Expand README with Phase 7 checklist, healthchecks, backup/restore, and architecture boundary.
- Add deploy-time healthchecks for core services in `docker-compose.yml`.
- Add project intake & architecture module (`project_intake`, `8017`).
- Fix orchestration wiring: Telegram Concierge now routes through Director before AI Router.
- Policy engine enforcement active in live request path via `POST /direct`.
- Remove bogus seed data; empty tables are genuinely empty and ready for live inputs.
- Start n8n service and remove duplicate `docker-compose.yaml`.

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
