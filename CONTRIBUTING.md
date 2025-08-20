# AI Assimilation MCP について

AI Assimilation MCPは学習・研究目的で公開されているオープンソースプロジェクトです。このドキュメントでは、プロジェクトの利用方法について説明します。

## 利用について

### 自由な利用・改変
このプロジェクトはMITライセンスの下で公開されており、以下のような利用が可能です：

- **フォーク**: 自由にフォークして独自の改良を加えてください
- **改変**: あなたのニーズに合わせて自由に修正してください
- **再配布**: 改変版を含めて自由に再配布できます
- **商用利用**: 商用プロジェクトでも自由に利用できます

### 開発環境のセットアップ

```bash
# リポジトリのフォーク・クローン
git clone https://github.com/your-username/ai-assimilation-mcp.git
cd ai-assimilation-mcp

# 依存関係のインストール
npm install

# ビルド
npm run build

# テスト実行
npm test

# 開発モードで実行
npm run dev
```

## 開発ガイドライン

### コードスタイル

- **TypeScript**: 厳密な型定義を使用
- **ESLint**: 設定されたルールに従う
- **Prettier**: コードフォーマットは自動適用
- **命名規則**: camelCase（変数・関数）、PascalCase（クラス・型）

### ディレクトリ構造

```
src/
├── index.ts           # メインエントリーポイント
├── tools/             # MCPツール実装
├── server/            # サーバーロジック
├── utils/             # ユーティリティ関数
├── types/             # TypeScript型定義
├── config/            # 設定ファイル
└── __tests__/         # テストファイル
```

### テスト

- **Jest**: テストフレームワーク
- **カバレッジ**: 新機能には必ずテストを追加
- **命名**: `*.test.ts` または `*.spec.ts`

```bash
# 全テスト実行
npm test

# ウォッチモード
npm run test:watch

# カバレッジ確認
npm test -- --coverage
```

## Issue・プルリクエストについて

### 重要な注意事項

**このリポジトリへのIssue報告やプルリクエストは推奨しません。**

理由：
- メンテナンスリソースの制約により、Issue・PRへの対応ができない可能性が高いです
- 迅速な問題解決が必要な場合、フォークして独自に修正することを強く推奨します

### 推奨される利用方法

1. **フォークして独自開発**: あなた自身のリポジトリでメンテナンス
2. **コミュニティフォーク**: 有志によるメンテナンス版の利用
3. **学習・参考**: コードを参考にした独自実装

### 自己解決のためのリソース

- **README.md**: 基本的な使用方法
- **テストコード**: 動作例と期待される挙動
- **型定義**: TypeScriptによる詳細な仕様
- **コメント**: コード内の詳細な説明

## コミットメッセージ

以下の形式を推奨します：

```
type(scope): description

[optional body]

[optional footer]
```

### Type
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント更新
- `style`: コードスタイル修正
- `refactor`: リファクタリング
- `test`: テスト追加・修正
- `chore`: その他の変更

### 例
```
feat(tools): add export_experience_init tool

- Add UUID-based export session management
- Implement directory structure creation
- Add comprehensive input validation

Closes #123
```

## MCPツールの追加

新しいMCPツールを追加する場合：

1. `src/tools/` に新しいファイルを作成
2. Zodスキーマで入力検証を定義
3. 詳細なドキュメントコメントを追加
4. `src/index.ts` でツールを登録
5. テストファイルを作成
6. README.md を更新

### ツールテンプレート

```typescript
/**
 * Your Tool Name
 * Tool description
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Input schema validation
export const yourToolSchema = z.object({
  // Define your schema here
});

export type YourToolInput = z.infer<typeof yourToolSchema>;

export interface YourToolOutput {
  success: boolean;
  // Define your output structure
  error?: string;
}

export const yourTool = {
  name: 'your_tool_name',
  description: `Detailed description of your tool`,
  input_schema: yourToolSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    // Implementation here
  }
};
```

## トラブルシューティング

問題が発生した場合の自己解決方法：

### 1. テストコードを参考にする
```bash
# テスト実行で動作例を確認
npm test

# 特定のテストのみ実行
npm test -- --testNamePattern="exportFlow"
```

### 2. デバッグモードで実行
```bash
# デバッグログを有効化
DEBUG_MCP=true npm run dev
```

### 3. 型定義を確認
- `src/types/` ディレクトリの型定義
- 各ツールの入力・出力スキーマ
- Zodスキーマによる検証ルール

### 4. 既存のコードを参考にする
- `src/tools/` の実装例
- `src/__tests__/` のテストケース
- `src/index.ts` のメインサーバー実装

## コミュニティ

- **フォーク版**: 他の開発者によるメンテナンス版を探す
- **学習コミュニティ**: MCPやAI関連のコミュニティで質問
- **独自実装**: このプロジェクトを参考にした独自の実装

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。自由に利用・改変・再配布してください。

### 免責事項

- このソフトウェアは「現状のまま」提供されます
- 作者は一切の保証を行いません
- 利用によって生じた損害について作者は責任を負いません
- サポートやメンテナンスは保証されません

### 推奨事項

- 本格的な利用前に十分なテストを実施してください
- 重要なシステムでの利用前にフォークして独自メンテナンスを検討してください
- セキュリティ要件がある場合は独自の監査を実施してください