/**
 * Logger utility for structured logging
 * Adapted for MCP server environment
 */

export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
}

export class Logger {
  private logLevel: LogLevel;

  constructor(logLevel: LogLevel = LogLevel.INFO) {
    this.logLevel = logLevel;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.ERROR, LogLevel.WARN, LogLevel.INFO, LogLevel.DEBUG];
    return levels.indexOf(level) <= levels.indexOf(this.logLevel);
  }

  private log(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) return;

    // MCP servers should only log to stderr to avoid interfering with protocol communication
    // In production: only errors. In development: all logs if DEBUG_MCP=true
    const isDebugMode = process.env.DEBUG_MCP === 'true';
    
    if (level === LogLevel.ERROR || isDebugMode) {
      const entry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...(data && { data })
      };
      // Always use stderr for MCP compatibility
      console.error(JSON.stringify(entry));
    }
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }
}

export const logger = new Logger(
  process.env.LOG_LEVEL as LogLevel || LogLevel.INFO
);