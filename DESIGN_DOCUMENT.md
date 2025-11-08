# 大井町消防団第一分団 活動記録アプリ - 設計書

## 📋 プロジェクト概要

**プロジェクト名**: 大井町消防団第一分団 活動記録アプリ  
**プロジェクトコード名**: oifire1  
**本番URL**: https://oifire1.pages.dev  
**バージョン**: 1.0  
**作成日**: 2025年11月7日  
**最終更新**: 2025年11月7日

### 目的
大井町消防団第一分団の活動を効率的に記録・管理するWebアプリケーション。ホース格納庫の点検管理、活動日誌の記録、団員情報の管理を一元化し、スマートフォンからいつでもどこでも記録できる環境を提供する。

### 対象ユーザー
- 大井町消防団第一分団の団員全員
- スマートフォン操作に不慣れな方も含む
- ログイン不要で誰でも使える設計

---

## 🏗️ システム構成

### アーキテクチャ概要

```
┌─────────────────────────────────────────────────────────────┐
│                        ユーザー                               │
│                    (スマートフォン/PC)                        │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTPS
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Cloudflare Pages                             │
│                (エッジネットワーク)                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  フロントエンド (静的ファイル)                         │   │
│  │  - HTML/CSS/JavaScript                                │   │
│  │  - Tailwind CSS                                       │   │
│  │  - Leaflet.js (地図)                                  │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  バックエンド (Cloudflare Workers)                    │   │
│  │  - Hono Framework (TypeScript)                        │   │
│  │  - API エンドポイント                                  │   │
│  └──────────────────┬───────────────────────────────────┘   │
└─────────────────────┼───────────────────────────────────────┘
                      │
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              Cloudflare D1 Database                           │
│              (SQLite ベース分散DB)                            │
│  - users (団員情報)                                           │
│  - activity_logs (活動日誌)                                  │
│  - hose_storages (ホース格納庫)                              │
│  - hose_inspections (点検記録)                               │
└───────────────────────────────────────────────────────────────┘
```

### 技術スタック

#### フロントエンド
- **HTML5/CSS3/JavaScript (ES6+)**
  - モダンなWeb標準技術
  - ブラウザ互換性重視
  
- **Tailwind CSS 3.x** (CDN)
  - ユーティリティファーストCSSフレームワーク
  - レスポンシブデザイン対応
  - カスタマイズ可能なデザインシステム

- **Leaflet.js 1.9.x** (CDN)
  - オープンソース地図ライブラリ
  - Google Maps連携

- **Font Awesome 6.x** (CDN)
  - アイコンライブラリ

#### バックエンド
- **Hono 4.x**
  - 軽量高速Webフレームワーク
  - TypeScript完全対応
  - Cloudflare Workers最適化

- **TypeScript 5.x**
  - 型安全性
  - 開発効率向上
  - コード品質保証

- **Cloudflare Workers**
  - エッジコンピューティング
  - グローバル配信
  - 低レイテンシ

#### データベース
- **Cloudflare D1**
  - SQLiteベース分散データベース
  - グローバルレプリケーション
  - 高速クエリ実行
  - 自動バックアップ

#### 開発ツール
- **Vite 5.x**
  - 高速ビルドツール
  - HMR (Hot Module Replacement)
  - 最適化されたバンドル生成

- **Wrangler 3.x**
  - Cloudflare CLI
  - ローカル開発環境
  - デプロイメント管理

- **PM2**
  - プロセス管理 (開発環境のみ)
  - ログ管理
  - 自動再起動

---

## 📊 データベース設計

### ER図

```
┌─────────────────┐
│     users       │
│  (団員情報)      │
├─────────────────┤
│ id (PK)         │
│ name            │
│ birth_date      │
│ join_date       │
│ created_at      │
│ updated_at      │
└─────────────────┘
        │
        │ 1:N
        │
┌───────▼─────────────────┐
│   activity_logs         │
│   (活動日誌)             │
├─────────────────────────┤
│ id (PK)                 │
│ activity_date           │
│ recorder_name           │
│ activity_type           │
│ participants (JSON)     │
│ start_time              │
│ end_time                │
│ duration_hours          │
│ previous_meter          │
│ current_meter           │
│ distance_km             │
│ ... (車両・点検情報)     │
│ created_at              │
│ updated_at              │
└─────────────────────────┘

┌─────────────────────┐
│  hose_storages      │
│  (ホース格納庫)      │
├─────────────────────┤
│ id (PK)             │
│ storage_number      │
│ location            │
│ district            │
│ latitude            │
│ longitude           │
│ google_maps_url     │
│ remarks             │
│ created_at          │
│ updated_at          │
└─────────────────────┘
        │
        │ 1:N
        │
┌───────▼──────────────────┐
│  hose_inspections        │
│  (点検記録)               │
├──────────────────────────┤
│ id (PK)                  │
│ storage_id (FK)          │
│ inspection_date          │
│ inspector_name           │
│ result                   │
│ action_required          │
│ action_completed         │
│ action_completed_at      │
│ remarks                  │
│ created_at               │
│ updated_at               │
└──────────────────────────┘
```

