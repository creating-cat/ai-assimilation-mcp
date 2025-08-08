/**
 * Export Experience Thoughts Tool
 * 思考・気づき・学びの自由形式記録
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { writeJsonFile } from '../utils/fileOperations.js';
import { join } from 'path';

// Input schema validation
export const exportExperienceThoughtsSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
  thoughts: z.record(z.any()).describe('思考・気づき・学びの自由形式記録')
});

export type ExportExperienceThoughtsInput = z.infer<typeof exportExperienceThoughtsSchema>;

export interface ExportExperienceThoughtsOutput {
  success: boolean;
  file_path: string;
  error?: string;
}

export const exportExperienceThoughtsTool = {
  name: 'export_experience_thoughts',
  description: `あなたの思考・気づき・学びを自由な形で記録します。会話データのエクスポート後に実行してください。固定的な構造に縛られず、あなたなりの方法で思考を整理できます。`,
  input_schema: exportExperienceThoughtsSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience thoughts tool execution started', {
      sessionId: args.session_id
    });

    try {
      // Validate input
      const { session_id, thoughts } = exportExperienceThoughtsSchema.parse(args);

      const directoryPath = getExperienceDirectoryPath(session_id);
      const filePath = join(directoryPath, 'thoughts.json');

      const writeResult = await writeJsonFile(filePath, thoughts, false); // No schema validation for free-form data
      if (!writeResult.success) {
        throw new Error(`Failed to write thoughts file: ${writeResult.error}`);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Export experience thoughts tool execution completed', {
        success: true,
        executionTime
      });

      const response: ExportExperienceThoughtsOutput = {
        success: true,
        file_path: filePath,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience thoughts tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperienceThoughtsOutput = {
        success: false,
        file_path: '',
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};