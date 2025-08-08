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
      guide_content: guideContent
    };
  }
};