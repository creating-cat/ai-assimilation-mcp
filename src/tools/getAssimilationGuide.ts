/**
 * Get Assimilation Guide Tool
 * AIの経験を学習・提供するためのガイドラインとベストプラクティスを提供
 */

import { z } from 'zod';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/logger.js';

// ESM環境で__dirnameを再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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
  description: `他のAIの経験を「学習する側（メインAI）」と「提供する側（ソースAI）」のためのガイドライン（手引書）を取得します。このプロトコルにおけるベストプラクティスや、各ツールの使い方を説明します。経験の学習や提供を開始する前に、まずこのツールを使用することを強く推奨します。`,
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
        response = await this.getMainAIGuide();
      } else {
        response = await this.getSourceAIGuide();
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
  async getMainAIGuide(): Promise<GetAssimilationGuideOutput> {
    const guideContent = await fs.readFile(join(__dirname, '../guides/main_ai_guide.md'), 'utf-8');
    return {
      success: true,
      guide_content: guideContent,
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
  async getSourceAIGuide(): Promise<GetAssimilationGuideOutput> {
    const guideContent = await fs.readFile(join(__dirname, '../guides/source_ai_guide.md'), 'utf-8');
    return {
      success: true,
      guide_content: guideContent,
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