# 設計文書（thoughts.json 統一版）

## 概要

AI Assimilation MCP は、Model Context Protocol（MCP）サーバーとして実装され、AIモデル間での体験データ（会話、思考、文脈等）の非同期交換を可能にします。本システムは「人格分離型同化」の原則に基づき、体験データをJSON形式で構造化し、ファイルベースでの永続化と共有を実現します。

- 人格分離型同化: メインAIは自我・価値観・判断基準を保持しつつ、ソースAIの体験・推論過程のみを積極的に吸収する。
- データ交換はファイルベース（JSON）で、MCPツールは生成・検証・一覧などのユーティリティ機能を提供。ファイルの解釈・同化はメインAIが主体で行う。

## アーキテクチャ

- プレゼンテーション層: MCPツール（CLI/プロトコル）
- データ処理層: ファイル操作、データ検証、整合性チェック（AI不使用）
- データアクセス層: 体験ディレクトリ管理
- ストレージ層: experiences/experience_<session_id>/ 配下のファイル群

MCPサーバーの責任（AI不使用）
- 体験データのエクスポート処理（ディレクトリ・ファイル作成）
- データ形式の検証と整合性チェック
- 体験データディレクトリの一覧・検索
- 安全なファイル操作・パス検証

メインAIの責任
- 体験データファイルの直接読み込みと解釈
- 読み込み量と順序の自己制御
- 自身の人格を通じた再解釈と統合判断

## MCPツール（現行実装）

1) get_export_status
- 目的: 指定セッションのエクスポート状態を確認（not_found/initializing/in_progress/completed）
- 入力: { session_id: string }
- 出力: { status, directory_path, created_files, next_batch_number }

2) export_experience_init
- 目的: セッション初期化、ディレクトリ作成、summary.json 一時保存
- 入力: {
  session_id?: string,
  metadata: object,
  summary: { ai_name: string, ai_context: string, experience_summary: string, experience_flow: string[], main_topics: string[] }
}
- 出力: { success, session_id, directory_path, expected_files }

3) export_experience_conversations
- 目的: 会話履歴のバッチ出力（50件ベース、reasoning必須）
- 入力: { session_id: string, conversations_batch: { user_input: string, ai_response: string, reasoning: string }[], batch_number: number }
- 出力: { success, file_path, processed_count, batch_file_size }

4) export_experience_thoughts
- 目的: 思考・気づき・学びの自由形式記録（スキーマ検証なし）
- 入力: { session_id: string, thoughts: Record<string, any> }
- 出力: { success, file_path }

5) export_experience_finalize
- 目的: manifest.json 生成、summary.json の削除、ディレクトリ情報の集計
- 入力: { session_id: string }
- 出力: { success, directory_path, manifest_path, total_files, total_size, file_list }

6) list_experiences
- 目的: 体験ディレクトリ一覧・概要取得（manifestから抽出）
- 入力: { base_directory?, filters? }
- 出力: { success, experience_directories, directory_summaries }

7) validate_experience
- 目的: ディレクトリ整合性検証（構文/スキーマ/セマンティック/クロスファイル）
- 入力: { directory_path: string }
- 出力: DirectoryValidationResult

8) get_ai_experience_export_guide
- 目的: ソースAI向け、良い体験データの作り方ガイド
- 入力: {}
- 出力: { success, guide_content }

9) get_ai_experience_import_guide
- 目的: メインAI向け、同化ガイド
- 入力: {}
- 出力: { success, guide_content }

## エクスポートの実行フロー（ソースAI）

1. export_experience_init → ディレクトリ作成、summary.json 一時保存
2. export_experience_conversations（複数回可） → conversations_001.json 等を出力
3. export_experience_thoughts → thoughts.json を出力（自由形式）
4. export_experience_finalize → manifest.json 生成、summary.json 削除
5. 必要に応じて get_export_status で状態確認

## インポート（同化）の実行フロー（メインAI）

1. list_experiences で候補探索、validate_experience で健全性確認
2. ファイルを直接読み込む順序（推奨）
   - 1) manifest.json（全体像）
   - 2) thoughts.json（最重要の同化素材）
   - 3) conversations_XXX.json（具体的実装・推論の事例）
3. 自分の人格・価値観を保持しつつ、thoughtsの知見や reasoning を自身の手法へ統合

## データモデル

