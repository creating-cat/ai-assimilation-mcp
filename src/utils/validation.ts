/**
 * Data validation utilities using AJV
 */

import Ajv, { JSONSchemaType, ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';
import { 
  schemas, 
  SchemaType,
  experienceMetadataSchema,
  conversationBatchSchema,
  insightsSchema,
  reasoningPatternsSchema,
  learnedPreferencesSchema
} from '../types/schemas.js';
import { 
  ExperienceMetadata, 
  ConversationBatch, 
  Insight, 
  ReasoningPattern, 
  LearnedPreferences 
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
  conversations: ajv.compile(conversationBatchSchema),
  insights: ajv.compile(insightsSchema),
  patterns: ajv.compile(reasoningPatternsSchema),
  preferences: ajv.compile(learnedPreferencesSchema as any) // Type assertion for complex schema
} as const;

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
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
  
  const errors: ValidationError[] = [];
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
    
    // Check timestamp ordering
    for (let i = 1; i < batch.conversations.length; i++) {
      const prev = new Date(batch.conversations[i - 1].timestamp);
      const curr = new Date(batch.conversations[i].timestamp);
      
      if (curr < prev) {
        result.warnings.push(
          `Conversations not in chronological order at index ${i}`
        );
      }
    }
  }
  
  return result;
}

/**
 * Validate insights data
 */
export function validateInsights(data: unknown): ValidationResult {
  const result = validateData(data, 'insights');
  
  // Additional semantic validation
  if (result.valid && data && typeof data === 'object') {
    const insights = (data as { insights: Insight[] }).insights;
    
    // Check for duplicate topics
    const topics = new Set<string>();
    for (const insight of insights) {
      if (topics.has(insight.topic)) {
        result.warnings.push(`Duplicate insight topic: ${insight.topic}`);
      }
      topics.add(insight.topic);
    }
    
    // Validate timestamp format
    for (const insight of insights) {
      const date = new Date(insight.timestamp);
      if (isNaN(date.getTime())) {
        result.errors.push({
          field: 'insights.timestamp',
          message: `Invalid timestamp format: ${insight.timestamp}`,
          value: insight.timestamp
        });
        result.valid = false;
      }
    }
  }
  
  return result;
}

/**
 * Validate reasoning patterns data
 */
export function validateReasoningPatterns(data: unknown): ValidationResult {
  const result = validateData(data, 'patterns');
  
  // Additional semantic validation
  if (result.valid && data && typeof data === 'object') {
    const patterns = (data as { reasoning_patterns: ReasoningPattern[] }).reasoning_patterns;
    
    // Check for duplicate pattern types
    const types = new Set<string>();
    for (const pattern of patterns) {
      if (types.has(pattern.pattern_type)) {
        result.warnings.push(`Duplicate pattern type: ${pattern.pattern_type}`);
      }
      types.add(pattern.pattern_type);
    }
  }
  
  return result;
}

/**
 * Validate learned preferences data
 */
export function validateLearnedPreferences(data: unknown): ValidationResult {
  return validateData(data, 'preferences');
}

/**
 * Validate file content based on filename
 */
export function validateFileContent(filename: string, content: unknown): ValidationResult {
  if (filename === 'manifest.json') {
    return validateExperienceMetadata(content);
  } else if (filename.startsWith('conversations_') && filename.endsWith('.json')) {
    return validateConversationBatch(content);
  } else if (filename === 'insights.json') {
    return validateInsights(content);
  } else if (filename === 'patterns.json') {
    return validateReasoningPatterns(content);
  } else if (filename === 'preferences.json') {
    return validateLearnedPreferences(content);
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
export interface DirectoryValidationResult {
  valid: boolean;
  manifest_valid: boolean;
  semantic_valid: boolean;
  file_validations: Array<{
    file: string;
    valid: boolean;
    errors: ValidationError[];
    warnings: string[];
  }>;
  missing_files: string[];
  errors: string[];
  warnings: string[];
}

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
    manifest.files.insights,
    manifest.files.patterns,
    manifest.files.preferences
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