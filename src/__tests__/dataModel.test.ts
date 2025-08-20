/**
 * Data model and validation tests (aligned with thoughts.json architecture)
 */

import {
  validateExperienceMetadata,
  validateConversationBatch,
  validateThoughts,
} from '../utils/validation.js';
import {
  ExperienceMetadata,
  ConversationBatch,
} from '../types/index.js';

describe('Data Model Validation (thoughts-based)', () => {
  describe('Experience Metadata Validation', () => {
    const validMetadata: ExperienceMetadata = {
      mcp_version: '1.0.0',
      ai_name: 'Test AI',
      ai_context: 'Testing context',
      experience_summary: 'A test summary',
      experience_flow: ['Step 1', 'Step 2'],
      files: {
        conversations: ['conversations_001.json'],
        thoughts: 'thoughts.json',
      },
      main_topics: ['topic1', 'topic2'],
      total_conversations: 10,
    };

    it('should validate correct metadata', () => {
      const result = validateExperienceMetadata(validMetadata);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject metadata with missing required fields', () => {
      const invalidMetadata = { ...validMetadata } as any;
      delete invalidMetadata.ai_name;

      const result = validateExperienceMetadata(invalidMetadata);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should accept metadata with optional fields', () => {
      const metadataWithOptional: ExperienceMetadata = {
        ...validMetadata,
        session_id: 'test-session',
        created_at: '2024-01-01T00:00:00Z',
        ai_model: 'test-model',
        duration: '1h',
        platform: 'test-platform',
        custom_metadata: { test: 'value' },
      };

      const result = validateExperienceMetadata(metadataWithOptional);
      expect(result.valid).toBe(true);
    });
  });

  describe('Conversation Batch Validation', () => {
    const validBatch: ConversationBatch = {
      batch_info: {
        batch_number: 1,
        count: 2,
        start_index: 1,
        end_index: 2,
      },
      conversations: [
        {
          user_input: 'Hello',
          ai_response: 'Hi there!',
          reasoning: 'Friendly greeting',
        },
        {
          user_input: 'How are you?',
          ai_response: 'I am doing well, thank you!',
          reasoning: 'Polite response',
        },
      ],
    };

    it('should validate correct conversation batch', () => {
      const result = validateConversationBatch(validBatch);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about conversation count mismatch', () => {
      const mismatchBatch: ConversationBatch = {
        ...validBatch,
        batch_info: { ...validBatch.batch_info, count: 3 },
      };

      const result = validateConversationBatch(mismatchBatch);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('mismatch');
    });
  });

  describe('Thoughts Validation', () => {
    it('should validate non-null thoughts object', () => {
      const validThoughts = {
        insights: [{ topic: 'test', content: 'test insight' }],
        patterns: [{ type: 'problem_solving', description: 'test pattern' }],
        reflections: 'This was a valuable learning experience',
      };
      const result = validateThoughts(validThoughts);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null or undefined thoughts', () => {
      const r1 = validateThoughts(null);
      expect(r1.valid).toBe(false);
      const r2 = validateThoughts(undefined);
      expect(r2.valid).toBe(false);
    });
  });
});
