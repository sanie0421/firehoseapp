-- 消防団アプリ テストデータ
-- 初期ユーザーと格納庫のサンプルデータ

-- ==========================================
-- テストユーザー（団員）の作成
-- ==========================================
-- パスワードは全員 "password123" (実際は bcrypt でハッシュ化が必要)
-- ここでは簡易的にプレーンテキストで保存（後でハッシュ化実装）

-- 分団長
INSERT OR IGNORE INTO users (
  id, email, password_hash, name, role, position,
  join_date, birth_date, blood_type, phone, phone_mobile, address, district,
  occupation, company_name
) VALUES (
  'user_001', 'mitani@example.com', 'password123', '三谷　誠', 'leader', '会計兼機械係長',
  '2005-10-01', '1977-10-26', 'A', '83-0625', '090-5828-4590', '金子2853-5', '根岸下',
  '自営・畳店', '三谷たたみ店'
);

-- 副分団長
INSERT OR IGNORE INTO users (
  id, email, password_hash, name, role, position,
  join_date, birth_date, blood_type, phone, phone_mobile, address, district,
  occupation, company_name
) VALUES (
  'user_002', 'seto@example.com', 'password123', '瀬戸　毅', 'viceleader', 'ホース係',
  '2005-10-01', '1976-06-01', 'B', '83-7104', '090-6474-7704', '金子1664-3', '根岸',
  '会社員', 'JSR株式会社'
);

-- 班長
INSERT OR IGNORE INTO users (
  id, email, password_hash, name, role, position,
  join_date, birth_date, blood_type, phone_mobile, address, district
) VALUES (
  'user_003', 'hashimoto@example.com', 'password123', '橋本　史哉', 'chief', '',
  '2016-10-01', '1986-09-24', 'O', '080-4188-5974', '金子1752-2', '根岸'
);

-- 一般団員
INSERT OR IGNORE INTO users (
  id, email, password_hash, name, role,
  join_date, birth_date, blood_type, phone_mobile, address, district
) VALUES 
  ('user_004', 'saito@example.com', 'password123', '斉藤　貴禎', 'member', '2009-10-01', '1985-03-24', 'A', '090-9146-5839', '金子1657-1', '根岸'),
  ('user_005', 'ishii@example.com', 'password123', '石井　友祐', 'member', '2015-04-01', '1986-11-19', 'A', '090-4920-3755', '金子2168-9', '中部'),
  ('user_006', 'tsuda@example.com', 'password123', '津田　和哉', 'member', '2017-04-01', '1988-11-05', 'O', '090-7826-2918', '金子1889-7', '根岸'),
  ('user_007', 'watanabe@example.com', 'password123', '渡辺　拓人', 'member', '2018-04-01', '1990-12-29', 'O', '080-4155-2099', '金子1664-17', '根岸'),
  ('user_008', 'asakura@example.com', 'password123', '浅倉　伶', 'member', '2019-04-01', '1989-05-21', 'AB', '090-1732-6657', '金子2121-2', '中部'),
  ('user_009', 'naito@example.com', 'password123', '内藤　光', 'member', '2019-04-01', '1989-02-24', 'O', '070-4466-9899', '金子2160', '中部'),
  ('user_010', 'ishioka@example.com', 'password123', '石岡　瑞輝', 'member', '2020-04-01', '1991-10-06', 'B', '080-6556-3336', '金子1709-1', '根岸'),
  ('user_011', 'nakamura@example.com', 'password123', '中村　裕太郎', 'member', '2021-04-01', '1992-08-15', 'A', '080-3174-8837', '金子1776-2', '根岸'),
  ('user_012', 'noji@example.com', 'password123', '野地　駿介', 'member', '2022-04-01', '1993-07-11', 'AB', '080-9426-6664', '金子2168-9', '中部'),
  ('user_013', 'kagiwada@example.com', 'password123', '鍵和田　真吉', 'member', '2023-04-01', '1994-04-08', 'A', '090-6343-0029', '金子2087-1', '中部'),
  ('user_014', 'katano@example.com', 'password123', '片野　聡介', 'member', '2024-04-01', '1995-02-14', 'O', '080-3728-7575', '金子1801', '根岸'),
  ('user_015', 'nakayama@example.com', 'password123', '中山　魁', 'member', '2024-04-01', '1996-06-20', 'B', '080-8865-6665', '金子2160', '中部'),
  ('user_016', 'suzuki@example.com', 'password123', '鈴木　大慎', 'member', '2024-10-01', '1997-11-30', 'A', '090-1234-5678', '金子xxxx', '根岸');

-- ==========================================
-- ホース格納庫のサンプルデータ
-- ==========================================
INSERT OR IGNORE INTO hose_storages (id, storage_number, location, remarks) VALUES
  ('storage_001', 'No.01', '◯◯公民館前', ''),
  ('storage_002', 'No.02', '△△集会所裏', ''),
  ('storage_003', 'No.03', '××消防団詰所前', '');

-- ==========================================
-- 活動日誌のサンプルデータ
-- ==========================================
INSERT OR IGNORE INTO activity_logs (
  id, date, weather, location, activity_type, activity_hours, activity_content,
  check_engine, check_lights, check_siren, check_tire, check_oil,
  check_pump, equipment_firesuit, equipment_boots, equipment_helmet, equipment_hose,
  equipment_radio, equipment_radio_count, equipment_flashlight,
  equipment_flashlight_charged, equipment_flashlight_total,
  tools_generator, tools_chainsaw, tools_gasoline,
  recorder_id, recorder_name, status
) VALUES (
  'log_001', '2024-11-05', '晴れ', '町内、詰所', 'training', 4.0, '放水訓練、機械器具点検',
  'good', 'good', 'good', 'good', 'no_need',
  'good', 11, 10, 15, 26,
  'good', 5, 'good', 3, 8,
  'good', 'good', 1,
  'user_004', '斉藤　貴禎', 'approved'
);

-- ==========================================
-- ホース点検のサンプルデータ
-- ==========================================
INSERT OR IGNORE INTO hose_inspections (
  id, storage_id, storage_number, inspection_date,
  was_replaced, replacement_date, remarks, needs_report, report_status,
  inspector_id, inspector_name
) VALUES (
  'inspection_001', 'storage_001', 'No.01', '2024-11-01',
  1, '2024-11-01', '異常なし', 0, 'none',
  'user_002', '瀬戸　毅'
);

-- ==========================================
-- 訓練記録のサンプルデータ
-- ==========================================
INSERT OR IGNORE INTO training_records (
  id, date, training_type, duration, location,
  participants, notes,
  recorder_id, recorder_name, status
) VALUES (
  'training_001', '2024-11-05', '放水訓練', 4.0, '町内訓練場',
  '["user_001","user_002","user_003","user_004","user_005","user_006","user_007","user_008"]',
  '放水圧力の調整がスムーズ。ホース展開の手順を確認。次回は夜間訓練も実施したい。',
  'user_004', '斉藤　貴禎', 'approved'
);
