/**
 * AI Assimilation MCP Types
 * Core type definitions for the AI experience sharing system
 */

export interface ExperienceMetadata {
  mcp_version: string;
  ai_name: string;
  ai_context: string;
  experience_summary: string;
  experience_flow: string[];
  files: {
    conversations: string[];
    insights: string;
    patterns: string;
    preferences: string;
  };
  main_topics: string[];
  total_conversations: number;
  // Optional fields
  session_id?: string;
  created_at?: string;
  ai_model?: string;
  duration?: string;
  platform?: string;
  custom_metadata?: Record<string, any>;
}

export interface ExperienceSummary {
  ai_name: string;
  ai_context: string;
  experience_summary: string;
  experience_flow: string[];
  main_topics: string[];
}

export interface ConversationBatch {
  batch_info: {
    batch_number: number;
    count: number;
    start_index?: number;
    end_index?: number;
  };
  conversations: Conversation[];
}

export interface Conversation {
  timestamp: string;
  user_input: string;
  ai_response: string;
  reasoning?: string;
  confidence?: number;
  context?: Record<string, any>;
  internal_state?: Record<string, any>;
}

export interface Insight {
  topic: string;
  insight: string;
  timestamp: string;
  evidence?: string[];
  confidence?: number;
  analysis_method?: string;
  related_conversations?: number[];
  statistical_significance?: number;
}

export interface ReasoningPattern {
  pattern_type: string;
  description: string;
  examples?: string[];
  effectiveness?: number;
  usage_frequency?: number;
  success_contexts?: string[];
  learned_from?: string[];
}

export interface LearnedPreferences {
  user_preferences?: Record<string, any>;
  successful_approaches?: string[];
  learning_algorithm?: string;
  adaptation_rate?: number;
  preference_confidence?: Record<string, number>;
}

export interface ExperienceDirectoryInfo {
  mcp_version: string;
  directory_path: string;
  ai_name: string;
  ai_context: string;
  experience_summary: string;
  experience_flow: string[];
  main_topics: string[];
  total_conversations: number;
  // Optional fields
  session_id?: string;
  created_at?: Date;
  ai_model?: string;
  duration?: string;
  platform?: string;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  value?: any;
}

export interface FileValidation {
  file: string;
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: string[];
}

export interface DirectoryValidationResult {
  valid: boolean;
  manifest_valid: boolean;
  semantic_valid: boolean;
  file_validations: FileValidation[];
  missing_files: string[];
  errors: string[];
  warnings: string[];
}

export type ExperienceStatus = 'completed' | 'in_progress' | 'initializing' | 'not_found';

export interface ExportStatusResult {
  status: ExperienceStatus;
  directory_path: string;
  created_files: string[];
  next_batch_number: number;
  error?: string;
  warnings?: string[];
}

export interface AssimilationGuide {
  success: boolean;
  guide_content: string;
  examples: string[];
  best_practices: string[];
  related_concepts: string[];
}

// Re-export utility types
export type { FileOperationResult, DirectoryInfo } from '../utils/fileOperations.js';

// Re-export schema types
export type { SchemaType } from './schemas.js';