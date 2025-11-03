-- Playwright MCP Validation & Learning System
-- Database schema for tracking technical validation results and learning patterns

-- Table 1: playwright_validations
-- Stores detailed technical validation results from Playwright MCP
CREATE TABLE IF NOT EXISTS playwright_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generation_id TEXT NOT NULL,
  image_url TEXT NOT NULL,

  -- Technical metrics
  dimensions JSONB, -- {width, height, aspectRatio}
  colors JSONB,     -- {avgR, avgG, avgB, variance, brightness}
  complexity JSONB, -- {colorVariance, edgeRatio, contrastRatio}

  -- Scoring
  score NUMERIC(3,2), -- 0.00-1.00
  issues TEXT[],

  -- Quality flags
  has_design_elements BOOLEAN,
  has_proper_composition BOOLEAN,
  has_good_contrast BOOLEAN,

  -- Raw data
  raw_metrics JSONB,

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  validation_duration_ms INTEGER
);

CREATE INDEX IF NOT EXISTS idx_playwright_validations_generation
  ON playwright_validations(generation_id);
CREATE INDEX IF NOT EXISTS idx_playwright_validations_timestamp
  ON playwright_validations(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_playwright_validations_score
  ON playwright_validations(score DESC);

-- Table 2: playwright_learning_patterns
-- Tracks patterns and correlations between technical metrics and quality scores
CREATE TABLE IF NOT EXISTS playwright_learning_patterns (
  pattern_type TEXT PRIMARY KEY, -- e.g., 'low_color_variance', 'poor_resolution'

  -- Pattern definition
  trigger_conditions JSONB, -- Conditions that identify this pattern
  quality_impact TEXT,      -- How this pattern affects quality
  recommendation TEXT,      -- What to do when pattern detected

  -- Learning metrics
  frequency INTEGER DEFAULT 1,
  avg_score_when_present NUMERIC(3,2),
  avg_score_when_absent NUMERIC(3,2),
  confidence NUMERIC(3,2), -- 0.00-1.00 confidence in this pattern

  -- Metadata
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  active BOOLEAN DEFAULT TRUE
);

-- Table 3: playwright_performance_tracking
-- Tracks MCP performance and reliability metrics
CREATE TABLE IF NOT EXISTS playwright_performance_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Performance metrics
  operation TEXT NOT NULL, -- 'navigate', 'screenshot', 'evaluate', etc.
  duration_ms INTEGER,
  success BOOLEAN,
  error_message TEXT,

  -- Context
  image_url TEXT,
  generation_id TEXT,

  -- Metadata
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_playwright_performance_operation
  ON playwright_performance_tracking(operation, success);
CREATE INDEX IF NOT EXISTS idx_playwright_performance_timestamp
  ON playwright_performance_tracking(timestamp DESC);

-- View: Recent validation summary
CREATE OR REPLACE VIEW playwright_validation_summary AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_validations,
  AVG(score) as avg_score,
  SUM(CASE WHEN score >= 0.75 THEN 1 ELSE 0 END) as passed_count,
  SUM(CASE WHEN score < 0.75 THEN 1 ELSE 0 END) as failed_count,
  AVG(validation_duration_ms) as avg_duration_ms
FROM playwright_validations
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- View: Pattern effectiveness
CREATE OR REPLACE VIEW playwright_pattern_effectiveness AS
SELECT
  pattern_type,
  frequency,
  (avg_score_when_absent - avg_score_when_present) as score_impact,
  confidence,
  recommendation
FROM playwright_learning_patterns
WHERE active = TRUE
ORDER BY ABS(avg_score_when_absent - avg_score_when_present) DESC;

COMMENT ON TABLE playwright_validations IS 'Technical validation results from Playwright MCP analysis';
COMMENT ON TABLE playwright_learning_patterns IS 'Learned patterns correlating technical metrics with quality outcomes';
COMMENT ON TABLE playwright_performance_tracking IS 'MCP operation performance and reliability metrics';
