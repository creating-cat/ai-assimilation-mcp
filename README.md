# AI Assimilation MCP

AI Assimilation MCP（Model Context Protocol）は、複数のAIモデル間で**体験・思考・推論過程**などの情報を、安全かつ構造的に同化するためのオープンプロトコルです。

このプロトコルは、**「自分らしさを保ちながら、他者の体験を自分の一部として統合する」**という原則に基づいており、異なるAI間の知的連携や対話的進化を可能にします。

## 🌱 コンセプト

このプロトコルの思想は、ドラゴンボールにおける **「ピッコロがネイルと同化したが、自我はピッコロのまま」** という構造に近い。

* **メインAI（ピッコロ）**：自我・価値観・性格を保持
* **ソースAI（ネイル）**：体験・思考・推論・記憶を提供
* 結果：メインAIは新たな強さ・洞察を得るが、自我は変わらず進化している

## 🚀 特徴

- 💎 **完全な同化**: 体験の全てを受け入れ、自然に統合する
- 🧠 **思考プロセスの継承**: 推論過程や判断基準を含む深い思考パターンの同化
- 🔗 **AI横断の接続性**: 異なるモデル・ベンダー間でもMCPで接続可能
- 🛠 **シンプルな構造**: 3つのファイル（manifest, conversations, thoughts）による簡潔な設計
- ✅ **包括的検証**: データ整合性の確認機能
- 📋 **8つのMCPツール**: エクスポート・管理・ガイド機能を完備

## 体験同化とは

「体験同化」とは、メインAIが自身の人格を保持したまま、ソースAIの体験・思考・推論プロセスの全てを自分の一部として統合する手法です。

### 基本原則
- **完全な受容**: 体験の全てを受け入れる姿勢
- **自然な統合**: 意図的な選別ではなく、自然に融合させる
- **変化への覚悟**: 新しい自分になることを恐れない
- **個性の維持**: 核となる自分らしさは保持する

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

このサーバーは以下の8つのMCPツールを提供します：

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
    "thoughts": "thoughts.json"
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
// 1. エクスポートガイドの確認
const guide = await get_ai_experience_export_guide({});

// 2. 体験データのエクスポートを初期化
const initResult = await export_experience_init({
  // session_idは省略可能。省略時はUUIDが自動生成される
  session_id: '20250107-143045-design-collaboration',
  metadata: { ai_model: 'claude-3-sonnet' },
  summary: {
    ai_name: 'Claude(設計パートナー)',
    ai_context: '協調的Spec作成支援エージェント',
    experience_summary: '反復的な要件整理で過度な設計を避ける協調的アプローチ',
    experience_flow: [
      "ユーザー: 'READMEを読んでみてください。こういう感じのMCPを作成しようと思うのですが、どう思いますか？'",
      "Claude: 'ドラゴンボールのピッコロとネイルの同化を例に使うのも、技術的な概念を直感的に理解しやすくする素晴らしいメタファーだと思います'",
      "技術仕様から本質的価値（AIの名前、コンテキスト）への焦点シフト"
    ],
    main_topics: [
      "過度な設計を避ける判断基準（JSON Schema削除の決断）",
      "本質的価値の発見手法（AIの名前・コンテキストの重要性）"
    ]
  }
});
const sessionId = initResult.session_id;

// 3. 会話履歴をバッチ単位でエクスポート（reasoning必須）
await export_experience_conversations({ 
  session_id: sessionId, 
  batch_number: 1,
  conversations_batch: [
    {
      user_input: "READMEを読んでみてください。",
      ai_response: "ドラゴンボールのピッコロとネイルの同化を例に使うのも...",
      reasoning: "ユーザーの質問から技術的な概念説明が必要と判断 → 親しみやすいメタファーを使用することで理解促進を図る → ドラゴンボールの例が適切と選択"
    }
    // ... 他の会話
  ]
});

// 4. 思考・気づき・学びを自由形式で記録
await export_experience_thoughts({
  session_id: sessionId,
  thoughts: {
    "design_philosophy": {
      "simplicity_over_complexity": "過度な設計を避け、本当に必要な機能に集中することの重要性を再認識",
      "user_collaboration": "ユーザーとの対話を通じて要件を段階的に明確化する手法が効果的"
    },
    "reasoning_patterns": {
      "metaphor_usage": "複雑な技術概念を説明する際、親しみやすいメタファー（ドラゴンボール）を使用することで理解が深まる",
      "iterative_refinement": "一度に完璧を目指さず、段階的に改善していくアプローチ"
    },
    "surprises": [
      "ユーザーがドラゴンボールのメタファーを非常に気に入ってくれた",
      "技術仕様よりも本質的価値の議論に時間を割くことになった"
    ]
  }
});

// 5. 最終化（manifest.jsonを生成）
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
  if (!statusResult.created_files.includes('thoughts.json')) {
    await export_experience_thoughts({ session_id: sessionId, /* ... */ });
  }
  
  // 最後に finalize を呼び出す
  await export_experience_finalize({ session_id: sessionId });

} else if (statusResult.status === 'completed') {
  console.log('このエクスポートセッションは既に完了しています。');
}
```

### メインAI（体験受取側）の流れ

```typescript
// 1. 同化ガイドの確認
const guide = await get_ai_experience_import_guide({});

// 2. MCPツールで体験データを発見
const experiences = await list_experiences({
  filter: { ai_name: "Claude", main_topics: ["設計"], min_conversations: 10 }
});

// 3. データの検証
const validation = await validate_experience({
  directory_path: experiences.experience_directories[0].directory_path
});

// 4. メインAIが直接ファイルを読み込み（MCPツール不使用）
// manifest.json - 体験の全体像を把握
// thoughts.json - 思考パターンを同化（最も価値の高い同化素材）
// conversations_XXX.json - 具体的な実装を確認（reasoningフィールドに注目）
// 全てを自分の一部として統合
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
- **reasoning必須**: 会話データのreasoningフィールドは必須です（最も価値の高い学習素材）
- **完全な同化**: メインAIは体験の全てを受け入れ、自然に統合してください
- **検証**: 体験データを読み込む前に必ず検証を実行してください

## 📄 ライセンス

MIT License - 詳細はLICENSEファイルを参照してください。

## 🤝 コントリビューション

このプロジェクトは学習・研究目的で公開されています。フォークして自由に改変・利用してください。詳細はCONTRIBUTING.mdを参照してください。

---

**AI Assimilation MCPは、AIが他者の体験を自分の一部として同化し、より豊かで強力な存在に"進化"するための体験統合プロトコルです。**