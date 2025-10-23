-- Migration: Create social media accounts table
-- Description: Store connected social media accounts and their status

CREATE TABLE IF NOT EXISTS social_media_account (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('twitter', 'linkedin', 'instagram', 'facebook', 'blog', 'youtube')),
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'disconnected' CHECK (status IN ('connected', 'disconnected', 'error', 'warning', 'connecting')),
    followers INTEGER DEFAULT 0,
    connection_health VARCHAR(20) DEFAULT 'unknown' CHECK (connection_health IN ('healthy', 'unhealthy', 'degraded', 'unknown')),
    posting_enabled BOOLEAN DEFAULT false,
    api_rate_limit_used INTEGER DEFAULT 0,
    api_rate_limit_total INTEGER DEFAULT 0,
    api_rate_limit_reset_time VARCHAR(10),
    last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT,
    warning_message TEXT,
    access_token_encrypted TEXT, -- Store encrypted tokens for API access
    refresh_token_encrypted TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES "user"(id),

    UNIQUE(platform, username) -- Prevent duplicate accounts for same platform/username
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_social_media_account_platform ON social_media_account(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_account_status ON social_media_account(status);
CREATE INDEX IF NOT EXISTS idx_social_media_account_user ON social_media_account(created_by);

-- Insert some sample data for testing
INSERT INTO social_media_account (
    platform, username, display_name, status, followers, connection_health, posting_enabled,
    api_rate_limit_used, api_rate_limit_total, api_rate_limit_reset_time, created_by
) VALUES
    ('twitter', '@TechBlogPL', 'Tech Blog Polska', 'connected', 15200, 'healthy', true, 150, 300, '14:30', 1),
    ('linkedin', 'tech-blog-polska', 'Tech Blog Polska Company', 'connected', 3200, 'healthy', true, 45, 100, '15:00', 1),
    ('twitter', '@DevNewsPoland', 'Dev News Poland', 'error', 8500, 'unhealthy', false, 0, 300, 'N/A', 1),
    ('instagram', '@techblogpl', 'Tech Blog PL', 'warning', 4200, 'degraded', true, 180, 200, '16:00', 1),
    ('blog', 'tech-blog-pl', 'Tech Blog PL WordPress', 'connected', 0, 'healthy', true, 0, 0, null, 1)
ON CONFLICT (platform, username) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE social_media_account IS 'Stores connected social media accounts with their authentication and status information';