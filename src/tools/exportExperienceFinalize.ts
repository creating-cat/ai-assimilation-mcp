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
  description: `一連の経験ファイルのエクスポートを完了させ、全体のまとめファイルである manifest.json を生成します。

このツールは、これまで作成した全てのファイル（会話、洞察など）をリストアップし、体験全体の概要を記録します。
このツールを実行すると、エクスポートセッションは完了と見なされます。

【主な機能】
- ディレクトリ内の全ファイルをスキャンし、manifest.json を生成
- 総会話数の自動計算
- エクスポート処理を完了させる

【出力形式】
成功時: { success: true, directory_path: "path", manifest_path: "path/manifest.json", total_files: 5, total_size: 1024, file_list: [...] }
失敗時: { success: false, directory_path: "", manifest_path: "", total_files: 0, total_size: 0, file_list: [], error: "message" }

【使用タイミング】
全てのコンポーネント（conversations, insights, patterns, preferences）のエクスポートが完了した後に実行してください。`,
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
        experience_nature: summary.experience_nature,
        experience_summary: summary.experience_summary,
        experience_flow: summary.experience_flow,
        main_topics: summary.main_topics,
        files: {
          conversations: conversationFiles,
          insights: allFiles.includes('insights.json') ? 'insights.json' : '',
          patterns: allFiles.includes('patterns.json') ? 'patterns.json' : '',
          preferences: allFiles.includes('preferences.json') ? 'preferences.json' : '',
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