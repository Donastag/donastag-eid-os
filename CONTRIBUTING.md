# Contributing

## Setup
1. Copy `.env.example` to `.env` and fill local values.
2. Run `docker compose up -d --build`.
3. Verify health endpoints for new services.

## Branching
- `main` is deployable.
- Use feature branches for non-trivial work.

## Migration policy
- Add a new numbered SQL file in `migrations/` for schema changes.
- Idempotent DDL (`CREATE TABLE IF NOT EXISTS`, trigger guards) is required.
