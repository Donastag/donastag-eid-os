CREATE TABLE IF NOT EXISTS security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    findings JSONB NOT NULL DEFAULT '[]',
    score INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS security_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID NOT NULL,
    severity TEXT NOT NULL DEFAULT 'low',
    title TEXT NOT NULL,
    detail TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_security_scans_request_id ON security_scans (request_id);
CREATE INDEX IF NOT EXISTS idx_security_findings_scan_id ON security_findings (scan_id);

CREATE TRIGGER security_scans_set_updated_at BEFORE UPDATE ON security_scans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER security_findings_set_updated_at BEFORE UPDATE ON security_findings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
