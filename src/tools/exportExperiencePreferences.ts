/**
 * Export Experience Preferences Tool
 * 学習した嗜好データの個別ファイル出力
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ExportManager } from '../server/exportManager.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();
const exportManager = new ExportManager(config.storage.baseDirectory);

// Input schema validation
export const exportExperiencePreferencesSchema = z.object({
  export_id: z.string()
    .min(1, 'エクスポート処理識別子は必須です')
    .describe('エクスポート処理識別子'),
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
  description: `学習した嗜好データの個別ファイル出力

このツールはAIが学習したユーザーの嗜好や成功パターンをpreferences.jsonファイルに出力します。
対話を通じて学習した相手の好みや効果的なアプローチを構造化して保存します。

【主な機能】
- 学習嗜好の構造化出力
- preferences.jsonファイルの作成
- ユーザー嗜好と成功アプローチの記録
- 学習アルゴリズムと適応率の保持

【学習嗜好の構造】
- user_preferences: ユーザーの嗜好（例: response_style, technical_level）
- successful_approaches: 成功したアプローチ（例: ["直接的な回答", "具体例の提示"]）
- learning_algorithm: 使用した学習アルゴリズム（オプション）
- adaptation_rate: 適応率（0-1、オプション）
- preference_confidence: 各嗜好の信頼度（オプション）

【出力形式】
成功時: { success: true, file_path: "path/preferences.json", items_count: 1 }
失敗時: { success: false, file_path: "", items_count: 0, error: "message" }`,
  input_schema: exportExperiencePreferencesSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience preferences tool execution started', { 
      exportId: args.export_id
    });

    try {
      // Validate input
      const validatedInput = exportExperiencePreferencesSchema.parse(args);

      // Export preferences
      const result = await exportManager.exportPreferences({
        export_id: validatedInput.export_id,
        data: validatedInput.learned_preferences
      });

      const executionTime = Date.now() - startTime;
      logger.info('Export experience preferences tool execution completed', {
        success: result.success,
        itemsCount: result.items_count,
        executionTime
      });

      const response: ExportExperiencePreferencesOutput = {
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