/**
 * Export Experience Patterns Tool
 * 推論パターンデータの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { writeReasoningPatterns } from '../utils/fileOperations.js';
import { join } from 'path';

// Input schema validation
export const exportExperiencePatternsSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
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
  description: `AIが学習した「推論パターン」や「思考のクセ」を、patterns.jsonファイルに書き出します。

問題解決の方法や、効果的だった思考プロセスなどをパターンとして保存することで、他のAIがそのアプローチを学習できます。

【主な機能】
- 複数の推論パターンをリスト形式でファイルに保存
- 各パターンには、種類、説明、具体例、効果などを記録可能

【出力形式】
成功時: { success: true, file_path: "path/patterns.json", items_count: 3 }
失敗時: { success: false, file_path: "", items_count: 0, error: "message" }`,
  input_schema: exportExperiencePatternsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience patterns tool execution started', {
      sessionId: args.session_id,
      patternsCount: args.reasoning_patterns?.length
    });

    try {
      // Validate input
      const { session_id, reasoning_patterns } = exportExperiencePatternsSchema.parse(args);

      const directoryPath = getExperienceDirectoryPath(session_id);
      const filePath = join(directoryPath, 'patterns.json');

      const writeResult = await writeReasoningPatterns(filePath, reasoning_patterns);
      if (!writeResult.success) {
        throw new Error(`Failed to write patterns file: ${writeResult.error}`);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Export experience patterns tool execution completed', {
        success: true,
        itemsCount: reasoning_patterns.length,
        executionTime
      });

      const response: ExportExperiencePatternsOutput = {
        success: true,
        file_path: filePath,
        items_count: reasoning_patterns.length,
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