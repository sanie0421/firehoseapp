-- ホース点検テーブルに製造年月日カラム追加
-- 法的根拠: 消防法（平成14年改正）、消防庁告示第19号（平成25年）
-- 点検ルール: 製造年から10年経過後、3年ごとに耐圧点検が義務

ALTER TABLE hose_inspections ADD COLUMN hose_1_manufacture_date TEXT;
ALTER TABLE hose_inspections ADD COLUMN hose_2_manufacture_date TEXT;
ALTER TABLE hose_inspections ADD COLUMN hose_3_manufacture_date TEXT;
ALTER TABLE hose_inspections ADD COLUMN hose_4_manufacture_date TEXT;

-- 最新製造年月日を格納庫テーブルに追加（優先度計算用）
ALTER TABLE hose_storages ADD COLUMN oldest_hose_manufacture_date TEXT;
ALTER TABLE hose_storages ADD COLUMN next_mandatory_inspection_date TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_hose_storages_next_inspection 
ON hose_storages(next_mandatory_inspection_date);
