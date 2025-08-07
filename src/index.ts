#!/usr/bin/env node

/**
 * AI Assimilation MCP Server Entry Point
 */

import { loadConfig } from './config/index.js';
import { AIAssimilationMCPServer } from './server/index.js';
import { logger } from './utils/logger.js';

async function main() {
  try {
    // Load configuration
    const config = loadConfig();
    
    // Update logger configuration
    logger.info('Starting AI Assimilation MCP Server', {
      version: config.server.version,
      baseDirectory: config.storage.baseDirectory
    });

    // Create and start server
    const server = new AIAssimilationMCPServer(config);
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      logger.info('Received SIGINT, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      logger.info('Received SIGTERM, shutting down gracefully...');
      await server.stop();
      process.exit(0);
    });

    // Start the server
    await server.start();
    
  } catch (error) {
    logger.error('Failed to start server', { error: error instanceof Error ? error.message : String(error) });
    process.exit(1);
  }
}

// Run the server
main().catch((error) => {
  logger.error('Unhandled error in main', { error: error instanceof Error ? error.message : String(error) });
  process.exit(1);
});