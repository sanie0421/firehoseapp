-- ホース点検記録にホース交換数・破損数を追加、点検結果を削除

-- 点検結果フィールドを削除(不要になったため)
ALTER TABLE hose_inspections DROP COLUMN result;

-- ホース交換数を追加 (0〜4の範囲)
ALTER TABLE hose_inspections ADD COLUMN hose_replaced_count INTEGER DEFAULT 0 CHECK(hose_replaced_count >= 0 AND hose_replaced_count <= 4);

-- ホース破損数を追加 (0〜4の範囲)
ALTER TABLE hose_inspections ADD COLUMN hose_damaged_count INTEGER DEFAULT 0 CHECK(hose_damaged_count >= 0 AND hose_damaged_count <= 4);
