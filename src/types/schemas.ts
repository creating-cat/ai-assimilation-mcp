/**
 * JSON Schema definitions for AI Assimilation MCP data validation
 */

import { JSONSchemaType } from 'ajv';
import { 
  ExperienceMetadata, 
  ConversationBatch, 
  Insight, 
  ReasoningPattern, 
  LearnedPreferences 
} from './index.js';

// Experience Metadata Schema (manifest.json)
export const experienceMetadataSchema: JSONSchemaType<ExperienceMetadata> = {
  type: 'object',
  properties: {
    mcp_version: { type: 'string' },
    ai_name: { type: 'string' },
    ai_context: { type: 'string' },
    experience_summary: { type: 'string' },
    experience_flow: {
      type: 'array',
      items: { type: 'string' }
    },
    files: {
      type: 'object',
      properties: {
        conversations: {
          type: 'array',
          items: { type: 'string' }
        },
        insights: { type: 'string' },
        patterns: { type: 'string' },
        preferences: { type: 'string' }
      },
      required: ['conversations', 'insights', 'patterns', 'preferences'],
      additionalProperties: false
    },
    main_topics: {
      type: 'array',
      items: { type: 'string' }
    },
    total_conversations: { type: 'integer', minimum: 0 },
    // Optional fields
    session_id: { type: 'string', nullable: true },
    created_at: { type: 'string', nullable: true },
    ai_model: { type: 'string', nullable: true },
    duration: { type: 'string', nullable: true },
    platform: { type: 'string', nullable: true },
    custom_metadata: { 
      type: 'object', 
      nullable: true,
      additionalProperties: true
    }
  },
  required: [
    'mcp_version',
    'ai_name', 
    'ai_context',
    'experience_summary',
    'experience_flow',
    'files',
    'main_topics',
    'total_conversations'
  ],
  additionalProperties: true
};

// Conversation Batch Schema (conversations_XXX.json)
export const conversationBatchSchema: JSONSchemaType<ConversationBatch> = {
  type: 'object',
  properties: {
    batch_info: {
      type: 'object',
      properties: {
        batch_number: { type: 'integer', minimum: 1 },
        count: { type: 'integer', minimum: 0 },
        start_index: { type: 'integer', minimum: 1, nullable: true },
        end_index: { type: 'integer', minimum: 1, nullable: true }
      },
      required: ['batch_number', 'count'],
      additionalProperties: false
    },
    conversations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          user_input: { type: 'string' },
          ai_response: { type: 'string' },
          reasoning: { type: 'string', nullable: true }
        },
        required: ['user_input', 'ai_response'],
        additionalProperties: true
      }
    }
  },
  required: ['batch_info', 'conversations'],
  additionalProperties: false
};

// Insights Schema (insights.json)
export const insightsSchema: JSONSchemaType<{ insights: Insight[] }> = {
  type: 'object',
  properties: {
    insights: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          topic: { type: 'string' },
          insight: { type: 'string' },
          timestamp: { type: 'string' },
          evidence: {
            type: 'array',
            items: { type: 'string' },
            nullable: true
          },
          confidence: { type: 'number', minimum: 0, maximum: 1, nullable: true },
          analysis_method: { type: 'string', nullable: true },
          related_conversations: {
            type: 'array',
            items: { type: 'integer' },
            nullable: true
          },
          statistical_significance: { type: 'number', minimum: 0, maximum: 1, nullable: true }
        },
        required: ['topic', 'insight', 'timestamp'],
        additionalProperties: true
      }
    }
  },
  required: ['insights'],
  additionalProperties: false
};

// Reasoning Patterns Schema (patterns.json)
export const reasoningPatternsSchema: JSONSchemaType<{ reasoning_patterns: ReasoningPattern[] }> = {
  type: 'object',
  properties: {
    reasoning_patterns: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          pattern_type: { type: 'string' },
          description: { type: 'string' },
          examples: {
            type: 'array',
            items: { type: 'string' },
            nullable: true
          },
          effectiveness: { type: 'number', minimum: 0, maximum: 1, nullable: true },
          usage_frequency: { type: 'number', minimum: 0, maximum: 1, nullable: true },
          success_contexts: {
            type: 'array',
            items: { type: 'string' },
            nullable: true
          },
          learned_from: {
            type: 'array',
            items: { type: 'string' },
            nullable: true
          }
        },
        required: ['pattern_type', 'description'],
        additionalProperties: true
      }
    }
  },
  required: ['reasoning_patterns'],
  additionalProperties: false
};

// Learned Preferences Schema (preferences.json)
export const learnedPreferencesSchema = {
  type: 'object',
  properties: {
    learned_preferences: {
      type: 'object',
      properties: {
        user_preferences: { 
          type: 'object', 
          nullable: true,
          additionalProperties: true
        },
        successful_approaches: {
          type: 'array',
          items: { type: 'string' },
          nullable: true
        },
        learning_algorithm: { type: 'string', nullable: true },
        adaptation_rate: { type: 'number', minimum: 0, maximum: 1, nullable: true },
        preference_confidence: {
          type: 'object',
          nullable: true,
          additionalProperties: { type: 'number' },
          required: []
        }
      },
      required: [],
      additionalProperties: true
    }
  },
  required: ['learned_preferences'],
  additionalProperties: false
} as const;

// Schema registry for easy access
export const schemas: Record<string, any> = {
  manifest: experienceMetadataSchema,
  conversations: conversationBatchSchema,
  insights: insightsSchema,
  patterns: reasoningPatternsSchema,
  preferences: learnedPreferencesSchema
};

export type SchemaType = 'manifest' | 'conversations' | 'insights' | 'patterns' | 'preferences';