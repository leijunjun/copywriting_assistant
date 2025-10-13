-- Add lifestyle-beauty to industry constraint
-- Migration: Update industry constraint to include lifestyle-beauty
-- 
-- IMPORTANT: This migration should be run manually in the Supabase dashboard
-- or through the Supabase CLI to permanently fix the database constraint.
--
-- To run this migration:
-- 1. Go to your Supabase project dashboard
-- 2. Navigate to SQL Editor
-- 3. Copy and paste the SQL statements below
-- 4. Execute them in order

-- Step 1: Drop the existing constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_industry;

-- Step 2: Add the updated constraint to include lifestyle-beauty
ALTER TABLE users ADD CONSTRAINT check_industry 
  CHECK (industry IN ('general', 'housekeeping', 'beauty', 'lifestyle-beauty'));

-- Step 3: Update the column comment
COMMENT ON COLUMN users.industry IS 'User industry selection: general, housekeeping, beauty, or lifestyle-beauty';

-- Step 4: Verify the constraint was applied correctly
SELECT conname, pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conname = 'check_industry' 
AND conrelid = 'users'::regclass;
