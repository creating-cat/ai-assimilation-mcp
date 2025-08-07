/**
 * Export Experience Conversations Tool
 * 会話履歴データのバッチ単位での個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ExportManager } from '../server/exportManager.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();
const exportManager = new ExportManager(config.storage.baseDirectory);

// Input schema validation
export const exportExperienceConversationsSchema = z.object({
  export_id: z.string()
    .min(1, 'エクスポート処理識別子は必須です')
    .describe('エクスポート処理識別子'),
  conversations_batch: z.array(z.object({
    timestamp: z.string().describe('タイムスタンプ'),
    user_input: z.string().describe('ユーザー入力'),
    ai_response: z.string().describe('AI応答'),
    reasoning: z.string().optional().describe('判断理由'),
    confidence: z.number().min(0).max(1).optional().describe('信頼度'),
    context: z.record(z.any()).optional().describe('コンテキスト'),
    internal_state: z.record(z.any()).optional().describe('内部状態')
  })).describe('会話データのバッチ（50件ベース）'),
  batch_number: z.number()
    .int()
    .min(1)
    .describe('バッチ番号'),
  is_final_batch: z.boolean()
    .optional()
    .default(false)
    .describe('最終バッチかどうか')
});

export type ExportExperienceConversationsInput = z.infer<typeof exportExperienceConversationsSchema>;

export interface ExportExperienceConversationsOutput {
  success: boolean;
  file_path: string;
  processed_count: number;
  batch_file_size: number;
  error?: string;
}

export const exportExperienceConversationsTool = {
  name: 'export_experience_conversations',
  description: `会話履歴データのバッチ単位での個別ファイル出力

このツールは会話データを50件単位のバッチに分けて個別のJSONファイルに出力します。
大量の会話データを効率的に処理し、ファイルサイズを適切に管理します。

【主な機能】
- 会話データのバッチ処理（推奨50件単位）
- 個別バッチファイルの作成（conversations_001.json形式）
- バッチ情報の自動生成（開始・終了インデックス）
- ファイルサイズと処理件数の報告

【バッチファイル形式】
- conversations_001.json: 1-50件目
- conversations_002.json: 51-100件目
- conversations_003.json: 101-150件目

【出力形式】
成功時: { success: true, file_path: "path", processed_count: 50, batch_file_size: 1024 }
失敗時: { success: false, file_path: "", processed_count: 0, batch_file_size: 0, error: "message" }`,
  input_schema: exportExperienceConversationsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience conversations tool execution started', { 
      exportId: args.export_id,
      batchNumber: args.batch_number,
      conversationCount: args.conversations_batch?.length
    });

    try {
      // Validate input
      const validatedInput = exportExperienceConversationsSchema.parse(args);

      // Export conversation batch
      const result = await exportManager.exportConversationBatch({
        export_id: validatedInput.export_id,
        conversations_batch: validatedInput.conversations_batch,
        batch_number: validatedInput.batch_number,
        is_final_batch: validatedInput.is_final_batch
      });

      const executionTime = Date.now() - startTime;
      logger.info('Export experience conversations tool execution completed', {
        success: result.success,
        batchNumber: validatedInput.batch_number,
        processedCount: result.processed_count,
        executionTime
      });

      const response: ExportExperienceConversationsOutput = {
        success: result.success,
        file_path: result.file_path,
        processed_count: result.processed_count,
        batch_file_size: result.batch_file_size,
        error: result.error
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience conversations tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperienceConversationsOutput = {
        success: false,
        file_path: '',
        processed_count: 0,
        batch_file_size: 0,
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};