-- Add retirement_date column to users table
-- Records the date when a member retired (OB) or left the brigade (退団)
ALTER TABLE users ADD COLUMN retirement_date TEXT;

-- Create index for retirement date queries
CREATE INDEX IF NOT EXISTS idx_users_retirement_date ON users(retirement_date);
