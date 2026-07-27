CREATE TABLE IF NOT EXISTS capability_constraints (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability_name       TEXT NOT NULL REFERENCES capabilities(name),
    constraint_type       TEXT NOT NULL,
    detail                TEXT NOT NULL,
    affected_version      TEXT,
    severity              TEXT NOT NULL DEFAULT 'warning',
    learned_from_project  TEXT,
    source_lesson_id      UUID REFERENCES project_lessons(id),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_capability_constraints_name ON capability_constraints (capability_name);
CREATE INDEX IF NOT EXISTS idx_capability_constraints_severity ON capability_constraints (severity);