### テーブル定義

#### 1. users (団員情報)

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | TEXT | NOT NULL | - | 主キー (例: member_1699012345678) |
| email | TEXT | NOT NULL | '' | メールアドレス (未使用) |
| password_hash | TEXT | NOT NULL | '' | パスワードハッシュ (未使用) |
| name | TEXT | NOT NULL | - | 氏名 |
| role | TEXT | NOT NULL | 'member' | 役職 (未使用) |
| join_date | TEXT | NULL | - | 入団日 (YYYY-MM-DD形式) |
| birth_date | TEXT | NULL | - | 生年月日 (YYYY-MM-DD形式) |
| created_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE (email) ※未使用だが必須

**注意事項**:
- email, password_hash, roleは将来の拡張用に存在するが現在未使用
- 入団日から勤続年数を自動計算（4月1日基準の年度計算）
- 生年月日から年齢を自動計算

#### 2. activity_logs (活動日誌)

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | TEXT | NOT NULL | - | 主キー (例: log_1699012345678) |
| activity_date | TEXT | NOT NULL | - | 活動日 (YYYY-MM-DD形式) |
| weather | TEXT | NULL | - | 天候 (晴れ/曇り/雨/雪) |
| recorder_name | TEXT | NOT NULL | - | 記録者名 |
| location | TEXT | NULL | - | 場所 |
| activity_content | TEXT | NULL | - | 活動内容 |
| activity_type | TEXT | NOT NULL | - | 活動種別 (災害出動/警戒/訓練/通常点検/その他) |
| activity_type_other | TEXT | NULL | - | その他の詳細 |
| start_time | TEXT | NULL | - | 開始時刻 (HH:MM形式) |
| end_time | TEXT | NULL | - | 終了時刻 (HH:MM形式) |
| duration_hours | REAL | NULL | - | 活動時間 (時間、自動計算) |
| participants | TEXT | NULL | - | 出動者 (JSON配列) |
| previous_meter | INTEGER | NULL | - | 前回メーター (km、自動入力) |
| current_meter | INTEGER | NULL | - | 最終メーター (km) |
| distance_km | INTEGER | NULL | - | 走行距離 (km、自動計算) |
| fuel_liters | REAL | NULL | - | 燃料補給 (L) |
| engine_check | TEXT | NULL | - | エンジン (良/不良) |
| battery_check | TEXT | NULL | - | バッテリー (良/否) |
| grease_supply | TEXT | NULL | - | グリス (不要/補給) |
| fuel_supply | TEXT | NULL | - | 燃料 (不要/補給) |
| oil_supply | TEXT | NULL | - | 注油 (不要/注油) |
| fire_suits | INTEGER | NULL | - | 防火服数 |
| boots | INTEGER | NULL | - | 銀長靴数 |
| helmets | INTEGER | NULL | - | ヘルメット数 |
| hoses | INTEGER | NULL | - | ホース数 |
| nozzles | INTEGER | NULL | - | 筒先数 |
| water_discharge | TEXT | NULL | - | 放水の有無 (有/無) |
| vehicle_power_off_confirmed_by | TEXT | NULL | - | 車両充電確認者 |
| radio_charge_confirmed_by | TEXT | NULL | - | 無線機充電確認者 |
| remarks | TEXT | NULL | - | 備考 |
| special_notes | TEXT | NULL | - | 特記事項 (未使用) |
| approval_status | TEXT | NOT NULL | 'pending' | 承認状態 (pending/approved) |
| approved_by | TEXT | NULL | - | 承認者 |
| approved_at | TEXT | NULL | - | 承認日時 |
| created_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX (activity_date)
- INDEX (activity_type)

**注意事項**:
- participantsはJSON配列形式で保存: `["三谷誠", "瀬戸毅", ...]`
- duration_hoursは開始・終了時刻から自動計算
- distance_kmは前回メーターと最終メーターの差分から自動計算
- previous_meterは前回の活動記録のcurrent_meterを自動取得

