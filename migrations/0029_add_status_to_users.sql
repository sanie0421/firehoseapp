-- Add status column to users table
-- status: 1=現役(Active), 2=OB, 3=退団(Retired)
ALTER TABLE users ADD COLUMN status INTEGER DEFAULT 1;

-- Create index for status queries
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
