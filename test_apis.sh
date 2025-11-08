#!/bin/bash
echo "=== API テスト開始 ==="
echo ""

echo "1. ホームページ"
curl -s http://localhost:3000 | grep -o '<title>.*</title>'
echo ""

echo "2. 団員一覧 API"
curl -s http://localhost:3000/api/members | jq -r '.members | length' 2>/dev/null || echo "エラー"
echo "団員"
echo ""

echo "3. ホース格納庫 API"
curl -s http://localhost:3000/api/hose/storages | jq -r '.storages | length' 2>/dev/null || echo "0"
echo "格納庫"
echo ""

echo "4. 活動日誌 API"
curl -s http://localhost:3000/api/activity-logs | jq -r '.logs | length' 2>/dev/null || echo "0"
echo "活動記録"
echo ""

echo "5. ページアクセステスト"
for page in /logs /members /hose /stats /inspection-priority /action-required; do
  status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000$page)
  echo "  $page: $status"
done
echo ""

echo "=== テスト完了 ==="
