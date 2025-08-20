/**
 * End-to-end test for the stateless export flow (updated for thoughts.json architecture)
 */

import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

// Import the tools in current architecture
import { exportExperienceInitTool } from '../tools/exportExperienceInit.js';
import { exportExperienceConversationsTool } from '../tools/exportExperienceConversations.js';
import { exportExperienceThoughtsTool } from '../tools/exportExperienceThoughts.js';
import { exportExperienceFinalizeTool } from '../tools/exportExperienceFinalize.js';
import { getExportStatusTool } from '../tools/getExportStatus.js';

jest.mock('../config/index.js', () => ({
  loadConfig: jest.fn(),
}));
import { loadConfig } from '../config/index.js';

const mockedLoadConfig = loadConfig as jest.Mock;

describe('Stateless Export Flow E2E Test (thoughts-based)', () => {
  let testBaseDir: string;
  const sessionId = `e2e-test-${uuidv4()}`;

  beforeAll(async () => {
    testBaseDir = join(tmpdir(), `mcp-e2e-test-${Date.now()}`);
    await fs.mkdir(testBaseDir, { recursive: true });

    mockedLoadConfig.mockReturnValue({
      storage: {
        baseDirectory: testBaseDir,
        conversationBatchSize: 2, // small batch size for testing
      },
      server: {
        version: '1.0.0-test',
      },
    });
  });

  afterAll(async () => {
    await fs.rm(testBaseDir, { recursive: true, force: true });
  });

  let experienceDirPath: string;

  test('Step 1: export_experience_init should create a directory and a summary file', async () => {
    const initArgs = {
      session_id: sessionId,
      metadata: { platform: 'jest-test' },
      summary: {
        ai_name: 'Test E2E AI',
        ai_context: 'Testing the full export flow',
        experience_summary: 'This is a summary of the test.',
        experience_flow: ['init', 'add data', 'finalize'],
        main_topics: ['testing', 'stateless'],
      },
    };

    const result = await exportExperienceInitTool.execute(initArgs);
    const data = JSON.parse(result.content[0].text);

    expect(data.success).toBe(true);
    expect(data.session_id).toBe(sessionId);
    expect(data.directory_path).toContain(`experience_${sessionId}`);
    experienceDirPath = data.directory_path;

    const summaryPath = join(experienceDirPath, 'summary.json');
    const summaryExists = await fs.access(summaryPath).then(() => true).catch(() => false);
    expect(summaryExists).toBe(true);
  });

  test('Step 2: export_experience_conversations should write a batch file', async () => {
    const conversationArgs = {
      session_id: sessionId,
      batch_number: 1,
      conversations_batch: [
        { timestamp: new Date().toISOString(), user_input: 'q1', ai_response: 'a1', reasoning: 'r1' },
        { timestamp: new Date().toISOString(), user_input: 'q2', ai_response: 'a2', reasoning: 'r2' },
      ],
    };

    const result = await exportExperienceConversationsTool.execute(conversationArgs);
    const data = JSON.parse(result.content[0].text);

    expect(data.success).toBe(true);
    expect(data.file_path).toContain('conversations_001.json');
    expect(data.processed_count).toBe(2);
  });

  test('Step 3: export_experience_thoughts should write its file', async () => {
    const thoughtsResult = await exportExperienceThoughtsTool.execute({
      session_id: sessionId,
      thoughts: {
        insights: [{ topic: 'test', insight: 'it works', timestamp: new Date().toISOString() }],
        patterns: [{ pattern_type: 'test', description: 'it works' }],
        preferences: { user_preferences: { theme: 'dark' } },
      },
    });
    expect(JSON.parse(thoughtsResult.content[0].text).success).toBe(true);

    // Check that file was actually created
    const files = await fs.readdir(experienceDirPath);
    expect(files).toContain('thoughts.json');
  });

  test('Step 4: get_export_status should report "in_progress"', async () => {
    const statusResult = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(statusResult.content[0].text);

    expect(data.status).toBe('in_progress');
    expect(data.next_batch_number).toBe(2); // conversations_001.json exists
  });

  test('Step 5: export_experience_finalize should create manifest.json and clean up', async () => {
    const finalizeResult = await exportExperienceFinalizeTool.execute({ session_id: sessionId });
    const data = JSON.parse(finalizeResult.content[0].text);

    expect(data.success).toBe(true);
    expect(data.manifest_path).toContain('manifest.json');

    // After finalize, we expect manifest + conversations + thoughts
    expect(data.total_files).toBe(3);

    // Check that manifest.json was created
    const manifestExists = await fs.access(data.manifest_path).then(() => true).catch(() => false);
    expect(manifestExists).toBe(true);

    // Check that summary.json was deleted
    const summaryPath = join(experienceDirPath, 'summary.json');
    const summaryExists = await fs.access(summaryPath).then(() => true).catch(() => false);
    expect(summaryExists).toBe(false);

    // Check manifest content
    const manifestContent = JSON.parse(await fs.readFile(data.manifest_path, 'utf-8'));
    expect(manifestContent.ai_name).toBe('Test E2E AI');
    expect(manifestContent.total_conversations).toBe(2);
    expect(manifestContent.files.conversations).toEqual(['conversations_001.json']);
    expect(manifestContent.files.thoughts).toBe('thoughts.json');
  });

  test('Step 6: get_export_status should report "completed"', async () => {
    const statusResult = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(statusResult.content[0].text);

    expect(data.status).toBe('completed');
    expect(data.next_batch_number).toBe(-1);
  });
});
