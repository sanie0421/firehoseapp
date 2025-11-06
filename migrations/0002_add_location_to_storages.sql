-- ホース格納庫に位置情報（緯度経度・Google My Maps URL）を追加
-- 地図機能用

-- 緯度経度カラムの追加
ALTER TABLE hose_storages ADD COLUMN latitude REAL;
ALTER TABLE hose_storages ADD COLUMN longitude REAL;
ALTER TABLE hose_storages ADD COLUMN address TEXT;
ALTER TABLE hose_storages ADD COLUMN google_maps_url TEXT;

-- 既存の location カラムは「場所の目安」として使用
-- latitude, longitude は地図で設定した位置情報（Leaflet用）
-- google_maps_url は Google My Maps のURL（推奨）
-- address は住所（任意）
