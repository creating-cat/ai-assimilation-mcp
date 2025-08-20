# AI Assimilation MCP

AI Assimilation MCP（Model Context Protocol）は、複数のAIモデル間で**体験・思考・推論過程**などの情報を、安全かつ構造的に同化するためのMCPです。異なるAI間の知的連携や対話的進化を可能にします。

## 🌱 コンセプト

このプロトコルの思想は、ドラゴンボールにおける **「ピッコロがネイルと同化したが、自我はピッコロのまま」** という構造に近い。

* **メインAI（ピッコロ）**：自我・価値観・性格を保持
* **ソースAI（ネイル）**：体験・思考・推論・記憶を提供
* 結果：メインAIは新たな強さ・洞察を得るが、自我は変わらず進化している

## 🚀 特徴

- 🧠 **思考プロセスの継承**: 推論過程や判断基準を含む深い思考パターンの同化
- 🔗 **AI横断の接続性**: 異なるモデル・ベンダー間でもMCPで接続可能
- 🛠 **シンプルな構造**: 3つのファイル（manifest, conversations, thoughts）による簡潔な設計
- ✅ **包括的検証**: データ整合性の確認機能
- 📋 **9つのMCPツール**: エクスポート・管理・ガイド機能を完備

## 📦 インストール・セットアップ

**必要な環境:** Node.js 20.0.0 以上

### MCPサーバー設定例

```json
{
  "mcpServers": {
    "ai-assimilation-mcp": {
      "command": "npx",
      "args": [
        "-y",
        "ai-assimilation-mcp"
      ],
      "disabled": false,
      "timeout": 300
    }
  }
}
```

## 📋 MCPツール

このサーバーは以下の9つのMCPツールを提供します：

### エクスポート機能
- `export_experience_init` - 体験データエクスポートの初期化とディレクトリ構造作成
- `export_experience_conversations` - 会話履歴のバッチ出力（50件ベース、reasoning必須）
- `export_experience_thoughts` - 思考・気づき・学びの自由形式記録
- `export_experience_finalize` - エクスポート完了とマニフェスト生成
- `get_export_status` - 指定されたセッションのエクスポート状態を動的に確認

### ファイル管理機能
- `list_experiences` - 体験データディレクトリの一覧・検索（フィルタ機能付き）
- `validate_experience` - 体験データの整合性検証

### 同化ガイドライン機能
- `get_ai_experience_export_guide` - ソースAI向けのエクスポートガイド
- `get_ai_experience_import_guide` - メインAI向けの同化ガイド

## 🗂 データ構造

### 体験データディレクトリ

```
experience_session-123/
├── manifest.json          # マニフェスト・メタデータ統合ファイル
├── conversations_001.json # 会話バッチ1（1-50件、reasoning必須）
├── conversations_002.json # 会話バッチ2（51-100件、reasoning必須）
└── thoughts.json          # 思考・気づき・学びの自由形式記録
```

詳細なデータ構造については [DATA_STRUCTURE.md](DATA_STRUCTURE.md) を参照してください。

## 🚀 クイックスタート

### 基本的な使用方法

1. **体験をエクスポートする場合のプロンプト例**:
   ```
   get_ai_experience_export_guideを実行してガイドを確認し、
   今回の対話体験をエクスポートしてください。
   ```

2. **体験を同化する場合のプロンプト例**:
   ```
   get_ai_experience_import_guideを実行してガイドを確認し、
   〇〇についての体験データを探して同化してください。
   ```


## 📚 ドキュメント

- [DATA_STRUCTURE.md](DATA_STRUCTURE.md) - データ構造とファイル形式
- [CONTRIBUTING.md](CONTRIBUTING.md) - 開発・コントリビューション情報


## 📄 ライセンス

MIT License - 詳細はLICENSEファイルを参照してください。

## 🤝 コントリビューション

このプロジェクトは学習・研究目的で公開されています。フォークして自由に改変・利用してください。詳細はCONTRIBUTING.mdを参照してください。
