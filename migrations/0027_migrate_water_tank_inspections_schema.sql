-- 防火水槽点検テーブルのスキーマ変更
-- 古いカラムを削除し、新しい設計に移行

-- Step 1: 新しいテーブルを作成
CREATE TABLE IF NOT EXISTS water_tank_inspections_new (
  id TEXT PRIMARY KEY,
  tank_id TEXT NOT NULL,
  inspector_id TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  water_level TEXT,
  water_quality TEXT,
  lid_condition TEXT,
  image_urls TEXT,
  comment TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  FOREIGN KEY (tank_id) REFERENCES water_tanks(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- Step 2: 既存データがある場合は移行（今は空なのでスキップ）
-- INSERT INTO water_tank_inspections_new (id, tank_id, inspection_date, inspector_id, comment, created_at)
-- SELECT id, tank_id, inspection_date, inspector_name AS inspector_id, notes AS comment, created_at
-- FROM water_tank_inspections;

-- Step 3: 古いテーブルを削除
DROP TABLE IF EXISTS water_tank_inspections;

-- Step 4: 新しいテーブルをリネーム
ALTER TABLE water_tank_inspections_new RENAME TO water_tank_inspections;

-- Step 5: インデックスを作成
CREATE INDEX IF NOT EXISTS idx_water_tank_inspections_tank_id ON water_tank_inspections(tank_id);
CREATE INDEX IF NOT EXISTS idx_water_tank_inspections_inspector_id ON water_tank_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_water_tank_inspections_date ON water_tank_inspections(inspection_date);
