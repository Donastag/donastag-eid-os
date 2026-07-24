CREATE TABLE IF NOT EXISTS project_intakes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  requirements JSONB NOT NULL DEFAULT '{}',
  tech_stack JSONB DEFAULT '{}',
  constraints JSONB DEFAULT '{}',
  timeline_weeks INT DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'intake',
  architectural_plan JSONB DEFAULT '{}',
  execution_notes JSONB DEFAULT '{}',
  lessons_learned JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS project_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES project_intakes(id),
  phase TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_project_intakes_status ON project_intakes(status);
CREATE INDEX IF NOT EXISTS idx_project_lessons_project_id ON project_lessons(project_id);
