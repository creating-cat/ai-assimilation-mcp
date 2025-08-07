/**
 * AI Assimilation MCP Types
 * Core type definitions for the AI experience sharing system
 */

export interface ExperienceMetadata {
  mcp_version: string;
  ai_name: string;
  ai_context: string;
  experience_nature: string;
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

export interface ExportSession {
  export_id: string;
  directory_path: string;
  session_id: string;
  created_at: Date;
  status: 'initializing' | 'in_progress' | 'completed' | 'failed';
  expected_files: Record<string, number>;
  created_files: string[];
}

export interface ExperienceDirectoryInfo {
  mcp_version: string;
  directory_path: string;
  ai_name: string;
  ai_context: string;
  experience_nature: string;
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

export interface ValidationResult {
  valid: boolean;
  manifest_valid: boolean;
  semantic_valid: boolean;
  file_validations: Array<{
    file: string;
    valid: boolean;
    errors: string[];
  }>;
  missing_files: string[];
  errors: string[];
  warnings: string[];
}

export interface AssimilationGuide {
  success: boolean;
  guide_content: string;
  examples: string[];
  best_practices: string[];
  related_concepts: string[];
}

// MCP Tool Response Types
export interface MCPResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

export interface ExportInitResponse extends MCPResponse {
  data?: {
    export_id: string;
    directory_path: string;
    expected_files: Record<string, number>;
  };
}

export interface FileCreateResponse extends MCPResponse {
  data?: {
    file_path: string;
    file_size: number;
    items_count: number;
  };
}

export interface ExportFinalizeResponse extends MCPResponse {
  data?: {
    directory_path: string;
    manifest_path: string;
    total_files: number;
    total_size: number;
    file_list: string[];
  };
}

export interface ListExperiencesResponse extends MCPResponse {
  data?: {
    experience_directories: ExperienceDirectoryInfo[];
    directory_summaries: Array<{
      directory: string;
      summary: string;
      file_count: number;
    }>;
  };
}

// Re-export utility types
export type { FileOperationResult, DirectoryInfo } from '../utils/fileOperations.js';

// Re-export schema types
export type { SchemaType } from './schemas.js';