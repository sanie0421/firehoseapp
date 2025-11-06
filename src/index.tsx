import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

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
            <!-- 活動日誌 -->
            <a href="/logs" class="card-gradient-1 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">📝</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">活動日誌</h2>
                    <p class="text-center opacity-90">活動の記録・承認・PDF出力</p>
                </div>
            </a>

            <!-- ホース点検 -->
            <a href="/hose" class="card-gradient-2 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">🔧</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">ホース点検</h2>
                    <p class="text-center opacity-90">格納庫管理・点検記録</p>
                </div>
            </a>

            <!-- 訓練記録 -->
            <a href="/training" class="card-gradient-3 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">🏃</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">訓練記録</h2>
                    <p class="text-center opacity-90">訓練内容・参加者記録</p>
                </div>
            </a>

            <!-- 団員管理 -->
            <a href="/members" class="card-gradient-4 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">👥</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">団員管理</h2>
                    <p class="text-center opacity-90">団員情報・連絡先</p>
                </div>
            </a>

            <!-- 活動集計 -->
            <a href="/stats" class="card-gradient-5 rounded-2xl shadow-2xl p-8 card-hover">
                <div class="text-white">
                    <div class="text-7xl mb-6 text-center">📊</div>
                    <h2 class="text-2xl font-bold mb-3 text-center">活動集計</h2>
                    <p class="text-center opacity-90">実績データ・グラフ表示</p>
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
        #map { height: 400px; width: 100%; }
        .storage-card { cursor: pointer; }
        .storage-card:hover { transform: translateY(-2px); }
    </style>
</head>
<body class="bg-gray-100">
    <!-- ナビゲーションバー -->
    <nav class="bg-red-500 text-white p-4 shadow-lg">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <a href="/" class="flex items-center space-x-2">
                    <span class="text-2xl">🔥</span>
                    <div>
                        <div class="font-bold text-xl">消防団デジタルノート</div>
                        <div class="text-xs opacity-90">大井町消防団第一分団</div>
                    </div>
                </a>
            </div>
            <a href="/" class="text-sm hover:underline">← ホームに戻る</a>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <div class="flex justify-between items-center mb-8">
            <div>
                <h1 class="text-3xl font-bold text-gray-800">🔧 ホース格納庫管理</h1>
                <p class="text-gray-600">格納庫の登録・地図設定・点検記録</p>
            </div>
            <div class="space-x-2">
                <button onclick="showUploadModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
                    📥 CSV一括登録
                </button>
                <button onclick="showAddModal()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition">
                    ➕ 格納庫を追加
                </button>
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

                <!-- 地図で位置を設定 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🗺️ 地図で位置を設定（タップして位置を決定）
                    </label>
                    <div id="map" class="rounded-lg border-2 border-gray-300"></div>
                    <p class="text-sm text-gray-600 mt-2">
                        💡 地図をタップすると赤いピンが立ちます。位置を確認して保存してください。
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
                    <div class="col-span-full text-center py-12">
                        <div class="text-6xl mb-4">📦</div>
                        <p class="text-xl text-gray-600 mb-4">まだ格納庫が登録されていません</p>
                        <button onclick="showUploadModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition mr-2">
                            📥 CSV一括登録
                        </button>
                        <button onclick="showAddModal()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition">
                            ➕ 格納庫を追加
                        </button>
                    </div>
                \`;
                return;
            }

            list.innerHTML = storages.map(storage => \`
                <div class="bg-white rounded-xl shadow-lg p-6 storage-card transition" onclick="showDetail('\${storage.id}')">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-800">📦 \${storage.storage_number}</h3>
                        \${storage.latitude ? '<span class="text-green-500 text-sm">📍 地図設定済み</span>' : '<span class="text-orange-500 text-sm">⚠️ 地図未設定</span>'}
                    </div>
                    <p class="text-gray-700 mb-2">📍 \${storage.location}</p>
                    \${storage.address ? \`<p class="text-gray-600 text-sm mb-2">🏠 \${storage.address}</p>\` : ''}
                    \${storage.remarks ? \`<p class="text-gray-500 text-sm mb-4">💬 \${storage.remarks}</p>\` : ''}
                    
                    <div class="flex space-x-2 mt-4">
                        \${storage.latitude ? 
                            \`<button onclick="event.stopPropagation(); viewOnMap('\${storage.id}')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm transition">
                                🗺️ 地図を見る
                            </button>\` : 
                            \`<button onclick="event.stopPropagation(); editStorage('\${storage.id}')" class="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded text-sm transition">
                                📍 地図を設定
                            </button>\`
                        }
                        <button onclick="event.stopPropagation(); editStorage('\${storage.id}')" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded text-sm transition">
                            ✏️ 編集
                        </button>
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
                latitude: currentLat,
                longitude: currentLng,
                remarks: document.getElementById('remarks').value
            };

            try {
                const url = id ? \`/api/hose/storages/\${id}\` : '/api/hose/storages';
                const method = id ? 'PUT' : 'POST';
                
                const response = await fetch(url, {
                    method,
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
            detailContent.innerHTML = \`
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded">
                        <p class="font-bold">📍 \${storage.location}</p>
                        \${storage.address ? \`<p class="text-gray-600">🏠 \${storage.address}</p>\` : ''}
                    </div>
                    <div id="detailMap" style="height: 400px; width: 100%;"></div>
                </div>
            \`;

            document.getElementById('detailTitle').textContent = \`🗺️ \${storage.storage_number}\`;
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
  // テストデータ
  const storages = [
    {
      id: 'storage_001',
      storage_number: 'No.01',
      location: '◯◯公民館前',
      address: '大井町金子1234-5',
      google_maps_url: 'https://www.google.com/maps/@35.3340353,139.1516114,14z',
      latitude: 35.3604,
      longitude: 139.1386,
      remarks: '2020年設置'
    },
    {
      id: 'storage_002',
      storage_number: 'No.02',
      location: '△△集会所裏',
      address: '',
      google_maps_url: '',
      latitude: null,
      longitude: null,
      remarks: ''
    }
  ]

  return c.json({ storages })
})

// ==========================================
// API: 格納庫追加
// ==========================================
app.post('/api/hose/storages', async (c) => {
  const data = await c.req.json()
  // TODO: D1に保存
  return c.json({ success: true, id: 'storage_' + Date.now() })
})

// ==========================================
// API: 格納庫更新
// ==========================================
app.put('/api/hose/storages/:id', async (c) => {
  const id = c.req.param('id')
  const data = await c.req.json()
  // TODO: D1を更新
  return c.json({ success: true })
})

// ==========================================
// API: CSV一括登録
// ==========================================
app.post('/api/hose/storages/bulk', async (c) => {
  const { storages } = await c.req.json()
  // TODO: D1に一括保存
  return c.json({ success: true, count: storages.length })
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
// 未実装ページ（Coming Soon）
// ==========================================
app.get('/logs', (c) => c.html(comingSoonPage('活動日誌', '📝')))
app.get('/training', (c) => c.html(comingSoonPage('訓練記録', '🏃')))
app.get('/members', (c) => c.html(comingSoonPage('団員管理', '👥')))
app.get('/stats', (c) => c.html(comingSoonPage('活動集計', '📊')))

// ==========================================
// 旧ログインページへのリダイレクト
// ==========================================
app.get('/login', (c) => c.redirect('/'))
app.get('/dashboard', (c) => c.redirect('/'))

export default app
