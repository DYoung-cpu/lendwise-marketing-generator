-- Dreambooth Training and Validation Database Schema
-- For tracking Dreambooth model training, generation quality, and learning

-- Table: Dreambooth Training Records
CREATE TABLE IF NOT EXISTS dreambooth_trainings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id TEXT NOT NULL,
  training_id TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('training', 'succeeded', 'failed', 'canceled')),
  training_images TEXT[] NOT NULL,
  parameters JSONB NOT NULL,
  validation_results JSONB,
  training_duration_ms INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dreambooth_trainings_officer ON dreambooth_trainings(officer_id);
CREATE INDEX idx_dreambooth_trainings_status ON dreambooth_trainings(status);
CREATE INDEX idx_dreambooth_trainings_created ON dreambooth_trainings(created_at DESC);

-- Table: Dreambooth Generations
CREATE TABLE IF NOT EXISTS dreambooth_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id TEXT NOT NULL UNIQUE,
  officer_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  prompt TEXT,
  style TEXT CHECK (style IN ('professional', 'casual', 'formal')),
  validation_score REAL CHECK (validation_score >= 0 AND validation_score <= 1),
  face_confidence REAL CHECK (face_confidence >= 0 AND face_confidence <= 1),
  attempts INTEGER DEFAULT 1,
  parameters JSONB,
  validation_data JSONB,
  passed BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dreambooth_generations_officer ON dreambooth_generations(officer_id);
CREATE INDEX idx_dreambooth_generations_passed ON dreambooth_generations(passed);
CREATE INDEX idx_dreambooth_generations_score ON dreambooth_generations(validation_score DESC);
CREATE INDEX idx_dreambooth_generations_timestamp ON dreambooth_generations(timestamp DESC);

-- Table: Dreambooth Quality Validations
-- Detailed validation results for quality analysis
CREATE TABLE IF NOT EXISTS dreambooth_quality_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id TEXT NOT NULL,
  officer_id TEXT NOT NULL,
  overall_score REAL NOT NULL CHECK (overall_score >= 0 AND overall_score <= 1),
  face_confidence REAL CHECK (face_confidence >= 0 AND face_confidence <= 1),
  face_score REAL CHECK (face_score >= 0 AND face_score <= 1),
  professional_score REAL CHECK (professional_score >= 0 AND professional_score <= 1),
  brand_score REAL CHECK (brand_score >= 0 AND brand_score <= 1),
  passed BOOLEAN NOT NULL,
  issues TEXT[],
  validation_data JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dreambooth_quality_officer ON dreambooth_quality_validations(officer_id);
CREATE INDEX idx_dreambooth_quality_passed ON dreambooth_quality_validations(passed);
CREATE INDEX idx_dreambooth_quality_face_confidence ON dreambooth_quality_validations(face_confidence DESC);
CREATE INDEX idx_dreambooth_quality_timestamp ON dreambooth_quality_validations(timestamp DESC);

-- Table: Dreambooth Failures (for learning)
CREATE TABLE IF NOT EXISTS dreambooth_failures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id TEXT NOT NULL,
  prompt TEXT,
  issues TEXT[] NOT NULL,
  validation_data JSONB,
  parameters JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dreambooth_failures_officer ON dreambooth_failures(officer_id);
CREATE INDEX idx_dreambooth_failures_issues ON dreambooth_failures USING GIN(issues);
CREATE INDEX idx_dreambooth_failures_timestamp ON dreambooth_failures(timestamp DESC);

-- Table: Dreambooth Parameter Adjustments (for learning)
CREATE TABLE IF NOT EXISTS dreambooth_parameter_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  officer_id TEXT NOT NULL,
  adjustment TEXT NOT NULL,
  parameters JSONB NOT NULL,
  reason TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_dreambooth_adjustments_officer ON dreambooth_parameter_adjustments(officer_id);
CREATE INDEX idx_dreambooth_adjustments_type ON dreambooth_parameter_adjustments(adjustment);
CREATE INDEX idx_dreambooth_adjustments_timestamp ON dreambooth_parameter_adjustments(timestamp DESC);

-- View: Officer Training Quality Summary
CREATE OR REPLACE VIEW dreambooth_officer_quality AS
SELECT
  officer_id,
  COUNT(*) as total_generations,
  AVG(validation_score) as avg_validation_score,
  AVG(face_confidence) as avg_face_confidence,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END) as passed_count,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as pass_rate,
  MAX(validation_score) as best_score,
  MIN(validation_score) as worst_score,
  AVG(attempts) as avg_attempts,
  MAX(timestamp) as last_generation
FROM dreambooth_generations
GROUP BY officer_id;

-- View: Officer Training Performance
CREATE OR REPLACE VIEW dreambooth_training_performance AS
SELECT
  dt.officer_id,
  dt.training_id,
  dt.status,
  dt.completed_at - dt.created_at as training_duration,
  COUNT(dg.id) as generations_count,
  AVG(dg.validation_score) as avg_quality,
  SUM(CASE WHEN dg.passed THEN 1 ELSE 0 END)::FLOAT / COUNT(dg.id) as pass_rate
