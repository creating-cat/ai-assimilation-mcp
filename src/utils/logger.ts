/**
 * Simple logging utility for AI Assimilation MCP Server
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
}

export class Logger {
  private level: LogLevel;
  private enableFileLogging: boolean;
  private logDirectory: string;

  constructor(level: LogLevel = 'info', enableFileLogging = false, logDirectory = './logs') {
    this.level = level;
    this.enableFileLogging = enableFileLogging;
    this.logDirectory = logDirectory;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, context?: Record<string, any>): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
  }

  debug(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, context?: Record<string, any>): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, context));
    }
  }

  // Create a child logger with additional context
  child(context: Record<string, any>): Logger {
    const childLogger = new Logger(this.level, this.enableFileLogging, this.logDirectory);
    
    // Override methods to include context
    const originalMethods = {
      debug: childLogger.debug.bind(childLogger),
      info: childLogger.info.bind(childLogger),
      warn: childLogger.warn.bind(childLogger),
      error: childLogger.error.bind(childLogger)
    };

    childLogger.debug = (message: string, additionalContext?: Record<string, any>) => {
      originalMethods.debug(message, { ...context, ...additionalContext });
    };

    childLogger.info = (message: string, additionalContext?: Record<string, any>) => {
      originalMethods.info(message, { ...context, ...additionalContext });
    };

    childLogger.warn = (message: string, additionalContext?: Record<string, any>) => {
      originalMethods.warn(message, { ...context, ...additionalContext });
    };

    childLogger.error = (message: string, additionalContext?: Record<string, any>) => {
      originalMethods.error(message, { ...context, ...additionalContext });
    };

    return childLogger;
  }
}

// Global logger instance
export const logger = new Logger();