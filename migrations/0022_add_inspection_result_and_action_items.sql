-- Add inspection_result and action_item columns to hose_inspections
ALTER TABLE hose_inspections ADD COLUMN inspection_result TEXT;
ALTER TABLE hose_inspections ADD COLUMN action_item_1 TEXT;
ALTER TABLE hose_inspections ADD COLUMN action_item_2 TEXT;
ALTER TABLE hose_inspections ADD COLUMN action_item_3 TEXT;
ALTER TABLE hose_inspections ADD COLUMN notes TEXT;

-- Add last_inspection_result to hose_storages
ALTER TABLE hose_storages ADD COLUMN last_inspection_result TEXT;

-- Create index for inspection_result
CREATE INDEX IF NOT EXISTS idx_hose_inspections_result ON hose_inspections(inspection_result);
