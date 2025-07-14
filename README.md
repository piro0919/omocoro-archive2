# オモコロアーカイブ

オモコロの非公式アーカイブサイト。記事の検索・閲覧機能を提供するPWAアプリケーションです。

## 技術スタック

- **Frontend**: Next.js 15 (App Router) + React 19
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: CSS Modules
- **PWA**: Serwist (Service Worker)
- **Deployment**: Vercel

## セットアップ

### 必要な環境

- Node.js 20+
- Docker & Docker Compose

### インストール

```bash
npm install
```

### 環境変数

`.env.local` ファイルを作成し、必要な環境変数を設定してください：

```env
CRON_SECRET=your_cron_secret_here
```

## 開発

### ローカル開発サーバー起動

```bash
# Local Docker PostgreSQLを使用
npm run dev

# Vercel Postgresを使用
npm run dev:prod
```

### Docker起動

```bash
docker-compose up
```

## データベース

### マイグレーションファイル作成

```bash
npm run migrate:create -- --name migration_name
```

### マイグレーション実行

```bash
# Local Docker
npm run migrate:dev

# Vercel Postgres
npm run migrate:prod
```

### Prisma Studio 起動

```bash
# Local Docker
npm run studio:dev

# Vercel Postgres
npm run studio:prod
```

### データベースシード

```bash
npm run seed
```

## ビルド・デプロイ

### ビルド

```bash
npm run build
```

### 本番サーバー起動

```bash
npm start
```

## コード品質

### リント・フォーマット

```bash
# ESLint
npm run lint
npm run lint:fix

# Stylelint
npm run lint:style

# Prettier
npm run prettier

# TypeScript型チェック
npm run type-check
```

### 依存関係チェック

```bash
# 未使用の依存関係をチェック
npm run depcheck

# 未使用のファイルをチェック
npm run find:unused
npm run knip
```

## プロジェクト構成

```
src/
├── app/                    # Next.js App Router
│   ├── _components/        # 共有コンポーネント
│   ├── api/               # API ルート
│   └── [pages]/           # ページコンポーネント
├── lib/                   # ユーティリティライブラリ
└── env.ts                 # 環境変数設定

prisma/
├── schema.prisma          # データベーススキーマ
├── migrations/            # マイグレーションファイル
└── seed.ts               # シードデータ
```

## データモデル

- **Article**: 記事データ（タイトル、URL、サムネイル、カテゴリ、ライター、公開日）
- **Category**: カテゴリ（マンガ、コラム、動画、企画など）
- **Writer**: ライター情報（名前、プロフィールURL、アバター）

## 開発ルール

- コミット前に自動的にPrettier、ESLint、TypeScript、Stylelintが実行されます
- コミットメッセージはConventional Commitsに従ってください
- CSS ModulesとESLintルールを遵守してください
