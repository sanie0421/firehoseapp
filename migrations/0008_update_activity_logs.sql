-- 活動日誌テーブルの更新

-- 既存のactivity_logsテーブルを削除して再作成
DROP TABLE IF EXISTS activity_logs;

CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  -- 基本情報
  activity_date TEXT NOT NULL,
  weather TEXT,
  recorder_name TEXT NOT NULL,
  
  -- 活動内容
  location TEXT,
  activity_content TEXT,
  activity_type TEXT NOT NULL, -- 災害出動/警戒/訓練/通常点検/その他
  activity_type_other TEXT, -- その他の場合の詳細
  
  -- 活動時間
  start_time TEXT, -- HH:MM形式
  end_time TEXT,   -- HH:MM形式
  duration_hours REAL,
  
  -- 出動者（JSON配列で保存）
  participants TEXT, -- JSON: ["三谷誠", "瀬戸毅", ...]
  
  -- 車両情報
  previous_meter INTEGER,
  current_meter INTEGER,
  distance_km INTEGER,
  fuel_liters REAL,
  
  -- 点検項目
  engine_check TEXT, -- 良/不良
  battery_check TEXT,
  grease_supply TEXT, -- 補給要なし/補給した
  fuel_supply TEXT,   -- 補給要なし/補給した
  oil_supply TEXT,    -- 注油要なし/注油した
  
  -- 車載備品
  fire_suits INTEGER,
  boots INTEGER,
  helmets INTEGER,
  hoses INTEGER,
  nozzles INTEGER,
  
  -- 放水・確認
  water_discharge TEXT, -- 有/無
  vehicle_power_off_confirmed_by TEXT, -- 車両充電確認者
  radio_charge_confirmed_by TEXT,      -- 無線機充電確認者
  
  -- 備考
  remarks TEXT,
  special_notes TEXT,
  
  -- システム項目
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- インデックス
CREATE INDEX idx_activity_logs_date ON activity_logs(activity_date);
CREATE INDEX idx_activity_logs_type ON activity_logs(activity_type);
