-- データ移行スクリプト: 既存の action_required データを action_items に移行
-- 注意: このスクリプトは SQLite の制限により、バックエンドで実行する必要があります

-- 既存データの確認（実行前に確認用）
-- SELECT id, action_required FROM hose_inspections WHERE action_required IS NOT NULL AND action_required != '';