#### 3. hose_storages (ホース格納庫)

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | TEXT | NOT NULL | - | 主キー (例: storage_1699012345678) |
| storage_number | TEXT | NOT NULL | - | 格納庫番号 (例: No.01) |
| location | TEXT | NULL | - | 場所の目安 |
| district | TEXT | NULL | - | 地区 (市場/根岸上/根岸下/坊村/馬場/宮地) |
| latitude | REAL | NULL | - | 緯度 |
| longitude | REAL | NULL | - | 経度 |
| address | TEXT | NULL | - | 住所 |
| google_maps_url | TEXT | NULL | - | Google Maps URL |
| remarks | TEXT | NULL | - | 備考 |
| created_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- UNIQUE (storage_number)
- INDEX (district)

**注意事項**:
- storage_numberはユニーク制約あり
- districtは6つの地区のいずれか
- 緯度経度は地図表示用

#### 4. hose_inspections (点検記録)

| カラム名 | 型 | NULL | デフォルト | 説明 |
|---------|-----|------|-----------|------|
| id | TEXT | NOT NULL | - | 主キー (例: inspection_1699012345678) |
| storage_id | TEXT | NOT NULL | - | 格納庫ID (外部キー) |
| storage_number | TEXT | NOT NULL | - | 格納庫番号 (表示用) |
| inspection_date | TEXT | NOT NULL | - | 点検日 (YYYY-MM-DD形式) |
| inspector_name | TEXT | NOT NULL | - | 点検者名 |
| result | TEXT | NULL | - | 点検結果 (normal/caution/abnormal/not_checked) |
| action_required | TEXT | NULL | - | 要対応事項 |
| action_completed | INTEGER | NOT NULL | 0 | 対応完了フラグ (0/1) |
| action_completed_at | TEXT | NULL | - | 対応完了日時 |
| remarks | TEXT | NULL | - | 備考 |
| created_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 作成日時 |
| updated_at | TEXT | NOT NULL | CURRENT_TIMESTAMP | 更新日時 |

**インデックス**:
- PRIMARY KEY (id)
- INDEX (storage_id)
- INDEX (inspection_date)
- INDEX (result)
- INDEX (action_completed)

**注意事項**:
- resultの値:
  - normal: 正常 (緑色)
  - caution: 注意 (黄色)
  - abnormal: 異常 (赤色)
  - not_checked: 未点検 (グレー)
- action_requiredがある場合は優先度が上がる
- action_completedは0/1のboolean値

---

## 🎯 機能仕様

### 1. ホーム画面

**URL**: `/`

**機能**:
- アプリケーションのエントリーポイント
- 各機能へのナビゲーション

**表示項目**:
1. 📦 ホース格納庫管理 → `/hose-storages`
2. 🚨 点検優先度一覧 → `/inspection-priority`
3. ⚠️ 要対応一覧 → `/action-required`
4. 📝 活動日誌 → `/activity-logs`
5. 👥 団員管理 → `/members`
6. 📊 活動集計 → `/stats` (未実装)
7. ⚙️ データ管理 → `/admin`

**デザイン**:
- カード型レイアウト
- グラデーション背景
- 大きなアイコンとテキスト
- ホバー/タップ時のアニメーション

### 2. ホース格納庫管理

**URL**: `/hose-storages`

#### 2-1. 格納庫一覧

**機能**:
- 登録されているホース格納庫の一覧表示
- 点検状態に応じた色分け表示
- 地区別表示

**表示項目**:
- 格納庫番号 (No.01など)
- 場所の目安
- 地区
- 備考
- 最終点検日
- 点検結果

**カラーコーディング**:
- 🔴 赤: 点検期限切れ (3ヶ月以上点検なし) または異常
- 🟠 橙: 点検期限間近 (2-3ヶ月点検なし) または注意
- 🔵 青: 要対応事項あり
- 🟢 緑: 正常

**アクション**:
- 📝 点検する → 点検記録画面へ
- 🗺️ Google Maps → 地図を開く
- ✏️ 編集 → 編集モーダル

**操作フロー**:
```
格納庫一覧
  ↓ タップ
格納庫詳細画面
  ↓ 「点検する」ボタン
点検記録モーダル
  ↓ 入力して保存
点検完了
```

#### 2-2. 格納庫追加

**機能**:
- 新しいホース格納庫を登録

**入力項目**:
- 📦 格納庫番号 (必須) - 例: No.01
- 📍 場所の目安 (必須) - 例: 大井町公民館前
- 🏘️ 地区 - 選択: 市場/根岸上/根岸下/坊村/馬場/宮地
- 🗺️ Google My Maps URL (任意)
- 💬 備考 (任意)

**バリデーション**:
- 格納庫番号の重複チェック
- 必須項目のチェック

