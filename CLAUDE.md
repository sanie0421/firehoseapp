# 消防団活動記録アプリ（oifire1）

大井町消防団第一分団の活動記録・団員管理・ホース点検管理アプリ。

## セッション起動方法

```bash
cd ~/firehoseapp && claude --remote-control
```

## アカウント情報

| サービス | アカウント |
|---------|-----------|
| GitHub | github.com/sanie0421 |
| Cloudflare | fumiya89@gmail.com |
| Anthropic API | Cloudflare環境変数 `ANTHROPIC_API_KEY` に設定済み |

## 本番環境

- **アプリURL**: https://oifire1.pages.dev/
- **Cloudflare Pages プロジェクト名**: oifire1
- **D1 DB**: `webapp-production`（ID: `fcab2e99-79f4-43ec-af35-ffc45a4c0f2b`）
- **R2 バケット**: `oifire1-images`

## 技術スタック

- **フレームワーク**: Hono + Vite + TypeScript
- **ホスティング**: Cloudflare Pages
- **DB**: Cloudflare D1（SQLite互換）
- **画像ストレージ**: Cloudflare R2
- **ビルド**: `@hono/vite-build`
- **メインファイル**: `src/index.tsx`（約11,000行モノリス）

## デプロイ方法（重要）

**GitHub自動デプロイは機能していない。必ずwrangler CLIで手動デプロイすること。**

```bash
cd ~/firehoseapp
npm run build && npx wrangler pages deploy dist --project-name oifire1
```

## Notion管理ページ

- **開発管理**: https://www.notion.so/32dcde33053581fc9df6ff0c852d8192
- **AI機能引き継ぎ**: https://www.notion.so/334cde33053581b7bed0c888b875bda5

## 確定した設計決定

- 全ページ・全APIを `src/index.tsx` 1ファイルに集約（モノリス構成）
- ヘッダーは赤グラデーション統一: `background:linear-gradient(135deg,#c0392b 0%,#96281b 100%)`
- 在籍年数は欠席期間を差し引いた実質年数で表示
- 欠席期間の `end_date` 未設定 → `9999-12-31` で保存し、表示時は currentFiscalYear として扱う
- 年度は4月始まり（4月〜翌3月）で計算

## DBスキーマ注意点

- `absence_periods` テーブル: カラムは `member_id`（`user_id` ではない）、`dan_id`（NOT NULL、値は `1` 固定）
- D1マイグレーションファイルは `migrations/` ディレクトリ
- マイグレーション適用コマンド:
  ```bash
  npx wrangler d1 execute webapp-production --remote --file=migrations/[ファイル名].sql
  ```

## 残課題

- 要対応事項の「内容編集」: 削除は実装済み、content の編集は未実装
- 在籍年表「在籍年数 ▼」ヘッダークリックのソートが動作しない（未調査）
- パスワード認証: 実装したが動作せず削除。原因不明、再実装必要
- AIチャットボット（条例・マニュアルのナレッジベース型）: 未実装
- 車両報告書機能: 未実装

## 開発ルール

- コミュニケーションは日本語
- コード・コメントは日本語OK
- 変更後は必ずビルド＆wranglerデプロイまで実行すること
- Notionの開発管理ページと `CLAUDE.md` を常に最新状態に保つ
