CREATE TABLE IF NOT EXISTS engineering_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    overall DOUBLE PRECISION NOT NULL,
    breakdown JSONB NOT NULL DEFAULT '{}',
    computed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    metadata JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS architecture_fitness_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule TEXT NOT NULL,
    status TEXT NOT NULL,
    detail TEXT,
    score_impact DOUBLE PRECISION DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
