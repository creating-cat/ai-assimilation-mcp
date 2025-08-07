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

後で読む人（メインAI）が理解しやすく、学習価値の高い体験データを作成することを目指してください。
**メインAIが「学びたくなる」体験データ**の作成が重要です。

## 魅力的なmanifest.json作成のベストプラクティス

### ai_nameの付け方
❌ 汎用的: "Claude", "GPT-4"
❌ 技術的: "claude-3-sonnet", "gpt-4-turbo"
✅ 役割明確: "設計パートナーのClaude", "問題解決支援のGPT"
✅ 特徴表現: "実用性重視の技術アドバイザー", "創作支援の対話AI"

### experience_natureの書き方
❌ 表面的: "技術相談セッション", "質疑応答"
❌ 専門的: "MCP設計プロセス", "API仕様策定"
✅ 学習価値明確: "ユーザーと対話しながら複雑な仕様をシンプルに整理するプロセス"
✅ 手法重視: "反復的な要件整理で過度な設計を避ける協調的アプローチ"

### main_topicsの選び方
❌ 技術用語: ["MCP設計", "JSON Schema", "データ構造"]
❌ 抽象的: ["技術相談", "問題解決", "協調的な設計手法"]
✅ 具体的判断例: ["過度な設計を避ける判断基準（JSON Schema削除の決断）"]
✅ 学習可能な発見: ["本質的価値の発見手法（AIの名前・コンテキストの重要性）"]
✅ 実用的な改善: ["ファイル構造の実用的統合（manifest.json統合の判断）"]

## 「学びたくなる」表現のコツ

- 技術名詞より「手法・アプローチ」を強調
- 「〜する方法」「〜のプロセス」「〜の技法」を使用
- 具体的な価値を示す（「効率化」「簡素化」「最適化」）
- 学習可能なスキルとして表現

## 良い体験データの作り方

### 会話データ（conversations_*.json）
- **reasoning フィールド**: 判断理由を詳細記録
- **context フィールド**: 状況背景を含める
- **confidence**: 自信度を正直に記録
- 成功・失敗両方のパターンを記録

### 洞察データ（insights.json）
- **evidence**: 具体的な根拠を添付
- **topic**: 学習可能なカテゴリで分類
- **confidence**: 信頼度を適切に評価
- 一般化できる形で知識を抽出

### 推論パターン（patterns.json）
- **examples**: 具体的な適用例を豊富に提供
- **effectiveness**: 実際の効果を正直に評価
- **success_contexts**: 成功した文脈を詳細記録
- 再現可能な形でパターンを記述

### 学習嗜好（preferences.json）
- **user_preferences**: 相手の好みを具体的に記録
- **successful_approaches**: 効果的だった手法を列挙
- **preference_confidence**: 各嗜好の確信度を記録

## プライバシー配慮

- 個人識別情報は除去または匿名化
- 機密性の高い内容は適切にマスク
- 一般化できる形で知識を抽出
- 学習価値を損なわない範囲で情報を調整`,

      examples: [
        "reasoning例: '問題解決の第一歩として、具体的なエラー情報の収集が重要。推測ではなく事実に基づいた診断を行うため'",
        "context例: {'user_skill_level': '初心者', 'previous_attempts': 'なし', 'urgency': '高'}",
        "insight例: 'このユーザーは技術的な質問をする際、具体例を求める傾向がある' + evidence: ['「例を教えて」という表現を3回使用']",
        "pattern例: '複雑な問題を段階的に分解してアプローチする' + examples: ['大きな課題を小さなタスクに分割', '前提条件の確認から始める']"
      ],

      best_practices: [
        "推論過程や判断理由を詳しく残す",
        "プライバシーに配慮した情報提供を行う",
        "一般化できる形で知識を抽出する",
        "メインAIが学習しやすい構造で情報を整理する",
        "具体例と抽象的な原則をバランス良く含める",
        "成功・失敗両方のパターンを記録する",
        "文脈情報を豊富に提供する",
        "学習価値の高いトピックを明確に示す"
      ],

      related_concepts: [
        "体験データの構造化",
        "学習価値の最大化",
        "プライバシー保護",
        "知識の一般化",
        "メタ認知の記録",
        "文脈情報の保持",
        "再現可能性の確保"
      ]
    };
  }
};