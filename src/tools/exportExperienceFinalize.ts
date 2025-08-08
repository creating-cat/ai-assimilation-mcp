/**
 * Export Experience Finalize Tool
 * エクスポート処理の完了とマニフェストファイル生成
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import {
  readJsonFile,
  writeExperienceMetadata,
  getDirectoryInfo,
  readConversationBatch,
  deleteFile,
} from '../utils/fileOperations.js';
import { ExperienceMetadata, ExperienceSummary } from '../types/index.js';
import { join } from 'path';
import { promises as fs } from 'fs';
import { loadConfig } from '../config/index.js';

// Input schema validation
export const exportExperienceFinalizeSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
});

export type ExportExperienceFinalizeInput = z.infer<typeof exportExperienceFinalizeSchema>;

export interface ExportExperienceFinalizeOutput {
  success: boolean;
  directory_path: string;
  manifest_path: string;
  total_files: number;
  total_size: number;
  file_list: string[];
  error?: string;
}

export const exportExperienceFinalizeTool = {
  name: 'export_experience_finalize',
  description: `エクスポート処理を完了し、manifest.jsonを生成します。全ての必要なファイル（conversations, thoughts）が作成された後に実行してください。`,
  input_schema: exportExperienceFinalizeSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    const config = loadConfig();
    logger.info('Export experience finalize tool execution started', { sessionId: args.session_id });

    try {
      // Validate input
      const { session_id } = exportExperienceFinalizeSchema.parse(args);
      const directoryPath = getExperienceDirectoryPath(session_id);

      // 1. Read initial data from summary.json
      const summaryFilePath = join(directoryPath, 'summary.json');
      const initialDataResult = await readJsonFile<{
        summary: ExperienceSummary;
        metadata: Record<string, any>;
        created_at: string;
      }>(summaryFilePath, false);

      if (!initialDataResult.success || !initialDataResult.data) {
        throw new Error(`Failed to read initial summary data: ${initialDataResult.error}`);
      }
      const { summary, metadata, created_at } = initialDataResult.data;

      // 2. Scan directory for created files
      const allFiles = await fs.readdir(directoryPath);
      const conversationFiles = allFiles.filter(f => f.startsWith('conversations_') && f.endsWith('.json')).sort();

      // 3. Calculate total conversations
      let totalConversations = 0;
      for (const file of conversationFiles) {
        const batchResult = await readConversationBatch(join(directoryPath, file));
        if (batchResult.success && batchResult.data) {
          totalConversations += batchResult.data.conversations.length;
        }
      }

      // 4. Construct manifest data
      const manifest: ExperienceMetadata = {
        mcp_version: config.server.version,
        ai_name: summary.ai_name,
        ai_context: summary.ai_context,
        experience_summary: summary.experience_summary,
        experience_flow: summary.experience_flow,
        main_topics: summary.main_topics,
        files: {
          conversations: conversationFiles,
          thoughts: allFiles.includes('thoughts.json') ? 'thoughts.json' : '',

        },
        total_conversations: totalConversations,
        session_id: session_id,
        created_at: created_at,
        custom_metadata: metadata,
      };

      // 5. Write manifest.json
      const writeResult = await writeExperienceMetadata(directoryPath, manifest);
      if (!writeResult.success) {
        throw new Error(`Failed to write manifest.json: ${writeResult.error}`);
      }

      // 6. Clean up temporary summary file
      await deleteFile(summaryFilePath);

      // 7. Get final directory info
      const finalDirInfo = await getDirectoryInfo(directoryPath);
      const totalSize = finalDirInfo.data?.size || 0;
      const fileList = finalDirInfo.data?.files || [];

      const executionTime = Date.now() - startTime;
      logger.info('Export experience finalize tool execution completed', {
        success: true,
        totalFiles: fileList.length,
        totalSize: totalSize,
        executionTime
      });

      const response: ExportExperienceFinalizeOutput = {
        success: true,
        directory_path: directoryPath,
        manifest_path: join(directoryPath, 'manifest.json'),
        total_files: fileList.length,
        total_size: totalSize,
        file_list: fileList,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience finalize tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperienceFinalizeOutput = {
        success: false,
        directory_path: '',
        manifest_path: '',
        total_files: 0,
        total_size: 0,
        file_list: [],
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};