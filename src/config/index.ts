/**
 * Configuration for AI Assimilation MCP Server
 */

export interface MCPConfig {
  server: {
    name: string;
    version: string;
    description: string;
  };
  storage: {
    baseDirectory: string;
    maxFileSize: number; // in bytes
    maxDirectorySize: number; // in bytes
    conversationBatchSize: number;
  };
  validation: {
    strictMode: boolean;
    allowUnknownFields: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableFileLogging: boolean;
    logDirectory: string;
  };
}

export const DEFAULT_CONFIG: MCPConfig = {
  server: {
    name: 'ai-assimilation-mcp',
    version: '1.0.0',
    description: 'AI Assimilation MCP Server - Enable AI experience sharing and assimilation'
  },
  storage: {
    baseDirectory: './experiences',
    maxFileSize: 10 * 1024 * 1024, // 10MB
    maxDirectorySize: 100 * 1024 * 1024, // 100MB
    conversationBatchSize: 50
  },
  validation: {
    strictMode: true,
    allowUnknownFields: true
  },
  logging: {
    level: 'info',
    enableFileLogging: false,
    logDirectory: './logs'
  }
};

export function loadConfig(): MCPConfig {
  // In a real implementation, this would load from environment variables
  // or configuration files. For now, return the default config.
  return { ...DEFAULT_CONFIG };
}