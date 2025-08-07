/**
 * Data model and validation tests
 */

import { 
  validateExperienceMetadata,
  validateConversationBatch,
  validateInsights,
  validateReasoningPatterns,
  validateLearnedPreferences
} from '../utils/validation.js';
import { 
  ExperienceMetadata,
  ConversationBatch,
  Insight,
  ReasoningPattern,
  LearnedPreferences
} from '../types/index.js';

describe('Data Model Validation', () => {
  describe('Experience Metadata Validation', () => {
    const validMetadata: ExperienceMetadata = {
      mcp_version: '1.0.0',
      ai_name: 'Test AI',
      ai_context: 'Testing context',
      experience_nature: 'Test experience',
      experience_summary: 'A test summary',
      experience_flow: ['Step 1', 'Step 2'],
      files: {
        conversations: ['conversations_001.json'],
        insights: 'insights.json',
        patterns: 'patterns.json',
        preferences: 'preferences.json'
      },
      main_topics: ['topic1', 'topic2'],
      total_conversations: 10
    };

    it('should validate correct metadata', () => {
      const result = validateExperienceMetadata(validMetadata);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject metadata with missing required fields', () => {
      const invalidMetadata = { ...validMetadata };
      delete (invalidMetadata as any).ai_name;
      
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
        custom_metadata: { test: 'value' }
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
        end_index: 2
      },
      conversations: [
        {
          timestamp: '2024-01-01T00:00:00Z',
          user_input: 'Hello',
          ai_response: 'Hi there!',
          reasoning: 'Friendly greeting',
          confidence: 0.9
        },
        {
          timestamp: '2024-01-01T00:01:00Z',
          user_input: 'How are you?',
          ai_response: 'I am doing well, thank you!',
          reasoning: 'Polite response',
          confidence: 0.95
        }
      ]
    };

    it('should validate correct conversation batch', () => {
      const result = validateConversationBatch(validBatch);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about conversation count mismatch', () => {
      const mismatchBatch = {
        ...validBatch,
        batch_info: { ...validBatch.batch_info, count: 3 }
      };

      const result = validateConversationBatch(mismatchBatch);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('count mismatch');
    });

    it('should warn about chronological order issues', () => {
      const unorderedBatch: ConversationBatch = {
        ...validBatch,
        conversations: [
          {
            timestamp: '2024-01-01T00:01:00Z',
            user_input: 'Second',
            ai_response: 'Response'
          },
          {
            timestamp: '2024-01-01T00:00:00Z',
            user_input: 'First',
            ai_response: 'Response'
          }
        ]
      };

      const result = validateConversationBatch(unorderedBatch);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('chronological order');
    });
  });

  describe('Insights Validation', () => {
    const validInsights = {
      insights: [
        {
          topic: 'Communication',
          insight: 'User prefers brief responses',
          timestamp: '2024-01-01T00:00:00Z',
          evidence: ['Short questions', 'Quick acknowledgments'],
          confidence: 0.8
        }
      ]
    };

    it('should validate correct insights', () => {
      const result = validateInsights(validInsights);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject insights with invalid timestamp', () => {
      const invalidInsights = {
        insights: [
          {
            topic: 'Test',
            insight: 'Test insight',
            timestamp: 'invalid-timestamp'
          }
        ]
      };

      const result = validateInsights(invalidInsights);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should warn about duplicate topics', () => {
      const duplicateInsights = {
        insights: [
          {
            topic: 'Communication',
            insight: 'First insight',
            timestamp: '2024-01-01T00:00:00Z'
          },
          {
            topic: 'Communication',
            insight: 'Second insight',
            timestamp: '2024-01-01T00:01:00Z'
          }
        ]
      };

      const result = validateInsights(duplicateInsights);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Duplicate insight topic');
    });
  });

  describe('Reasoning Patterns Validation', () => {
    const validPatterns = {
      reasoning_patterns: [
        {
          pattern_type: 'Problem Solving',
          description: 'Break down complex problems',
          examples: ['Step-by-step approach'],
          effectiveness: 0.9
        }
      ]
    };

    it('should validate correct patterns', () => {
      const result = validateReasoningPatterns(validPatterns);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should warn about duplicate pattern types', () => {
      const duplicatePatterns = {
        reasoning_patterns: [
          {
            pattern_type: 'Problem Solving',
            description: 'First approach'
          },
          {
            pattern_type: 'Problem Solving',
            description: 'Second approach'
          }
        ]
      };

      const result = validateReasoningPatterns(duplicatePatterns);
      expect(result.valid).toBe(true);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('Duplicate pattern type');
    });
  });

  describe('Learned Preferences Validation', () => {
    const validPreferences = {
      learned_preferences: {
        user_preferences: {
          response_style: 'concise',
          technical_level: 'intermediate'
        },
        successful_approaches: ['Direct answers', 'Examples'],
        learning_algorithm: 'reinforcement_learning',
        adaptation_rate: 0.1
      }
    };

    it('should validate correct preferences', () => {
      const result = validateLearnedPreferences(validPreferences);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should accept empty preferences object', () => {
      const emptyPreferences = {
        learned_preferences: {}
      };

      const result = validateLearnedPreferences(emptyPreferences);
      expect(result.valid).toBe(true);
    });
  });
});