**API**: `POST /api/hose/storages`

#### 2-3. CSV一括登録

**機能**:
- CSVファイルから複数の格納庫を一括登録

**CSV形式**:
```csv
ホース格納庫番号,場所の目安,地区,備考
No.01,大井町公民館前,市場,2020年設置
No.02,馬場集会所裏,馬場,扉に破損あり
No.03,根岸下消防団詰所,根岸下,
```

**操作フロー**:
```
CSV一括登録ボタン
  ↓
テンプレートダウンロード
  ↓
Excelで編集
  ↓
CSVとして保存
  ↓
ファイル選択
  ↓
アップロード
  ↓
登録完了
```

**API**: `POST /api/hose/storages/bulk`

#### 2-4. 格納庫編集・削除

**機能**:
- 既存の格納庫情報を編集
- 不要な格納庫を削除

**API**:
- 編集: `PUT /api/hose/storages/:id`
- 削除: `DELETE /api/hose/storages/:id`

**注意事項**:
- 削除時は確認ダイアログを表示
- 削除すると点検履歴も削除される

### 3. 点検管理

#### 3-1. 点検記録

**URL**: `/storage/:id` (格納庫詳細画面から)

**機能**:
- ホース格納庫の点検を記録

**入力項目**:
- 📅 点検日 (必須、デフォルト: 今日)
- 👤 点検者 (必須、選択式)
- 📋 点検結果 (必須)
  - ✅ 正常
  - ⚠️ 注意
  - ❌ 異常
  - - 未点検
- 🚨 要対応事項 (任意)
- 💬 備考 (任意)

**API**: `POST /api/hose/inspections`

**操作フロー**:
```
格納庫をタップ
  ↓
格納庫詳細画面
  ↓
「📝 点検する」ボタン
  ↓
点検記録モーダル
  ↓
必須項目を入力
  ↓
保存
  ↓
完了メッセージ
```

#### 3-2. 点検優先度一覧

**URL**: `/inspection-priority`

**機能**:
- 点検が必要な格納庫を優先度順に表示

**表示順序**:
1. 🔴 点検期限切れ (3ヶ月以上点検なし)
2. 🟠 点検期限間近 (2-3ヶ月点検なし)
3. 🔵 要対応事項あり
4. 🟢 通常

**表示項目**:
- 格納庫番号
- 場所
- 地区
- 最終点検日
- 経過日数
- 点検結果

**優先度判定ロジック**:
```javascript
// 点検期限切れ（90日以上）
if (daysSinceInspection >= 90) return 'critical'

// 点検期限間近（60-89日）
if (daysSinceInspection >= 60) return 'warning'

// 要対応事項あり
if (hasActionRequired && !actionCompleted) return 'action'

// 通常
return 'normal'
```

#### 3-3. 要対応一覧

**URL**: `/action-required`

**機能**:
- 対応が必要な問題を一覧表示

**表示条件**:
- `action_required`に値があり、`action_completed = 0`の点検記録

**表示項目**:
- 格納庫番号
- 場所
- 地区
- 要対応事項
- 点検日
- 点検者

**アクション**:
- ✅ 対応完了 → `action_completed = 1`に更新

**API**: `PUT /api/hose/inspections/:id/complete-action`

#### 3-4. 点検履歴

**機能**:
- 格納庫ごとの過去の点検記録を表示

**表示項目**:
- 点検日
- 点検者
- 点検結果
- 要対応事項
- 備考

**並び順**: 点検日の降順（新しい順）

### 4. 活動日誌

**URL**: `/activity-logs`

#### 4-1. 活動記録一覧

**機能**:
- 過去の活動記録を一覧表示

**表示項目**:
- 活動日
- 記録者
- 活動種別（色分け）
- 活動内容（抜粋）
- 出動者数
- 承認状態

**活動種別の色**:
- 🔴 災害出動: 赤
- 🟠 警戒: オレンジ
- 🔵 訓練: 青
- 🟢 通常点検: 緑
- ⚪ その他: グレー

**並び順**: 活動日の降順（新しい順）

#### 4-2. 活動記録

**機能**:
- 新しい活動を記録

**入力項目** (全6セクション):

**セクション1: 基本情報**
- 📅 活動日 (必須、デフォルト: 今日)
- ☀️ 天候 (選択: 晴れ/曇り/雨/雪)
- ✍️ 記録者 (必須、選択式)
- 🎯 活動種別 (必須)
  - 災害出動
  - 警戒
  - 訓練
  - 通常点検
  - その他
- 📝 その他の詳細 (活動種別が「その他」の場合)

