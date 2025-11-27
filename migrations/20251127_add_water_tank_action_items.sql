-- Add action item columns to water_tank_inspections
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1 TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2 TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3 TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_completed INTEGER DEFAULT 0;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_completed_at TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_1_action_content TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_2_action_content TEXT;
ALTER TABLE water_tank_inspections ADD COLUMN action_item_3_action_content TEXT;
