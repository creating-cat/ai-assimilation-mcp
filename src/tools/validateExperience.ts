/**
 * Validate Experience Tool
 * 体験データディレクトリの整合性検証
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { validateExperienceDirectoryFiles } from '../utils/fileOperations.js';

// Input schema validation
export const validateExperienceSchema = z.object({
  directory_path: z.string()
    .min(1, '検証する体験データディレクトリパスは必須です')
    .describe('検証する体験データディレクトリパス')
});

export type ValidateExperienceInput = z.infer<typeof validateExperienceSchema>;

export interface ValidateExperienceOutput {
  valid: boolean;
  manifest_valid: boolean;
  semantic_valid: boolean;
  file_validations: Array<{
    file: string;
    valid: boolean;
    errors: Array<{
      field: string;
      message: string;
      value?: any;
    }>;
    warnings: string[];
  }>;
  missing_files: string[];
  errors: string[];
  warnings: string[];
}

export const validateExperienceTool = {
  name: 'validate_experience',
  description: `体験データディレクトリの整合性検証

このツールは体験データディレクトリの完全性と整合性を検証します。
メインAIが体験データを読み込む前に、データの品質を確認するために使用します。

【主な検証項目】
- manifest.jsonの存在と形式検証
- 必須ファイルの存在確認
- 各ファイルのJSON形式検証
- データ構造の整合性チェック
- クロスファイル整合性（会話数の一致など）

【検証レベル】
1. **構文検証**: JSON形式の正確性
2. **スキーマ検証**: 必須フィールドの存在
3. **セマンティック検証**: データ間の論理的整合性
4. **クロスファイル検証**: ファイル間の整合性

【検証対象ファイル】
- manifest.json: メタデータとファイル情報
- conversations_*.json: 会話データバッチ
- insights.json: 洞察データ
- patterns.json: 推論パターン
- preferences.json: 学習嗜好

【出力形式】
成功時: { valid: true, manifest_valid: true, semantic_valid: true, file_validations: [...], missing_files: [], errors: [], warnings: [...] }
失敗時: { valid: false, manifest_valid: false, semantic_valid: false, file_validations: [...], missing_files: [...], errors: [...], warnings: [...] }

【使用タイミング】
- 体験データを読み込む前の事前チェック
- データ品質の確認
- 破損したファイルの検出
- 不完全なエクスポートの発見

【メインAIの活用方法】
検証結果を確認してから体験データの読み込みを開始することで、
エラーを回避し、信頼性の高い同化プロセスを実現できます。`,
  input_schema: validateExperienceSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Validate experience tool execution started', { 
      directoryPath: args.directory_path
    });

    try {
      // Validate input
      const validatedInput = validateExperienceSchema.parse(args);

      // Validate experience directory
      const result = await validateExperienceDirectoryFiles(validatedInput.directory_path);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to validate experience directory');
      }

      const validationResult = result.data;

      const executionTime = Date.now() - startTime;
      logger.info('Validate experience tool execution completed', {
        valid: validationResult.valid,
        manifestValid: validationResult.manifest_valid,
        semanticValid: validationResult.semantic_valid,
        errorCount: validationResult.errors.length,
        warningCount: validationResult.warnings.length,
        executionTime
      });

      const response: ValidateExperienceOutput = {
        valid: validationResult.valid,
        manifest_valid: validationResult.manifest_valid,
        semantic_valid: validationResult.semantic_valid,
        file_validations: validationResult.file_validations.map(fv => ({
          file: fv.file,
          valid: fv.valid,
          errors: fv.errors.map(error => ({
            field: error.field || 'unknown',
            message: error.message || 'Unknown error',
            value: error.value
          })),
          warnings: fv.warnings || []
        })),
        missing_files: validationResult.missing_files,
        errors: validationResult.errors,
        warnings: validationResult.warnings
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Validate experience tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ValidateExperienceOutput = {
        valid: false,
        manifest_valid: false,
        semantic_valid: false,
        file_validations: [],
        missing_files: [],
        errors: [errorMessage],
        warnings: []
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  }
};