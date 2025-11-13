-- Add middle_name column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS middle_name VARCHAR(50);

-- Also add middle_name to students view if needed by updating users on student update
