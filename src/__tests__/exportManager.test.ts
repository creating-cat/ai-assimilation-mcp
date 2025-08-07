/**
 * Export Manager tests
 */

import { ExportManager } from '../server/exportManager.js';
import { 
  ExperienceMetadata,
  ConversationBatch,
  Insight,
  ReasoningPattern,
  LearnedPreferences
} from '../types/index.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

describe('ExportManager', () => {
  let exportManager: ExportManager;
  let testBaseDir: string;

  beforeEach(async () => {
    // Create temporary directory for tests
    testBaseDir = join(tmpdir(), `ai-assimilation-test-${Date.now()}`);
    await fs.mkdir(testBaseDir, { recursive: true });
    exportManager = new ExportManager(testBaseDir);
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rm(testBaseDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('initializeExport', () => {
    const validInitParams = {
      session_id: 'test-session-123',
      output_directory: '',
      metadata: {
        ai_model: 'test-model',
        platform: 'test-platform'
      },
      summary: {
        ai_name: 'Test AI',
        ai_context: 'Testing context',
        experience_nature: 'Test experience',
        experience_summary: 'A test summary',
        experience_flow: ['Step 1', 'Step 2'],
        main_topics: ['topic1', 'topic2'],
        estimated_conversations: 100
      }
    };

    it('should initialize export session successfully', async () => {
      const params = { ...validInitParams, output_directory: testBaseDir };
      const result = await exportManager.initializeExport(params);

      expect(result.success).toBe(true);
      expect(result.export_id).toBeTruthy();
      expect(result.directory_path).toContain('experience_test-session-123');
      expect(result.expected_files).toEqual({
        manifest: 1,
        conversation_batches: 2, // 100 conversations / 50 per batch = 2 batches
        insights: 1,
        patterns: 1,
        preferences: 1
      });

      // Check if directory was created
      const dirExists = await fs.access(result.directory_path).then(() => true).catch(() => false);
      expect(dirExists).toBe(true);
    });

    it('should handle directory creation failure', async () => {
      const params = { 
        ...validInitParams, 
        output_directory: '/invalid/path/that/does/not/exist' 
      };
      const result = await exportManager.initializeExport(params);

      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should calculate expected files correctly', async () => {
      const params = { 
        ...validInitParams, 
        output_directory: testBaseDir,
        summary: {
          ...validInitParams.summary,
          estimated_conversations: 125 // Should result in 3 batches
        }
      };
      const result = await exportManager.initializeExport(params);

      expect(result.success).toBe(true);
      expect(result.expected_files.conversation_batches).toBe(3);
    });
  });

  describe('exportConversationBatch', () => {
    let exportId: string;
    let directoryPath: string;

    beforeEach(async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });
      exportId = initResult.export_id;
      directoryPath = initResult.directory_path;
    });

    it('should export conversation batch successfully', async () => {
      const conversations = [
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
      ];

      const result = await exportManager.exportConversationBatch({
        export_id: exportId,
        conversations_batch: conversations,
        batch_number: 1,
        is_final_batch: true
      });

      expect(result.success).toBe(true);
      expect(result.file_path).toContain('conversations_001.json');
      expect(result.processed_count).toBe(2);
      expect(result.batch_file_size).toBeGreaterThan(0);

      // Check if file was created and has correct content
      const fileContent = await fs.readFile(result.file_path, 'utf-8');
      const batchData = JSON.parse(fileContent) as ConversationBatch;
      
      expect(batchData.batch_info.batch_number).toBe(1);
      expect(batchData.batch_info.count).toBe(2);
      expect(batchData.conversations).toHaveLength(2);
      expect(batchData.conversations[0].user_input).toBe('Hello');
    });

    it('should handle invalid export_id', async () => {
      const result = await exportManager.exportConversationBatch({
        export_id: 'invalid-export-id',
        conversations_batch: [],
        batch_number: 1,
        is_final_batch: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Export session not found');
    });

    it('should create correct batch filename with padding', async () => {
      const conversations = [{ 
        timestamp: '2024-01-01T00:00:00Z',
        user_input: 'Test',
        ai_response: 'Response'
      }];

      const result = await exportManager.exportConversationBatch({
        export_id: exportId,
        conversations_batch: conversations,
        batch_number: 12,
        is_final_batch: false
      });

      expect(result.success).toBe(true);
      expect(result.file_path).toContain('conversations_012.json');
    });
  });

  describe('exportInsights', () => {
    let exportId: string;

    beforeEach(async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });
      exportId = initResult.export_id;
    });

    it('should export insights successfully', async () => {
      const insights: Insight[] = [
        {
          topic: 'Communication',
          insight: 'User prefers brief responses',
          timestamp: '2024-01-01T00:00:00Z',
          evidence: ['Short questions', 'Quick acknowledgments'],
          confidence: 0.8
        }
      ];

      const result = await exportManager.exportInsights({
        export_id: exportId,
        data: insights
      });

      expect(result.success).toBe(true);
      expect(result.file_path).toContain('insights.json');
      expect(result.items_count).toBe(1);

      // Check file content
      const fileContent = await fs.readFile(result.file_path, 'utf-8');
      const insightsData = JSON.parse(fileContent);
      
      expect(insightsData.insights).toHaveLength(1);
      expect(insightsData.insights[0].topic).toBe('Communication');
    });
  });

  describe('exportPatterns', () => {
    let exportId: string;

    beforeEach(async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });
      exportId = initResult.export_id;
    });

    it('should export patterns successfully', async () => {
      const patterns: ReasoningPattern[] = [
        {
          pattern_type: 'Problem Solving',
          description: 'Break down complex problems',
          examples: ['Step-by-step approach'],
          effectiveness: 0.9
        }
      ];

      const result = await exportManager.exportPatterns({
        export_id: exportId,
        data: patterns
      });

      expect(result.success).toBe(true);
      expect(result.file_path).toContain('patterns.json');
      expect(result.items_count).toBe(1);

      // Check file content
      const fileContent = await fs.readFile(result.file_path, 'utf-8');
      const patternsData = JSON.parse(fileContent);
      
      expect(patternsData.reasoning_patterns).toHaveLength(1);
      expect(patternsData.reasoning_patterns[0].pattern_type).toBe('Problem Solving');
    });
  });

  describe('exportPreferences', () => {
    let exportId: string;

    beforeEach(async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });
      exportId = initResult.export_id;
    });

    it('should export preferences successfully', async () => {
      const preferences: LearnedPreferences = {
        user_preferences: {
          response_style: 'concise',
          technical_level: 'intermediate'
        },
        successful_approaches: ['Direct answers', 'Examples'],
        learning_algorithm: 'reinforcement_learning',
        adaptation_rate: 0.1
      };

      const result = await exportManager.exportPreferences({
        export_id: exportId,
        data: preferences
      });

      expect(result.success).toBe(true);
      expect(result.file_path).toContain('preferences.json');
      expect(result.items_count).toBe(1);

      // Check file content
      const fileContent = await fs.readFile(result.file_path, 'utf-8');
      const preferencesData = JSON.parse(fileContent);
      
      expect(preferencesData.learned_preferences.user_preferences.response_style).toBe('concise');
    });
  });

  describe('finalizeExport', () => {
    let exportId: string;
    let directoryPath: string;

    beforeEach(async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session-final',
        output_directory: testBaseDir,
        metadata: {
          ai_model: 'test-model',
          duration: '1h'
        },
        summary: {
          ai_name: 'Test AI Final',
          ai_context: 'Final testing context',
          experience_nature: 'Final test experience',
          experience_summary: 'A final test summary',
          experience_flow: ['Init', 'Process', 'Finalize'],
          main_topics: ['finalization', 'testing'],
          estimated_conversations: 4
        }
      });
      exportId = initResult.export_id;
      directoryPath = initResult.directory_path;

      // Add some test data
      await exportManager.exportConversationBatch({
        export_id: exportId,
        conversations_batch: [
          { timestamp: '2024-01-01T00:00:00Z', user_input: 'Test 1', ai_response: 'Response 1' },
          { timestamp: '2024-01-01T00:01:00Z', user_input: 'Test 2', ai_response: 'Response 2' }
        ],
        batch_number: 1,
        is_final_batch: false
      });

      await exportManager.exportInsights({
        export_id: exportId,
        data: [{ topic: 'Test', insight: 'Test insight', timestamp: '2024-01-01T00:00:00Z' }]
      });

      await exportManager.exportPatterns({
        export_id: exportId,
        data: [{ pattern_type: 'Test', description: 'Test pattern' }]
      });

      await exportManager.exportPreferences({
        export_id: exportId,
        data: { user_preferences: { test: 'value' } }
      });
    });

    it('should finalize export successfully', async () => {
      const result = await exportManager.finalizeExport(exportId);

      expect(result.success).toBe(true);
      expect(result.directory_path).toBe(directoryPath);
      expect(result.manifest_path).toContain('manifest.json');
      expect(result.total_files).toBe(5); // conversations, insights, patterns, preferences, manifest
      expect(result.total_size).toBeGreaterThan(0);
      expect(result.file_list).toContain('manifest.json');
      expect(result.file_list).toContain('conversations_001.json');

      // Check manifest content
      const manifestContent = await fs.readFile(result.manifest_path, 'utf-8');
      const manifest = JSON.parse(manifestContent) as ExperienceMetadata;
      
      expect(manifest.mcp_version).toBe('1.0.0');
      expect(manifest.session_id).toBe('test-session-final');
      expect(manifest.total_conversations).toBe(2);
      expect(manifest.files.conversations).toContain('conversations_001.json');
    });

    it('should handle invalid export_id', async () => {
      const result = await exportManager.finalizeExport('invalid-export-id');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Export session not found');
    });

    it('should clean up session after finalization', async () => {
      await exportManager.finalizeExport(exportId);
      
      // Session should be removed from active sessions
      const session = exportManager.getSession(exportId);
      expect(session).toBeUndefined();
    });
  });

  describe('session management', () => {
    it('should track active sessions', async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });

      const session = exportManager.getSession(initResult.export_id);
      expect(session).toBeDefined();
      expect(session?.session_id).toBe('test-session');
      expect(session?.status).toBe('initializing');

      const activeSessions = exportManager.getActiveSessions();
      expect(activeSessions).toHaveLength(1);
    });

    it('should cancel export session', async () => {
      const initResult = await exportManager.initializeExport({
        session_id: 'test-session',
        output_directory: testBaseDir,
        metadata: {},
        summary: {
          ai_name: 'Test AI',
          ai_context: 'Testing',
          experience_nature: 'Test',
          experience_summary: 'Test',
          experience_flow: ['Test'],
          main_topics: ['test'],
          estimated_conversations: 50
        }
      });

      const cancelled = exportManager.cancelExport(initResult.export_id);
      expect(cancelled).toBe(true);

      const session = exportManager.getSession(initResult.export_id);
      expect(session).toBeUndefined();
    });
  });
});