-- Create action_items table for individual action required items
CREATE TABLE IF NOT EXISTS action_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  inspection_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  is_completed INTEGER DEFAULT 0,
  completed_at DATETIME,
  completed_by TEXT,
  item_order INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_action_items_inspection ON action_items(inspection_id);
CREATE INDEX IF NOT EXISTS idx_action_items_completed ON action_items(is_completed);
