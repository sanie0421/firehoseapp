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
// Serve root-level files (images, etc.)
app.use('/*.png', serveStatic({ root: './' }))
app.use('/*.jpg', serveStatic({ root: './' }))
app.use('/*.gif', serveStatic({ root: './' }))
app.use('/*.svg', serveStatic({ root: './' }))

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
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <style>
        body {
            background: #f5f5f5;
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }
        
        /* ヘッダー赤背景 */
        .header-red {
            background: linear-gradient(135deg, #dc143c 0%, #b91c2e 100%);
        }
        
        /* iOS風アイコンスタイル */
        .function-card {
            text-align: center;
            text-decoration: none;
            display: block;
        }
        .ios-icon-wrapper {
            position: relative;
            border-radius: 22%;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 2px 4px rgba(0, 0, 0, 0.1);
            transition: all 0.2s cubic-bezier(0.4, 0.0, 0.2, 1);
            padding: 12px;
            margin-bottom: 8px;
        }
        .ios-icon-wrapper:active {
            transform: scale(0.92);
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
        }
        .ios-icon-wrapper img {
            width: 100%;
            height: auto;
            display: block;
        }
        /* iOS風グラデーション背景（スッキリした落ち着いたトーン） */
        .icon-hose-bg { background: linear-gradient(135deg, #546E7A 0%, #607D8B 100%); }
        .icon-tank-bg { background: linear-gradient(135deg, #455A64 0%, #546E7A 100%); }
        .icon-action-bg { background: linear-gradient(135deg, #757575 0%, #9E9E9E 100%); }
        .icon-stats-bg { background: linear-gradient(135deg, #66BB6A 0%, #81C784 100%); }
        .icon-members-bg { background: linear-gradient(135deg, #7E57C2 0%, #9575CD 100%); }
        .icon-admin-bg { background: linear-gradient(135deg, #5C6BC0 0%, #7986CB 100%); }
        
        .function-card h3 {
            font-size: 13px;
            font-weight: 700;
            color: #333;
            margin: 0;
            text-shadow: 0 1px 3px rgba(255,255,255,0.8);
        }
        
        /* 火災情報カード */
        .fire-info-card {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-bottom: 16px;
        }
        
        /* Fire Safety Tips */
        .fire-tips {
            background: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            margin-top: 20px;
        }
        .fire-tips-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
        }
        .fire-tips-content {
            font-size: 13px;
            line-height: 1.6;
            color: #555;
        }
        .fire-tips-source {
            font-size: 11px;
            color: #999;
            margin-top: 8px;
        }
        
        /* 火災時の点滅アニメーション */
        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
        }
        
        @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <!-- ヘッダー -->
    <div class="header-red" style="box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
        <div style="max-width: 1200px; margin: 0 auto; padding: 12px 16px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <img src="/kanagawa-logo.png" alt="Logo" style="width: 48px; height: 48px;">
                    <div>
                        <h1 style="color: white; font-size: 18px; font-weight: 600; margin: 0;">活動記録</h1>
                        <p style="color: rgba(255,255,255,0.9); font-size: 13px; margin: 0;">大井町消防団第一分団</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- メインコンテンツ -->
    <div style="max-width: 1200px; margin: 0 auto; padding: 16px;">
        <!-- 火災情報カード -->
        <div class="fire-info-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span id="fireInfoIcon" style="font-size: 20px;">🔥</span>
                    <span style="font-size: 14px; font-weight: 600; color: #333;">火災情報</span>
                </div>
                <button onclick="loadFireInfo()" id="fireInfoReloadBtn" style="background: #2196f3; color: white; border: none; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                    <i class="fas fa-sync-alt" id="fireInfoReloadIcon" style="font-size: 11px;"></i>
                    更新
                </button>
            </div>
            <div id="fireInfoContent" style="font-size: 13px; line-height: 1.6; color: #555;">
                <i class="fas fa-spinner fa-spin"></i> 読み込み中...
            </div>
            <div id="fireInfoTimestamp" style="font-size: 11px; color: #999; margin-top: 8px;"></div>
        </div>
        
        <!-- 機能メニュー - iOS風アイコン -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
            <!-- ホース点検 -->
            <a href="/inspection-priority" class="function-card">
                <div class="ios-icon-wrapper icon-hose-bg">
                    <img src="/hose-icon.png" alt="ホース点検">
                </div>
                <h3>ホース点検</h3>
            </a>
            
            <!-- 防火水槽点検 -->
            <a href="/water-tanks" class="function-card">
                <div class="ios-icon-wrapper icon-tank-bg">
                    <img src="/suisou-icon.png" alt="防火水槽点検">
                </div>
                <h3>防火水槽点検</h3>
            </a>
            
            <!-- 要対応事項 -->
            <a href="/action-required" class="function-card">
                <div class="ios-icon-wrapper icon-action-bg">
                    <img src="/task-icon.png" alt="要対応事項">
                </div>
                <h3>要対応事項</h3>
            </a>
            
            <!-- 活動集計 -->
            <a href="/stats" class="function-card">
                <div class="ios-icon-wrapper icon-stats-bg">
                    <img src="/statistics-icon.png" alt="活動集計">
                </div>
                <h3>活動集計</h3>
            </a>
            
            <!-- 団員名簿 -->
            <a href="/members" class="function-card">
                <div class="ios-icon-wrapper icon-members-bg">
                    <img src="/members-icon.png" alt="団員名簿">
                </div>
                <h3>団員名簿</h3>
            </a>
            
            <!-- データ管理 -->
            <a href="/admin" class="function-card">
                <div class="ios-icon-wrapper icon-admin-bg">
                    <img src="/database-icon.png" alt="データ管理">
                </div>
                <h3>データ管理</h3>
            </a>
        </div>
        
        <!-- Fire Safety Tips -->
        <div class="fire-tips">
            <div class="fire-tips-header">
                <div style="display: flex; align-items: center; gap: 8px; flex: 1;">
                    <span style="font-size: 18px;">🔥</span>
                    <span style="font-size: 14px; font-weight: 600; color: #333;">Fire Safety Tips</span>
                </div>
                <button onclick="refreshTip()" style="background: #f5f5f5; border: none; padding: 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <i class="fas fa-sync-alt" id="tipRefreshIcon" style="font-size: 14px; color: #666;"></i>
                </button>
            </div>
            <div class="fire-tips-content">
                <p id="fireTip" style="margin: 0;"></p>
                <p id="fireTipSource" class="fire-tips-source" style="margin: 0;"></p>
            </div>
        </div>
    </div>

    <script>
        // 防災豆知識データ（50以上の豊富な情報）
        const fireSafetyTips = [
            { tip: '消火器の使い方は「ピン・ポン・パン」で覚えよう！ピン（安全ピンを抜く）、ポン（ホースを火元に向ける）、パン（レバーを握る）の順番です。', source: '総務省消防庁「消火器の使い方」' },
            { tip: '火災発生時は、煙を吸わないよう姿勢を低くして避難しましょう。煙は天井付近に溜まるため、床に近いほど安全です。', source: '東京消防庁「火災時の避難方法」' },
            { tip: '住宅用火災警報器の電池寿命は約10年です。定期的に動作確認を行い、古くなったら交換しましょう。', source: '総務省消防庁「住宅用火災警報器の維持管理」' },
            { tip: '天ぷら油火災には絶対に水をかけてはいけません！消火器を使うか、濡れたシーツで覆って酸素を遮断しましょう。', source: '東京消防庁「天ぷら油火災への対応」' },
            { tip: '地震後の通電火災を防ぐため、避難時はブレーカーを落としましょう。', source: '総務省消防庁「地震火災対策」' },
            { tip: '119番通報では、場所・火災か救急か・状況を落ち着いて伝えましょう。', source: '総務省消防庁「119番通報のポイント」' },
            { tip: '消防団員は全国に約81万人います（2023年4月時点）。年々減少傾向にあるため、地域の消防力維持が課題となっています。', source: '総務省消防庁「消防団員数の現状」令和5年版消防白書' },
            { tip: '消防団の出動手当は自治体により異なりますが、5,000円以下が大半です。', source: '総務省消防庁「消防団員の処遇等に関する調査結果」令和4年度' },
            { tip: '機能別消防団員制度により、特定の活動（予防広報、大規模災害対応など）に限定した活動が可能です。', source: '総務省消防庁「機能別団員・分団制度」' },
            { tip: '消防団協力事業所表示制度により、従業員の消防団活動に協力する事業所を表彰・PRできます。', source: '総務省消防庁「消防団協力事業所表示制度」' },
            { tip: '消防団は「自らの地域は自らで守る」という精神に基づく、地域防災の要です。', source: '総務省消防庁「消防団の役割」' }
        ];

        function refreshTip() {
            const randomIndex = Math.floor(Math.random() * fireSafetyTips.length);
            const tip = fireSafetyTips[randomIndex];
            document.getElementById('fireTip').textContent = tip.tip;
            document.getElementById('fireTipSource').textContent = '出典: ' + tip.source;
            
            const icon = document.getElementById('tipRefreshIcon');
            icon.style.transform = 'rotate(360deg)';
            setTimeout(() => { icon.style.transform = 'rotate(0deg)'; }, 300);
        }

        async function loadFireInfo() {
            const content = document.getElementById('fireInfoContent');
            const timestamp = document.getElementById('fireInfoTimestamp');
            const icon = document.getElementById('fireInfoIcon');
            const card = document.querySelector('.fire-info-card');
            const reloadIcon = document.getElementById('fireInfoReloadIcon');
            
            reloadIcon.style.animation = 'spin 1s linear infinite';
            
            try {
                const response = await fetch('/api/fire-info');
                const data = await response.json();
                
                if (data.success && data.hasData) {
                    const message = data.message || '';
                    
                    // 大井町で火災発生の場合（赤・点滅）
                    if (message.includes('大井町') || message.includes('大井')) {
                        icon.textContent = '🚨';
                        card.style.background = '#ffebee';
                        card.style.borderLeft = '4px solid #d32f2f';
                        card.style.animation = 'blink 1s infinite';
                        content.innerHTML = '<strong style="color: #d32f2f; font-size: 15px;">⚠️ ' + message + '</strong>';
                    } 
                    // 他地域で火災（色なし・グレー）
                    else {
                        icon.textContent = '🔥';
                        card.style.background = 'white';
                        card.style.borderLeft = 'none';
                        card.style.animation = 'none';
                        content.innerHTML = '<span style="color: #666;">' + message + '</span>';
                    }
                    
                    if (data.timestamp) {
                        timestamp.textContent = '発生時刻: ' + data.timestamp;
                        timestamp.style.color = message.includes('大井町') || message.includes('大井') ? '#d32f2f' : '#999';
                    }
                } else {
                    // 平常時（色なし・グレー）
                    icon.textContent = '✅';
                    card.style.background = 'white';
                    card.style.borderLeft = 'none';
                    card.style.animation = 'none';
                    content.innerHTML = '<span style="color: #666;">' + (data.message || '現在、災害は発生しておりません') + '</span>';
                    timestamp.textContent = '最終確認: ' + (data.lastUpdated || new Date().toLocaleString('ja-JP'));
                    timestamp.style.color = '#999';
                }
            } catch (error) {
                console.error('Fire info error:', error);
                // エラー時（オレンジ）
                icon.textContent = '⚠️';
                card.style.background = '#fff3e0';
                card.style.borderLeft = '4px solid #f57c00';
                card.style.animation = 'none';
                content.innerHTML = '<span style="color: #f57c00;">火災情報の取得に失敗しました</span>';
                timestamp.textContent = '';
            }
            
            reloadIcon.style.animation = '';
        }

        // 初期化
        refreshTip();
        loadFireInfo();
        
        // 5分ごとに火災情報を自動更新
        setInterval(loadFireInfo, 5 * 60 * 1000);
    </script>
</body>
</html>
  `)
})

// ===========================================
// 【API: 火災情報】
// ===========================================
app.get('/api/fire-info', async (c) => {
  try {
    const response = await fetch('http://odawara-saigai.sakura.ne.jp/saigai/')
    const buffer = await response.arrayBuffer()
    
    // Shift_JISからUTF-8に変換
    const decoder = new TextDecoder('shift-jis')
    const html = decoder.decode(buffer)

    // 時刻情報を抽出
    const timeMatch = html.match(/<font class="TIME">(.*?)<\/font>/i)
    const timestamp = timeMatch ? timeMatch[1].trim() : ''
    
    // 本文（災害情報の詳細）を抽出
    // class="SGINFO" テーブル内の本文を探す
    const contentMatch = html.match(/<table[^>]*class="SGINFO"[^>]*>([\s\S]*?)<\/table>/i)
    
    let message = ''
    let hasDisaster = false
    
    if (contentMatch && contentMatch[1]) {
      // <td width="830" ...> の中身を抽出
      const tdMatch = contentMatch[1].match(/<td[^>]*width="830"[^>]*>(.*?)<\/td>/i)
      
      if (tdMatch && tdMatch[1]) {
        // テキストを抽出（HTMLタグを除去）
        const content = tdMatch[1]
          .replace(/<[^>]*>/g, '') // HTMLタグ除去
          .replace(/&nbsp;/g, ' ') // &nbsp;をスペースに
          .replace(/\r?\n/g, '') // 改行削除
          .trim()
        
        // 実際の災害情報があるか確認（10文字以上）
        if (content && content.length > 10 && !content.includes('&nbsp;')) {
          message = content
          hasDisaster = true
        }
      }
    }
    
    // 本文が見つからない場合は「災害は発生しておりません」
    if (!hasDisaster) {
      message = '現在、災害は発生しておりません。'
    }

    return c.json({
      success: true,
      hasData: hasDisaster,
      message: message,
      timestamp: timestamp,
      lastUpdated: new Date().toLocaleString('ja-JP', { 
        timeZone: 'Asia/Tokyo',
        month: 'numeric',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    })
  } catch (error) {
    console.error('Fire info fetch error:', error)
    return c.json({
      success: false,
      error: 'データ取得エラー',
      lastUpdated: new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })
    }, 500)
  }
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
    // 現役団員のみ（status=1）を返す
    const result = await env.DB.prepare(`
      SELECT id, name, birth_date, join_date, created_at, updated_at
      FROM users
      WHERE status = 1
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
    // active_only パラメータは将来のために残すが、今はすべてのユーザーを返す
    // （usersテーブルにstatus/is_activeカラムが存在しないため）
    
    const query = `
      SELECT id, name, birth_date, join_date, retirement_date, status, created_at, updated_at
      FROM users
      ORDER BY join_date ASC, name ASC
    `
    
    const result = await env.DB.prepare(query).all()
    
    return c.json({ users: result.results })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ users: [] })
  }
})

// ==========================================
// API: 団員ステータス変更
// ==========================================
app.put('/api/users/:id/status', async (c) => {
  try {
    const userId = c.req.param('id')
    const { status } = await c.req.json() as { status: number }
    const env = c.env as { DB: D1Database }
    
    // status: 1=現役, 2=OB, 3=退団
    if (![1, 2, 3].includes(status)) {
      return c.json({ error: 'Invalid status value' }, 400)
    }
    
    const now = new Date().toISOString().split('T')[0] // YYYY-MM-DD
    
    // ステータスに応じて retirement_date を設定
    if (status === 1) {
      // 現役に戻す場合、retirement_date をクリア
      await env.DB.prepare(`
        UPDATE users
        SET status = ?, retirement_date = NULL, updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).bind(status, userId).run()
    } else {
      // OBまたは退団の場合
      // 既存のretirement_dateがあれば保持、なければ今日の日付を設定
      await env.DB.prepare(`
        UPDATE users
        SET status = ?, 
            retirement_date = COALESCE(retirement_date, ?),
            updated_at = datetime('now', 'localtime')
        WHERE id = ?
      `).bind(status, now, userId).run()
    }
    
    return c.json({ success: true, status, userId })
  } catch (error) {
    console.error('Status update error:', error)
    return c.json({ error: 'Failed to update status' }, 500)
  }
})

// ==========================================
// API: 不在期間取得（特定団員）
// ==========================================
app.get('/api/absence-periods/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT * FROM absence_periods
      WHERE user_id = ?
      ORDER BY start_date DESC
    `).bind(userId).all()
    
    return c.json({ periods: result.results })
  } catch (error) {
    console.error('Get absence periods error:', error)
    return c.json({ periods: [] })
  }
})

// ==========================================
// API: 不在期間追加
// ==========================================
app.post('/api/absence-periods', async (c) => {
  try {
    const { user_id, start_date, end_date, reason } = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'absence_' + Date.now()
    
    await env.DB.prepare(`
      INSERT INTO absence_periods (id, user_id, start_date, end_date, reason, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now', 'localtime'), datetime('now', 'localtime'))
    `).bind(id, user_id, start_date, end_date, reason).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Add absence period error:', error)
    return c.json({ error: 'Failed to add absence period' }, 500)
  }
})

// ==========================================
// API: 不在期間削除
// ==========================================
app.delete('/api/absence-periods/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      DELETE FROM absence_periods WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Delete absence period error:', error)
    return c.json({ error: 'Failed to delete absence period' }, 500)
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
// API: 団員新規登録
// ==========================================
app.post('/api/members', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // デフォルト値設定
    const email = data.email || `${id}@example.com`
    const password_hash = 'default_hash' // ログイン機能実装時に変更
    const role = data.role || 'member'
    const join_year = data.join_date ? new Date(data.join_date).getFullYear() : null
    
    await env.DB.prepare(`
      INSERT INTO users (
        id, email, password_hash, name, role, position, 
        join_date, birth_date, blood_type, phone, phone_mobile,
        address, district, occupation, company_name, 
        join_year, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
    `).bind(
      id, email, password_hash, data.name, role, data.position || null,
      data.join_date || null, data.birth_date || null, data.blood_type || null,
      data.phone || null, data.phone_mobile || null, data.address || null,
      data.district || null, data.occupation || null, data.company_name || null,
      join_year, now, now
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
// API: 防火水槽 - 一覧取得
// ==========================================
app.get('/api/water-tanks', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    const result = await env.DB.prepare(`
      SELECT 
        wt.*,
        MAX(wti.inspection_date) as last_inspection_date
      FROM water_tanks wt
      LEFT JOIN water_tank_inspections wti ON wt.id = wti.tank_id
      GROUP BY wt.id
      ORDER BY 
        CASE 
          WHEN MAX(wti.inspection_date) IS NULL THEN 0
          ELSE 1
        END,
        MAX(wti.inspection_date) ASC
    `).all()
    
    return c.json({ tanks: result.results || [] })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ tanks: [] }, 500)
  }
})

// API: 防火水槽 - 新規作成
app.post('/api/water-tanks', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    
    // Google Maps URLから座標を自動抽出
    let latitude = null
    let longitude = null
    
    if (data.google_maps_url) {
      try {
        // 短縮URLの場合は展開
        if (data.google_maps_url.includes('maps.app.goo.gl') || data.google_maps_url.includes('goo.gl')) {
          const expandResponse = await fetch(data.google_maps_url, { 
            method: 'HEAD',
            redirect: 'follow'
          })
          const expandedUrl = expandResponse.url
          
          // 展開後のURLから座標を抽出
          const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
          
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          } else if (qMatch) {
            latitude = parseFloat(qMatch[1])
            longitude = parseFloat(qMatch[2])
          }
        } else {
          // 通常のURLから座標を抽出
          const atMatch = data.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          }
        }
      } catch (e) {
        console.error('座標抽出エラー:', e)
      }
    }
    
    await env.DB.prepare(`
      INSERT INTO water_tanks (
        id, storage_id, location, capacity, google_maps_url, latitude, longitude, image_url, notes, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.storage_id,
      data.location,
      data.capacity || null,
      data.google_maps_url || null,
      latitude,
      longitude,
      data.image_url || null,
      data.notes || null,
      now,
      now
    ).run()
    
    return c.json({ success: true, id })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// API: 防火水槽 - 更新
app.put('/api/water-tanks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    const now = new Date().toISOString()
    
    // Google Maps URLから座標を自動抽出
    let latitude = null
    let longitude = null
    
    if (data.google_maps_url) {
      try {
        if (data.google_maps_url.includes('maps.app.goo.gl') || data.google_maps_url.includes('goo.gl')) {
          const expandResponse = await fetch(data.google_maps_url, { 
            method: 'HEAD',
            redirect: 'follow'
          })
          const expandedUrl = expandResponse.url
          const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          } else if (qMatch) {
            latitude = parseFloat(qMatch[1])
            longitude = parseFloat(qMatch[2])
          }
        } else {
          const atMatch = data.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          }
        }
      } catch (e) {
        console.error('座標抽出エラー:', e)
      }
    }
    
    await env.DB.prepare(`
      UPDATE water_tanks SET
        storage_id = ?,
        location = ?,
        capacity = ?,
        google_maps_url = ?,
        latitude = ?,
        longitude = ?,
        image_url = ?,
        notes = ?,
        updated_at = ?
      WHERE id = ?
    `).bind(
      data.storage_id,
      data.location,
      data.capacity || null,
      data.google_maps_url || null,
      latitude,
      longitude,
      data.image_url || null,
      data.notes || null,
      now,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// API: 防火水槽 - 削除
app.delete('/api/water-tanks/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    // まず関連する点検記録を削除
    await env.DB.prepare(`
      DELETE FROM water_tank_inspections WHERE tank_id = ?
    `).bind(id).run()
    
    // 次に防火水槽を削除
    await env.DB.prepare(`
      DELETE FROM water_tanks WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return c.json({ success: false, error: errorMessage }, 500)
  }
})

// API: 防火水槽点検 - 一覧取得
app.get('/api/water-tank-inspections', async (c) => {
  try {
    const tankId = c.req.query('tank_id')
    const env = c.env as { DB: D1Database }
    
    let query = `
      SELECT 
        wti.*,
        wt.location as tank_name,
        u.name as inspector_name
      FROM water_tank_inspections wti
      LEFT JOIN water_tanks wt ON wti.tank_id = wt.id
      LEFT JOIN users u ON wti.inspector_id = u.id
    `
    
    if (tankId) {
      query += ` WHERE wti.tank_id = ?`
    }
    
    query += ` ORDER BY wti.inspection_date DESC LIMIT 100`
    
    const stmt = env.DB.prepare(query)
    const result = tankId ? await stmt.bind(tankId).all() : await stmt.all()
    
    return c.json({ inspections: result.results || [] })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ inspections: [] }, 500)
  }
})

// API: 防火水槽点検 - 新規作成
app.post('/api/water-tank-inspections', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database, IMAGES: R2Bucket }
    const now = new Date().toISOString()
    
    // R2画像アップロード処理
    let imageUrls: string[] = []
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      for (const imageData of data.images) {
        const key = `water-tank-inspections/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        // Base64デコード
        const base64Data = imageData.split(',')[1] || imageData
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        await env.IMAGES.put(key, bytes, { httpMetadata: { contentType: 'image/jpeg' } })
        imageUrls.push(key)
      }
    }
    
    await env.DB.prepare(`
      INSERT INTO water_tank_inspections (
        tank_id, inspector_id, inspection_date, water_level, water_quality, 
        lid_condition, image_urls, comment, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.tank_id,
      data.inspector_id,
      data.inspection_date,
      data.water_level || null,
      data.water_quality || null,
      data.lid_condition || null,
      imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      data.comment || null,
      now
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, 500)
  }
})

