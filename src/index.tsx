import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
  IMAGES: R2Bucket
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==========================================
// ホーム画面（ログイン不要）
// ==========================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>活動記録</title>
    
    <!-- PWA用メタタグ -->
    <link rel="apple-touch-icon" href="/icon.png">
    <link rel="icon" type="image/png" href="/icon.png">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <meta name="apple-mobile-web-app-title" content="活動記録">
    <meta name="theme-color" content="#ef5350">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        .card-gradient-1 { background: linear-gradient(135deg, #ef5350 0%, #e53935 100%); }
        .card-gradient-2 { background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%); }
        .card-gradient-3 { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
        .card-gradient-4 { background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); }
        .card-gradient-5 { background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        
        .card-hover {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .card-hover:hover {
            transform: translateY(-10px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.2);
        }
    </style>
</head>
<body>
    <!-- ヘッダー -->
    <div class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-center space-x-4">
                <div class="text-6xl float-animation">🔥</div>
                <div class="text-gray-800 text-center">
                    <h1 class="text-3xl md:text-4xl font-bold">活動記録</h1>
                    <p class="text-lg text-gray-600">大井町消防団第一分団</p>
                </div>
            </div>
        </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-12">
        <!-- 機能カード -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <!-- ホース点検 -->
            <a href="/inspection-priority" class="card-gradient-1 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">⚠️</div>
                    <h2 class="text-xl font-bold mb-2 text-center">ホース点検</h2>
                    <p class="text-center opacity-90 text-sm">要点検のホース格納庫を確認</p>
                </div>
            </a>

            <!-- 要対応事項一覧 -->
            <a href="/action-required" class="card-gradient-2 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">🚨</div>
                    <h2 class="text-xl font-bold mb-2 text-center">要対応事項</h2>
                    <p class="text-center opacity-90 text-sm">対応が必要な項目一覧</p>
                </div>
            </a>

            <!-- 活動日誌 -->
            <a href="/logs" class="card-gradient-3 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">📝</div>
                    <h2 class="text-xl font-bold mb-2 text-center">活動日誌</h2>
                    <p class="text-center opacity-90 text-sm">活動・訓練の記録と承認</p>
                </div>
            </a>

            <!-- 団員管理 -->
            <a href="/members" class="card-gradient-4 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">👥</div>
                    <h2 class="text-xl font-bold mb-2 text-center">団員管理</h2>
                    <p class="text-center opacity-90 text-sm">団員情報の登録・編集</p>
                </div>
            </a>

            <!-- 活動集計 -->
            <a href="/stats" class="card-gradient-5 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">📊</div>
                    <h2 class="text-xl font-bold mb-2 text-center">活動集計</h2>
                    <p class="text-center opacity-90 text-sm">実績データ・グラフ表示</p>
                </div>
            </a>

            <!-- データ管理 -->
            <a href="/admin" class="card-gradient-1 rounded-2xl shadow-2xl p-6 card-hover">
                <div class="text-white">
                    <div class="text-5xl mb-4 text-center">⚙️</div>
                    <h2 class="text-xl font-bold mb-2 text-center">データ管理</h2>
                    <p class="text-center opacity-90 text-sm">データ確認・バックアップ</p>
                </div>
            </a>
        </div>

        <!-- 使い方案内 -->
        <div class="mt-12 max-w-2xl mx-auto">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <p class="text-gray-800 text-center text-lg">
                    <strong>💡 使い方:</strong> 各カードをタップすると記録画面が開きます
                </p>
            </div>
        </div>
    </div>
</body>
</html>
  `)
})

// ==========================================
// API: 団員一覧取得
// ==========================================
// ==========================================
// API: 団員一覧取得
// ==========================================
app.get('/api/members', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    const result = await env.DB.prepare(`
      SELECT id, name, birth_date, join_date, created_at, updated_at
      FROM users
      ORDER BY join_date ASC, name ASC
    `).all()
    
    return c.json({ members: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ members: [] })
  }
})

// ==========================================
// API: 団員一覧取得 (users エイリアス)
// ==========================================
app.get('/api/users', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    const result = await env.DB.prepare(`
      SELECT id, name, birth_date, join_date, created_at, updated_at
      FROM users
      ORDER BY join_date ASC, name ASC
    `).all()
    
    return c.json({ users: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ users: [] })
  }
})

// ==========================================
// API: 団員追加
// ==========================================
app.post('/api/members', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'member_' + Date.now()
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      INSERT INTO users (
        id, name, birth_date, join_date,
        email, password_hash, role,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.name,
      data.birth_date,
      data.join_date,
      '',  // email (不要だが必須カラム)
      '',  // password_hash (不要だが必須カラム)
      'member',  // デフォルトrole
      now,
      now
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 団員更新
// ==========================================
app.put('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE users 
      SET name = ?,
          birth_date = ?,
          join_date = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.name,
      data.birth_date,
      data.join_date,
      now,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 団員削除
// ==========================================
app.delete('/api/members/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      DELETE FROM users WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 活動日誌一覧取得
// ==========================================
app.get('/api/activity-logs', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    const limitParam = c.req.query('limit')
    const limit = limitParam ? parseInt(limitParam) : null
    
    let query = `SELECT * FROM activity_logs ORDER BY activity_date DESC, created_at DESC`
    if (limit) {
      query += ` LIMIT ${limit}`
    }
    
    const result = await env.DB.prepare(query).all()
    
    return c.json({ logs: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ logs: [] })
  }
})

// ==========================================
// API: 活動日誌追加
// ==========================================
app.post('/api/activity-logs', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'log_' + Date.now()
    const now = new Date().toISOString()
    
    // 空文字列をnullに変換する関数
    const toNullIfEmpty = (value: any) => value === '' ? null : value
    
    await env.DB.prepare(`
      INSERT INTO activity_logs (
        id, activity_date, weather, recorder_name,
        location, activity_content, activity_type, activity_type_other,
        start_time, end_time, duration_hours,
        participants,
        previous_meter, current_meter, distance_km, fuel_liters,
        engine_check, battery_check, grease_supply, fuel_supply, oil_supply,
        fire_suits, boots, helmets, hoses, nozzles,
        water_discharge, vehicle_power_off_confirmed_by, radio_charge_confirmed_by,
        remarks, special_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id, 
      data.activity_date, 
      toNullIfEmpty(data.weather), 
      data.recorder_name,
      toNullIfEmpty(data.location), 
      toNullIfEmpty(data.activity_content), 
      data.activity_type, 
      toNullIfEmpty(data.activity_type_other),
      toNullIfEmpty(data.start_time), 
      toNullIfEmpty(data.end_time), 
      data.duration_hours,
      JSON.stringify(data.participants || []),
      data.previous_meter, 
      data.current_meter, 
      data.distance_km, 
      data.fuel_liters,
      toNullIfEmpty(data.engine_check), 
      toNullIfEmpty(data.battery_check), 
      toNullIfEmpty(data.grease_supply), 
      toNullIfEmpty(data.fuel_supply), 
      toNullIfEmpty(data.oil_supply),
      data.fire_suits, 
      data.boots, 
      data.helmets, 
      data.hoses, 
      data.nozzles,
      toNullIfEmpty(data.water_discharge), 
      toNullIfEmpty(data.vehicle_power_off_confirmed_by), 
      toNullIfEmpty(data.radio_charge_confirmed_by),
      toNullIfEmpty(data.remarks), 
      null, // special_notes (現在フォームに存在しない)
      now, now
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Database error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ success: false, error: errorMessage }, 500)
  }
})

