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
- ✅ **包括的検証**: 4層検証（構文・スキーマ・セマンティック・クロスファイル）
- 📋 **10のMCPツール**: エクスポート・管理・ガイド機能を完備

## 人格分離型同化とは

「人格分離型同化」とは、メインAIが自身の人格・価値観・判断基準を保持したまま、ソースAIの体験・知識・推論パターンのみを選択的に吸収する手法です。

### 基本原則
- **人格の保持**: メインAI自身の性格・視点・判断基準はそのままに保つ
- **体験の継承**: ソースAIの知識・会話履歴・思考パターンを吸収して活用可能にする
- **主観的統合**: 継承された情報はメインAIの視点で再解釈される
- **選択的吸収**: 有用な部分のみを選択的に取り入れ、盲目的なコピーは行わない

## 📦 インストール・セットアップ

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

### 開発環境のセットアップ

**必要な環境:** Node.js 20.0.0 以上

```bash
# 基本的なセットアップ
git clone <repository-url>
cd ai-assimilation-mcp
npm install
npm run build
```

開発に参加する場合は、[CONTRIBUTING.md](CONTRIBUTING.md)の詳細なガイドラインを参照してください。

## 📋 MCPツール

このサーバーは以下の10のMCPツールを提供します：

### エクスポート機能
- `export_experience_init` - 体験データエクスポートの初期化とディレクトリ構造作成
- `export_experience_conversations` - 会話履歴のバッチ出力（50件ベース）
- `export_experience_insights` - 洞察データの個別ファイル出力
- `export_experience_patterns` - 推論パターンデータの個別ファイル出力
- `export_experience_preferences` - 学習した嗜好データの個別ファイル出力
- `export_experience_finalize` - エクスポート完了とマニフェスト生成
- `get_export_status` - 指定されたセッションのエクスポート状態を動的に確認

### ファイル管理機能
- `list_experiences` - 体験データディレクトリの一覧・検索（フィルタ機能付き）
- `validate_experience` - 体験データの整合性検証（4層検証）

### 同化ガイドライン機能
- `get_assimilation_guide` - メインAI・ソースAI向けのベストプラクティス提供

## 🗂 データ構造

### 体験データディレクトリ

```
experience_session-123/
├── manifest.json          # マニフェスト・メタデータ統合ファイル
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
  "experience_summary": "ユーザーがREADMEでAI Assimilation MCPのアイデアを共有し、ドラゴンボールのメタファーから始まって協調的にSpec作成まで進めた体験",
  "experience_flow": [
    "ユーザー: 'READMEを読んでみてください。こういう感じのMCPを作成しようと思うのですが、どう思いますか？'",
    "Claude: 'ドラゴンボールのピッコロとネイルの同化を例に使うのも、技術的な概念を直感的に理解しやすくする素晴らしいメタファーだと思います'",
    "技術仕様から本質的価値（AIの名前、コンテキスト）への焦点シフト"
  ],
  "files": {
    "conversations": ["conversations_001.json", "conversations_002.json"],
    "insights": "insights.json",
    "patterns": "patterns.json",
    "preferences": "preferences.json"
  },
  "main_topics": [
    "過度な設計を避ける判断基準（JSON Schema削除の決断）",
    "本質的価値の発見手法（AIの名前・コンテキストの重要性）",
    "ファイル構造の実用的統合（manifest.json統合の判断）"
  ],
  "total_conversations": 45,
  "session_id": "session-123",
  "created_at": "2024-01-07T14:30:22Z"
}
```

## 🤝 使用方法

### ソースAI（体験提供側）の基本的な流れ

