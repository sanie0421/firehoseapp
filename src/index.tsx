import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

const app = new Hono()

// Enable CORS
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// ==========================================
// ログイン画面
// ==========================================
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>消防団デジタルノート - ログイン</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
    </style>
</head>
<body class="flex items-center justify-center min-h-screen p-4">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <!-- ロゴ・タイトル -->
        <div class="text-center mb-8">
            <div class="text-6xl mb-4">🔥</div>
            <h1 class="text-3xl font-bold text-gray-800 mb-2">消防団デジタルノート</h1>
            <p class="text-gray-600">三谷分団 活動管理システム</p>
        </div>

        <!-- ログインフォーム -->
        <form id="loginForm" class="space-y-6">
            <!-- メールアドレス -->
            <div>
                <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
                    📧 メールアドレス
                </label>
                <input 
                    type="email" 
                    id="email" 
                    name="email"
                    required
                    placeholder="example@example.com"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
            </div>

            <!-- パスワード -->
            <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                    🔒 パスワード
                </label>
                <input 
                    type="password" 
                    id="password" 
                    name="password"
                    required
                    placeholder="パスワードを入力"
                    class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition"
                />
            </div>

            <!-- エラーメッセージ -->
            <div id="errorMessage" class="hidden bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded">
                <p class="font-bold">❌ ログインエラー</p>
                <p id="errorText"></p>
            </div>

            <!-- ログインボタン -->
            <button 
                type="submit"
                class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition transform hover:scale-105 shadow-lg"
            >
                🚒 ログイン
            </button>
        </form>

        <!-- テスト用アカウント情報 -->
        <div class="mt-8 p-4 bg-blue-50 rounded-lg">
            <p class="text-sm font-bold text-blue-800 mb-2">📝 テストアカウント</p>
            <div class="text-xs text-blue-700 space-y-1">
                <p>🏅 <strong>分団長:</strong> mitani@example.com</p>
                <p>🏅 <strong>副分団長:</strong> seto@example.com</p>
                <p>👤 <strong>一般団員:</strong> saito@example.com</p>
                <p class="mt-2">🔑 <strong>パスワード:</strong> password123</p>
            </div>
        </div>
    </div>

    <script>
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const errorDiv = document.getElementById('errorMessage');
            const errorText = document.getElementById('errorText');

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    // ログイン成功
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    window.location.href = '/dashboard';
                } else {
                    // ログイン失敗
                    errorDiv.classList.remove('hidden');
                    errorText.textContent = data.message || 'メールアドレスまたはパスワードが正しくありません';
                }
            } catch (error) {
                errorDiv.classList.remove('hidden');
                errorText.textContent = 'ログイン処理中にエラーが発生しました';
            }
        });
    </script>
</body>
</html>
  `)
})

// ==========================================
// ダッシュボード画面（ログイン後）
// ==========================================
app.get('/dashboard', (c) => {
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
                <span class="font-bold text-xl">消防団デジタルノート</span>
            </div>
            <div class="flex items-center space-x-4">
                <span id="userName" class="text-sm"></span>
                <button onclick="logout()" class="bg-red-700 hover:bg-red-800 px-4 py-2 rounded transition">
                    ログアウト
                </button>
            </div>
        </div>
    </nav>

    <!-- メインコンテンツ -->
    <div class="container mx-auto px-4 py-8">
        <h1 class="text-3xl font-bold text-gray-800 mb-8">ダッシュボード</h1>

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

        <!-- 開発中メッセージ -->
        <div class="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p class="text-yellow-800">
                <strong>⚠️ 開発中:</strong> 現在、各機能を順次実装中です。ログイン機能とダッシュボードは完成しました！
            </p>
        </div>
    </div>

    <script>
        // ログイン確認
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user') || '{}');

        if (!token) {
            window.location.href = '/';
        } else {
            document.getElementById('userName').textContent = user.name || '';
        }

        // ログアウト
        function logout() {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: ログイン
// ==========================================
app.post('/api/login', async (c) => {
  const { email, password } = await c.req.json()

  // 簡易認証（後でJWT実装）
  // テストユーザー
  const testUsers = [
    { id: 'user_001', email: 'mitani@example.com', password: 'password123', name: '三谷　誠', role: 'leader' },
    { id: 'user_002', email: 'seto@example.com', password: 'password123', name: '瀬戸　毅', role: 'viceleader' },
    { id: 'user_004', email: 'saito@example.com', password: 'password123', name: '斉藤　貴禎', role: 'member' }
  ]

  const user = testUsers.find(u => u.email === email && u.password === password)

  if (user) {
    // ログイン成功
    return c.json({
      success: true,
      token: 'dummy-jwt-token-' + user.id,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } else {
    // ログイン失敗
    return c.json({
      success: false,
      message: 'メールアドレスまたはパスワードが正しくありません'
    }, 401)
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
    <title>${title} - 消防団デジタルノート</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 flex items-center justify-center min-h-screen">
    <div class="text-center">
        <div class="text-9xl mb-4">${icon}</div>
        <h1 class="text-4xl font-bold text-gray-800 mb-4">${title}</h1>
        <p class="text-xl text-gray-600 mb-8">準備中...</p>
        <a href="/dashboard" class="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition">
            ← ダッシュボードに戻る
        </a>
    </div>
</body>
</html>
  `
}

app.get('/logs', (c) => c.html(comingSoonPage('活動日誌', '📝')))
app.get('/hose', (c) => c.html(comingSoonPage('ホース点検', '🔧')))
app.get('/training', (c) => c.html(comingSoonPage('訓練記録', '🏃')))
app.get('/members', (c) => c.html(comingSoonPage('団員管理', '👥')))
app.get('/stats', (c) => c.html(comingSoonPage('活動集計', '📊')))

export default app
