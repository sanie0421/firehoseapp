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
    <title>ダッシュボード - 消防団デジタルノート</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100">
    <!-- ナビゲーションバー -->
    <nav class="bg-red-500 text-white p-4 shadow-lg">
        <div class="container mx-auto flex justify-between items-center">
            <div class="flex items-center space-x-2">
                <span class="text-2xl">🔥</span>
                <div>
                    <div class="font-bold text-xl">消防団デジタルノート</div>
                    <div class="text-xs opacity-90">大井町消防団第一分団</div>
                </div>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">ホーム</h1>
        <p class="text-gray-600 mb-8">記録したい項目を選んでください</p>

        <!-- 機能カード -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- 活動日誌 -->
            <a href="/logs" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="text-5xl mb-4">📝</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">活動日誌</h2>
                <p class="text-gray-600 text-sm">活動の記録・承認・PDF出力</p>
            </a>

            <!-- ホース点検 -->
            <a href="/hose" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="text-5xl mb-4">🔧</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">ホース点検</h2>
                <p class="text-gray-600 text-sm">格納庫管理・点検記録</p>
            </a>

            <!-- 訓練記録 -->
            <a href="/training" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="text-5xl mb-4">🏃</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">訓練記録</h2>
                <p class="text-gray-600 text-sm">訓練内容・参加者記録</p>
            </a>

            <!-- 団員管理 -->
            <a href="/members" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="text-5xl mb-4">👥</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">団員管理</h2>
                <p class="text-gray-600 text-sm">団員情報・連絡先</p>
            </a>

            <!-- 活動集計 -->
            <a href="/stats" class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition transform hover:-translate-y-1">
                <div class="text-5xl mb-4">📊</div>
                <h2 class="text-xl font-bold text-gray-800 mb-2">活動集計</h2>
                <p class="text-gray-600 text-sm">実績データ・グラフ表示</p>
            </a>
        </div>

        <!-- 使い方案内 -->
        <div class="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <p class="text-blue-800">
                <strong>💡 使い方:</strong> 各カードをクリックすると記録画面が開きます。記録者は記入時に選べます！
            </p>
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
// 未実装ページ（Coming Soon）
// ==========================================
app.get('/logs', (c) => c.html(comingSoonPage('活動日誌', '📝')))
app.get('/hose', (c) => c.html(comingSoonPage('ホース点検', '🔧')))
app.get('/training', (c) => c.html(comingSoonPage('訓練記録', '🏃')))
app.get('/members', (c) => c.html(comingSoonPage('団員管理', '👥')))
app.get('/stats', (c) => c.html(comingSoonPage('活動集計', '📊')))

// ==========================================
// 旧ログインページへのリダイレクト
// ==========================================
app.get('/login', (c) => c.redirect('/'))
app.get('/dashboard', (c) => c.redirect('/'))

export default app
