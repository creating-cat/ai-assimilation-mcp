/**
 * Basic tests for AI Assimilation MCP Server
 */

import { AIAssimilationMCPServer } from '../server/index';
import { loadConfig } from '../config/index';

describe('AIAssimilationMCPServer', () => {
  let server: AIAssimilationMCPServer;
  let config: any;

  beforeEach(() => {
    config = loadConfig();
    server = new AIAssimilationMCPServer(config);
  });

  afterEach(async () => {
    if (server) {
      await server.stop();
    }
  });

  test('should initialize with correct configuration', () => {
    expect(server).toBeInstanceOf(AIAssimilationMCPServer);
  });

  test('should have correct server configuration', () => {
    expect(config.server.name).toBe('ai-assimilation-mcp');
    expect(config.server.version).toBe('1.0.0');
  });

  test('should have correct storage configuration', () => {
    expect(config.storage.baseDirectory).toBe('./experiences');
    expect(config.storage.conversationBatchSize).toBe(50);
  });

  // Note: More comprehensive tests will be added as we implement the actual functionality
  test('should be ready for tool implementation', () => {
    // This test ensures the basic structure is in place
    expect(typeof server.start).toBe('function');
    expect(typeof server.stop).toBe('function');
  });
});