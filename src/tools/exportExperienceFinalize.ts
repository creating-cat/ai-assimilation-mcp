/**
 * Export Experience Finalize Tool
 * エクスポート処理の完了とマニフェストファイル生成
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { exportManager } from '../server/exportManager.js';

// Input schema validation
export const exportExperienceFinalizeSchema = z.object({
  export_id: z.string()
    .min(1, 'エクスポート処理識別子は必須です')
    .describe('エクスポート処理識別子')
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
  description: `エクスポート処理の完了とマニフェストファイル生成

このツールはエクスポートプロセスを完了し、manifest.jsonファイルを生成します。
全ての体験データファイルの整合性を確認し、メインAIが読み込み可能な形式で統合情報を提供します。

【主な機能】
- manifest.jsonファイルの生成
- ファイル整合性の確認
- 総会話数の自動計算
- エクスポートセッションの完了処理

【manifest.jsonの内容】
- mcp_version: MCPプロトコルバージョン
- ai_name: AIの名前（体験提供者）
- ai_context: AIのコンテキスト
- experience_nature: 体験の性質
- experience_summary: 体験の概要
- experience_flow: 体験の流れ
- files: 含まれるファイル情報
- main_topics: 主要トピック
- total_conversations: 総会話数
- session_id: セッション識別子
- created_at: 作成日時

【出力形式】
成功時: { success: true, directory_path: "path", manifest_path: "path/manifest.json", total_files: 5, total_size: 1024, file_list: [...] }
失敗時: { success: false, directory_path: "", manifest_path: "", total_files: 0, total_size: 0, file_list: [], error: "message" }

【使用タイミング】
全てのコンポーネント（conversations, insights, patterns, preferences）のエクスポートが完了した後に実行してください。`,
  input_schema: exportExperienceFinalizeSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Export experience finalize tool execution started', { 
      exportId: args.export_id
    });

    try {
      // Validate input
      const validatedInput = exportExperienceFinalizeSchema.parse(args);

      // Finalize export
      const result = await exportManager.finalizeExport(validatedInput.export_id);

      const executionTime = Date.now() - startTime;
      logger.info('Export experience finalize tool execution completed', {
        success: result.success,
        totalFiles: result.total_files,
        totalSize: result.total_size,
        executionTime
      });

      const response: ExportExperienceFinalizeOutput = {
        success: result.success,
        directory_path: result.directory_path,
        manifest_path: result.manifest_path,
        total_files: result.total_files,
        total_size: result.total_size,
        file_list: result.file_list,
        error: result.error
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