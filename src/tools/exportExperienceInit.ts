/**
 * Export Experience Init Tool
 * 体験データエクスポートの初期化とディレクトリ構造作成
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { ExportManager } from '../server/exportManager.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();
const exportManager = new ExportManager(config.storage.baseDirectory);

// Input schema validation
export const exportExperienceInitSchema = z.object({
  session_id: z.string()
    .min(1, 'セッション識別子は必須です')
    .describe('セッション識別子'),
  output_directory: z.string()
    .min(1, '出力ディレクトリパスは必須です')
    .describe('出力ディレクトリパス'),
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
  export_id: string;
  directory_path: string;
  expected_files: Record<string, number>;
  error?: string;
}

export const exportExperienceInitTool = {
  name: 'export_experience_init',
  description: `体験データエクスポートの初期化とディレクトリ構造作成

このツールは体験データのエクスポートプロセスを開始し、必要なディレクトリ構造を作成します。
エクスポートセッションを管理するためのユニークなexport_idを生成し、後続のエクスポート操作で使用します。

【主な機能】
- エクスポート用ディレクトリの作成
- ユニークなexport_idの生成
- 推定ファイル数の計算
- エクスポートセッションの初期化

【出力形式】
成功時: { success: true, export_id: "uuid", directory_path: "path", expected_files: {...} }
失敗時: { success: false, export_id: "", directory_path: "", expected_files: {}, error: "message" }

【使用例】
1. export_experience_init でセッション初期化
2. export_experience_conversations で会話データをバッチ出力
3. export_experience_insights/patterns/preferences で各コンポーネント出力
4. export_experience_finalize でmanifest.json生成と完了`,
  input_schema: exportExperienceInitSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience init tool execution started', { args });

    try {
      // Validate input
      const validatedInput = exportExperienceInitSchema.parse(args);

      // Initialize export
      const result = await exportManager.initializeExport({
        session_id: validatedInput.session_id,
        output_directory: validatedInput.output_directory,
        metadata: validatedInput.metadata,
        summary: validatedInput.summary
      });

      const executionTime = Date.now() - startTime;
      logger.info('Export experience init tool execution completed', {
        success: result.success,
        exportId: result.export_id,
        executionTime
      });

      const response: ExportExperienceInitOutput = {
        success: result.success,
        export_id: result.export_id,
        directory_path: result.directory_path,
        expected_files: result.expected_files,
        error: result.error
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
        export_id: '',
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