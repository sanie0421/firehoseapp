-- 活動日誌に承認機能を追加

ALTER TABLE activity_logs ADD COLUMN approval_status TEXT DEFAULT 'pending'; -- pending/approved
ALTER TABLE activity_logs ADD COLUMN approved_by TEXT; -- 承認者名
ALTER TABLE activity_logs ADD COLUMN approved_at TEXT; -- 承認日時

-- インデックス
CREATE INDEX idx_activity_logs_approval ON activity_logs(approval_status);