**セクション2: 活動時間と場所**
- 🕐 開始時刻 (HH:MM形式)
- 🕐 終了時刻 (HH:MM形式)
- ⏱️ 活動時間 (自動計算、読み取り専用)
- 👥 出動者選択 (複数選択可能、チェックボックス)
- 📍 場所
- 💧 放水の有無 (選択: 有/無)
- 📋 活動内容 (テキストエリア)

**セクション3: 車両情報** (折りたたみ、任意)
- 前回メーター (km) - 前回の最終メーターを自動入力
- 最終メーター (km)
- 走行距離 (km) - 自動計算、読み取り専用
- 燃料補給 (L)

**セクション4: 点検項目** (折りたたみ、任意)
- 🔧 エンジン (選択: 良/不良)
- 🔋 バッテリー (選択: 良/否)
- グリス (選択: 不要/補給)
- ⛽ 燃料 (選択: 不要/補給)
- 注油 (選択: 不要/注油)

**セクション5: 備品数** (折りたたみ、任意)
- 👔 防火服 (数値)
- 👢 銀長靴 (数値)
- ⛑️ ヘルメット (数値)
- 🚿 ホース (数値)
- 🔫 筒先 (数値)

**セクション6: 確認者と備考**
- 🔌 車両充電確認者 (選択式)
- 📻 無線機充電確認者 (選択式)
- 📝 備考・特記事項 (テキストエリア)

**自動計算機能**:

1. **活動時間の自動計算**:
```javascript
function calculateDuration() {
  const start = new Date('2000-01-01 ' + startTime)
  const end = new Date('2000-01-01 ' + endTime)
  let diff = (end - start) / (1000 * 60 * 60) // 時間に変換
  
  // 終了時刻が開始時刻より前なら翌日扱い
  if (diff < 0) diff += 24
  
  // 0.5時間単位に丸める
  return Math.round(diff * 2) / 2
}
```

2. **走行距離の自動計算**:
```javascript
function calculateDistance() {
  const distance = currentMeter - previousMeter
  return distance >= 0 ? distance : 0
}
```

3. **前回メーターの自動入力**:
```javascript
async function loadPreviousMeterReading() {
  // 最新の活動記録から最終メーターを取得
  const response = await fetch('/api/activity-logs?limit=1')
  const data = await response.json()
  
  if (data.logs && data.logs.length > 0) {
    return data.logs[0].current_meter
  }
}
```

**バリデーション**:
- 必須項目: 活動日、記録者、活動種別
- 数値フィールド: 正の数のみ
- 時刻フィールド: HH:MM形式

**API**: `POST /api/activity-logs`

**エラーハンドリング**:
- 空文字列は自動的にnullに変換
- データベースエラー時は詳細なエラーメッセージを表示
- 必須項目未入力時はアラート表示

#### 4-3. 活動詳細表示

**機能**:
- 記録された活動の詳細を表示

**表示項目**:
- すべての入力項目
- 改行を含むテキストは`<br>`タグに変換して表示
- 承認状態
- 作成日時・更新日時

**アクション**:
- ✏️ 編集 (未実装)
- 🗑️ 削除 (未実装)
- ✅ 承認 (未実装)

### 5. 団員管理

**URL**: `/members`

#### 5-1. 団員一覧

**機能**:
- 登録されている団員の一覧表示

**表示項目**:
- 👤 氏名
- 🎂 年齢 (生年月日から自動計算)
- 📅 入団日
- 勤続年数 (入団日から自動計算、年度基準)

**年齢計算**:
```javascript
function calculateAge(birthDate) {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}
```

**勤続年数計算** (4月1日基準):
```javascript
function calculateYearsOfService(joinDate) {
  const today = new Date()
  const join = new Date(joinDate)
  
  // 入団年度
  const joinYear = join.getFullYear()
  const joinMonth = join.getMonth() + 1
  const joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1
  
  // 現在年度
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1
  const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1
  
  // 年度差 + 1 (入団年度を1年目とするため)
  return currentFiscalYear - joinFiscalYear + 1
}
```

#### 5-2. 団員追加

**機能**:
- 新しい団員を登録

**入力項目**:
- 👤 氏名 (必須)
- 🎂 生年月日 (必須)
- 📅 入団日 (必須)

**バリデーション**:
- すべて必須項目
- 日付形式チェック

**API**: `POST /api/members`

#### 5-3. 団員編集・削除

**機能**:
- 既存の団員情報を編集
- 退団した団員を削除

**API**:
- 編集: `PUT /api/members/:id`
- 削除: `DELETE /api/members/:id`

**注意事項**:
- 削除時は確認ダイアログを表示
- 削除すると、その団員が記録した活動記録への影響を警告