// ==========================================
// API: 活動日誌承認
// ==========================================
app.put('/api/activity-logs/:id/approve', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE activity_logs
      SET approval_status = 'approved',
          approved_by = ?,
          approved_at = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(data.approved_by, now, now, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 活動日誌更新
// ==========================================
app.put('/api/activity-logs/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    const toNullIfEmpty = (value: any) => value === '' ? null : value
    
    await env.DB.prepare(`
      UPDATE activity_logs SET
        activity_date = ?,
        weather = ?,
        recorder_name = ?,
        location = ?,
        activity_content = ?,
        activity_type = ?,
        activity_type_other = ?,
        start_time = ?,
        end_time = ?,
        duration_hours = ?,
        participants = ?,
        previous_meter = ?,
        current_meter = ?,
        distance_km = ?,
        fuel_liters = ?,
        engine_check = ?,
        battery_check = ?,
        grease_supply = ?,
        fuel_supply = ?,
        oil_supply = ?,
        fire_suits = ?,
        boots = ?,
        helmets = ?,
        hoses = ?,
        nozzles = ?,
        water_discharge = ?,
        vehicle_power_off_confirmed_by = ?,
        radio_charge_confirmed_by = ?,
        remarks = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      data.activity_date,
      toNullIfEmpty(data.weather),
      data.recorder_name,
      toNullIfEmpty(data.location),
      toNullIfEmpty(data.activity_content),
      data.activity_type,
      toNullIfEmpty(data.activity_type_other),
      toNullIfEmpty(data.start_time),
      toNullIfEmpty(data.end_time),
      data.duration_hours,
      JSON.stringify(data.participants || []),
      data.previous_meter,
      data.current_meter,
      data.distance_km,
      data.fuel_liters,
      toNullIfEmpty(data.engine_check),
      toNullIfEmpty(data.battery_check),
      toNullIfEmpty(data.grease_supply),
      toNullIfEmpty(data.fuel_supply),
      toNullIfEmpty(data.oil_supply),
      data.fire_suits,
      data.boots,
      data.helmets,
      data.hoses,
      data.nozzles,
      toNullIfEmpty(data.water_discharge),
      toNullIfEmpty(data.vehicle_power_off_confirmed_by),
      toNullIfEmpty(data.radio_charge_confirmed_by),
      toNullIfEmpty(data.remarks),
      now,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ success: false, error: errorMessage }, 500)
  }
})

// ==========================================
// API: 活動日誌削除
// ==========================================
app.delete('/api/activity-logs/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      DELETE FROM activity_logs WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// 未実装ページ（Coming Soon）
// ==========================================
const comingSoonPage = (title: string, icon: string) => {
  return `
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
    <div class="text-center">
        <div class="text-9xl mb-4">${icon}</div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">${title}</h1>
        <p class="text-xl text-gray-600 mb-8">準備中...</p>
        <a href="/" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition inline-block">
            ← ホームに戻る
        </a>
    </div>
</body>
</html>
  `
}

// ==========================================
// ホース格納庫管理画面
// ==========================================
app.get('/hose', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ホース格納庫管理 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <!-- SheetJS for Excel file reading -->
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        #map { height: 250px; width: 100%; }
        
        /* グラデーションカード */
        .storage-gradient-1 { background: linear-gradient(135deg, #ef5350 0%, #e53935 100%); }
        .storage-gradient-2 { background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%); }
        .storage-gradient-3 { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
        .storage-gradient-4 { background: linear-gradient(135deg, #66bb6a 0%, #43a047 100%); }
        .storage-gradient-5 { background: linear-gradient(135deg, #ab47bc 0%, #8e24aa 100%); }
        
        .storage-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            -webkit-tap-highlight-color: transparent;
        }
        .storage-card:active {
            transform: scale(0.98);
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        
        /* スマホ最適化 */
        input, textarea, select {
            font-size: 16px !important; /* iPhoneのズーム防止 */
        }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px; /* タップしやすいサイズ */
        }
    </style>
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <!-- ヘッダー -->
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <div class="mb-4">
                <h1 class="text-3xl font-bold mb-2 text-gray-800">🔧 ホース格納庫管理</h1>
                <p class="text-base text-gray-600">ホース格納庫の登録・地図設定・点検記録</p>
            </div>
            <div class="flex flex-col space-y-3">
                <button id="showAddModalBtn" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    ➕ ホース格納庫を追加
                </button>
                <button id="showUploadModalBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    📥 Excel/CSV一括登録
                </button>
                <button id="showDistrictUploadModalBtn" class="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    🏘️ 地区一括登録
                </button>
            </div>
        </div>

        <!-- ホース格納庫一覧 -->
        <div id="storageList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- JavaScriptで動的に生成 -->
        </div>
    </div>

    <!-- Excel/CSV一括登録モーダル -->
    <div id="uploadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-start justify-center p-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">📥 Excel/CSV一括登録</h2>
                <button id="closeUploadModalBtn" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div class="space-y-6">
                <!-- テンプレートダウンロード -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p class="text-blue-800 mb-3"><strong>📋 Step 1:</strong> テンプレートをダウンロード</p>
                    <div class="flex gap-3">
                        <button onclick="downloadExcelTemplate()" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition font-bold">
                            📊 Excelテンプレート
                        </button>
                        <button onclick="downloadCSVTemplate()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition font-bold">
                            📄 CSVテンプレート
                        </button>
                    </div>
                </div>

                <!-- 形式説明 -->
                <div class="bg-gray-50 p-4 rounded">
                    <p class="font-bold mb-2">📝 必要な列:</p>
                    <pre class="text-sm bg-white p-3 rounded border overflow-x-auto">ホース格納庫番号 | 場所の目安 | 地区 | 備考
No.01 | ◯◯公民館前 | 市場 | 2020年設置
No.02 | △△集会所裏 | 馬場 | 
No.03 | ××消防団詰所前 | 根岸下 | </pre>
                    <p class="text-sm text-gray-600 mt-2">💡 地区: 市場、馬場、根岸下、根岸上、宮地、坊村 のいずれか</p>
                    <p class="text-sm text-gray-600 mt-1">💡 Excel (.xlsx) または CSV (.csv) 形式に対応</p>
                </div>

                <!-- ファイル選択 -->
                <div>
                    <p class="font-bold mb-2"><strong>📂 Step 2:</strong> Excel/CSVファイルを選択</p>
                    <input type="file" id="csvFile" accept=".csv,.xlsx,.xls" class="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100">
                </div>

                <!-- アップロードボタン -->
                <div class="flex flex-col space-y-3">
                    <button id="uploadCSVBtn" class="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 一括登録する
                    </button>
                    <button id="cancelUploadModalBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
            </div>
        </div>
    </div>

    <!-- 地区一括登録モーダル -->
    <div id="districtUploadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-start justify-center p-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">🏘️ 地区一括登録</h2>
                <button id="closeDistrictUploadModalBtn" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div class="space-y-6">
                <!-- テンプレートダウンロード -->
                <div class="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
                    <p class="text-purple-800 mb-3"><strong>📋 Step 1:</strong> テンプレートをダウンロード</p>
                    <div class="flex gap-3">
                        <button onclick="downloadDistrictExcelTemplate()" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition font-bold">
                            📊 Excelテンプレート
                        </button>
                        <button onclick="downloadDistrictCSVTemplate()" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition font-bold">
                            📄 CSVテンプレート
                        </button>
                    </div>
                </div>

                <!-- 形式説明 -->
                <div class="bg-gray-50 p-4 rounded">
                    <p class="font-bold mb-2">📝 必要な列:</p>
                    <pre class="text-sm bg-white p-3 rounded border overflow-x-auto">地区名
市場
馬場
根岸下
根岸上
宮地
坊村</pre>
                    <p class="text-sm text-gray-600 mt-2">💡 地区名を1列に記入してください</p>
                    <p class="text-sm text-gray-600 mt-1">💡 Excel (.xlsx) または CSV (.csv) 形式に対応</p>
                </div>

                <!-- ファイル選択 -->
                <div>
                    <p class="font-bold mb-2"><strong>📂 Step 2:</strong> Excel/CSVファイルを選択</p>
                    <input type="file" id="districtFile" accept=".csv,.xlsx,.xls" class="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-purple-50 file:text-purple-700
                        hover:file:bg-purple-100">
                </div>

                <!-- アップロードボタン -->
                <div class="flex flex-col space-y-3">
                    <button id="uploadDistrictBtn" class="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 地区を一括登録する
                    </button>
                    <button id="cancelDistrictUploadModalBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
            </div>
        </div>
    </div>

    <!-- 格納庫追加/編集モーダル -->
    <div id="addModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-start justify-center p-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800" id="modalTitle">📦 ホース格納庫を追加</h2>
                <button id="closeAddModalBtn" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form id="storageForm" class="space-y-6">
                <input type="hidden" id="storageId" value="">

                <!-- 格納庫番号 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏷️ ホース格納庫番号 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="storageNumber" required
                        placeholder="No.01"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                </div>

                <!-- 場所の目安 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📍 場所の目安 <span class="text-red-500">*</span>
                    </label>
                    <input type="text" id="location" required
                        placeholder="◯◯公民館前"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                </div>

                <!-- 地区 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏘️ 地区
                    </label>
                    <select id="district"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                        <option value="">地区を選択してください</option>
                        <option value="市場">市場</option>
                        <option value="馬場">馬場</option>
                        <option value="根岸下">根岸下</option>
                        <option value="根岸上">根岸上</option>
                        <option value="宮地">宮地</option>
                        <option value="坊村">坊村</option>
                    </select>
                </div>

                <!-- Google My Maps URL（任意） -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🗺️ Google My Maps URL（任意）
                    </label>
                    <input type="url" id="googleMapsUrl"
                        placeholder="https://www.google.com/maps/@35.3340353,139.1516114,14z"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    <p class="text-sm text-gray-600 mt-1">
                        💡 Google Mapsで場所を開き、URLをコピーして貼り付けてください
                    </p>
                </div>

                <!-- 地図で位置を設定（任意） -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🗺️ 地図で位置を設定（任意）
                    </label>
                    <div id="map" class="rounded-lg border-2 border-gray-300"></div>
                    <p class="text-sm text-gray-600 mt-2">
                        💡 地図をタップすると赤いピンが立ちます。位置設定は後からでも可能です。
                    </p>
                    <div id="coordsDisplay" class="hidden mt-2 p-3 bg-green-50 rounded">
                        <p class="text-sm text-green-800">
                            📍 位置設定完了: <span id="latDisplay"></span>, <span id="lngDisplay"></span>
                        </p>
                    </div>
                </div>

                <!-- 備考 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📝 備考
                    </label>
                    <textarea id="remarks" rows="3"
                        placeholder="2020年設置、扉に破損あり 等"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"></textarea>
                </div>

                <!-- 画像アップロード -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📷 格納庫の写真（任意）
                    </label>
                    <input type="file" id="storageImage" accept="image/*"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    <p class="text-sm text-gray-600 mt-1">
                        💡 格納庫の外観や破損状況の写真をアップロードできます
                    </p>
                    <input type="hidden" id="imageUrl" value="">
                    <div id="imagePreview" class="hidden mt-4">
                        <img id="previewImg" src="" alt="Preview" class="w-full h-64 object-cover rounded-lg">
                        <button type="button" id="clearImageBtn" class="mt-2 text-red-500 hover:text-red-700 text-sm">
                            🗑️ 画像を削除
                        </button>
                    </div>
                </div>

                <!-- ボタン -->
                <div class="flex flex-col space-y-3">
                    <button type="button" id="saveStorageBtn" class="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 保存する
                    </button>
                    <button type="button" id="cancelAddModalBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </form>
            </div>
        </div>
    </div>

    <!-- ホース格納庫詳細モーダル（地図表示） -->
    <div id="detailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800" id="detailTitle"></h2>
                <button id="closeDetailModalBtn" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div id="detailContent"></div>
        </div>
    </div>

    <script>
        let storages = [];
        let map, marker;
        let currentLat = null, currentLng = null;

        // ページ読み込み時
        window.onload = function() {
            loadStorages();
            
            // イベントリスナーを設定
            const showAddBtn = document.getElementById('showAddModalBtn');
            const showUploadBtn = document.getElementById('showUploadModalBtn');
            const showDistrictUploadBtn = document.getElementById('showDistrictUploadModalBtn');
            const closeAddBtn = document.getElementById('closeAddModalBtn');
            const closeUploadBtn = document.getElementById('closeUploadModalBtn');
            const closeDistrictUploadBtn = document.getElementById('closeDistrictUploadModalBtn');
            const closeDetailBtn = document.getElementById('closeDetailModalBtn');
            const saveStorageBtn = document.getElementById('saveStorageBtn');
            const cancelAddBtn = document.getElementById('cancelAddModalBtn');
            const uploadCSVBtn = document.getElementById('uploadCSVBtn');
            const cancelUploadBtn = document.getElementById('cancelUploadModalBtn');
            const uploadDistrictBtn = document.getElementById('uploadDistrictBtn');
            const cancelDistrictUploadBtn = document.getElementById('cancelDistrictUploadModalBtn');
            const clearImageBtn = document.getElementById('clearImageBtn');
            const storageImageInput = document.getElementById('storageImage');
            
            if (showAddBtn) showAddBtn.addEventListener('click', showAddModal);
            if (showUploadBtn) showUploadBtn.addEventListener('click', showUploadModal);
            if (showDistrictUploadBtn) showDistrictUploadBtn.addEventListener('click', showDistrictUploadModal);
            if (closeAddBtn) closeAddBtn.addEventListener('click', hideAddModal);
            if (closeUploadBtn) closeUploadBtn.addEventListener('click', hideUploadModal);
            if (closeDistrictUploadBtn) closeDistrictUploadBtn.addEventListener('click', hideDistrictUploadModal);
            if (closeDetailBtn) closeDetailBtn.addEventListener('click', hideDetailModal);
            if (saveStorageBtn) saveStorageBtn.addEventListener('click', saveStorage);
            if (cancelAddBtn) cancelAddBtn.addEventListener('click', hideAddModal);
            if (uploadCSVBtn) uploadCSVBtn.addEventListener('click', uploadFile);
            if (cancelUploadBtn) cancelUploadBtn.addEventListener('click', hideUploadModal);
            if (uploadDistrictBtn) uploadDistrictBtn.addEventListener('click', uploadDistrictFile);
            if (cancelDistrictUploadBtn) cancelDistrictUploadBtn.addEventListener('click', hideDistrictUploadModal);
            if (clearImageBtn) clearImageBtn.addEventListener('click', clearImage);
            if (storageImageInput) storageImageInput.addEventListener('change', previewImage);
        };

        // ホース格納庫一覧を読み込み
        async function loadStorages() {
            try {
                const response = await fetch('/api/hose/storages');
                const data = await response.json();
                storages = data.storages || [];
                renderStorages();
            } catch (error) {
                console.error('Error loading storages:', error);
            }
        }

        // ホース格納庫一覧を表示
        function renderStorages() {
            const list = document.getElementById('storageList');
            
            if (storages.length === 0) {
                list.innerHTML = \`
                    <div class="col-span-full text-center py-16">
                        <div class="bg-white rounded-2xl shadow-lg p-12">
                            <div class="text-8xl mb-6">📦</div>
                            <p class="text-2xl text-gray-800 font-bold mb-4">まだホース格納庫が登録されていません</p>
                            <p class="text-gray-600 mb-8">CSV一括登録または個別追加でホース格納庫を登録しましょう</p>
                            <button onclick="showUploadModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition mr-2 shadow-lg font-bold">
                                📥 CSV一括登録
                            </button>
                            <button onclick="showAddModal()" class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition shadow-lg font-bold">
                                ➕ ホース格納庫を追加
                            </button>
                        </div>
                    </div>
                \`;
                return;
            }

            const gradients = ['storage-gradient-1', 'storage-gradient-2', 'storage-gradient-3', 'storage-gradient-4', 'storage-gradient-5'];
            list.innerHTML = storages.map((storage, index) => {
                const gradient = gradients[index % 5];
                return '<div class="' + gradient + ' rounded-2xl shadow-2xl p-6 storage-card" onclick="location.href=\\'/storage/' + storage.id + '\\'">' +
                    '<div class="text-white">' +
                        '<div class="flex justify-between items-start mb-4">' +
                            '<h3 class="text-2xl font-bold">📦 ' + storage.storage_number + '</h3>' +
                            (storage.latitude ? '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">📍 地図設定済み</span>' : '<span class="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">⚠️ 地図未設定</span>') +
                        '</div>' +
                        (storage.image_url ? 
                            '<div class="mb-4">' +
                                '<img src="' + storage.image_url + '" alt="格納庫写真" class="w-full h-48 object-cover rounded-lg border-2 border-white border-opacity-50">' +
                            '</div>' : ''
                        ) +
                        '<p class="text-lg mb-2 font-semibold">📍 ' + storage.location + '</p>' +
                        (storage.district ? '<p class="opacity-90 mb-2">🏘️ ' + storage.district + '</p>' : '') +
                        (storage.remarks ? '<p class="opacity-80 text-sm mb-4">💬 ' + storage.remarks + '</p>' : '') +
                        '<div class="flex flex-col space-y-2 mt-6">' +
                            '<button onclick="event.stopPropagation(); location.href=\\'/storage/' + storage.id + '\\'" class="w-full bg-white bg-opacity-40 hover:bg-opacity-50 backdrop-blur-sm px-4 py-4 rounded-xl text-lg font-bold transition border border-white border-opacity-50">' +
                                '📝 点検する' +
                            '</button>' +
                            (storage.google_maps_url ? 
                                '<button onclick="event.stopPropagation(); window.open(\\'' + storage.google_maps_url + '\\', \\'_blank\\')" class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-3 rounded-lg text-base font-semibold transition border border-white border-opacity-50">' +
                                    '🗺️ Google Maps' +
                                '</button>' : ''
                            ) +
                            '<button onclick="event.stopPropagation(); editStorage(\\'' + storage.id + '\\')" class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-3 rounded-lg text-base font-semibold transition border border-white border-opacity-50">' +
                                '✏️ 編集' +
                            '</button>' +
                            '<button onclick="event.stopPropagation(); deleteStorage(\\'' + storage.id + '\\', \\'' + storage.storage_number + '\\')" class="w-full bg-red-500 bg-opacity-80 hover:bg-opacity-90 backdrop-blur-sm px-4 py-3 rounded-lg text-base font-semibold transition border border-white border-opacity-50">' +
                                '🗑️ 削除' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        // CSV一括登録モーダル表示
        function showUploadModal() {
            document.getElementById('uploadModal').classList.remove('hidden');
        }

        function hideUploadModal() {
            document.getElementById('uploadModal').classList.add('hidden');
        }

        function showDistrictUploadModal() {
            document.getElementById('districtUploadModal').classList.remove('hidden');
        }

        function hideDistrictUploadModal() {
            document.getElementById('districtUploadModal').classList.add('hidden');
        }

        // Excel/CSVファイルアップロード（格納庫）
        async function uploadFile() {
            const fileInput = document.getElementById('csvFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Excel/CSVファイルを選択してください');
                return;
            }

            const fileName = file.name.toLowerCase();
            const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            const isCSV = fileName.endsWith('.csv');

            if (!isExcel && !isCSV) {
                alert('Excel (.xlsx) または CSV (.csv) ファイルを選択してください');
                return;
            }

            try {
                let storagesData = [];

                if (isExcel) {
                    // Excelファイルの場合
                    const arrayBuffer = await file.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    // ヘッダー行をスキップして解析
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row && row[0] && row[1]) {
                            storagesData.push({
                                storage_number: String(row[0]).trim(),
                                location: String(row[1]).trim(),
                                district: row[2] ? String(row[2]).trim() : '',
                                remarks: row[3] ? String(row[3]).trim() : ''
                            });
                        }
                    }
                } else {
                    // CSVファイルの場合
                    const text = await file.text();
                    const lines = text.split('\\n');

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        const [storageNumber, location, district, remarks] = line.split(',');
                        if (storageNumber && location) {
                            storagesData.push({
                                storage_number: storageNumber.trim(),
                                location: location.trim(),
                                district: district ? district.trim() : '',
                                remarks: remarks ? remarks.trim() : ''
                            });
                        }
                    }
                }

                if (storagesData.length === 0) {
                    alert('有効なデータが見つかりませんでした');
                    return;
                }

                const response = await fetch('/api/hose/storages/bulk', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storages: storagesData })
                });

                const result = await response.json();
                alert(\`\${result.count}件のホース格納庫を登録しました！\`);
                hideUploadModal();
                loadStorages();
            } catch (error) {
                alert('登録中にエラーが発生しました: ' + error.message);
                console.error(error);
            }
        }

        // Excel/CSVファイルアップロード（地区）
        async function uploadDistrictFile() {
            const fileInput = document.getElementById('districtFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('Excel/CSVファイルを選択してください');
                return;
            }

            const fileName = file.name.toLowerCase();
            const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            const isCSV = fileName.endsWith('.csv');

            if (!isExcel && !isCSV) {
                alert('Excel (.xlsx) または CSV (.csv) ファイルを選択してください');
                return;
            }

            try {
                let districts = [];

                if (isExcel) {
                    // Excelファイルの場合
                    const arrayBuffer = await file.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                    // ヘッダー行をスキップして解析
                    for (let i = 1; i < jsonData.length; i++) {
                        const row = jsonData[i];
                        if (row && row[0]) {
                            districts.push(String(row[0]).trim());
                        }
                    }
                } else {
                    // CSVファイルの場合
                    const text = await file.text();
                    const lines = text.split('\\n');

                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (line) {
                            districts.push(line.split(',')[0].trim());
                        }
                    }
                }

                if (districts.length === 0) {
                    alert('有効な地区データが見つかりませんでした');
                    return;
                }

                // 地区selectに追加
                const districtSelect = document.getElementById('district');
                const existingOptions = Array.from(districtSelect.options).map(opt => opt.value);
                
                let addedCount = 0;
                districts.forEach(district => {
                    if (!existingOptions.includes(district)) {
                        const option = document.createElement('option');
                        option.value = district;
                        option.textContent = district;
                        districtSelect.appendChild(option);
                        addedCount++;
                    }
                });

                alert(\`\${addedCount}件の地区を追加しました！\\n（重複は除外されました）\`);
                hideDistrictUploadModal();
            } catch (error) {
                alert('登録中にエラーが発生しました: ' + error.message);
                console.error(error);
            }
        }

        // Excelテンプレートダウンロード（格納庫）
        function downloadExcelTemplate() {
            const wb = XLSX.utils.book_new();
            const data = [
                ['ホース格納庫番号', '場所の目安', '地区', '備考'],
                ['No.01', '◯◯公民館前', '市場', '2020年設置'],
                ['No.02', '△△集会所裏', '馬場', ''],
                ['No.03', '××消防団詰所前', '根岸下', ''],
                ['No.04', '', '根岸上', ''],
                ['No.05', '', '宮地', ''],
                ['No.06', '', '坊村', ''],
                ['No.07', '', '', ''],
                ['No.08', '', '', ''],
                ['No.09', '', '', ''],
                ['No.10', '', '', ''],
                ['No.11', '', '', ''],
                ['No.12', '', '', '']
            ];
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, 'ホース格納庫');
            XLSX.writeFile(wb, 'hose_storages_template.xlsx');
        }

        // CSVテンプレートダウンロード（格納庫）
        function downloadCSVTemplate() {
            const csv = 'ホース格納庫番号,場所の目安,地区,備考\\n' +
                        'No.01,◯◯公民館前,市場,2020年設置\\n' +
                        'No.02,△△集会所裏,馬場,\\n' +
                        'No.03,××消防団詰所前,根岸下,\\n' +
                        'No.04,,根岸上,\\n' +
                        'No.05,,宮地,\\n' +
                        'No.06,,坊村,\\n' +
                        'No.07,,,\\n' +
                        'No.08,,,\\n' +
                        'No.09,,,\\n' +
                        'No.10,,,\\n' +
                        'No.11,,,\\n' +
                        'No.12,,,';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'hose_storages_template.csv';
            link.click();
        }

        // Excelテンプレートダウンロード（地区）
        function downloadDistrictExcelTemplate() {
            const wb = XLSX.utils.book_new();
            const data = [
                ['地区名'],
                ['市場'],
                ['馬場'],
                ['根岸下'],
                ['根岸上'],
                ['宮地'],
                ['坊村']
            ];
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, '地区一覧');
            XLSX.writeFile(wb, 'districts_template.xlsx');
        }

        // CSVテンプレートダウンロード（地区）
        function downloadDistrictCSVTemplate() {
            const csv = '地区名\\n市場\\n馬場\\n根岸下\\n根岸上\\n宮地\\n坊村';
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'districts_template.csv';
            link.click();
        }

        // ホース格納庫追加モーダル表示
        function showAddModal() {
            document.getElementById('modalTitle').textContent = '📦 ホース格納庫を追加';
            document.getElementById('storageForm').reset();
            document.getElementById('storageId').value = '';
            currentLat = null;
            currentLng = null;
            document.getElementById('coordsDisplay').classList.add('hidden');
            document.getElementById('addModal').classList.remove('hidden');
            
            setTimeout(() => {
                initMap();
            }, 100);
        }

        function hideAddModal() {
            document.getElementById('addModal').classList.add('hidden');
            document.getElementById('storageForm').reset();
            clearImage();
            if (map) {
                map.remove();
                map = null;
            }
        }

        // 地図初期化
        function initMap(lat = 35.3604, lng = 139.1386) {
            if (map) map.remove();
            
            map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // 地図クリックで位置設定
            map.on('click', function(e) {
                currentLat = e.latlng.lat;
                currentLng = e.latlng.lng;
                
                if (marker) map.removeLayer(marker);
                marker = L.marker([currentLat, currentLng]).addTo(map);
                
                document.getElementById('coordsDisplay').classList.remove('hidden');
                document.getElementById('latDisplay').textContent = currentLat.toFixed(6);
                document.getElementById('lngDisplay').textContent = currentLng.toFixed(6);
            });

            // 既存の位置情報があれば表示
            if (currentLat && currentLng) {
                marker = L.marker([currentLat, currentLng]).addTo(map);
                map.setView([currentLat, currentLng], 17);
            }
        }

        // ホース格納庫削除
        async function deleteStorage(id, storageNumber) {
            if (!confirm('本当に「' + storageNumber + '」を削除しますか？\\n\\nこの操作は取り消せません。')) {
                return;
            }

            try {
                const response = await fetch('/api/hose/storages/' + id, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('削除しました');
                    loadStorages();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('削除中にエラーが発生しました');
            }
        }

        // ホース格納庫編集
        function editStorage(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage) return;

            document.getElementById('modalTitle').textContent = '✏️ 格納庫を編集';
            document.getElementById('storageId').value = storage.id;
            document.getElementById('storageNumber').value = storage.storage_number;
            document.getElementById('location').value = storage.location;
            document.getElementById('district').value = storage.district || '';
            document.getElementById('googleMapsUrl').value = storage.google_maps_url || '';
            document.getElementById('remarks').value = storage.remarks || '';
            
            // 既存画像の表示
            if (storage.image_url) {
                document.getElementById('imageUrl').value = storage.image_url;
                document.getElementById('previewImg').src = storage.image_url;
                document.getElementById('imagePreview').classList.remove('hidden');
            } else {
                clearImage();
            }
            
            currentLat = storage.latitude;
            currentLng = storage.longitude;
            
            if (currentLat && currentLng) {
                document.getElementById('coordsDisplay').classList.remove('hidden');
                document.getElementById('latDisplay').textContent = currentLat.toFixed(6);
                document.getElementById('lngDisplay').textContent = currentLng.toFixed(6);
            }

            document.getElementById('addModal').classList.remove('hidden');
            
            setTimeout(() => {
                if (currentLat && currentLng) {
                    initMap(currentLat, currentLng);
                } else {
                    initMap();
                }
            }, 100);
        }

        // 画像プレビュー
        function previewImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('previewImg').src = e.target.result;
                    document.getElementById('imagePreview').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }

        // 画像クリア
        function clearImage() {
            document.getElementById('storageImage').value = '';
            document.getElementById('imageUrl').value = '';
            document.getElementById('imagePreview').classList.add('hidden');
        }

        // 画像アップロード処理
        async function uploadImage() {
            const fileInput = document.getElementById('storageImage');
            if (!fileInput.files || !fileInput.files[0]) {
                return document.getElementById('imageUrl').value || null;
            }

            const formData = new FormData();
            formData.append('image', fileInput.files[0]);

            try {
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    return result.imageUrl;
                } else {
                    console.error('Image upload failed');
                    return null;
                }
            } catch (error) {
                console.error('Image upload error:', error);
                return null;
            }
        }

        // ホース格納庫保存
        async function saveStorage() {
            const id = document.getElementById('storageId').value;
            const storageNumber = document.getElementById('storageNumber').value;
            const location = document.getElementById('location').value;
            
            // 必須項目チェック
            if (!storageNumber || !location) {
                alert('ホース格納庫番号と場所の目安は必須です');
                return;
            }

            // 画像アップロード処理
            const imageUrl = await uploadImage();
            
            const data = {
                storage_number: storageNumber,
                location: location,
                district: document.getElementById('district').value,
                google_maps_url: document.getElementById('googleMapsUrl').value,
                latitude: currentLat,
                longitude: currentLng,
                remarks: document.getElementById('remarks').value,
                image_url: imageUrl
            };

            try {
                const url = id ? '/api/hose/storages/' + id : '/api/hose/storages';
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert(id ? '更新しました！' : '登録しました！');
                    hideAddModal();
                    loadStorages();
                } else {
                    alert('エラーが発生しました');
                }
            } catch (error) {
                alert('保存中にエラーが発生しました');
                console.error(error);
            }
        }

        // 地図で表示
        function viewOnMap(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage || !storage.latitude) return;

            const detailContent = document.getElementById('detailContent');
            let html = '<div class="space-y-4">';
            html += '<div class="bg-gray-50 p-4 rounded">';
            html += '<p class="font-bold">📍 ' + storage.location + '</p>';
            if (storage.district) {
                html += '<p class="text-gray-600">🏘️ ' + storage.district + '</p>';
            }
            html += '</div>';
            html += '<div id="detailMap" style="height: 400px; width: 100%;"></div>';
            html += '</div>';
            detailContent.innerHTML = html;

            document.getElementById('detailTitle').textContent = '🗺️ ' + storage.storage_number;
            document.getElementById('detailModal').classList.remove('hidden');

            setTimeout(() => {
                const detailMap = L.map('detailMap').setView([storage.latitude, storage.longitude], 17);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors'
                }).addTo(detailMap);
                L.marker([storage.latitude, storage.longitude]).addTo(detailMap);
            }, 100);
        }

        function hideDetailModal() {
            document.getElementById('detailModal').classList.add('hidden');
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: ホース格納庫一覧取得
// ==========================================
app.get('/api/hose/storages', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    const result = await env.DB.prepare(`
      SELECT * FROM hose_storages 
      ORDER BY storage_number ASC
    `).all()
    
    return c.json({ storages: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ storages: [] })
  }
})

// ==========================================
// API: ホース格納庫追加
// ==========================================
app.post('/api/hose/storages', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'storage_' + Date.now()
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      INSERT INTO hose_storages (
        id, storage_number, location, district,
        google_maps_url, latitude, longitude, remarks, image_url,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.storage_number,
      data.location,
      data.district || null,
      data.google_maps_url || null,
      data.latitude || null,
      data.longitude || null,
      data.remarks || null,
      data.image_url || null,
      now,
      now
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: 'Failed to save' }, 500)
  }
})

// ==========================================
// API: ホース格納庫更新
// ==========================================
app.put('/api/hose/storages/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE hose_storages 
      SET storage_number = ?,
          location = ?,
          district = ?,
          google_maps_url = ?,
          latitude = ?,
          longitude = ?,
          remarks = ?,
          image_url = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.storage_number,
      data.location,
      data.district || null,
      data.google_maps_url || null,
      data.latitude || null,
      data.longitude || null,
      data.remarks || null,
      data.image_url || null,
      now,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: 'Failed to update' }, 500)
  }
})

// ==========================================
// API: ホース格納庫削除
// ==========================================
app.delete('/api/hose/storages/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    // まず関連する点検記録も削除
    await env.DB.prepare(`
      DELETE FROM hose_inspections WHERE storage_id = ?
    `).bind(id).run()
    
    // 格納庫を削除
    await env.DB.prepare(`
      DELETE FROM hose_storages WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: 'Failed to delete' }, 500)
  }
})

