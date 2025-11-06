-- ホース点検記録テーブルに結果と要対応事項フィールドを追加

-- 点検結果フィールド追加
ALTER TABLE hose_inspections ADD COLUMN result TEXT CHECK(result IN ('normal', 'caution', 'abnormal', 'not_checked'));

-- 要対応事項フィールド追加
ALTER TABLE hose_inspections ADD COLUMN action_required TEXT;

-- 対応済みフラグ追加
ALTER TABLE hose_inspections ADD COLUMN action_completed INTEGER DEFAULT 0;

-- 対応完了日追加
ALTER TABLE hose_inspections ADD COLUMN action_completed_at TEXT;
