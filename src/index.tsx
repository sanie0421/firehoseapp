import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database
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
    <title>消防団デジタルノート</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
        }
        .card-gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card-gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .card-gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .card-gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .card-gradient-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        
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
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
    </style>
</head>
<body>
    <!-- ヘッダー -->
    <div class="bg-white bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-30">
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-center space-x-4">
                <div class="text-6xl float-animation">🔥</div>
                <div class="text-white text-center">
                    <h1 class="text-3xl md:text-4xl font-bold drop-shadow-lg">消防団デジタルノート</h1>
                    <p class="text-lg opacity-90">大井町消防団第一分団</p>
                </div>
            </div>
        </div>
    </div>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-12">
        <!-- 機能カード -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <!-- ホース点検（最優先） -->
            <a href="/hose" class="card-gradient-1 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">🔧</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">ホース点検</h2>
                    <p class="text-center opacity-90">格納庫管理・点検記録</p>
                </div>
            </a>

            <!-- 活動日誌 -->
            <a href="/logs" class="card-gradient-2 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">📝</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">活動日誌</h2>
                    <p class="text-center opacity-90">活動・訓練の記録と承認</p>
                </div>
            </a>

            <!-- 団員管理 -->
            <a href="/members" class="card-gradient-3 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">👥</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">団員管理</h2>
                    <p class="text-center opacity-90">団員情報・連絡先</p>
                </div>
            </a>

            <!-- 活動集計 -->
            <a href="/stats" class="card-gradient-4 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">📊</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">活動集計</h2>
                    <p class="text-center opacity-90">実績データ・グラフ表示</p>
                </div>
            </a>

            <!-- データ管理 -->
            <a href="/admin" class="card-gradient-5 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">⚙️</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">データ管理</h2>
                    <p class="text-center opacity-90">データ確認・バックアップ</p>
                </div>
            </a>
        </div>

        <!-- 使い方案内 -->
        <div class="mt-12 max-w-2xl mx-auto">
            <div class="bg-white bg-opacity-20 backdrop-blur-md rounded-2xl p-6 border border-white border-opacity-30">
                <p class="text-white text-center text-lg">
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
app.get('/api/members', async (c) => {
  // テスト用団員データ
  const members = [
    { id: 'user_001', name: '三谷　誠', role: 'leader', position: '会計兼機械係長' },
    { id: 'user_002', name: '瀬戸　毅', role: 'viceleader', position: 'ホース係' },
    { id: 'user_003', name: '橋本　史哉', role: 'chief', position: '' },
    { id: 'user_004', name: '斉藤　貴禎', role: 'member', position: '' },
    { id: 'user_005', name: '石井　友祐', role: 'member', position: '' },
    { id: 'user_006', name: '津田　和哉', role: 'member', position: '' },
    { id: 'user_007', name: '渡辺　拓人', role: 'member', position: '' },
    { id: 'user_008', name: '浅倉　伶', role: 'member', position: '' },
    { id: 'user_009', name: '内藤　光', role: 'member', position: '' },
    { id: 'user_010', name: '石岡　瑞輝', role: 'member', position: '' },
    { id: 'user_011', name: '中村　裕太郎', role: 'member', position: '' },
    { id: 'user_012', name: '野地　駿介', role: 'member', position: '' },
    { id: 'user_013', name: '鍵和田　真吉', role: 'member', position: '' },
    { id: 'user_014', name: '片野　聡介', role: 'member', position: '' },
    { id: 'user_015', name: '中山　魁', role: 'member', position: '' },
    { id: 'user_016', name: '鈴木　大慎', role: 'member', position: '' }
  ]

  return c.json({ members })
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
    <title>${title} - 消防団デジタルノート</title>
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
    <title>ホース格納庫管理 - 消防団デジタルノート</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
        }
        #map { height: 400px; width: 100%; }
        
        /* グラデーションカード */
        .storage-gradient-1 { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .storage-gradient-2 { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .storage-gradient-3 { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .storage-gradient-4 { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .storage-gradient-5 { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        
        .storage-card {
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .storage-card:hover {
            transform: translateY(-8px) scale(1.02);
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
    </style>
</head>
<body>
    <!-- ナビゲーションバー（ガラスモーフィズム） -->
    <nav class="bg-white bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-30">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-white">
                        <div class="font-bold text-xl">消防団デジタルノート</div>
                        <div class="text-sm opacity-90">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-white hover:underline text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <!-- ヘッダー -->
        <div class="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-8 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="text-white mb-4 md:mb-0">
                    <h1 class="text-4xl font-bold mb-2 drop-shadow-lg">🔧 ホース格納庫管理</h1>
                    <p class="text-lg opacity-90">格納庫の登録・地図設定・点検記録</p>
                </div>
                <div class="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <button onclick="showUploadModal()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition border border-white border-opacity-50 shadow-lg">
                        📥 CSV一括登録
                    </button>
                    <button onclick="showAddModal()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-6 py-3 rounded-lg transition border border-white border-opacity-50 shadow-lg">
                        ➕ 格納庫を追加
                    </button>
                </div>
            </div>
        </div>

        <!-- 格納庫一覧 -->
        <div id="storageList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- JavaScriptで動的に生成 -->
        </div>
    </div>

    <!-- CSV一括登録モーダル -->
    <div id="uploadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800">📥 CSV一括登録</h2>
                <button onclick="hideUploadModal()" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <div class="space-y-6">
                <!-- テンプレートダウンロード -->
                <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                    <p class="text-blue-800 mb-2"><strong>📋 Step 1:</strong> CSVテンプレートをダウンロード</p>
                    <a href="/templates/hose_storages_template.csv" download class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition">
                        📥 テンプレートをダウンロード
                    </a>
                </div>

                <!-- CSV形式説明 -->
                <div class="bg-gray-50 p-4 rounded">
                    <p class="font-bold mb-2">📝 CSV形式:</p>
                    <pre class="text-sm bg-white p-3 rounded border overflow-x-auto">格納庫番号,場所の目安,備考
No.01,◯◯公民館前,2020年設置
No.02,△△集会所裏,
No.03,××消防団詰所前,</pre>
                </div>

                <!-- ファイル選択 -->
                <div>
                    <p class="font-bold mb-2"><strong>📂 Step 2:</strong> CSVファイルを選択</p>
                    <input type="file" id="csvFile" accept=".csv" class="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded file:border-0
                        file:text-sm file:font-semibold
                        file:bg-red-50 file:text-red-700
                        hover:file:bg-red-100">
                </div>

                <!-- アップロードボタン -->
                <div class="flex space-x-2">
                    <button onclick="uploadCSV()" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition">
                        ✅ 一括登録する
                    </button>
                    <button onclick="hideUploadModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 格納庫追加/編集モーダル -->
    <div id="addModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
        <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-8 my-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800" id="modalTitle">📦 格納庫を追加</h2>
                <button onclick="hideAddModal()" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form id="storageForm" class="space-y-6">
                <input type="hidden" id="storageId" value="">

                <!-- 格納庫番号 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏷️ 格納庫番号 <span class="text-red-500">*</span>
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

                <!-- 住所（任意） -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏠 住所（任意）
                    </label>
                    <input type="text" id="address"
                        placeholder="大井町金子1234-5"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
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

                <!-- ボタン -->
                <div class="flex space-x-2">
                    <button type="submit" class="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition">
                        ✅ 保存する
                    </button>
                    <button type="button" onclick="hideAddModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg transition">
                        キャンセル
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 格納庫詳細モーダル（地図表示） -->
    <div id="detailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800" id="detailTitle"></h2>
                <button onclick="hideDetailModal()" class="text-gray-500 hover:text-gray-700">✕</button>
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
        };

        // 格納庫一覧を読み込み
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

        // 格納庫一覧を表示
        function renderStorages() {
            const list = document.getElementById('storageList');
            
            if (storages.length === 0) {
                list.innerHTML = \`
                    <div class="col-span-full text-center py-16">
                        <div class="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-12">
                            <div class="text-8xl mb-6">📦</div>
                            <p class="text-2xl text-white font-bold mb-4">まだ格納庫が登録されていません</p>
                            <p class="text-white opacity-90 mb-8">CSV一括登録または個別追加で格納庫を登録しましょう</p>
                            <button onclick="showUploadModal()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-8 py-4 rounded-lg transition mr-2 border border-white border-opacity-50 shadow-lg">
                                📥 CSV一括登録
                            </button>
                            <button onclick="showAddModal()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-8 py-4 rounded-lg transition border border-white border-opacity-50 shadow-lg">
                                ➕ 格納庫を追加
                            </button>
                        </div>
                    </div>
                \`;
                return;
            }

            const gradients = ['storage-gradient-1', 'storage-gradient-2', 'storage-gradient-3', 'storage-gradient-4', 'storage-gradient-5'];
            list.innerHTML = storages.map((storage, index) => \`
                <div class="\${gradients[index % 5]} rounded-2xl shadow-2xl p-6 storage-card" onclick="showDetail('\${storage.id}')">
                    <div class="text-white">
                        <div class="flex justify-between items-start mb-4">
                            <h3 class="text-2xl font-bold">📦 \${storage.storage_number}</h3>
                            \${storage.latitude ? '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">📍 地図設定済み</span>' : '<span class="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">⚠️ 地図未設定</span>'}
                        </div>
                        <p class="text-lg mb-2 font-semibold">📍 \${storage.location}</p>
                        \${storage.address ? \`<p class="opacity-90 mb-2">🏠 \${storage.address}</p>\` : ''}
                        \${storage.remarks ? \`<p class="opacity-80 text-sm mb-4">💬 \${storage.remarks}</p>\` : ''}
                        
                        <div class="flex space-x-2 mt-6">
                            \${storage.google_maps_url ? 
                                \`<button onclick="event.stopPropagation(); window.open('\${storage.google_maps_url}', '_blank')" class="flex-1 bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition border border-white border-opacity-50">
                                    🗺️ Google Maps
                                </button>\` : ''
                            }
                            \${storage.latitude ? 
                                \`<button onclick="event.stopPropagation(); viewOnMap('\${storage.id}')" class="flex-1 bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition border border-white border-opacity-50">
                                    📍 地図を見る
                                </button>\` : 
                                \`<button onclick="event.stopPropagation(); editStorage('\${storage.id}')" class="flex-1 bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition border border-white border-opacity-50">
                                    📍 地図を設定
                                </button>\`
                            }
                            <button onclick="event.stopPropagation(); editStorage('\${storage.id}')" class="flex-1 bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-lg text-sm transition border border-white border-opacity-50">
                                ✏️ 編集
                            </button>
                        </div>
                    </div>
                </div>
            \`).join('');
        }

        // CSV一括登録モーダル表示
        function showUploadModal() {
            document.getElementById('uploadModal').classList.remove('hidden');
        }

        function hideUploadModal() {
            document.getElementById('uploadModal').classList.add('hidden');
        }

        // CSVアップロード
        async function uploadCSV() {
            const fileInput = document.getElementById('csvFile');
            const file = fileInput.files[0];
            
            if (!file) {
                alert('CSVファイルを選択してください');
                return;
            }

            const reader = new FileReader();
            reader.onload = async function(e) {
                const text = e.target.result;
                const lines = text.split('\\n');
                const storagesData = [];

                // ヘッダー行をスキップして解析
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i].trim();
                    if (!line) continue;

                    const [storageNumber, location, remarks] = line.split(',');
                    if (storageNumber && location) {
                        storagesData.push({
                            storage_number: storageNumber.trim(),
                            location: location.trim(),
                            remarks: remarks ? remarks.trim() : ''
                        });
                    }
                }

                try {
                    const response = await fetch('/api/hose/storages/bulk', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ storages: storagesData })
                    });

                    const result = await response.json();
                    alert(\`\${result.count}件の格納庫を登録しました！\`);
                    hideUploadModal();
                    loadStorages();
                } catch (error) {
                    alert('登録中にエラーが発生しました');
                    console.error(error);
                }
            };
            reader.readAsText(file);
        }

        // 格納庫追加モーダル表示
        function showAddModal() {
            document.getElementById('modalTitle').textContent = '📦 格納庫を追加';
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

        // 格納庫編集
        function editStorage(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage) return;

            document.getElementById('modalTitle').textContent = '✏️ 格納庫を編集';
            document.getElementById('storageId').value = storage.id;
            document.getElementById('storageNumber').value = storage.storage_number;
            document.getElementById('location').value = storage.location;
            document.getElementById('address').value = storage.address || '';
            document.getElementById('googleMapsUrl').value = storage.google_maps_url || '';
            document.getElementById('remarks').value = storage.remarks || '';
            
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

        // 格納庫保存
        document.getElementById('storageForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const id = document.getElementById('storageId').value;
            const data = {
                storage_number: document.getElementById('storageNumber').value,
                location: document.getElementById('location').value,
                address: document.getElementById('address').value,
                google_maps_url: document.getElementById('googleMapsUrl').value,
                latitude: currentLat,
                longitude: currentLng,
                remarks: document.getElementById('remarks').value
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
        });

        // 地図で表示
        function viewOnMap(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage || !storage.latitude) return;

            const detailContent = document.getElementById('detailContent');
            let html = '<div class="space-y-4">';
            html += '<div class="bg-gray-50 p-4 rounded">';
            html += '<p class="font-bold">📍 ' + storage.location + '</p>';
            if (storage.address) {
                html += '<p class="text-gray-600">🏠 ' + storage.address + '</p>';
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

        // 詳細表示
        function showDetail(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage) return;

            if (storage.latitude) {
                viewOnMap(id);
            } else {
                editStorage(id);
            }
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
// API: 格納庫一覧取得
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
// API: 格納庫追加
// ==========================================
app.post('/api/hose/storages', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'storage_' + Date.now()
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      INSERT INTO hose_storages (
        id, storage_number, location, address, 
        google_maps_url, latitude, longitude, remarks,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.storage_number,
      data.location,
      data.address || null,
      data.google_maps_url || null,
      data.latitude || null,
      data.longitude || null,
      data.remarks || null,
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
// API: 格納庫更新
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
          address = ?,
          google_maps_url = ?,
          latitude = ?,
          longitude = ?,
          remarks = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.storage_number,
      data.location,
      data.address || null,
      data.google_maps_url || null,
      data.latitude || null,
      data.longitude || null,
      data.remarks || null,
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
          id, storage_number, location, remarks,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        id,
        storage.storage_number,
        storage.location,
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
  const csvContent = `格納庫番号,場所の目安,備考
No.01,◯◯公民館前,
No.02,△△集会所裏,
No.03,××消防団詰所前,
No.04,,
No.05,,
No.06,,
No.07,,
No.08,,
No.09,,
No.10,,
No.11,,
No.12,,`
  
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
    <title>データ管理 - 消防団デジタルノート</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
            min-height: 100vh;
        }
        @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
        }
        .float-animation { animation: float 3s ease-in-out infinite; }
        table { font-size: 0.875rem; }
        th { background: rgba(255,255,255,0.2); }
        tr:hover { background: rgba(255,255,255,0.1); }
    </style>
</head>
<body>
    <!-- ナビゲーションバー -->
    <nav class="bg-white bg-opacity-20 backdrop-blur-md border-b border-white border-opacity-30">
        <div class="container mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
                <a href="/" class="flex items-center space-x-3">
                    <span class="text-4xl float-animation">🔥</span>
                    <div class="text-white">
                        <div class="font-bold text-xl">消防団デジタルノート</div>
                        <div class="text-sm opacity-90">大井町消防団第一分団</div>
                    </div>
                </a>
                <a href="/" class="text-white hover:underline text-sm bg-white bg-opacity-20 px-4 py-2 rounded-lg backdrop-blur-sm">
                    ← ホームに戻る
                </a>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <!-- ヘッダー -->
        <div class="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-8 mb-8">
            <div class="flex flex-col md:flex-row justify-between items-center">
                <div class="text-white mb-4 md:mb-0">
                    <h1 class="text-4xl font-bold mb-2 drop-shadow-lg">⚙️ データ管理</h1>
                    <p class="text-lg opacity-90">データベース内容の確認とバックアップ</p>
                </div>
                <button onclick="downloadBackup()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-8 py-4 rounded-lg transition border border-white border-opacity-50 shadow-lg text-lg font-bold">
                    💾 バックアップをダウンロード
                </button>
            </div>
        </div>

        <!-- テーブル選択 -->
        <div class="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6 mb-6">
            <label class="block text-white text-lg font-bold mb-4">📊 表示するテーブル:</label>
            <select id="tableSelect" onchange="loadTable()" class="w-full px-4 py-3 rounded-lg text-gray-800 font-semibold">
                <option value="hose_storages">ホース格納庫 (hose_storages)</option>
                <option value="hose_inspections">ホース点検記録 (hose_inspections)</option>
                <option value="activity_logs">活動日誌 (activity_logs)</option>
                <option value="users">団員情報 (users)</option>
            </select>
        </div>

        <!-- データ表示エリア -->
        <div class="bg-white bg-opacity-20 backdrop-blur-md border border-white border-opacity-30 rounded-2xl p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-white" id="tableName">ホース格納庫</h2>
                <button onclick="exportCSV()" class="bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm text-white px-4 py-2 rounded-lg transition border border-white border-opacity-50">
                    📥 CSV出力
                </button>
            </div>
            <div class="overflow-x-auto">
                <div id="dataContainer" class="text-white">
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
                    '<p class="text-center py-8 text-red-300">データの読み込みに失敗しました</p>';
                console.error(error);
            }
        }

        // テーブル表示
        function renderTable(data) {
            const container = document.getElementById('dataContainer');
            
            if (data.length === 0) {
                container.innerHTML = '<p class="text-center py-8">データがありません</p>';
                return;
            }

            const keys = Object.keys(data[0]);
            let html = '<table class="w-full border-collapse">';
            
            // ヘッダー
            html += '<thead><tr>';
            keys.forEach(key => {
                html += '<th class="border border-white border-opacity-30 px-4 py-2 text-left">' + key + '</th>';
            });
            html += '</tr></thead>';
            
            // データ行
            html += '<tbody>';
            data.forEach(row => {
                html += '<tr>';
                keys.forEach(key => {
                    const value = row[key] !== null ? row[key] : '';
                    html += '<td class="border border-white border-opacity-30 px-4 py-2">' + value + '</td>';
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
    
    let sqlBackup = '-- 消防団デジタルノート データバックアップ\\n'
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
// 未実装ページ（Coming Soon）
// ==========================================
app.get('/logs', (c) => c.html(comingSoonPage('活動日誌', '📝')))
app.get('/members', (c) => c.html(comingSoonPage('団員管理', '👥')))
app.get('/stats', (c) => c.html(comingSoonPage('活動集計', '📊')))

// ==========================================
// 旧ログインページへのリダイレクト
// ==========================================
app.get('/login', (c) => c.redirect('/'))
app.get('/dashboard', (c) => c.redirect('/'))

export default app
