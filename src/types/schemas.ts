/**
 * JSON Schema definitions for AI Assimilation MCP data validation
 */

import { JSONSchemaType } from 'ajv';
import { 
  ExperienceMetadata, 
  ConversationBatch
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
        thoughts: { type: 'string' }
      },
      required: ['conversations', 'thoughts'],
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

// Thoughts Schema (thoughts.json) - Free-form JSON for maximum AI flexibility
// No strict schema validation to allow creative expression

// Schema registry for easy access
export const schemas: Record<string, any> = {
  manifest: experienceMetadataSchema,
  conversations: conversationBatchSchema
  // thoughts.json uses no schema validation for maximum flexibility
};

export type SchemaType = 'manifest' | 'conversations';