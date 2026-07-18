-- Donastag Engineering OS — Capability Registry (Phase 1, v0.2.0)
-- This is the technology abstraction layer: a single table other engines
-- (AI Router, Director, Policy Engine) read from, so nothing hardcodes
-- "call Claude's API directly" — everything goes through a registered capability.

CREATE EXTENSION IF NOT EXISTS pgcrypto; -- needed for gen_random_uuid()

CREATE TABLE IF NOT EXISTS capabilities (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            TEXT NOT NULL UNIQUE,          -- e.g. 'claude-api', 'electromart-supabase'
    type            TEXT NOT NULL,                 -- e.g. 'ai_provider', 'database', 'storage', 'project_endpoint'
    invocation_method TEXT NOT NULL,                -- e.g. 'https_api', 'sdk', 'webhook'
    endpoint        TEXT,                          -- base URL or connection reference (no secrets here)
    secret_ref      TEXT,                          -- pointer/key name in Coolify secrets manager, never the secret itself
    cost_model      JSONB,                          -- e.g. {"unit": "per_1k_tokens", "input": 0.003, "output": 0.015}
    status          TEXT NOT NULL DEFAULT 'active', -- 'active' | 'disabled' | 'deprecated'
    owner_project   TEXT,                           -- NULL for Donastag-kernel-owned capabilities, else project slug e.g. 'electromart'
    version         TEXT NOT NULL DEFAULT '1.0.0',   -- capability's own version, independent of Donastag's version
    metadata        JSONB DEFAULT '{}',              -- freeform extension point, avoids schema churn later
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Fast lookups by type (Router will query "give me all active ai_provider capabilities")
CREATE INDEX IF NOT EXISTS idx_capabilities_type_status ON capabilities (type, status);

-- Fast lookups by owning project (so a project's node knows only its own capabilities)
CREATE INDEX IF NOT EXISTS idx_capabilities_owner_project ON capabilities (owner_project);

-- Keep updated_at honest on every row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_capabilities_updated_at ON capabilities;
CREATE TRIGGER trg_capabilities_updated_at
    BEFORE UPDATE ON capabilities
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();

-- Seed: the first real capability — Claude API, since it's the Router's first provider
INSERT INTO capabilities (name, type, invocation_method, endpoint, secret_ref, cost_model, owner_project, metadata)
VALUES (
    'claude-api',
    'ai_provider',
    'https_api',
    'https://api.anthropic.com/v1/messages',
    'ANTHROPIC_API_KEY',
    '{"unit": "per_1k_tokens", "note": "verify current pricing before relying on this value"}',
    NULL,
    '{"provider": "anthropic"}'
)
ON CONFLICT (name) DO NOTHING;
