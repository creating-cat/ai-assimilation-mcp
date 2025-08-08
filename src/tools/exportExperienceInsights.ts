/**
 * Export Experience Insights Tool
 * 洞察データの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { writeInsights } from '../utils/fileOperations.js';
import { join } from 'path';

// Input schema validation
export const exportExperienceInsightsSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
  insights: z.array(z.object({
    topic: z.string().describe('洞察のトピック'),
    insight: z.string().describe('洞察内容'),
    timestamp: z.string().describe('発見日時'),
    evidence: z.array(z.string()).optional().describe('根拠となる証拠'),
    confidence: z.number().min(0).max(1).optional().describe('信頼度'),
    analysis_method: z.string().optional().describe('分析手法'),
    related_conversations: z.array(z.number()).optional().describe('関連会話'),
    statistical_significance: z.number().min(0).max(1).optional().describe('統計的有意性')
  })).describe('洞察データ')
});

export type ExportExperienceInsightsInput = z.infer<typeof exportExperienceInsightsSchema>;

export interface ExportExperienceInsightsOutput {
  success: boolean;
  file_path: string;
  items_count: number;
  error?: string;
}

export const exportExperienceInsightsTool = {
  name: 'export_experience_insights',
  description: `学習した洞察をエクスポートします。会話データのエクスポート後に実行してください。一般化可能な発見や気づきを記録します。`,
  input_schema: exportExperienceInsightsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience insights tool execution started', {
      sessionId: args.session_id,
      insightsCount: args.insights?.length
    });

    try {
      // Validate input
      const { session_id, insights } = exportExperienceInsightsSchema.parse(args);

      const directoryPath = getExperienceDirectoryPath(session_id);
      const filePath = join(directoryPath, 'insights.json');

      const writeResult = await writeInsights(filePath, insights);
      if (!writeResult.success) {
        throw new Error(`Failed to write insights file: ${writeResult.error}`);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Export experience insights tool execution completed', {
        success: true,
        itemsCount: insights.length,
        executionTime
      });

      const response: ExportExperienceInsightsOutput = {
        success: true,
        file_path: filePath,
        items_count: insights.length,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience insights tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperienceInsightsOutput = {
        success: false,
        file_path: '',
        items_count: 0,
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};