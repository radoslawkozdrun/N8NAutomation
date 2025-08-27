-- Create sp_posts table for managing AI-generated social media posts
CREATE TABLE IF NOT EXISTS sp_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'twitter', 'linkedin', 'instagram', etc.
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'published'
    ai_generated BOOLEAN DEFAULT true,
    source_article_id INTEGER, -- Reference to source article if applicable
    created_by INTEGER,
    reviewed_by INTEGER,
    scheduled_publish_date TIMESTAMP WITH TIME ZONE,
    published_date TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    metadata JSONB, -- Store additional platform-specific data, hashtags, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Add foreign key constraints (only if users table exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Add foreign key constraints
        ALTER TABLE sp_posts 
        ADD CONSTRAINT fk_sp_posts_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
        
        ALTER TABLE sp_posts 
        ADD CONSTRAINT fk_sp_posts_reviewed_by 
        FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sp_posts_status ON sp_posts(status);
CREATE INDEX IF NOT EXISTS idx_sp_posts_platform ON sp_posts(platform);
CREATE INDEX IF NOT EXISTS idx_sp_posts_created_by ON sp_posts(created_by);
CREATE INDEX IF NOT EXISTS idx_sp_posts_reviewed_by ON sp_posts(reviewed_by);
CREATE INDEX IF NOT EXISTS idx_sp_posts_created_at ON sp_posts(created_at);
CREATE INDEX IF NOT EXISTS idx_sp_posts_scheduled ON sp_posts(scheduled_publish_date);

-- Add updated_at trigger for sp_posts
CREATE TRIGGER update_sp_posts_updated_at 
    BEFORE UPDATE ON sp_posts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create audit log entries for post status changes
CREATE OR REPLACE FUNCTION log_post_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log when status changes from pending to approved/rejected
    IF OLD.status != NEW.status AND NEW.status IN ('approved', 'rejected') THEN
        INSERT INTO audit_logs (
            user_id,
            action,
            resource_type,
            resource_id,
            details,
            created_at
        ) VALUES (
            NEW.reviewed_by,
            CASE 
                WHEN NEW.status = 'approved' THEN 'post_approved'
                WHEN NEW.status = 'rejected' THEN 'post_rejected'
            END,
            'sp_posts',
            NEW.id,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status,
                'platform', NEW.platform,
                'rejection_reason', NEW.rejection_reason
            ),
            CURRENT_TIMESTAMP
        );
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER log_sp_posts_status_change
    AFTER UPDATE ON sp_posts
    FOR EACH ROW
    EXECUTE FUNCTION log_post_status_change();