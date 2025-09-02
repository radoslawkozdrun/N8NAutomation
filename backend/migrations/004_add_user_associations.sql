-- Add user_id foreign key to sp_feed table
ALTER TABLE sp_feed 
ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id foreign key to sp_content table (articles)
ALTER TABLE sp_content 
ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;

-- Add user_id foreign key to sp_research table if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sp_research') THEN
        ALTER TABLE sp_research 
        ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes for better performance on user-based queries
CREATE INDEX IF NOT EXISTS idx_sp_feed_user_id ON sp_feed(user_id);
CREATE INDEX IF NOT EXISTS idx_sp_content_user_id ON sp_content(user_id);

-- Create index on sp_research if table exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sp_research') THEN
        CREATE INDEX IF NOT EXISTS idx_sp_research_user_id ON sp_research(user_id);
    END IF;
END $$;

-- Create a sample USER account that will own existing data
-- First check if there are any existing users
DO $$
DECLARE
    user_count INTEGER;
    sample_user_id INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users WHERE role = 'USER';
    
    -- If no USER role users exist, create one
    IF user_count = 0 THEN
        INSERT INTO users (username, email, password_hash, role, is_active)
        VALUES (
            'content_user', 
            'content@example.com', 
            '$2b$10$sample.hash.for.initial.user.account', -- This should be replaced with actual bcrypt hash
            'USER', 
            true
        )
        RETURNING id INTO sample_user_id;
        
        -- Associate existing data with this user
        UPDATE sp_feed SET user_id = sample_user_id WHERE user_id IS NULL;
        UPDATE sp_content SET user_id = sample_user_id WHERE user_id IS NULL;
        
        -- Update sp_research if exists
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sp_research') THEN
            UPDATE sp_research SET user_id = sample_user_id WHERE user_id IS NULL;
        END IF;
        
        RAISE NOTICE 'Created sample USER account with ID % and associated existing data', sample_user_id;
    ELSE
        -- If USER accounts exist, associate data with the first one
        SELECT id INTO sample_user_id FROM users WHERE role = 'USER' LIMIT 1;
        
        UPDATE sp_feed SET user_id = sample_user_id WHERE user_id IS NULL;
        UPDATE sp_content SET user_id = sample_user_id WHERE user_id IS NULL;
        
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sp_research') THEN
            UPDATE sp_research SET user_id = sample_user_id WHERE user_id IS NULL;
        END IF;
        
        RAISE NOTICE 'Associated existing data with existing USER account ID %', sample_user_id;
    END IF;
END $$;

-- Make user_id NOT NULL after data migration
ALTER TABLE sp_feed ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE sp_content ALTER COLUMN user_id SET NOT NULL;

-- Make user_id NOT NULL for sp_research if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sp_research') THEN
        ALTER TABLE sp_research ALTER COLUMN user_id SET NOT NULL;
    END IF;
END $$;