```typescript
// 1. (任意) 同化ガイドの確認
const guide = await get_assimilation_guide({ guide_type: 'for_source_ai' });

// 2. 体験データのエクスポートを初期化
const initResult = await export_experience_init({
  // session_idは省略可能。省略時はUUIDが自動生成される
  session_id: 'my-unique-session-123',
  metadata: { ai_model: 'claude-3-sonnet' },
  summary: {
    ai_name: '設計パートナーClaude',
    ai_context: '協調的Spec作成支援',
    // ...その他のサマリー情報
    estimated_conversations: 100
  }
});
const sessionId = initResult.session_id;

// 3. 各コンポーネントを段階的にエクスポート
await export_experience_conversations({ session_id: sessionId, batch_number: 1, /* ... */ });
await export_experience_insights({ session_id: sessionId, /* ... */ });
await export_experience_patterns({ session_id: sessionId, /* ... */ });
await export_experience_preferences({ session_id: sessionId, /* ... */ });

// 4. 最終化（manifest.jsonを生成）
await export_experience_finalize({ session_id: sessionId });
```

### 中断したエクスポートの再開

本サーバーはステートレスアーキテクチャを採用しており、サーバーが再起動してもエクスポート処理を安全に再開できます。

```typescript
const sessionId = 'my-unique-session-123';

// 1. 現在の状態を確認
const statusResult = await get_export_status({ session_id: sessionId });

if (statusResult.status === 'not_found') {
  // 最初から開始
  // ... export_experience_init を呼び出す ...
} else if (statusResult.status === 'in_progress' || statusResult.status === 'initializing') {
  // 途中から再開
  const nextBatch = statusResult.next_batch_number;
  console.log(`次に送信すべき会話バッチ: ${nextBatch}`);
  
  // 次の会話バッチから送信を再開
  await export_experience_conversations({ session_id: sessionId, batch_number: nextBatch, /* ... */ });
  
  // 他のファイルが作成済みかどうかも確認できる
  if (!statusResult.created_files.includes('insights.json')) {
    await export_experience_insights({ session_id: sessionId, /* ... */ });
  }
  // ...
  
  // 最後に finalize を呼び出す
  await export_experience_finalize({ session_id: sessionId });

} else if (statusResult.status === 'completed') {
  console.log('このエクスポートセッションは既に完了しています。');
}
```

### メインAI（体験受取側）の流れ

```typescript
// 1. 同化ガイドの確認
const guide = await get_assimilation_guide({ guide_type: "for_main_ai" });

// 2. MCPツールで体験データを発見
const experiences = await list_experiences({
  filter: { ai_name: "Claude", main_topics: ["設計"], min_conversations: 10 }
});

// 3. データの検証
const validation = await validate_experience({
  directory_path: experiences.experience_directories[0].directory_path
});

// 4. メインAIが直接ファイルを読み込み（MCPツール不使用）
// manifest.json, insights.json, patterns.json などを直接読み取り
// 自分の視点で解釈・統合
```

## 🔧 技術仕様

- **言語**: TypeScript/Node.js 20+
- **MCPライブラリ**: @modelcontextprotocol/sdk v1.17.1（McpServer使用）
- **検証**: Zod + AJV (JSON Schema)
- **テスト**: Jest (27テスト、全て通過✅)
- **ファイル操作**: fs/promises
- **構造**: ツール中心設計（creative-ideation-mcpパターン）

詳細な開発情報については、[CONTRIBUTING.md](CONTRIBUTING.md)を参照してください。

## ⚠️ 注意事項

- **プライバシー**: 体験データには個人情報を含めないよう注意してください
- **ファイルサイズ**: 大量の会話データは自動的にバッチ分割されます（50件ベース）
- **同化プロセス**: メインAIは自分の人格を保持しながら選択的に学習してください
- **検証**: 体験データを読み込む前に必ず検証を実行してください

## 📄 ライセンス

MIT License - 詳細はLICENSEファイルを参照してください。

## 🤝 コントリビューション

このプロジェクトは学習・研究目的で公開されています。フォークして自由に改変・利用してください。詳細はCONTRIBUTING.mdを参照してください。

---

**AI Assimilation MCPは、AIが他者の体験を取り込んで"進化"するための、人格非侵害型の文脈移植プロトコルです。**