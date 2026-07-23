CREATE TABLE IF NOT EXISTS asset_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id TEXT NOT NULL,
    version TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS asset_evolution_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id TEXT NOT NULL,
    from_version TEXT,
    to_version TEXT NOT NULL,
    kind TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_asset_versions_asset_id ON asset_versions (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_evolution_events_asset_id ON asset_evolution_events (asset_id);
CREATE INDEX IF NOT EXISTS idx_asset_evolution_events_kind ON asset_evolution_events (kind);

CREATE TRIGGER asset_versions_set_updated_at BEFORE UPDATE ON asset_versions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
