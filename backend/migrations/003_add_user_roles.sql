-- Create ENUM type for user roles
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER', 'DEMO');

-- Modify users table to use the new role enum
-- First, we need to handle existing data
DO $$
BEGIN
    -- Update existing 'admin' role to 'ADMIN'
    UPDATE users SET role = 'ADMIN' WHERE role = 'admin' OR role = 'ADMIN';
    
    -- Update existing 'user' role to 'USER'
    UPDATE users SET role = 'USER' WHERE role = 'user' OR role = 'USER';
    
    -- Set any NULL or other values to 'USER'
    UPDATE users SET role = 'USER' WHERE role IS NULL OR role NOT IN ('ADMIN', 'USER', 'DEMO');
END $$;

-- Remove default before changing type
ALTER TABLE users ALTER COLUMN role DROP DEFAULT;

-- Now alter the column to use the ENUM type
ALTER TABLE users 
ALTER COLUMN role TYPE user_role USING role::user_role;

-- Set new default after type change
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'USER';

-- Add index for role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role_enum ON users(role);

-- Update the trigger for updated_at if it doesn't exist
-- (already exists from migration 001, but ensuring it works with the new enum)