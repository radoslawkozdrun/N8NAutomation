-- Migration: Create master_content table
-- Date: 2025-09-30

CREATE TABLE master_content (
    id SERIAL PRIMARY KEY,
    article_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content_body TEXT NOT NULL,
    status VARCHAR(30) NOT NULL,
    summary TEXT NOT NULL,
    notes TEXT NOT NULL,
    keypoints JSON NULL,
    published_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    created_by VARCHAR(100) DEFAULT NULL
);

-- Add foreign key constraint if content table exists
-- ALTER TABLE master_content ADD CONSTRAINT fk_master_content_article
--     FOREIGN KEY (article_id) REFERENCES content(id) ON DELETE CASCADE;

-- Add indexes for better performance
CREATE INDEX idx_master_content_article_id ON master_content(article_id);
CREATE INDEX idx_master_content_status ON master_content(status);
CREATE INDEX idx_master_content_created_at ON master_content(created_at);

-- Add comments for documentation
COMMENT ON TABLE master_content IS 'Master content table for storing processed article content';
COMMENT ON COLUMN master_content.article_id IS 'Reference to the original article';
COMMENT ON COLUMN master_content.status IS 'Status of the content (draft, review, published, etc.)';
COMMENT ON COLUMN master_content.keypoints IS 'JSON array of key points extracted from content';
COMMENT ON COLUMN master_content.created_by IS 'Username of the person who created this content';