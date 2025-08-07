/**
 * Export Experience Preferences Tool
 * 学習した嗜好データの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { getExperienceDirectoryPath } from '../utils/experience.js';
import { writeLearnedPreferences } from '../utils/fileOperations.js';
import { join } from 'path';

// Input schema validation
export const exportExperiencePreferencesSchema = z.object({
  session_id: z.string().min(1, 'セッション識別子は必須です').describe('エクスポートセッションの識別子'),
  learned_preferences: z.object({
    user_preferences: z.record(z.any()).optional().describe('ユーザー嗜好'),
    successful_approaches: z.array(z.string()).optional().describe('成功したアプローチ'),
    learning_algorithm: z.string().optional().describe('学習アルゴリズム'),
    adaptation_rate: z.number().min(0).max(1).optional().describe('適応率'),
    preference_confidence: z.record(z.number()).optional().describe('嗜好の信頼度')
  }).passthrough().describe('学習した嗜好データ')
});

export type ExportExperiencePreferencesInput = z.infer<typeof exportExperiencePreferencesSchema>;

export interface ExportExperiencePreferencesOutput {
  success: boolean;
  file_path: string;
  items_count: number;
  error?: string;
}

export const exportExperiencePreferencesTool = {
  name: 'export_experience_preferences',
  description: `AIが対話を通じて学習した「ユーザーの好み」や「成功したアプローチ」を、preferences.jsonファイルに書き出します。

どのような応答が好まれたか、どんなアプローチが効果的だったか、といった情報を保存することで、対話の質を再現・向上させるのに役立ちます。

【主な機能】
- ユーザーの好みや成功したアプローチをオブジェクト形式でファイルに保存

【出力形式】
成功時: { success: true, file_path: "path/preferences.json", items_count: 1 }
失敗時: { success: false, file_path: "", items_count: 0, error: "message" }`,
  input_schema: exportExperiencePreferencesSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience preferences tool execution started', {
      sessionId: args.session_id
    });

    try {
      // Validate input
      const { session_id, learned_preferences } = exportExperiencePreferencesSchema.parse(args);

      const directoryPath = getExperienceDirectoryPath(session_id);
      const filePath = join(directoryPath, 'preferences.json');

      const writeResult = await writeLearnedPreferences(filePath, learned_preferences);
      if (!writeResult.success) {
        throw new Error(`Failed to write preferences file: ${writeResult.error}`);
      }

      const executionTime = Date.now() - startTime;
      logger.info('Export experience preferences tool execution completed', {
        success: true,
        itemsCount: 1, // Preferences is a single object
        executionTime
      });

      const response: ExportExperiencePreferencesOutput = {
        success: true,
        file_path: filePath,
        items_count: 1,
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export experience preferences tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ExportExperiencePreferencesOutput = {
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