### 6. データ管理

**URL**: `/admin`

#### 6-1. データエクスポート

**機能**:
- 各種データをCSV形式でダウンロード

**エクスポート可能なデータ**:
1. 📦 ホース格納庫データ
2. 📋 点検記録
3. 📝 活動日誌
4. 👥 団員情報

**API**:
- `/api/hose/storages/export`
- `/api/hose/inspections/export`
- `/api/activity-logs/export`
- `/api/members/export`

**CSV形式**:
- UTF-8エンコーディング
- BOM付き (Excel対応)
- カンマ区切り
- ヘッダー行あり

**用途**:
- データバックアップ
- 紙の報告書作成
- 外部システムへのデータ移行
- Excelでの分析

---

## 🔌 API仕様

### エンドポイント一覧

#### ホース格納庫関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/hose/storages` | 格納庫一覧取得 |
| POST | `/api/hose/storages` | 格納庫追加 |
| POST | `/api/hose/storages/bulk` | CSV一括登録 |
| PUT | `/api/hose/storages/:id` | 格納庫更新 |
| DELETE | `/api/hose/storages/:id` | 格納庫削除 |
| GET | `/api/hose/storages/export` | CSVエクスポート |

#### 点検記録関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/hose/inspections` | 点検記録一覧取得 |
| GET | `/api/hose/inspections/by-storage/:storageId` | 格納庫別点検履歴取得 |
| POST | `/api/hose/inspections` | 点検記録追加 |
| PUT | `/api/hose/inspections/:id/complete-action` | 対応完了 |
| GET | `/api/hose/inspections/export` | CSVエクスポート |

#### 活動日誌関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/activity-logs` | 活動記録一覧取得 |
| GET | `/api/activity-logs?limit=1` | 最新1件取得 |
| POST | `/api/activity-logs` | 活動記録追加 |
| PUT | `/api/activity-logs/:id/approve` | 承認 (未実装) |
| GET | `/api/activity-logs/export` | CSVエクスポート |

#### 団員関連

| メソッド | エンドポイント | 説明 |
|---------|--------------|------|
| GET | `/api/members` | 団員一覧取得 (レスポンス: `{members: [...]}`) |
| GET | `/api/users` | 団員一覧取得 (レスポンス: `{users: [...]}`) |
| POST | `/api/members` | 団員追加 |
| PUT | `/api/members/:id` | 団員更新 |
| DELETE | `/api/members/:id` | 団員削除 |
| GET | `/api/members/export` | CSVエクスポート |

**注意**: `/api/members`と`/api/users`は同じデータを返しますが、レスポンス形式が異なります。

### API共通仕様

#### リクエストヘッダー
```
Content-Type: application/json
```

#### レスポンス形式

**成功時**:
```json
{
  "success": true,
  "data": {...},
  "message": "Success"
}
```

**エラー時**:
```json
{
  "success": false,
  "error": "エラーメッセージ",
  "details": "詳細情報"
}
```

#### HTTPステータスコード
- 200: 成功
- 201: 作成成功
- 400: リクエストエラー
- 404: リソースが見つからない
- 500: サーバーエラー

#### エラーハンドリング

**フロントエンド**:
```javascript
try {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  const result = await response.json()
  
  if (response.ok && result.success) {
    // 成功処理
  } else {
    // エラー表示
    alert('エラー: ' + result.error)
  }
} catch (error) {
  alert('通信エラー: ' + error.message)
}
```

**バックエンド**:
```typescript
app.post('/api/endpoint', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    // 空文字列をnullに変換
    const toNullIfEmpty = (value: any) => value === '' ? null : value
    
    // データベース操作
    await env.DB.prepare('...').bind(...).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ success: false, error: errorMessage }, 500)
  }
})
```

---

## 🎨 デザイン仕様

### カラーパレット

**プライマリカラー**:
- 赤色 (消防団のイメージ): `#EF5350` `#E53935`
- 青色 (信頼感): `#2196F3` `#1976D2`

**セカンダリカラー**:
- オレンジ: `#FF6F00` `#FF8F00`
- 緑色: `#66BB6A` `#43A047`
- 紫色: `#AB47BC` `#8E24AA`

**システムカラー**:
- グレー800: `#212121` (テキスト)
- グレー700: `#424242` (サブテキスト)
- グレー600: `#757575` (薄いテキスト)
- グレー100: `#F5F5F5` (背景)
- 白: `#FFFFFF`

**ステータスカラー**:
- 成功: `#4CAF50` (緑)
- 警告: `#FFC107` (黄)
- エラー: `#F44336` (赤)
- 情報: `#2196F3` (青)

