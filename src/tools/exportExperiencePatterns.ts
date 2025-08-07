/**
 * Export Experience Patterns Tool
 * 推論パターンデータの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { exportManager } from '../server/exportManager.js';

// Input schema validation
export const exportExperiencePatternsSchema = z.object({
  export_id: z.string()
    .min(1, 'エクスポート処理識別子は必須です')
    .describe('エクスポート処理識別子'),
  reasoning_patterns: z.array(z.object({
    pattern_type: z.string().describe('パターンの種類'),
    description: z.string().describe('パターンの説明'),
    examples: z.array(z.string()).optional().describe('具体例'),
    effectiveness: z.number().min(0).max(1).optional().describe('効果度'),
    usage_frequency: z.number().min(0).max(1).optional().describe('使用頻度'),
    success_contexts: z.array(z.string()).optional().describe('成功コンテキスト'),
    learned_from: z.array(z.string()).optional().describe('学習元')
  })).describe('推論パターンデータ')
});

export type ExportExperiencePatternsInput = z.infer<typeof exportExperiencePatternsSchema>;

export interface ExportExperiencePatternsOutput {
  success: boolean;
  file_path: string;
  items_count: number;
  error?: string;
}

export const exportExperiencePatternsTool = {
  name: 'export_experience_patterns',
  description: `推論パターンデータの個別ファイル出力

このツールはAIが学習した推論パターンをpatterns.jsonファイルに出力します。
問題解決や思考プロセスのパターンを構造化して保存し、他のAIが参考にできるようにします。

【主な機能】
- 推論パターンの構造化出力
- patterns.jsonファイルの作成
- パターンの効果度と使用頻度の記録
- 成功コンテキストの保持

【推論パターンの構造】
- pattern_type: パターンの種類（例: "問題解決", "創造的思考"）
- description: パターンの詳細説明
- examples: 具体的な使用例（オプション）
- effectiveness: 効果度（0-1、オプション）
- usage_frequency: 使用頻度（0-1、オプション）
- success_contexts: 成功したコンテキスト（オプション）
- learned_from: 学習元の情報（オプション）

【出力形式】
成功時: { success: true, file_path: "path/patterns.json", items_count: 3 }
失敗時: { success: false, file_path: "", items_count: 0, error: "message" }`,
  input_schema: exportExperiencePatternsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience patterns tool execution started', { 
      exportId: args.export_id,
      patternsCount: args.reasoning_patterns?.length
    });

    try {
      // Validate input
      const validatedInput = exportExperiencePatternsSchema.parse(args);

      // Export patterns
      const result = await exportManager.exportPatterns({
        export_id: validatedInput.export_id,
        data: validatedInput.reasoning_patterns
      });

      const executionTime = Date.now() - startTime;
      logger.info('Export experience patterns tool execution completed', {
        success: result.success,
        itemsCount: result.items_count,
        executionTime
      });

      const response: ExportExperiencePatternsOutput = {
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
      logger.error('Export experience patterns tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperiencePatternsOutput = {
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