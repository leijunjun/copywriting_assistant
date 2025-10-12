-- Add industry field to users table
-- Migration: Add industry field to users table

-- Add industry column to users table
ALTER TABLE users ADD COLUMN industry VARCHAR(50) DEFAULT 'general';

-- Add constraint to ensure industry values are valid
ALTER TABLE users ADD CONSTRAINT check_industry 
  CHECK (industry IN ('general', 'housekeeping', 'beauty'));

-- Add comment to the column
COMMENT ON COLUMN users.industry IS 'User industry selection: general, housekeeping, or beauty';

-- Update existing users to have 'general' industry (already set by default)
-- This is just for documentation purposes
UPDATE users SET industry = 'general' WHERE industry IS NULL;
