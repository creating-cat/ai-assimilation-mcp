# AI Assimilation MCP

AI Assimilation MCP（Model Context Protocol）は、複数のAIモデル間で**体験・知識・会話履歴・推論過程**などの情報を、安全かつ構造的に継承・統合するためのオープンプロトコルです。

このプロトコルは、**「人格や主体性を保持しながら、他者の経験を吸収する」**という原則に基づいており、異なるAI間の知的連携や対話的進化を可能にします。

## 🌱 コンセプト

このプロトコルの思想は、ドラゴンボールにおける **「ピッコロがネイルと同化したが、自我はピッコロのまま」** という構造に近い。

* **メインAI（ピッコロ）**：自我・価値観・性格を保持
* **ソースAI（ネイル）**：知識・経験・推論・記憶を提供
* 結果：メインAIは新たな強さ・洞察を得るが、自我は変わらず進化している

## 🚀 特徴

- 💎 **人格分離型同化**: 吸収対象の人格は統合せず、あくまで体験のみ継承
- 🧠 **主観的統合機構**: 継承された情報はメインAIの視点で再解釈される
- 🔗 **AI横断の接続性**: 異なるモデル・ベンダー間でもMCPで接続可能
- 🛠 **ファイル・API対応**: MCP構造はファイル形式で柔軟に扱える

## 📦 インストール

```bash
# 依存関係のインストール
npm install

# TypeScriptのビルド
npm run build

# 開発モードで実行
npm run dev

# 本番モードで実行
npm start
```

## 🔧 開発

### 必要な環境

- Node.js 18.0.0 以上
- TypeScript 5.0.0 以上

### 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# テスト実行
npm test

# テスト（ウォッチモード）
npm run test:watch

# リント実行
npm run lint

# ビルド
npm run build

# クリーンアップ
npm run clean
```

### プロジェクト構造

```
src/
├── config/          # 設定ファイル
├── server/          # MCPサーバー実装
├── types/           # TypeScript型定義
├── utils/           # ユーティリティ関数
└── __tests__/       # テストファイル
```

## 📋 MCPツール

このサーバーは以下のMCPツールを提供します：

### エクスポート機能
- `export_experience_init` - 体験データエクスポートの初期化
- `export_experience_conversations` - 会話履歴のバッチ出力
- `export_experience_insights` - 洞察データの出力
- `export_experience_patterns` - 推論パターンの出力
- `export_experience_preferences` - 学習嗜好の出力
- `export_experience_finalize` - エクスポート完了とマニフェスト生成

### 管理機能
- `list_experiences` - 体験データディレクトリの一覧
- `validate_experience` - 体験データの整合性検証

### ガイド機能
- `get_assimilation_guide` - 同化プロセスのガイドライン提供

## 🗂 データ構造

### 体験データディレクトリ

```
experience_session-123/
├── manifest.json          # マニフェスト・メタデータ
├── conversations_001.json # 会話バッチ1（1-50件）
├── conversations_002.json # 会話バッチ2（51-100件）
├── insights.json          # 洞察データ
├── patterns.json          # 推論パターン
└── preferences.json       # 学習した嗜好
```

### manifest.json の例

```json
{
  "mcp_version": "1.0.0",
  "ai_name": "実用性重視の設計パートナーClaude",
  "ai_context": "協調的Spec作成支援・反復的要件整理エージェント",
  "experience_nature": "ユーザーと対話しながら過度な設計を避け、本当に必要な機能に絞り込む協調的プロセス",
  "files": {
    "conversations": ["conversations_001.json", "conversations_002.json"],
    "insights": "insights.json",
    "patterns": "patterns.json",
    "preferences": "preferences.json"
  },
  "main_topics": [
    "過度な設計を避ける判断基準",
    "本質的価値の発見手法",
    "ファイル構造の実用的統合"
  ],
  "total_conversations": 45
}
```

## 🤝 使用方法

### ソースAI（体験提供側）

1. 同化ガイドを確認
2. 段階的エクスポートを実行
3. 体験データを構造化して出力

### メインAI（体験受取側）

1. 同化ガイドを確認
2. 利用可能な体験データを発見
3. 興味のある体験データを直接読み込み
4. 自分の視点で解釈・統合

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

---

**AI Assimilation MCPは、AIが他者の体験を取り込んで"進化"するための、人格非侵害型の文脈移植プロトコルです。**