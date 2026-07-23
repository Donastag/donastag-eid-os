CREATE TABLE IF NOT EXISTS verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    checks JSONB NOT NULL DEFAULT '[]',
    result JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS verification_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    verification_id UUID NOT NULL,
    passed BOOLEAN NOT NULL,
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verifications_request_id ON verifications (request_id);
CREATE INDEX IF NOT EXISTS idx_verification_runs_verification_id ON verification_runs (verification_id);

CREATE TRIGGER verifications_set_updated_at BEFORE UPDATE ON verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER verification_runs_set_updated_at BEFORE UPDATE ON verification_runs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
