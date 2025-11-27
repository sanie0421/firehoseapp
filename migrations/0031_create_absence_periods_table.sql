-- Create absence_periods table for managing member absences
-- (e.g., assigned to disaster prevention department, temporary leave, etc.)
CREATE TABLE IF NOT EXISTS absence_periods (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    reason TEXT,
    created_at TEXT DEFAULT (datetime('now', 'localtime')),
    updated_at TEXT DEFAULT (datetime('now', 'localtime')),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_absence_periods_user_id ON absence_periods(user_id);
CREATE INDEX IF NOT EXISTS idx_absence_periods_dates ON absence_periods(start_date, end_date);
