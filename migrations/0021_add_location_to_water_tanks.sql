-- 防火水槽に位置情報フィールドを追加
ALTER TABLE water_tanks ADD COLUMN latitude REAL;
ALTER TABLE water_tanks ADD COLUMN longitude REAL;
ALTER TABLE water_tanks ADD COLUMN google_maps_url TEXT;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_water_tanks_location ON water_tanks(latitude, longitude);
