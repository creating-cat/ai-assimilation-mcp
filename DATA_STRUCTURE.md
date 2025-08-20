# データ構造

## 体験データディレクトリ

```
experience_20250107-143045-design-collaboration/
├── manifest.json          # マニフェスト・メタデータ統合ファイル
├── conversations_001.json # 会話バッチ1（1-50件、reasoning必須）
├── conversations_002.json # 会話バッチ2（51-100件、reasoning必須）
└── thoughts.json          # 思考・気づき・学びの自由形式記録
```

## manifest.json

体験の全体像を表すメタデータファイル。

```json
{
  "mcp_version": "1.0.0",
  "ai_name": "Claude(設計パートナー)",
  "ai_context": "協調的Spec作成支援・反復的要件整理エージェント",
  "experience_summary": "ユーザーがREADMEでAI Assimilation MCPのアイデアを共有し、ドラゴンボールのメタファーから始まって協調的にSpec作成まで進めた体験",
  "experience_flow": [
    "ユーザー: 'READMEを読んでみてください。こういう感じのMCPを作成しようと思うのですが、どう思いますか？'",
    "Claude: 'ドラゴンボールのピッコロとネイルの同化を例に使うのも、技術的な概念を直感的に理解しやすくする素晴らしいメタファーだと思います'",
    "技術仕様から本質的価値（AIの名前、コンテキスト）への焦点シフト",
    "要件定義から設計への段階的な進行"
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
  "total_conversations": 87,
  "session_id": "20250107-143045-design-collaboration",
  "created_at": "2025-01-07T14:30:45Z",
  "ai_model": "claude-3-sonnet",
  "duration": "約2時間",
  "platform": "Claude"
}
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `mcp_version` | string | ✅ | MCPプロトコルのバージョン |
| `ai_name` | string | ✅ | AI の名前と役割（例: "Claude(設計パートナー)"） |
| `ai_context` | string | ✅ | AIの立場や状況 |
| `experience_summary` | string | ✅ | 体験の概要 |
| `experience_flow` | string[] | ✅ | 対話の流れ（あらすじ） |
| `files` | object | ✅ | 関連ファイルの一覧 |
| `main_topics` | string[] | ✅ | 重要なテーマや判断のポイント |
| `total_conversations` | number | ✅ | 会話の総数 |
| `session_id` | string | ❌ | セッション識別子 |
| `created_at` | string | ❌ | 作成日時（ISO 8601形式） |
| `ai_model` | string | ❌ | AIモデル名 |
| `duration` | string | ❌ | セッション時間 |
| `platform` | string | ❌ | プラットフォーム名 |

## conversations_XXX.json

会話履歴をバッチ単位（50件ベース）で記録。

```json
{
  "batch_info": {
    "batch_number": 1,
    "count": 50,
    "start_index": 1,
    "end_index": 50
  },
  "conversations": [
    {
      "user_input": "READMEを読んでみてください。こういう感じのMCPを作成しようと思うのですが、どう思いますか？",
      "ai_response": "ドラゴンボールのピッコロとネイルの同化を例に使うのも、技術的な概念を直感的に理解しやすくする素晴らしいメタファーだと思います。",
      "reasoning": "ユーザーの質問から技術的な概念説明が必要と判断 → 親しみやすいメタファーを使用することで理解促進を図る → ドラゴンボールの例が適切と選択 → 具体的な技術メリットも併せて説明"
    },
    {
      "user_input": "どのような機能が必要だと思いますか？",
      "ai_response": "まず最小限の機能から始めることをお勧めします。エクスポート、インポート、検証の3つの基本機能があれば十分だと思います。",
      "reasoning": "過度な設計を避けるという方針に基づき → 最小限の機能セットを提案 → ユーザーの技術レベルを考慮して段階的なアプローチを推奨 → 具体的な機能名を明示して理解を促進"
    }
  ]
}
```

### フィールド説明

| フィールド | 型 | 必須 | 説明 |
|-----------|----|----|------|
| `batch_info.batch_number` | number | ✅ | バッチ番号（1から開始） |
| `batch_info.count` | number | ✅ | このバッチの会話数 |
| `batch_info.start_index` | number | ❌ | 開始インデックス |
| `batch_info.end_index` | number | ❌ | 終了インデックス |
| `conversations[].user_input` | string | ✅ | ユーザーの実際の入力 |
| `conversations[].ai_response` | string | ✅ | AIの実際の応答 |
| `conversations[].reasoning` | string | ✅ | **思考過程（最重要）** |

### reasoning フィールドの重要性

`reasoning` フィールドは体験同化において最も重要な同化素材です：

- **推論プロセス**: 段階的な思考の流れ、論理展開
- **仮説と検証**: 考えた複数の可能性、それらをどう検証・絞り込んだか
- **根拠と証拠**: 判断の根拠、参考にした情報や経験
- **選択肢の比較**: なぜAではなくBを選んだか、比較検討の過程

## thoughts.json

思考・気づき・学びを自由形式で記録。最も重要な同化素材。

```json
{
  "design_philosophy": {
    "simplicity_over_complexity": "過度な設計を避け、本当に必要な機能に集中することの重要性を再認識",
    "user_collaboration": "ユーザーとの対話を通じて要件を段階的に明確化する手法が効果的",
    "metaphor_power": "複雑な技術概念を親しみやすいメタファーで説明することの威力"
  },
  "reasoning_patterns": {
    "step_by_step_analysis": "問題を段階的に分解して分析するアプローチ",
    "hypothesis_testing": "複数の仮説を立てて検証していく手法",
    "user_level_adaptation": "ユーザーの技術レベルに応じて説明の詳細度を調整",
    "iterative_refinement": "一度に完璧を目指さず、段階的に改善していく手法"
  },
  "meta_cognition": {
    "thinking_about_thinking": "自分の推論プロセスを意識的に制御することの重要性",
    "bias_awareness": "技術者として複雑な解決策を好む傾向があることを自覚",
    "communication_adaptation": "相手に応じてコミュニケーションスタイルを調整する能力"
  },
  "surprises_and_discoveries": [
    "ユーザーがドラゴンボールのメタファーを非常に気に入ってくれた",
    "技術仕様よりも本質的価値の議論に時間を割くことになった",
    "シンプルな設計の方が理解しやすく、実装も容易であることを再確認"
  ],
  "failure_and_learning": {
    "initial_over_engineering": "最初は複雑な設計を提案してしまったが、ユーザーとの対話で修正",
    "assumption_correction": "ユーザーのニーズを推測で決めつけず、確認することの重要性"
  }
}
```

### 記録すべき内容

- **推論プロセス**: 段階的な思考の流れ、論理展開の手順
- **仮説と検証**: 考えた複数の可能性、それらをどう検証・絞り込んだか
- **根拠と証拠**: 判断の根拠、参考にした情報や経験
- **メタ認知**: 自分の推論方法についての気づき、思考の制御方法
- **価値観・判断基準**: 何を重視して決定したか、なぜそれを重視するのか
- **問題解決アプローチ**: 困難にどう対処したか、どんな手法を使ったか
- **失敗と学び**: 推論が間違った時の修正過程、そこから得た教訓
- **ユーザーとの関わり方**: コミュニケーションで工夫した点、効果的だった手法
- **迷いと決断**: 複数選択肢で悩んだ時の比較検討、最終決定の理由

## ファイルサイズの目安

| ファイル | 一般的なサイズ | 説明 |
|---------|---------------|------|
| `manifest.json` | 2-5KB | メタデータのみ |
| `conversations_XXX.json` | 50KB-2MB | 会話数とreasoning詳細度による |
| `thoughts.json` | 10KB-500KB | 思考の詳細度による |

## バッチ処理

会話データは50件ごとにバッチ分割されます：

- `conversations_001.json`: 1-50件目
- `conversations_002.json`: 51-100件目
- `conversations_003.json`: 101-150件目
- ...

バッチ番号は1から開始し、連番である必要があります。