// ==========================================
// API: 画像アップロード
// ==========================================
app.post('/api/upload-image', async (c) => {
  try {
    const env = c.env as { IMAGES: R2Bucket }
    const formData = await c.req.formData()
    const file = formData.get('image') as File
    
    if (!file) {
      return c.json({ success: false, error: 'No image provided' }, 400)
    }
    
    // ファイル名生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `storage_${timestamp}_${randomStr}.${extension}`
    
    // R2にアップロード
    const arrayBuffer = await file.arrayBuffer()
    await env.IMAGES.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type || 'image/jpeg'
      }
    })
    
    // 公開URLを返す（R2のPublic URLまたはCustom Domain経由）
    const imageUrl = `/api/images/${fileName}`
    
    return c.json({ success: true, imageUrl })
  } catch (error) {
    console.error('Image upload error:', error)
    return c.json({ success: false, error: 'Failed to upload image' }, 500)
  }
})

// ==========================================
// API: 画像取得（R2から配信）
// ==========================================
app.get('/api/images/:filename', async (c) => {
  try {
    const env = c.env as { IMAGES: R2Bucket }
    const filename = c.req.param('filename')
    
    const object = await env.IMAGES.get(filename)
    if (!object) {
      return c.notFound()
    }
    
    return new Response(object.body, {
      headers: {
        'Content-Type': object.httpMetadata?.contentType || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Image fetch error:', error)
    return c.notFound()
  }
})

// ==========================================
// API: CSV一括登録
// ==========================================
app.post('/api/hose/storages/bulk', async (c) => {
  try {
    const { storages } = await c.req.json()
    const env = c.env as { DB: D1Database }
    const now = new Date().toISOString()
    
    // トランザクション的に全件挿入
    for (const storage of storages) {
      const id = 'storage_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
      
      await env.DB.prepare(`
        INSERT INTO hose_storages (
          id, storage_number, location, district, remarks,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        storage.storage_number,
        storage.location,
        storage.district || null,
        storage.remarks || null,
        now,
        now
      ).run()
    }
    
    return c.json({ success: true, count: storages.length })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: 'Failed to bulk insert' }, 500)
  }
})

// ==========================================
// CSVテンプレート配信
// ==========================================
app.get('/templates/hose_storages_template.csv', (c) => {
  const csvContent = `ホース格納庫番号,場所の目安,地区,備考
No.01,大井町公民館前,市場,2020年設置
No.02,馬場集会所裏,馬場,扉に破損あり
No.03,根岸下消防団詰所,根岸下,
No.04,,,
No.05,,,
No.06,,,
No.07,,,
No.08,,,
No.09,,,
No.10,,,
No.11,,,
No.12,,,`
  
  return c.text(csvContent, 200, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': 'attachment; filename="hose_storages_template.csv"'
  })
})

// ==========================================
// データ管理画面
// ==========================================
app.get('/admin', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>データ管理 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        table { font-size: 0.875rem; }
        th { background: #f3f4f6; color: #1f2937; font-weight: 600; }
        td { color: #374151; }
        tr:hover { background: #f9fafb; }
        button { min-height: 48px; }
    </style>
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <!-- ヘッダー -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div class="text-gray-800 mb-6">
                <h1 class="text-4xl font-bold mb-2">⚙️ データ管理</h1>
                <p class="text-lg text-gray-600">データベース内容の確認とバックアップ</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <a href="/hose" class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition shadow-lg text-lg font-bold text-center">
                    🔧 ホース格納庫管理
                </a>
                <button onclick="downloadBackup()" class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition shadow-lg text-lg font-bold">
                    💾 バックアップをダウンロード
                </button>
            </div>
        </div>

        <!-- テーブル選択 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <label class="block text-gray-800 text-lg font-bold mb-4">📊 表示するテーブル:</label>
            <select id="tableSelect" onchange="loadTable()" class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 text-gray-800 font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-200" style="font-size: 16px;">
                <option value="hose_storages">ホース格納庫 (hose_storages)</option>
                <option value="hose_inspections">ホース点検記録 (hose_inspections)</option>
                <option value="activity_logs">活動日誌 (activity_logs)</option>
                <option value="users">団員情報 (users)</option>
            </select>
        </div>

        <!-- データ表示エリア -->
        <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800" id="tableName">ホース格納庫</h2>
                <button onclick="exportCSV()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-semibold">
                    📥 CSV出力
                </button>
            </div>
            <div class="overflow-x-auto">
                <div id="dataContainer" class="text-gray-800">
                    <p class="text-center py-8">データを読み込み中...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let currentData = [];
        let currentTable = 'hose_storages';

        // ページ読み込み時
        window.onload = function() {
            loadTable();
        };

        // テーブルデータ読み込み
        async function loadTable() {
            const select = document.getElementById('tableSelect');
            currentTable = select.value;
            const tableName = select.options[select.selectedIndex].text;
            document.getElementById('tableName').textContent = tableName;

            try {
                const response = await fetch('/api/admin/table/' + currentTable);
                const data = await response.json();
                currentData = data.rows || [];
                renderTable(currentData);
            } catch (error) {
                document.getElementById('dataContainer').innerHTML = 
                    '<p class="text-center py-8 text-red-600">データの読み込みに失敗しました</p>';
                console.error(error);
            }
        }

        // テーブル表示
        function renderTable(data) {
            const container = document.getElementById('dataContainer');
            
            if (data.length === 0) {
                container.innerHTML = '<p class="text-center py-8 text-gray-600">データがありません</p>';
                return;
            }

            const keys = Object.keys(data[0]);
            let html = '<table class="w-full border-collapse">';
            
            // ヘッダー
            html += '<thead><tr>';
            keys.forEach(key => {
                html += '<th class="border border-gray-300 px-4 py-2 text-left">' + key + '</th>';
            });
            html += '</tr></thead>';
            
            // データ行
            html += '<tbody>';
            data.forEach(row => {
                html += '<tr>';
                keys.forEach(key => {
                    const value = row[key] !== null ? row[key] : '';
                    html += '<td class="border border-gray-300 px-4 py-2">' + value + '</td>';
                });
                html += '</tr>';
            });
            html += '</tbody></table>';
            
            container.innerHTML = html;
        }

        // CSV出力
        function exportCSV() {
            if (currentData.length === 0) {
                alert('データがありません');
                return;
            }

            const keys = Object.keys(currentData[0]);
            let csv = keys.join(',') + '\\n';
            
            currentData.forEach(row => {
                const values = keys.map(key => {
                    const value = row[key] !== null ? row[key] : '';
                    return '"' + value + '"';
                });
                csv += values.join(',') + '\\n';
            });

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const dateStr = new Date().toISOString().split('T')[0];
            link.download = currentTable + '_' + dateStr + '.csv';
            link.click();
        }

        // バックアップダウンロード
        async function downloadBackup() {
            try {
                const response = await fetch('/api/admin/backup');
                const blob = await response.blob();
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                const dateStr = new Date().toISOString().split('T')[0];
                link.download = 'shobodan_backup_' + dateStr + '.sql';
                link.click();
                alert('バックアップファイルをダウンロードしました！このファイルをGoogleドライブに保存してください。');
            } catch (error) {
                alert('バックアップの作成に失敗しました');
                console.error(error);
            }
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: テーブルデータ取得
// ==========================================
app.get('/api/admin/table/:tableName', async (c) => {
  const tableName = c.req.param('tableName')
  
  // テーブル名のホワイトリストチェック
  const allowedTables = ['hose_storages', 'hose_inspections', 'activity_logs', 'users', 'training_records']
  if (!allowedTables.includes(tableName)) {
    return c.json({ error: 'Invalid table name' }, 400)
  }

  try {
    const env = c.env as { DB: D1Database }
    const result = await env.DB.prepare(`SELECT * FROM ${tableName} ORDER BY created_at DESC LIMIT 100`).all()
    return c.json({ rows: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ rows: [] })
  }
})

// ==========================================
// API: バックアップSQL生成
// ==========================================
app.get('/api/admin/backup', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    // 全テーブルのデータを取得してSQL形式で出力
    const tables = ['users', 'hose_storages', 'hose_inspections', 'activity_logs', 'training_records']
    const timestamp = new Date().toISOString()
    const dateStr = new Date().toISOString().split('T')[0]
    
    let sqlBackup = '-- 活動記録 データバックアップ\\n'
    sqlBackup += '-- 作成日時: ' + timestamp + '\\n\\n'

    for (const table of tables) {
      const result = await env.DB.prepare('SELECT * FROM ' + table).all()
      
      if (result.results.length > 0) {
        sqlBackup += '-- ' + table + ' テーブル\\n'
        
        const keys = Object.keys(result.results[0])
        const keysList = keys.join(', ')
        
        result.results.forEach((row: any) => {
          const values = keys.map(key => {
            const value = row[key]
            if (value === null) return 'NULL'
            if (typeof value === 'string') return "'" + value.replace(/'/g, "''") + "'"
            return value
          })
          sqlBackup += 'INSERT INTO ' + table + ' (' + keysList + ') VALUES (' + values.join(', ') + ');\\n'
        })
        
        sqlBackup += '\\n'
      }
    }

    return c.text(sqlBackup, 200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="shobodan_backup_' + dateStr + '.sql"'
    })
  } catch (error) {
    console.error('Backup error:', error)
    return c.text('-- Backup failed', 500)
  }
})

// ==========================================
// 点検優先度ページ
// ==========================================
app.get('/inspection-priority', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>点検優先度 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        .priority-high { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .priority-medium { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .priority-low { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
        }
    </style>
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-6">
        <!-- ヘッダー -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div class="text-gray-800">
                <h1 class="text-3xl font-bold mb-2">⚠️ 点検優先度</h1>
                <p class="text-base text-gray-600 mb-4">点検が必要なホース格納庫を確認しましょう</p>
                
                <!-- 検索バー -->
                <div class="mt-4">
                    <input type="text" id="searchInput" placeholder="🔍 格納庫番号、場所、地区で検索..." 
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                        style="font-size: 16px;"
                        oninput="searchStorages()">
                </div>
            </div>
        </div>

        <!-- おすすめ4件 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">⭐ おすすめ点検</h2>
            <p class="text-sm text-gray-600 mb-4">点検が古い格納庫と、同地区で点検が必要な格納庫</p>
            <div id="recommendedList" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-gray-50 rounded-xl p-8 text-center"><p class="text-gray-800">読み込み中...</p></div>
            </div>
        </div>

        <!-- 全格納庫一覧 -->
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h2 class="text-2xl font-bold text-gray-800 mb-4">📋 全格納庫一覧</h2>
            <p class="text-sm text-gray-600 mb-4">点検が古い順に表示</p>
            <div id="allStoragesList" class="space-y-4">
                <div class="bg-gray-50 rounded-xl p-8 text-center"><p class="text-gray-800">読み込み中...</p></div>
            </div>
        </div>
    </div>

    <script>
        let allStorages = [];
        let recommendedStorages = [];
        
        window.onload = function() {
            loadPriorityList();
        };

        async function loadPriorityList() {
            try {
                // おすすめ4件を取得
                const recommendedResponse = await fetch('/api/inspection/priority');
                const recommendedData = await recommendedResponse.json();
                recommendedStorages = recommendedData.storages || [];
                
                // 全件を取得
                const allResponse = await fetch('/api/inspection/priority-all');
                const allData = await allResponse.json();
                allStorages = allData.storages || [];
                
                renderRecommendedList(recommendedStorages);
                renderAllStoragesList(allStorages);
            } catch (error) {
                document.getElementById('recommendedList').innerHTML = 
                    '<div class="bg-gray-50 rounded-xl p-8 text-center col-span-full"><p class="text-gray-800">データの読み込みに失敗しました</p></div>';
                document.getElementById('allStoragesList').innerHTML = 
                    '<div class="bg-gray-50 rounded-xl p-8 text-center"><p class="text-gray-800">データの読み込みに失敗しました</p></div>';
                console.error(error);
            }
        }
        
        function searchStorages() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            if (!searchTerm) {
                renderRecommendedList(recommendedStorages);
                renderAllStoragesList(allStorages);
                return;
            }
            
            const filteredRecommended = recommendedStorages.filter(storage => {
                const storageNumber = (storage.storage_number || '').toLowerCase();
                const location = (storage.location || '').toLowerCase();
                const district = (storage.district || '').toLowerCase();
                
                return storageNumber.includes(searchTerm) || 
                       location.includes(searchTerm) || 
                       district.includes(searchTerm);
            });
            
            const filteredAll = allStorages.filter(storage => {
                const storageNumber = (storage.storage_number || '').toLowerCase();
                const location = (storage.location || '').toLowerCase();
                const district = (storage.district || '').toLowerCase();
                
                return storageNumber.includes(searchTerm) || 
                       location.includes(searchTerm) || 
                       district.includes(searchTerm);
            });
            
            renderRecommendedList(filteredRecommended);
            renderAllStoragesList(filteredAll);
        }

        function renderRecommendedList(storages) {
            const list = document.getElementById('recommendedList');
            
            if (storages.length === 0) {
                list.innerHTML = '<div class="bg-gray-50 rounded-xl p-8 text-center col-span-full"><p class="text-gray-800 text-xl">該当する格納庫がありません</p></div>';
                return;
            }

            list.innerHTML = storages.map(storage => {
                const daysAgo = storage.days_since_inspection;
                const lastResult = storage.last_inspection_result;
                let priorityClass = 'priority-low';
                let priorityText = '正常';
                let priorityIcon = '✅';
                
                // 最新の点検結果を最優先で判定
                if (lastResult === 'abnormal') {
                    priorityClass = 'priority-high';
                    priorityText = '異常あり';
                    priorityIcon = '🚨';
                } else if (lastResult === 'caution') {
                    priorityClass = 'priority-medium';
                    priorityText = '要注意';
                    priorityIcon = '⚠️';
                } else if (daysAgo === null || daysAgo > 180) {
                    priorityClass = 'priority-high';
                    priorityText = '要点検';
                    priorityIcon = '🚨';
                } else if (daysAgo > 90) {
                    priorityClass = 'priority-medium';
                    priorityText = '注意';
                    priorityIcon = '⚠️';
                } else if (lastResult === 'normal') {
                    priorityClass = 'priority-low';
                    priorityText = '正常';
                    priorityIcon = '✅';
                }

                const lastInspection = storage.last_inspection_date 
                    ? new Date(storage.last_inspection_date).toLocaleDateString('ja-JP')
                    : '未点検';
                
                return '<div class="' + priorityClass + ' rounded-2xl shadow-2xl p-6 cursor-pointer" onclick="location.href=\\'/storage/' + storage.id + '\\'">' +
                    '<div class="text-white">' +
                        '<div class="flex justify-between items-start mb-4">' +
                            '<div class="flex-1">' +
                                (storage.district ? '<p class="text-lg opacity-90 mb-1">' + storage.district + '</p>' : '') +
                                '<h3 class="text-2xl font-bold">' + storage.storage_number + ' | ' + storage.location + '</h3>' +
                            '</div>' +
                            '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full text-base font-bold border border-white border-opacity-50 ml-2">' + priorityIcon + ' ' + priorityText + '</span>' +
                        '</div>' +
                        '<p class="text-base opacity-90 mb-4">最終点検: ' + lastInspection + (daysAgo !== null ? ' (' + daysAgo + '日前)' : '') + '</p>' +
                        '<button class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-3 rounded-xl text-base font-semibold transition border border-white border-opacity-50">' +
                            '📝 点検する' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function renderAllStoragesList(storages) {
            const list = document.getElementById('allStoragesList');
            
            if (storages.length === 0) {
                list.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800 text-xl">ホース格納庫が登録されていません</p></div>';
                return;
            }

            list.innerHTML = storages.map(storage => {
                const daysAgo = storage.days_since_inspection;
                const lastResult = storage.last_inspection_result;
                let priorityClass = 'priority-low';
                let priorityText = '正常';
                let priorityIcon = '✅';
                
                // 最新の点検結果を最優先で判定
                if (lastResult === 'abnormal') {
                    // 異常あり → 最優先で赤
                    priorityClass = 'priority-high';
                    priorityText = '異常あり';
                    priorityIcon = '🚨';
                } else if (lastResult === 'caution') {
                    // 要注意 → 橙色
                    priorityClass = 'priority-medium';
                    priorityText = '要注意';
                    priorityIcon = '⚠️';
                } else if (lastResult === 'normal') {
                    // 正常 → 緑色(日数に関わらず)
                    priorityClass = 'priority-low';
                    priorityText = '正常';
                    priorityIcon = '✅';
                } else if (daysAgo === null) {
                    // 未点検 → 赤
                    priorityClass = 'priority-high';
                    priorityText = '未点検';
                    priorityIcon = '🚨';
                } else if (daysAgo > 180) {
                    // 180日以上 → 赤
                    priorityClass = 'priority-high';
                    priorityText = '要点検';
                    priorityIcon = '🚨';
                } else if (daysAgo > 90) {
                    // 90日以上 → 橙色
                    priorityClass = 'priority-medium';
                    priorityText = '点検推奨';
                    priorityIcon = '⚠️';
                }

                const lastInspection = storage.last_inspection_date 
                    ? new Date(storage.last_inspection_date).toLocaleDateString('ja-JP')
                    : '未点検';
                
                return '<div class="' + priorityClass + ' rounded-2xl shadow-2xl p-6 cursor-pointer" onclick="location.href=\\'/storage/' + storage.id + '\\'">' +
                    '<div class="text-white">' +
                        '<div class="flex justify-between items-start mb-4">' +
                            '<div class="flex-1">' +
                                (storage.district ? '<p class="text-lg opacity-90 mb-1">' + storage.district + '</p>' : '') +
                                '<h3 class="text-2xl font-bold">' + storage.storage_number + ' | ' + storage.location + '</h3>' +
                            '</div>' +
                            '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full text-base font-bold border border-white border-opacity-50 ml-2">' + priorityIcon + ' ' + priorityText + '</span>' +
                        '</div>' +
                        '<p class="text-base opacity-90 mb-4">最終点検: ' + lastInspection + (daysAgo !== null ? ' (' + daysAgo + '日前)' : '') + '</p>' +
                        '<button class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-3 rounded-xl text-base font-semibold transition border border-white border-opacity-50">' +
                            '📝 点検する' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: 全格納庫取得（点検が古い順）
// ==========================================
app.get('/api/inspection/priority-all', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        i.result as last_inspection_result,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date,
          hi1.result
        FROM hose_inspections hi1
        INNER JOIN (
          SELECT storage_id, MAX(inspection_date) as max_date
          FROM hose_inspections
          GROUP BY storage_id
        ) hi2 ON hi1.storage_id = hi2.storage_id AND hi1.inspection_date = hi2.max_date
      ) i ON s.id = i.storage_id
      ORDER BY 
        CASE 
          WHEN i.inspection_date IS NULL THEN 0
          ELSE 1
        END,
        i.inspection_date ASC
    `).all()
    
    return c.json({ storages: result.results || [] })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ storages: [] })
  }
})

// ==========================================
// API: 点検優先度取得（おすすめ4件）
// ==========================================
app.get('/api/inspection/priority', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    // 1. 全格納庫の最終点検日と結果を取得して、最優先のものを1件取得
    const topPriorityResult = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        i.result as last_inspection_result,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date,
          hi1.result
        FROM hose_inspections hi1
        INNER JOIN (
          SELECT storage_id, MAX(inspection_date) as max_date
          FROM hose_inspections
          GROUP BY storage_id
        ) hi2 ON hi1.storage_id = hi2.storage_id AND hi1.inspection_date = hi2.max_date
      ) i ON s.id = i.storage_id
      ORDER BY 
        CASE 
          WHEN i.inspection_date IS NULL THEN 0
          ELSE 1
        END,
        i.inspection_date ASC
      LIMIT 1
    `).first()
    
    if (!topPriorityResult) {
      return c.json({ storages: [] })
    }
    
    // 2. 同じ地区の格納庫で点検が古い順に3件取得（最優先のものは除く）
    const sameDistrictResult = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        i.result as last_inspection_result,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date,
          hi1.result
        FROM hose_inspections hi1
        INNER JOIN (
          SELECT storage_id, MAX(inspection_date) as max_date
          FROM hose_inspections
          GROUP BY storage_id
        ) hi2 ON hi1.storage_id = hi2.storage_id AND hi1.inspection_date = hi2.max_date
      ) i ON s.id = i.storage_id
      WHERE s.district = ? AND s.id != ?
      ORDER BY 
        CASE 
          WHEN i.inspection_date IS NULL THEN 0
          ELSE 1
        END,
        i.inspection_date ASC
      LIMIT 3
    `).bind(topPriorityResult.district || '', topPriorityResult.id).all()
    
    // 結果を結合（最優先1件 + 同地区3件）
    const storages = [topPriorityResult, ...(sameDistrictResult.results || [])]
    
    return c.json({ storages })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ storages: [] })
  }
})

