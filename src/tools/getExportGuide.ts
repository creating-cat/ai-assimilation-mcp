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



    };
  }
};