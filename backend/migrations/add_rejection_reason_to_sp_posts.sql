-- Add REJECTION_REASON column to SP_POSTS table
-- Migration: add_rejection_reason_to_sp_posts.sql
-- Date: 2025-08-25

ALTER TABLE sp_posts 
ADD COLUMN rejection_reason TEXT;

-- Add index for better performance when filtering by rejection reason
CREATE INDEX idx_sp_posts_rejection_reason ON sp_posts(rejection_reason) WHERE rejection_reason IS NOT NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN sp_posts.rejection_reason IS 'Stores the reason why a post was rejected during review process';