### ディレクトリ構成

```
experience_<session_id>/
├── manifest.json          # メタデータ統合ファイル
├── conversations_001.json # 会話バッチ1（1-50件、reasoning必須）
├── conversations_002.json # 会話バッチ2（51-100件、reasoning必須）
└── thoughts.json          # 思考・気づき・学び（自由形式）
```

### manifest.json（ExperienceMetadata）

必須フィールド
- mcp_version: string
- ai_name: string
- ai_context: string
- experience_summary: string
- experience_flow: string[]
- files: { conversations: string[]; thoughts: string }
- main_topics: string[]
- total_conversations: number

任意フィールド
- session_id?: string
- created_at?: string
- ai_model?: string
- duration?: string
- platform?: string
- custom_metadata?: Record<string, any>

例（抜粋）
```json
{
  "mcp_version": "1.0.0",
  "ai_name": "実用性重視の設計パートナーClaude",
  "ai_context": "協調的Spec作成支援・反復的要件整理エージェント",
  "experience_summary": "対話を通じて仕様を実践的に整理した体験",
  "experience_flow": ["要件定義", "設計", "実装"],
  "files": {
    "conversations": ["conversations_001.json"],
    "thoughts": "thoughts.json"
  },
  "main_topics": ["過度な設計を避ける判断基準", "実用的統合"],
  "total_conversations": 2,
  "session_id": "session-123",
  "created_at": "2024-01-07T14:30:22Z",
  "custom_metadata": { "platform": "kiro" }
}
```

### conversations_XXX.json（ConversationBatch）

必須
- batch_info: { batch_number: number; count: number; start_index?: number; end_index?: number }
- conversations: Conversation[]
- Conversation 必須: { user_input: string; ai_response: string; reasoning: string }

推奨/任意
- 各会話に timestamp, confidence, context など追加可（スキーマは additionalProperties: true）

例（抜粋）
```json
{
  "batch_info": { "batch_number": 1, "count": 2, "start_index": 1, "end_index": 2 },
  "conversations": [
    { "user_input": "q1", "ai_response": "a1", "reasoning": "r1" },
    { "user_input": "q2", "ai_response": "a2", "reasoning": "r2" }
  ]
}
```

### thoughts.json（自由形式・最重要）

- スキーマ検証なし（自由形式の JSON）。AIが自身の重要な思考・気づき・学び・反省・驚きなどを記す。
- 構造例（推奨、必須ではない）
```json
{
  "insights": [{ "topic": "test", "insight": "it works", "timestamp": "2024-01-01T00:00:00Z" }],
  "patterns": [{ "pattern_type": "problem_solving", "description": "step-by-step" }],
  "preferences": { "user_preferences": { "theme": "dark" } },
  "reflections": "今回の体験で気づいたこと..."
}
```
- メインAIはまず thoughts.json を通じて「思考パターン・判断基準」の骨格を同化し、必要に応じて会話で具体化を確認する。

## 検証方針（AJV + Zod）

- manifest.json: AJV で厳格検証（追加プロパティ許容）。
- conversations_XXX.json: AJV で検証＋件数のセマンティック警告（count と配列長の差異）。
- thoughts.json: 構文のみ（null/undefined はエラー）。
- ディレクトリ検証: ファイル存在、各ファイルの検証、クロスファイル整合性（総会話件数と manifest の一致）をチェック。

## エラーハンドリング

- FileError/ValidationError/SecurityError 等のカスタムエラーを階層化。
- ErrorHandler でMCP応答へ整形。
- セキュリティ: セッションIDのパストラバーサル防止、サイズ上限、権限チェック。

## テスト戦略（現行）

- 単体: データ検証（manifest/conversations/thoughts）、get_export_status。
- E2E: init → conversations → thoughts → finalize → status の流れを検証。

## ベストプラクティス（要点）

- ソースAI: reasoning を会話ごとに付与。thoughts には判断基準・学びを生々しく記録。
- メインAI: 読み込み順は manifest → thoughts → conversations。自分の視点で再解釈し、表層模倣を避ける。

## 付録：ツール登録（サーバ側）

- src/index.ts にて9ツールを登録済み: get_export_status, export_experience_init, export_experience_conversations, export_experience_thoughts, export_experience_finalize, list_experiences, validate_experience, get_ai_experience_export_guide, get_ai_experience_import_guide

