CREATE TABLE IF NOT EXISTS policy_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    capability TEXT NOT NULL,
    action TEXT NOT NULL,
    requires_human_approval BOOLEAN NOT NULL DEFAULT TRUE,
    reason TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_policy_rules_capability_action UNIQUE (capability, action)
);

CREATE INDEX IF NOT EXISTS idx_policy_rules_capability_action ON policy_rules (capability, action);

INSERT INTO policy_rules (capability, action, requires_human_approval, reason)
VALUES ('default', 'default', TRUE, 'Default deny-by-approval for unrecognized capability/action pairs')
ON CONFLICT (capability, action) DO NOTHING;
