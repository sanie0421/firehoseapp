-- 防火水槽情報テーブル
CREATE TABLE IF NOT EXISTS water_tanks (
  id TEXT PRIMARY KEY,
  storage_id TEXT NOT NULL,
  location TEXT NOT NULL,
  capacity INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (storage_id) REFERENCES storages(id)
);

-- 防火水槽点検記録テーブル
CREATE TABLE IF NOT EXISTS water_tank_inspections (
  id TEXT PRIMARY KEY,
  tank_id TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  action_item_1 TEXT,
  action_item_2 TEXT,
  action_item_3 TEXT,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (tank_id) REFERENCES water_tanks(id)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_water_tanks_storage_id ON water_tanks(storage_id);
CREATE INDEX IF NOT EXISTS idx_water_tank_inspections_tank_id ON water_tank_inspections(tank_id);
CREATE INDEX IF NOT EXISTS idx_water_tank_inspections_date ON water_tank_inspections(inspection_date);
