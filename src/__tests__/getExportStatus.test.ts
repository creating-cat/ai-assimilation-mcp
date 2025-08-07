/**
 * Test for get_export_status tool
 */

import { getExportStatusTool } from '../tools/getExportStatus.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

jest.mock('../config/index.js', () => ({
  loadConfig: jest.fn(),
}));
import { loadConfig } from '../config/index.js';

const mockedLoadConfig = loadConfig as jest.Mock;

describe('get_export_status tool', () => {
  let testBaseDir: string;
  const sessionId = 'test-status-session';

  beforeEach(async () => {
    testBaseDir = join(tmpdir(), `mcp-test-${Date.now()}`);
    await fs.mkdir(testBaseDir, { recursive: true });
    mockedLoadConfig.mockReturnValue({
      storage: {
        baseDirectory: testBaseDir,
      },
    });
  });

  afterEach(async () => {
    await fs.rm(testBaseDir, { recursive: true, force: true });
  });

  it('should return "not_found" if directory does not exist', async () => {
    const result = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(result.content[0].text);
    expect(data.status).toBe('not_found');
  });

  it('should return "initializing" if directory exists but is empty', async () => {
    const experienceDir = join(testBaseDir, `experience_${sessionId}`);
    await fs.mkdir(experienceDir, { recursive: true });

    const result = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(result.content[0].text);

    expect(data.status).toBe('initializing');
    expect(data.next_batch_number).toBe(1);
  });

  it('should return "in_progress" and correct next_batch_number if conversation files exist', async () => {
    const experienceDir = join(testBaseDir, `experience_${sessionId}`);
    await fs.mkdir(experienceDir, { recursive: true });
    await fs.writeFile(join(experienceDir, 'conversations_001.json'), '{}');
    await fs.writeFile(join(experienceDir, 'conversations_002.json'), '{}');

    const result = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(result.content[0].text);

    expect(data.status).toBe('in_progress');
    expect(data.created_files).toContain('conversations_001.json');
    expect(data.created_files).toContain('conversations_002.json');
    expect(data.next_batch_number).toBe(3);
  });

  it('should return "completed" if manifest.json exists', async () => {
    const experienceDir = join(testBaseDir, `experience_${sessionId}`);
    await fs.mkdir(experienceDir, { recursive: true });
    await fs.writeFile(join(experienceDir, 'manifest.json'), '{}');

    const result = await getExportStatusTool.execute({ session_id: sessionId });
    const data = JSON.parse(result.content[0].text);

    expect(data.status).toBe('completed');
    expect(data.next_batch_number).toBe(-1);
  });
});

