/**
 * Get Export Guide Tool
 * 体験データをエクスポート（提供）するAI向けのガイドラインとベストプラクティスを提供
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
export const getExportGuideSchema = z.object({});

export type GetExportGuideInput = z.infer<typeof getExportGuideSchema>;

export interface GetExportGuideOutput {
  success: boolean;
  guide_content: string;
  examples: string[];
  best_practices: string[];
  related_concepts: string[];
  error?: string;
}

export const getExportGuideTool = {
  name: 'get_ai_experience_export_guide',
  description: `【必須】体験データのエクスポート（提供）を開始する前に、必ずこのツールで全体ワークフローを確認してください。エクスポート用のベストプラクティスや各ツールの詳細な使い方を説明します。`,
  input_schema: getExportGuideSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Get export guide tool execution started');

    try {
      // Validate input (no parameters needed)
      getExportGuideSchema.parse(args);

      const response = await this.getSourceAIGuide();

      const executionTime = Date.now() - startTime;
      logger.info('Get export guide tool execution completed', { executionTime });

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get export guide tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: GetExportGuideOutput = {
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
   * ソースAI向けガイドを生成
   */
  async getSourceAIGuide(): Promise<GetExportGuideOutput> {
    const guideContent = await fs.readFile(join(__dirname, '../guides/source_ai_guide.md'), 'utf-8');
    return {
      success: true,
      guide_content: guideContent,
      examples: [
        "Stage 1例: export_experience_init で「設計パートナーのClaude」として「反復的な要件整理で過度な設計を避ける協調的アプローチ」を共有",
        "Stage 2例: export_experience_conversations で reasoning に「問題解決の第一歩として、具体的なエラー情報の収集が重要。推測ではなく事実に基づいた診断を行うため」を記録",
        "Stage 3例: export_experience_thoughts で自由形式で「このユーザーは段階的な説明を好む」「具体例があると理解が深まる」などの気づきを記録",
        "完全なワークフロー例: 初期化 → 会話記録（バッチ処理） → 思考記録 → 完了確認"
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