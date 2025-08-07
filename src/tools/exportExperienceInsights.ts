/**
 * Export Experience Insights Tool
 * 洞察データの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ExportManager } from '../server/exportManager.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();
const exportManager = new ExportManager(config.storage.baseDirectory);

// Input schema validation
export const exportExperienceInsightsSchema = z.object({
  export_id: z.string()
    .min(1, 'エクスポート処理識別子は必須です')
    .describe('エクスポート処理識別子'),
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
  description: `洞察データの個別ファイル出力

このツールは体験から得られた洞察データをinsights.jsonファイルに出力します。
AIが学習した重要な気づきや発見を構造化して保存します。

【主な機能】
- 洞察データの構造化出力
- insights.jsonファイルの作成
- 証拠や信頼度情報の保持
- 関連会話との紐付け

【洞察データの構造】
- topic: 洞察のトピック（例: "ユーザーコミュニケーション"）
- insight: 具体的な洞察内容
- timestamp: 発見日時
- evidence: 根拠となる証拠（オプション）
- confidence: 信頼度（0-1、オプション）
- analysis_method: 分析手法（オプション）
- related_conversations: 関連会話のインデックス（オプション）

【出力形式】
成功時: { success: true, file_path: "path/insights.json", items_count: 5 }
失敗時: { success: false, file_path: "", items_count: 0, error: "message" }`,
  input_schema: exportExperienceInsightsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience insights tool execution started', { 
      exportId: args.export_id,
      insightsCount: args.insights?.length
    });

    try {
      // Validate input
      const validatedInput = exportExperienceInsightsSchema.parse(args);

      // Export insights
      const result = await exportManager.exportInsights({
        export_id: validatedInput.export_id,
        data: validatedInput.insights
      });

      const executionTime = Date.now() - startTime;
      logger.info('Export experience insights tool execution completed', {
        success: result.success,
        itemsCount: result.items_count,
        executionTime
      });

      const response: ExportExperienceInsightsOutput = {
        success: result.success,
        file_path: result.file_path,
        items_count: result.items_count,
        error: result.error
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