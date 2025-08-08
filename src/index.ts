#!/usr/bin/env node

/**
 * AI Assimilation MCP Server
 * AI体験データの共有・同化を支援するMCPサーバー
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { exportExperienceInitTool } from './tools/exportExperienceInit.js';
import { exportExperienceConversationsTool } from './tools/exportExperienceConversations.js';
import { exportExperienceThoughtsTool } from './tools/exportExperienceThoughts.js';
import { exportExperienceFinalizeTool } from './tools/exportExperienceFinalize.js';
import { listExperiencesTool } from './tools/listExperiences.js';
import { validateExperienceTool } from './tools/validateExperience.js';
import { getAssimilationGuideTool } from './tools/getAssimilationGuide.js';
import { getExportStatusTool } from './tools/getExportStatus.js';
import { logger } from './utils/logger.js';
import { loadConfig } from './config/index.js';

// 設定を読み込み
const config = loadConfig();

// 必要な環境変数を検証
function validateEnvironment(): void {
  // 基本的な検証（必要に応じて拡張）
  if (!config.storage.baseDirectory) {
    logger.error('Invalid storage configuration', { baseDirectory: config.storage.baseDirectory });
    console.error('Error: Invalid storage configuration');
    process.exit(1);
  }
}

// 開始前に環境を検証
validateEnvironment();

// MCPサーバーを作成
const server = new McpServer({
  name: config.server.name,
  version: config.server.version,
  description: config.server.description,
});

// 新しいステータス確認ツールを登録
server.tool(
  getExportStatusTool.name,
  getExportStatusTool.description,
  getExportStatusTool.input_schema.shape,
  async (args) => {
    try {
      const result = await getExportStatusTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get export status tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            status: 'not_found',
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

// エクスポートツールを登録
server.tool(
  exportExperienceInitTool.name,
  exportExperienceInitTool.description,
  exportExperienceInitTool.input_schema.shape,
  async (args) => {
    try {
      const result = await exportExperienceInitTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export init tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            export_id: '',
            directory_path: '',
            expected_files: {},
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  exportExperienceConversationsTool.name,
  exportExperienceConversationsTool.description,
  exportExperienceConversationsTool.input_schema.shape,
  async (args) => {
    try {
      const result = await exportExperienceConversationsTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export conversations tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            file_path: '',
            processed_count: 0,
            batch_file_size: 0,
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  exportExperienceThoughtsTool.name,
  exportExperienceThoughtsTool.description,
  exportExperienceThoughtsTool.input_schema.shape,
  async (args) => {
    try {
      const result = await exportExperienceThoughtsTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export thoughts tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            file_path: '',
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  exportExperienceFinalizeTool.name,
  exportExperienceFinalizeTool.description,
  exportExperienceFinalizeTool.input_schema.shape,
  async (args) => {
    try {
      const result = await exportExperienceFinalizeTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Export finalize tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            directory_path: '',
            manifest_path: '',
            total_files: 0,
            total_size: 0,
            file_list: [],
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  listExperiencesTool.name,
  listExperiencesTool.description,
  listExperiencesTool.input_schema.shape,
  async (args) => {
    try {
      const result = await listExperiencesTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('List experiences tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            experience_directories: [],
            directory_summaries: [],
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  validateExperienceTool.name,
  validateExperienceTool.description,
  validateExperienceTool.input_schema.shape,
  async (args) => {
    try {
      const result = await validateExperienceTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Validate experience tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            valid: false,
            manifest_valid: false,
            semantic_valid: false,
            file_validations: [],
            missing_files: [],
            errors: [errorMessage],
            warnings: []
          }, null, 2)
        }]
      };
    }
  }
);

server.tool(
  getAssimilationGuideTool.name,
  getAssimilationGuideTool.description,
  getAssimilationGuideTool.input_schema.shape,
  async (args) => {
    try {
      const result = await getAssimilationGuideTool.execute(args);
      return {
        content: [{ type: "text", text: result.content[0].text }]
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get assimilation guide tool execution error', { error: errorMessage });
      return {
        content: [{ 
          type: "text", 
          text: JSON.stringify({
            success: false,
            guide_content: '',
            examples: [],
            best_practices: [],
            related_concepts: [],
            error: errorMessage
          }, null, 2)
        }]
      };
    }
  }
);

// サーバーを開始
async function startServer(): Promise<void> {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    logger.info('AI Assimilation MCP Server started successfully', {
      name: config.server.name,
      version: config.server.version,
      baseDirectory: config.storage.baseDirectory
    });
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error('Failed to start MCP Server', { error: errorMessage });
    console.error('MCP Server failed to start:', error);
    process.exit(1);
  }
}

// グレースフルシャットダウンを処理
process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

// サーバーを開始
startServer();