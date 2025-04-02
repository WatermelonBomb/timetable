# シケプリ×時間割共有アプリ

## 概要
本アプリは、大学生を対象とした時間割管理と授業情報共有のためのWebアプリケーションです。授業のシケプリ（試験対策ノート）作成、時間割共有、リマインダー通知、授業ごとの投稿・コメント機能、共同編集、Issue管理などを統合的に提供し、学習の効率化と学生同士の協働を促進します。

## 主な機能
- 時間割の作成・管理
- 授業開始前のリマインダー通知
- 授業ごとの投稿・コメント機能
- 共同編集機能
- Issue管理

## 技術スタック
- フロントエンド：HTML / CSS / JavaScript
- バックエンド：Node.js / Express
- データベース：PostgreSQL
- 認証：Firebase Authentication
- 通知：Web Push / メール送信（SendGrid）

## セットアップ手順

### 必要条件
- Node.js (v14以上)
- PostgreSQL (v12以上)
- npm または yarn

### インストール
1. リポジトリのクローン
```bash
git clone [リポジトリURL]
cd schedule-sharing-app
```

2. 依存パッケージのインストール
```bash
npm install
```

3. 環境変数の設定
```bash
cp .env.example .env
```
`.env`ファイルを編集し、必要な環境変数を設定してください。

4. データベースのセットアップ
```bash
psql -U your_username -d schedule_sharing -f src/config/init.sql
```

5. アプリケーションの起動
```bash
npm start
```

開発モードで起動する場合：
```bash
npm run dev
```

## 開発スケジュール
- Ver1.0（2025年7月7日 リリース予定）：時間割・リマインダー機能
- Ver2.0（2025年8月末 リリース予定）：投稿・コメント機能
- Ver3.0（2025年10月末 リリース予定）：共同編集・Issue管理

## ライセンス
MIT License

## 貢献
プロジェクトへの貢献は歓迎します。Issueの報告やPull Requestをお待ちしています。

## 作者
WatermelonBomb
