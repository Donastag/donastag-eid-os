CREATE TABLE IF NOT EXISTS kg_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS kg_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES kg_entities(id),
    target_id UUID NOT NULL REFERENCES kg_entities(id),
    kind TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_kg_entities_kind ON kg_entities (kind);
CREATE INDEX IF NOT EXISTS idx_kg_relations_source ON kg_relations (source_id);
CREATE INDEX IF NOT EXISTS idx_kg_relations_target ON kg_relations (target_id);
CREATE INDEX IF NOT EXISTS idx_kg_relations_kind ON kg_relations (kind);

CREATE TRIGGER kg_entities_set_updated_at BEFORE UPDATE ON kg_entities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER kg_relations_set_updated_at BEFORE UPDATE ON kg_relations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
