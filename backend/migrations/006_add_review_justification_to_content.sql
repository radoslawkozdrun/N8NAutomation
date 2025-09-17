-- Add review_justification column to content table
-- This column stores the justification provided when making a decision about an article

BEGIN;

-- Add the review_justification column as TEXT to allow for longer justifications
ALTER TABLE content ADD COLUMN review_justification TEXT;

-- Add a comment to document the column purpose
COMMENT ON COLUMN content.review_justification IS 'Stores the justification provided by the reviewer when making a decision (accept/reject) about the article';

COMMIT;