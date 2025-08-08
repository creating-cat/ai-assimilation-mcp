/**
 * Validate Experience Tool
 * 体験データディレクトリの整合性検証
 */

import { z } from 'zod';
import { DirectoryValidationResult, FileValidation, ValidationErrorDetail } from '../types/index.js';
import { logger } from '../utils/logger.js';
import { validateExperienceDirectoryFiles } from '../utils/fileOperations.js';

// Input schema validation
export const validateExperienceSchema = z.object({
  directory_path: z.string()
    .min(1, '検証する体験データディレクトリパスは必須です')
    .describe('検証する体験データディレクトリパス')
});

export type ValidateExperienceInput = z.infer<typeof validateExperienceSchema>;

export const validateExperienceTool = {
  name: 'validate_experience',
  description: `体験データの整合性を検証します。他のAIの経験を学習する前に、データの品質と安全性を確認するために使用してください。`,
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

      const response: DirectoryValidationResult = {
        valid: validationResult.valid,
        manifest_valid: validationResult.manifest_valid,
        semantic_valid: validationResult.semantic_valid,
        file_validations: validationResult.file_validations.map((fv: FileValidation) => ({
          file: fv.file,
          valid: fv.valid,
          errors: fv.errors.map((error: ValidationErrorDetail) => ({
            field: error.field,
            message: error.message,
            value: error.value
          })),
          warnings: fv.warnings
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

      const errorResponse: DirectoryValidationResult = {
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