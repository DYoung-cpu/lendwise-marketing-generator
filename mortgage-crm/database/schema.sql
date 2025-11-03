-- Mortgage CRM Database Schema
-- Supabase PostgreSQL Schema for Learning System

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Model Performance Tracking Table
CREATE TABLE IF NOT EXISTS model_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id TEXT NOT NULL UNIQUE,
  total_uses INTEGER DEFAULT 0,
  successful_uses INTEGER DEFAULT 0,
  failed_uses INTEGER DEFAULT 0,
  average_quality DECIMAL(3,2) DEFAULT 0,
  total_cost_usd DECIMAL(10,2) DEFAULT 0,
  average_generation_time_seconds DECIMAL(6,2),
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Generation History Table
CREATE TABLE IF NOT EXISTS generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_type TEXT NOT NULL,
  model TEXT NOT NULL,
  prompt TEXT NOT NULL,
  success BOOLEAN NOT NULL,
  quality_score DECIMAL(3,2),
  ocr_score DECIMAL(3,2),
  spelling_score DECIMAL(3,2),
  compliance_score DECIMAL(3,2),
  generation_time_seconds DECIMAL(6,2),
  cost_usd DECIMAL(6,4),
  output_url TEXT,
  error_message TEXT,
  user_id TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Metadata
  needs_text BOOLEAN,
  needs_video BOOLEAN,
  has_nmls BOOLEAN,
  detected_nmls TEXT,

  -- Validation issues
  validation_issues JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Intent Performance Tracking
CREATE TABLE IF NOT EXISTS intent_performance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  intent_type TEXT NOT NULL,
  model TEXT NOT NULL,
  total_attempts INTEGER DEFAULT 0,
  successful_attempts INTEGER DEFAULT 0,
  average_quality DECIMAL(3,2) DEFAULT 0,
  preferred_for_intent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(intent_type, model)
);

-- Cost Tracking Table
CREATE TABLE IF NOT EXISTS cost_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  model TEXT NOT NULL,
  total_generations INTEGER DEFAULT 0,
  total_cost_usd DECIMAL(10,2) DEFAULT 0,
  budget_limit_usd DECIMAL(10,2),
  budget_exceeded BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, model)
);

-- User Settings/Preferences
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id TEXT NOT NULL UNIQUE,
  preferred_models JSONB,
  budget_limit_daily_usd DECIMAL(10,2) DEFAULT 50.00,
  default_loan_officer JSONB,
  brand_customization JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Request Cache Table (to prevent duplicate generations)
CREATE TABLE IF NOT EXISTS request_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prompt_hash TEXT NOT NULL UNIQUE,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  output_url TEXT NOT NULL,
  quality_score DECIMAL(3,2),
  hit_count INTEGER DEFAULT 1,
  cost_saved_usd DECIMAL(10,2) DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_model_performance_model_id ON model_performance(model_id);
CREATE INDEX IF NOT EXISTS idx_model_performance_total_uses ON model_performance(total_uses DESC);
CREATE INDEX IF NOT EXISTS idx_model_performance_quality ON model_performance(average_quality DESC);

CREATE INDEX IF NOT EXISTS idx_generation_history_timestamp ON generation_history(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_generation_history_model ON generation_history(model);
CREATE INDEX IF NOT EXISTS idx_generation_history_intent_type ON generation_history(intent_type);
CREATE INDEX IF NOT EXISTS idx_generation_history_success ON generation_history(success);
CREATE INDEX IF NOT EXISTS idx_generation_history_user_id ON generation_history(user_id);

CREATE INDEX IF NOT EXISTS idx_intent_performance_intent_model ON intent_performance(intent_type, model);
CREATE INDEX IF NOT EXISTS idx_intent_performance_preferred ON intent_performance(preferred_for_intent) WHERE preferred_for_intent = TRUE;

CREATE INDEX IF NOT EXISTS idx_cost_tracking_date ON cost_tracking(date DESC);
CREATE INDEX IF NOT EXISTS idx_cost_tracking_model ON cost_tracking(model);

CREATE INDEX IF NOT EXISTS idx_request_cache_prompt_hash ON request_cache(prompt_hash);
CREATE INDEX IF NOT EXISTS idx_request_cache_expires_at ON request_cache(expires_at);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_model_performance_updated_at BEFORE UPDATE ON model_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_intent_performance_updated_at BEFORE UPDATE ON intent_performance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Views for Analytics
CREATE OR REPLACE VIEW model_rankings AS
SELECT
  model_id,
  total_uses,
  successful_uses,
  ROUND((successful_uses::DECIMAL / NULLIF(total_uses, 0) * 100), 2) as success_rate,
  average_quality,
  total_cost_usd,
  ROUND((total_cost_usd / NULLIF(total_uses, 0)), 4) as avg_cost_per_generation,
  last_used_at
FROM model_performance
WHERE total_uses > 0
ORDER BY average_quality DESC, total_uses DESC;

CREATE OR REPLACE VIEW daily_cost_summary AS
SELECT
  date,
  SUM(total_generations) as total_generations,
  SUM(total_cost_usd) as total_cost_usd,
  COUNT(DISTINCT model) as unique_models_used,
  BOOL_OR(budget_exceeded) as any_budget_exceeded
FROM cost_tracking
GROUP BY date
ORDER BY date DESC;

CREATE OR REPLACE VIEW best_models_by_intent AS
SELECT
  intent_type,
  model,
  total_attempts,
  successful_attempts,
  ROUND((successful_attempts::DECIMAL / NULLIF(total_attempts, 0) * 100), 2) as success_rate,
  average_quality,
  preferred_for_intent
FROM intent_performance
WHERE total_attempts >= 3
ORDER BY intent_type, average_quality DESC, successful_attempts DESC;

-- Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE model_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE intent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_cache ENABLE ROW LEVEL SECURITY;

-- Allow service role to access all data
CREATE POLICY "Service role can do everything on model_performance" ON model_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on generation_history" ON generation_history
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on intent_performance" ON intent_performance
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on cost_tracking" ON cost_tracking
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on user_preferences" ON user_preferences
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can do everything on request_cache" ON request_cache
  FOR ALL USING (auth.role() = 'service_role');

-- Comments for documentation
COMMENT ON TABLE model_performance IS 'Tracks performance metrics for each AI model';
COMMENT ON TABLE generation_history IS 'Complete history of all generation requests';
COMMENT ON TABLE intent_performance IS 'Tracks which models work best for specific intents';
COMMENT ON TABLE cost_tracking IS 'Daily cost tracking and budget management';
COMMENT ON TABLE user_preferences IS 'User-specific settings and preferences';
COMMENT ON TABLE request_cache IS 'Caches generation results to prevent duplicates';

-- Seed some initial data
INSERT INTO user_preferences (user_id, budget_limit_daily_usd, default_loan_officer)
VALUES (
  'default',
  100.00,
  '{"name": "LendWise Team", "nmls": null, "phone": null, "email": null}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
