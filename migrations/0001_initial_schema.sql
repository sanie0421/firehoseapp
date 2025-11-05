-- 消防団アプリ データベース初期スキーマ
-- 作成日: 2024-11-05

-- ==========================================
-- 1. ユーザー（団員）テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('leader', 'viceleader', 'chief', 'member')),
  position TEXT,
  join_date TEXT,
  birth_date TEXT,
  blood_type TEXT,
  phone TEXT,
  phone_mobile TEXT,
  address TEXT,
  district TEXT,
  occupation TEXT,
  company_name TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ==========================================
-- 2. 活動日誌テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  weather TEXT NOT NULL,
  location TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK(activity_type IN ('disaster', 'training', 'other')),
  activity_hours REAL,
  activity_content TEXT NOT NULL,
  
  -- 車両点検項目
  check_engine TEXT CHECK(check_engine IN ('good', 'bad', 'not_checked')),
  check_lights TEXT CHECK(check_lights IN ('good', 'bad', 'not_checked')),
  check_siren TEXT CHECK(check_siren IN ('good', 'bad', 'not_checked')),
  check_tire TEXT CHECK(check_tire IN ('good', 'bad', 'not_checked')),
  check_oil TEXT CHECK(check_oil IN ('no_need', 'refilled', 'not_checked')),
  check_fuel_amount REAL DEFAULT 0,
  check_fuel_refilled INTEGER DEFAULT 0,
  check_water_discharge INTEGER DEFAULT 0,
  check_pump TEXT CHECK(check_pump IN ('good', 'bad', 'not_checked')),
  check_vehicle_notes TEXT,
  
  -- 備品点検項目
  equipment_firesuit INTEGER DEFAULT 0,
  equipment_boots INTEGER DEFAULT 0,
  equipment_helmet INTEGER DEFAULT 0,
  equipment_hose INTEGER DEFAULT 0,
  equipment_radio TEXT CHECK(equipment_radio IN ('good', 'bad')),
  equipment_radio_count INTEGER DEFAULT 0,
  equipment_flashlight TEXT CHECK(equipment_flashlight IN ('good', 'bad')),
  equipment_flashlight_charged INTEGER DEFAULT 0,
  equipment_flashlight_total INTEGER DEFAULT 0,
  equipment_notes TEXT,
  
  -- 機械器具点検項目
  tools_generator TEXT CHECK(tools_generator IN ('good', 'bad', 'not_checked')),
  tools_chainsaw TEXT CHECK(tools_chainsaw IN ('good', 'bad', 'not_checked')),
  tools_gasoline INTEGER DEFAULT 0,
  tools_notes TEXT,
  
  -- 写真・特記事項
  photos TEXT, -- JSON array of photo URLs
  notes TEXT,
  
  -- 記録者・承認
  recorder_id TEXT NOT NULL,
  recorder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected')),
  approver_id TEXT,
  approver_name TEXT,
  approved_at TEXT,
  reject_reason TEXT,
  
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (recorder_id) REFERENCES users(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- ==========================================
-- 3. ホース格納庫テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS hose_storages (
  id TEXT PRIMARY KEY,
  storage_number TEXT UNIQUE NOT NULL,
  location TEXT,
  remarks TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime'))
);

-- ==========================================
-- 4. ホース点検記録テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS hose_inspections (
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
  photos TEXT, -- JSON array of photo URLs
  inspector_id TEXT NOT NULL,
  inspector_name TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (storage_id) REFERENCES hose_storages(id),
  FOREIGN KEY (inspector_id) REFERENCES users(id)
);

-- ==========================================
-- 5. 訓練記録テーブル
-- ==========================================
CREATE TABLE IF NOT EXISTS training_records (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  training_type TEXT NOT NULL,
  duration REAL NOT NULL,
  location TEXT NOT NULL,
  participants TEXT, -- JSON array of user IDs
  photos TEXT, -- JSON array of photo URLs
  videos TEXT, -- JSON array of video URLs
  notes TEXT,
  recorder_id TEXT NOT NULL,
  recorder_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'submitted', 'approved', 'rejected')),
  approver_id TEXT,
  approver_name TEXT,
  approved_at TEXT,
  created_at TEXT DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT DEFAULT (datetime('now', 'localtime')),
  
  FOREIGN KEY (recorder_id) REFERENCES users(id),
  FOREIGN KEY (approver_id) REFERENCES users(id)
);

-- ==========================================
-- インデックス作成
-- ==========================================

-- 活動日誌
CREATE INDEX IF NOT EXISTS idx_activity_logs_date ON activity_logs(date);
CREATE INDEX IF NOT EXISTS idx_activity_logs_recorder ON activity_logs(recorder_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_status ON activity_logs(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(activity_type);

-- ホース点検
CREATE INDEX IF NOT EXISTS idx_hose_inspections_storage ON hose_inspections(storage_id);
CREATE INDEX IF NOT EXISTS idx_hose_inspections_date ON hose_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_hose_inspections_status ON hose_inspections(report_status);

-- 訓練記録
CREATE INDEX IF NOT EXISTS idx_training_records_date ON training_records(date);
CREATE INDEX IF NOT EXISTS idx_training_records_recorder ON training_records(recorder_id);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(status);

-- ユーザー
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
