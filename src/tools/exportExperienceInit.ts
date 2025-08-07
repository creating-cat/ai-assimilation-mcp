/**
 * Export Experience Init Tool
 * 体験データエクスポートの初期化とディレクトリ構造作成
 */

import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger.js';
import { loadConfig } from '../config/index.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { ensureDirectory, writeJsonFile } from '../utils/fileOperations.js';
import { join } from 'path';

// Input schema validation
export const exportExperienceInitSchema = z.object({
  session_id: z.string()
    .optional()
    .describe('セッション識別子（省略時はUUIDを自動生成）'),
  metadata: z.object({})
    .passthrough()
    .describe('セッションメタデータ'),
  summary: z.object({
    ai_name: z.string().describe('AIの名前'),
    ai_context: z.string().describe('AIのコンテキスト'),
    experience_nature: z.string().describe('体験の性質'),
    experience_summary: z.string().describe('体験の概要'),
    experience_flow: z.array(z.string()).describe('体験の流れ'),
    main_topics: z.array(z.string()).describe('主要トピック'),
    estimated_conversations: z.number().int().min(0).describe('推定会話数')
  }).describe('体験データの概要')
});

export type ExportExperienceInitInput = z.infer<typeof exportExperienceInitSchema>;

export interface ExportExperienceInitOutput {
  success: boolean;
  session_id: string;
  directory_path: string;
  expected_files: Record<string, number>;
  error?: string;
}

export const exportExperienceInitTool = {
  name: 'export_experience_init',
  description: `AIの経験をファイルとして保存（エクスポート）するセッションを開始し、準備を整えます。このプロセスの最初のステップです。詳細な使い方は get_assimilation_guide ツールを参照してください。`,
  input_schema: exportExperienceInitSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    const config = loadConfig();
    logger.info('Export experience init tool execution started', { args });

    try {
      // Validate input
      const validatedInput = exportExperienceInitSchema.parse(args);

      const session_id = validatedInput.session_id || uuidv4();
      const directoryPath = getExperienceDirectoryPath(session_id);

      // Ensure output directory exists
      const dirResult = await ensureDirectory(directoryPath);
      if (!dirResult.success) {
        throw new Error(`Failed to create export directory: ${dirResult.error}`);
      }

      // Store summary and metadata to be used by finalize tool later
      const initialData = {
        summary: validatedInput.summary,
        metadata: validatedInput.metadata,
        session_id: session_id,
        created_at: new Date().toISOString(),
      };
      // This temporary file will be read by the finalize tool
      const summaryFilePath = join(directoryPath, 'summary.json');
      const writeResult = await writeJsonFile(summaryFilePath, initialData, false); // No schema for this temp file
      if (!writeResult.success) {
        throw new Error(`Failed to write initial summary file: ${writeResult.error}`);
      }

      // Calculate expected files
      const estimatedBatches = Math.ceil(validatedInput.summary.estimated_conversations / config.storage.conversationBatchSize);
      const expected_files: Record<string, number> = {
        manifest: 1,
        conversation_batches: estimatedBatches,
        insights: 1,
        patterns: 1,
        preferences: 1
      };

      const executionTime = Date.now() - startTime;
      logger.info('Export experience init tool execution completed', {
        success: true,
        sessionId: session_id,
        executionTime
      });

      const response: ExportExperienceInitOutput = {
        success: true,
        session_id,
        directory_path: directoryPath,
        expected_files,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience init tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperienceInitOutput = {
        success: false,
        session_id: '',
        directory_path: '',
        expected_files: {},
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};