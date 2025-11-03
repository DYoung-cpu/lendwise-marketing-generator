-- Mortgage CRM Database Schema - Super Simple Version
-- Create tables one by one, ignore errors if they already exist

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table 1: Model Performance
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

-- Table 2: Generation History
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
  needs_text BOOLEAN,
  needs_video BOOLEAN,
  has_nmls BOOLEAN,
  detected_nmls TEXT,
  validation_issues JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table 3: Intent Performance
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

-- Table 4: Cost Tracking
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

-- Table 5: User Preferences
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

-- Table 6: Request Cache
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

-- Seed default user
INSERT INTO user_preferences (user_id, budget_limit_daily_usd, default_loan_officer)
VALUES (
  'default',
  100.00,
  '{"name": "LendWise Team", "nmls": null, "phone": null, "email": null}'::jsonb
)
ON CONFLICT (user_id) DO NOTHING;
