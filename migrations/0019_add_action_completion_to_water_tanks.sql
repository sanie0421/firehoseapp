-- 防火水槽点検に対応完了機能を追加
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_action_content TEXT;

ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_action_content TEXT;

ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_action_content TEXT;
