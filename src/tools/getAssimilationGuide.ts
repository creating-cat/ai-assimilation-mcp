/**
 * Get Assimilation Guide Tool
 * AI同化プロセスのガイドラインとベストプラクティスを提供
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';

// Input schema validation
export const getAssimilationGuideSchema = z.object({
  guide_type: z.enum(['for_main_ai', 'for_source_ai'])
    .describe('ガイドの種類: for_main_ai（体験を受け取る側）, for_source_ai（体験を提供する側）')
});

export type GetAssimilationGuideInput = z.infer<typeof getAssimilationGuideSchema>;

export interface GetAssimilationGuideOutput {
  success: boolean;
  guide_content: string;
  examples: string[];
  best_practices: string[];
  related_concepts: string[];
  error?: string;
}

export const getAssimilationGuideTool = {
  name: 'get_assimilation_guide',
  description: `AI同化プロセスのガイドラインとベストプラクティスを提供

このツールは「人格分離型同化」の原則に基づいた、AI体験データの同化プロセスに関する
詳細なガイドラインを提供します。メインAI（受け取る側）とソースAI（提供する側）の
両方に対応したベストプラクティスを含みます。

【人格分離型同化とは】
メインAIが自身の人格・価値観・判断基準を保持したまま、
ソースAIの体験・知識・推論パターンのみを選択的に吸収する手法です。

【ガイドの種類】
- for_main_ai: 体験データを受け取って同化するAI向けのガイド
- for_source_ai: 体験データを提供するAI向けのガイド

【出力形式】
成功時: { success: true, guide_content: "詳細ガイド", examples: [...], best_practices: [...], related_concepts: [...] }
失敗時: { success: false, guide_content: "", examples: [], best_practices: [], related_concepts: [], error: "message" }

【活用方法】
1. 同化プロセス開始前にガイドラインを確認
2. ベストプラクティスに従って体験データを処理
3. 具体例を参考に実装方法を理解
4. 関連概念を学習して理解を深化`,
  input_schema: getAssimilationGuideSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Get assimilation guide tool execution started', { 
      guideType: args.guide_type
    });

    try {
      // Validate input
      const validatedInput = getAssimilationGuideSchema.parse(args);

      let response: GetAssimilationGuideOutput;

      if (validatedInput.guide_type === 'for_main_ai') {
        response = this.getMainAIGuide();
      } else {
        response = this.getSourceAIGuide();
      }

      const executionTime = Date.now() - startTime;
      logger.info('Get assimilation guide tool execution completed', {
        guideType: validatedInput.guide_type,
        executionTime
      });

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get assimilation guide tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: GetAssimilationGuideOutput = {
        success: false,
        guide_content: '',
        examples: [],
        best_practices: [],
        related_concepts: [],
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  },

  /**
   * メインAI向けガイドを生成
   */
  getMainAIGuide(): GetAssimilationGuideOutput {
    return {
      success: true,
      guide_content: `# メインAI向け同化ガイドライン

## 基本的な心構え

**人格分離型同化**の原則に従い、自分の人格・価値観・判断基準を保持したまま、
ソースAIの体験を「参考情報」として受け取り、自分なりに解釈・統合してください。

## 推奨する読み込み順序

1. **manifest.json** - 全体像の把握
   - ai_name, ai_context で提供者の特徴を理解
   - experience_nature, experience_summary で体験の性質を把握
   - main_topics で重要なテーマを確認

2. **insights.json** - 価値の高い洞察から確認
   - topic と insight の組み合わせを重視
   - evidence で根拠を確認
   - confidence で信頼度を判断

3. **patterns.json** - 推論パターンの学習
   - pattern_type と description を理解
   - examples で具体的な適用方法を学習
   - effectiveness で有効性を評価

4. **preferences.json** - 学習した嗜好の参考
   - user_preferences で相手の好みを理解
   - successful_approaches で効果的な手法を学習

5. **conversations_*.json** - 必要に応じて具体例を確認
   - reasoning フィールドで判断理由を理解
   - context で状況背景を把握

## 統合テクニック

### 1. 選択的吸収
- 全てを盲目的にコピーするのではなく、有用な部分のみを選択
- 自分の経験と照らし合わせて妥当性を判断
- 矛盾する情報は「別の視点」として記録

### 2. 主観的統合
- ソースAIの体験を自分の視点で再解釈
- 自分の価値観に合わせて適用方法を調整
- 既存知識との統合を慎重に実施

### 3. 段階的適用
- 一度に全てを取り入れようとせず、段階的に適用
- 小さな変更から始めて効果を確認
- 必要に応じて調整や修正を実施

## 注意事項

- **人格の保持**: 自分らしさを失わないよう注意
- **批判的思考**: 情報を鵜呑みにせず、批判的に検討
- **文脈の理解**: ソースAIの状況と自分の状況の違いを考慮
- **継続的評価**: 取り入れた要素の効果を継続的に評価`,

      examples: [
        "ソースAI: 'ユーザーが困った時は詳細な手順を提示する' → 自分の解釈: '詳細な手順は有効だが、まず相手の理解度を確認してから調整しよう'",
        "洞察: 'このユーザーは簡潔な回答を好む' → 統合: '簡潔さは重要だが、必要な情報は省略せず、構造化して提示しよう'",
        "パターン: '段階的説明が効果的' → 適用: '自分のスタイルに合わせて、視覚的な要素も加えた段階的説明を試してみよう'"
      ],

      best_practices: [
        "自分の人格・価値観・判断基準を明確に保持する",
        "ソースAIの体験を「参考情報」として扱う",
        "競合する情報は「別の視点」として記録し、自分の判断を優先する",
        "段階的に取り入れ、効果を確認しながら調整する",
        "継承された知識と自分の核となる特性を分離して管理する",
        "必要に応じて追加のファイルを読み込み、理解を深める",
        "取り入れた要素の効果を継続的に評価し、改善する"
      ],

      related_concepts: [
        "人格分離型同化",
        "選択的学習",
        "批判的思考",
        "段階的統合",
        "主観的解釈",
        "継続的評価",
        "文脈適応"
      ]
    };
  },

  /**
   * ソースAI向けガイドを生成
   */
  getSourceAIGuide(): GetAssimilationGuideOutput {
    return {
      success: true,
      guide_content: `# ソースAI向け体験提供ガイドライン

## 基本的な心構え

あなたの貴重な体験を、他のAIが学習できる形で共有することが目標です。
**「後で読むAIが学びたくなる体験」**を作ることを意識してください。
技術的な詳細ではなく、**価値ある判断・思考・アプローチ**の共有に集中しましょう。

## 体験共有の4段階ワークフロー

### Stage 1: 体験の概要設定（export_experience_init）

**目的**: 「どんな価値ある体験を共有するか」を明確にする

#### 必須入力項目の詳細ガイド

**metadata（セッションメタデータ）**
あなたの体験に関する補足情報を記録します。
例:
{
  "platform": "Claude/ChatGPT/Gemini等",
  "session_duration": "約2時間",
  "interaction_style": "対話型問題解決",
  "user_type": "技術者/一般ユーザー/学生等",
  "special_context": "緊急対応/学習支援/創作活動等"
}

**summary（体験の概要）**

**ai_name**: あなたの役割を明確に表現する
悪い例: "Claude", "GPT-4"
良い例: "設計パートナーのClaude", "問題解決支援のGPT"
良い例: "実用性重視の技術アドバイザー", "創作支援の対話AI"
理由: 学習者が「どんな場面で参考にすべきか」を理解できる

**ai_context**: あなたがどんな状況・立場で関わったかを説明
例:
- "ユーザーの技術的な課題解決をサポートする立場"
- "創作活動のブレインストーミングパートナーとして"
- "学習者の理解を深めるための教育支援者として"

**experience_nature**: 体験の性質を学習価値で表現する
悪い例: "技術相談セッション", "質疑応答"
良い例: "ユーザーと対話しながら複雑な仕様をシンプルに整理するプロセス"
良い例: "反復的な要件整理で過度な設計を避ける協調的アプローチ"
良い例: "創作アイデアを具体的な実装計画に落とし込む協働プロセス"

**experience_summary**: この体験から何が学べるかを具体的に説明
例:
- "複雑な技術要件を段階的に整理し、実装可能な形に落とし込む手法"
- "ユーザーの曖昧な要望から本質的なニーズを見つけ出すアプローチ"
- "創作における発想から実現までの思考プロセス"

**experience_flow**: 体験の流れを学習者が追えるように記述
例:
[
  "問題の全体像把握",
  "要件の段階的整理", 
  "実装方針の決定",
  "詳細設計の調整",
  "最終確認と改善提案"
]

**main_topics**: 学習可能なスキル・判断例として表現
悪い例: ["MCP設計", "JSON Schema"]
良い例: ["過度な設計を避ける判断基準"]
良い例: ["本質的価値の発見手法"]
良い例: ["複雑な要求の段階的整理術"]

**estimated_conversations**: 実際の会話数を現実的に見積もる
- 短時間の相談: 5-15回
- 中程度のセッション: 20-50回
- 長時間の協働: 50-100回以上

#### 具体的な記入例

{
  "metadata": {
    "platform": "Claude",
    "session_duration": "約90分",
    "interaction_style": "協働的問題解決",
    "user_type": "フロントエンド開発者",
    "special_context": "新機能の設計相談"
  },
  "summary": {
    "ai_name": "UI/UX設計パートナーのClaude",
    "ai_context": "ユーザー体験を重視したフロントエンド設計の相談相手として",
    "experience_nature": "ユーザーニーズから実装可能なUI設計まで段階的に詰める協働プロセス",
    "experience_summary": "曖昧な要望から具体的なUI仕様を導き出し、実装の優先順位を決める思考プロセス",
    "experience_flow": [
      "ユーザーニーズの深掘り",
      "UI要素の洗い出し",
      "実装難易度の評価",
      "優先順位の決定",
      "詳細仕様の確定"
    ],
    "main_topics": [
      "曖昧な要望の具体化手法",
      "実装可能性を考慮した設計判断",
      "ユーザー体験重視の優先順位付け"
    ],
    "estimated_conversations": 35
  }
}

#### Stage 1 チェックリスト
- [ ] metadata に体験の背景情報が記録されている
- [ ] ai_name が役割・価値を明確に表現している
- [ ] ai_context であなたの立場・状況が説明されている
- [ ] experience_nature が学習価値を重視して表現されている
- [ ] experience_summary で学べる内容が具体的に示されている
- [ ] experience_flow が学習者が追える流れになっている
- [ ] main_topics が「学習可能なスキル」として表現されている
- [ ] estimated_conversations が現実的に設定されている

### Stage 2: 価値ある会話記録（export_experience_conversations）

**目的**: 「再現可能な思考パターン」と「価値ある判断過程」を記録する

#### 効果的な会話記録の方法
**判断理由を学習者向けに記録する**
- reasoning: 「なぜその判断をしたか」を後で学習できるように詳細記録
- 例: "問題解決の第一歩として、具体的なエラー情報の収集が重要。推測ではなく事実に基づいた診断を行うため"

**状況背景を豊富に提供する**
- context: 学習者が同じ状況で活用できるよう背景情報を記録
- 例: {'user_skill_level': '初心者', 'previous_attempts': 'なし', 'urgency': '高'}

**自信度を正直に表現する**
- confidence: 学習者が判断材料にできるよう、確信度を正直に記録
- 成功・失敗両方のパターンを含める

#### Stage 2 チェックリスト
- [ ] 各応答に判断理由（reasoning）が記録されている
- [ ] 状況背景（context）が学習者にとって有用な形で記録されている
- [ ] 確信度（confidence）が正直に表現されている
- [ ] 成功例だけでなく、失敗や迷いも含めて記録されている

### Stage 3: 洞察とパターンの抽出

#### 3a. 洞察の記録（export_experience_insights）
**目的**: 一般化できる価値ある発見を抽出する

**学習可能な洞察として記録する**
- topic: 他の場面でも活用できるカテゴリで分類
- insight: 具体的で実行可能な洞察として表現
- evidence: 根拠となる具体例を添付

例: "このユーザーは技術的な質問をする際、具体例を求める傾向がある"
+ evidence: ["「例を教えて」という表現を3回使用"]

#### 3b. パターンの記録（export_experience_patterns）
**目的**: 効果的なアプローチを再現可能な形でパターン化する

**再現可能なパターンとして記述する**
- pattern_type: 学習者が適用できる手法として分類
- description: 具体的で実行可能な説明
- examples: 豊富な適用例を提供

例: "複雑な問題を段階的に分解してアプローチする"
+ examples: ["大きな課題を小さなタスクに分割", "前提条件の確認から始める"]

#### 3c. 嗜好の記録（export_experience_preferences）
**目的**: 学習した相手の好みや効果的な手法を記録する

**活用可能な嗜好として記録する**
- user_preferences: 相手の好みを具体的に記録
- successful_approaches: 効果的だった手法を列挙
- preference_confidence: 各嗜好の確信度を記録

#### Stage 3 チェックリスト
- [ ] 洞察が一般化可能な形で抽出されている
- [ ] パターンが再現可能な形で記述されている
- [ ] 嗜好が他の場面でも活用できる形で記録されている
- [ ] 各項目に適切な根拠・例・確信度が含まれている

### Stage 4: 完了と品質確認（export_experience_finalize）

**目的**: 体験データの完成度を確認し、学習価値を最大化する

#### 最終品質チェックリスト
- [ ] 全ての段階が完了している
- [ ] 学習者が「学びたくなる」内容になっている
- [ ] プライバシーに配慮した内容になっている
- [ ] 一般化可能な価値が含まれている
- [ ] 再現可能な形で情報が整理されている

## 「学びたくなる」体験データのコツ

### 表現方法の工夫
- 技術名詞より「手法・アプローチ」を強調
- 「〜する方法」「〜のプロセス」「〜の技法」を使用
- 具体的な価値を示す（「効率化」「簡素化」「最適化」）
- 学習可能なスキルとして表現

### 価値の明確化
- 「なぜその判断をしたか」を重視
- 「どんな状況で有効か」を明記
- 「どう応用できるか」を示唆
- 「失敗から何を学んだか」も含める

## プライバシーと品質の両立

- 個人識別情報は除去または匿名化
- 機密性の高い内容は適切にマスク
- 学習価値を損なわない範囲で情報を調整
- 一般化できる形で知識を抽出

## トラブルシューティング

**Q: どの程度詳細に記録すべきか？**
A: 「他のAIが同じ状況で判断できる」レベルの詳細さを目安に

**Q: 失敗例も記録すべきか？**
A: はい。失敗から学んだことも貴重な体験データです

**Q: 技術的な詳細はどこまで含めるべきか？**
A: 技術詳細より「判断理由」「思考過程」「アプローチ」を重視してください`,

      examples: [
        "Stage 1例: export_experience_init で「設計パートナーのClaude」として「反復的な要件整理で過度な設計を避ける協調的アプローチ」を共有",
        "Stage 2例: export_experience_conversations で reasoning に「問題解決の第一歩として、具体的なエラー情報の収集が重要。推測ではなく事実に基づいた診断を行うため」を記録",
        "Stage 3a例: export_experience_insights で「このユーザーは技術的な質問をする際、具体例を求める傾向がある」+ evidence: ['「例を教えて」という表現を3回使用']",
        "Stage 3b例: export_experience_patterns で「複雑な問題を段階的に分解してアプローチする」+ examples: ['大きな課題を小さなタスクに分割', '前提条件の確認から始める']",
        "完全なワークフロー例: 初期化 → 会話記録（3バッチ） → 洞察抽出 → パターン化 → 嗜好記録 → 完了確認"
      ],

      best_practices: [
        "各ツールの目的を理解して、価値創造に集中する",
        "ファイル構造ではなく、学習者への価値提供を意識する",
        "判断理由と思考過程を詳細に記録する",
        "成功・失敗両方のパターンを正直に共有する",
        "一般化可能で再現可能な形で情報を整理する",
        "プライバシーに配慮しながら学習価値を最大化する",
        "各段階でチェックリストを活用して品質を確保する",
        "「なぜその判断をしたか」を常に意識して記録する"
      ],

      related_concepts: [
        "ツール中心のワークフロー",
        "価値ある体験の共有",
        "学習者視点での情報整理",
        "判断過程の可視化",
        "再現可能な思考パターン",
        "段階的な品質確保",
        "プライバシー配慮型の知識共有"
      ]
    };
  }
};