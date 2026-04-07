CREATE TABLE IF NOT EXISTS absence_periods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT,
  reason TEXT,
  created_at TEXT,
  updated_at TEXT
);
