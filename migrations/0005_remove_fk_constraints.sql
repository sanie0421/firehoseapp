-- 外部キー制約を削除するため、テーブルを再作成
-- SQLiteではALTER TABLEで外部キー制約を削除できないため、テーブルを再作成する必要がある

-- 1. 一時テーブルを作成
CREATE TABLE hose_inspections_new (
  id TEXT PRIMARY KEY,
  storage_id TEXT NOT NULL,
  storage_number TEXT NOT NULL,
  inspection_date TEXT NOT NULL,
  was_replaced INTEGER DEFAULT 0,
  replacement_date TEXT,
  remarks TEXT,
  needs_report INTEGER DEFAULT 0,
  report_status TEXT CHECK(report_status IN ('none', 'pending', 'waiting', 'completed')),
  reported_at TEXT,
  report_memo TEXT,
  completed_at TEXT,
  photos TEXT,
  inspector_id TEXT,
  inspector_name TEXT NOT NULL,
  result TEXT CHECK(result IN ('normal', 'caution', 'abnormal', 'not_checked')),
  action_required TEXT,
  action_completed INTEGER DEFAULT 0,
  action_completed_at TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- 2. データをコピー
INSERT INTO hose_inspections_new 
SELECT 
  id, storage_id, storage_number, inspection_date,
  was_replaced, replacement_date, remarks, needs_report,
  report_status, reported_at, report_memo, completed_at,
  photos, inspector_id, inspector_name,
  result, action_required, action_completed, action_completed_at,
  created_at, updated_at
FROM hose_inspections;

-- 3. 古いテーブルを削除
DROP TABLE hose_inspections;

-- 4. 新しいテーブルをリネーム
ALTER TABLE hose_inspections_new RENAME TO hose_inspections;

-- 5. インデックスを再作成
CREATE INDEX IF NOT EXISTS idx_hose_inspections_storage ON hose_inspections(storage_id);
CREATE INDEX IF NOT EXISTS idx_hose_inspections_date ON hose_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_hose_inspections_status ON hose_inspections(report_status);
