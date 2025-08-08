/**
 * Export Experience Conversations Tool
 * 会話履歴データのバッチ単位での個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { writeConversationBatch } from '../utils/fileOperations.js';
import { ConversationBatch } from '../types/index.js';
import { join } from 'path';
import { loadConfig } from '../config/index.js';

// Input schema validation
export const exportExperienceConversationsSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
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
    .describe('バッチ番号')
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
  description: `会話履歴をバッチ単位でエクスポートします。export_experience_init完了後に実行してください。バッチ番号は1から順番に処理する必要があります。`,
  input_schema: exportExperienceConversationsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    const config = loadConfig();
    logger.info('Export experience conversations tool execution started', {
      sessionId: args.session_id,
      batchNumber: args.batch_number,
      conversationCount: args.conversations_batch?.length
    });

    try {
      // Validate input
      const { session_id, conversations_batch, batch_number } = exportExperienceConversationsSchema.parse(args);

      const directoryPath = getExperienceDirectoryPath(session_id);

      const batch: ConversationBatch = {
        batch_info: {
          batch_number: batch_number,
          count: conversations_batch.length,
          start_index: (batch_number - 1) * config.storage.conversationBatchSize + 1,
          end_index: (batch_number - 1) * config.storage.conversationBatchSize + conversations_batch.length,
        },
        conversations: conversations_batch,
      };

      const filename = `conversations_${String(batch_number).padStart(3, '0')}.json`;
      const filePath = join(directoryPath, filename);

      const writeResult = await writeConversationBatch(filePath, batch);
      if (!writeResult.success) {
        throw new Error(`Failed to write conversation batch: ${writeResult.error}`);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Export experience conversations tool execution completed', {
        success: true,
        batchNumber: batch_number,
        processedCount: conversations_batch.length,
        executionTime
      });

      const response: ExportExperienceConversationsOutput = {
        success: true,
        file_path: filePath,
        processed_count: conversations_batch.length,
        batch_file_size: writeResult.data?.size || 0,
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