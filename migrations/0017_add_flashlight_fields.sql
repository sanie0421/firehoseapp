-- Add flashlight count and charge check fields to activity_logs
ALTER TABLE activity_logs ADD COLUMN flashlights INTEGER;
ALTER TABLE activity_logs ADD COLUMN flashlight_charge TEXT;