// API: 防火水槽点検 - 更新
app.put('/api/water-tank-inspections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database, IMAGES: R2Bucket }
    
    // R2画像アップロード処理
    let imageUrls: string[] = []
    if (data.images && Array.isArray(data.images) && data.images.length > 0) {
      for (const imageData of data.images) {
        const key = `water-tank-inspections/${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
        const base64Data = imageData.split(',')[1] || imageData
        const binaryString = atob(base64Data)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i)
        }
        await env.IMAGES.put(key, bytes, { httpMetadata: { contentType: 'image/jpeg' } })
        imageUrls.push(key)
      }
    }
    
    await env.DB.prepare(`
      UPDATE water_tank_inspections SET
        inspector_id = ?,
        inspection_date = ?,
        water_level = ?,
        water_quality = ?,
        lid_condition = ?,
        image_urls = ?,
        comment = ?
      WHERE id = ?
    `).bind(
      data.inspector_id,
      data.inspection_date,
      data.water_level || null,
      data.water_quality || null,
      data.lid_condition || null,
      imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
      data.comment || null,
      id
    ).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// API: 防火水槽点検 - 削除
app.delete('/api/water-tank-inspections/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      DELETE FROM water_tank_inspections WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: R2画像取得
// ==========================================
app.get('/api/r2/:key{.*}', async (c) => {
  try {
    const env = c.env as { IMAGES: R2Bucket }
    const key = c.req.param('key')
    
    const object = await env.IMAGES.get(key)
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
    console.error('R2 error:', error)
    return c.notFound()
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
        flashlights, flashlight_charge,
        water_discharge, vehicle_power_off_confirmed_by, radio_charge_confirmed_by,
        remarks, special_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      data.flashlights,
      toNullIfEmpty(data.flashlight_charge),
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
        flashlights = ?,
        flashlight_charge = ?,
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
      data.flashlights,
      toNullIfEmpty(data.flashlight_charge),
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
// ホースホース管理画面
// ==========================================
app.get('/hose', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ホースホース管理 - 活動記録</title>
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
                <h1 class="text-3xl font-bold mb-2 text-gray-800">🔧 ホースホース管理 <span id="hoseStorageCount" class="text-xl text-gray-500">(読み込み中...)</span></h1>
                <p class="text-base text-gray-600">ホースホースの登録・地図設定・点検記録</p>
            </div>
            <div class="flex flex-col space-y-3">
                <button id="showAddModalBtn" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    ➕ ホースホースを追加
                </button>
                <button id="showUploadModalBtn" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    📥 Excel/CSV一括登録
                </button>
                <button id="showDistrictUploadModalBtn" class="w-full bg-purple-500 hover:bg-purple-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    🏘️ 地区一括登録
                </button>
            </div>
        </div>

        <!-- 検索ボックス -->
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <label for="searchBox" class="block text-lg font-bold text-gray-800 mb-3">🔍 検索・フィルター</label>
            <input 
                type="text" 
                id="searchBox" 
                placeholder="番号、場所、地区で検索..." 
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-3"
            >
            
            <!-- フィルターボタン -->
            <div class="grid grid-cols-3 gap-2">
                <button id="filterAll" onclick="setFilter('all')" class="px-4 py-2 rounded-lg font-bold transition bg-blue-500 text-white">
                    📦 すべて
                </button>
                <button id="filterNoMap" onclick="setFilter('nomap')" class="px-4 py-2 rounded-lg font-bold transition bg-gray-200 text-gray-700 hover:bg-gray-300">
                    ⚠️ 地図未設定
                </button>
                <button id="filterNoImage" onclick="setFilter('noimage')" class="px-4 py-2 rounded-lg font-bold transition bg-gray-200 text-gray-700 hover:bg-gray-300">
                    📷 画像未追加
                </button>
            </div>
            
            <p class="text-sm text-gray-600 mt-2">💡 ホース番号、場所、地区名で絞り込みできます</p>
        </div>

        <!-- ホースホース一覧 -->
        <div id="storageList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <!-- JavaScriptで動的に生成 -->
        </div>
    </div>

    <!-- Excel/CSV一括登録モーダル -->
    <div id="uploadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
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
                    <pre class="text-sm bg-white p-3 rounded border overflow-x-auto">ホースホース番号 | 場所の目安 | 地区 | 備考
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
    <div id="districtUploadModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
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

    <!-- ホース追加/編集モーダル -->
    <div id="addModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-start justify-center p-4 py-8">
            <div class="bg-white rounded-xl shadow-2xl max-w-4xl w-full p-6">
            <div class="flex justify-between items-center mb-6">
                <h2 class="text-2xl font-bold text-gray-800" id="modalTitle">📦 ホースホースを追加</h2>
                <button id="closeAddModalBtn" class="text-gray-500 hover:text-gray-700">✕</button>
            </div>

            <form id="storageForm" class="space-y-6">
                <input type="hidden" id="storageId" value="">

                <!-- ホース番号 -->
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        🏷️ ホースホース番号 <span class="text-red-500">*</span>
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
                    <p class="text-sm text-orange-600 font-bold mt-1">
                        ⚠️ Google Maps URLがある場合はそちらが優先されます。新規登録時は地図クリックが便利です。
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
                        📷 ホースの写真（任意）
                    </label>
                    <input type="file" id="storageImage" accept="image/*"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500">
                    <p class="text-sm text-gray-600 mt-1">
                        💡 ホースの外観や破損状況の写真をアップロードできます
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

    <!-- ホースホース詳細モーダル（地図表示） -->
    <div id="detailModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
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
        let currentFilter = 'all'; // 'all', 'nomap', 'noimage'

        // フィルター切り替え
        function setFilter(filter) {
            currentFilter = filter;
            
            // ボタンのスタイルを切り替え
            const filterAll = document.getElementById('filterAll');
            const filterNoMap = document.getElementById('filterNoMap');
            const filterNoImage = document.getElementById('filterNoImage');
            
            // 全てのボタンをリセット
            filterAll.classList.remove('bg-blue-500', 'text-white');
            filterAll.classList.add('bg-gray-200', 'text-gray-700');
            filterNoMap.classList.remove('bg-orange-500', 'text-white');
            filterNoMap.classList.add('bg-gray-200', 'text-gray-700');
            filterNoImage.classList.remove('bg-purple-500', 'text-white');
            filterNoImage.classList.add('bg-gray-200', 'text-gray-700');
            
            // 選択されたボタンをハイライト
            if (filter === 'all') {
                filterAll.classList.add('bg-blue-500', 'text-white');
                filterAll.classList.remove('bg-gray-200', 'text-gray-700');
            } else if (filter === 'nomap') {
                filterNoMap.classList.add('bg-orange-500', 'text-white');
                filterNoMap.classList.remove('bg-gray-200', 'text-gray-700');
            } else if (filter === 'noimage') {
                filterNoImage.classList.add('bg-purple-500', 'text-white');
                filterNoImage.classList.remove('bg-gray-200', 'text-gray-700');
            }
            
            renderStorages();
        }

        // ページ読み込み時
        window.onload = function() {
            loadStorages();
            
            // 検索ボックスのイベントリスナー
            const searchBox = document.getElementById('searchBox');
            if (searchBox) {
                searchBox.addEventListener('input', function() {
                    renderStorages();
                });
            }
            
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

        // ホースホース一覧を読み込み
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

        // ホースホース一覧を表示（検索対応 + フィルター対応）
        function renderStorages() {
            const list = document.getElementById('storageList');
            const searchBox = document.getElementById('searchBox');
            const searchTerm = searchBox ? searchBox.value.toLowerCase().trim() : '';
            const countElement = document.getElementById('hoseStorageCount');
            
            // 総数を更新
            if (countElement) {
                countElement.textContent = '(' + storages.length + '件)';
            }
            
            // フィルター適用
            let filteredStorages = storages;
            
            // 地図未設定フィルター
            if (currentFilter === 'nomap') {
                filteredStorages = filteredStorages.filter(storage => {
                    return !storage.latitude && !storage.longitude && !storage.google_maps_url;
                });
            }
            
            // 画像未追加フィルター
            if (currentFilter === 'noimage') {
                filteredStorages = filteredStorages.filter(storage => {
                    return !storage.image_url;
                });
            }
            
            // 検索フィルター
            if (searchTerm) {
                filteredStorages = filteredStorages.filter(storage => {
                    return (
                        storage.storage_number.toLowerCase().includes(searchTerm) ||
                        storage.location.toLowerCase().includes(searchTerm) ||
                        (storage.district && storage.district.toLowerCase().includes(searchTerm)) ||
                        (storage.remarks && storage.remarks.toLowerCase().includes(searchTerm))
                    );
                });
            }
            
            if (filteredStorages.length === 0 && searchTerm) {
                list.innerHTML = \`
                    <div class="col-span-full text-center py-16">
                        <div class="bg-white rounded-2xl shadow-lg p-12">
                            <div class="text-8xl mb-6">🔍</div>
                            <p class="text-2xl text-gray-800 font-bold mb-4">「\${searchTerm}」に一致するホースが見つかりません</p>
                            <p class="text-gray-600">別のキーワードで検索してみてください</p>
                        </div>
                    </div>
                \`;
                return;
            }
            
            if (storages.length === 0) {
                list.innerHTML = \`
                    <div class="col-span-full text-center py-16">
                        <div class="bg-white rounded-2xl shadow-lg p-12">
                            <div class="text-8xl mb-6">📦</div>
                            <p class="text-2xl text-gray-800 font-bold mb-4">まだホースホースが登録されていません</p>
                            <p class="text-gray-600 mb-8">CSV一括登録または個別追加でホースホースを登録しましょう</p>
                            <button onclick="showUploadModal()" class="bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg transition mr-2 shadow-lg font-bold">
                                📥 CSV一括登録
                            </button>
                            <button onclick="showAddModal()" class="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-lg transition shadow-lg font-bold">
                                ➕ ホースホースを追加
                            </button>
                        </div>
                    </div>
                \`;
                return;
            }

            const gradients = ['storage-gradient-1', 'storage-gradient-2', 'storage-gradient-3', 'storage-gradient-4', 'storage-gradient-5'];
            list.innerHTML = filteredStorages.map((storage, index) => {
                const gradient = gradients[index % 5];
                return '<div class="' + gradient + ' rounded-2xl shadow-2xl p-6 storage-card" onclick="location.href=\\'/storage/' + storage.id + '\\'">' +
                    '<div class="text-white">' +
                        '<div class="flex justify-between items-start mb-4">' +
                            '<h3 class="text-2xl font-bold">📦 ' + storage.storage_number + '</h3>' +
                            (storage.latitude || storage.google_maps_url ? '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">📍 地図設定済み</span>' : '<span class="bg-white bg-opacity-20 backdrop-blur-sm px-3 py-1 rounded-full text-sm border border-white border-opacity-50">⚠️ 地図未設定</span>') +
                        '</div>' +
                        (storage.image_url ? 
                            '<div class="mb-4">' +
                                '<img src="' + storage.image_url + '" alt="ホース写真" class="w-full h-48 object-cover rounded-lg border-2 border-white border-opacity-50">' +
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

        // Excel/CSVファイルアップロード（ホース）
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
                alert(\`\${result.count}件のホースホースを登録しました！\`);
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

        // Excelテンプレートダウンロード（ホース）
        function downloadExcelTemplate() {
            const wb = XLSX.utils.book_new();
            const data = [
                ['ホースホース番号', '場所の目安', '地区', '備考'],
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
            XLSX.utils.book_append_sheet(wb, ws, 'ホースホース');
            XLSX.writeFile(wb, 'hose_storages_template.xlsx');
        }

        // CSVテンプレートダウンロード（ホース）
        function downloadCSVTemplate() {
            const csv = 'ホースホース番号,場所の目安,地区,備考\\n' +
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

        // ホースホース追加モーダル表示
        function showAddModal() {
            document.getElementById('modalTitle').textContent = '📦 ホースホースを追加';
            document.getElementById('storageForm').reset();
            document.getElementById('storageId').value = '';
            currentLat = null;
            currentLng = null;
            document.getElementById('coordsDisplay').classList.add('hidden');
            document.getElementById('addModal').classList.remove('hidden');
            
            setTimeout(() => {
                initMapWithCurrentLocation();
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

        // 現在地を取得して地図を初期化
        function initMapWithCurrentLocation() {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    // 成功時: 現在地を取得
                    (position) => {
                        const lat = position.coords.latitude;
                        const lng = position.coords.longitude;
                        console.log('Current location:', lat, lng);
                        initMap(lat, lng);
                    },
                    // エラー時: デフォルト位置（大井町役場）
                    (error) => {
                        console.log('Geolocation error, using default location:', error);
                        initMap();
                    },
                    // オプション
                    {
                        enableHighAccuracy: true,
                        timeout: 5000,
                        maximumAge: 0
                    }
                );
            } else {
                // 位置情報APIが使えない場合はデフォルト位置
                console.log('Geolocation not supported, using default location');
                initMap();
            }
        }

        // 地図初期化
        function initMap(lat = 35.3604, lng = 139.1386) {
            if (map) map.remove();
            
            map = L.map('map').setView([lat, lng], 15);
            L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png', {
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

        // ホースホース削除
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

        // ホースホース編集
        function editStorage(id) {
            const storage = storages.find(s => s.id === id);
            if (!storage) return;

            document.getElementById('modalTitle').textContent = '✏️ ホースを編集';
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
                    // 既に座標がある場合はそれを使用
                    initMap(currentLat, currentLng);
                } else {
                    // 座標がない場合は現在地を取得
                    initMapWithCurrentLocation();
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

        // ホースホース保存
        async function saveStorage() {
            const id = document.getElementById('storageId').value;
            const storageNumber = document.getElementById('storageNumber').value;
            const location = document.getElementById('location').value;
            
            // 必須項目チェック
            if (!storageNumber || !location) {
                alert('ホースホース番号と場所の目安は必須です');
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
                L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png', {
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
// API: ホースホース一覧取得
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
// API: ホースホース追加
// ==========================================
app.post('/api/hose/storages', async (c) => {
  try {
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const id = 'storage_' + Date.now()
    const now = new Date().toISOString()
    
    // Google Maps URLから座標を自動抽出（latitude/longitudeがない場合）
    let latitude = data.latitude || null
    let longitude = data.longitude || null
    
    if (!latitude && !longitude && data.google_maps_url) {
      try {
        // 短縮URLの場合は展開
        if (data.google_maps_url.includes('maps.app.goo.gl') || data.google_maps_url.includes('goo.gl')) {
          const expandResponse = await fetch(data.google_maps_url, { 
            method: 'HEAD',
            redirect: 'follow'
          })
          const expandedUrl = expandResponse.url
          
          // 展開後のURLから座標を抽出（複数パターンに対応）
          const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
          
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          } else if (qMatch) {
            latitude = parseFloat(qMatch[1])
            longitude = parseFloat(qMatch[2])
          }
        } else {
          // 通常のURLから座標を抽出
          const atMatch = data.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          }
        }
      } catch (e) {
        console.error('座標抽出エラー:', e)
      }
    }
    
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
      latitude,
      longitude,
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
// API: ホースホース更新
// ==========================================
app.put('/api/hose/storages/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    const now = new Date().toISOString()
    
    // Google Maps URLから座標を自動抽出（latitude/longitudeがない場合）
    let latitude = data.latitude || null
    let longitude = data.longitude || null
    
    if (!latitude && !longitude && data.google_maps_url) {
      try {
        // 短縮URLの場合は展開
        if (data.google_maps_url.includes('maps.app.goo.gl') || data.google_maps_url.includes('goo.gl')) {
          const expandResponse = await fetch(data.google_maps_url, { 
            method: 'HEAD',
            redirect: 'follow'
          })
          const expandedUrl = expandResponse.url
          
          // 展開後のURLから座標を抽出（複数パターンに対応）
          const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
          
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          } else if (qMatch) {
            latitude = parseFloat(qMatch[1])
            longitude = parseFloat(qMatch[2])
          }
        } else {
          // 通常のURLから座標を抽出
          const atMatch = data.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          }
        }
      } catch (e) {
        console.error('座標抽出エラー:', e)
      }
    }
    
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
      latitude,
      longitude,
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
// API: 既存ホースの座標を一括更新
// ==========================================
app.post('/api/hose/storages/update-coordinates', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    // latitude/longitudeがnullでgoogle_maps_urlがあるホースを取得
    const result = await env.DB.prepare(`
      SELECT id, google_maps_url
      FROM hose_storages
      WHERE (latitude IS NULL OR longitude IS NULL)
        AND google_maps_url IS NOT NULL
    `).all()
    
    const storages = result.results || []
    let updatedCount = 0
    
    for (const storage of storages) {
      try {
        let latitude = null
        let longitude = null
        
        // 短縮URLの場合は展開
        if (storage.google_maps_url.includes('maps.app.goo.gl') || storage.google_maps_url.includes('goo.gl')) {
          const expandResponse = await fetch(storage.google_maps_url, { 
            method: 'HEAD',
            redirect: 'follow'
          })
          const expandedUrl = expandResponse.url
          
          // 展開後のURLから座標を抽出（複数パターンに対応）
          const atMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          const qMatch = expandedUrl.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
          
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          } else if (qMatch) {
            latitude = parseFloat(qMatch[1])
            longitude = parseFloat(qMatch[2])
          }
        } else {
          // 通常のURLから座標を抽出
          const atMatch = storage.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
          if (atMatch) {
            latitude = parseFloat(atMatch[1])
            longitude = parseFloat(atMatch[2])
          }
        }
        
        if (latitude && longitude) {
          await env.DB.prepare(`
            UPDATE hose_storages
            SET latitude = ?, longitude = ?, updated_at = ?
            WHERE id = ?
          `).bind(latitude, longitude, new Date().toISOString(), storage.id).run()
          
          updatedCount++
        }
      } catch (e) {
        console.error('座標抽出エラー for', storage.id, ':', e)
      }
    }
    
    return c.json({ success: true, total: storages.length, updated: updatedCount })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false, error: 'Failed to update coordinates' }, 500)
  }
})

// ==========================================
// API: ホースホース削除
// ==========================================
app.delete('/api/hose/storages/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    // まず関連する点検記録も削除
    await env.DB.prepare(`
      DELETE FROM hose_inspections WHERE storage_id = ?
    `).bind(id).run()
    
    // ホースを削除
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
  const csvContent = `ホースホース番号,場所の目安,地区,備考
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
            <div class="text-gray-800">
                <h1 class="text-4xl font-bold mb-2">⚙️ データ管理</h1>
                <p class="text-lg text-gray-600">データ確認・マスタ管理・分団設定</p>
            </div>
        </div>

        <!-- タブUI -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b overflow-x-auto">
                <button id="tabMembers" onclick="switchAdminTab('members')" class="tab-btn py-4 px-6 font-bold text-lg transition border-b-4 border-blue-500 text-blue-500 whitespace-nowrap">
                    👥 団員管理
                </button>
                <button id="tabHose" onclick="switchAdminTab('hose')" class="tab-btn py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    📦 ホース管理
                </button>
                <button id="tabTank" onclick="switchAdminTab('tank')" class="tab-btn py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    💧 防火水槽管理
                </button>
                <button id="tabDistrict" onclick="switchAdminTab('district')" class="tab-btn py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    🏘️ 地区管理
                </button>
                <button id="tabSettings" onclick="switchAdminTab('settings')" class="tab-btn py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    ⚙️ 分団設定
                </button>
            </div>
        </div>

        <!-- 団員管理タブ -->
        <div id="membersTab" class="tab-content">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">👥 団員管理</h2>
                    <button onclick="openMemberModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition">
                        ✚ 新規登録
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <div id="membersContent" class="text-gray-800">
                        <p class="text-center py-8">読み込み中...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- ホース管理タブ -->
        <div id="hoseTab" class="tab-content hidden">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">📦 ホース管理</h2>
                    <button onclick="openHoseModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition">
                        ✚ 新規登録
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <div id="hoseContent" class="text-gray-800">
                        <p class="text-center py-8">読み込み中...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 防火水槽管理タブ -->
        <div id="tankTab" class="tab-content hidden">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">💧 防火水槽管理</h2>
                    <button onclick="openTankModal()" class="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-bold transition">
                        ✚ 新規登録
                    </button>
                </div>
                
                <div class="overflow-x-auto">
                    <div id="tankContent" class="text-gray-800">
                        <p class="text-center py-8">読み込み中...</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- 地区管理タブ -->
        <div id="districtTab" class="tab-content hidden">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">🏘️ 地区マスタ管理</h2>
                
                <div class="mb-6">
                    <h3 class="text-lg font-bold mb-2">新規登録</h3>
                    <div class="flex gap-2">
                        <input type="text" id="districtInput" placeholder="新しい地区名を入力..." class="flex-1 px-4 py-3 border rounded-lg">
                        <button onclick="addDistrict()" class="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-bold">
                            ✚ 追加
                        </button>
                    </div>
                </div>
                
                <div id="districtContent" class="text-gray-800">
                    <p class="text-center py-8">読み込み中...</p>
                </div>
            </div>
        </div>

        <!-- 分団設定タブ -->
        <div id="settingsTab" class="tab-content hidden">
            <div class="bg-white rounded-2xl shadow-lg p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">⚙️ 分団設定</h2>
                
                <div class="space-y-4">
                    <div>
                        <label class="block font-bold mb-2">分団名</label>
                        <input type="text" value="第1分団" class="w-full px-4 py-3 border rounded-lg bg-gray-100" readonly>
                        <p class="text-sm text-gray-600 mt-1">※分団名は変更できません</p>
                    </div>
                    
                    <div>
                        <label class="block font-bold mb-2">組織名</label>
                        <input type="text" id="organizationName" value="大井町消防団" class="w-full px-4 py-3 border rounded-lg">
                    </div>
                    
                    <div>
                        <label class="block font-bold mb-2">ログインID</label>
                        <input type="text" value="oi001" class="w-full px-4 py-3 border rounded-lg bg-gray-100" readonly>
                        <p class="text-sm text-gray-600 mt-1">※ログインIDは変更できません（ログインURL: /login/[ID]）</p>
                    </div>
                    
                    <div>
                        <label class="block font-bold mb-2">ログインパスワード</label>
                        <input type="password" id="password" value="•••••" class="w-full px-4 py-3 border rounded-lg">
                        <p class="text-sm text-gray-600 mt-1">※空欄の場合は変更されません</p>
                    </div>
                    
                    <button onclick="saveSettings()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl font-bold text-lg">
                        💾 保存する
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 団員登録/編集モーダル -->
    <div id="memberModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target === this) closeMemberModal()">
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 id="memberModalTitle" class="text-2xl font-bold mb-6">✚ 団員新規登録</h3>
            <form id="memberForm" onsubmit="saveMember(event)">
                <input type="hidden" id="memberId" />
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-bold mb-2">氏名 *</label>
                        <input type="text" id="memberName" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block font-bold mb-2">生年月日</label>
                        <input type="date" id="memberBirthDate" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-bold mb-2">入団日</label>
                        <input type="date" id="memberJoinDate" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block font-bold mb-2">地区</label>
                        <input type="text" id="memberDistrict" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="flex gap-4 mt-6">
                    <button type="button" onclick="closeMemberModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-bold">
                        キャンセル
                    </button>
                    <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                        💾 保存
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- ホース登録/編集モーダル -->
    <div id="hoseModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target === this) closeHoseModal()">
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 id="hoseModalTitle" class="text-2xl font-bold mb-6">✚ ホース新規登録</h3>
            <form id="hoseForm" onsubmit="saveHose(event)">
                <input type="hidden" id="hoseId" />
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-bold mb-2">ホース番号 *</label>
                        <input type="text" id="hoseStorageNumber" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block font-bold mb-2">地区</label>
                        <input type="text" id="hoseDistrict" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block font-bold mb-2">場所 *</label>
                    <input type="text" id="hoseLocation" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                
                <div class="mb-4">
                    <label class="block font-bold mb-2">Google Maps URL</label>
                    <input type="text" id="hoseGoogleMapsUrl" class="w-full px-4 py-2 border rounded-lg">
                </div>
                
                <div class="flex gap-4 mt-6">
                    <button type="button" onclick="closeHoseModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-bold">
                        キャンセル
                    </button>
                    <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                        💾 保存
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- 防火水槽登録/編集モーダル -->
    <div id="tankModal" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="if(event.target === this) closeTankModal()">
        <div class="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 id="tankModalTitle" class="text-2xl font-bold mb-6">✚ 防火水槽新規登録</h3>
            <form id="tankForm" onsubmit="saveTank(event)">
                <input type="hidden" id="tankId" />
                
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label class="block font-bold mb-2">防火水槽番号 *</label>
                        <input type="text" id="tankNumber" required class="w-full px-4 py-2 border rounded-lg">
                    </div>
                    <div>
                        <label class="block font-bold mb-2">地区</label>
                        <input type="text" id="tankDistrict" class="w-full px-4 py-2 border rounded-lg">
                    </div>
                </div>
                
                <div class="mb-4">
                    <label class="block font-bold mb-2">場所 *</label>
                    <input type="text" id="tankLocation" required class="w-full px-4 py-2 border rounded-lg">
                </div>
                
                <div class="mb-4">
                    <label class="block font-bold mb-2">Google Maps URL</label>
                    <input type="text" id="tankGoogleMapsUrl" class="w-full px-4 py-2 border rounded-lg">
                </div>
                
                <div class="flex gap-4 mt-6">
                    <button type="button" onclick="closeTankModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-bold">
                        キャンセル
                    </button>
                    <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                        💾 保存
                    </button>
                </div>
            </form>
        </div>
    </div>

    <script>
        let currentData = [];
        let currentTable = 'hose_storages';
        let currentAdminTab = 'members';

        // ページ読み込み時
        window.onload = function() {
            // URLハッシュがあればそのタブを開く
            const hash = window.location.hash.substring(1);
            if (hash) {
                switchAdminTab(hash);
            } else {
                switchAdminTab('members');
            }
        };

        // タブ切り替え
        function switchAdminTab(tabName) {
            currentAdminTab = tabName;
            
            // タブボタンのスタイル更新
            ['tabMembers', 'tabHose', 'tabTank', 'tabDistrict', 'tabSettings'].forEach(id => {
                const btn = document.getElementById(id);
                btn.classList.remove('border-blue-500', 'text-blue-500');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            // コンテンツの表示切り替え
            document.querySelectorAll('.tab-content').forEach(el => {
                el.classList.add('hidden');
            });
            
            if (tabName === 'members') {
                document.getElementById('tabMembers').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabMembers').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('membersTab').classList.remove('hidden');
                loadMembersData();
            } else if (tabName === 'hose') {
                document.getElementById('tabHose').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabHose').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('hoseTab').classList.remove('hidden');
                loadHoseData();
            } else if (tabName === 'tank') {
                document.getElementById('tabTank').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabTank').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('tankTab').classList.remove('hidden');
                loadTankData();
            } else if (tabName === 'district') {
                document.getElementById('tabDistrict').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabDistrict').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('districtTab').classList.remove('hidden');
                loadDistrictData();
            } else if (tabName === 'settings') {
                document.getElementById('tabSettings').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabSettings').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('settingsTab').classList.remove('hidden');
            }
        }

        // 団員データ読み込み
        async function loadMembersData() {
            try {
                const response = await fetch('/api/users');
                const data = await response.json();
                const members = data.users || [];
                
                const html = '<table class="w-full border-collapse"><thead><tr>' +
                    '<th class="border px-4 py-2 bg-gray-100">氏名</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">生年月日</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">入団日</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">地区</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">ステータス</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">操作</th>' +
                    '</tr></thead><tbody>' +
                    members.map(m => {
                        const status = m.status === 2 ? 'OB' : m.status === 3 ? '退団' : '現役';
                        return '<tr>' +
                            '<td class="border px-4 py-2">' + m.name + '</td>' +
                            '<td class="border px-4 py-2">' + (m.birth_date || '') + '</td>' +
                            '<td class="border px-4 py-2">' + (m.join_date || '') + '</td>' +
                            '<td class="border px-4 py-2">' + (m.district || '') + '</td>' +
                            '<td class="border px-4 py-2">' + status + '</td>' +
                            '<td class="border px-4 py-2"><button onclick="editMember(\'' + m.id + '\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">編集</button></td>' +
                            '</tr>';
                    }).join('') +
                    '</tbody></table>';
                    
                document.getElementById('membersContent').innerHTML = html;
            } catch (error) {
                document.getElementById('membersContent').innerHTML = '<p class="text-red-600 text-center py-8">データの読み込みに失敗しました</p>';
            }
        }

        // ホースデータ読み込み
        async function loadHoseData() {
            try {
                const response = await fetch('/api/hose/storages');
                const data = await response.json();
                const storages = data.storages || [];
                
                const html = '<table class="w-full border-collapse"><thead><tr>' +
                    '<th class="border px-4 py-2 bg-gray-100">ホース番号</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">場所</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">地区</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">操作</th>' +
                    '</tr></thead><tbody>' +
                    storages.map(s => '<tr>' +
                        '<td class="border px-4 py-2">' + s.storage_number + '</td>' +
                        '<td class="border px-4 py-2">' + s.location + '</td>' +
                        '<td class="border px-4 py-2">' + (s.district || '') + '</td>' +
                        '<td class="border px-4 py-2"><button onclick="editHose(\'' + s.id + '\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">編集</button></td>' +
                        '</tr>').join('') +
                    '</tbody></table>';
                    
                document.getElementById('hoseContent').innerHTML = html;
            } catch (error) {
                document.getElementById('hoseContent').innerHTML = '<p class="text-red-600 text-center py-8">データの読み込みに失敗しました</p>';
            }
        }

        // 防火水槽データ読み込み
        async function loadTankData() {
            try {
                const response = await fetch('/api/water-tanks');
                const data = await response.json();
                const tanks = data.tanks || [];
                
                const html = '<table class="w-full border-collapse"><thead><tr>' +
                    '<th class="border px-4 py-2 bg-gray-100">管理番号</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">場所</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">地区</th>' +
                    '<th class="border px-4 py-2 bg-gray-100">操作</th>' +
                    '</tr></thead><tbody>' +
                    tanks.map(t => '<tr>' +
                        '<td class="border px-4 py-2">' + (t.storage_id || '') + '</td>' +
                        '<td class="border px-4 py-2">' + t.location + '</td>' +
                        '<td class="border px-4 py-2">' + (t.district || '') + '</td>' +
                        '<td class="border px-4 py-2"><button onclick="editTank(\'' + t.id + '\')" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded text-sm">編集</button></td>' +
                        '</tr>').join('') +
                    '</tbody></table>';
                    
                document.getElementById('tankContent').innerHTML = html;
            } catch (error) {
                document.getElementById('tankContent').innerHTML = '<p class="text-red-600 text-center py-8">データの読み込みに失敗しました</p>';
            }
        }

        // 地区データ読み込み
        async function loadDistrictData() {
            const districts = ['市場', '馬場', '根岸下', '根岸上', '宮地', '坊村'];
            
            const html = '<div class="grid grid-cols-3 gap-4">' +
                districts.map(d => '<div class="flex justify-between items-center border rounded-lg p-4">' +
                    '<span class="font-bold">' + d + '</span>' +
                    '<button onclick="deleteDistrict(\\\'' + d + '\\\')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">削除</button>' +
                    '</div>').join('') +
                '</div>';
                
            document.getElementById('districtContent').innerHTML = html;
        }

        function addDistrict() {
            const input = document.getElementById('districtInput');
            const name = input.value.trim();
            if (name) {
                alert('地区「' + name + '」を追加しました');
                input.value = '';
                loadDistrictData();
            }
        }

        function deleteDistrict(name) {
            if (confirm('地区「' + name + '」を削除しますか？')) {
                alert('地区「' + name + '」を削除しました');
                loadDistrictData();
            }
        }

        function saveSettings() {
            alert('設定を保存しました');
        }
        
        // 旧関数（互換性のため残す）
        function loadTable() {
            loadMembersData();
        }

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

        // ===== 団員管理モーダル処理 =====
        function openMemberModal() {
            document.getElementById('memberModalTitle').textContent = '✚ 団員新規登録';
            document.getElementById('memberForm').reset();
            document.getElementById('memberId').value = '';
            document.getElementById('memberModal').classList.remove('hidden');
        }

        function closeMemberModal() {
            document.getElementById('memberModal').classList.add('hidden');
        }

        async function editMember(id) {
            const response = await fetch('/api/users');
            const data = await response.json();
            const member = data.users.find(m => m.id === id);
            
            if (member) {
                document.getElementById('memberModalTitle').textContent = '✏️ 団員編集';
                document.getElementById('memberId').value = member.id;
                document.getElementById('memberName').value = member.name;
                document.getElementById('memberBirthDate').value = member.birth_date || '';
                document.getElementById('memberJoinDate').value = member.join_date || '';
                document.getElementById('memberDistrict').value = member.district || '';
                document.getElementById('memberModal').classList.remove('hidden');
            }
        }

        async function saveMember(event) {
            event.preventDefault();
            
            const id = document.getElementById('memberId').value;
            const data = {
                name: document.getElementById('memberName').value,
                birth_date: document.getElementById('memberBirthDate').value,
                join_date: document.getElementById('memberJoinDate').value,
                district: document.getElementById('memberDistrict').value
            };
            
            const url = id ? '/api/members/' + id : '/api/members';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('保存しました！');
                closeMemberModal();
                loadMembersData();
            } else {
                alert('保存に失敗しました');
            }
        }

        // ===== ホース管理モーダル処理 =====
        function openHoseModal() {
            document.getElementById('hoseModalTitle').textContent = '✚ ホース新規登録';
            document.getElementById('hoseForm').reset();
            document.getElementById('hoseId').value = '';
            document.getElementById('hoseModal').classList.remove('hidden');
        }

        function closeHoseModal() {
            document.getElementById('hoseModal').classList.add('hidden');
        }

        async function editHose(id) {
            const response = await fetch('/api/hose/storages');
            const data = await response.json();
            const hose = data.storages.find(s => s.id === parseInt(id));
            
            if (hose) {
                document.getElementById('hoseModalTitle').textContent = '✏️ ホース編集';
                document.getElementById('hoseId').value = hose.id;
                document.getElementById('hoseStorageNumber').value = hose.storage_number;
                document.getElementById('hoseDistrict').value = hose.district || '';
                document.getElementById('hoseLocation').value = hose.location;
                document.getElementById('hoseGoogleMapsUrl').value = hose.google_maps_url || '';
                document.getElementById('hoseModal').classList.remove('hidden');
            }
        }

        async function saveHose(event) {
            event.preventDefault();
            
            const id = document.getElementById('hoseId').value;
            const data = {
                storage_number: document.getElementById('hoseStorageNumber').value,
                district: document.getElementById('hoseDistrict').value,
                location: document.getElementById('hoseLocation').value,
                google_maps_url: document.getElementById('hoseGoogleMapsUrl').value
            };
            
            const url = id ? '/api/hose/storages/' + id : '/api/hose/storages';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('保存しました！');
                closeHoseModal();
                loadHoseData();
            } else {
                alert('保存に失敗しました');
            }
        }

        // ===== 防火水槽管理モーダル処理 =====
        function openTankModal() {
            document.getElementById('tankModalTitle').textContent = '✚ 防火水槽新規登録';
            document.getElementById('tankForm').reset();
            document.getElementById('tankId').value = '';
            document.getElementById('tankModal').classList.remove('hidden');
        }

        function closeTankModal() {
            document.getElementById('tankModal').classList.add('hidden');
        }

        async function editTank(id) {
            const response = await fetch('/api/water-tanks');
            const data = await response.json();
            const tank = data.tanks.find(t => t.id === parseInt(id));
            
            if (tank) {
                document.getElementById('tankModalTitle').textContent = '✏️ 防火水槽編集';
                document.getElementById('tankId').value = tank.id;
                document.getElementById('tankNumber').value = tank.storage_id || '';
                document.getElementById('tankDistrict').value = tank.district || '';
                document.getElementById('tankLocation').value = tank.location;
                document.getElementById('tankGoogleMapsUrl').value = tank.google_maps_url || '';
                document.getElementById('tankModal').classList.remove('hidden');
            }
        }

        async function saveTank(event) {
            event.preventDefault();
            
            const id = document.getElementById('tankId').value;
            const data = {
                storage_id: document.getElementById('tankNumber').value,
                district: document.getElementById('tankDistrict').value,
                location: document.getElementById('tankLocation').value,
                google_maps_url: document.getElementById('tankGoogleMapsUrl').value
            };
            
            const url = id ? '/api/water-tanks/' + id : '/api/water-tanks';
            const method = id ? 'PUT' : 'POST';
            
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (response.ok) {
                alert('保存しました！');
                closeTankModal();
                loadTankData();
            } else {
                alert('保存に失敗しました');
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
// 防火水槽点検ページ
// ==========================================
app.get('/water-tanks', (c) => {
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>防火水槽点検 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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
        .tank-card {
            transition: all 0.3s ease;
        }
        .tank-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .filter-btn.active {
            background-color: #3b82f6;
            color: white;
            font-weight: bold;
        }
        .custom-marker {
            background: transparent;
            border: none;
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
            <h1 class="text-3xl font-bold text-gray-800 mb-2">💧 防火水槽点検</h1>
            <p class="text-base text-gray-600 mb-4">防火水槽の登録と点検管理</p>
            
            <button onclick="showAddTankModal()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                ➕ 防火水槽を追加
            </button>
        </div>

        <!-- タブUI -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tabList" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-blue-500 text-blue-500 whitespace-nowrap">
                    📝 一覧
                </button>
                <button id="tabMap" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    🗺️ 地図
                </button>
                <button id="tabHistory" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    📋 全履歴
                </button>
            </div>

            <!-- 一覧タブ -->
            <div id="listTab" class="p-6">
                <div id="tanksList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <p class="text-gray-800 text-center py-8 col-span-full">読み込み中...</p>
                </div>
            </div>

            <!-- 地図タブ -->
            <div id="mapTab" class="p-6 hidden">
                <div id="tanksMap" style="height: 600px; border-radius: 1rem;"></div>
            </div>

            <!-- 全履歴タブ -->
            <div id="historyTab" class="p-6 hidden">
                <div id="tanksHistoryList" class="space-y-4">
                    <p class="text-gray-600 text-center py-8">読み込み中...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 防火水槽追加・編集モーダル -->
    <div id="tankModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="tankModalTitle" class="text-2xl font-bold text-gray-800">💧 防火水槽を追加</h2>
                    <button onclick="hideTankModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>

                <div class="space-y-4">
                    <input type="hidden" id="tankId">
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">設置場所 <span class="text-red-500">*</span></label>
                        <input type="text" id="tankLocation" required placeholder="例: 〇〇公園横" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">Google Maps URL</label>
                        <input type="url" id="tankGoogleMapsUrl" placeholder="Google Mapsで共有したリンクを貼り付け" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <p class="text-xs text-gray-500 mt-1">※位置情報を自動取得します</p>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">📷 防火水槽の写真（任意）</label>
                        <input type="file" id="tankImage" accept="image/*" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <p class="text-xs text-gray-500 mt-1">💡 防火水槽の外観や状況の写真をアップロードできます</p>
                        <input type="hidden" id="tankImageUrl" value="">
                        <div id="tankImagePreview" class="hidden mt-4">
                            <img id="tankImagePreviewImg" src="" alt="プレビュー" class="w-full h-48 object-cover rounded-lg">
                            <button type="button" id="clearTankImageBtn" class="mt-2 text-red-500 hover:text-red-700 text-sm">
                                🗑️ 画像を削除
                            </button>
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">備考</label>
                        <textarea id="tankNotes" rows="3" placeholder="その他メモ" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                    </div>

                    <div class="flex flex-col gap-3 pt-4">
                        <div class="flex space-x-3">
                            <button type="button" onclick="saveTank()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                                ✅ 保存する
                            </button>
                            <button type="button" onclick="hideTankModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                                キャンセル
                            </button>
                        </div>
                        <button type="button" id="deleteTankBtn" onclick="deleteTank()" class="hidden w-full bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-xl transition font-bold">
                            🗑️ この防火水槽を削除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 点検入力モーダル -->
    <div id="inspectionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800">💧 防火水槽点検記録</h2>
                    <button onclick="closeInspectionModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>

                <form id="inspectionForm" class="space-y-4">
                    <input type="hidden" id="inspectionTankId">
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">点検者 <span class="text-red-500">*</span></label>
                        <select id="inspectionInspector" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">点検日時 <span class="text-red-500">*</span></label>
                        <input type="datetime-local" id="inspectionDate" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">水位 <span class="text-red-500">*</span></label>
                        <select id="inspectionWaterLevel" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="満水">満水</option>
                            <option value="半分">半分</option>
                            <option value="空">空</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">水質 <span class="text-red-500">*</span></label>
                        <select id="inspectionWaterQuality" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="良好">良好</option>
                            <option value="濁り">濁り</option>
                            <option value="異臭">異臭</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">蓋の状態 <span class="text-red-500">*</span></label>
                        <select id="inspectionLidCondition" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="正常">正常</option>
                            <option value="破損">破損</option>
                            <option value="紛失">紛失</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">写真</label>
                        <input type="file" id="inspectionImage" accept="image/*" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <div id="imagePreview" class="mt-2"></div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">コメント</label>
                        <textarea id="inspectionComment" rows="3" class="w-full px-4 py-3 border border-gray-300 rounded-lg" placeholder="その他気づいた点など"></textarea>
                    </div>
                    
                    <div class="flex gap-3 pt-4">
                        <button type="submit" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                            💾 記録する
                        </button>
                        <button type="button" onclick="closeInspectionModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-3 rounded-lg font-bold">
                            キャンセル
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <script>
        let tanks = [];
        let allInspections = [];
        let tanksMap = null;
        
        window.onload = function() {
            loadTanks();
            setupTabs();
            
            // URLパラメータで編集モードチェック
            const urlParams = new URLSearchParams(window.location.search);
            const editId = urlParams.get('edit');
            if (editId) {
                // データ読み込み後に編集モーダルを開く
                setTimeout(() => editTank(editId), 500);
            }
            
            // 画像プレビュー
            const tankImageInput = document.getElementById('tankImage');
            if (tankImageInput) {
                tankImageInput.addEventListener('change', previewTankImage);
            }
            
            // 画像削除ボタン
            const clearTankImageBtn = document.getElementById('clearTankImageBtn');
            if (clearTankImageBtn) {
                clearTankImageBtn.addEventListener('click', clearTankImage);
            }
        };

        function setupTabs() {
            document.getElementById('tabList').addEventListener('click', () => switchTab('list'));
            document.getElementById('tabMap').addEventListener('click', () => switchTab('map'));
            document.getElementById('tabHistory').addEventListener('click', () => switchTab('history'));
        }

        function switchTab(tabName) {
            const tabs = ['tabList', 'tabMap', 'tabHistory'];
            const contents = ['listTab', 'mapTab', 'historyTab'];

            tabs.forEach((tab, i) => {
                const btn = document.getElementById(tab);
                const content = document.getElementById(contents[i]);
                
                if (contents[i] === tabName + 'Tab') {
                    btn.classList.add('border-blue-500', 'text-blue-500');
                    btn.classList.remove('border-transparent', 'text-gray-500');
                    content.classList.remove('hidden');
                    
                    if (tabName === 'map' && !tanksMap) {
                        loadTanksMap();
                    } else if (tabName === 'history' && allInspections.length === 0) {
                        loadTanksHistory();
                    }
                } else {
                    btn.classList.remove('border-blue-500', 'text-blue-500');
                    btn.classList.add('border-transparent', 'text-gray-500');
                    content.classList.add('hidden');
                }
            });
        }

        async function loadTanks() {
            try {
                console.log('Loading tanks...');
                const response = await fetch('/api/water-tanks');
                console.log('Response status:', response.status);
                const data = await response.json();
                console.log('Data:', data);
                tanks = data.tanks || [];
                console.log('Tanks count:', tanks.length);
                displayTanks();
                console.log('displayTanks() called');
            } catch (error) {
                console.error('Failed to load tanks:', error);
                document.getElementById('tanksList').innerHTML = '<p class="text-red-600 text-center py-8 col-span-full">読み込みに失敗しました</p>';
            }
        }

        function escapeHtml(text) {
            if (!text) return '';
            return String(text)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function displayTanks() {
            const container = document.getElementById('tanksList');
            
            if (tanks.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-8 col-span-full">防火水槽が登録されていません</p>';
                return;
            }

            const cards = [];
            for (let i = 0; i < tanks.length; i++) {
                const tank = tanks[i];
                const hasLocation = (tank.latitude && tank.longitude) || tank.google_maps_url;
                const mapId = 'tank-map-' + tank.id;
                
                let imageHtml = '';
                if (tank.image_url) {
                    imageHtml = '<img src="' + escapeHtml(tank.image_url) + '" alt="防火水槽の写真" class="w-full h-48 object-cover rounded-lg mb-4">';
                }
                
                let miniMapHtml = '';
                if (hasLocation) {
                    miniMapHtml = '<div id="' + mapId + '" class="tank-mini-map mb-4" style="height: 200px; border-radius: 0.5rem;"></div>';
                }
                
                let inspectionDateHtml = '';
                if (tank.last_inspection_date) {
                    inspectionDateHtml = '<p class="text-sm text-gray-600 mb-2">📅 最終点検: ' + escapeHtml(tank.last_inspection_date) + '</p>';
                } else {
                    inspectionDateHtml = '<p class="text-sm text-red-600 mb-2">⚠️ 未点検</p>';
                }
                
                let notesHtml = '';
                if (tank.notes) {
                    notesHtml = '<p class="text-sm text-gray-600 line-clamp-2 mb-4">📝 ' + escapeHtml(tank.notes) + '</p>';
                }
                
                const card = '<div class="bg-white rounded-2xl shadow-lg p-6 tank-card cursor-pointer" onclick="goToTankDetail(\\'' + tank.id + '\\')">' +
                    '<div class="flex justify-between items-start mb-4">' +
                        '<div>' +
                            '<h3 class="text-xl font-bold text-gray-800 mb-2">💧 ' + escapeHtml(tank.location) + '</h3>' +
                        '</div>' +
                        '<button onclick="event.stopPropagation(); editTank(\\'' + tank.id + '\\')" class="text-blue-600 hover:text-blue-800 text-2xl">' +
                            '✏️' +
                        '</button>' +
                    '</div>' +
                    imageHtml +
                    miniMapHtml +
                    inspectionDateHtml +
                    notesHtml +
                    '<div class="mt-4 pt-4 border-t border-gray-200">' +
                        '<button onclick="event.stopPropagation(); openInspectionModal(' + tank.id + ')" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg transition font-bold">' +
                            '✏️ 点検する' +
                        '</button>' +
                    '</div>' +
                '</div>';
                
                cards.push(card);
            }
            
            container.innerHTML = cards.join('');
            
            // 小地図を初期化
            for (let i = 0; i < tanks.length; i++) {
                const tank = tanks[i];
                if ((tank.latitude && tank.longitude) || tank.google_maps_url) {
                    setTimeout(function() { initTankMiniMap(tank); }, 100);
                }
            }
        }

        function showAddTankModal() {
            document.getElementById('tankId').value = '';
            document.getElementById('tankLocation').value = '';
            document.getElementById('tankGoogleMapsUrl').value = '';
            document.getElementById('tankImage').value = '';
            document.getElementById('tankImageUrl').value = '';
            document.getElementById('tankNotes').value = '';
            document.getElementById('tankImagePreview').classList.add('hidden');
            document.getElementById('tankModalTitle').textContent = '💧 防火水槽を追加';
            document.getElementById('deleteTankBtn').classList.add('hidden');
            document.getElementById('tankModal').classList.remove('hidden');
        }

        function hideTankModal() {
            document.getElementById('tankModal').classList.add('hidden');
        }

        function editTank(tankId) {
            const tank = tanks.find(t => t.id === tankId);
            if (!tank) return;

            document.getElementById('tankId').value = tank.id;
            document.getElementById('tankLocation').value = tank.location;
            document.getElementById('tankGoogleMapsUrl').value = tank.google_maps_url || '';
            document.getElementById('tankImageUrl').value = tank.image_url || '';
            document.getElementById('tankNotes').value = tank.notes || '';
            
            if (tank.image_url) {
                document.getElementById('tankImagePreviewImg').src = tank.image_url;
                document.getElementById('tankImagePreview').classList.remove('hidden');
            } else {
                document.getElementById('tankImagePreview').classList.add('hidden');
            }
            
            document.getElementById('tankModalTitle').textContent = '✏️ 防火水槽を編集';
            document.getElementById('deleteTankBtn').classList.remove('hidden');
            document.getElementById('tankModal').classList.remove('hidden');
        }

        async function saveTank() {
            const tankId = document.getElementById('tankId').value;
            const location = document.getElementById('tankLocation').value;
            const googleMapsUrl = document.getElementById('tankGoogleMapsUrl').value;

            if (!location) {
                alert('設置場所は必須です');
                return;
            }

            // 画像をアップロード
            const imageUrl = await uploadTankImage();

            const data = {
                storage_id: null,
                location: location,
                capacity: null,
                google_maps_url: googleMapsUrl || null,
                image_url: imageUrl || null,
                notes: document.getElementById('tankNotes').value || null
            };

            try {
                const url = tankId ? '/api/water-tanks/' + tankId : '/api/water-tanks';
                const method = tankId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    hideTankModal();
                    loadTanks();
                } else {
                    alert('保存に失敗しました');
                }
            } catch (error) {
                console.error('Save error:', error);
                alert('保存中にエラーが発生しました');
            }
        }

        function goToTankDetail(tankId) {
            location.href = '/water-tank/' + tankId;
        }

        async function deleteTank() {
            const tankId = document.getElementById('tankId').value;
            if (!tankId) return;

            const tank = tanks.find(t => t.id === tankId);
            if (!tank) return;

            if (!confirm('「' + tank.location + '」を本当に削除しますか？\\\\n\\\\nこの操作は取り消せません。')) {
                return;
            }

            try {
                const response = await fetch('/api/water-tanks/' + tankId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('削除しました');
                    hideTankModal();
                    loadTanks();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('削除中にエラーが発生しました');
            }
        }

        // 画像プレビュー
        function previewTankImage(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('tankImagePreviewImg').src = e.target.result;
                    document.getElementById('tankImagePreview').classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            }
        }

        // 画像クリア
        function clearTankImage() {
            document.getElementById('tankImage').value = '';
            document.getElementById('tankImageUrl').value = '';
            document.getElementById('tankImagePreview').classList.add('hidden');
        }

        // 画像アップロード処理
        async function uploadTankImage() {
            const fileInput = document.getElementById('tankImage');
            if (!fileInput.files || !fileInput.files[0]) {
                return document.getElementById('tankImageUrl').value || null;
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

        function extractCoordsFromGoogleMapsUrl(url) {
            try {
                const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
                const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (qMatch) return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) };
            } catch (e) {
                console.error('座標抽出エラー:', e);
            }
            return null;
        }

        // 小地図初期化
        function initTankMiniMap(tank) {
            const mapId = 'tank-map-' + tank.id;
            const mapElement = document.getElementById(mapId);
            if (!mapElement) return;

            let lat = tank.latitude;
            let lon = tank.longitude;

            if (!lat && !lon && tank.google_maps_url) {
                const coords = extractCoordsFromGoogleMapsUrl(tank.google_maps_url);
                if (coords) {
                    lat = coords.lat;
                    lon = coords.lon;
                }
            }

            if (lat && lon) {
                const miniMap = L.map(mapId, {
                    zoomControl: false,
                    dragging: false,
                    scrollWheelZoom: false,
                    doubleClickZoom: false,
                    boxZoom: false,
                    keyboard: false
                }).setView([lat, lon], 15);

                L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png').addTo(miniMap);

                L.marker([lat, lon], {
                    icon: L.divIcon({
                        className: 'custom-marker',
                        html: '<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                        iconSize: [25, 25],
                        iconAnchor: [12, 24]
                    })
                }).addTo(miniMap);

                // 地図をクリックしたらGoogle Mapsで開く
                if (tank.google_maps_url) {
                    mapElement.style.cursor = 'pointer';
                    mapElement.addEventListener('click', function(e) {
                        e.stopPropagation();
                        window.open(tank.google_maps_url, '_blank');
                    });
                }
            }
        }

        async function loadTanksMap() {
            const mapContainer = document.getElementById('tanksMap');
            
            if (tanks.length === 0) {
                mapContainer.innerHTML = '<p class="text-gray-600 text-center py-8">防火水槽データがありません</p>';
                return;
            }

            tanksMap = L.map('tanksMap').setView([35.325, 139.157], 14);
            L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png').addTo(tanksMap);

            const bounds = [];

            for (const tank of tanks) {
                let lat = tank.latitude;
                let lon = tank.longitude;
                
                if (!lat && !lon && tank.google_maps_url) {
                    const coords = extractCoordsFromGoogleMapsUrl(tank.google_maps_url);
                    if (coords) {
                        lat = coords.lat;
                        lon = coords.lon;
                    }
                }
                
                if (lat && lon) {
                    const marker = L.marker([lat, lon], {
                        icon: L.divIcon({
                            className: 'custom-marker',
                            html: '<div style="background-color: #3b82f6; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                            iconSize: [25, 25],
                            iconAnchor: [12, 24]
                        })
                    }).addTo(tanksMap);
                    
                    marker.bindPopup('<b>💧 ' + tank.location + '</b><br><a href="/water-tank/' + tank.id + '" class="text-blue-600 hover:underline">詳細を見る</a>');
                    bounds.push([lat, lon]);
                }
            }
            
            if (bounds.length > 0) {
                tanksMap.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        async function loadTanksHistory() {
            try {
                const response = await fetch('/api/water-tank-inspections');
                const data = await response.json();
                allInspections = data.inspections || [];
                renderTanksHistory();
            } catch (error) {
                document.getElementById('tanksHistoryList').innerHTML = 
                    '<p class="text-gray-600 text-center py-8">履歴の読み込みに失敗しました</p>';
                console.error(error);
            }
        }

        function renderTanksHistory() {
            const container = document.getElementById('tanksHistoryList');
            
            if (allInspections.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-8">点検履歴がありません</p>';
                return;
            }

            container.innerHTML = allInspections.map(inspection => {
                const tank = tanks.find(t => t.id === inspection.tank_id);
                const tankName = tank ? tank.location : '不明';
                const hasActionItems = inspection.action_item_1 || inspection.action_item_2 || inspection.action_item_3;
                
                let html = '<div class="bg-white rounded-lg border-2 border-gray-200 p-4">' +
                    '<div class="flex justify-between items-start">' +
                        '<div>' +
                            '<h4 class="text-lg font-bold text-gray-800">📅 ' + inspection.inspection_date + '</h4>' +
                            '<p class="text-gray-600">💧 ' + tankName + '</p>' +
                            '<p class="text-gray-600">👤 点検者: ' + inspection.inspector_name + '</p>' +
                        '</div>' +
                        '<div class="flex gap-2">' +
                            '<button onclick="editTankInspection(\\'' + inspection.id + '\\')" class="text-blue-600 hover:text-blue-800 text-xl">✏️</button>' +
                            '<button onclick="deleteTankInspection(\\'' + inspection.id + '\\')" class="text-red-600 hover:text-red-800 text-xl">🗑️</button>' +
                        '</div>' +
                    '</div>';
                
                if (hasActionItems) {
                    html += '<div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">' +
                        '<p class="font-bold text-sm text-gray-800 mb-1">⚠️ 要対応事項</p>';
                    if (inspection.action_item_1) html += '<p class="text-sm text-gray-700">① ' + inspection.action_item_1 + '</p>';
                    if (inspection.action_item_2) html += '<p class="text-sm text-gray-700">② ' + inspection.action_item_2 + '</p>';
                    if (inspection.action_item_3) html += '<p class="text-sm text-gray-700">③ ' + inspection.action_item_3 + '</p>';
                    html += '</div>';
                }
                
                if (inspection.notes) {
                    html += '<p class="text-sm text-gray-600 mt-2">📝 ' + inspection.notes + '</p>';
                }
                
                html += '</div>';
                return html;
            }).join('');
        }
        
        async function editTankInspection(inspectionId) {
            const inspection = allInspections.find(i => i.id === inspectionId);
            if (!inspection || !inspection.tank_id) {
                alert('点検記録が見つかりません');
                return;
            }
            // 防火水槽の詳細ページに遷移
            location.href = '/water-tank/' + inspection.tank_id + '?edit=' + inspectionId;
        }
        
        async function deleteTankInspection(inspectionId) {
            if (!confirm('この点検記録を削除しますか？\\n\\nこの操作は取り消せません。')) {
                return;
            }
            
            try {
                const response = await fetch('/api/water-tank-inspections/' + inspectionId, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('削除しました');
                    // 履歴を再読み込み
                    await loadTanksHistory();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('削除中にエラーが発生しました');
            }
        }
        
        // ==========================================
        // 点検モーダル関連関数
        // ==========================================
        
        // 点検モーダルを開く
        async function openInspectionModal(tankId) {
            document.getElementById('inspectionTankId').value = tankId;
            document.getElementById('inspectionDate').value = new Date().toISOString().slice(0, 16);
            
            // 現役団員のみ取得
            try {
                const response = await fetch('/api/users?active_only=1');
                const data = await response.json();
                
                const select = document.getElementById('inspectionInspector');
                select.innerHTML = '<option value="">選択してください</option>';
                data.users.forEach(user => {
                    select.innerHTML += '<option value="' + user.id + '">' + escapeHtml(user.name) + '</option>';
                });
            } catch (error) {
                console.error('Failed to load users:', error);
            }
            
            document.getElementById('inspectionModal').classList.remove('hidden');
        }
        
        // 点検モーダルを閉じる
        function closeInspectionModal() {
            document.getElementById('inspectionModal').classList.add('hidden');
            document.getElementById('inspectionForm').reset();
            document.getElementById('imagePreview').innerHTML = '';
        }
        
        // 画像プレビュー
        document.getElementById('inspectionImage').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.getElementById('imagePreview');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(event) {
                    preview.innerHTML = '<img src="' + event.target.result + '" class="w-full rounded-lg mt-2" />';
                };
                reader.readAsDataURL(file);
            } else {
                preview.innerHTML = '';
            }
        });
        
        // 点検フォーム送信
        document.getElementById('inspectionForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = {
                tank_id: parseInt(document.getElementById('inspectionTankId').value),
                inspector_id: document.getElementById('inspectionInspector').value,
                inspection_date: document.getElementById('inspectionDate').value,
                water_level: document.getElementById('inspectionWaterLevel').value,
                water_quality: document.getElementById('inspectionWaterQuality').value,
                lid_condition: document.getElementById('inspectionLidCondition').value,
                comment: document.getElementById('inspectionComment').value,
                images: []
            };
            
            // 画像があれば追加
            const imageInput = document.getElementById('inspectionImage');
            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const reader = new FileReader();
                
                reader.onload = async function(event) {
                    formData.images.push(event.target.result);
                    await submitInspection(formData);
                };
                reader.readAsDataURL(file);
            } else {
                await submitInspection(formData);
            }
        });
        
        async function submitInspection(formData) {
            try {
                const response = await fetch('/api/water-tank-inspections', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                    alert('点検記録を保存しました！');
                    closeInspectionModal();
                    loadTanks(); // リストを再読み込み
                } else {
                    alert('エラーが発生しました');
                }
            } catch (error) {
                console.error('Submit error:', error);
                alert('送信中にエラーが発生しました');
            }
        }
    </script>
</body>
</html>
  `)
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
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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
        .pinned-today { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border: 3px solid #fbbf24; }
        button {
            -webkit-tap-highlight-color: transparent;
            min-height: 48px;
        }
        .storage-map {
            height: 128px;
            border-radius: 0.75rem;
            z-index: 1;
        }
        #allMap {
            height: 600px;
            border-radius: 1rem;
        }
        .filter-btn {
            transition: all 0.2s;
        }
        .filter-btn.active {
            background-color: #3b82f6;
            color: white;
            font-weight: bold;
        }
        .custom-marker {
            background: transparent;
            border: none;
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
                <p class="text-base text-gray-600 mb-4">点検が必要なホースホースを確認しましょう</p>
                
                <!-- 検索バー -->
                <div class="mt-4">
                    <input type="text" id="searchInput" placeholder="🔍 ホース番号、場所、地区で検索..." 
                        class="w-full px-4 py-3 rounded-xl border-2 border-gray-300 bg-gray-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200" 
                        style="font-size: 16px;"
                        oninput="applyFilters()">
                </div>
                
                <!-- AI優先度判定ボタン -->
                <div class="mt-4 flex gap-2">
                    <button id="aiAnalyzeBtn" onclick="analyzeWithAI()" 
                        class="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl transition font-bold shadow-lg">
                        🤖 AIで優先度を判断
                    </button>
                    <button id="resetPriorityBtn" onclick="loadStorages()" 
                        class="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl transition font-bold shadow-lg">
                        🔄 リセット
                    </button>
                </div>
            </div>
        </div>

        <!-- タブUI -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tabPriority" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-red-500 text-red-500 whitespace-nowrap">
                    ⚠️ 優先度
                </button>
                <button id="tabMap" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    🗺️ 地図
                </button>
                <button id="tabHistory" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    📋 全履歴
                </button>
            </div>

            <!-- 優先度タブ -->
            <div id="priorityTab" class="p-6">
                <!-- AI優先度判断ボタン -->
                <div class="mb-6">
                    <button onclick="analyzeWithAI()" id="aiAnalyzeBtn" class="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg shadow-lg flex items-center justify-center gap-2">
                        <span>🤖</span>
                        <span>AIで優先度を判断</span>
                        <span id="aiAnalyzeSpinner" class="hidden">⏳</span>
                    </button>
                    <p class="text-xs text-gray-600 mt-2 text-center">※ Claude AIがホース製造年月・点検履歴を総合的に分析します</p>
                </div>
                
                <!-- フィルタボタン群 -->
                <div class="mb-6">
                    <!-- 時間フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📅 点検時期</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setTimeFilter('all')" class="filter-btn time-filter active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setTimeFilter('under1')" class="filter-btn time-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年未満</button>
                            <button onclick="setTimeFilter('1to2')" class="filter-btn time-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年以上2年未満</button>
                            <button onclick="setTimeFilter('over2')" class="filter-btn time-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">2年以上</button>
                            <button onclick="setTimeFilter('never')" class="filter-btn time-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">未点検</button>
                        </div>
                    </div>

                    <!-- 地区フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📍 地区</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setDistrictFilter('all')" class="filter-btn district-filter active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setDistrictFilter('市場')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">市場</button>
                            <button onclick="setDistrictFilter('根岸上')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸上</button>
                            <button onclick="setDistrictFilter('根岸下')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸下</button>
                            <button onclick="setDistrictFilter('坊村')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">坊村</button>
                            <button onclick="setDistrictFilter('馬場')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">馬場</button>
                            <button onclick="setDistrictFilter('宮地')" class="filter-btn district-filter px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">宮地</button>
                        </div>
                    </div>
                </div>

                <!-- 今日点検するホース（固定表示） -->
                <div id="todayPinnedList" class="mb-6"></div>

                <!-- ホース一覧 -->
                <div id="allStoragesList" class="space-y-4">
                    <div class="bg-gray-50 rounded-xl p-8 text-center"><p class="text-gray-800">読み込み中...</p></div>
                </div>
            </div>

            <!-- 地図タブ -->
            <div id="mapTab" class="p-6 hidden">
                <!-- フィルタボタン群 -->
                <div class="mb-6">
                    <!-- 時間フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📅 点検時期</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setTimeFilter('all')" class="filter-btn time-filter-map active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setTimeFilter('under1')" class="filter-btn time-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年未満</button>
                            <button onclick="setTimeFilter('1to2')" class="filter-btn time-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年以上2年未満</button>
                            <button onclick="setTimeFilter('over2')" class="filter-btn time-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">2年以上</button>
                            <button onclick="setTimeFilter('never')" class="filter-btn time-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">未点検</button>
                        </div>
                    </div>

                    <!-- 地区フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📍 地区</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setDistrictFilter('all')" class="filter-btn district-filter-map active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setDistrictFilter('市場')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">市場</button>
                            <button onclick="setDistrictFilter('根岸上')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸上</button>
                            <button onclick="setDistrictFilter('根岸下')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸下</button>
                            <button onclick="setDistrictFilter('坊村')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">坊村</button>
                            <button onclick="setDistrictFilter('馬場')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">馬場</button>
                            <button onclick="setDistrictFilter('宮地')" class="filter-btn district-filter-map px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">宮地</button>
                        </div>
                    </div>
                </div>
                
                <div id="allMap" class="mb-4"></div>
                
                <!-- 凡例 -->
                <div class="bg-white rounded-xl p-4 shadow-lg">
                    <p class="text-sm font-bold text-gray-700 mb-2">📍 地区</p>
                    <div class="flex flex-wrap gap-3">
                        <div class="flex items-center gap-2">
                            <div style="background-color: #ef4444; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">市場</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div style="background-color: #f97316; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">根岸上</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div style="background-color: #eab308; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">根岸下</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div style="background-color: #22c55e; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">坊村</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div style="background-color: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">馬場</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div style="background-color: #a855f7; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>
                            <span class="text-sm text-gray-700">宮地</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 全履歴タブ -->
            <div id="historyTab" class="p-6 hidden">
                <!-- フィルタボタン群 -->
                <div class="mb-6">
                    <!-- 時間フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📅 点検時期</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setTimeFilter('all')" class="filter-btn time-filter-history active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setTimeFilter('under1')" class="filter-btn time-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年未満</button>
                            <button onclick="setTimeFilter('1to2')" class="filter-btn time-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">1年以上2年未満</button>
                            <button onclick="setTimeFilter('over2')" class="filter-btn time-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">2年以上</button>
                            <button onclick="setTimeFilter('never')" class="filter-btn time-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">未点検</button>
                        </div>
                    </div>

                    <!-- 地区フィルタ -->
                    <div class="mb-4">
                        <p class="text-sm font-bold text-gray-700 mb-2">📍 地区</p>
                        <div class="flex flex-wrap gap-2">
                            <button onclick="setDistrictFilter('all')" class="filter-btn district-filter-history active px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">すべて</button>
                            <button onclick="setDistrictFilter('市場')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">市場</button>
                            <button onclick="setDistrictFilter('根岸上')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸上</button>
                            <button onclick="setDistrictFilter('根岸下')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">根岸下</button>
                            <button onclick="setDistrictFilter('坊村')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">坊村</button>
                            <button onclick="setDistrictFilter('馬場')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">馬場</button>
                            <button onclick="setDistrictFilter('宮地')" class="filter-btn district-filter-history px-4 py-2 rounded-lg bg-gray-200 text-gray-700 text-sm">宮地</button>
                        </div>
                    </div>
                </div>
                
                <div id="allHistoryList" class="space-y-4">
                    <p class="text-gray-600 text-center py-8">読み込み中...</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        let allStorages = [];
        let allInspections = [];
        let pinnedToday = JSON.parse(localStorage.getItem('pinnedTodayStorages') || '[]');
        let currentTimeFilter = 'all';
        let currentDistrictFilter = 'all';
        let leafletMap = null;
        
        window.onload = function() {
            loadAllData();
            setupTabs();
        };

        function setupTabs() {
            document.getElementById('tabPriority').addEventListener('click', () => switchTab('priority'));
            document.getElementById('tabMap').addEventListener('click', () => switchTab('map'));
            document.getElementById('tabHistory').addEventListener('click', () => switchTab('history'));
        }

        function switchTab(tabName) {
            const tabs = ['tabPriority', 'tabMap', 'tabHistory'];
            const contents = ['priorityTab', 'mapTab', 'historyTab'];

            tabs.forEach((tab, i) => {
                const btn = document.getElementById(tab);
                const content = document.getElementById(contents[i]);
                
                if (contents[i] === tabName + 'Tab') {
                    btn.classList.add('border-red-500', 'text-red-500');
                    btn.classList.remove('border-transparent', 'text-gray-500');
                    content.classList.remove('hidden');
                    
                    if (tabName === 'map' && !leafletMap) {
                        loadMap();
                    } else if (tabName === 'history' && allInspections.length === 0) {
                        loadHistory();
                    }
                } else {
                    btn.classList.remove('border-red-500', 'text-red-500');
                    btn.classList.add('border-transparent', 'text-gray-500');
                    content.classList.add('hidden');
                }
            });
        }
        
        function extractCoordsFromGoogleMapsUrl(url) {
            try {
                const atMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (atMatch) return { lat: parseFloat(atMatch[1]), lon: parseFloat(atMatch[2]) };
                const qMatch = url.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (qMatch) return { lat: parseFloat(qMatch[1]), lon: parseFloat(qMatch[2]) };
                const llMatch = url.match(/ll=(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (llMatch) return { lat: parseFloat(llMatch[1]), lon: parseFloat(llMatch[2]) };
            } catch (e) {
                console.error('座標抽出エラー:', e);
            }
            return null;
        }
        
        function getDistrictColor(district) {
            const colors = {
                '市場': '#ef4444',      // 赤
                '根岸上': '#f97316',    // オレンジ
                '根岸下': '#eab308',    // 黄
                '坊村': '#22c55e',      // 緑
                '馬場': '#3b82f6',      // 青
                '宮地': '#a855f7'       // 紫
            };
            return colors[district] || '#6b7280';  // デフォルトはグレー
        }
        
        function createColoredMarker(lat, lon, district, isPinned) {
            const color = getDistrictColor(district);
            
            // ピン留めされている場合は★アイコン
            if (isPinned) {
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: '<div style="font-size: 30px; text-shadow: 0 2px 5px rgba(0,0,0,0.5);">⭐</div>',
                    iconSize: [30, 30],
                    iconAnchor: [15, 30]
                });
                return L.marker([lat, lon], { icon: icon });
            }
            
            // 通常のピンアイコン
            const icon = L.divIcon({
                className: 'custom-marker',
                html: '<div style="background-color: ' + color + '; width: 25px; height: 25px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.3);"></div>',
                iconSize: [25, 25],
                iconAnchor: [12, 24]
            });
            return L.marker([lat, lon], { icon: icon });
        }

        async function loadAllData() {
            try {
                const response = await fetch('/api/inspection/priority-all');
                const data = await response.json();
                allStorages = data.storages || [];
                applyFilters();
            } catch (error) {
                document.getElementById('allStoragesList').innerHTML = 
                    '<div class="bg-gray-50 rounded-xl p-8 text-center"><p class="text-gray-800">データの読み込みに失敗しました</p></div>';
                console.error(error);
            }
        }

        async function analyzeWithAI() {
            const btn = document.getElementById('aiAnalyzeBtn');
            const spinner = document.getElementById('aiAnalyzeSpinner');
            
            if (allStorages.length === 0) {
                alert('ホースデータがありません');
                return;
            }
            
            // ボタンを無効化
            btn.disabled = true;
            spinner.classList.remove('hidden');
            btn.innerHTML = '<span>🤖</span><span>AI分析中...</span><span>⏳</span>';
            
            try {
                const response = await fetch('/api/inspection/ai-priority', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ storages: allStorages })
                });
                
                if (!response.ok) {
                    throw new Error('AI分析に失敗しました');
                }
                
                const result = await response.json();
                
                if (result.rankings && result.rankings.length > 0) {
                    // AI判定結果をallStoragesに反映
                    allStorages = allStorages.map(storage => {
                        const ranking = result.rankings.find(r => r.storage_id === storage.id);
                        if (ranking) {
                            return {
                                ...storage,
                                ai_priority_score: ranking.priority_score,
                                ai_reason: ranking.reason,
                                oldest_hose_age_years: ranking.oldest_hose_age_years
                            };
                        }
                        return storage;
                    });
                    
                    // AIスコア順にソート
                    allStorages.sort((a, b) => (b.ai_priority_score || 0) - (a.ai_priority_score || 0));
                    
                    applyFilters();
                    alert('✅ AI優先度判定が完了しました！\\n\\n上位のホースから順に表示されます。');
                } else {
                    alert('❌ AI判定結果が取得できませんでした');
                }
                
            } catch (error) {
                console.error('AI analysis error:', error);
                alert('❌ AI分析中にエラーが発生しました\\n\\n' + error.message);
            } finally {
                // ボタンを元に戻す
                btn.disabled = false;
                spinner.classList.add('hidden');
                btn.innerHTML = '<span>🤖</span><span>AIで優先度を判断</span>';
            }
        }

        function setTimeFilter(filter) {
            currentTimeFilter = filter;
            // 全タブのフィルタボタンを更新
            document.querySelectorAll('.time-filter, .time-filter-map, .time-filter-history').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.time-filter, .time-filter-map, .time-filter-history').forEach(btn => {
                if ((btn.textContent.includes('すべて') && filter === 'all') ||
                    (btn.textContent.includes('1年未満') && filter === 'under1') ||
                    (btn.textContent.includes('1年以上2年未満') && filter === '1to2') ||
                    (btn.textContent.includes('2年以上') && filter === 'over2') ||
                    (btn.textContent.includes('未点検') && filter === 'never')) {
                    btn.classList.add('active');
                }
            });
            applyFilters();
        }

        function setDistrictFilter(filter) {
            currentDistrictFilter = filter;
            // 全タブのフィルタボタンを更新
            document.querySelectorAll('.district-filter, .district-filter-map, .district-filter-history').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.district-filter, .district-filter-map, .district-filter-history').forEach(btn => {
                if (btn.textContent.trim() === filter || (btn.textContent.includes('すべて') && filter === 'all')) {
                    btn.classList.add('active');
                }
            });
            applyFilters();
        }

        function applyFilters() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            let filtered = allStorages.filter(storage => {
                // 検索フィルタ
                if (searchTerm) {
                    const storageNumber = (storage.storage_number || '').toLowerCase();
                    const location = (storage.location || '').toLowerCase();
                    const district = (storage.district || '').toLowerCase();
                    
                    if (!storageNumber.includes(searchTerm) && 
                        !location.includes(searchTerm) && 
                        !district.includes(searchTerm)) {
                        return false;
                    }
                }
                
                // 時間フィルタ（AND条件）
                const daysAgo = storage.days_since_inspection;
                if (currentTimeFilter === 'under1' && (daysAgo === null || daysAgo >= 365)) return false;
                if (currentTimeFilter === '1to2' && (daysAgo === null || daysAgo < 365 || daysAgo >= 730)) return false;
                if (currentTimeFilter === 'over2' && (daysAgo === null || daysAgo < 730)) return false;
                if (currentTimeFilter === 'never' && daysAgo !== null) return false;
                
                // 地区フィルタ（AND条件）
                if (currentDistrictFilter !== 'all' && storage.district !== currentDistrictFilter) return false;
                
                return true;
            });
            
            renderStoragesList(filtered);
            
            // 地図も更新
            if (leafletMap) {
                updateMap(filtered);
            }
            
            // 履歴も更新（ホースIDで絞り込み）
            if (allInspections.length > 0) {
                const filteredStorageIds = filtered.map(s => s.id);
                const filteredInspections = allInspections.filter(insp => 
                    filteredStorageIds.some(sid => insp.storage_id === sid)
                );
                renderHistoryList(filteredInspections);
            }
        }

        function pinTodayInspection(storageId, event) {
            event.stopPropagation();
            if (!pinnedToday.includes(storageId)) {
                pinnedToday.push(storageId);
                localStorage.setItem('pinnedTodayStorages', JSON.stringify(pinnedToday));
                applyFilters();
            }
        }

        function unpinStorage(storageId, event) {
            event.stopPropagation();
            pinnedToday = pinnedToday.filter(id => id !== storageId);
            localStorage.setItem('pinnedTodayStorages', JSON.stringify(pinnedToday));
            applyFilters();
        }

        function renderStoragesList(storages) {
            // 固定表示（今日点検する）
            const pinnedStorages = allStorages.filter(s => pinnedToday.includes(s.id));
            const pinnedContainer = document.getElementById('todayPinnedList');
            
            if (pinnedStorages.length > 0) {
                pinnedContainer.innerHTML = '<h3 class="text-xl font-bold text-gray-800 mb-4">📌 今日点検する</h3>' +
                    '<div class="space-y-4 mb-6">' + 
                    pinnedStorages.map(storage => renderStorageCard(storage, true)).join('') +
                    '</div>';
            } else {
                pinnedContainer.innerHTML = '';
            }
            
            // 通常リスト（固定表示以外）
            const unpinnedStorages = storages.filter(s => !pinnedToday.includes(s.id));
            const list = document.getElementById('allStoragesList');
            
            if (unpinnedStorages.length === 0) {
                list.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800 text-xl">該当するホースがありません</p></div>';
                return;
            }

            list.innerHTML = unpinnedStorages.map(storage => renderStorageCard(storage, false)).join('');
        }

        function renderStorageCard(storage, isPinned) {
            const daysAgo = storage.days_since_inspection;
            const lastResult = storage.last_inspection_result;
            let priorityClass = isPinned ? 'pinned-today' : 'priority-low';
            let priorityText = '正常';
            let priorityIcon = '✅';
            
            if (!isPinned) {
                if (lastResult === 'abnormal') {
                    priorityClass = 'priority-high';
                    priorityText = '異常あり';
                    priorityIcon = '🚨';
                } else if (lastResult === 'caution') {
                    priorityClass = 'priority-medium';
                    priorityText = '要注意';
                    priorityIcon = '⚠️';
                } else if (lastResult === 'normal') {
                    priorityClass = 'priority-low';
                    priorityText = '正常';
                    priorityIcon = '✅';
                } else if (daysAgo === null) {
                    priorityClass = 'priority-high';
                    priorityText = '未点検';
                    priorityIcon = '🚨';
                } else if (daysAgo > 730) {
                    priorityClass = 'priority-high';
                    priorityText = '要点検';
                    priorityIcon = '🚨';
                } else if (daysAgo > 365) {
                    priorityClass = 'priority-medium';
                    priorityText = '点検推奨';
                    priorityIcon = '⚠️';
                }
            } else {
                priorityText = '今日点検';
                priorityIcon = '📌';
            }

            const lastInspection = storage.last_inspection_date 
                ? new Date(storage.last_inspection_date).toLocaleDateString('ja-JP')
                : '未点検';
            
            const pinButton = isPinned 
                ? '<button onclick="unpinStorage(\\\'' + storage.id + '\\', event)" class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition border border-white border-opacity-50 mb-2">❌ 固定解除</button>'
                : '<button onclick="pinTodayInspection(\\\'' + storage.id + '\\', event)" class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-semibold transition border border-white border-opacity-50 mb-2">📌 今日点検する</button>';
            
            const hasLocation = (storage.latitude && storage.longitude) || storage.google_maps_url;
            const mapId = 'map-card-' + storage.id;
            
            let html = '<div class="' + priorityClass + ' rounded-2xl shadow-2xl p-6 cursor-pointer" onclick="location.href=\\'/storage/' + storage.id + '?openModal=true\\'">' +
                '<div class="text-white">';
            
            // 画像表示
            if (storage.image_url) {
                html += '<div class="mb-4"><img src="' + storage.image_url + '" alt="' + storage.location + '" class="w-full h-48 object-cover rounded-xl"></div>';
            }
            
            // 小地図表示
            if (hasLocation) {
                html += '<div id="' + mapId + '" class="storage-map mb-4"></div>';
            }
            
            html += '<div class="flex justify-between items-start mb-4">' +
                        '<div class="flex-1">' +
                            (storage.district ? '<p class="text-lg opacity-90 mb-1">' + storage.district + '</p>' : '') +
                            '<h3 class="text-2xl font-bold">' + storage.storage_number + ' | ' + storage.location + '</h3>' +
                        '</div>' +
                        '<span class="bg-white bg-opacity-30 backdrop-blur-sm px-4 py-2 rounded-full text-base font-bold border border-white border-opacity-50 ml-2">' + priorityIcon + ' ' + priorityText + '</span>' +
                    '</div>' +
                    '<p class="text-base opacity-90 mb-2">最終点検: ' + lastInspection + (daysAgo !== null ? ' (' + daysAgo + '日前)' : '') + '</p>';
            
            // AIスコアと理由表示
            if (storage.ai_priority_score) {
                html += '<div class="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-3 mb-4 border border-white border-opacity-30">' +
                           '<p class="text-sm font-bold mb-1">🤖 AI優先度: ' + storage.ai_priority_score + '点/100点</p>' +
                           '<p class="text-xs opacity-90">' + (storage.ai_reason || '') + '</p>';
                if (storage.oldest_hose_age_years) {
                    html += '<p class="text-xs opacity-90 mt-1">最古ホース: ' + storage.oldest_hose_age_years + '年経過</p>';
                }
                html += '</div>';
            }
            
            html += pinButton +
                    '<button class="w-full bg-white bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm px-4 py-3 rounded-xl text-base font-semibold transition border border-white border-opacity-50">📝 点検する</button>' +
                '</div>' +
            '</div>';
            
            // 地図初期化（非同期）
            if (hasLocation) {
                setTimeout(async () => {
                    let lat = storage.latitude;
                    let lon = storage.longitude;
                    
                    if (!lat && !lon && storage.google_maps_url) {
                        const coords = extractCoordsFromGoogleMapsUrl(storage.google_maps_url);
                        if (coords) {
                            lat = coords.lat;
                            lon = coords.lon;
                        }
                    }
                    
                    if (lat && lon) {
                        const mapElement = document.getElementById(mapId);
                        if (mapElement && !mapElement.classList.contains('leaflet-container')) {
                            try {
                                const map = L.map(mapId, {
                                    dragging: false,
                                    touchZoom: false,
                                    scrollWheelZoom: false,
                                    doubleClickZoom: false,
                                    boxZoom: false,
                                    keyboard: false,
                                    zoomControl: false
                                }).setView([lat, lon], 15);
                                
                                L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png').addTo(map);
                                L.marker([lat, lon]).addTo(map);
                            } catch (e) {
                                console.error('Map init error:', e);
                            }
                        }
                    }
                }, 500);
            }
            
            return html;
        }

        async function loadMap() {
            const mapContainer = document.getElementById('allMap');
            
            if (allStorages.length === 0) {
                mapContainer.innerHTML = '<p class="text-gray-600 text-center py-8">ホースデータがありません</p>';
                return;
            }

            leafletMap = L.map('allMap').setView([35.325, 139.157], 14);
            L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png').addTo(leafletMap);

            // フィルタ適用したホースのみ表示
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            let filtered = allStorages.filter(storage => {
                if (searchTerm) {
                    const storageNumber = (storage.storage_number || '').toLowerCase();
                    const location = (storage.location || '').toLowerCase();
                    const district = (storage.district || '').toLowerCase();
                    if (!storageNumber.includes(searchTerm) && !location.includes(searchTerm) && !district.includes(searchTerm)) return false;
                }
                const daysAgo = storage.days_since_inspection;
                if (currentTimeFilter === 'under1' && (daysAgo === null || daysAgo >= 365)) return false;
                if (currentTimeFilter === '1to2' && (daysAgo === null || daysAgo < 365 || daysAgo >= 730)) return false;
                if (currentTimeFilter === 'over2' && (daysAgo === null || daysAgo < 730)) return false;
                if (currentTimeFilter === 'never' && daysAgo !== null) return false;
                if (currentDistrictFilter !== 'all' && storage.district !== currentDistrictFilter) return false;
                return true;
            });

            const bounds = [];

            for (const storage of filtered) {
                let lat = storage.latitude;
                let lon = storage.longitude;
                
                if (!lat && !lon && storage.google_maps_url) {
                    const coords = extractCoordsFromGoogleMapsUrl(storage.google_maps_url);
                    if (coords) {
                        lat = coords.lat;
                        lon = coords.lon;
                    }
                }
                
                if (lat && lon) {
                    const isPinned = pinnedToday.includes(storage.id);
                    const marker = createColoredMarker(lat, lon, storage.district, isPinned);
                    marker.addTo(leafletMap);
                    marker.bindPopup('<b>' + storage.storage_number + '</b><br>' + (storage.district ? storage.district + ' - ' : '') + storage.location + '<br><a href="/storage/' + storage.id + '" class="text-blue-600 hover:underline">詳細を見る</a>');
                    
                    // マーカークリックでピン留めトグル
                    marker.on('click', function(e) {
                        e.originalEvent.stopPropagation();
                        if (pinnedToday.includes(storage.id)) {
                            // ピン解除
                            pinnedToday = pinnedToday.filter(id => id !== storage.id);
                        } else {
                            // ピン留め追加
                            pinnedToday.push(storage.id);
                        }
                        localStorage.setItem('pinnedTodayStorages', JSON.stringify(pinnedToday));
                        // 地図を再描画
                        applyFilters();
                    });
                    
                    bounds.push([lat, lon]);
                }
            }
            
            // 全てのマーカーが見えるように地図を調整
            if (bounds.length > 0) {
                leafletMap.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        function updateMap(filteredStorages) {
            if (!leafletMap) return;
            
            // 既存のマーカーを全削除
            leafletMap.eachLayer(layer => {
                if (layer instanceof L.Marker) {
                    leafletMap.removeLayer(layer);
                }
            });
            
            const bounds = [];
            
            // フィルタされたホースのマーカーを再追加
            for (const storage of filteredStorages) {
                let lat = storage.latitude;
                let lon = storage.longitude;
                
                if (!lat && !lon && storage.google_maps_url) {
                    const coords = extractCoordsFromGoogleMapsUrl(storage.google_maps_url);
                    if (coords) {
                        lat = coords.lat;
                        lon = coords.lon;
                    }
                }
                
                if (lat && lon) {
                    const isPinned = pinnedToday.includes(storage.id);
                    const marker = createColoredMarker(lat, lon, storage.district, isPinned);
                    marker.addTo(leafletMap);
                    marker.bindPopup('<b>' + storage.storage_number + '</b><br>' + (storage.district ? storage.district + ' - ' : '') + storage.location + '<br><a href="/storage/' + storage.id + '" class="text-blue-600 hover:underline">詳細を見る</a>');
                    
                    // マーカークリックでピン留めトグル
                    marker.on('click', function(e) {
                        e.originalEvent.stopPropagation();
                        if (pinnedToday.includes(storage.id)) {
                            // ピン解除
                            pinnedToday = pinnedToday.filter(id => id !== storage.id);
                        } else {
                            // ピン留め追加
                            pinnedToday.push(storage.id);
                        }
                        localStorage.setItem('pinnedTodayStorages', JSON.stringify(pinnedToday));
                        // 地図を再描画
                        applyFilters();
                    });
                    
                    bounds.push([lat, lon]);
                }
            }
            
            // 全てのマーカーが見えるように地図を調整
            if (bounds.length > 0) {
                leafletMap.fitBounds(bounds, { padding: [50, 50] });
            }
        }

        async function loadHistory() {
            try {
                const response = await fetch('/api/inspection/all-history');
                const data = await response.json();
                allInspections = data.inspections || [];
                console.log('Loaded inspections:', allInspections.length);
                renderHistoryList(allInspections);
            } catch (error) {
                document.getElementById('allHistoryList').innerHTML = 
                    '<p class="text-gray-600 text-center py-8">履歴の読み込みに失敗しました</p>';
                console.error('History load error:', error);
            }
        }

        function renderHistoryList(inspections) {
            const container = document.getElementById('allHistoryList');
            console.log('Rendering history list:', inspections.length, 'items');
            
            if (inspections.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-8">点検履歴がありません</p>';
                return;
            }

            container.innerHTML = inspections.map(inspection => {
                const hasActionItems = inspection.action_item_1 || inspection.action_item_2 || inspection.action_item_3;
                
                let html = '<div class="bg-white rounded-lg border-2 border-gray-200 p-4">' +
                    '<div class="flex justify-between items-start">' +
                        '<div class="flex-1">' +
                            '<h4 class="text-lg font-bold text-gray-800">📅 ' + inspection.inspection_date + '</h4>' +
                            '<p class="text-gray-600">📍 ' + inspection.storage_number + ' | ' + inspection.location + '</p>' +
                            '<p class="text-gray-600">👤 点検者: ' + inspection.inspector_name + '</p>';
                
                // inspection_resultが存在する場合のみ表示
                if (inspection.inspection_result) {
                    const resultText = inspection.inspection_result === 'normal' ? '正常' : 
                                      inspection.inspection_result === 'caution' ? '要注意' : '異常あり';
                    html += '<p class="text-gray-600">🔍 結果: ' + resultText + '</p>';
                }
                
                html += '</div>' +
                        '<button onclick="deleteInspection(\'' + inspection.id + '\')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm font-bold transition ml-2">' +
                            '🗑️ 削除' +
                        '</button>' +
                    '</div>';
                
                if (hasActionItems) {
                    html += '<div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">' +
                        '<p class="font-bold text-sm text-gray-800 mb-1">⚠️ 要対応事項</p>';
                    if (inspection.action_item_1) html += '<p class="text-sm text-gray-700">① ' + inspection.action_item_1 + '</p>';
                    if (inspection.action_item_2) html += '<p class="text-sm text-gray-700">② ' + inspection.action_item_2 + '</p>';
                    if (inspection.action_item_3) html += '<p class="text-sm text-gray-700">③ ' + inspection.action_item_3 + '</p>';
                    html += '</div>';
                }
                
                if (inspection.notes) {
                    html += '<p class="text-sm text-gray-600 mt-2">📝 ' + inspection.notes + '</p>';
                }
                
                html += '</div>';
                return html;
            }).join('');
        }

        async function deleteInspection(inspectionId) {
            if (!confirm('この点検履歴を削除しますか？')) return;
            
            try {
                const response = await fetch('/api/inspection/' + inspectionId, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('削除しました');
                    loadHistory();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('削除に失敗しました');
            }
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// API: 全ホース取得（点検が古い順）
// ==========================================
app.get('/api/inspection/priority-all', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date
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
    
    // 1. 全ホースの最終点検日と結果を取得して、最優先のものを1件取得
    const topPriorityResult = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date
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
    
    // 2. 同じ地区のホースで点検が古い順に3件取得（最優先のものは除く）
    const sameDistrictResult = await env.DB.prepare(`
      SELECT 
        s.*,
        i.inspection_date as last_inspection_date,
        CAST((julianday('now') - julianday(i.inspection_date)) AS INTEGER) as days_since_inspection
      FROM hose_storages s
      LEFT JOIN (
        SELECT 
          hi1.storage_id, 
          hi1.inspection_date
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
// API: AI優先度分析（Claude API）
// ==========================================
app.post('/api/inspection/ai-priority', async (c) => {
  try {
    const env = c.env as { DB: D1Database; ANTHROPIC_API_KEY?: string }
    const { storages } = await c.req.json()
    
    if (!env.ANTHROPIC_API_KEY) {
      return c.json({ error: 'ANTHROPIC_API_KEY not configured' }, 500)
    }
    
    // Claude APIに送信するプロンプト
    const prompt = `あなたは消防団の点検優先度判定AIです。以下のホースデータを分析し、点検が最も必要な順にランキングしてください。

ホースデータ（JSON）:
${JSON.stringify(storages, null, 2)}

【重要】判定基準（優先度順）:
1. **ホース製造年月（最重要）**
   - 製造から10年以上経過したホースがある場合は最優先
   - ホースは新しければ10年は使用可能
   - hose_1_manufacture_date～hose_4_manufacture_date の最古のものを基準に判定
   
2. **点検履歴**
   - 最終点検日が古い（未点検含む）
   - 備考に「【消火栓点検のみ】」と記載されている場合、ホース点検はカウントしない
   
3. **前回点検結果**
   - 異常・要注意・ホース破損/交換が多い
   
4. **地区的重要性**
   - 人口密集地域、重要施設近辺

各ホースについて、100点満点で優先度スコアを算出し、以下のJSON形式で返してください:
{
  "rankings": [
    {
      "storage_id": "ホースID",
      "priority_score": 95,
      "reason": "ホース製造12年経過、要点検",
      "oldest_hose_age_years": 12
    }
  ]
}

必ず上記JSON形式のみで回答してください。説明文は不要です。`

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 2048,
        messages: [{
          role: 'user',
          content: prompt
        }]
      })
    })
    
    if (!response.ok) {
      throw new Error('Claude API error: ' + response.statusText)
    }
    
    const data = await response.json() as any
    const aiResponse = data.content[0].text
    
    // JSONをパース
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return c.json({ error: 'Invalid AI response format' }, 500)
    }
    
    const rankings = JSON.parse(jsonMatch[0])
    return c.json(rankings)
    
  } catch (error) {
    console.error('AI priority analysis error:', error)
    return c.json({ error: 'AI analysis failed' }, 500)
  }
})

// ==========================================
// API: 全点検履歴取得（新しい順）
// ==========================================
app.get('/api/inspection/all-history', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT 
        hi.id,
        hi.storage_id,
        hi.inspection_date,
        hi.inspector_name,
        hi.inspection_result,
        hi.action_item_1,
        hi.action_item_2,
        hi.action_item_3,
        hi.notes,
        s.storage_number,
        s.location,
        s.district
      FROM hose_inspections hi
      INNER JOIN hose_storages s ON hi.storage_id = s.id
      ORDER BY hi.inspection_date DESC
      LIMIT 200
    `).all()
    
    return c.json({ inspections: result.results || [] })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ inspections: [] })
  }
})

// ==========================================
// 防火水槽詳細・点検ページ
// ==========================================
app.get('/water-tank/:id', async (c) => {
  const id = c.req.param('id')
  
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>防火水槽点検 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
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
        #tankMapContainer {
            height: 600px;
            border-radius: 1rem;
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
                <a href="/water-tanks" class="text-blue-600 hover:text-blue-800 text-sm bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    ← 一覧に戻る
                </a>
            </div>
        </div>
    </nav>

    <div class="container mx-auto px-4 py-6">
        <div id="tankInfo" class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <p class="text-gray-600">読み込み中...</p>
        </div>

        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tankTabRecord" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-blue-500 text-blue-500 whitespace-nowrap">
                    📝 点検記録
                </button>
                <button id="tankTabMap" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    🗺️ 地図
                </button>
                <button id="tankTabHistory" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    📋 全履歴
                </button>
            </div>

            <!-- 点検記録タブ -->
            <div id="tankRecordTab" class="p-6">
                <button onclick="showAddInspectionModal()" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition shadow-lg font-bold text-lg">
                    ➕ 点検を記録
                </button>
                
                <div id="inspectionsList" class="space-y-4 mt-6">
                    <p class="text-gray-600 text-center py-8">読み込み中...</p>
                </div>
            </div>

            <!-- 地図タブ -->
            <div id="tankMapTab" class="p-6 hidden">
                <div id="tankMapContainer" class="mb-6">
                    <p class="text-gray-600 text-center py-8">地図を読み込んでいます...</p>
                </div>
            </div>

            <!-- 点検履歴タブ -->
            <div id="tankHistoryTab" class="p-6 hidden">
                <div class="mb-6">
                    <h3 class="text-xl font-bold text-gray-800 mb-4">📋 全点検履歴</h3>
                    <div id="tankAllInspections" class="space-y-4">
                        <p class="text-gray-600 text-center py-8">読み込み中...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 点検記録モーダル -->
    <div id="inspectionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-6">
                    <h2 id="inspectionModalTitle" class="text-2xl font-bold text-gray-800">💧 点検を記録</h2>
                    <button onclick="hideInspectionModal()" class="text-gray-500 hover:text-gray-700 text-2xl">✕</button>
                </div>

                <div class="space-y-4">
                    <input type="hidden" id="inspectionId">
                    
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">点検日 <span class="text-red-500">*</span></label>
                        <input type="date" id="inspectionDate" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">点検者 <span class="text-red-500">*</span></label>
                        <select id="inspectorId" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">水位 <span class="text-red-500">*</span></label>
                        <select id="waterLevel" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                            <option value="満水">満水</option>
                            <option value="半分">半分</option>
                            <option value="空">空</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">水質 <span class="text-red-500">*</span></label>
                        <select id="waterQuality" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                            <option value="良好">良好</option>
                            <option value="濁り">濁り</option>
                            <option value="異臭">異臭</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">蓋の状態 <span class="text-red-500">*</span></label>
                        <select id="lidCondition" required class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="">選択してください</option>
                            <option value="正常">正常</option>
                            <option value="破損">破損</option>
                            <option value="紛失">紛失</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">写真</label>
                        <input type="file" id="inspectionImage" accept="image/*" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                        <div id="imagePreview" class="mt-2"></div>
                    </div>

                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">コメント</label>
                        <textarea id="inspectionComment" rows="3" placeholder="その他気づいた点など" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                    </div>

                    <div class="flex space-x-3 pt-4">
                        <button type="button" onclick="saveInspection()" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                            ✅ 保存する
                        </button>
                        <button type="button" onclick="hideInspectionModal()" class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                            キャンセル
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const tankId = '${id}';
        let tank = null;
        let inspections = [];
        let members = [];

        window.onload = function() {
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('inspectionDate').value = today;
            
            loadMembers();
            loadTank();
            loadInspections();
            
            // タブ切り替えイベント
            document.getElementById('tankTabRecord').addEventListener('click', () => switchTankTab('record'));
            document.getElementById('tankTabMap').addEventListener('click', () => switchTankTab('map'));
            document.getElementById('tankTabHistory').addEventListener('click', () => switchTankTab('history'));
            
            // URLパラメータで編集モードチェック
            const urlParams = new URLSearchParams(window.location.search);
            const editId = urlParams.get('edit');
            if (editId) {
                // データ読み込み後に編集モーダルを開く
                setTimeout(() => editInspection(editId), 1000);
            }
        };

        // タブ切り替え
        function switchTankTab(tabName) {
            const tabRecord = document.getElementById('tankTabRecord');
            const tabMap = document.getElementById('tankTabMap');
            const tabHistory = document.getElementById('tankTabHistory');
            const recordTab = document.getElementById('tankRecordTab');
            const mapTab = document.getElementById('tankMapTab');
            const historyTab = document.getElementById('tankHistoryTab');

            // 全タブのスタイルをリセット
            [tabRecord, tabMap, tabHistory].forEach(tab => {
                tab.classList.remove('border-blue-500', 'text-blue-500');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            
            // 全コンテンツを非表示
            [recordTab, mapTab, historyTab].forEach(content => {
                content.classList.add('hidden');
            });

            // 選択されたタブをアクティブに
            if (tabName === 'record') {
                tabRecord.classList.add('border-blue-500', 'text-blue-500');
                tabRecord.classList.remove('border-transparent', 'text-gray-500');
                recordTab.classList.remove('hidden');
            } else if (tabName === 'map') {
                tabMap.classList.add('border-blue-500', 'text-blue-500');
                tabMap.classList.remove('border-transparent', 'text-gray-500');
                mapTab.classList.remove('hidden');
                loadTankMap();
            } else if (tabName === 'history') {
                tabHistory.classList.add('border-blue-500', 'text-blue-500');
                tabHistory.classList.remove('border-transparent', 'text-gray-500');
                historyTab.classList.remove('hidden');
                displayAllInspections();
            }
        }

        // 地図読み込み
        function loadTankMap() {
            const mapContainer = document.getElementById('tankMapContainer');
            
            let lat = tank ? tank.latitude : null;
            let lon = tank ? tank.longitude : null;
            
            // Google Maps URLから座標を抽出
            if (!lat && !lon && tank && tank.google_maps_url) {
                const atMatch = tank.google_maps_url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
                if (atMatch) {
                    lat = parseFloat(atMatch[1]);
                    lon = parseFloat(atMatch[2]);
                }
            }
            
            if (!lat || !lon) {
                mapContainer.innerHTML = '<p class="text-gray-600 text-center py-8">位置情報が登録されていません。防火水槽編集でGoogle Maps URLを追加してください。</p>';
                return;
            }

            mapContainer.innerHTML = '';
            const map = L.map('tankMapContainer').setView([lat, lon], 16);
            L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png').addTo(map);
            L.marker([lat, lon]).addTo(map).bindPopup('<b>' + (tank ? tank.location : '防火水槽') + '</b>').openPopup();
        }

        // 全点検履歴表示
        function displayAllInspections() {
            const container = document.getElementById('tankAllInspections');
            if (inspections.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-8">まだ点検記録がありません</p>';
                return;
            }
            container.innerHTML = inspections.map(inspection => {
                const hasActionItems = inspection.action_item_1 || inspection.action_item_2 || inspection.action_item_3;
                
                let actionItemsHtml = '';
                if (hasActionItems) {
                    actionItemsHtml = '<div class="mt-3 bg-yellow-50 border border-yellow-200 rounded p-3">' +
                        '<p class="font-bold text-sm text-gray-800 mb-1">⚠️ 要対応事項</p>';
                    if (inspection.action_item_1) actionItemsHtml += '<p class="text-sm text-gray-700">① ' + inspection.action_item_1 + '</p>';
                    if (inspection.action_item_2) actionItemsHtml += '<p class="text-sm text-gray-700">② ' + inspection.action_item_2 + '</p>';
                    if (inspection.action_item_3) actionItemsHtml += '<p class="text-sm text-gray-700">③ ' + inspection.action_item_3 + '</p>';
                    actionItemsHtml += '</div>';
                }
                
                let notesHtml = '';
                if (inspection.notes) {
                    notesHtml = '<p class="text-sm text-gray-600 mt-2">📝 ' + inspection.notes + '</p>';
                }
                
                return \`
                    <div class="bg-white rounded-lg border-2 border-gray-200 p-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h4 class="text-lg font-bold text-gray-800">📅 \${inspection.inspection_date}</h4>
                                <p class="text-gray-600">👤 点検者: \${inspection.inspector_name}</p>
                            </div>
                            <div class="flex gap-2">
                                <button onclick="editInspection('\${inspection.id}')" class="text-blue-600 hover:text-blue-800 text-xl">✏️</button>
                                <button onclick="deleteInspection('\${inspection.id}')" class="text-red-600 hover:text-red-800 text-xl">🗑️</button>
                            </div>
                        </div>
                        \${actionItemsHtml}
                        \${notesHtml}
                    </div>
                \`;
            }).join('');
        }
        
        function editInspection(inspectionId) {
            const inspection = inspections.find(i => i.id === inspectionId);
            if (!inspection) return;
            
            document.getElementById('inspectionId').value = inspection.id;
            document.getElementById('inspectionDate').value = inspection.inspection_date;
            document.getElementById('inspectorName').value = inspection.inspector_name;
            document.getElementById('actionItem1').value = inspection.action_item_1 || '';
            document.getElementById('actionItem2').value = inspection.action_item_2 || '';
            document.getElementById('actionItem3').value = inspection.action_item_3 || '';
            document.getElementById('inspectionNotes').value = inspection.notes || '';
            
            document.getElementById('inspectionModalTitle').textContent = '✏️ 点検記録を編集';
            document.getElementById('inspectionModal').classList.remove('hidden');
        }
        
        async function deleteInspection(inspectionId) {
            if (!confirm('この点検記録を削除しますか？\\n\\nこの操作は取り消せません。')) {
                return;
            }
            
            try {
                const response = await fetch('/api/water-tank-inspections/' + inspectionId, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('削除しました');
                    await loadInspections();
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('削除中にエラーが発生しました');
            }
        }

        async function loadMembers() {
            try {
                const response = await fetch('/api/users?active_only=1');
                const data = await response.json();
                members = data.users || [];
                
                const select = document.getElementById('inspectorId');
                members.forEach(member => {
                    const option = document.createElement('option');
                    option.value = member.id;
                    option.textContent = member.name;
                    select.appendChild(option);
                });
            } catch (error) {
                console.error('Failed to load members:', error);
            }
        }

        async function loadTank() {
            try {
                const response = await fetch('/api/water-tanks');
                const data = await response.json();
                tank = (data.tanks || []).find(t => t.id === tankId);
                
                if (!tank) {
                    document.getElementById('tankInfo').innerHTML = '<p class="text-red-600">防火水槽が見つかりません</p>';
                    return;
                }
                
                displayTankInfo();
            } catch (error) {
                console.error('Failed to load tank:', error);
                document.getElementById('tankInfo').innerHTML = '<p class="text-red-600">読み込みに失敗しました</p>';
            }
        }

        function displayTankInfo() {
            let notesHtml = '';
            if (tank.notes) {
                notesHtml = '<div class="text-gray-600"><span class="font-bold">📝 備考:</span> ' + tank.notes + '</div>';
            }
            
            document.getElementById('tankInfo').innerHTML = \`
                <div class="flex justify-between items-start mb-4">
                    <h1 class="text-3xl font-bold text-gray-800">💧 \${tank.location}</h1>
                    <div class="flex space-x-2">
                        <button onclick="editTank()" class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition font-bold">
                            ✏️ 編集
                        </button>
                        <button onclick="deleteTank()" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-bold">
                            🗑️ 削除
                        </button>
                    </div>
                </div>
                \${notesHtml}
            \`;
        }

        async function loadInspections() {
            try {
                const response = await fetch('/api/water-tank-inspections?tank_id=' + tankId);
                const data = await response.json();
                inspections = data.inspections || [];
                displayInspections();
            } catch (error) {
                console.error('Failed to load inspections:', error);
                document.getElementById('inspectionsList').innerHTML = '<p class="text-red-600 text-center py-8">読み込みに失敗しました</p>';
            }
        }

        function displayInspections() {
            const container = document.getElementById('inspectionsList');
            
            if (inspections.length === 0) {
                container.innerHTML = '<p class="text-gray-600 text-center py-8">まだ点検記録がありません</p>';
                return;
            }

            container.innerHTML = inspections.map(inspection => {
                const hasActionItems = inspection.action_item_1 || inspection.action_item_2 || inspection.action_item_3;
                
                let actionItemsHtml = '';
                if (hasActionItems) {
                    actionItemsHtml = '<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">' +
                        '<p class="font-bold text-gray-800 mb-2">⚠️ 要対応事項</p>';
                    if (inspection.action_item_1) actionItemsHtml += '<p class="text-gray-700">① ' + inspection.action_item_1 + '</p>';
                    if (inspection.action_item_2) actionItemsHtml += '<p class="text-gray-700">② ' + inspection.action_item_2 + '</p>';
                    if (inspection.action_item_3) actionItemsHtml += '<p class="text-gray-700">③ ' + inspection.action_item_3 + '</p>';
                    actionItemsHtml += '</div>';
                }
                
                let notesHtml = '';
                if (inspection.notes) {
                    notesHtml = '<p class="text-gray-600">📝 ' + inspection.notes + '</p>';
                }
                
                return \`
                    <div class="bg-white rounded-2xl shadow-lg p-6">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-gray-800">📅 \${inspection.inspection_date}</h3>
                                <p class="text-gray-600">👤 点検者: \${inspection.inspector_name}</p>
                            </div>
                            <div class="flex space-x-2">
                                <button onclick="editInspection('\${inspection.id}')" class="text-blue-600 hover:text-blue-800 text-2xl">✏️</button>
                                <button onclick="deleteInspection('\${inspection.id}')" class="text-red-600 hover:text-red-800 text-2xl">🗑️</button>
                            </div>
                        </div>
                        
                        \${actionItemsHtml}
                        \${notesHtml}
                    </div>
                \`;
            }).join('');
        }

        function showAddInspectionModal() {
            document.getElementById('inspectionId').value = '';
            document.getElementById('inspectionDate').value = new Date().toISOString().split('T')[0];
            document.getElementById('inspectorName').value = '';
            document.getElementById('actionItem1').value = '';
            document.getElementById('actionItem2').value = '';
            document.getElementById('actionItem3').value = '';
            document.getElementById('inspectionNotes').value = '';
            document.getElementById('inspectionModalTitle').textContent = '💧 点検を記録';
            document.getElementById('inspectionModal').classList.remove('hidden');
        }

        function hideInspectionModal() {
            document.getElementById('inspectionModal').classList.add('hidden');
        }

        async function saveInspection() {
            const inspectionId = document.getElementById('inspectionId').value;
            const inspectionDate = document.getElementById('inspectionDate').value;
            const inspectorId = document.getElementById('inspectorId').value;
            const waterLevel = document.getElementById('waterLevel').value;
            const waterQuality = document.getElementById('waterQuality').value;
            const lidCondition = document.getElementById('lidCondition').value;

            if (!inspectionDate || !inspectorId || !waterLevel || !waterQuality || !lidCondition) {
                alert('必須項目を全て入力してください');
                return;
            }

            const data = {
                tank_id: tankId,
                inspector_id: inspectorId,
                inspection_date: inspectionDate,
                water_level: waterLevel,
                water_quality: waterQuality,
                lid_condition: lidCondition,
                comment: document.getElementById('inspectionComment').value || null,
                images: []
            };

            // 画像があれば追加
            const imageInput = document.getElementById('inspectionImage');
            if (imageInput.files.length > 0) {
                const file = imageInput.files[0];
                const reader = new FileReader();
                
                reader.onload = async function(event) {
                    data.images.push(event.target.result);
                    await submitInspectionData(data, inspectionId);
                };
                reader.readAsDataURL(file);
            } else {
                await submitInspectionData(data, inspectionId);
            }
        }
        
        async function submitInspectionData(data, inspectionId) {
            try {
                const url = inspectionId ? \`/api/water-tank-inspections/\${inspectionId}\` : '/api/water-tank-inspections';
                const method = inspectionId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (response.ok) {
                    hideInspectionModal();
                    loadInspections();
                } else {
                    alert('保存に失敗しました');
                }
            } catch (error) {
                console.error('Save error:', error);
                alert('保存中にエラーが発生しました');
            }
        }



        function editTank() {
            location.href = '/water-tanks?edit=' + tankId;
        }

        async function deleteTank() {
            if (!tank) return;

            if (!confirm('「' + tank.location + '」を本当に削除しますか？\\\\n\\\\nこの操作は取り消せません。\\\\nこの防火水槽に関連する全ての点検記録も削除されます。')) {
                return;
            }

            try {
                const response = await fetch('/api/water-tanks/' + tankId, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    alert('削除しました');
                    location.href = '/water-tanks';
                } else {
                    alert('削除に失敗しました');
                }
            } catch (error) {
                console.error('Delete error:', error);
                alert('削除中にエラーが発生しました');
            }
        }
    </script>
</body>
</html>
  `)
})

