// データ移行スクリプト: hose_inspections.action_required → action_items テーブル
// 使い方: node migrate_action_items.js

import { readFileSync } from 'fs';

// wrangler.jsonc から database_id を読み取る
const config = JSON.parse(readFileSync('./wrangler.jsonc', 'utf-8'));
const dbId = config.d1_databases[0].database_id;

console.log('🔄 データ移行を開始します...');
console.log(`Database ID: ${dbId}`);

// Cloudflare API を使ってクエリを実行
async function executeQuery(query, params = []) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  
  if (!accountId || !apiToken) {
    throw new Error('環境変数 CLOUDFLARE_ACCOUNT_ID と CLOUDFLARE_API_TOKEN が必要です');
  }

  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${accountId}/d1/database/${dbId}/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sql: query,
        params: params
      })
    }
  );

  const result = await response.json();
  if (!result.success) {
    throw new Error(`Query failed: ${JSON.stringify(result.errors)}`);
  }
  
  return result.result[0];
}

async function migrateData() {
  try {
    // 1. action_requiredが存在する点検記録を取得
    console.log('\n📋 既存の要対応事項を取得中...');
    const inspections = await executeQuery(`
      SELECT id, action_required, inspection_date
      FROM hose_inspections
      WHERE action_required IS NOT NULL AND action_required != ''
    `);

    console.log(`✅ ${inspections.results.length}件の点検記録を発見`);

    if (inspections.results.length === 0) {
      console.log('✨ 移行するデータがありません');
      return;
    }

    // 2. 各点検記録のaction_requiredを分割してaction_itemsに保存
    let totalItems = 0;
    for (const inspection of inspections.results) {
      const actionRequired = inspection.action_required;
      
      // [1], [2], [3] 形式で分割
      const items = actionRequired.split('\n\n').map(item => {
        // [数字] プレフィックスを削除
        const closeBracketIndex = item.indexOf(']');
        if (item.startsWith('[') && closeBracketIndex > 0) {
          return item.slice(closeBracketIndex + 1).trim();
        }
        return item.trim();
      }).filter(item => item !== '');

      // 各アイテムをaction_itemsに保存
      for (let i = 0; i < items.length; i++) {
        const itemId = `action_item_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await executeQuery(`
          INSERT INTO action_items (
            id, inspection_id, content, item_order, created_at
          ) VALUES (?, ?, ?, ?, ?)
        `, [itemId, inspection.id, items[i], i + 1, inspection.inspection_date]);
        
        totalItems++;
      }
      
      console.log(`✅ ${inspection.id}: ${items.length}件のアイテムを移行`);
    }

    console.log(`\n✨ 移行完了! 合計 ${totalItems}件のアイテムを作成しました`);
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    process.exit(1);
  }
}

// 実行
migrateData();
