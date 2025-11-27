CREATE TABLE IF NOT EXISTS water_tank_inspections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tank_id INTEGER NOT NULL,
  inspector_id TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  water_level TEXT,
  water_quality TEXT,
  lid_condition TEXT,
  image_urls TEXT,
  comment TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