// ==========================================
// ホース格納庫詳細・点検ページ（完全書き直し版）
// ==========================================
app.get('/storage/:id', async (c) => {
  const id = c.req.param('id')
  
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>格納庫詳細 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        input, textarea, select {
            font-size: 16px !important;
        }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
        }
        .modal-open {
            display: flex !important;
        }
        .modal-closed {
            display: none !important;
        }
    </style>
</head>
<body>
    <nav class="bg-white shadow-lg">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/inspection-priority" class="text-blue-600 hover:text-blue-800 hover:underline text-sm bg-blue-50 px-4 py-2 rounded-lg font-bold">
                    ← 優先度一覧
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div id="storageDetail" class="mb-6">
            <div class="bg-white rounded-2xl shadow-lg p-8 text-center"><p class="text-gray-800">読み込み中...</p></div>
        </div>

        <!-- タブ切り替え -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tabRecord" class="tab-btn flex-1 py-4 px-6 font-bold text-lg transition border-b-4 border-red-500 text-red-500">
                    📝 点検記録
                </button>
                <button id="tabHistory" class="tab-btn flex-1 py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    📋 点検履歴
                </button>
            </div>

            <!-- 点検記録タブ -->
            <div id="recordTab" class="p-6">
                <button id="showModalBtn" class="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                    📝 点検を記録する
                </button>
            </div>

            <!-- 点検履歴タブ -->
            <div id="historyTab" class="p-6 hidden">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">📋 点検履歴</h3>
                    <div id="inspectionHistory">
                        <p class="text-gray-600 text-center py-4">読み込み中...</p>
                    </div>
                </div>

                <div class="border-t pt-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">🚨 対応履歴</h3>
                    <div id="actionHistory">
                        <p class="text-gray-600 text-center py-4">読み込み中...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 点検記録モーダル -->
    <div id="inspectionModal" class="modal-closed fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-4 max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">📝 点検を記録</h2>
                <button id="closeModalBtn" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
            </div>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">👤 入力者 <span class="text-red-500">*</span></label>
                    <select id="inspectorName" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <option value="">選択してください</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📅 点検日 <span class="text-red-500">*</span></label>
                    <input type="date" id="inspectionDate" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">✅ 結果 <span class="text-red-500">*</span></label>
                    <select id="inspectionResult" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <option value="">選択してください</option>
                        <option value="normal">正常</option>
                        <option value="caution">要注意</option>
                        <option value="abnormal">異常あり</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📝 点検結果</label>
                    <textarea id="remarks" rows="3" placeholder="例：2本問題なし、2本廃棄" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-3">🚨 要対応事項（あれば）</label>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">要対応事項 1</label>
                            <textarea id="actionRequired1" rows="3" placeholder="例：格納庫扉の破損" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">要対応事項 2</label>
                            <textarea id="actionRequired2" rows="3" placeholder="例：ホース劣化" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                        </div>
                        <div>
                            <label class="block text-xs text-gray-600 mb-1">要対応事項 3</label>
                            <textarea id="actionRequired3" rows="3" placeholder="例：周辺草刈り必要" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                        </div>
                    </div>
                </div>

                <!-- 要対応事項の写真 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📷 要対応事項の写真（任意）</label>
                    <input type="file" id="inspectionImage" accept="image/*" multiple class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    <p class="text-sm text-gray-600 mt-1">
                        💡 対応が必要な箇所や気になる点の写真を複数枚アップロードできます
                    </p>
                    <div id="inspectionImagePreview" style="display:none;" class="mt-4 space-y-2">
                        <div id="previewImages" class="grid grid-cols-2 gap-2"></div>
                        <button type="button" id="clearImagesBtn" class="text-red-500 hover:text-red-700 text-sm">
                            🗑️ すべての画像を削除
                        </button>
                    </div>
                </div>

                <div class="flex flex-col space-y-3 pt-4">
                    <button type="button" id="saveBtn" class="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 保存する
                    </button>
                    <button type="button" id="cancelBtn" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 定数
        const STORAGE_ID = '${id}';
        let storageData = null;

        // DOM要素（グローバル変数）
        let modal, showModalBtn, closeModalBtn, cancelBtn, saveBtn, imageInput, clearImagesBtn;

        // モーダル表示
        function showModal() {
            modal.classList.remove('modal-closed');
            modal.classList.add('modal-open');
            // 背景のスクロールを無効化
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        }

        // モーダル非表示
        function hideModal() {
            modal.classList.remove('modal-open');
            modal.classList.add('modal-closed');
            // 背景のスクロールを復元
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        // タブ切り替え
        function switchTab(tabName) {
            const tabRecord = document.getElementById('tabRecord');
            const tabHistory = document.getElementById('tabHistory');
            const recordTab = document.getElementById('recordTab');
            const historyTab = document.getElementById('historyTab');

            if (tabName === 'record') {
                tabRecord.classList.add('border-red-500', 'text-red-500');
                tabRecord.classList.remove('border-transparent', 'text-gray-500');
                tabHistory.classList.remove('border-red-500', 'text-red-500');
                tabHistory.classList.add('border-transparent', 'text-gray-500');
                recordTab.classList.remove('hidden');
                historyTab.classList.add('hidden');
            } else {
                tabHistory.classList.add('border-red-500', 'text-red-500');
                tabHistory.classList.remove('border-transparent', 'text-gray-500');
                tabRecord.classList.remove('border-red-500', 'text-red-500');
                tabRecord.classList.add('border-transparent', 'text-gray-500');
                historyTab.classList.remove('hidden');
                recordTab.classList.add('hidden');
            }
        }

        // ページ読み込み完了後に初期化
        document.addEventListener('DOMContentLoaded', function() {
            // DOM要素の取得（ここでDOM準備完了してるから確実に取れる）
            modal = document.getElementById('inspectionModal');
            showModalBtn = document.getElementById('showModalBtn');
            closeModalBtn = document.getElementById('closeModalBtn');
            cancelBtn = document.getElementById('cancelBtn');
            saveBtn = document.getElementById('saveBtn');
            imageInput = document.getElementById('inspectionImage');
            clearImagesBtn = document.getElementById('clearImagesBtn');

            // タブ切り替えイベント
            document.getElementById('tabRecord').addEventListener('click', () => switchTab('record'));
            document.getElementById('tabHistory').addEventListener('click', () => switchTab('history'));

            // イベントリスナー設定（要素が確実に存在する状態で設定）
            if (showModalBtn) showModalBtn.addEventListener('click', showModal);
            if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
            if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
            if (modal) modal.addEventListener('click', hideModal);
            if (saveBtn) saveBtn.addEventListener('click', saveInspection);
            if (imageInput) imageInput.addEventListener('change', previewInspectionImages);
            if (clearImagesBtn) clearImagesBtn.addEventListener('click', clearInspectionImages);
            
            // デバッグ用
            console.log('showModalBtn:', showModalBtn);
            console.log('modal:', modal);

            // 初期値設定と読み込み
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('inspectionDate').value = today;
            
            loadMembers();
            loadStorageDetail();
            loadInspectionHistory();
            loadActionHistory();
        });

        // 団員一覧読み込み
        async function loadMembers() {
            try {
                const response = await fetch('/api/members');
                const data = await response.json();
                const select = document.getElementById('inspectorName');
                
                data.members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.name;
                    option.textContent = member.name;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Failed to load members:', error);
            }
        }

        // 格納庫詳細読み込み
        async function loadStorageDetail() {
            try {
                const response = await fetch('/api/hose/storages');
                const data = await response.json();
                storageData = data.storages.find(s => s.id === STORAGE_ID);
                
                if (storageData) {
                    document.getElementById('storageDetail').innerHTML = 
                        '<div class="bg-white rounded-2xl shadow-lg p-6">' +
                            '<h1 class="text-3xl font-bold text-gray-800 mb-4">📦 ' + storageData.storage_number + '</h1>' +
                            (storageData.image_url ? 
                                '<div class="mb-4">' +
                                    '<img src="' + storageData.image_url + '" alt="格納庫写真" class="w-full h-64 object-cover rounded-lg">' +
                                '</div>' : ''
                            ) +
                            '<p class="text-xl text-gray-700 mb-2">📍 ' + storageData.location + '</p>' +
                            (storageData.district ? '<p class="text-base text-gray-600 mb-2">🏘️ ' + storageData.district + '</p>' : '') +
                            (storageData.remarks ? '<p class="text-base text-gray-600 mb-2">💬 ' + storageData.remarks + '</p>' : '') +
                            (storageData.address ? '<p class="text-base text-gray-600">🏠 ' + storageData.address + '</p>' : '') +
                        '</div>';
                }
            } catch (error) {
                console.error(error);
            }
        }

        // 点検履歴読み込み
        async function loadInspectionHistory() {
            try {
                const response = await fetch('/api/inspection/history/' + STORAGE_ID);
                const data = await response.json();
                renderHistory(data.inspections || []);
            } catch (error) {
                document.getElementById('inspectionHistory').innerHTML = 
                    '<p class="text-gray-600 text-center py-4">読み込みエラー</p>';
            }
        }

        // 点検履歴表示
        function renderHistory(inspections) {
            const container = document.getElementById('inspectionHistory');
            
            if (inspections.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">まだ点検記録がありません</p>';
                return;
            }

            container.innerHTML = inspections.map(insp => {
                const date = new Date(insp.inspection_date).toLocaleDateString('ja-JP');
                const resultText = {normal: '正常', caution: '要注意', abnormal: '異常あり'}[insp.result] || insp.result;
                const resultColor = {normal: 'bg-green-500', caution: 'bg-yellow-500', abnormal: 'bg-red-500'}[insp.result] || 'bg-gray-500';
                
                // 写真がある場合はパース
                let photosHtml = '';
                if (insp.photos) {
                    try {
                        const photos = JSON.parse(insp.photos);
                        if (photos.length > 0) {
                            photosHtml = '<div class="mt-3"><p class="text-gray-700 text-sm font-semibold mb-2">📷 要対応事項の写真:</p>' +
                                '<div class="grid grid-cols-2 gap-2">' +
                                photos.map(url => '<img src="' + url + '" alt="点検写真" class="w-full h-32 object-cover rounded-lg cursor-pointer" onclick="window.open(&quot;' + url + '&quot;, &quot;_blank&quot;)">').join('') +
                                '</div></div>';
                        }
                    } catch (e) {
                        console.error('Failed to parse photos:', e);
                    }
                }
                
                return '<div class="bg-gray-50 border-l-4 ' + (resultColor.replace('bg-', 'border-')) + ' rounded-lg p-4 mb-3">' +
                    '<div class="flex justify-between items-start mb-2">' +
                        '<span class="text-gray-800 font-bold">' + date + '</span>' +
                        '<span class="' + resultColor + ' text-white px-3 py-1 rounded-full text-sm font-bold">' + resultText + '</span>' +
                    '</div>' +
                    (insp.inspector_name ? '<p class="text-gray-700 mb-2">👤 入力者: ' + insp.inspector_name + '</p>' : '') +
                    (insp.action_required ? '<p class="text-gray-700 mb-2">🚨 要対応: ' + insp.action_required + '</p>' : '') +
                    (insp.remarks ? '<p class="text-gray-600 text-sm mb-2">💬 ' + insp.remarks + '</p>' : '') +
                    photosHtml +
                    '<div class="flex gap-2 mt-3">' +
                        '<button onclick="editInspection(\\'' + insp.id + '\\')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-bold text-sm">' +
                            '✏️ 編集' +
                        '</button>' +
                        '<button onclick="deleteInspection(\\'' + insp.id + '\\')" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-bold text-sm">' +
                            '🗑️ 削除' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        // 対応履歴読み込み
        async function loadActionHistory() {
            try {
                const response = await fetch('/api/inspection/action-history/' + STORAGE_ID);
                const data = await response.json();
                renderActionHistory(data.actions || []);
            } catch (error) {
                document.getElementById('actionHistory').innerHTML = 
                    '<p class="text-gray-600 text-center py-4">読み込みエラー</p>';
            }
        }

        // 対応履歴表示
        function renderActionHistory(actions) {
            const container = document.getElementById('actionHistory');
            
            if (actions.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">対応履歴はありません</p>';
                return;
            }

            container.innerHTML = actions.map(action => {
                const inspectionDate = new Date(action.inspection_date).toLocaleDateString('ja-JP');
                const completedDate = new Date(action.action_completed_at).toLocaleDateString('ja-JP');
                
                // 写真がある場合はパース
                let photosHtml = '';
                if (action.photos) {
                    try {
                        const photos = JSON.parse(action.photos);
                        if (photos.length > 0) {
                            photosHtml = '<div class="mt-3"><p class="text-gray-700 text-sm font-semibold mb-2">📷 要対応事項の写真:</p>' +
                                '<div class="grid grid-cols-2 gap-2">' +
                                photos.map(url => '<img src="' + url + '" alt="点検写真" class="w-full h-32 object-cover rounded-lg cursor-pointer" onclick="window.open(&quot;' + url + '&quot;, &quot;_blank&quot;)">').join('') +
                                '</div></div>';
                        }
                    } catch (e) {
                        console.error('Failed to parse photos:', e);
                    }
                }
                
                return '<div class="bg-gray-50 rounded-lg p-4 mb-3 border border-gray-200">' +
                    '<div class="flex justify-between items-start mb-3">' +
                        '<span class="text-gray-800 font-bold">点検日: ' + inspectionDate + '</span>' +
                        '<span class="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-bold">✅ 完了</span>' +
                    '</div>' +
                    '<div class="bg-red-50 border-l-4 border-red-500 rounded p-3 mb-2">' +
                        '<p class="text-red-800 text-sm font-semibold mb-1">🚨 要対応内容:</p>' +
                        '<p class="text-gray-700 text-sm">' + action.action_required + '</p>' +
                    '</div>' +
                    '<div class="bg-green-50 border-l-4 border-green-500 rounded p-3 mb-2">' +
                        '<p class="text-green-800 text-sm font-semibold mb-1">✅ 対応内容:</p>' +
                        '<p class="text-gray-700 text-sm">' + (action.action_content || '記載なし') + '</p>' +
                    '</div>' +
                    photosHtml +
                    '<p class="text-gray-500 text-xs text-right mt-2">対応完了日: ' + completedDate + '</p>' +
                '</div>';
            }).join('');
        }

        // 画像プレビュー
        function previewInspectionImages(event) {
            const files = event.target.files;
            if (files.length > 0) {
                const container = document.getElementById('previewImages');
                container.innerHTML = '';
                
                Array.from(files).forEach((file, index) => {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const div = document.createElement('div');
                        div.innerHTML = '<img src="' + e.target.result + '" alt="Preview ' + (index + 1) + '" class="w-full h-32 object-cover rounded-lg">';
                        container.appendChild(div);
                    };
                    reader.readAsDataURL(file);
                });
                
                document.getElementById('inspectionImagePreview').style.display = 'block';
            }
        }

        // 画像クリア
        function clearInspectionImages() {
            document.getElementById('inspectionImage').value = '';
            document.getElementById('inspectionImagePreview').style.display = 'none';
            document.getElementById('previewImages').innerHTML = '';
        }

        // 画像アップロード
        async function uploadInspectionImages() {
            const fileInput = document.getElementById('inspectionImage');
            if (!fileInput.files || fileInput.files.length === 0) {
                return [];
            }

            const imageUrls = [];
            for (const file of fileInput.files) {
                const formData = new FormData();
                formData.append('image', file);

                try {
                    const response = await fetch('/api/upload-image', {
                        method: 'POST',
                        body: formData
                    });

                    if (response.ok) {
                        const result = await response.json();
                        imageUrls.push(result.imageUrl);
                    }
                } catch (error) {
                    console.error('Image upload error:', error);
                }
            }
            
            return imageUrls;
        }

        // 点検記録保存（新規作成と編集の両方に対応）
        async function saveInspection() {
            const inspectorName = document.getElementById('inspectorName').value;
            const date = document.getElementById('inspectionDate').value;
            const result = document.getElementById('inspectionResult').value;
            const actionRequired1 = document.getElementById('actionRequired1').value;
            const actionRequired2 = document.getElementById('actionRequired2').value;
            const actionRequired3 = document.getElementById('actionRequired3').value;
            const remarks = document.getElementById('remarks').value;
            
            // 3つの要対応事項を結合（空でないものだけ）
            const actionRequiredList = [actionRequired1, actionRequired2, actionRequired3].filter(item => item.trim() !== '');
            const actionRequired = actionRequiredList.length > 0 ? actionRequiredList.map((item, index) => '[' + (index + 1) + '] ' + item).join('\\n\\n') : null;

            if (!inspectorName || !date || !result) {
                alert('入力者、点検日、結果は必須です');
                return;
            }

            // 画像アップロード処理
            const imageUrls = await uploadInspectionImages();

            const data = {
                storage_id: STORAGE_ID,
                storage_number: storageData.storage_number,
                inspection_date: date,
                result: result,
                action_required: actionRequired || null,
                remarks: remarks || null,
                inspector_name: inspectorName,
                photos: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null
            };

            try {
                let response;
                if (currentEditingInspectionId) {
                    // 編集の場合
                    response = await fetch('/api/inspection/' + currentEditingInspectionId, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                } else {
                    // 新規作成の場合
                    response = await fetch('/api/inspection/record', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });
                }

                if (response.ok) {
                    alert(currentEditingInspectionId ? '点検記録を更新しました！' : '点検記録を保存しました！');
                    hideModal();
                    loadInspectionHistory();
                    loadActionHistory();
                    
                    // リセット
                    currentEditingInspectionId = null;
                    document.querySelector('#inspectionModal h2').textContent = '📝 点検を記録';
                    document.getElementById('inspectorName').value = '';
                    document.getElementById('inspectionResult').value = '';
                    document.getElementById('actionRequired1').value = '';
                    document.getElementById('actionRequired2').value = '';
                    document.getElementById('actionRequired3').value = '';
                    document.getElementById('remarks').value = '';
                    clearInspectionImages();
                } else {
                    alert('保存に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }

        // 点検記録編集
        let currentEditingInspectionId = null;
        async function editInspection(id) {
            currentEditingInspectionId = id;
            
            // 点検記録の詳細を取得
            try {
                const response = await fetch('/api/inspection/detail/' + id);
                const data = await response.json();
                const insp = data.inspection;
                
                if (!insp) {
                    alert('点検記録が見つかりません');
                    return;
                }
                
                // モーダルのタイトルを変更
                document.querySelector('#inspectionModal h2').textContent = '✏️ 点検記録を編集';
                
                // フォームに値をセット
                document.getElementById('inspectorName').value = insp.inspector_name || '';
                document.getElementById('inspectionDate').value = insp.inspection_date ? insp.inspection_date.split('T')[0] : '';
                document.getElementById('inspectionResult').value = insp.result || '';
                
                // 要対応事項を3つのフィールドに分割（[1], [2], [3]形式で保存されている場合）
                const actionRequired = insp.action_required || '';
                const actionItems = actionRequired.split('\\n\\n').map(item => {
                    // [1], [2], [3] などのプレフィックスを削除
                    const closeBracketIndex = item.indexOf(']');
                    if (item.startsWith('[') && closeBracketIndex > 0) {
                        return item.slice(closeBracketIndex + 1).trim();
                    }
                    return item;
                });
                document.getElementById('actionRequired1').value = actionItems[0] || '';
                document.getElementById('actionRequired2').value = actionItems[1] || '';
                document.getElementById('actionRequired3').value = actionItems[2] || '';
                
                document.getElementById('remarks').value = insp.remarks || '';
                
                // モーダル表示
                showModal();
            } catch (error) {
                alert('点検記録の読み込みに失敗しました');
                console.error(error);
            }
        }

        // 点検記録削除
        async function deleteInspection(id) {
            if (!confirm('この点検記録を削除しますか？\\n\\nこの操作は取り消せません。')) {
                return;
            }
            
            try {
                const response = await fetch('/api/inspection/' + id, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('削除しました');
                    loadInspectionHistory();
                    loadActionHistory();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }
    </script>
</body>
</html>
  `)
})


// ==========================================
// API: 点検履歴取得
// ==========================================
app.get('/api/inspection/history/:storageId', async (c) => {
  try {
    const storageId = c.req.param('storageId')
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT * FROM hose_inspections 
      WHERE storage_id = ?
      ORDER BY inspection_date DESC
      LIMIT 50
    `).bind(storageId).all()
    
    return c.json({ inspections: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ inspections: [] })
  }
})

// ==========================================
// API: 点検記録保存
// ==========================================
app.post('/api/inspection/record', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'inspection_' + Date.now()
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      INSERT INTO hose_inspections (
        id, storage_id, storage_number, inspection_date,
        result, action_required, remarks, photos,
        inspector_id, inspector_name,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.storage_id,
      data.storage_number,
      data.inspection_date,
      data.result,
      data.action_required || null,
      data.remarks || null,
      data.photos || null,
      'user_001',
      data.inspector_name,
      now,
      now
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 点検記録詳細取得
// ==========================================
app.get('/api/inspection/detail/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT * FROM hose_inspections WHERE id = ?
    `).bind(id).first()
    
    return c.json({ inspection: result })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ inspection: null }, 500)
  }
})

// ==========================================
// API: 点検記録更新
// ==========================================
app.put('/api/inspection/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE hose_inspections 
      SET inspection_date = ?,
          result = ?,
          action_required = ?,
          remarks = ?,
          photos = ?,
          inspector_name = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.inspection_date,
      data.result,
      data.action_required || null,
      data.remarks || null,
      data.photos || null,
      data.inspector_name,
      now,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// 要対応事項一覧ページ
// ==========================================
app.get('/action-required', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>要対応事項 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
        }
    </style>
</head>
<body>
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">🚨 要対応事項一覧</h1>
            <p class="text-base text-gray-600">対応が必要な項目を確認しましょう</p>
        </div>

        <div id="actionList" class="space-y-4">
            <div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800">読み込み中...</p></div>
        </div>
    </div>

    <!-- 対応完了モーダル -->
    <div id="completeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">✅ 対応完了</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📝 対応内容 <span class="text-red-500">*</span>
                    </label>
                    <textarea id="actionContent" rows="4" required
                        placeholder="実施した対応内容を記入してください"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"></textarea>
                </div>
                
                <div class="flex flex-col space-y-3">
                    <button onclick="submitComplete()" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 完了する
                    </button>
                    <button onclick="hideCompleteModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 編集モーダル -->
    <div id="editModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">✏️ 対応内容を編集</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📝 対応内容 <span class="text-red-500">*</span>
                    </label>
                    <textarea id="editActionContent" rows="4" required
                        placeholder="対応内容を入力してください"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"></textarea>
                </div>
                
                <div class="flex flex-col space-y-3">
                    <button onclick="submitEdit()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        ✅ 保存する
                    </button>
                    <button onclick="hideEditModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    </div>

    <script>
        window.onload = function() {
            loadActionRequired();
        };

        async function loadActionRequired() {
            try {
                const response = await fetch('/api/inspection/action-required');
                const data = await response.json();
                renderActionList(data.items || []);
            } catch (error) {
                document.getElementById('actionList').innerHTML = 
                    '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800">データの読み込みに失敗しました</p></div>';
                console.error(error);
            }
        }

        function renderActionList(items) {
            const list = document.getElementById('actionList');
            
            if (items.length === 0) {
                list.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800 text-xl">対応が必要な項目はありません</p></div>';
                return;
            }

            list.innerHTML = items.map(item => {
                const date = new Date(item.inspection_date).toLocaleDateString('ja-JP');
                const isCompleted = item.action_completed === 1;
                
                return '<div class="bg-white rounded-2xl shadow-lg p-6">' +
                    '<div class="flex justify-between items-start mb-4">' +
                        '<div class="flex-1">' +
                            '<h3 class="text-xl font-bold text-gray-800 mb-2">📦 ' + item.storage_number + ' - ' + item.location + '</h3>' +
                            '<p class="text-sm text-gray-600 mb-2">📅 点検日: ' + date + '</p>' +
                        '</div>' +
                        (isCompleted ? 
                            '<span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ml-2">✅ 対応済み</span>' :
                            '<span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ml-2">⚠️ 未対応</span>'
                        ) +
                    '</div>' +
                    '<div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">' +
                        '<p class="text-red-800 font-semibold mb-2">🚨 要対応内容:</p>' +
                        '<p class="text-gray-800">' + item.action_required + '</p>' +
                    '</div>' +
                    (isCompleted && item.action_content ? 
                        '<div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-4">' +
                            '<p class="text-green-800 font-semibold mb-2">✅ 対応内容:</p>' +
                            '<p class="text-gray-800">' + item.action_content + '</p>' +
                        '</div>' : ''
                    ) +
                    (!isCompleted ? 
                        '<button onclick="markCompleted(\\'' + item.id + '\\')" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition font-bold text-base mb-2">' +
                            '✅ 対応完了にする' +
                        '</button>' :
                        '<p class="text-gray-600 text-center mb-4">対応完了日: ' + new Date(item.action_completed_at).toLocaleDateString('ja-JP') + '</p>'
                    ) +
                    '<div class="grid grid-cols-2 gap-2">' +
                        '<button onclick="editAction(\\'' + item.id + '\\', \\'' + encodeURIComponent(item.action_content || '') + '\\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-bold">' +
                            '✏️ 編集' +
                        '</button>' +
                        '<button onclick="deleteAction(\\'' + item.id + '\\', \\'' + item.storage_number + '\\')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition font-bold">' +
                            '🗑️ 削除' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        let currentInspectionId = null;

        function markCompleted(inspectionId) {
            currentInspectionId = inspectionId;
            document.getElementById('actionContent').value = '';
            document.getElementById('completeModal').classList.remove('hidden');
        }

        function hideCompleteModal() {
            document.getElementById('completeModal').classList.add('hidden');
            currentInspectionId = null;
        }

        async function submitComplete() {
            const actionContent = document.getElementById('actionContent').value.trim();
            
            if (!actionContent) {
                alert('対応内容を入力してください');
                return;
            }

            try {
                const response = await fetch('/api/inspection/mark-completed/' + currentInspectionId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action_content: actionContent })
                });

                if (response.ok) {
                    alert('対応完了にしました！');
                    hideCompleteModal();
                    loadActionRequired();
                } else {
                    alert('更新に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }

        let currentEditInspectionId = null;

        function editAction(inspectionId, encodedContent) {
            const content = decodeURIComponent(encodedContent);
            currentEditInspectionId = inspectionId;
            document.getElementById('editActionContent').value = content;
            document.getElementById('editModal').classList.remove('hidden');
        }

        function hideEditModal() {
            document.getElementById('editModal').classList.add('hidden');
            currentEditInspectionId = null;
        }

        async function submitEdit() {
            const actionContent = document.getElementById('editActionContent').value.trim();
            
            if (!actionContent) {
                alert('対応内容を入力してください');
                return;
            }

            try {
                const response = await fetch('/api/inspection/mark-completed/' + currentEditInspectionId, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action_content: actionContent })
                });

                if (response.ok) {
                    alert('更新しました！');
                    hideEditModal();
                    loadActionRequired();
                } else {
                    alert('更新に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }

        async function deleteAction(inspectionId, storageNumber) {
            if (!confirm(storageNumber + 'の対応記録を削除しますか？')) {
                return;
            }

            try {
                const response = await fetch('/api/inspection/' + inspectionId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('削除しました！');
                    loadActionRequired();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: 要対応事項一覧取得
// ==========================================
app.get('/api/inspection/action-required', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT 
        i.*,
        s.location
      FROM hose_inspections i
      JOIN hose_storages s ON i.storage_id = s.id
      WHERE i.action_required IS NOT NULL 
        AND i.action_required != ''
      ORDER BY 
        i.action_completed ASC,
        i.inspection_date DESC
    `).all()
    
    return c.json({ items: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ items: [] })
  }
})

// ==========================================
// API: 対応履歴取得（特定の格納庫）
// ==========================================
app.get('/api/inspection/action-history/:storageId', async (c) => {
  try {
    const storageId = c.req.param('storageId')
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT *
      FROM hose_inspections
      WHERE storage_id = ?
        AND action_required IS NOT NULL 
        AND action_required != ''
        AND action_completed = 1
      ORDER BY action_completed_at DESC
      LIMIT 50
    `).bind(storageId).all()
    
    return c.json({ actions: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ actions: [] })
  }
})

// ==========================================
// API: 対応完了マーク
// ==========================================
app.put('/api/inspection/mark-completed/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE hose_inspections 
      SET action_completed = 1,
          action_completed_at = ?,
          action_content = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(now, data.action_content || null, now, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 点検記録削除
// ==========================================
app.delete('/api/inspection/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      DELETE FROM hose_inspections WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// 未実装ページ（Coming Soon）
// ==========================================
// ==========================================
// 活動日誌ページ
// ==========================================
app.get('/logs', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>活動日誌 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        button, input, select, textarea {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
            font-size: 16px !important;
        }
    </style>
</head>
<body>
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">📝 活動日誌</h1>
            <p class="text-base text-gray-600 mb-4">活動・訓練の記録管理</p>
            
            <button onclick="showAddModal()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                ➕ 活動を記録
            </button>
        </div>

        <div id="logsList" class="space-y-4">
            <p class="text-gray-800 text-center py-8">読み込み中...</p>
        </div>
    </div>

    <!-- 活動記録モーダル -->
    <div id="activityModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-start justify-center p-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6 my-8">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">📝 活動を記録</h2>
                    <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>

                <div class="space-y-4">
                    <!-- 基本情報 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">📅 活動日 <span class="text-red-500">*</span></label>
                            <input type="date" id="activityDate" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">☀️ 天候</label>
                            <select id="weather" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="">選択してください</option>
                                <option value="晴れ">晴れ</option>
                                <option value="曇り">曇り</option>
                                <option value="雨">雨</option>
                                <option value="雪">雪</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">✍️ 記録者 <span class="text-red-500">*</span></label>
                        <select id="recorderName" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">🎯 活動種別 <span class="text-red-500">*</span></label>
                        <select id="activityType" required class="w-full px-4 py-3 border border-gray-300 rounded-lg" onchange="toggleOtherType()">
                            <option value="">選択してください</option>
                            <option value="災害出動">災害出動</option>
                            <option value="警戒">警戒</option>
                            <option value="訓練">訓練</option>
                            <option value="通常点検">通常点検</option>
                            <option value="その他">その他</option>
                        </select>
                    </div>

                    <div id="otherTypeDiv" class="hidden">
                        <label class="block text-sm font-bold text-gray-700 mb-2">📝 その他の詳細</label>
                        <input type="text" id="activityTypeOther" placeholder="その他の活動内容" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    </div>

                    <!-- 活動時間 -->
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">🕐 開始時刻</label>
                            <input type="time" id="startTime" onchange="calculateDuration()" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">🕐 終了時刻</label>
                            <input type="time" id="endTime" onchange="calculateDuration()" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">⏱️ 活動時間（時間）</label>
                            <input type="number" id="durationHours" step="0.5" min="0" placeholder="自動計算" readonly class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100">
                        </div>
                    </div>

                    <!-- 出動者選択 -->
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">👥 出動者選択</label>
                        <div id="participantsList" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-4 border border-gray-300 rounded-lg">
                            <!-- JavaScriptで動的生成 -->
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">📍 場所</label>
                            <input type="text" id="location" placeholder="町内、詰所" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">💧 放水の有無</label>
                            <select id="waterDischarge" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="">選択してください</option>
                                <option value="有">有</option>
                                <option value="無">無</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">📋 活動内容</label>
                        <textarea id="activityContent" rows="3" placeholder="放水訓練、機械器具点検、etc." class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                    </div>

                    <!-- 車両・点検情報（折りたたみ） -->
                    <details class="bg-gray-50 rounded-lg p-4">
                        <summary class="font-bold text-gray-800 cursor-pointer">🚗 車両・点検情報（任意）</summary>
                        <div class="mt-4 space-y-4">
                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">前回メーター (km)</label>
                                    <input type="number" id="previousMeter" onchange="calculateDistance()" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">最終メーター (km)</label>
                                    <input type="number" id="currentMeter" onchange="calculateDistance()" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">走行距離 (km)</label>
                                    <input type="number" id="distanceKm" readonly class="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">燃料補給 (L)</label>
                                    <input type="number" id="fuelLiters" step="0.1" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🔧 エンジン</label>
                                    <select id="engineCheck" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="良">良</option>
                                        <option value="不良">不良</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🔋 バッテリー</label>
                                    <select id="batteryCheck" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="良">良</option>
                                        <option value="否">否</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">グリス</label>
                                    <select id="greaseSupply" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="補給要なし">不要</option>
                                        <option value="補給した">補給</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">⛽ 燃料</label>
                                    <select id="fuelSupply" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="補給要なし">不要</option>
                                        <option value="補給した">補給</option>
                                    </select>
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">注油</label>
                                    <select id="oilSupply" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="注油要なし">不要</option>
                                        <option value="注油した">注油</option>
                                    </select>
                                </div>
                            </div>

                            <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">👔 防火服</label>
                                    <input type="number" id="fireSuits" placeholder="10" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">👢 銀長靴</label>
                                    <input type="number" id="boots" placeholder="10" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">⛑️ ヘルメット</label>
                                    <input type="number" id="helmets" placeholder="10" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🚿 ホース</label>
                                    <input type="number" id="hoses" placeholder="25" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🔫 筒先</label>
                                    <input type="number" id="nozzles" placeholder="2" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                            </div>
                        </div>
                    </details>

                    <!-- 確認者 -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">🔌 車両充電確認者</label>
                            <select id="vehiclePowerOffConfirmedBy" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="">選択してください</option>
                            </select>
                        </div>
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2">📻 無線機充電確認者</label>
                            <select id="radioChargeConfirmedBy" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <option value="">選択してください</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">📝 備考・特記事項</label>
                        <textarea id="remarks" rows="3" placeholder="その他メモ" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                    </div>

                    <div class="flex flex-col space-y-3 pt-4">
                        <button type="button" onclick="saveActivity()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                            ✅ 保存する
                        </button>
                        <button type="button" onclick="hideModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let members = [];
        let logs = [];

        window.onload = function() {
            const today = new Date().toISOString().split('T')[0];
            const activityDateInput = document.getElementById('activityDate');
            if (activityDateInput) {
                activityDateInput.value = today;
            }
            loadMembers();
            loadLogs();
        };

        async function loadMembers() {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch users: ' + response.status);
                }
                const data = await response.json();
                members = data.users || [];
                
                console.log('Loaded members:', members.length);
                
                if (members.length === 0) {
                    console.warn('No members found in database');
                    return;
                }
                
                populateMemberSelects();
            } catch (error) {
                console.error('Failed to load members:', error);
                alert('メンバー情報の読み込みに失敗しました。ページを再読み込みしてください。');
            }
        }

        function populateMemberSelects() {
            // 記録者選択
            const recorderSelect = document.getElementById('recorderName');
            const vehicleSelect = document.getElementById('vehiclePowerOffConfirmedBy');
            const radioSelect = document.getElementById('radioChargeConfirmedBy');
            
            if (!recorderSelect || !vehicleSelect || !radioSelect) {
                console.error('Select elements not found');
                return;
            }
            
            // 既存のオプションをクリア（初期オプションは残す）
            [recorderSelect, vehicleSelect, radioSelect].forEach(select => {
                while (select.options.length > 1) {
                    select.remove(1);
                }
            });
            
            // メンバーを追加
            members.forEach(member => {
                [recorderSelect, vehicleSelect, radioSelect].forEach(select => {
                    const option = document.createElement('option');
                    option.value = member.name;
                    option.textContent = member.name;
                    select.appendChild(option);
                });
            });

            // 出動者チェックボックス
            const participantsList = document.getElementById('participantsList');
            if (participantsList) {
                participantsList.innerHTML = members.map(member => 
                    '<label class="flex items-center space-x-2 cursor-pointer">' +
                        '<input type="checkbox" value="' + member.name + '" class="participant-checkbox w-5 h-5">' +
                        '<span class="text-sm">' + member.name + '</span>' +
                    '</label>'
                ).join('');
            }
            
            console.log('Member selects populated successfully');
        }

        async function loadLogs() {
            try {
                const response = await fetch('/api/activity-logs');
                const data = await response.json();
                logs = data.logs || [];
                renderLogs();
            } catch (error) {
                document.getElementById('logsList').innerHTML =
                    '<p class="text-gray-800 text-center py-8">データの読み込みに失敗しました</p>';
                console.error(error);
            }
        }

        function renderLogs() {
            const container = document.getElementById('logsList');
            
            if (logs.length === 0) {
                container.innerHTML = '<div class="bg-white rounded-2xl p-12 text-center shadow-lg"><p class="text-gray-800 text-xl">まだ活動記録がありません</p></div>';
                return;
            }

            container.innerHTML = logs.map(log => {
                const date = new Date(log.activity_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'});
                const typeColor = {
                    '災害出動': 'bg-red-500',
                    '警戒': 'bg-orange-500',
                    '訓練': 'bg-blue-500',
                    '通常点検': 'bg-green-500',
                    'その他': 'bg-gray-500'
                }[log.activity_type] || 'bg-gray-500';

                const participants = JSON.parse(log.participants || '[]');
                const isApproved = log.approval_status === 'approved';
                const statusBadge = isApproved 
                    ? '<span class="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold ml-2">✓ 承認済</span>'
                    : '<span class="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold ml-2">⏳ 未承認</span>';
                
                return '<div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 cursor-pointer hover:border-blue-400 transition" onclick="showDetailModal(\\'' + log.id + '\\')   ">' +
                    '<div class="flex justify-between items-start mb-4">' +
                        '<div>' +
                            '<h3 class="text-2xl font-bold text-gray-800 mb-1">' + date + statusBadge + '</h3>' +
                            '<p class="text-gray-600">記録者: ' + log.recorder_name + '</p>' +
                        '</div>' +
                        '<span class="' + typeColor + ' text-white px-4 py-2 rounded-full text-sm font-bold">' + 
                            (log.activity_type === 'その他' && log.activity_type_other ? log.activity_type_other : log.activity_type) +
                        '</span>' +
                    '</div>' +
                    (log.activity_content ? '<p class="text-gray-700 mb-2">📋 ' + (log.activity_content.length > 100 ? log.activity_content.substring(0, 100) + '...' : log.activity_content) + '</p>' : '') +
                    (participants.length > 0 ? '<p class="text-gray-700 mb-2">👥 出動者 ' + participants.length + '名</p>' : '') +
                    '<div class="text-right mt-4">' +
                        '<span class="text-blue-600 text-sm font-bold">詳細を見る →</span>' +
                    '</div>' +
                '</div>';
            }).join('');
        }

        function calculateDuration() {
            const startTime = document.getElementById('startTime').value;
            const endTime = document.getElementById('endTime').value;
            const durationInput = document.getElementById('durationHours');
            
            if (startTime && endTime) {
                const start = new Date('2000-01-01 ' + startTime);
                const end = new Date('2000-01-01 ' + endTime);
                
                let diff = (end - start) / (1000 * 60 * 60); // 時間に変換
                
                // 終了時刻が開始時刻より前の場合は翌日と見なす
                if (diff < 0) {
                    diff += 24;
                }
                
                // 0.5時間単位に丸める
                diff = Math.round(diff * 2) / 2;
                
                durationInput.value = diff.toFixed(1);
            } else {
                durationInput.value = '';
            }
        }

        function calculateDistance() {
            const previousMeter = parseFloat(document.getElementById('previousMeter').value);
            const currentMeter = parseFloat(document.getElementById('currentMeter').value);
            const distanceInput = document.getElementById('distanceKm');
            
            if (previousMeter && currentMeter && currentMeter >= previousMeter) {
                const distance = currentMeter - previousMeter;
                distanceInput.value = distance.toFixed(0);
            } else {
                distanceInput.value = '';
            }
        }

        async function loadPreviousMeterReading() {
            try {
                // 最新の活動記録から最終メーターを取得
                const response = await fetch('/api/activity-logs?limit=1');
                const data = await response.json();
                
                if (data.logs && data.logs.length > 0 && data.logs[0].current_meter) {
                    const previousMeterInput = document.getElementById('previousMeter');
                    previousMeterInput.value = data.logs[0].current_meter;
                    console.log('Previous meter loaded:', data.logs[0].current_meter);
                }
            } catch (error) {
                console.error('Failed to load previous meter:', error);
            }
        }

        function toggleOtherType() {
            const type = document.getElementById('activityType').value;
            const otherDiv = document.getElementById('otherTypeDiv');
            otherDiv.classList.toggle('hidden', type !== 'その他');
        }

        function showAddModal() {
            const modal = document.getElementById('activityModal');
            if (modal) {
                modal.classList.remove('hidden');
                // 今日の日付を設定
                const today = new Date().toISOString().split('T')[0];
                const activityDateInput = document.getElementById('activityDate');
                if (activityDateInput) {
                    activityDateInput.value = today;
                }
                
                // メンバー選択肢を再設定（確実に表示されるように）
                if (members.length > 0) {
                    populateMemberSelects();
                } else {
                    // メンバーがまだ読み込まれていない場合は再読み込み
                    loadMembers();
                }
                
                // 前回メーターを自動読み込み
                loadPreviousMeterReading();
            } else {
                console.error('activityModal not found');
            }
        }

        function hideModal() {
            document.getElementById('activityModal').classList.add('hidden');
        }

        async function saveActivity() {
            const activityDate = document.getElementById('activityDate').value;
            const recorderName = document.getElementById('recorderName').value;
            const activityType = document.getElementById('activityType').value;

            if (!activityDate || !recorderName || !activityType) {
                alert('活動日、記録者、活動種別は必須です');
                return;
            }

            const participants = Array.from(document.querySelectorAll('.participant-checkbox:checked'))
                .map(cb => cb.value);

            const data = {
                activity_date: activityDate,
                weather: document.getElementById('weather').value || null,
                recorder_name: recorderName,
                location: document.getElementById('location').value || null,
                activity_content: document.getElementById('activityContent').value || null,
                activity_type: activityType,
                activity_type_other: document.getElementById('activityTypeOther').value || null,
                start_time: document.getElementById('startTime').value || null,
                end_time: document.getElementById('endTime').value || null,
                duration_hours: parseFloat(document.getElementById('durationHours').value) || null,
                participants: participants,
                previous_meter: parseInt(document.getElementById('previousMeter').value) || null,
                current_meter: parseInt(document.getElementById('currentMeter').value) || null,
                distance_km: parseInt(document.getElementById('distanceKm').value) || null,
                fuel_liters: parseFloat(document.getElementById('fuelLiters').value) || null,
                engine_check: document.getElementById('engineCheck').value || null,
                battery_check: document.getElementById('batteryCheck').value || null,
                grease_supply: document.getElementById('greaseSupply').value || null,
                fuel_supply: document.getElementById('fuelSupply').value || null,
                oil_supply: document.getElementById('oilSupply').value || null,
                fire_suits: parseInt(document.getElementById('fireSuits').value) || null,
                boots: parseInt(document.getElementById('boots').value) || null,
                helmets: parseInt(document.getElementById('helmets').value) || null,
                hoses: parseInt(document.getElementById('hoses').value) || null,
                nozzles: parseInt(document.getElementById('nozzles').value) || null,
                water_discharge: document.getElementById('waterDischarge').value || null,
                vehicle_power_off_confirmed_by: document.getElementById('vehiclePowerOffConfirmedBy').value || null,
                radio_charge_confirmed_by: document.getElementById('radioChargeConfirmedBy').value || null,
                remarks: document.getElementById('remarks').value || null
            };

            console.log('Saving activity:', data);
            
            const activityId = document.getElementById('activityId').value;
            const isEdit = !!activityId;
            
            try {
                const response = await fetch(
                    isEdit ? '/api/activity-logs/' + activityId : '/api/activity-logs',
                    {
                        method: isEdit ? 'PUT' : 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    }
                );

                const result = await response.json();
                console.log('Save result:', result);

                if (response.ok && result.success) {
                    alert(isEdit ? '✅ 活動記録を更新しました！' : '✅ 活動記録を保存しました！');
                    hideModal();
                    loadLogs();
                    // フォームリセット
                    document.getElementById('activityId').value = '';
                    document.getElementById('activityType').value = '';
                    document.getElementById('activityContent').value = '';
                    document.getElementById('remarks').value = '';
                    document.getElementById('modalTitle').textContent = '📝 活動記録を追加';
                    document.querySelectorAll('.participant-checkbox').forEach(cb => cb.checked = false);
                } else {
                    const errorMsg = result.error || 'Unknown error';
                    alert('❌ エラーが発生しました: ' + errorMsg);
                    console.error('Save failed:', result);
                }
            } catch (error) {
                alert('❌ 保存中にエラーが発生しました: ' + error.message);
                console.error('Save error:', error);
            }
        }

        function showDetailModal(logId) {
            const log = logs.find(l => l.id === logId);
            if (!log) return;

            const date = new Date(log.activity_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'});
            const participants = JSON.parse(log.participants || '[]');
            const isApproved = log.approval_status === 'approved';

            const modalContent = '<div class="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto" onclick="hideDetailModal()">' +
                '<div class="min-h-full flex items-start justify-center p-4 py-8">' +
                    '<div class="bg-white rounded-xl shadow-2xl max-w-3xl w-full p-6 my-8" onclick="event.stopPropagation()">' +
                        '<div class="flex justify-between items-center mb-6">' +
                            '<h2 class="text-2xl font-bold text-gray-800">📋 活動日誌詳細</h2>' +
                            '<button onclick="hideDetailModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>' +
                        '</div>' +
                        '<div class="space-y-4">' +
                            '<div class="grid grid-cols-2 gap-4">' +
                                '<div><span class="font-bold text-gray-700">📅 活動日:</span> ' + date + '</div>' +
                                '<div><span class="font-bold text-gray-700">☀️ 天候:</span> ' + (log.weather || '-') + '</div>' +
                            '</div>' +
                            '<div><span class="font-bold text-gray-700">✍️ 記録者:</span> ' + log.recorder_name + '</div>' +
                            '<div><span class="font-bold text-gray-700">🎯 活動種別:</span> ' + 
                                (log.activity_type === 'その他' && log.activity_type_other ? log.activity_type_other : log.activity_type) + 
                            '</div>' +
                            (log.start_time || log.end_time ? '<div><span class="font-bold text-gray-700">🕐 活動時間:</span> ' + 
                                (log.start_time || '-') + ' ～ ' + (log.end_time || '-') + 
                                (log.duration_hours ? ' (' + log.duration_hours + '時間)' : '') + 
                            '</div>' : '') +
                            (log.location ? '<div><span class="font-bold text-gray-700">📍 場所:</span> ' + log.location + '</div>' : '') +
                            (log.activity_content ? '<div><span class="font-bold text-gray-700">📋 活動内容:</span><br>' + log.activity_content.replace(/\\n/g, '<br>') + '</div>' : '') +
                            (participants.length > 0 ? '<div><span class="font-bold text-gray-700">👥 出動者 (' + participants.length + '名):</span><br>' + 
                                '<div class="grid grid-cols-3 gap-2 mt-2">' + participants.map(p => '<span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">' + p + '</span>').join('') + '</div>' +
                            '</div>' : '') +
                            (log.water_discharge ? '<div><span class="font-bold text-gray-700">💧 放水:</span> ' + log.water_discharge + '</div>' : '') +
                            (log.vehicle_power_off_confirmed_by ? '<div><span class="font-bold text-gray-700">🔌 車両充電確認者:</span> ' + log.vehicle_power_off_confirmed_by + '</div>' : '') +
                            (log.radio_charge_confirmed_by ? '<div><span class="font-bold text-gray-700">📻 無線機充電確認者:</span> ' + log.radio_charge_confirmed_by + '</div>' : '') +
                            (log.previous_meter || log.current_meter ? '<div class="border-t pt-4"><span class="font-bold text-gray-700">🚗 車両情報:</span><br>' +
                                '<div class="grid grid-cols-4 gap-2 mt-2 text-sm">' +
                                    (log.previous_meter ? '<div>前回: ' + log.previous_meter + 'km</div>' : '') +
                                    (log.current_meter ? '<div>最終: ' + log.current_meter + 'km</div>' : '') +
                                    (log.distance_km ? '<div>走行: ' + log.distance_km + 'km</div>' : '') +
                                    (log.fuel_liters ? '<div>燃料: ' + log.fuel_liters + 'L</div>' : '') +
                                '</div>' +
                            '</div>' : '') +
                            (log.remarks ? '<div class="border-t pt-4"><span class="font-bold text-gray-700">📝 備考:</span><br>' + log.remarks.replace(/\\n/g, '<br>') + '</div>' : '') +
                            '<div class="border-t pt-4">' +
                                '<div class="flex items-center justify-between">' +
                                    '<span class="font-bold text-gray-700">✓ 承認状況:</span> ' +
                                    (isApproved 
                                        ? '<span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold">承認済</span>'
                                        : '<span class="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">未承認</span>'
                                    ) +
                                '</div>' +
                                (isApproved && log.approved_by ? '<div class="text-sm text-gray-600 mt-2">承認者: ' + log.approved_by + ' (' + new Date(log.approved_at).toLocaleString('ja-JP') + ')</div>' : '') +
                            '</div>' +
                        '</div>' +
                        '<div class="mt-6 space-y-3">' +
                            (!isApproved ? 
                                '<div class="grid grid-cols-2 gap-3 mb-3">' +
                                    '<button onclick="editLog(\\'' + logId + '\\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-xl transition font-bold">' +
                                        '✏️ 編集' +
                                    '</button>' +
                                    '<button onclick="deleteLog(\\'' + logId + '\\')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition font-bold">' +
                                        '🗑️ 削除' +
                                    '</button>' +
                                '</div>' +
                                '<div><label class="block text-sm font-bold text-gray-700 mb-2">✍️ 承認者名 <span class="text-red-500">*</span></label>' +
                                    '<select id="approverName" class="w-full px-4 py-3 border border-gray-300 rounded-lg">' +
                                        '<option value="">選択してください</option>' +
                                        members.map(m => '<option value="' + m.name + '">' + m.name + '</option>').join('') +
                                    '</select>' +
                                '</div>' +
                                '<button onclick="approveLog(\\'' + logId + '\\')" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">' +
                                    '✅ 承認する' +
                                '</button>'
                            : 
                                '<button onclick="deleteLog(\\'' + logId + '\\')" class="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-xl transition font-bold">' +
                                    '🗑️ この日誌を削除' +
                                '</button>'
                            ) +
                        '</div>' +
                    '</div>' +
                '</div>' +
            '</div>';

            document.body.insertAdjacentHTML('beforeend', '<div id="detailModal">' + modalContent + '</div>');
        }

        function hideDetailModal() {
            const modal = document.getElementById('detailModal');
            if (modal) modal.remove();
        }

        async function approveLog(logId) {
            const approverName = document.getElementById('approverName').value;
            
            if (!approverName) {
                alert('承認者名を選択してください');
                return;
            }

            if (!confirm('この活動日誌を承認しますか？\\n\\n承認者: ' + approverName)) {
                return;
            }

            try {
                const response = await fetch('/api/activity-logs/' + logId + '/approve', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ approved_by: approverName })
                });

                if (response.ok) {
                    alert('✅ 承認しました！');
                    hideDetailModal();
                    loadLogs();
                } else {
                    alert('❌ 承認中にエラーが発生しました');
                }
            } catch (error) {
                alert('❌ 承認中にエラーが発生しました');
                console.error(error);
            }
        }

        function editLog(logId) {
            const log = logs.find(l => l.id === logId);
            if (!log) return;

            // 詳細モーダルを閉じる
            hideDetailModal();

            // 入力フォームに値を設定
            document.getElementById('activityId').value = log.id;
            document.getElementById('activityDate').value = log.activity_date;
            document.getElementById('weather').value = log.weather || '';
            document.getElementById('recorderName').value = log.recorder_name;
            document.getElementById('location').value = log.location || '';
            document.getElementById('activityContent').value = log.activity_content || '';
            document.getElementById('activityType').value = log.activity_type;
            document.getElementById('activityTypeOther').value = log.activity_type_other || '';
            document.getElementById('startTime').value = log.start_time || '';
            document.getElementById('endTime').value = log.end_time || '';
            document.getElementById('durationHours').value = log.duration_hours || '';

            // 参加者チェックボックスを設定
            const participants = JSON.parse(log.participants || '[]');
            document.querySelectorAll('.participant-checkbox').forEach(cb => {
                cb.checked = participants.includes(cb.value);
            });

            document.getElementById('previousMeter').value = log.previous_meter || '';
            document.getElementById('currentMeter').value = log.current_meter || '';
            document.getElementById('distanceKm').value = log.distance_km || '';
            document.getElementById('fuelLiters').value = log.fuel_liters || '';
            document.getElementById('engineCheck').value = log.engine_check || '';
            document.getElementById('batteryCheck').value = log.battery_check || '';
            document.getElementById('greaseSupply').value = log.grease_supply || '';
            document.getElementById('fuelSupply').value = log.fuel_supply || '';
            document.getElementById('oilSupply').value = log.oil_supply || '';
            document.getElementById('fireSuits').value = log.fire_suits || '';
            document.getElementById('boots').value = log.boots || '';
            document.getElementById('helmets').value = log.helmets || '';
            document.getElementById('hoses').value = log.hoses || '';
            document.getElementById('nozzles').value = log.nozzles || '';
            document.getElementById('waterDischarge').value = log.water_discharge || '';
            document.getElementById('vehiclePowerOffConfirmedBy').value = log.vehicle_power_off_confirmed_by || '';
            document.getElementById('radioChargeConfirmedBy').value = log.radio_charge_confirmed_by || '';
            document.getElementById('remarks').value = log.remarks || '';

            // モーダルのタイトルを変更
            document.getElementById('modalTitle').textContent = '✏️ 活動日誌を編集';

            // モーダルを表示
            showModal();
        }

        async function deleteLog(logId) {
            if (!confirm('この活動日誌を削除しますか？\\n\\n削除すると元に戻せません。')) {
                return;
            }

            try {
                const response = await fetch('/api/activity-logs/' + logId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('✅ 削除しました！');
                    hideDetailModal();
                    loadLogs();
                } else {
                    alert('❌ 削除中にエラーが発生しました');
                }
            } catch (error) {
                alert('❌ 削除中にエラーが発生しました');
                console.error(error);
            }
        }
    </script>
</body>
</html>
  `)
})
// ==========================================
// 団員管理ページ
// ==========================================
app.get('/members', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>団員管理 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
        }
        input {
            font-size: 16px !important;
        }
    </style>
</head>
<body>
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">👥 団員管理</h1>
            <p class="text-base text-gray-600 mb-4">団員情報の登録・編集</p>
            
            <button onclick="showAddModal()" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                ➕ 団員を追加
            </button>
        </div>

        <div id="memberList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <p class="text-gray-800 text-center py-8 col-span-full">読み込み中...</p>
        </div>
    </div>

    <!-- 団員追加/編集モーダル -->
    <div id="memberModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800" id="modalTitle">👥 団員を追加</h2>
                    <button onclick="hideModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>

                <div class="space-y-4">
                    <input type="hidden" id="memberId" value="">
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            👤 名前 <span class="text-red-500">*</span>
                        </label>
                        <input type="text" id="memberName" required
                            placeholder="山田　太郎"
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            🎂 生年月日 <span class="text-red-500">*</span>
                        </label>
                        <input type="date" id="birthDate" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">
                            📅 入団日 <span class="text-red-500">*</span>
                        </label>
                        <input type="date" id="joinDate" required
                            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                    </div>

                    <div class="flex flex-col space-y-3 pt-4">
                        <button onclick="saveMember()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                            ✅ 保存する
                        </button>
                        <button onclick="hideModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        let members = [];

        window.onload = function() {
            loadMembers();
        };

        async function loadMembers() {
            try {
                const response = await fetch('/api/users');
                if (!response.ok) {
                    throw new Error('Failed to fetch: ' + response.status);
                }
                const data = await response.json();
                console.log('API response:', data);
                members = data.users || [];
                console.log('Members loaded:', members.length);
                renderMembers();
            } catch (error) {
                console.error('Load members error:', error);
                document.getElementById('memberList').innerHTML = 
                    '<div class="col-span-full bg-red-50 rounded-2xl p-12 text-center shadow-lg border-2 border-red-200">' +
                        '<p class="text-red-800 text-xl font-bold mb-2">⚠️ データの読み込みに失敗しました</p>' +
                        '<p class="text-red-600 text-sm">エラー: ' + error.message + '</p>' +
                        '<button onclick="loadMembers()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">🔄 再読み込み</button>' +
                    '</div>';
            }
        }

        function renderMembers() {
            const list = document.getElementById('memberList');
            
            if (members.length === 0) {
                list.innerHTML = '<div class="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg"><p class="text-gray-800 text-xl">まだ団員が登録されていません</p></div>';
                return;
            }

            list.innerHTML = members.map(member => {
                const age = member.birth_date ? calculateAge(member.birth_date) : '不明';
                const years = member.join_date ? calculateYearsOfService(member.join_date) : '不明';
                const joinDateDisplay = member.join_date ? new Date(member.join_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'}) : '不明';
                const birthDateDisplay = member.birth_date ? new Date(member.birth_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'}) : '不明';
                
                return '<div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-400 transition">' +
                    '<h3 class="text-2xl font-bold text-gray-800 mb-4">👤 ' + member.name + '</h3>' +
                    '<div class="space-y-2 mb-4">' +
                        '<p class="text-gray-700 text-base">🎂 生年月日: ' + birthDateDisplay + ' (' + age + '歳)</p>' +
                        '<p class="text-gray-700 text-base">📅 入団: ' + joinDateDisplay + ' (' + years + '年目)</p>' +
                    '</div>' +
                    '<div class="grid grid-cols-2 gap-2">' +
                        '<button onclick="editMember(\\'' + member.id + '\\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition shadow-md font-bold">' +
                            '✏️ 編集' +
                        '</button>' +
                        '<button onclick="deleteMember(\\'' + member.id + '\\', \\'' + member.name + '\\')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-3 rounded-lg transition shadow-md font-bold">' +
                            '🗑️ 削除' +
                        '</button>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
        
        function calculateYearsOfService(joinDate) {
            const today = new Date();
            const join = new Date(joinDate);
            
            // 入団日の年度を計算（4月1日が年度の始まり）
            const joinYear = join.getFullYear();
            const joinMonth = join.getMonth() + 1;
            const joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1;
            
            // 今日の年度を計算
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            
            // 年度差を計算（+1は入団年度を1年目とするため）
            return currentFiscalYear - joinFiscalYear + 1;
        }

        function calculateAge(birthDate) {
            const today = new Date();
            const birth = new Date(birthDate);
            let age = today.getFullYear() - birth.getFullYear();
            const monthDiff = today.getMonth() - birth.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                age--;
            }
            return age;
        }

        function showAddModal() {
            document.getElementById('modalTitle').textContent = '👥 団員を追加';
            document.getElementById('memberId').value = '';
            document.getElementById('memberName').value = '';
            document.getElementById('birthDate').value = '';
            document.getElementById('joinDate').value = '';
            document.getElementById('memberModal').classList.remove('hidden');
        }

        function editMember(id) {
            const member = members.find(m => m.id === id);
            if (!member) return;

            document.getElementById('modalTitle').textContent = '✏️ 団員を編集';
            document.getElementById('memberId').value = member.id;
            document.getElementById('memberName').value = member.name;
            document.getElementById('birthDate').value = member.birth_date || '';
            document.getElementById('joinDate').value = member.join_date || '';
            document.getElementById('memberModal').classList.remove('hidden');
        }

        function hideModal() {
            document.getElementById('memberModal').classList.add('hidden');
        }

        async function saveMember() {
            const id = document.getElementById('memberId').value;
            const name = document.getElementById('memberName').value.trim();
            const birthDate = document.getElementById('birthDate').value;
            const joinDate = document.getElementById('joinDate').value;

            if (!name || !birthDate || !joinDate) {
                alert('すべての項目を入力してください');
                return;
            }

            const data = {
                name: name,
                birth_date: birthDate,
                join_date: joinDate
            };

            try {
                const url = id ? '/api/members/' + id : '/api/members';
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    alert(id ? '更新しました！' : '登録しました！');
                    hideModal();
                    loadMembers();
                } else {
                    alert('エラーが発生しました');
                }
            } catch (error) {
                alert('保存中にエラーが発生しました');
                console.error(error);
            }
        }

        async function deleteMember(id, name) {
            if (!confirm('本当に削除しますか？\\n\\n団員名: ' + name + '\\n\\n⚠️ この操作は取り消せません')) {
                return;
            }

            try {
                const response = await fetch('/api/members/' + id, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('✅ 削除しました');
                    loadMembers();
                } else {
                    alert('❌ 削除中にエラーが発生しました');
                }
            } catch (error) {
                alert('❌ 削除中にエラーが発生しました');
                console.error(error);
            }
        }
    </script>
</body>
</html>
  `)
})
// ==========================================
// 活動集計ページ
// ==========================================
app.get('/stats', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>活動集計 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
    </style>
</head>
<body>
    <nav class="bg-white shadow-md">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-gray-800">
                        <div class="font-bold text-xl">活動記録</div>
                        <div class="text-sm text-gray-600">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <h1 class="text-3xl font-bold text-gray-800 mb-2">📊 活動集計</h1>
            <p class="text-base text-gray-600 mb-4">活動実績データ・統計表示</p>
        </div>

        <!-- 統計カード -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <div class="text-gray-600 text-sm mb-2">🔥 総活動回数</div>
                <div class="text-4xl font-bold text-gray-800" id="totalActivities">0</div>
                <div class="text-gray-500 text-xs mt-2">記録</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <div class="text-gray-600 text-sm mb-2">⏱️ 総活動時間</div>
                <div class="text-4xl font-bold text-blue-600" id="totalHours">0</div>
                <div class="text-gray-500 text-xs mt-2">時間</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <div class="text-gray-600 text-sm mb-2">🚨 災害出動</div>
                <div class="text-4xl font-bold text-red-600" id="disasterCount">0</div>
                <div class="text-gray-500 text-xs mt-2">回</div>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <div class="text-gray-600 text-sm mb-2">💪 訓練実施</div>
                <div class="text-4xl font-bold text-green-600" id="trainingCount">0</div>
                <div class="text-gray-500 text-xs mt-2">回</div>
            </div>
        </div>

        <!-- グラフエリア -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h2 class="text-xl font-bold text-gray-800 mb-4">📈 活動種別の割合</h2>
                <canvas id="activityTypeChart"></canvas>
            </div>
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h2 class="text-xl font-bold text-gray-800 mb-4">📅 月別活動回数</h2>
                <canvas id="monthlyChart"></canvas>
            </div>
        </div>

        <!-- 出動回数ランキング -->
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h2 class="text-xl font-bold text-gray-800 mb-4">👥 出動回数ランキング</h2>
            <div id="participationRanking" class="space-y-2">
                <!-- JavaScriptで動的生成 -->
            </div>
        </div>
    </div>

    <script>
        let logs = [];

        window.onload = function() {
            loadStats();
        };

        async function loadStats() {
            try {
                const response = await fetch('/api/activity-logs');
                const data = await response.json();
                logs = data.logs || [];
                
                calculateStats();
                renderCharts();
                renderParticipationRanking();
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }

        function calculateStats() {
            // 総活動回数
            document.getElementById('totalActivities').textContent = logs.length;

            // 総活動時間
            const totalHours = logs.reduce((sum, log) => sum + (parseFloat(log.duration_hours) || 0), 0);
            document.getElementById('totalHours').textContent = totalHours.toFixed(1);

            // 災害出動回数
            const disasterCount = logs.filter(log => log.activity_type === '災害出動').length;
            document.getElementById('disasterCount').textContent = disasterCount;

            // 訓練回数
            const trainingCount = logs.filter(log => log.activity_type === '訓練').length;
            document.getElementById('trainingCount').textContent = trainingCount;
        }

        function renderCharts() {
            // 活動種別の割合（円グラフ）
            const typeCounts = {};
            logs.forEach(log => {
                const type = log.activity_type;
                typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            const typeCtx = document.getElementById('activityTypeChart').getContext('2d');
            new Chart(typeCtx, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(typeCounts),
                    datasets: [{
                        data: Object.values(typeCounts),
                        backgroundColor: [
                            'rgba(239, 68, 68, 0.8)',  // 災害出動
                            'rgba(251, 146, 60, 0.8)', // 警戒
                            'rgba(59, 130, 246, 0.8)', // 訓練
                            'rgba(34, 197, 94, 0.8)',  // 通常点検
                            'rgba(156, 163, 175, 0.8)' // その他
                        ],
                        borderWidth: 2,
                        borderColor: '#fff'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });

            // 月別活動回数（棒グラフ）
            const monthlyCounts = {};
            logs.forEach(log => {
                const date = new Date(log.activity_date);
                const monthKey = date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0');
                monthlyCounts[monthKey] = (monthlyCounts[monthKey] || 0) + 1;
            });

            const sortedMonths = Object.keys(monthlyCounts).sort();
            const monthLabels = sortedMonths.map(m => {
                const [year, month] = m.split('-');
                return year + '年' + month + '月';
            });

            const monthCtx = document.getElementById('monthlyChart').getContext('2d');
            new Chart(monthCtx, {
                type: 'bar',
                data: {
                    labels: monthLabels,
                    datasets: [{
                        label: '活動回数',
                        data: sortedMonths.map(m => monthlyCounts[m]),
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }

        function renderParticipationRanking() {
            // 出動回数をカウント
            const participationCounts = {};
            logs.forEach(log => {
                try {
                    const participants = JSON.parse(log.participants || '[]');
                    participants.forEach(name => {
                        participationCounts[name] = (participationCounts[name] || 0) + 1;
                    });
                } catch (e) {
                    console.error('Failed to parse participants:', e);
                }
            });

            // ソート
            const sorted = Object.entries(participationCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 15); // トップ15

            const container = document.getElementById('participationRanking');
            
            if (sorted.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-4">データがありません</p>';
                return;
            }

            const maxCount = sorted[0][1];
            
            container.innerHTML = sorted.map(([name, count], index) => {
                const percentage = (count / maxCount) * 100;
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                
                return '<div class="flex items-center space-x-4">' +
                    '<div class="text-xl font-bold text-gray-700 w-8">' + (index + 1) + medal + '</div>' +
                    '<div class="flex-1">' +
                        '<div class="flex justify-between items-center mb-1">' +
                            '<span class="font-bold text-gray-800">' + name + '</span>' +
                            '<span class="text-blue-600 font-bold">' + count + '回</span>' +
                        '</div>' +
                        '<div class="w-full bg-gray-200 rounded-full h-2">' +
                            '<div class="bg-blue-500 h-2 rounded-full" style="width: ' + percentage + '%"></div>' +
                        '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// 旧ログインページへのリダイレクト
// ==========================================
app.get('/login', (c) => c.redirect('/'))
app.get('/dashboard', (c) => c.redirect('/'))

export default app
