-- storage_idとcapacityをNULL許可に変更するため、テーブルを再作成
-- SQLiteはALTER TABLE ... MODIFY COLUMNをサポートしていないため、再作成が必要

-- 一時テーブルを作成
CREATE TABLE water_tanks_new (
  id TEXT PRIMARY KEY,
  storage_id TEXT,
  location TEXT NOT NULL,
  capacity INTEGER,
  notes TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 既存データを移行
INSERT INTO water_tanks_new (id, storage_id, location, capacity, notes, created_at, updated_at)
SELECT id, storage_id, location, capacity, notes, created_at, updated_at
FROM water_tanks;

-- 古いテーブルを削除
DROP TABLE water_tanks;

-- 新しいテーブルをリネーム
ALTER TABLE water_tanks_new RENAME TO water_tanks;

-- インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_water_tanks_storage_id ON water_tanks(storage_id);
