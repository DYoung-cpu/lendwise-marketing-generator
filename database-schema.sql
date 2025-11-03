-- ========================================
-- MORTGAGE BANKING AI SYSTEM DATABASE SCHEMA
-- For Supabase PostgreSQL
-- ========================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- ========================================
-- PERPETUAL MEMORY SYSTEM1-- Never forgets anything
-- ========================================

CREATE TABLE IF NOT EXISTS perpetual_memory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    importance INTEGER DEFAULT 5 CHECK (importance >= 1 AND importance <= 10),
    category VARCHAR(100),
    loan_officer_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for perpetual memory
CREATE INDEX IF NOT EXISTS idx_memory_key ON perpetual_memory(key);
CREATE INDEX IF NOT EXISTS idx_memory_importance ON perpetual_memory(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memory_loan_officer ON perpetual_memory(loan_officer_id);
CREATE INDEX IF NOT EXISTS idx_memory_category ON perpetual_memory(category);

-- Vector index for semantic search (if you have vector extension)
-- CREATE INDEX IF NOT EXISTS idx_memory_embedding ON perpetual_memory
--   USING ivfflat (embedding vector_cosine_ops);

-- ========================================
-- LEARNING PATTERNS
-- Tracks successful generation patterns
-- ========================================

CREATE TABLE IF NOT EXISTS learning_patterns (
    id SERIAL PRIMARY KEY,
    pattern_type VARCHAR(100) NOT NULL,
    trigger_conditions JSONB NOT NULL,
    successful_response JSONB NOT NULL,
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    usage_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    failure_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes for learning patterns
CREATE INDEX IF NOT EXISTS idx_patterns_type ON learning_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_patterns_score ON learning_patterns(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_patterns_usage ON learning_patterns(usage_count DESC);

-- ========================================
-- AGENT INVOCATIONS
-- Tracks agent execution history
-- ========================================

CREATE TABLE IF NOT EXISTS agent_invocations (
    id SERIAL PRIMARY KEY,
    agent_name VARCHAR(100) NOT NULL,
    command TEXT NOT NULL,
    success BOOLEAN NOT NULL,
    response JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    loan_officer_id VARCHAR(100)
);

-- Indexes for agent invocations
CREATE INDEX IF NOT EXISTS idx_agent_name ON agent_invocations(agent_name);
CREATE INDEX IF NOT EXISTS idx_agent_success ON agent_invocations(success);
CREATE INDEX IF NOT EXISTS idx_agent_created ON agent_invocations(created_at DESC);

-- ========================================
-- QUALITY METRICS
-- Tracks generation quality over time
-- ========================================

CREATE TABLE IF NOT EXISTS quality_metrics (
    id SERIAL PRIMARY KEY,
    asset_id VARCHAR(255),
    asset_type VARCHAR(50),
    template_name VARCHAR(100),
    quality_score FLOAT,
    compliance_score FLOAT,
    brand_score FLOAT,
    spelling_score FLOAT,
    attempts INTEGER DEFAULT 1,
    final_success BOOLEAN,
    model_used VARCHAR(100),
    prompt_used TEXT,
    issues_found JSONB DEFAULT '[]'::jsonb,
    fixes_applied JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    loan_officer_id VARCHAR(100)
);

-- Indexes for quality metrics
CREATE INDEX IF NOT EXISTS idx_quality_asset ON quality_metrics(asset_id);
CREATE INDEX IF NOT EXISTS idx_quality_template ON quality_metrics(template_name);
CREATE INDEX IF NOT EXISTS idx_quality_score ON quality_metrics(quality_score DESC);
CREATE INDEX IF NOT EXISTS idx_quality_created ON quality_metrics(created_at DESC);

-- ========================================
-- ASSETS GENERATED
-- Complete history of all generated assets
-- ========================================

CREATE TABLE IF NOT EXISTS assets_generated (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    loan_officer_id VARCHAR(100) NOT NULL,
    asset_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    s3_url TEXT,
    local_path TEXT,
    thumbnail_url TEXT,

    -- Generation details
    prompt_used TEXT NOT NULL,
    enhanced_prompt TEXT,
    model_used VARCHAR(100),
    replicate_model VARCHAR(100),
    generation_params JSONB DEFAULT '{}'::jsonb,

    -- Quality & Compliance
    quality_score FLOAT CHECK (quality_score >= 0 AND quality_score <= 1),
    compliance_status VARCHAR(50) DEFAULT 'pending',
    compliance_checks JSONB DEFAULT '{}'::jsonb,
    nmls_id VARCHAR(50),

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Additional metadata
    metadata JSONB DEFAULT '{}'::jsonb,
    tags TEXT[] DEFAULT '{}',

    -- Usage tracking
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    last_accessed TIMESTAMP
);

-- Indexes for assets
CREATE INDEX IF NOT EXISTS idx_assets_loan_officer ON assets_generated(loan_officer_id);
CREATE INDEX IF NOT EXISTS idx_assets_type ON assets_generated(asset_type);
CREATE INDEX IF NOT EXISTS idx_assets_template ON assets_generated(template_name);
CREATE INDEX IF NOT EXISTS idx_assets_created ON assets_generated(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assets_compliance ON assets_generated(compliance_status);

-- ========================================
-- REPLICATE USAGE
-- Track Replicate model usage and costs
-- ========================================

CREATE TABLE IF NOT EXISTS replicate_usage (
    id SERIAL PRIMARY KEY,
    model_name VARCHAR(100) NOT NULL,
    model_id VARCHAR(255) NOT NULL,
    operation_type VARCHAR(50) NOT NULL, -- 'image', 'video', 'training', etc.
    prompt TEXT,
    parameters JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN NOT NULL,
    output_url TEXT,
    error_message TEXT,
    execution_time_sec FLOAT,
    cost_estimate DECIMAL(10,4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    loan_officer_id VARCHAR(100)
);

-- Indexes for Replicate usage
CREATE INDEX IF NOT EXISTS idx_replicate_model ON replicate_usage(model_name);
CREATE INDEX IF NOT EXISTS idx_replicate_created ON replicate_usage(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_replicate_success ON replicate_usage(success);

-- ========================================
-- COMPLIANCE RULES
-- Dynamic compliance validation rules
-- ========================================

CREATE TABLE IF NOT EXISTS compliance_rules (
    id SERIAL PRIMARY KEY,
    rule_type VARCHAR(100) NOT NULL,
    rule_name VARCHAR(255) NOT NULL,
    pattern TEXT,
    regex_pattern TEXT,
    required_disclosures TEXT[],
    severity VARCHAR(20) CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Insert default compliance rules for mortgage banking
INSERT INTO compliance_rules (rule_type, rule_name, pattern, required_disclosures, severity)
VALUES
    ('NMLS', 'NMLS ID Required', '.*', ARRAY['NMLS ID# {number}', 'www.nmlsconsumeraccess.org'], 'critical'),
    ('TILA', 'Rate Mention Trigger', '(?i)(rate|apr|payment|interest|monthly)', ARRAY['Subject to credit approval', 'Rates subject to change'], 'high'),
    ('Fair_Housing', 'Equal Housing Logo', '.*', ARRAY['Equal Housing Opportunity'], 'critical'),
    ('RESPA', 'No Kickback Language', '(?i)(referral|recommend)', ARRAY['No compensation for referral'], 'medium')
ON CONFLICT DO NOTHING;

-- Indexes for compliance rules
CREATE INDEX IF NOT EXISTS idx_compliance_type ON compliance_rules(rule_type);
CREATE INDEX IF NOT EXISTS idx_compliance_active ON compliance_rules(active);

-- ========================================
-- MCP TOOL EXECUTIONS
-- Track MCP tool usage and reliability
-- ========================================

CREATE TABLE IF NOT EXISTS mcp_tool_executions (
    id SERIAL PRIMARY KEY,
    tool_name VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    parameters JSONB DEFAULT '{}'::jsonb,
    success BOOLEAN NOT NULL,
    result JSONB,
    error_message TEXT,
    execution_time_ms INTEGER,
    retry_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for MCP tools
CREATE INDEX IF NOT EXISTS idx_mcp_tool ON mcp_tool_executions(tool_name);
CREATE INDEX IF NOT EXISTS idx_mcp_success ON mcp_tool_executions(success);
CREATE INDEX IF NOT EXISTS idx_mcp_created ON mcp_tool_executions(created_at DESC);

-- ========================================
-- UPDATE TIMESTAMP TRIGGER
-- ========================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables that have updated_at
CREATE TRIGGER update_assets_updated_at
    BEFORE UPDATE ON assets_generated
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_compliance_rules_updated_at
    BEFORE UPDATE ON compliance_rules
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- VIEWS FOR ANALYTICS
-- ========================================

-- Overall system performance view
CREATE OR REPLACE VIEW system_performance AS
SELECT
    DATE(created_at) as date,
    COUNT(*) as total_generations,
    AVG(quality_score) as avg_quality,
    AVG(attempts) as avg_attempts,
    SUM(CASE WHEN final_success THEN 1 ELSE 0 END) as successful_generations,
    SUM(CASE WHEN final_success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate
FROM quality_metrics
GROUP BY DATE(created_at)
ORDER BY DATE(created_at) DESC;

-- Model performance comparison
CREATE OR REPLACE VIEW model_performance AS
SELECT
    model_used,
    COUNT(*) as usage_count,
    AVG(quality_score) as avg_quality,
    AVG(attempts) as avg_attempts,
    SUM(CASE WHEN final_success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate
FROM quality_metrics
WHERE model_used IS NOT NULL
GROUP BY model_used
ORDER BY usage_count DESC;

-- Agent reliability view
CREATE OR REPLACE VIEW agent_reliability AS
SELECT
    agent_name,
    COUNT(*) as total_invocations,
    SUM(CASE WHEN success THEN 1 ELSE 0 END) as successful,
    SUM(CASE WHEN success THEN 1 ELSE 0 END)::FLOAT / COUNT(*) as success_rate,
    AVG(execution_time_ms) as avg_execution_time
FROM agent_invocations
GROUP BY agent_name
ORDER BY total_invocations DESC;

-- ========================================
-- GRANT PERMISSIONS (adjust as needed)
-- ========================================

-- If using RLS (Row Level Security), enable it:
-- ALTER TABLE perpetual_memory ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE assets_generated ENABLE ROW LEVEL SECURITY;

-- Create policies as needed for your authentication setup

-- ========================================
-- END OF SCHEMA
-- ========================================

-- Show summary
SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';

