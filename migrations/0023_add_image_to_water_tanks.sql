-- Add image_url column to water_tanks table
ALTER TABLE water_tanks ADD COLUMN image_url TEXT;

-- Add last_inspection_date column to water_tanks table for sorting
ALTER TABLE water_tanks ADD COLUMN last_inspection_date TEXT;
