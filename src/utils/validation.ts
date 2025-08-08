/**
 * Data validation utilities using AJV
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  schemas, 
  SchemaType,
  experienceMetadataSchema,
  conversationBatchSchema
} from '../types/schemas.js';
import { 
  ExperienceMetadata, 
  ConversationBatch,
  ValidationErrorDetail,
  DirectoryValidationResult,
} from '../types/index.js';

// Initialize AJV with formats support
const ajv = new Ajv({ 
  allErrors: true,
  verbose: true,
  strict: false // Allow additional properties for extensibility
});
addFormats(ajv);

// Compile validators
const validators = {
  manifest: ajv.compile(experienceMetadataSchema),
  conversations: ajv.compile(conversationBatchSchema)
  // thoughts.json uses no schema validation for maximum flexibility
} as const;

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: string[];
}

/**
 * Validate data against a specific schema
 */
export function validateData<T>(
  data: unknown, 
  schemaType: SchemaType
): ValidationResult {
  const validator = validators[schemaType];
  const valid = validator(data);
  
  const errors: ValidationErrorDetail[] = [];
  const warnings: string[] = [];
  
  if (!valid && validator.errors) {
    for (const error of validator.errors) {
      errors.push({
        field: error.instancePath || error.schemaPath,
        message: error.message || 'Validation error',
        value: error.data
      });
    }
  }
  
  return {
    valid,
    errors,
    warnings
  };
}

/**
 * Validate experience metadata (manifest.json)
 */
export function validateExperienceMetadata(data: unknown): ValidationResult {
  return validateData(data, 'manifest');
}

/**
 * Validate conversation batch data
 */
export function validateConversationBatch(data: unknown): ValidationResult {
  const result = validateData(data, 'conversations');
  
  // Additional semantic validation
  if (result.valid && data && typeof data === 'object') {
    const batch = data as ConversationBatch;
    
    // Check if conversation count matches batch info
    if (batch.conversations.length !== batch.batch_info.count) {
      result.warnings.push(
        `Conversation count mismatch: expected ${batch.batch_info.count}, got ${batch.conversations.length}`
      );
    }
    
    // Note: Conversation order is maintained by array index
  }
  
  return result;
}

/**
 * Validate thoughts data - No strict validation for maximum AI flexibility
 */
export function validateThoughts(data: unknown): ValidationResult {
  // Basic JSON validity check only
  if (data === null || data === undefined) {
    return {
      valid: false,
      errors: [{ field: 'thoughts', message: 'Thoughts data cannot be null or undefined', value: data }],
      warnings: []
    };
  }
  
  return {
    valid: true,
    errors: [],
    warnings: []
  };
}

/**
 * Validate file content based on filename
 */
export function validateFileContent(filename: string, content: unknown): ValidationResult {
  if (filename === 'manifest.json') {
    return validateExperienceMetadata(content);
  } else if (filename.startsWith('conversations_') && filename.endsWith('.json')) {
    return validateConversationBatch(content);
  } else if (filename === 'thoughts.json') {
    return validateThoughts(content);
  } else {
    return {
      valid: false,
      errors: [{
        field: 'filename',
        message: `Unknown file type: ${filename}`,
        value: filename
      }],
      warnings: []
    };
  }
}

/**
 * Validate complete experience directory structure
 */
export function validateExperienceDirectory(
  manifest: ExperienceMetadata,
  files: Record<string, unknown>
): DirectoryValidationResult {
  const result: DirectoryValidationResult = {
    valid: true,
    manifest_valid: true,
    semantic_valid: true,
    file_validations: [],
    missing_files: [],
    errors: [],
    warnings: []
  };
  
  // Validate manifest
  const manifestValidation = validateExperienceMetadata(manifest);
  result.manifest_valid = manifestValidation.valid;
  
  if (!manifestValidation.valid) {
    result.valid = false;
    result.errors.push(...manifestValidation.errors.map(e => e.message));
  }
  result.warnings.push(...manifestValidation.warnings);
  
  // Check for required files
  const expectedFiles = [
    ...manifest.files.conversations,
    manifest.files.thoughts
  ];
  
  for (const expectedFile of expectedFiles) {
    if (!(expectedFile in files)) {
      result.missing_files.push(expectedFile);
      result.valid = false;
    }
  }
  
  // Validate each file
  for (const [filename, content] of Object.entries(files)) {
    const fileValidation = validateFileContent(filename, content);
    
    result.file_validations.push({
      file: filename,
      valid: fileValidation.valid,
      errors: fileValidation.errors,
      warnings: fileValidation.warnings
    });
    
    if (!fileValidation.valid) {
      result.valid = false;
      result.semantic_valid = false;
    }
    
    result.warnings.push(...fileValidation.warnings);
  }
  
  // Cross-file validation
  if (result.manifest_valid) {
    // Check conversation count consistency
    let totalConversations = 0;
    for (const convFile of manifest.files.conversations) {
      if (convFile in files) {
        const batch = files[convFile] as ConversationBatch;
        totalConversations += batch.conversations.length;
      }
    }
    
    if (totalConversations !== manifest.total_conversations) {
      result.warnings.push(
        `Total conversation count mismatch: manifest says ${manifest.total_conversations}, found ${totalConversations}`
      );
    }
  }
  
  return result;
}