// ==========================================
// ホースホース詳細・点検ページ（完全書き直し版）
// ==========================================
app.get('/storage/:id', async (c) => {
  const id = c.req.param('id')
  
  return c.html(`
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ホース詳細 - 活動記録</title>
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossorigin=""/>
    
    <!-- Leaflet JavaScript -->
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        crossorigin=""></script>
    
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
        .tab-btn {
            -webkit-tap-highlight-color: rgba(59, 130, 246, 0.3);
            touch-action: manipulation;
            user-select: none;
            -webkit-user-select: none;
            cursor: pointer;
            pointer-events: auto;
            position: relative;
            z-index: 10;
        }
        .tab-btn:active {
            background-color: rgba(0, 0, 0, 0.05);
            transform: scale(0.98);
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
                <div class="flex gap-2">
                    <a href="/hose" class="text-green-600 hover:text-green-800 hover:underline text-sm bg-green-50 px-4 py-2 rounded-lg font-bold">
                        🔧 ホース管理
                    </a>
                    <a href="/inspection-priority" class="text-blue-600 hover:text-blue-800 hover:underline text-sm bg-blue-50 px-4 py-2 rounded-lg font-bold">
                        ← 優先度一覧
                    </a>
                </div>
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
                <button type="button" id="tabRecord" class="tab-btn flex-1 py-4 px-6 font-bold text-lg transition border-b-4 border-red-500 text-red-500">
                    📝 点検記録
                </button>
                <button type="button" id="tabMap" class="tab-btn flex-1 py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    🗺️ 地図
                </button>
                <button type="button" id="tabHistory" class="tab-btn flex-1 py-4 px-6 font-bold text-lg transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    📋 全履歴
                </button>
            </div>

            <!-- 点検記録タブ -->
            <div id="recordTab" class="p-6">
                <div class="text-center py-12">
                    <div class="text-6xl mb-4">📝</div>
                    <h3 class="text-2xl font-bold text-gray-800 mb-4">点検を記録する</h3>
                    <p class="text-gray-600 mb-6">このホースの点検記録を登録できます</p>
                    <button onclick="document.getElementById('inspectionModal').classList.remove('modal-closed'); document.getElementById('inspectionModal').classList.add('modal-open');" 
                            class="bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl transition font-bold text-lg shadow-lg">
                        📝 点検を記録する
                    </button>
                </div>
            </div>

            <!-- 地図タブ -->
            <div id="mapTab" class="p-6 hidden">
                <div id="mapContainer" class="mb-6">
                    <p class="text-gray-600 text-center py-8">地図を読み込んでいます...</p>
                </div>
                
                <!-- 点検を記録するボタン（地図の下） -->
                <button id="showModalBtn" class="w-full bg-red-500 hover:bg-red-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg shadow-lg">
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
    <div id="inspectionModal" class="modal-closed fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center p-4 z-[9999] overflow-y-auto">
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

                <!-- 消火栓点検のみ -->
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                    <label class="flex items-center space-x-2 cursor-pointer">
                        <input type="checkbox" id="hydrantOnlyCheckbox" class="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500">
                        <span class="text-sm font-bold text-gray-700">🚰 消火栓点検のみ（ホース点検なし）</span>
                    </label>
                </div>

                <!-- ホース交換数・破損数 -->
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">🔄 ホース交換数</label>
                        <select id="hoseReplacedCount" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="0">0本</option>
                            <option value="1">1本</option>
                            <option value="2">2本</option>
                            <option value="3">3本</option>
                            <option value="4">4本</option>
                        </select>
                    </div>
                    <div>
                        <label class="block text-sm font-bold text-gray-700 mb-2">⚠️ ホース破損数</label>
                        <select id="hoseDamagedCount" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                            <option value="0">0本</option>
                            <option value="1">1本</option>
                            <option value="2">2本</option>
                            <option value="3">3本</option>
                            <option value="4">4本</option>
                        </select>
                    </div>
                </div>

                <!-- ホース製造年月日（4本分） -->
                <div class="bg-blue-50 p-4 rounded-lg">
                    <h3 class="font-bold text-lg mb-3">📦 ホース製造年月日（4本分）</h3>
                    <p class="text-sm text-gray-600 mb-3">
                        ⚠️ 製造から10年経過後、3年ごとに耐圧点検が義務化されています
                    </p>
                    
                    <div class="grid grid-cols-2 gap-3">
                        <div>
                            <label class="block text-sm font-bold mb-1">ホース1 製造年月</label>
                            <input type="month" id="hose1ManufactureDate" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">ホース2 製造年月</label>
                            <input type="month" id="hose2ManufactureDate" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">ホース3 製造年月</label>
                            <input type="month" id="hose3ManufactureDate" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm font-bold mb-1">ホース4 製造年月</label>
                            <input type="month" id="hose4ManufactureDate" class="w-full px-3 py-2 border rounded-lg">
                        </div>
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2">📝 備考</label>
                    <textarea id="remarks" rows="3" placeholder="例：ホース状態良好、ホース周辺の清掃実施。消火栓のみ点検した場合はここに記載" class="w-full px-4 py-3 border border-gray-300 rounded-lg"></textarea>
                </div>

                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-3">🚨 要対応事項（あれば）</label>
                    <div class="space-y-4">
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <label class="block text-sm font-bold text-gray-700 mb-2">要対応事項 1</label>
                            <textarea id="actionRequired1" rows="3" placeholder="例：ホース扉の破損" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"></textarea>
                            <label class="block text-xs text-gray-600 mb-1">📷 写真（任意）</label>
                            <input type="file" id="actionImage1" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        </div>
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <label class="block text-sm font-bold text-gray-700 mb-2">要対応事項 2</label>
                            <textarea id="actionRequired2" rows="3" placeholder="例：開栓棒紛失" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"></textarea>
                            <label class="block text-xs text-gray-600 mb-1">📷 写真（任意）</label>
                            <input type="file" id="actionImage2" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                        </div>
                        <div class="border border-gray-200 rounded-lg p-4 bg-gray-50">
                            <label class="block text-sm font-bold text-gray-700 mb-2">要対応事項 3</label>
                            <textarea id="actionRequired3" rows="3" placeholder="例：周辺草刈り必要" class="w-full px-4 py-3 border border-gray-300 rounded-lg mb-2"></textarea>
                            <label class="block text-xs text-gray-600 mb-1">📷 写真（任意）</label>
                            <input type="file" id="actionImage3" accept="image/*" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
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
            console.log('switchTab called:', tabName);
            const tabRecord = document.getElementById('tabRecord');
            const tabMap = document.getElementById('tabMap');
            const tabHistory = document.getElementById('tabHistory');
            const recordTab = document.getElementById('recordTab');
            const mapTab = document.getElementById('mapTab');
            const historyTab = document.getElementById('historyTab');

            if (!tabRecord || !tabMap || !tabHistory || !recordTab || !mapTab || !historyTab) {
                console.error('Tab elements not found!');
                return;
            }

            // 全タブのスタイルをリセット
            [tabRecord, tabMap, tabHistory].forEach(tab => {
                tab.classList.remove('border-red-500', 'text-red-500');
                tab.classList.add('border-transparent', 'text-gray-500');
            });
            
            // 全コンテンツを非表示
            [recordTab, mapTab, historyTab].forEach(content => {
                content.classList.add('hidden');
            });

            // 選択されたタブをアクティブに
            if (tabName === 'record') {
                tabRecord.classList.add('border-red-500', 'text-red-500');
                tabRecord.classList.remove('border-transparent', 'text-gray-500');
                recordTab.classList.remove('hidden');
            } else if (tabName === 'map') {
                tabMap.classList.add('border-red-500', 'text-red-500');
                tabMap.classList.remove('border-transparent', 'text-gray-500');
                mapTab.classList.remove('hidden');
                loadMap();
            } else if (tabName === 'history') {
                tabHistory.classList.add('border-red-500', 'text-red-500');
                tabHistory.classList.remove('border-transparent', 'text-gray-500');
                historyTab.classList.remove('hidden');
            }
            console.log('switchTab completed:', tabName);
        }

        // 地図読み込み
        async function loadMap() {
            const mapContainer = document.getElementById('mapContainer');
            
            let lat = storageData ? storageData.latitude : null;
            let lon = storageData ? storageData.longitude : null;
            
            // Google Maps URLから座標を抽出
            if (!lat && !lon && storageData && storageData.google_maps_url) {
                let url = storageData.google_maps_url;
                
                // 短縮URLの場合はリダイレクト先を取得
                if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
                    try {
                        const response = await fetch(url, { method: 'HEAD', redirect: 'follow' });
                        url = response.url;
                    } catch (e) {
                        console.log('短縮URL展開失敗:', e);
                    }
                }
                
                // パターン1: @緯度,経度 形式
                const atMatch = url.match(/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
                if (atMatch) {
                    lat = parseFloat(atMatch[1]);
                    lon = parseFloat(atMatch[2]);
                }
                
                // パターン2: ?q=緯度,経度 形式
                if (!lat && !lon) {
                    const qMatch = url.match(/[?&]q=(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
                    if (qMatch) {
                        lat = parseFloat(qMatch[1]);
                        lon = parseFloat(qMatch[2]);
                    }
                }
            }
            
            if (!lat || !lon) {
                mapContainer.innerHTML = '<p class="text-gray-600 text-center py-8">位置情報が登録されていません。ホース編集でGoogle Maps URLを追加してください。</p>';
                return;
            }

            mapContainer.innerHTML = '<div id="storageLeafletMap" style="height: 500px; border-radius: 12px;"></div>';
            
            setTimeout(() => {
                const map = L.map('storageLeafletMap').setView([lat, lon], 16);
                L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png', {
                    attribution: '&copy; OpenStreetMap contributors'
                }).addTo(map);
                
                const marker = L.marker([lat, lon]).addTo(map);
                marker.bindPopup('<b>' + (storageData ? storageData.storage_number : 'ホース') + '</b><br>' + (storageData ? storageData.location : '')).openPopup();
            }, 100);
        }

        // ページ読み込み完了後に初期化
        document.addEventListener('DOMContentLoaded', function() {
            console.log('[INIT] START');
            try {
            
            // DOM要素の取得（ここでDOM準備完了してるから確実に取れる）
            modal = document.getElementById('inspectionModal');
            showModalBtn = document.getElementById('showModalBtn');
            closeModalBtn = document.getElementById('closeModalBtn');
            cancelBtn = document.getElementById('cancelBtn');
            saveBtn = document.getElementById('saveBtn');
            imageInput = document.getElementById('inspectionImage');
            clearImagesBtn = document.getElementById('clearImagesBtn');
            
            
            // タブ切り替えイベント（スマホ対応）
            const tabRecord = document.getElementById('tabRecord');
            const tabMap = document.getElementById('tabMap');
            const tabHistory = document.getElementById('tabHistory');
            
            console.log('[TABS]', tabRecord?'R':'', tabMap?'M':'', tabHistory?'H':'');
            
            if (tabRecord) tabRecord.onclick = function() { 
                console.log('[TAB] record');
                switchTab('record'); 
            };
            
            if (tabMap) tabMap.onclick = function() { 
                console.log('[TAB] map');
                switchTab('map'); 
            };
            
            if (tabHistory) tabHistory.onclick = function() { 
                console.log('[TAB] history');
                switchTab('history'); 
            };

            // イベントリスナー設定（要素が確実に存在する状態で設定）
            if (showModalBtn) showModalBtn.addEventListener('click', showModal);
            if (closeModalBtn) closeModalBtn.addEventListener('click', hideModal);
            if (cancelBtn) cancelBtn.addEventListener('click', hideModal);
            if (modal) modal.addEventListener('click', hideModal);
            if (saveBtn) saveBtn.addEventListener('click', saveInspection);
            if (imageInput) imageInput.addEventListener('change', previewInspectionImages);
            if (clearImagesBtn) clearImagesBtn.addEventListener('click', clearInspectionImages);
            
            
            // 初期値設定と読み込み
            const today = new Date().toISOString().split('T')[0];
            const dateInput = document.getElementById('inspectionDate');
            if (dateInput) dateInput.value = today;
            
            console.log('[LOAD] members...');
            loadMembers();
            console.log('[LOAD] storage...');
            loadStorageDetail();
            console.log('[LOAD] history...');
            loadInspectionHistory();
            loadActionHistory();
            
            console.log('[INIT] END');
            } catch(err) {
                console.error('[ERROR]', err);
                alert('初期化エラー: ' + err.message);
            }
            
            // URLパラメータをチェックして、openModal=trueならモーダルを自動オープン
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('openModal') === 'true') {
                // データ読み込み完了を待ってからモーダルを開く
                setTimeout(() => {
                    showModal();
                }, 500);
            }
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

        // ホース詳細読み込み
        async function loadStorageDetail() {
            try {
                const response = await fetch('/api/hose/storages');
                const data = await response.json();
                storageData = data.storages.find(s => s.id === STORAGE_ID);
                
                if (storageData) {
                    document.getElementById('storageDetail').innerHTML = 
                        '<div class="bg-white rounded-2xl shadow-lg p-6">' +
                            '<div class="flex justify-between items-start mb-4">' +
                                '<h1 class="text-3xl font-bold text-gray-800">📦 ' + storageData.storage_number + '</h1>' +
                                '<a href="/hose?edit=' + storageData.id + '" ' +
                                'class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition font-bold">' +
                                    '✏️ 編集' +
                                '</a>' +
                            '</div>' +
                            (storageData.image_url ? 
                                '<div class="mb-4">' +
                                    '<img src="' + storageData.image_url + '" alt="ホース写真" class="w-full h-64 object-cover rounded-lg">' +
                                '</div>' : ''
                            ) +
                            '<p class="text-xl text-gray-700 mb-2">📍 ' + storageData.location + '</p>' +
                            (storageData.district ? '<p class="text-base text-gray-600 mb-2">🏘️ ' + storageData.district + '</p>' : '') +
                            (storageData.remarks ? '<p class="text-base text-gray-600 mb-2">💬 ' + storageData.remarks + '</p>' : '') +
                            (storageData.address ? '<p class="text-base text-gray-600 mb-4">🏠 ' + storageData.address + '</p>' : '') +
                            '<div class="mt-4">' +
                                '<div id="storageMap" class="w-full h-64 rounded-lg border-2 border-gray-200"></div>' +
                                '<a href="' + (storageData.google_maps_url || 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(storageData.location + ' 大井町')) + '" ' +
                                'target="_blank" rel="noopener noreferrer" ' +
                                'class="block w-full bg-blue-500 hover:bg-blue-600 text-white text-center px-4 py-3 rounded-lg transition font-bold text-base mt-2">' +
                                    '🗺️ Google Mapsで開く' +
                                '</a>' +
                            '</div>' +
                        '</div>';
                        
                        // 地図を初期化（Google Maps URLまたは保存された座標から表示）
                        initStorageMap(storageData.location, storageData.google_maps_url, storageData.latitude, storageData.longitude);
                }
            } catch (error) {
                console.error(error);
            }
        }

        // 地図を初期化
        async function initStorageMap(location, mapUrl, savedLat, savedLon) {
            try {
                let lat, lon;
                
                // 優先順位1: 保存された座標を使用（最優先）
                if (savedLat && savedLon) {
                    console.log('Using saved coordinates:', savedLat, savedLon);
                    lat = savedLat;
                    lon = savedLon;
                }
                // 優先順位2: Google Maps URLから座標を抽出
                else if (mapUrl) {
                    // 短縮URL (maps.app.goo.gl) の場合、サーバー側で展開
                    if (mapUrl.includes('maps.app.goo.gl') || mapUrl.includes('goo.gl')) {
                        console.log('Shortened URL detected, expanding via API:', mapUrl);
                        
                        try {
                            const response = await fetch('/api/expand-maps-url', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ url: mapUrl })
                            });
                            
                            const data = await response.json();
                            
                            if (data.success && data.lat && data.lon) {
                                console.log('Successfully expanded URL to coordinates:', data.lat, data.lon);
                                lat = data.lat;
                                lon = data.lon;
                            } else {
                                console.error('Failed to expand URL:', data.error);
                                // フォールバック: エラーメッセージを表示
                                const mapElement = document.getElementById('storageMap');
                                mapElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">' +
                                    '<p class="text-gray-600 text-center px-4">📍 地図の読み込みに失敗しました<br>下のボタンからGoogle Mapsで開いてください</p>' +
                                '</div>';
                                return;
                            }
                        } catch (error) {
                            console.error('API call error:', error);
                            // フォールバック: エラーメッセージを表示
                            const mapElement = document.getElementById('storageMap');
                            mapElement.innerHTML = '<div class="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">' +
                                '<p class="text-gray-600 text-center px-4">📍 地図の読み込みに失敗しました<br>下のボタンからGoogle Mapsで開いてください</p>' +
                            '</div>';
                            return;
                        }
                    } else {
                        // 通常のURLから座標を抽出
                        const coords = extractCoordsFromGoogleMapsUrl(mapUrl);
                        if (coords) {
                            lat = coords.lat;
                            lon = coords.lon;
                        }
                    }
                }
                
                // 優先順位3: どちらもない場合はNominatim APIで住所から取得
                if (!lat || !lon) {
                    const query = encodeURIComponent(location + ' 大井町 神奈川県');
                    const response = await fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + query + '&limit=1');
                    const data = await response.json();
                    
                    if (data.length > 0) {
                        lat = parseFloat(data[0].lat);
                        lon = parseFloat(data[0].lon);
                    }
                }
                
                if (lat && lon) {
                    // Leaflet地図を初期化
                    const map = L.map('storageMap').setView([lat, lon], 17);
                    
                    // OpenStreetMapタイル追加
                    L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(map);
                    
                    // マーカー追加
                    L.marker([lat, lon]).addTo(map)
                        .bindPopup('<b>' + location + '</b>')
                        .openPopup();
                } else {
                    // 座標が取得できない場合はデフォルト位置（大井町役場）
                    const map = L.map('storageMap').setView([35.3580, 139.1047], 15);
                    L.tileLayer('https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png', {
                        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    }).addTo(map);
                }
            } catch (error) {
                console.error('Map initialization error:', error);
            }
        }
        
        // Google Maps URLから座標を抽出
        function extractCoordsFromGoogleMapsUrl(url) {
            if (!url) return null;
            
            // パターン1: @35.123,139.456,17z 形式
            let match = url.match(/@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
            }
            
            // パターン2: ?q=35.123,139.456 形式
            match = url.match(/[?&]q=(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
            }
            
            // パターン3: /place/.../@35.123,139.456 形式
            match = url.match(/\\/place\\/[^@]*@(-?\\d+\\.\\d+),(-?\\d+\\.\\d+)/);
            if (match) {
                return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };
            }
            
            return null;
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

        // 要対応事項の画像をアップロード
        async function uploadActionItemImage(file, index) {
            if (!file) return null;
            
            const formData = new FormData();
            formData.append('image', file);

            try {
                const response = await fetch('/api/upload-image', {
                    method: 'POST',
                    body: formData
                });

                if (response.ok) {
                    const result = await response.json();
                    return result.imageUrl;
                }
            } catch (error) {
                console.error('Action item image upload error:', error);
            }
            
            return null;
        }

        // 点検記録保存（新規作成と編集の両方に対応）
        async function saveInspection() {
            const inspectorName = document.getElementById('inspectorName').value;
            const date = document.getElementById('inspectionDate').value;
            const hoseReplacedCount = parseInt(document.getElementById('hoseReplacedCount').value);
            const hoseDamagedCount = parseInt(document.getElementById('hoseDamagedCount').value);
            const actionRequired1 = document.getElementById('actionRequired1').value;
            const actionRequired2 = document.getElementById('actionRequired2').value;
            const actionRequired3 = document.getElementById('actionRequired3').value;
            
            // 消火栓点検のみチェック
            const hydrantOnly = document.getElementById('hydrantOnlyCheckbox').checked;
            let remarks = document.getElementById('remarks').value;
            if (hydrantOnly) {
                remarks = '【消火栓点検のみ】' + (remarks ? ' ' + remarks : '');
            }
            
            // ホース製造年月日
            const hose1MfgDate = document.getElementById('hose1ManufactureDate').value;
            const hose2MfgDate = document.getElementById('hose2ManufactureDate').value;
            const hose3MfgDate = document.getElementById('hose3ManufactureDate').value;
            const hose4MfgDate = document.getElementById('hose4ManufactureDate').value;
            
            if (!inspectorName || !date) {
                alert('入力者と点検日は必須です');
                return;
            }

            // 画像アップロード処理（点検記録の写真）
            const imageUrls = await uploadInspectionImages();
            
            // 要対応事項とそれぞれの写真をアップロード
            const actionItemsWithPhotos = [];
            for (let i = 1; i <= 3; i++) {
                const textarea = document.getElementById('actionRequired' + i);
                const fileInput = document.getElementById('actionImage' + i);
                const text = textarea.value.trim();
                
                if (text) {
                    let photoUrl = null;
                    if (fileInput.files && fileInput.files[0]) {
                        photoUrl = await uploadActionItemImage(fileInput.files[0], i);
                    }
                    actionItemsWithPhotos.push({
                        description: text,
                        photo_url: photoUrl
                    });
                }
            }

            const data = {
                storage_id: STORAGE_ID,
                storage_number: storageData.storage_number,
                inspection_date: date,
                hose_replaced_count: hoseReplacedCount,
                hose_damaged_count: hoseDamagedCount,
                action_items: actionItemsWithPhotos,
                remarks: remarks || null,
                inspector_name: inspectorName,
                photos: imageUrls.length > 0 ? JSON.stringify(imageUrls) : null,
                hose_1_manufacture_date: hose1MfgDate || null,
                hose_2_manufacture_date: hose2MfgDate || null,
                hose_3_manufacture_date: hose3MfgDate || null,
                hose_4_manufacture_date: hose4MfgDate || null
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
                    document.getElementById('hoseReplacedCount').value = '0';
                    document.getElementById('hoseDamagedCount').value = '0';
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
                document.getElementById('hoseReplacedCount').value = insp.hose_replaced_count || '0';
                document.getElementById('hoseDamagedCount').value = insp.hose_damaged_count || '0';
                
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
    
    // storage_numberをホーステーブルから取得
    const storageResult = await env.DB.prepare(`
      SELECT storage_number FROM hose_storages WHERE id = ?
    `).bind(data.storage_id).first()
    const storageNumber = storageResult?.storage_number || null
    
    // 製造年月日から最古の日付と次回義務点検日を計算
    const manufactureDates = [
      data.hose_1_manufacture_date,
      data.hose_2_manufacture_date,
      data.hose_3_manufacture_date,
      data.hose_4_manufacture_date
    ].filter(d => d)
    
    let oldestDate = null
    let nextMandatoryDate = null
    
    if (manufactureDates.length > 0) {
      oldestDate = manufactureDates.sort()[0]
      // 製造年月日はYYYY-MM-DD形式なのでそのまま使う
      const mfgDate = new Date(oldestDate)
      const tenYearsLater = new Date(mfgDate)
      tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10)
      nextMandatoryDate = tenYearsLater.toISOString().split('T')[0]
    }
    
    // remarksに「消火栓点検のみ」が含まれているかチェック
    const hydrantOnly = data.remarks && data.remarks.includes('【消火栓点検のみ】') ? 1 : 0
    
    await env.DB.prepare(`
      INSERT INTO hose_inspections (
        id, storage_id, storage_number, inspection_date,
        hose_replaced_count, hose_damaged_count,
        action_required, remarks, photos,
        inspector_id, inspector_name,
        hose_1_manufacture_date, hose_2_manufacture_date,
        hose_3_manufacture_date, hose_4_manufacture_date,
        hydrant_only,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      id,
      data.storage_id,
      storageNumber,
      data.inspection_date,
      data.hose_replaced_count || 0,
      data.hose_damaged_count || 0,
      data.action_required || null,
      data.remarks || null,
      data.photos || null,
      'user_001',
      data.inspector_name,
      data.hose_1_manufacture_date || null,
      data.hose_2_manufacture_date || null,
      data.hose_3_manufacture_date || null,
      data.hose_4_manufacture_date || null,
      hydrantOnly,
      now,
      now
    ).run()
    
    // hose_storagesテーブルを更新（最古製造年月日と次回義務点検日）
    if (oldestDate && nextMandatoryDate) {
      await env.DB.prepare(`
        UPDATE hose_storages 
        SET oldest_hose_manufacture_date = ?,
            next_mandatory_inspection_date = ?
        WHERE id = ?
      `).bind(oldestDate, nextMandatoryDate, data.storage_id).run()
    }
    
    // 要対応事項を個別に保存（action_itemsテーブル）
    // action_item_1/2/3フィールドからも自動的に保存
    const actionItemsToSave = []
    if (data.action_item_1 && data.action_item_1.trim() !== '') {
      actionItemsToSave.push({ content: data.action_item_1.trim(), order: 1 })
    }
    if (data.action_item_2 && data.action_item_2.trim() !== '') {
      actionItemsToSave.push({ content: data.action_item_2.trim(), order: 2 })
    }
    if (data.action_item_3 && data.action_item_3.trim() !== '') {
      actionItemsToSave.push({ content: data.action_item_3.trim(), order: 3 })
    }
    
    // action_items配列形式でも受け取る（互換性維持）
    if (data.action_items && Array.isArray(data.action_items)) {
      for (let i = 0; i < data.action_items.length; i++) {
        const item = data.action_items[i]
        const description = typeof item === 'string' ? item : item.description
        const photoUrl = typeof item === 'object' && item.photo_url ? item.photo_url : null
        
        if (description && description.trim() !== '') {
          actionItemsToSave.push({ 
            content: description.trim(), 
            photo_url: photoUrl,
            order: i + 1 
          })
        }
      }
    }
    
    // action_itemsテーブルに保存
    for (const item of actionItemsToSave) {
      await env.DB.prepare(`
        INSERT INTO action_items (
          inspection_id, content, photo_url, item_order, created_at
        ) VALUES (?, ?, ?, ?, ?)
      `).bind(id, item.content, item.photo_url || null, item.order, now).run()
    }
    
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
    
    // 製造年月日から最古の日付と次回義務点検日を計算
    const manufactureDates = [
      data.hose_1_manufacture_date,
      data.hose_2_manufacture_date,
      data.hose_3_manufacture_date,
      data.hose_4_manufacture_date
    ].filter(d => d)
    
    let oldestDate = null
    let nextMandatoryDate = null
    
    if (manufactureDates.length > 0) {
      oldestDate = manufactureDates.sort()[0]
      // 製造年月日はYYYY-MM-DD形式なのでそのまま使う
      const mfgDate = new Date(oldestDate)
      const tenYearsLater = new Date(mfgDate)
      tenYearsLater.setFullYear(tenYearsLater.getFullYear() + 10)
      nextMandatoryDate = tenYearsLater.toISOString().split('T')[0]
    }
    
    await env.DB.prepare(`
      UPDATE hose_inspections 
      SET inspection_date = ?,
          hose_replaced_count = ?,
          hose_damaged_count = ?,
          action_required = ?,
          remarks = ?,
          photos = ?,
          inspector_name = ?,
          hose_1_manufacture_date = ?,
          hose_2_manufacture_date = ?,
          hose_3_manufacture_date = ?,
          hose_4_manufacture_date = ?,
          updated_at = ?
      WHERE id = ?
    `).bind(
      data.inspection_date,
      data.hose_replaced_count || 0,
      data.hose_damaged_count || 0,
      data.action_required || null,
      data.remarks || null,
      data.photos || null,
      data.inspector_name,
      data.hose_1_manufacture_date || null,
      data.hose_2_manufacture_date || null,
      data.hose_3_manufacture_date || null,
      data.hose_4_manufacture_date || null,
      now,
      id
    ).run()
    
    // hose_storagesテーブルを更新
    if (oldestDate && nextMandatoryDate && data.storage_id) {
      await env.DB.prepare(`
        UPDATE hose_storages 
        SET oldest_hose_manufacture_date = ?,
            next_mandatory_inspection_date = ?
        WHERE id = ?
      `).bind(oldestDate, nextMandatoryDate, data.storage_id).run()
    }
    
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

        <!-- タブ切り替え -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tabPending" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-red-500 text-red-500 whitespace-nowrap">
                    ⚠️ 未対応
                </button>
                <button id="tabInProgress" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    🔧 対応中
                </button>
                <button id="tabCompleted" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700 whitespace-nowrap">
                    ✅ 対応済
                </button>
            </div>
        </div>

        <div id="actionList" class="space-y-4">
            <div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800">読み込み中...</p></div>
        </div>
    </div>

    <!-- 対応完了モーダル -->
    <!-- 対応中にするモーダル -->
    <div id="inProgressModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">🔧 対応中にする</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📝 対応内容・メモ <span class="text-red-500">*</span>
                    </label>
                    <textarea id="inProgressContent" rows="4" required
                        placeholder="対応中の内容やメモを記入してください"
                        class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"></textarea>
                </div>
                
                <div class="flex flex-col space-y-3">
                    <button onclick="submitInProgress()" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                        🔧 対応中にする
                    </button>
                    <button onclick="hideInProgressModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-4 rounded-xl transition font-bold text-lg">
                        キャンセル
                    </button>
                </div>
            </div>
        </div>
    </div>

    <!-- 対応完了モーダル -->
    <div id="completeModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6">
                <h2 class="text-2xl font-bold text-gray-800 mb-6">✅ 対応完了</h2>
                
                <div class="mb-6">
                    <label class="block text-sm font-bold text-gray-700 mb-2">
                        📝 対応内容 <span class="text-red-500">*</span>
                    </label>
                    <textarea id="completeContent" rows="4" required
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
    <div id="editModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
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
        let allItems = [];
        let currentTab = 'pending'; // 'pending', 'in_progress', or 'completed'

        window.onload = function() {
            loadActionRequired();
            
            // タブ切り替えイベント
            document.getElementById('tabPending').addEventListener('click', () => switchTab('pending'));
            document.getElementById('tabInProgress').addEventListener('click', () => switchTab('in_progress'));
            document.getElementById('tabCompleted').addEventListener('click', () => switchTab('completed'));
        };

        function switchTab(tab) {
            currentTab = tab;
            const tabPending = document.getElementById('tabPending');
            const tabInProgress = document.getElementById('tabInProgress');
            const tabCompleted = document.getElementById('tabCompleted');
            
            // すべてのタブをリセット
            [tabPending, tabInProgress, tabCompleted].forEach(t => {
                t.classList.remove('border-red-500', 'text-red-500', 'border-yellow-500', 'text-yellow-600', 'border-green-500', 'text-green-500');
                t.classList.add('border-transparent', 'text-gray-500');
            });
            
            // 選択されたタブをアクティブに
            if (tab === 'pending') {
                tabPending.classList.remove('border-transparent', 'text-gray-500');
                tabPending.classList.add('border-red-500', 'text-red-500');
            } else if (tab === 'in_progress') {
                tabInProgress.classList.remove('border-transparent', 'text-gray-500');
                tabInProgress.classList.add('border-yellow-500', 'text-yellow-600');
            } else {
                tabCompleted.classList.remove('border-transparent', 'text-gray-500');
                tabCompleted.classList.add('border-green-500', 'text-green-500');
            }
            
            renderActionList(allItems);
        }

        async function loadActionRequired() {
            try {
                const response = await fetch('/api/inspection/action-required');
                const data = await response.json();
                allItems = data.items || [];
                renderActionList(allItems);
            } catch (error) {
                document.getElementById('actionList').innerHTML = 
                    '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800">データの読み込みに失敗しました</p></div>';
                console.error(error);
            }
        }

        function renderActionList(items) {
            const list = document.getElementById('actionList');
            
            // タブに応じてフィルタリング
            const filteredItems = items.filter(item => {
                if (currentTab === 'pending') {
                    return item.is_completed === 0 && !item.action_content;
                } else if (currentTab === 'in_progress') {
                    return item.is_completed === 0 && item.action_content;
                } else {
                    return item.is_completed === 1;
                }
            });
            
            if (filteredItems.length === 0) {
                let message = '';
                if (currentTab === 'pending') message = '未対応の項目はありません';
                else if (currentTab === 'in_progress') message = '対応中の項目はありません';
                else message = '対応済みの項目はありません';
                
                list.innerHTML = '<div class="bg-white rounded-2xl shadow-lg p-12 text-center"><p class="text-gray-800 text-xl">' + message + '</p></div>';
                return;
            }

            // 各action_itemごとに個別のカードを表示
            list.innerHTML = filteredItems.map(item => {
                const date = new Date(item.inspection_date).toLocaleDateString('ja-JP');
                const isCompleted = item.is_completed === 1;
                const district = item.district || '';
                
                return '<div class="bg-white rounded-2xl shadow-lg p-6">' +
                    '<div class="flex justify-between items-start mb-4">' +
                        '<div class="flex-1">' +
                            '<div class="text-sm text-gray-600 mb-1">' + district + '</div>' +
                            '<h3 class="text-xl font-bold text-gray-800 mb-2">' + item.storage_number + ' - ' + item.location + '</h3>' +
                            '<p class="text-sm text-gray-600 mb-2">📅 点検日: ' + date + '</p>' +
                        '</div>' +
                        (isCompleted ? 
                            '<span class="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ml-2">✅ 対応済み</span>' :
                            '<span class="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap ml-2">⚠️ 未対応</span>'
                        ) +
                    '</div>' +
                    '<div class="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-4">' +
                        '<p class="text-red-800 font-semibold mb-2">🚨 要対応内容:</p>' +
                        '<p class="text-gray-800 mb-3">' + item.content + '</p>' +
                        (item.photo_url ? 
                            '<img src="' + item.photo_url + '" alt="要対応事項の写真" class="w-full rounded-lg border-2 border-gray-200">' : ''
                        ) +
                    '</div>' +
                    (function() {
                        if (currentTab === 'pending') {
                            return '<button onclick="markInProgress(\\'' + item.id + '\\')" class="w-full bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl transition font-bold text-base">' +
                                '🔧 対応中にする' +
                            '</button>';
                        } else if (currentTab === 'in_progress') {
                            let html = '';
                            if (item.action_content) {
                                html += '<div class="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg p-4 mb-4">' +
                                    '<p class="text-yellow-800 font-semibold mb-2">🔧 対応内容:</p>' +
                                    '<p class="text-gray-800">' + item.action_content + '</p>' +
                                '</div>';
                            }
                            html += '<div class="flex gap-3 mb-3">' +
                                '<button onclick="markCompleted(\\'' + item.id + '\\')" class="flex-1 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-xl transition font-bold text-base">' +
                                    '✅ 対応完了にする' +
                                '</button>' +
                                '<button onclick="editInProgress(\\'' + item.id + '\\')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition font-bold text-base">' +
                                    '✏️ 編集' +
                                '</button>' +
                            '</div>' +
                            '<button onclick="markPending(\\'' + item.id + '\\')" class="w-full bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-xl transition font-bold text-sm">' +
                                '⬅️ 未対応に戻す' +
                            '</button>';
                            return html;
                        } else {
                            let html = '';
                            if (item.action_content) {
                                html += '<div class="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 mb-4">' +
                                    '<p class="text-green-800 font-semibold mb-2">✅ 対応内容:</p>' +
                                    '<p class="text-gray-800">' + item.action_content + '</p>' +
                                '</div>';
                            }
                            html += '<p class="text-gray-600 text-center mb-4">対応完了日: ' + new Date(item.completed_at).toLocaleDateString('ja-JP') + '</p>' +
                            '<div class="flex gap-3">' +
                                '<button onclick="editCompleted(\\'' + item.id + '\\')" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl transition font-bold text-base">' +
                                    '✏️ 編集' +
                                '</button>' +
                                '<button onclick="markInProgress(\\'' + item.id + '\\')" class="flex-1 bg-gray-400 hover:bg-gray-500 text-white px-6 py-3 rounded-xl transition font-bold text-base">' +
                                    '⬅️ 対応中に戻す' +
                                '</button>' +
                            '</div>';
                            return html;
                        }
                    })() +
                '</div>';
            }).join('');
        }

        let currentActionItemId = null;

        function markCompleted(actionItemId) {
            currentActionItemId = actionItemId;
            const item = allItems.find(i => i.id === actionItemId);
            document.getElementById('completeContent').value = item && item.action_content ? item.action_content : '';
            document.getElementById('completeModal').classList.remove('hidden');
        }

        function hideCompleteModal() {
            document.getElementById('completeModal').classList.add('hidden');
            currentActionItemId = null;
        }

        async function submitComplete() {
            const actionContent = document.getElementById('completeContent').value.trim();
            
            if (!actionContent) {
                alert('対応内容を入力してください');
                return;
            }

            try {
                // 新しいaction_items APIを使用
                const response = await fetch('/api/action-items/' + currentActionItemId + '/complete', {
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
        
        function markInProgress(actionItemId) {
            currentActionItemId = actionItemId;
            const item = allItems.find(i => i.id === actionItemId);
            document.getElementById('inProgressContent').value = item && item.action_content ? item.action_content : '';
            document.getElementById('inProgressModal').classList.remove('hidden');
        }
        
        function hideInProgressModal() {
            document.getElementById('inProgressModal').classList.add('hidden');
            currentActionItemId = null;
        }
        
        async function submitInProgress() {
            const actionContent = document.getElementById('inProgressContent').value.trim();
            
            if (!actionContent) {
                alert('対応内容を入力してください');
                return;
            }

            try {
                const response = await fetch('/api/action-items/' + currentActionItemId + '/in-progress', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action_content: actionContent })
                });

                if (response.ok) {
                    alert('対応中にしました！');
                    hideInProgressModal();
                    loadActionRequired();
                } else {
                    alert('更新に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }
        
        async function markPending(actionItemId) {
            if (!confirm('未対応に戻しますか？')) return;
            
            try {
                const response = await fetch('/api/action-items/' + actionItemId + '/pending', {
                    method: 'PUT'
                });

                if (response.ok) {
                    alert('未対応に戻しました');
                    loadActionRequired();
                } else {
                    alert('更新に失敗しました');
                }
            } catch (error) {
                alert('エラーが発生しました');
                console.error(error);
            }
        }
        
        function editInProgress(actionItemId) {
            currentActionItemId = actionItemId;
            const item = allItems.find(i => i.id === actionItemId);
            document.getElementById('inProgressContent').value = item && item.action_content ? item.action_content : '';
            document.getElementById('inProgressModal').classList.remove('hidden');
        }
        
        function editCompleted(actionItemId) {
            currentActionItemId = actionItemId;
            const item = allItems.find(i => i.id === actionItemId);
            document.getElementById('completeContent').value = item && item.action_content ? item.action_content : '';
            document.getElementById('completeModal').classList.remove('hidden');
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
// API: 要対応事項一覧取得（新形式: action_itemsベース）
// ==========================================
app.get('/api/inspection/action-required', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    // ホース点検の要対応事項
    const hoseResult = await env.DB.prepare(`
      SELECT 
        a.*,
        i.storage_id,
        i.storage_number,
        i.inspection_date,
        s.location,
        s.district,
        'hose' as item_type
      FROM action_items a
      JOIN hose_inspections i ON a.inspection_id = i.id
      JOIN hose_storages s ON i.storage_id = s.id
      ORDER BY 
        a.is_completed ASC,
        i.inspection_date DESC,
        a.item_order ASC
    `).all()
    
    // 防火水槽点検の要対応事項を展開
    const tankInspections = await env.DB.prepare(`
      SELECT 
        wti.*,
        wt.location as tank_location,
        wt.storage_id,
        s.location as storage_name
      FROM water_tank_inspections wti
      JOIN water_tanks wt ON wti.tank_id = wt.id
      LEFT JOIN hose_storages s ON wt.storage_id = s.id
      WHERE wti.action_item_1 IS NOT NULL 
         OR wti.action_item_2 IS NOT NULL 
         OR wti.action_item_3 IS NOT NULL
      ORDER BY wti.inspection_date DESC
    `).all()
    
    // 防火水槽の要対応事項を個別項目に展開
    const tankItems: any[] = []
    tankInspections.results?.forEach((inspection: any) => {
      if (inspection.action_item_1) {
        tankItems.push({
          id: `tank_${inspection.id}_1`,
          inspection_id: inspection.id,
          content: inspection.action_item_1,
          item_order: 1,
          is_completed: inspection.action_item_1_completed || 0,
          completed_at: inspection.action_item_1_completed_at,
          action_content: inspection.action_item_1_action_content,
          inspection_date: inspection.inspection_date,
          storage_number: '防火水槽',
          location: inspection.tank_location,
          district: inspection.storage_name || '',
          item_type: 'water_tank'
        })
      }
      if (inspection.action_item_2) {
        tankItems.push({
          id: `tank_${inspection.id}_2`,
          inspection_id: inspection.id,
          content: inspection.action_item_2,
          item_order: 2,
          is_completed: inspection.action_item_2_completed || 0,
          completed_at: inspection.action_item_2_completed_at,
          action_content: inspection.action_item_2_action_content,
          inspection_date: inspection.inspection_date,
          storage_number: '防火水槽',
          location: inspection.tank_location,
          district: inspection.storage_name || '',
          item_type: 'water_tank'
        })
      }
      if (inspection.action_item_3) {
        tankItems.push({
          id: `tank_${inspection.id}_3`,
          inspection_id: inspection.id,
          content: inspection.action_item_3,
          item_order: 3,
          is_completed: inspection.action_item_3_completed || 0,
          completed_at: inspection.action_item_3_completed_at,
          action_content: inspection.action_item_3_action_content,
          inspection_date: inspection.inspection_date,
          storage_number: '防火水槽',
          location: inspection.tank_location,
          district: inspection.storage_name || '',
          item_type: 'water_tank'
        })
      }
    })
    
    // ホースと防火水槽の要対応事項をマージ
    const allItems = [...(hoseResult.results || []), ...tankItems]
    
    // 未完了を優先、その後は日付順にソート
    allItems.sort((a, b) => {
      if (a.is_completed !== b.is_completed) {
        return a.is_completed - b.is_completed
      }
      return new Date(b.inspection_date).getTime() - new Date(a.inspection_date).getTime()
    })
    
    return c.json({ items: allItems })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ items: [] }, 500)
  }
})

// ==========================================
// API: 対応履歴取得（特定のホース）
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
    
    // 防火水槽の要対応事項の場合（IDが "tank_" で始まる）
    if (id.startsWith('tank_')) {
      const parts = id.split('_')
      const inspectionId = parts[1]
      const itemNumber = parts[2]
      
      const columnPrefix = `action_item_${itemNumber}`
      
      await env.DB.prepare(`
        UPDATE water_tank_inspections 
        SET ${columnPrefix}_completed = 1,
            ${columnPrefix}_completed_at = ?,
            ${columnPrefix}_action_content = ?,
            updated_at = ?
        WHERE id = ?
      `).bind(now, data.action_content || null, now, inspectionId).run()
    } else {
      // ホース点検の場合
      await env.DB.prepare(`
        UPDATE action_items
        SET is_completed = 1,
            completed_at = ?,
            action_content = ?,
            updated_at = ?
        WHERE id = ?
      `).bind(now, data.action_content || null, now, id).run()
    }
    
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
// API: ホース集計データ取得
// ==========================================
app.get('/api/hose-stats', async (c) => {
  try {
    const fiscalYear = parseInt(c.req.query('fiscal_year') || new Date().getFullYear().toString())
    const env = c.env as { DB: D1Database }
    
    // 年度の開始日と終了日を計算 (4月1日〜翌年3月31日)
    const startDate = `${fiscalYear}-04-01`
    const endDate = `${fiscalYear + 1}-03-31`
    
    // サマリー: 年度合計
    const summaryResult = await env.DB.prepare(`
      SELECT 
        COALESCE(SUM(hose_replaced_count), 0) as total_replaced,
        COALESCE(SUM(hose_damaged_count), 0) as total_damaged
      FROM hose_inspections
      WHERE inspection_date >= ? AND inspection_date <= ?
    `).bind(startDate, endDate).first()
    
    // 月別集計
    const monthlyResult = await env.DB.prepare(`
      SELECT 
        CAST(strftime('%m', inspection_date) AS INTEGER) as month,
        COALESCE(SUM(hose_replaced_count), 0) as replaced,
        COALESCE(SUM(hose_damaged_count), 0) as damaged
      FROM hose_inspections
      WHERE inspection_date >= ? AND inspection_date <= ?
      GROUP BY strftime('%m', inspection_date)
      ORDER BY month ASC
    `).bind(startDate, endDate).all()
    
    // 全12ヶ月分のデータを準備 (データがない月は0で埋める)
    const monthlyData = []
    for (let m = 1; m <= 12; m++) {
      const found = monthlyResult.results?.find((r: any) => r.month === m)
      monthlyData.push({
        month: m,
        replaced: found ? found.replaced : 0,
        damaged: found ? found.damaged : 0
      })
    }
    
    // ホース別集計 (破損数の多い順)
    const storageResult = await env.DB.prepare(`
      SELECT 
        s.district,
        s.storage_number,
        s.location,
        COALESCE(SUM(i.hose_replaced_count), 0) as replaced,
        COALESCE(SUM(i.hose_damaged_count), 0) as damaged
      FROM hose_storages s
      LEFT JOIN hose_inspections i ON s.id = i.storage_id 
        AND i.inspection_date >= ? AND i.inspection_date <= ?
      GROUP BY s.id, s.district, s.storage_number, s.location
      HAVING damaged > 0 OR replaced > 0
      ORDER BY damaged DESC, replaced DESC
    `).bind(startDate, endDate).all()
    
    // 総ホース数
    const totalStoragesResult = await env.DB.prepare(`
      SELECT COUNT(*) as total FROM hose_storages
    `).first()
    
    // 年度内に点検実施したホース数
    const inspectedStoragesResult = await env.DB.prepare(`
      SELECT COUNT(DISTINCT storage_id) as inspected
      FROM hose_inspections
      WHERE inspection_date >= ? AND inspection_date <= ?
    `).bind(startDate, endDate).first()
    
    return c.json({
      fiscal_year: fiscalYear,
      summary: {
        ...summaryResult,
        total_storages: totalStoragesResult?.total || 0,
        inspected_storages: inspectedStoragesResult?.inspected || 0
      },
      monthly: monthlyData,
      by_storage: storageResult.results || []
    })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ 
      summary: { total_replaced: 0, total_damaged: 0 },
      monthly: [],
      by_storage: []
    }, 500)
  }
})

// ==========================================
// API: 要対応事項一覧取得 (by inspection_id)
// ==========================================
app.get('/api/action-items/:inspectionId', async (c) => {
  try {
    const inspectionId = c.req.param('inspectionId')
    const env = c.env as { DB: D1Database }
    
    const result = await env.DB.prepare(`
      SELECT * FROM action_items
      WHERE inspection_id = ?
      ORDER BY item_order ASC
    `).bind(inspectionId).all()
    
    return c.json(result.results || [])
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 要対応事項を対応完了にする
// ==========================================
app.put('/api/action-items/:id/complete', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    const now = new Date().toISOString()
    
    await env.DB.prepare(`
      UPDATE action_items
      SET is_completed = 1, completed_at = ?, action_content = ?
      WHERE id = ?
    `).bind(now, data.action_content || null, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 要対応事項を対応中にする
// ==========================================
app.put('/api/action-items/:id/in-progress', async (c) => {
  try {
    const id = c.req.param('id')
    const data = await c.req.json()
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      UPDATE action_items
      SET is_completed = 0, completed_at = NULL, action_content = ?
      WHERE id = ?
    `).bind(data.action_content || null, id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 要対応事項を未対応に戻す
// ==========================================
app.put('/api/action-items/:id/pending', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      UPDATE action_items
      SET is_completed = 0, completed_at = NULL, action_content = NULL
      WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: 要対応事項を未完了に戻す（旧API・互換性のため残す）
// ==========================================
app.put('/api/action-items/:id/uncomplete', async (c) => {
  try {
    const id = c.req.param('id')
    const env = c.env as { DB: D1Database }
    
    await env.DB.prepare(`
      UPDATE action_items
      SET is_completed = 0, completed_at = NULL
      WHERE id = ?
    `).bind(id).run()
    
    return c.json({ success: true })
  } catch (error) {
    console.error('Database error:', error)
    return c.json({ success: false }, 500)
  }
})

// ==========================================
// API: データ移行 (一時的) - 既存のaction_requiredをaction_itemsに移行
// ==========================================
app.post('/api/migrate-action-items', async (c) => {
  try {
    const env = c.env as { DB: D1Database }
    
    // 1. action_requiredが存在する点検記録を取得
    const inspections = await env.DB.prepare(`
      SELECT id, action_required, inspection_date
      FROM hose_inspections
      WHERE action_required IS NOT NULL AND action_required != ''
    `).all()
    
    let totalItems = 0;
    let migratedInspections = 0;
    
    // 2. 各点検記録のaction_requiredを分割してaction_itemsに保存
    for (const inspection of inspections.results as any[]) {
      // 既にaction_itemsが存在するかチェック
      const existing = await env.DB.prepare(`
        SELECT COUNT(*) as count FROM action_items WHERE inspection_id = ?
      `).bind(inspection.id).first()
      
      if ((existing as any).count > 0) {
        continue; // 既に移行済み
      }
      
      const actionRequired = inspection.action_required as string;
      
      // \\n\\n で分割
      const items = actionRequired.split('\\n\\n').map(item => {
        // [数字] プレフィックスを削除
        const closeBracketIndex = item.indexOf(']');
        if (item.startsWith('[') && closeBracketIndex > 0) {
          return item.slice(closeBracketIndex + 1).trim();
        }
        return item.trim();
      }).filter(item => item !== '');
      
      // 各アイテムをaction_itemsに保存
      for (let i = 0; i < items.length; i++) {
        try {
          const now = new Date().toISOString();
          const itemOrder = i + 1;
          
          // id は INTEGER AUTOINCREMENT なので指定しない
          await env.DB.prepare(`
            INSERT INTO action_items (
              inspection_id, content, item_order, created_at
            ) VALUES (?, ?, ?, ?)
          `).bind(inspection.id, items[i], itemOrder, now).run();
          
          totalItems++;
        } catch (err) {
          console.error(`Failed to insert item ${i} for inspection ${inspection.id}:`, err);
          throw err;
        }
      }
      
      migratedInspections++;
    }
    
    return c.json({ 
      success: true, 
      migratedInspections,
      totalItems,
      message: `${migratedInspections}件の点検記録から${totalItems}件のアイテムを移行しました`
    })
  } catch (error) {
    console.error('Migration error:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// ==========================================
// API: Google Maps短縮URLを展開して座標を取得
// ==========================================
app.post('/api/expand-maps-url', async (c) => {
  try {
    const { url } = await c.req.json()
    
    if (!url) {
      return c.json({ success: false, error: 'URL is required' }, 400)
    }
    
    // 既に座標が含まれている通常のURLの場合
    const coords = extractCoordsFromUrl(url)
    if (coords) {
      return c.json({ success: true, lat: coords.lat, lon: coords.lon })
    }
    
    // 短縮URLの場合、サーバー側でfetchして展開
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl')) {
      try {
        // Step 1: リダイレクトを追跡してfinal URLを取得
        const response = await fetch(url, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        
        let finalUrl = response.url
        
        // Step 2: もし最終URLがまだ短縮URLなら、HTMLをパースしてリダイレクト先を探す
        if (finalUrl.includes('maps.app.goo.gl') || finalUrl.includes('goo.gl')) {
          const html = await response.text()
          
          // パターン1: meta refreshタグを探す
          const metaRefreshMatch = html.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["'][^>]*>/i)
          if (metaRefreshMatch && metaRefreshMatch[1]) {
            finalUrl = metaRefreshMatch[1]
          } else {
            // パターン2: window.location = "..." を探す
            const jsRedirectMatch = html.match(/window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/i)
            if (jsRedirectMatch && jsRedirectMatch[1]) {
              finalUrl = jsRedirectMatch[1]
            } else {
              // パターン3: href="..." (リンク内の完全なURL)を探す
              const hrefMatch = html.match(/href=["'](https:\/\/www\.google\.com\/maps[^"']+)["']/i)
              if (hrefMatch && hrefMatch[1]) {
                finalUrl = hrefMatch[1]
              }
            }
          }
        }
        
        // final URLから座標を抽出
        const finalCoords = extractCoordsFromUrl(finalUrl)
        if (finalCoords) {
          return c.json({ 
            success: true, 
            lat: finalCoords.lat, 
            lon: finalCoords.lon,
            expandedUrl: finalUrl
          })
        }
        
        return c.json({ 
          success: false, 
          error: 'Could not extract coordinates from expanded URL',
          expandedUrl: finalUrl
        }, 400)
      } catch (fetchError) {
        console.error('URL expansion error:', fetchError)
        return c.json({ 
          success: false, 
          error: 'Failed to expand shortened URL: ' + String(fetchError)
        }, 500)
      }
    }
    
    return c.json({ 
      success: false, 
      error: 'Could not extract coordinates from URL'
    }, 400)
    
  } catch (error) {
    console.error('Expand URL error:', error)
    return c.json({ success: false, error: String(error) }, 500)
  }
})

// 座標抽出用のヘルパー関数
function extractCoordsFromUrl(url: string): { lat: number; lon: number } | null {
  if (!url) return null
  
  // パターン1: @35.123,139.456 形式
  let match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
  }
  
  // パターン2: ?q=35.123,139.456 形式
  match = url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
  }
  
  // パターン3: /place/.../@35.123,139.456 形式
  match = url.match(/\/place\/[^@]*@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (match) {
    return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) }
  }
  
  return null
}

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
    <div id="activityModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
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

                            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">👔 防火服（基準: 10着）</label>
                                    <input type="number" id="fireSuits" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">👢 銀長靴（基準: 10足）</label>
                                    <input type="number" id="boots" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">⛑️ ヘルメット（基準: 10個）</label>
                                    <input type="number" id="helmets" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🚿 ホース（規定: 26本）</label>
                                    <input type="number" id="hoses" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                            </div>
                            
                            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">🔫 筒先（基準: 2本）</label>
                                    <input type="number" id="nozzles" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">💡 懐中電灯（基準: 8本）</label>
                                    <input type="number" id="flashlights" placeholder="実数を入力" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                </div>
                                <div>
                                    <label class="block text-sm font-bold text-gray-700 mb-2">💡 懐中電灯の充電確認</label>
                                    <select id="flashlightCharge" class="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                        <option value="">-</option>
                                        <option value="良">良</option>
                                        <option value="不良">不良</option>
                                    </select>
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
                flashlights: parseInt(document.getElementById('flashlights').value) || null,
                flashlight_charge: document.getElementById('flashlightCharge').value || null,
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

            const modalContent = '<div class="fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto" onclick="hideDetailModal()">' +
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
            document.getElementById('flashlights').value = log.flashlights || '';
            document.getElementById('flashlightCharge').value = log.flashlight_charge || '';
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
        .absence-period {
            background: repeating-linear-gradient(
                45deg,
                #fed7aa,
                #fed7aa 10px,
                #fdba74 10px,
                #fdba74 20px
            );
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
            <h1 class="text-3xl font-bold text-gray-800 mb-2">👥 団員名簿</h1>
            <p class="text-base text-gray-600">団員情報の閲覧・編集</p>
            <p class="text-sm text-orange-600 mt-2">💡 新規団員登録は<a href="/admin#members" class="underline font-bold hover:text-orange-800">団員管理</a>から行ってください</p>
        </div>

        <!-- タブUI -->
        <div class="bg-white rounded-2xl shadow-lg mb-6">
            <div class="flex border-b">
                <button id="tabActive" onclick="switchTab('active')" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-blue-500 text-blue-500">
                    👥 現役
                </button>
                <button id="tabOB" onclick="switchTab('ob')" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    👴 OB
                </button>
                <button id="tabRetired" onclick="switchTab('retired')" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    🚪 退団
                </button>
                <button id="tabTimeline" onclick="switchTab('timeline')" class="tab-btn flex-1 py-4 px-2 font-bold text-base transition border-b-4 border-transparent text-gray-500 hover:text-gray-700">
                    📊 在籍年表
                </button>
            </div>
        </div>

        <!-- 現役タブ -->
        <div id="activeMemberList" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <p class="text-gray-800 text-center py-8 col-span-full">読み込み中...</p>
        </div>

        <!-- OBタブ -->
        <div id="obMemberList" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <p class="text-gray-800 text-center py-8 col-span-full">読み込み中...</p>
        </div>

        <!-- 退団タブ -->
        <div id="retiredMemberList" class="hidden grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <p class="text-gray-800 text-center py-8 col-span-full">読み込み中...</p>
        </div>

        <!-- 在籍年表タブ -->
        <div id="timelineTab" class="hidden">
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <h2 class="text-2xl font-bold text-gray-800 mb-4">📊 在籍年表</h2>
                <div id="timelineContent" class="overflow-x-auto">
                    <p class="text-gray-600 text-center py-8">読み込み中...</p>
                </div>
            </div>
        </div>
    </div>

    <!-- 団員追加/編集モーダル -->
    <div id="memberModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
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

    <!-- 欠席期間管理モーダル -->
    <div id="absenceModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-[9999] overflow-y-auto">
        <div class="min-h-full flex items-center justify-center p-4">
            <div class="bg-white rounded-2xl p-8 max-w-3xl w-full shadow-2xl">
                <h3 id="absenceModalTitle" class="text-2xl font-bold mb-6">🏝️ 欠席期間管理</h3>
                
                <!-- 新規登録フォーム -->
                <div class="bg-blue-50 rounded-xl p-6 mb-6">
                    <h4 class="text-lg font-bold mb-4">✚ 新規登録</h4>
                    <form id="absenceForm" onsubmit="saveAbsence(event)" class="space-y-4">
                        <input type="hidden" id="absenceUserId" />
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block font-bold mb-2">開始日 *</label>
                                <input type="date" id="absenceStartDate" required class="w-full px-4 py-2 border rounded-lg">
                            </div>
                            <div>
                                <label class="block font-bold mb-2">終了日</label>
                                <input type="date" id="absenceEndDate" class="w-full px-4 py-2 border rounded-lg">
                                <p class="text-xs text-gray-600 mt-1">※空欄の場合は現在も欠席中</p>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block font-bold mb-2">理由</label>
                            <input type="text" id="absenceReason" class="w-full px-4 py-2 border rounded-lg" placeholder="例: 留学、入院など">
                        </div>
                        
                        <button type="submit" class="w-full bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">
                            💾 追加
                        </button>
                    </form>
                </div>
                
                <!-- 既存の欠席期間リスト -->
                <div class="bg-gray-50 rounded-xl p-6 mb-6">
                    <h4 class="text-lg font-bold mb-4">📋 登録済み欠席期間</h4>
                    <div id="absenceList" class="space-y-2">
                        <p class="text-gray-600 text-center py-4">読み込み中...</p>
                    </div>
                </div>
                
                <button onclick="closeAbsenceModal()" class="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-3 rounded-lg font-bold">
                    閉じる
                </button>
            </div>
        </div>
    </div>

    <script>
        let members = [];
        let currentTab = 'active';
        let currentAbsenceUserId = null;
        let absencePeriods = {};

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
                document.getElementById('activeMemberList').innerHTML = 
                    '<div class="col-span-full bg-red-50 rounded-2xl p-12 text-center shadow-lg border-2 border-red-200">' +
                        '<p class="text-red-800 text-xl font-bold mb-2">⚠️ データの読み込みに失敗しました</p>' +
                        '<p class="text-red-600 text-sm">エラー: ' + error.message + '</p>' +
                        '<button onclick="loadMembers()" class="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-bold">🔄 再読み込み</button>' +
                    '</div>';
            }
        }

        function switchTab(tabName) {
            currentTab = tabName;
            
            // タブボタンのスタイル更新
            ['tabActive', 'tabOB', 'tabRetired', 'tabTimeline'].forEach(id => {
                const btn = document.getElementById(id);
                btn.classList.remove('border-blue-500', 'text-blue-500');
                btn.classList.add('border-transparent', 'text-gray-500');
            });
            
            // コンテンツの表示切り替え
            ['activeMemberList', 'obMemberList', 'retiredMemberList', 'timelineTab'].forEach(id => {
                document.getElementById(id).classList.add('hidden');
            });
            
            if (tabName === 'active') {
                document.getElementById('tabActive').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabActive').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('activeMemberList').classList.remove('hidden');
            } else if (tabName === 'ob') {
                document.getElementById('tabOB').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabOB').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('obMemberList').classList.remove('hidden');
            } else if (tabName === 'retired') {
                document.getElementById('tabRetired').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabRetired').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('retiredMemberList').classList.remove('hidden');
            } else if (tabName === 'timeline') {
                document.getElementById('tabTimeline').classList.remove('border-transparent', 'text-gray-500');
                document.getElementById('tabTimeline').classList.add('border-blue-500', 'text-blue-500');
                document.getElementById('timelineTab').classList.remove('hidden');
                // 欠席期間データを読み込んでから、デフォルトソート（退団が早い順）して年表を描画
                loadAllAbsencePeriods().then(() => sortByRetirementDate());
            }
            
            renderMembers();
        }

        function renderMembers() {
            // 現役タブ（status=1 or statusなし）
            const activeMembers = members.filter(m => !m.status || m.status === 1);
            renderMemberList('activeMemberList', activeMembers, '現役団員');
            
            // OBタブ（status=2）
            const obMembers = members.filter(m => m.status === 2);
            renderMemberList('obMemberList', obMembers, 'OB');
            
            // 退団タブ（status=3）
            const retiredMembers = members.filter(m => m.status === 3);
            renderMemberList('retiredMemberList', retiredMembers, '退団者');
        }

        function renderMemberList(containerId, memberList, label) {
            const list = document.getElementById(containerId);
            
            if (memberList.length === 0) {
                list.innerHTML = '<div class="col-span-full bg-white rounded-2xl p-12 text-center shadow-lg"><p class="text-gray-800 text-xl">まだ' + label + 'が登録されていません</p></div>';
                return;
            }

            list.innerHTML = memberList.map(member => {
                const age = member.birth_date ? calculateAge(member.birth_date) : '不明';
                
                // 在籍年数計算（退団者は退団年度まで、現役は現在年度まで）
                let years = '不明';
                if (member.join_date) {
                    const today = new Date();
                    const currentYear = today.getFullYear();
                    const currentMonth = today.getMonth() + 1;
                    const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
                    
                    const joinDate = new Date(member.join_date);
                    const joinYear = joinDate.getFullYear();
                    const joinMonth = joinDate.getMonth() + 1;
                    const joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1;
                    
                    let endFiscalYear = currentFiscalYear;
                    if (member.retirement_date && member.retirement_date !== 'null') {
                        const retireDate = new Date(member.retirement_date);
                        if (!isNaN(retireDate.getTime())) {
                            const retireYear = retireDate.getFullYear();
                            const retireMonth = retireDate.getMonth() + 1;
                            endFiscalYear = retireMonth >= 4 ? retireYear : retireYear - 1;
                        }
                    }
                    
                    years = endFiscalYear - joinFiscalYear + 1;
                }
                
                const joinDateDisplay = member.join_date ? new Date(member.join_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'}) : '不明';
                const birthDateDisplay = member.birth_date ? new Date(member.birth_date).toLocaleDateString('ja-JP', {year: 'numeric', month: 'long', day: 'numeric'}) : '不明';
                
                // ステータスに応じてボタンを変える
                const isActive = !member.status || member.status === 1;
                const isOB = member.status === 2;
                const isRetired = member.status === 3;
                
                let statusButtons = '';
                if (isActive) {
                    // 現役: 引退・退団ボタン
                    statusButtons = '<button onclick="changeStatus(\\'' + member.id + '\\', 2)" class="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition shadow-md font-bold">' +
                        '😊 引退' +
                    '</button>' +
                    '<button onclick="changeStatus(\\'' + member.id + '\\', 3)" class="bg-orange-500 hover:bg-orange-600 text-white px-4 py-3 rounded-lg transition shadow-md font-bold">' +
                        '🚪 退団' +
                    '</button>';
                } else {
                    // OBまたは退団: 現役復帰ボタン
                    statusButtons = '<button onclick="changeStatus(\\'' + member.id + '\\', 1)" class="bg-purple-500 hover:bg-purple-600 text-white px-4 py-3 rounded-lg transition shadow-md font-bold col-span-2">' +
                        '🔄 現役復帰' +
                    '</button>';
                }
                
                return '<div class="bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200 hover:border-blue-400 transition">' +
                    '<h3 class="text-2xl font-bold text-gray-800 mb-4">👤 ' + member.name + '</h3>' +
                    '<div class="space-y-2 mb-4">' +
                        '<p class="text-gray-700 text-base">🎂 生年月日: ' + birthDateDisplay + ' (' + age + '歳)</p>' +
                        '<p class="text-gray-700 text-base">📅 入団: ' + joinDateDisplay + ' (' + years + '年目)</p>' +
                    '</div>' +
                    '<div class="grid grid-cols-2 gap-2 mb-2">' +
                        statusButtons +
                    '</div>' +
                    '<div class="grid grid-cols-3 gap-2 mb-2">' +
                        '<button onclick="manageAbsence(\\'' + member.id + '\\', \\'' + member.name + '\\')" class="bg-purple-500 hover:bg-purple-600 text-white px-3 py-2 rounded-lg transition shadow-md font-bold text-sm">' +
                            '🏝️ 欠席期間' +
                        '</button>' +
                        '<button onclick="editMember(\\'' + member.id + '\\')" class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition shadow-md font-bold text-sm">' +
                            '✏️ 編集' +
                        '</button>' +
                        '<button onclick="deleteMember(\\'' + member.id + '\\', \\'' + member.name + '\\')" class="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition shadow-md font-bold text-sm">' +
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

        function renderTimeline() {
            const container = document.getElementById('timelineContent');
            if (!container || members.length === 0) {
                if (container) container.innerHTML = '<p class="text-gray-600 text-center py-8">まだ団員が登録されていません</p>';
                return;
            }
            
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            
            // 事前計算：メンバーごとに入団年度・退団年度・欠席期間を1回だけ計算
            const memberData = members.map(member => {
                let joinFiscalYear = null;
                let retirementFiscalYear = null;
                const currentAge = member.birth_date ? calculateAge(member.birth_date) : null;
                
                // 入団年度計算
                if (member.join_date) {
                    const joinDate = new Date(member.join_date);
                    const joinYear = joinDate.getFullYear();
                    const joinMonth = joinDate.getMonth() + 1;
                    joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1;
                }
                
                // 退団年度計算
                let retireDate = null;
                if (member.retirement_date && member.retirement_date !== 'null') {
                    retireDate = new Date(member.retirement_date);
                    if (!isNaN(retireDate.getTime())) {
                        const retireYear = retireDate.getFullYear();
                        const retireMonth = retireDate.getMonth() + 1;
                        retirementFiscalYear = retireMonth >= 4 ? retireYear : retireYear - 1;
                    }
                }
                
                // 在籍年数計算（年度ベース：退団済みなら退団年度まで、現役なら現在年度まで）
                let yearsOfService = null;
                if (joinFiscalYear) {
                    const endFiscalYear = retirementFiscalYear || currentFiscalYear;
                    yearsOfService = endFiscalYear - joinFiscalYear + 1;
                }
                
                // 欠席期間を年度範囲に変換
                const absenceRanges = (absencePeriods[member.id] || []).map(absence => {
                    const startDate = new Date(absence.start_date);
                    const startYear = startDate.getFullYear();
                    const startMonth = startDate.getMonth() + 1;
                    const startFiscalYear = startMonth >= 4 ? startYear : startYear - 1;
                    
                    let endFiscalYear = currentFiscalYear;
                    if (absence.end_date) {
                        const endDate = new Date(absence.end_date);
                        const endYear = endDate.getFullYear();
                        const endMonth = endDate.getMonth() + 1;
                        endFiscalYear = endMonth >= 4 ? endYear : endYear - 1;
                    }
                    return { start: startFiscalYear, end: endFiscalYear };
                });
                
                // バッジ（年度ベースで満5年=5年度、満10年=10年度、満20年=20年度）
                let badge = '';
                if (yearsOfService >= 20) badge = '🏆';
                else if (yearsOfService >= 10) badge = '🥈';
                else if (yearsOfService >= 5) badge = '🥉';
                
                return {
                    name: member.name,
                    badge: badge,
                    joinFiscalYear: joinFiscalYear,
                    retirementFiscalYear: retirementFiscalYear,
                    currentAge: currentAge,
                    absenceRanges: absenceRanges
                };
            });
            
            // HTML生成（高速化：配列結合）
            const rows = ['<table class="min-w-full border-collapse"><thead><tr><th class="border px-4 py-2 bg-gray-100 sticky left-0 z-10">氏名</th>'];
            
            for (let i = 20; i >= 0; i--) {
                const year = currentFiscalYear - i;
                rows.push('<th class="border px-2 py-2 bg-gray-100 text-xs cursor-pointer hover:bg-blue-100 transition" onclick="sortByYear(' + year + ')" title="クリックして' + year + '年度在籍者でソート">' + year + '</th>');
            }
            rows.push('</tr></thead><tbody>');
            
            memberData.forEach(data => {
                rows.push('<tr><td class="border px-4 py-2 font-bold bg-white sticky left-0 z-10">' + data.badge + ' ' + data.name + '</td>');
                
                for (let i = 20; i >= 0; i--) {
                    const year = currentFiscalYear - i;
                    const isActive = data.joinFiscalYear && year >= data.joinFiscalYear && 
                                    (!data.retirementFiscalYear || year <= data.retirementFiscalYear);
                    
                    let cellClass = 'border px-2 py-2 text-center text-xs';
                    let cellContent = '';
                    
                    if (isActive) {
                        // 欠席チェック（高速化：事前計算した範囲で判定）
                        const isAbsent = data.absenceRanges.some(range => year >= range.start && year <= range.end);
                        
                        if (isAbsent) {
                            cellClass += ' absence-period';
                            cellContent = '🏝️欠席';
                        } else {
                            const yearsOfService = year - data.joinFiscalYear + 1;
                            const age = data.currentAge ? (data.currentAge - (currentFiscalYear - year)) : null;
                            cellClass += ' bg-green-100';
                            cellContent = yearsOfService + '年';
                            if (age) cellContent += '<br>(' + age + '歳)';
                        }
                    } else {
                        cellClass += ' bg-gray-50';
                    }
                    
                    rows.push('<td class="' + cellClass + '">' + cellContent + '</td>');
                }
                rows.push('</tr>');
            });
            
            rows.push('</tbody></table>');
            container.innerHTML = rows.join('');
        }
        
        // デフォルトソート：年数が長い順（入団が早い順）
        function sortByRetirementDate() {
            const today = new Date();
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth() + 1;
            const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            
            const memberData = members.map(member => {
                let joinFiscalYear = null;
                let retirementFiscalYear = null;
                
                if (member.join_date) {
                    const joinDate = new Date(member.join_date);
                    const joinYear = joinDate.getFullYear();
                    const joinMonth = joinDate.getMonth() + 1;
                    joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1;
                }
                
                if (member.retirement_date && member.retirement_date !== 'null') {
                    const retireDate = new Date(member.retirement_date);
                    if (!isNaN(retireDate.getTime())) {
                        const retireYear = retireDate.getFullYear();
                        const retireMonth = retireDate.getMonth() + 1;
                        retirementFiscalYear = retireMonth >= 4 ? retireYear : retireYear - 1;
                    }
                }
                
                // 在籍年数計算
                const endFiscalYear = retirementFiscalYear || currentFiscalYear;
                const yearsOfService = joinFiscalYear ? (endFiscalYear - joinFiscalYear + 1) : 0;
                
                return { 
                    member: member,
                    joinFiscalYear: joinFiscalYear,
                    yearsOfService: yearsOfService
                };
            });
            
            // ソート：年数が長い順（入団が早い順）
            memberData.sort((a, b) => {
                if (a.yearsOfService !== b.yearsOfService) {
                    return b.yearsOfService - a.yearsOfService; // 降順
                }
                return a.member.name.localeCompare(b.member.name, 'ja');
            });
            
            members = memberData.map(item => item.member);
            renderTimeline();
        }

        // 指定年度の在籍者でソート：その年在籍者で退団が早い順
        function sortByYear(targetYear) {
            const activeStatus = members.map(member => {
                let joinFiscalYear = null;
                let retirementFiscalYear = null;
                
                if (member.join_date) {
                    const joinDate = new Date(member.join_date);
                    const joinYear = joinDate.getFullYear();
                    const joinMonth = joinDate.getMonth() + 1;
                    joinFiscalYear = joinMonth >= 4 ? joinYear : joinYear - 1;
                }
                
                if (member.retirement_date && member.retirement_date !== 'null') {
                    const retireDate = new Date(member.retirement_date);
                    if (!isNaN(retireDate.getTime())) {
                        const retireYear = retireDate.getFullYear();
                        const retireMonth = retireDate.getMonth() + 1;
                        retirementFiscalYear = retireMonth >= 4 ? retireYear : retireYear - 1;
                    }
                }
                
                const wasActive = joinFiscalYear && targetYear >= joinFiscalYear && 
                                (!retirementFiscalYear || targetYear <= retirementFiscalYear);
                
                return { 
                    member: member, 
                    wasActive: wasActive,
                    retirementFiscalYear: retirementFiscalYear
                };
            });
            
            // ソート：在籍者を上に、退団が早い順（現役は最後）
            activeStatus.sort((a, b) => {
                // 在籍状態で分ける
                if (a.wasActive && !b.wasActive) return -1;
                if (!a.wasActive && b.wasActive) return 1;
                
                // 両方在籍者：退団が早い順（nullは最後＝現役は最後）
                if (a.wasActive && b.wasActive) {
                    if (a.retirementFiscalYear && b.retirementFiscalYear) {
                        return a.retirementFiscalYear - b.retirementFiscalYear;
                    }
                    if (a.retirementFiscalYear && !b.retirementFiscalYear) return -1;
                    if (!a.retirementFiscalYear && b.retirementFiscalYear) return 1;
                }
                
                return a.member.name.localeCompare(b.member.name, 'ja');
            });
            
            members = activeStatus.map(item => item.member);
            renderTimeline();
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
        
        async function changeStatus(userId, newStatus) {
            const statusNames = { 1: '現役', 2: 'OB', 3: '退団' };
            const confirmMsg = 'ステータスを「' + statusNames[newStatus] + '」に変更しますか？';
            
            if (!confirm(confirmMsg)) {
                return;
            }
            
            try {
                const response = await fetch('/api/users/' + userId + '/status', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: newStatus })
                });
                
                if (response.ok) {
                    alert('✅ ステータスを変更しました');
                    
                    // データを再読み込みしてからタブを切り替え
                    await loadMembers();
                    
                    // ステータスに応じてタブを自動切り替え
                    if (newStatus === 1) {
                        switchTab('active');
                    } else if (newStatus === 2) {
                        switchTab('ob');
                    } else if (newStatus === 3) {
                        switchTab('retired');
                    }
                } else {
                    alert('❌ ステータス変更中にエラーが発生しました');
                }
            } catch (error) {
                alert('❌ ステータス変更中にエラーが発生しました');
                console.error(error);
            }
        }

        // ===== 欠席期間管理 =====
        async function manageAbsence(userId, userName) {
            currentAbsenceUserId = userId;
            document.getElementById('absenceModalTitle').textContent = '🏝️ ' + userName + ' の欠席期間管理';
            document.getElementById('absenceUserId').value = userId;
            document.getElementById('absenceForm').reset();
            document.getElementById('absenceUserId').value = userId;
            
            // 既存の欠席期間を取得
            await loadAbsencePeriods(userId);
            
            document.getElementById('absenceModal').classList.remove('hidden');
        }

        function closeAbsenceModal() {
            document.getElementById('absenceModal').classList.add('hidden');
            currentAbsenceUserId = null;
        }

        async function loadAbsencePeriods(userId) {
            try {
                const response = await fetch('/api/absence-periods/' + userId);
                const data = await response.json();
                const periods = data.periods || [];
                
                // メモリに保存（年表描画で使用）
                absencePeriods[userId] = periods;
                
                const listEl = document.getElementById('absenceList');
                
                if (periods.length === 0) {
                    listEl.innerHTML = '<p class="text-gray-600 text-center py-4">まだ欠席期間が登録されていません</p>';
                    return;
                }
                
                listEl.innerHTML = periods.map(p => {
                    const start = new Date(p.start_date).toLocaleDateString('ja-JP');
                    const end = p.end_date ? new Date(p.end_date).toLocaleDateString('ja-JP') : '現在';
                    const reason = p.reason || '理由なし';
                    
                    return '<div class="bg-white rounded-lg p-4 flex justify-between items-center">' +
                        '<div>' +
                            '<p class="font-bold text-gray-800">' + start + ' 〜 ' + end + '</p>' +
                            '<p class="text-sm text-gray-600">' + reason + '</p>' +
                        '</div>' +
                        '<button onclick="deleteAbsence(\\'' + p.id + '\\')" class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold">' +
                            '🗑️ 削除' +
                        '</button>' +
                    '</div>';
                }).join('');
            } catch (error) {
                console.error('Error loading absence periods:', error);
                document.getElementById('absenceList').innerHTML = '<p class="text-red-600 text-center py-4">読み込みに失敗しました</p>';
            }
        }

        async function saveAbsence(event) {
            event.preventDefault();
            
            const userId = document.getElementById('absenceUserId').value;
            const startDate = document.getElementById('absenceStartDate').value;
            const endDate = document.getElementById('absenceEndDate').value;
            const reason = document.getElementById('absenceReason').value;
            
            const data = {
                user_id: userId,
                start_date: startDate,
                end_date: endDate || null,
                reason: reason || null
            };
            
            try {
                const response = await fetch('/api/absence-periods', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                if (response.ok) {
                    alert('✅ 欠席期間を登録しました！');
                    document.getElementById('absenceForm').reset();
                    document.getElementById('absenceUserId').value = userId;
                    await loadAbsencePeriods(userId);
                } else {
                    alert('❌ 登録に失敗しました');
                }
            } catch (error) {
                alert('❌ 登録中にエラーが発生しました');
                console.error(error);
            }
        }

        async function deleteAbsence(id) {
            if (!confirm('この欠席期間を削除しますか？')) return;
            
            try {
                const response = await fetch('/api/absence-periods/' + id, {
                    method: 'DELETE'
                });
                
                if (response.ok) {
                    alert('✅ 削除しました！');
                    await loadAbsencePeriods(currentAbsenceUserId);
                } else {
                    alert('❌ 削除に失敗しました');
                }
            } catch (error) {
                alert('❌ 削除中にエラーが発生しました');
                console.error(error);
            }
        }

        // 全団員の欠席期間を取得
        async function loadAllAbsencePeriods() {
            absencePeriods = {};
            for (const member of members) {
                try {
                    const response = await fetch('/api/absence-periods/' + member.id);
                    const data = await response.json();
                    absencePeriods[member.id] = data.periods || [];
                } catch (error) {
                    console.error('Error loading absence periods for ' + member.id, error);
                    absencePeriods[member.id] = [];
                }
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
    <script src="https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js"></script>
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
        .tab-btn.active {
            border-bottom: 4px solid #ef5350;
            color: #ef5350;
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
            <h1 class="text-3xl font-bold text-gray-800 mb-2">📊 活動集計</h1>
            <p class="text-base text-gray-600 mb-4">活動実績データ・統計表示</p>
            
            <!-- タブナビゲーション -->
            <div class="flex border-b mt-4">
                <!-- 活動集計タブ - 非表示（データは保持） -->
                <!--
                <button id="tabActivity" class="tab-btn flex-1 py-3 px-6 font-bold text-lg transition active">
                    📝 活動集計
                </button>
                -->
                <button id="tabHose" class="tab-btn flex-1 py-3 px-6 font-bold text-lg transition active">
                    📈 ホース集計
                </button>
            </div>
        </div>
        
        <!-- 活動集計タブ - 非表示（データは保持） -->
        <!--
        <div id="activityTab">
        <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
            <label class="block text-lg font-bold text-gray-700 mb-3">📅 年度選択</label>
            <select id="activityFiscalYear" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg">
            </select>
        </div>
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
        <div class="bg-white rounded-2xl p-6 shadow-lg">
            <h2 class="text-xl font-bold text-gray-800 mb-4">👥 出動回数ランキング</h2>
            <div id="participationRanking" class="space-y-2">
            </div>
        </div>
        </div>
        -->
        
        <!-- ホース集計タブ -->
        <div id="hoseTab">
            <!-- 年度選択 -->
            <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <label class="block text-lg font-bold text-gray-700 mb-3">📅 年度選択</label>
                <select id="fiscalYear" class="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg">
                    <!-- JavaScriptで動的に生成 -->
                </select>
            </div>

            <!-- 集計サマリー -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <div class="bg-blue-50 rounded-2xl p-6 shadow-lg">
                    <div class="text-blue-600 text-4xl mb-2">🔄</div>
                    <div class="text-3xl font-bold text-blue-600 mb-1" id="totalReplaced">-</div>
                    <div class="text-gray-700 font-bold">年度交換数</div>
                </div>
                <div class="bg-red-50 rounded-2xl p-6 shadow-lg">
                    <div class="text-red-600 text-4xl mb-2">⚠️</div>
                    <div class="text-3xl font-bold text-red-600 mb-1" id="totalDamaged">-</div>
                    <div class="text-gray-700 font-bold">年度破損数</div>
                </div>
                <div class="bg-green-50 rounded-2xl p-6 shadow-lg">
                    <div class="text-green-600 text-4xl mb-2">📊</div>
                    <div class="text-3xl font-bold text-green-600 mb-1" id="replacementRate">-</div>
                    <div class="text-gray-700 font-bold">破損率</div>
                </div>
                <div class="bg-purple-50 rounded-2xl p-6 shadow-lg">
                    <div class="text-purple-600 text-4xl mb-2">📦</div>
                    <div class="text-3xl font-bold text-purple-600 mb-1" id="inspectionCoverage">-</div>
                    <div class="text-gray-700 font-bold">点検実施率</div>
                </div>
            </div>

            <!-- 要対応事項統計 -->
            <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold text-gray-800 mb-4">🚨 要対応事項統計</h2>
                <div class="grid grid-cols-3 gap-4">
                    <div class="text-center bg-red-50 rounded-xl p-4">
                        <div class="text-3xl font-bold text-red-600 mb-1" id="totalActionItems">-</div>
                        <div class="text-sm text-gray-700 font-bold">総数</div>
                    </div>
                    <div class="text-center bg-green-50 rounded-xl p-4">
                        <div class="text-3xl font-bold text-green-600 mb-1" id="completedActionItems">-</div>
                        <div class="text-sm text-gray-700 font-bold">対応済み</div>
                    </div>
                    <div class="text-center bg-blue-50 rounded-xl p-4">
                        <div class="text-3xl font-bold text-blue-600 mb-1" id="actionItemCompletionRate">-</div>
                        <div class="text-sm text-gray-700 font-bold">対応率</div>
                    </div>
                </div>
            </div>

            <!-- ホース別ランキング -->
            <div class="bg-white rounded-2xl p-6 mb-6 shadow-lg">
                <h2 class="text-xl font-bold text-gray-800 mb-4">🏆 ホース別ランキング</h2>
                <div id="storageRanking" class="space-y-3">
                    <!-- JavaScriptで動的に生成 -->
                </div>
            </div>

            <!-- Excel出力 -->
            <div class="bg-white rounded-2xl p-6 shadow-lg">
                <button id="exportExcelBtn" class="w-full bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl transition font-bold text-lg">
                    📥 Excelでダウンロード
                </button>
            </div>
        </div>
    </div>

    <script>
        let logs = [];
        let hoseChart = null;

        window.onload = function() {
            loadStats();
            initTabs();
            initHoseTab();
        };

        // タブ切り替え機能
        function initTabs() {
            // タブ切り替え処理 - 活動集計タブ非表示のため無効化
            /*
            const tabActivity = document.getElementById('tabActivity');
            const tabHose = document.getElementById('tabHose');
            const activityTab = document.getElementById('activityTab');
            const hoseTab = document.getElementById('hoseTab');

            tabActivity.addEventListener('click', () => {
                tabActivity.classList.add('active');
                tabActivity.classList.remove('text-gray-500');
                tabHose.classList.remove('active');
                tabHose.classList.add('text-gray-500');
                activityTab.classList.remove('hidden');
                hoseTab.classList.add('hidden');
            });

            tabHose.addEventListener('click', () => {
                tabHose.classList.add('active');
                tabHose.classList.remove('text-gray-500');
                tabActivity.classList.remove('active');
                tabActivity.classList.add('text-gray-500');
                hoseTab.classList.remove('hidden');
                activityTab.classList.add('hidden');
            });
            */
        }

        // ホース集計タブ初期化
        function initHoseTab() {
            initFiscalYearSelect();
            loadHoseStats();

            document.getElementById('fiscalYear').addEventListener('change', loadHoseStats);
            document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
        }

        // 活動集計タブ初期化
        function initActivityTab() {
            initActivityFiscalYearSelect();
            document.getElementById('activityFiscalYear').addEventListener('change', () => {
                calculateStats();
                renderCharts();
                renderParticipationRanking();
            });
        }

        // 活動集計の年度選択を初期化
        function initActivityFiscalYearSelect() {
            const select = document.getElementById('activityFiscalYear');
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1;
            const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            
            // 過去5年分の年度を生成
            for (let i = 0; i < 5; i++) {
                const year = currentFiscalYear - i;
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年度 (' + year + '/4/1〜' + (year + 1) + '/3/31)';
                select.appendChild(option);
            }
        }

        // 選択された年度で活動日誌をフィルタ
        function getFilteredLogs() {
            const fiscalYear = parseInt(document.getElementById('activityFiscalYear').value);
            const startDate = new Date(fiscalYear, 3, 1); // 4月1日
            const endDate = new Date(fiscalYear + 1, 2, 31, 23, 59, 59); // 翌年3月31日
            
            return logs.filter(log => {
                const logDate = new Date(log.activity_date);
                return logDate >= startDate && logDate <= endDate;
            });
        }

        async function loadStats() {
            try {
                const response = await fetch('/api/activity-logs');
                const data = await response.json();
                logs = data.logs || [];
                
                initActivityTab();
                calculateStats();
                renderCharts();
                renderParticipationRanking();
                
                // 要対応事項統計を読み込む
                loadActionItemsStats();
            } catch (error) {
                console.error('Failed to load stats:', error);
            }
        }
        
        // 要対応事項統計を読み込む
        async function loadActionItemsStats() {
            try {
                const response = await fetch('/api/inspection/action-required');
                const data = await response.json();
                const items = data.items || [];
                
                const totalItems = items.length;
                const completedItems = items.filter(item => item.is_completed === 1).length;
                const completionRate = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
                
                document.getElementById('totalActionItems').textContent = totalItems + '件';
                document.getElementById('completedActionItems').textContent = completedItems + '件';
                document.getElementById('actionItemCompletionRate').textContent = completionRate + '%';
            } catch (error) {
                console.error('Failed to load action items stats:', error);
                document.getElementById('totalActionItems').textContent = '-';
                document.getElementById('completedActionItems').textContent = '-';
                document.getElementById('actionItemCompletionRate').textContent = '-';
            }
        }

        function calculateStats() {
            const filteredLogs = getFilteredLogs();
            
            // 総活動回数
            document.getElementById('totalActivities').textContent = filteredLogs.length;

            // 総活動時間
            const totalHours = filteredLogs.reduce((sum, log) => sum + (parseFloat(log.duration_hours) || 0), 0);
            document.getElementById('totalHours').textContent = totalHours.toFixed(1);

            // 災害出動回数
            const disasterCount = filteredLogs.filter(log => log.activity_type === '災害出動').length;
            document.getElementById('disasterCount').textContent = disasterCount;

            // 訓練回数
            const trainingCount = filteredLogs.filter(log => log.activity_type === '訓練').length;
            document.getElementById('trainingCount').textContent = trainingCount;
        }

        function renderCharts() {
            const filteredLogs = getFilteredLogs();
            
            // 活動種別の割合（円グラフ）
            const typeCounts = {};
            filteredLogs.forEach(log => {
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
            filteredLogs.forEach(log => {
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
            const filteredLogs = getFilteredLogs();
            
            // 出動回数をカウント
            const participationCounts = {};
            filteredLogs.forEach(log => {
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

        // ==========================================
        // タブ切り替え機能
        // ==========================================
        const tabActivity = document.getElementById('tabActivity');
        const tabHose = document.getElementById('tabHose');
        const activityTab = document.getElementById('activityTab');
        const hoseTab = document.getElementById('hoseTab');
        
        tabActivity.addEventListener('click', () => {
            tabActivity.classList.add('active');
            tabActivity.classList.remove('text-gray-500');
            tabHose.classList.remove('active');
            tabHose.classList.add('text-gray-500');
            activityTab.classList.remove('hidden');
            hoseTab.classList.add('hidden');
        });
        
        tabHose.addEventListener('click', () => {
            tabHose.classList.add('active');
            tabHose.classList.remove('text-gray-500');
            tabActivity.classList.remove('active');
            tabActivity.classList.add('text-gray-500');
            hoseTab.classList.remove('hidden');
            activityTab.classList.add('hidden');
            
            // ホース集計タブに切り替えた時に初期化
            if (!hoseChart) {
                initHoseStats();
            }
        });

        // ==========================================
        // ホース集計機能
        // ==========================================
        
        function initHoseStats() {
            initFiscalYearSelect();
            loadHoseStats();

            document.getElementById('fiscalYear').addEventListener('change', loadHoseStats);
            document.getElementById('exportExcelBtn').addEventListener('click', exportToExcel);
        }

        // 年度セレクトボックスを初期化
        function initFiscalYearSelect() {
            const select = document.getElementById('fiscalYear');
            const currentYear = new Date().getFullYear();
            const currentMonth = new Date().getMonth() + 1; // 1-12
            
            // 現在の年度を計算 (4月始まり)
            const currentFiscalYear = currentMonth >= 4 ? currentYear : currentYear - 1;
            
            // 過去5年分の年度を生成
            for (let i = 0; i < 5; i++) {
                const year = currentFiscalYear - i;
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year + '年度 (' + year + '/4/1〜' + (year + 1) + '/3/31)';
                select.appendChild(option);
            }
        }

        // 統計データを読み込む
        async function loadHoseStats() {
            const fiscalYear = parseInt(document.getElementById('fiscalYear').value);
            
            try {
                const response = await fetch('/api/hose-stats?fiscal_year=' + fiscalYear);
                const data = await response.json();
                
                // サマリー更新
                document.getElementById('totalReplaced').textContent = data.summary.total_replaced + '本';
                document.getElementById('totalDamaged').textContent = data.summary.total_damaged + '本';
                
                const rate = data.summary.total_replaced > 0 
                    ? Math.round((data.summary.total_damaged / data.summary.total_replaced) * 100) 
                    : 0;
                document.getElementById('replacementRate').textContent = rate + '%';
                
                // 点検実施率
                const totalStorages = data.summary.total_storages || 0;
                const inspectedStorages = data.summary.inspected_storages || 0;
                const inspectionRate = totalStorages > 0 
                    ? Math.round((inspectedStorages / totalStorages) * 100) 
                    : 0;
                document.getElementById('inspectionCoverage').textContent = inspectedStorages + '/' + totalStorages + ' (' + inspectionRate + '%)';
                
                // グラフ更新（削除済み）
                // updateHoseChart(data.monthly);
                
                // ランキング更新
                updateStorageRanking(data.by_storage);
                
            } catch (error) {
                console.error('データ読み込みエラー:', error);
            }
        }

        // グラフを更新
        function updateHoseChart(monthlyData) {
            console.log('updateHoseChart called with data:', monthlyData);
            
            const canvas = document.getElementById('hoseMonthlyChart');
            if (!canvas) {
                console.error('Canvas element not found: hoseMonthlyChart');
                return;
            }
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                console.error('Could not get 2d context from canvas');
                return;
            }
            
            if (hoseChart) {
                hoseChart.destroy();
            }
            
            const labels = monthlyData.map(d => d.month + '月');
            const replacedData = monthlyData.map(d => d.replaced || 0);
            const damagedData = monthlyData.map(d => d.damaged || 0);
            
            console.log('Creating chart with labels:', labels);
            console.log('Replaced data:', replacedData);
            console.log('Damaged data:', damagedData);
            
            hoseChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [
                        {
                            label: '交換数',
                            data: replacedData,
                            backgroundColor: 'rgba(59, 130, 246, 0.8)',
                            borderColor: 'rgb(59, 130, 246)',
                            borderWidth: 2
                        },
                        {
                            label: '破損数',
                            data: damagedData,
                            backgroundColor: 'rgba(239, 68, 68, 0.8)',
                            borderColor: 'rgb(239, 68, 68)',
                            borderWidth: 2
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }

        // ランキングを更新
        function updateStorageRanking(storageData) {
            const container = document.getElementById('storageRanking');
            container.innerHTML = '';
            
            if (storageData.length === 0) {
                container.innerHTML = '<div class="text-gray-500 text-center py-4">データがありません</div>';
                return;
            }
            
            storageData.forEach((storage, index) => {
                const div = document.createElement('div');
                div.className = 'flex items-center justify-between p-4 bg-gray-50 rounded-lg';
                div.innerHTML = \`
                    <div class="flex items-center space-x-4">
                        <div class="text-2xl font-bold text-gray-400">\${index + 1}</div>
                        <div>
                            <div class="font-bold text-gray-800">\${storage.district} \${storage.storage_number}</div>
                            <div class="text-sm text-gray-600">\${storage.location || ''}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-blue-600 font-bold">交換: \${storage.replaced}本</div>
                        <div class="text-red-600 font-bold">破損: \${storage.damaged}本</div>
                    </div>
                \`;
                container.appendChild(div);
            });
        }

        // Excelエクスポート
        async function exportToExcel() {
            const fiscalYear = parseInt(document.getElementById('fiscalYear').value);
            
            try {
                const response = await fetch('/api/hose-stats?fiscal_year=' + fiscalYear);
                const data = await response.json();
                
                // ワークブック作成
                const wb = XLSX.utils.book_new();
                
                // サマリーシート
                const summaryData = [
                    ['年度', fiscalYear + '年度'],
                    ['期間', fiscalYear + '/4/1〜' + (fiscalYear + 1) + '/3/31'],
                    [''],
                    ['総交換数', data.summary.total_replaced + '本'],
                    ['総破損数', data.summary.total_damaged + '本'],
                    ['破損率', (data.summary.total_replaced > 0 ? Math.round((data.summary.total_damaged / data.summary.total_replaced) * 100) : 0) + '%']
                ];
                const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
                XLSX.utils.book_append_sheet(wb, ws1, 'サマリー');
                
                // 月別シート
                const monthlyData = [
                    ['月', '交換数', '破損数']
                ];
                data.monthly.forEach(m => {
                    monthlyData.push([m.month + '月', m.replaced || 0, m.damaged || 0]);
                });
                const ws2 = XLSX.utils.aoa_to_sheet(monthlyData);
                XLSX.utils.book_append_sheet(wb, ws2, '月別推移');
                
                // ホース別シート
                const storageData = [
                    ['地区', 'ホース番号', '住所', '交換数', '破損数']
                ];
                data.by_storage.forEach(s => {
                    storageData.push([s.district, s.storage_number, s.location || '', s.replaced, s.damaged]);
                });
                const ws3 = XLSX.utils.aoa_to_sheet(storageData);
                XLSX.utils.book_append_sheet(wb, ws3, 'ホース別');
                
                // ダウンロード
                XLSX.writeFile(wb, 'ホース集計_' + fiscalYear + '年度.xlsx');
                
            } catch (error) {
                alert('エクスポートに失敗しました');
                console.error(error);
            }
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
