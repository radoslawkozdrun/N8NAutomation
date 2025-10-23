-- Create CONFIG_PROPERTY table for application configuration
CREATE TABLE IF NOT EXISTS config_property (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    data_type VARCHAR(50) DEFAULT 'string',
    is_encrypted BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_config_property_key ON config_property(key);
CREATE INDEX IF NOT EXISTS idx_config_property_active ON config_property(is_active);
CREATE INDEX IF NOT EXISTS idx_config_property_data_type ON config_property(data_type);

-- Update trigger for updated_at timestamp
CREATE TRIGGER update_config_property_updated_at
    BEFORE UPDATE ON config_property
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert some default configuration properties
INSERT INTO config_property (key, value, description, data_type) VALUES
('app_name', 'N8N Automation', 'Application name', 'string'),
('app_version', '1.0.0', 'Application version', 'string'),
('max_feed_fetch_interval', '3600', 'Maximum feed fetch interval in seconds', 'integer'),
('default_user_role', 'user', 'Default role for new users', 'string'),
('enable_audit_logging', 'true', 'Enable audit logging', 'boolean')
ON CONFLICT (key) DO NOTHING;