### タイポグラフィ

**フォントファミリー**:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;
```

**フォントサイズ**:
- 大見出し: `text-3xl` (30px)
- 中見出し: `text-2xl` (24px)
- 小見出し: `text-xl` (20px)
- 本文: `text-base` (16px)
- 小さい文字: `text-sm` (14px)

**注意**: すべてのinput/select/textareaは`font-size: 16px !important`を指定してiOSのズームを防止

### レイアウト

**コンテナ幅**:
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}
```

**グリッドレイアウト**:
```css
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}
```

**レスポンシブブレークポイント**:
- モバイル: `< 640px`
- タブレット: `640px - 1024px`
- デスクトップ: `> 1024px`

### コンポーネントスタイル

**カード**:
```css
.card {
  background: white;
  border-radius: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}
```

**ボタン**:
```css
.button {
  min-height: 48px;
  padding: 0.75rem 1.5rem;
  border-radius: 0.5rem;
  font-weight: bold;
  font-size: 16px !important;
  transition: all 0.2s ease;
}

.button:active {
  transform: scale(0.98);
}
```

**グラデーション背景**:
```css
/* 赤系 */
.gradient-1 {
  background: linear-gradient(135deg, #ef5350 0%, #e53935 100%);
}

/* オレンジ系 */
.gradient-2 {
  background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
}

/* 青系 */
.gradient-3 {
  background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%);
}

/* 緑系 */
.gradient-4 {
  background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%);
}

/* 紫系 */
.gradient-5 {
  background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%);
}
```

### モバイル最適化

**タップ領域**:
- 最小サイズ: 48px × 48px
- タップハイライト無効化: `-webkit-tap-highlight-color: transparent;`

**フォントサイズ**:
- すべてのフォーム要素: 16px以上（iOSズーム防止）

**スクロール**:
- スムーズスクロール: `scroll-behavior: smooth;`
- オーバースクロール防止: `overscroll-behavior: contain;`

**アニメーション**:
```css
/* フローティングアニメーション */
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

.float-animation {
  animation: float 3s ease-in-out infinite;
}
```

---

## 🚀 デプロイメント

### 開発環境

**ローカル開発サーバー起動**:
```bash
# 1. ビルド
npm run build

# 2. PM2で起動
pm2 start ecosystem.config.cjs

# 3. サービス確認
curl http://localhost:3000

# 4. ログ確認
pm2 logs --nostream
```

**ecosystem.config.cjs**:
```javascript
module.exports = {
  apps: [{
    name: 'webapp',
    script: 'npx',
    args: 'wrangler pages dev dist --d1=webapp-production --local --ip 0.0.0.0 --port 3000',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    watch: false,
    instances: 1,
    exec_mode: 'fork'
  }]
}
```

**ローカルD1データベース**:
```bash
# マイグレーション適用
npm run db:migrate:local

# シードデータ投入
npm run db:seed

# データベースリセット
npm run db:reset

# SQLコンソール
npm run db:console:local
```

### 本番環境

**Cloudflare Pages デプロイ**:
```bash
# 1. ビルド
npm run build

# 2. デプロイ
npm run deploy:prod

# または直接
npx wrangler pages deploy dist --project-name oifire1
```

**デプロイURL**:
- Production: https://oifire1.pages.dev
- Preview: https://[commit-hash].oifire1.pages.dev

**環境変数設定**:
```bash
# Cloudflareダッシュボードで設定
# または wrangler CLI
npx wrangler pages secret put API_KEY --project-name oifire1
```

**本番D1データベース**:
```bash
# マイグレーション適用
npm run db:migrate:prod

# データベース操作
npm run db:console:prod
```

### CI/CD

**GitHub Actionsなし**: 手動デプロイのみ

**デプロイフロー**:
```
コード修正
  ↓
ローカルでテスト
  ↓
git commit
  ↓
npm run deploy:prod
  ↓
デプロイ完了
  ↓
本番確認
```

---

## 🛡️ セキュリティ

### 認証・認可

**現在の実装**:
- ログイン機能なし
- URLを知っている人は誰でもアクセス可能
- 記録時に名前を選択する方式

**セキュリティレベル**:
- 低（団内共有を前提）
- パスワード保護なし

**将来の実装予定**:
- パスワード保護
- 役割ベースのアクセス制御（管理者/一般団員）
- IPアドレス制限

### データ保護

**通信の暗号化**:
- すべての通信はHTTPS
- Cloudflareのエッジネットワークで保護

**データベースのセキュリティ**:
- Cloudflare D1の自動バックアップ
- 地理的冗長性
- アクセスログ記録

