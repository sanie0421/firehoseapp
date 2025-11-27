-- Add hydrant_only flag to hose_inspections
-- 消火栓点検のみの場合に TRUE になるフラグ
ALTER TABLE hose_inspections ADD COLUMN hydrant_only INTEGER DEFAULT 0;
