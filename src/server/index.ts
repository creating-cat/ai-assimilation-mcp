/**
 * AI Assimilation MCP Server
 * Main server implementation using @modelcontextprotocol/sdk
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';

import { MCPConfig } from '../config/index.js';
import { logger } from '../utils/logger.js';
import { ErrorHandler } from '../utils/errors.js';
import { MCPResponse } from '../types/index.js';

export class AIAssimilationMCPServer {
  private server: Server;
  private config: MCPConfig;

  constructor(config: MCPConfig) {
    this.config = config;
    this.server = new Server(
      {
        name: config.server.name,
        version: config.server.version,
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    logger.info('AI Assimilation MCP Server initialized', {
      name: config.server.name,
      version: config.server.version
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.getAvailableTools(),
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      
      try {
        logger.info('Tool called', { name, args });
        
        switch (name) {
          case 'export_experience_init':
            return await this.handleExportInit(args);
          case 'export_experience_conversations':
            return await this.handleExportConversations(args);
          case 'export_experience_insights':
            return await this.handleExportInsights(args);
          case 'export_experience_patterns':
            return await this.handleExportPatterns(args);
          case 'export_experience_preferences':
            return await this.handleExportPreferences(args);
          case 'export_experience_finalize':
            return await this.handleExportFinalize(args);
          case 'list_experiences':
            return await this.handleListExperiences(args);
          case 'validate_experience':
            return await this.handleValidateExperience(args);
          case 'get_assimilation_guide':
            return await this.handleGetAssimilationGuide(args);
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        logger.error('Tool execution failed', { name, error: error instanceof Error ? error.message : String(error) });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(ErrorHandler.toMCPResponse(error as Error), null, 2)
            }
          ]
        };
      }
    });
  }

  private getAvailableTools(): Tool[] {
    return [
      {
        name: 'export_experience_init',
        description: '体験データエクスポートの初期化とディレクトリ構造作成',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: { type: 'string', description: 'セッション識別子' },
            output_directory: { type: 'string', description: '出力ディレクトリパス' },
            metadata: { type: 'object', description: 'セッションメタデータ' },
            summary: { type: 'object', description: '体験データの概要' }
          },
          required: ['session_id', 'output_directory', 'metadata', 'summary']
        }
      },
      {
        name: 'export_experience_conversations',
        description: '会話履歴データのバッチ単位での個別ファイル出力',
        inputSchema: {
          type: 'object',
          properties: {
            export_id: { type: 'string', description: 'エクスポート処理識別子' },
            conversations_batch: { type: 'array', description: '会話データのバッチ（50件ベース）' },
            batch_number: { type: 'number', description: 'バッチ番号' },
            is_final_batch: { type: 'boolean', description: '最終バッチかどうか' }
          },
          required: ['export_id', 'conversations_batch', 'batch_number']
        }
      },
      {
        name: 'export_experience_insights',
        description: '洞察データの個別ファイル出力',
        inputSchema: {
          type: 'object',
          properties: {
            export_id: { type: 'string', description: 'エクスポート処理識別子' },
            insights: { type: 'array', description: '洞察データ' }
          },
          required: ['export_id', 'insights']
        }
      },
      {
        name: 'export_experience_patterns',
        description: '推論パターンデータの個別ファイル出力',
        inputSchema: {
          type: 'object',
          properties: {
            export_id: { type: 'string', description: 'エクスポート処理識別子' },
            reasoning_patterns: { type: 'array', description: '推論パターンデータ' }
          },
          required: ['export_id', 'reasoning_patterns']
        }
      },
      {
        name: 'export_experience_preferences',
        description: '学習した嗜好データの個別ファイル出力',
        inputSchema: {
          type: 'object',
          properties: {
            export_id: { type: 'string', description: 'エクスポート処理識別子' },
            learned_preferences: { type: 'object', description: '学習した嗜好データ' }
          },
          required: ['export_id', 'learned_preferences']
        }
      },
      {
        name: 'export_experience_finalize',
        description: 'エクスポート処理の完了とマニフェストファイル生成',
        inputSchema: {
          type: 'object',
          properties: {
            export_id: { type: 'string', description: 'エクスポート処理識別子' }
          },
          required: ['export_id']
        }
      },
      {
        name: 'list_experiences',
        description: '利用可能な体験データディレクトリの一覧取得',
        inputSchema: {
          type: 'object',
          properties: {
            base_directory: { type: 'string', description: '検索ベースディレクトリ' },
            filter: { type: 'object', description: 'フィルタ条件' }
          }
        }
      },
      {
        name: 'validate_experience',
        description: '体験データディレクトリの整合性検証',
        inputSchema: {
          type: 'object',
          properties: {
            directory_path: { type: 'string', description: '検証する体験データディレクトリパス' }
          },
          required: ['directory_path']
        }
      },
      {
        name: 'get_assimilation_guide',
        description: 'AI同化プロセスのガイドラインとベストプラクティスを提供',
        inputSchema: {
          type: 'object',
          properties: {
            guide_type: { 
              type: 'string', 
              enum: ['for_main_ai', 'for_source_ai'],
              description: 'ガイドの種類'
            }
          },
          required: ['guide_type']
        }
      }
    ];
  }

  // Placeholder implementations - will be implemented in subsequent tasks
  private async handleExportInit(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.1'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExportConversations(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.2'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExportInsights(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.3'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExportPatterns(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.4'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExportPreferences(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.5'
          }, null, 2)
        }
      ]
    };
  }

  private async handleExportFinalize(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 3.6'
          }, null, 2)
        }
      ]
    };
  }

  private async handleListExperiences(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 4.1'
          }, null, 2)
        }
      ]
    };
  }

  private async handleValidateExperience(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 4.2'
          }, null, 2)
        }
      ]
    };
  }

  private async handleGetAssimilationGuide(args: any): Promise<any> {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: 'Not implemented yet - will be implemented in task 5.1'
          }, null, 2)
        }
      ]
    };
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    logger.info('AI Assimilation MCP Server started and connected');
  }

  async stop(): Promise<void> {
    await this.server.close();
    logger.info('AI Assimilation MCP Server stopped');
  }
}