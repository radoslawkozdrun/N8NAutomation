-- Add domain_id foreign key to feed table
-- Migration: 005_add_domain_feed_relationship.sql
-- Date: 2025-09-02

-- First, add the domain_id column to the feed table
ALTER TABLE feed 
ADD COLUMN domain_id INTEGER REFERENCES domain(id) ON DELETE SET NULL;

-- Create index for better performance on domain-based feed queries
CREATE INDEX IF NOT EXISTS idx_feed_domain_id ON feed(domain_id);

-- Update existing feeds to associate them with domains based on URL patterns or manually
-- This is a data migration step that should be customized based on your needs

-- Example: Associate feeds with domains based on URL patterns or categories
-- You can customize this logic based on your specific requirements

-- Sample associations (you would replace these with your actual logic):
DO $$
DECLARE
    ai_domain_id INTEGER;
    programming_domain_id INTEGER;
    emerging_domain_id INTEGER;
    football_domain_id INTEGER;
    automotive_domain_id INTEGER;
BEGIN
    -- Get domain IDs
    SELECT id INTO ai_domain_id FROM domain WHERE domain_id = 'artificial_intelligence';
    SELECT id INTO programming_domain_id FROM domain WHERE domain_id = 'programming';
    SELECT id INTO emerging_domain_id FROM domain WHERE domain_id = 'emerging_tech';
    SELECT id INTO football_domain_id FROM domain WHERE domain_id = 'football';
    SELECT id INTO automotive_domain_id FROM domain WHERE domain_id = 'automotive';
    
    -- Associate feeds with domains based on categories or URL patterns
    -- AI/ML related feeds
    UPDATE feed 
    SET domain_id = ai_domain_id 
    WHERE LOWER(category) LIKE '%ai%' 
       OR LOWER(category) LIKE '%artificial intelligence%'
       OR LOWER(category) LIKE '%machine learning%'
       OR LOWER(category) LIKE '%ml%'
       OR LOWER(name) LIKE '%ai%'
       OR LOWER(url) LIKE '%ai%'
       OR LOWER(url) LIKE '%openai%'
       OR LOWER(url) LIKE '%deepmind%'
       OR LOWER(url) LIKE '%anthropic%';
    
    -- Programming related feeds
    UPDATE feed 
    SET domain_id = programming_domain_id 
    WHERE LOWER(category) LIKE '%programming%'
       OR LOWER(category) LIKE '%development%'
       OR LOWER(category) LIKE '%coding%'
       OR LOWER(category) LIKE '%software%'
       OR LOWER(name) LIKE '%dev%'
       OR LOWER(url) LIKE '%github%'
       OR LOWER(url) LIKE '%stackoverflow%'
       OR LOWER(url) LIKE '%hackernews%';
    
    -- Tech/Emerging tech feeds
    UPDATE feed 
    SET domain_id = emerging_domain_id 
    WHERE LOWER(category) LIKE '%tech%'
       OR LOWER(category) LIKE '%innovation%'
       OR LOWER(category) LIKE '%startup%'
       OR LOWER(category) LIKE '%blockchain%'
       OR LOWER(category) LIKE '%crypto%'
       OR LOWER(name) LIKE '%tech%'
       OR LOWER(url) LIKE '%techcrunch%'
       OR LOWER(url) LIKE '%wired%';
    
    -- Football related feeds  
    UPDATE feed 
    SET domain_id = football_domain_id 
    WHERE LOWER(category) LIKE '%football%'
       OR LOWER(category) LIKE '%soccer%'
       OR LOWER(category) LIKE '%sport%'
       OR LOWER(name) LIKE '%football%'
       OR LOWER(name) LIKE '%sport%'
       OR LOWER(url) LIKE '%sport%'
       OR LOWER(url) LIKE '%football%'
       OR LOWER(url) LIKE '%fifa%';
    
    -- Automotive related feeds
    UPDATE feed 
    SET domain_id = automotive_domain_id 
    WHERE LOWER(category) LIKE '%automotive%'
       OR LOWER(category) LIKE '%car%'
       OR LOWER(category) LIKE '%auto%'
       OR LOWER(name) LIKE '%car%'
       OR LOWER(name) LIKE '%auto%'
       OR LOWER(url) LIKE '%car%'
       OR LOWER(url) LIKE '%automotive%';
    
    RAISE NOTICE 'Domain associations completed. Feeds without matches will have NULL domain_id and can be assigned manually.';
END $$;

-- Add a comment to document the relationship
COMMENT ON COLUMN feed.domain_id IS 'References the domain that this feed belongs to. Determines content categorization and scoring criteria.';

-- Add a constraint to ensure we don't have orphaned feeds when domains are deleted
-- (already handled by ON DELETE SET NULL, but good to document)
COMMENT ON CONSTRAINT feed_domain_id_fkey ON feed IS 'Ensures feed belongs to a valid domain. Sets to NULL if domain is deleted.';

-- Create a view for easier domain-feed queries
CREATE OR REPLACE VIEW domain_feeds_summary AS
SELECT 
    d.id as domain_id,
    d.domain_id as domain_code,
    d.domain_name,
    d.is_active as domain_active,
    COUNT(f.id) as total_feeds,
    COUNT(CASE WHEN f.enabled = true THEN 1 END) as active_feeds,
    COUNT(CASE WHEN f.enabled = false THEN 1 END) as inactive_feeds,
    COUNT(CASE WHEN f.error_count > 0 THEN 1 END) as feeds_with_errors,
    MAX(f.last_checked) as last_feed_check
FROM domain d
LEFT JOIN feed f ON d.id = f.domain_id
GROUP BY d.id, d.domain_id, d.domain_name, d.is_active
ORDER BY d.domain_name;