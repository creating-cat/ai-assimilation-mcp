/**
 * Get Export Status Tool
 * 指定されたセッションIDのエクスポート状態を動的に確認します。
 */

import { z } from 'zod';
import { promises as fs } from 'fs';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { fileExists } from '../utils/fileOperations.js';
import { ExportStatusResult, ExperienceStatus } from '../types/index.js';

// Input schema validation
export const getExportStatusSchema = z.object({
  session_id: z.string()
    .min(1, 'セッション識別子は必須です')
    .describe('状態を確認するエクスポートセッションの識別子'),
});

export type GetExportStatusInput = z.infer<typeof getExportStatusSchema>;

export const getExportStatusTool = {
  name: 'get_export_status',
  description: `指定されたセッションIDのエクスポート（ファイル保存）がどこまで進んでいるか、現在の状態を確認します。中断した処理を再開する際に便利です。詳細な使い方は get_assimilation_guide ツールを参照してください。`,
  input_schema: getExportStatusSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    const { session_id } = getExportStatusSchema.parse(args);
    logger.info('get_export_status tool execution started', { session_id });

    try {
      const directoryPath = getExperienceDirectoryPath(session_id);
      const dirExists = await fileExists(directoryPath);

      if (!dirExists) {
        const result: ExportStatusResult = {
          status: 'not_found',
          directory_path: directoryPath,
          created_files: [],
          next_batch_number: 1,
        };
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      const files = await fs.readdir(directoryPath);
      const manifestExists = files.includes('manifest.json');

      if (manifestExists) {
        const result: ExportStatusResult = {
          status: 'completed',
          directory_path: directoryPath,
          created_files: files,
          next_batch_number: -1, // -1は完了を示す
        };
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }

      const conversationFiles = files.filter(f => f.startsWith('conversations_') && f.endsWith('.json'));
      let nextBatchNumber = 1;
      if (conversationFiles.length > 0) {
        const batchNumbers = conversationFiles.map(f => {
          const match = f.match(/conversations_(\d+)\.json/);
          return match ? parseInt(match[1], 10) : 0;
        });
        nextBatchNumber = Math.max(0, ...batchNumbers) + 1;
      }

      const status: ExperienceStatus = files.length > 0 ? 'in_progress' : 'initializing';

      const result: ExportStatusResult = {
        status,
        directory_path: directoryPath,
        created_files: files,
        next_batch_number: nextBatchNumber,
      };
      
      logger.info('get_export_status tool execution completed', { result, executionTime: Date.now() - startTime });
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('get_export_status tool execution failed', { error: errorMessage, executionTime: Date.now() - startTime });

      const errorResponse: Partial<ExportStatusResult> = {
        status: 'not_found',
        error: errorMessage
      };
      return { content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }] };
    }
  }
};