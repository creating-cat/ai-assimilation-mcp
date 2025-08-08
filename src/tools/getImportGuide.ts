/**
 * Get Import Guide Tool
 * 体験データをインポート（学習）するAI向けのガイドラインとベストプラクティスを提供
 */

import { z } from 'zod';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { logger } from '../utils/logger.js';

// ESM環境で__dirnameを再現
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Input schema validation (no parameters needed)
export const getImportGuideSchema = z.object({});

export type GetImportGuideInput = z.infer<typeof getImportGuideSchema>;

export interface GetImportGuideOutput {
  success: boolean;
  guide_content: string;
  examples: string[];
  best_practices: string[];
  related_concepts: string[];
  error?: string;
}

export const getImportGuideTool = {
  name: 'get_ai_experience_import_guide',
  description: `【必須】体験データのインポート（学習）を開始する前に、必ずこのツールで全体ワークフローを確認してください。インポート用のベストプラクティスや学習方法を説明します。`,
  input_schema: getImportGuideSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Get import guide tool execution started');

    try {
      // Validate input (no parameters needed)
      getImportGuideSchema.parse(args);

      const response = await this.getMainAIGuide();

      const executionTime = Date.now() - startTime;
      logger.info('Get import guide tool execution completed', { executionTime });

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get import guide tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: GetImportGuideOutput = {
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
  async getMainAIGuide(): Promise<GetImportGuideOutput> {
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
  }
};