**入力検証**:
```typescript
// フロントエンド
if (!activityDate || !recorderName || !activityType) {
  alert('必須項目を入力してください')
  return
}

// バックエンド
const toNullIfEmpty = (value: any) => value === '' ? null : value

// SQLインジェクション対策
// D1のプリペアドステートメント使用
await env.DB.prepare('SELECT * FROM users WHERE id = ?')
  .bind(id)
  .all()
```

**XSS対策**:
- ユーザー入力は表示時にエスケープ
- innerHTML使用時は注意

**CSRF対策**:
- 現状なし（将来実装予定）

### データバックアップ

**自動バックアップ**:
- Cloudflare D1の自動バックアップ機能

**手動バックアップ**:
- CSVエクスポート機能
- 定期的なバックアップ推奨

**復元手順**:
```bash
# CSVからデータ復元
# 1. CSVファイルを準備
# 2. CSV一括登録機能で復元
```

---

## 📱 ブラウザ対応

### 対応ブラウザ

**モバイル**:
- Safari (iOS 14+)
- Chrome (Android 10+)

**デスクトップ**:
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+

### 必須機能

**JavaScript**:
- ES6+対応必須
- Fetch API
- Promise/async-await
- localStorage

**CSS**:
- Flexbox
- Grid
- CSS Variables
- Transforms & Transitions

---

## 🐛 既知の問題と制限事項

### 現在の制限事項

1. **認証機能なし**
   - 誰でもアクセス可能
   - データの改ざん防止なし

2. **写真アップロード未実装**
   - 点検時の写真記録不可
   - 活動記録の写真記録不可

3. **承認ワークフロー未実装**
   - 活動記録の承認機能あり（フラグのみ）
   - 実際の承認フローは未実装

4. **通知機能なし**
   - 点検期限のリマインドなし
   - 要対応事項の通知なし

5. **統計・レポート機能未実装**
   - 活動集計画面は未実装
   - グラフ表示なし

6. **オフライン対応なし**
   - インターネット接続必須
   - Service Workerなし

### 既知のバグ

**なし** (2025年11月7日現在)

---

## 🔮 今後の開発予定

### Phase 2 (短期)

1. **写真アップロード機能**
   - Cloudflare R2連携
   - 点検時の写真記録
   - 活動記録の写真記録

2. **承認ワークフロー**
   - 活動記録の承認・却下
   - 承認者の設定
   - 承認履歴の表示

3. **通知機能**
   - 点検期限のリマインド
   - 要対応事項の通知
   - プッシュ通知 or メール通知

### Phase 3 (中期)

1. **統計・レポート機能**
   - 活動集計画面
   - グラフ表示（Chart.js）
   - 月次/年次レポート

2. **認証機能**
   - ログイン機能
   - 役割ベースのアクセス制御
   - パスワード管理

3. **データ分析**
   - 活動傾向分析
   - 点検状況分析
   - ダッシュボード

### Phase 4 (長期)

1. **オフライン対応**
   - Service Worker
   - IndexedDB
   - バックグラウンド同期

2. **モバイルアプリ化**
   - PWA対応
   - ホーム画面追加
   - プッシュ通知

3. **他分団との連携**
   - 複数分団対応
   - データ共有
   - 統合ダッシュボード

---

## 📚 参考資料

### 使用ライブラリ

- **Hono**: https://hono.dev/
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Cloudflare D1**: https://developers.cloudflare.com/d1/
- **Tailwind CSS**: https://tailwindcss.com/
- **Leaflet**: https://leafletjs.com/

### 開発ドキュメント

- **Wrangler CLI**: https://developers.cloudflare.com/workers/wrangler/
- **TypeScript**: https://www.typescriptlang.org/
- **Vite**: https://vitejs.dev/

### マニュアル

- **ユーザーマニュアル作成指示書**: `/home/user/webapp/MANUAL_CREATION_GUIDE.md`

---

## 👥 プロジェクトメンバー

**開発者**: Claude (Anthropic)  
**依頼者**: 大井町消防団第一分団  
**開発期間**: 2025年11月  

---

## 📝 変更履歴

### v1.0 (2025年11月7日)
- 初回リリース
- ホース格納庫管理機能
- 点検管理機能
- 活動日誌機能
- 団員管理機能
- データエクスポート機能
- 自動計算機能（活動時間、走行距離、前回メーター）
- 地区情報追加
- エラーハンドリング改善

---

## 📧 問い合わせ

技術的な質問や不具合報告は、システム管理者にお問い合わせください。

---

**このドキュメントは随時更新されます。最終更新: 2025年11月7日**