FROM dreambooth_trainings dt
LEFT JOIN dreambooth_generations dg ON dt.officer_id = dg.officer_id
WHERE dt.status = 'succeeded'
  AND dg.timestamp > dt.completed_at
GROUP BY dt.officer_id, dt.training_id, dt.status, dt.created_at, dt.completed_at
ORDER BY dt.completed_at DESC;

-- View: Common Failure Patterns
CREATE OR REPLACE VIEW dreambooth_failure_patterns AS
SELECT
  unnest(issues) as issue_type,
  COUNT(*) as occurrence_count,
  COUNT(DISTINCT officer_id) as affected_officers,
  MAX(timestamp) as last_occurrence
FROM dreambooth_failures
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY issue_type
ORDER BY occurrence_count DESC;

-- View: Officer Performance Trends (Last 30 days)
CREATE OR REPLACE VIEW dreambooth_officer_trends AS
SELECT
  officer_id,
  DATE_TRUNC('day', timestamp) as date,
  COUNT(*) as generations,
  AVG(validation_score) as avg_score,
  AVG(face_confidence) as avg_face_confidence,
  SUM(CASE WHEN passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as pass_rate
FROM dreambooth_generations
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY officer_id, DATE_TRUNC('day', timestamp)
ORDER BY officer_id, date DESC;

-- Function: Get Officers Needing Retraining
CREATE OR REPLACE FUNCTION get_officers_needing_retraining(
  min_generations INTEGER DEFAULT 10,
  max_pass_rate REAL DEFAULT 0.70,
  max_face_confidence REAL DEFAULT 0.90
) RETURNS TABLE (
  officer_id TEXT,
  total_generations BIGINT,
  pass_rate REAL,
  avg_face_confidence REAL,
  last_generation TIMESTAMPTZ,
  recommendation TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dg.officer_id,
    COUNT(*) as total_generations,
    SUM(CASE WHEN dg.passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as pass_rate,
    AVG(dg.face_confidence) as avg_face_confidence,
    MAX(dg.timestamp) as last_generation,
    CASE
      WHEN AVG(dg.face_confidence) < 0.85 THEN 'URGENT: Retrain with higher quality face photos'
      WHEN SUM(CASE WHEN dg.passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) < 0.60 THEN 'High failure rate - review training photos'
      ELSE 'Moderate improvements needed - add more diverse training photos'
    END as recommendation
  FROM dreambooth_generations dg
  WHERE dg.timestamp > NOW() - INTERVAL '7 days'
  GROUP BY dg.officer_id
  HAVING
    COUNT(*) >= min_generations
    AND (
      SUM(CASE WHEN dg.passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) < max_pass_rate
      OR AVG(dg.face_confidence) < max_face_confidence
    )
  ORDER BY AVG(dg.face_confidence) ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get Best Performing Parameters
CREATE OR REPLACE FUNCTION get_best_dreambooth_parameters(
  for_officer_id TEXT DEFAULT NULL,
  min_score REAL DEFAULT 0.85
) RETURNS TABLE (
  parameters JSONB,
  avg_score REAL,
  generation_count BIGINT,
  pass_rate REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    dg.parameters,
    AVG(dg.validation_score) as avg_score,
    COUNT(*) as generation_count,
    SUM(CASE WHEN dg.passed THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as pass_rate
  FROM dreambooth_generations dg
  WHERE
    (for_officer_id IS NULL OR dg.officer_id = for_officer_id)
    AND dg.validation_score >= min_score
    AND dg.timestamp > NOW() - INTERVAL '30 days'
  GROUP BY dg.parameters
  HAVING COUNT(*) >= 3
  ORDER BY AVG(dg.validation_score) DESC, COUNT(*) DESC
  LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE dreambooth_trainings IS 'Records of Dreambooth model training sessions for loan officers';
COMMENT ON TABLE dreambooth_generations IS 'All images generated with Dreambooth models, including quality scores';
COMMENT ON TABLE dreambooth_quality_validations IS 'Detailed validation results for Dreambooth outputs';
COMMENT ON TABLE dreambooth_failures IS 'Failed generations for pattern detection and learning';
COMMENT ON TABLE dreambooth_parameter_adjustments IS 'History of parameter adjustments for optimization';

COMMENT ON VIEW dreambooth_officer_quality IS 'Summary of generation quality per officer';
COMMENT ON VIEW dreambooth_training_performance IS 'Performance metrics for each training session';
COMMENT ON VIEW dreambooth_failure_patterns IS 'Common failure patterns across all generations';
COMMENT ON VIEW dreambooth_officer_trends IS 'Daily performance trends per officer';

COMMENT ON FUNCTION get_officers_needing_retraining IS 'Identify officers whose models need retraining based on quality metrics';
COMMENT ON FUNCTION get_best_dreambooth_parameters IS 'Find the best performing parameter combinations';
