-- Donastag Engineering OS — policy_rules project scoping
ALTER TABLE policy_rules
  ADD COLUMN IF NOT EXISTS owner_project TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_policy_rules_unique_scoped
  ON policy_rules (capability, action, COALESCE(owner_project, ''));

INSERT INTO policy_rules (capability, action, requires_human_approval, reason, owner_project)
VALUES ('electromart.check_stock', 'read', false, 'Read-only stock check, safe to auto-allow', 'electromart')
ON CONFLICT DO NOTHING;
