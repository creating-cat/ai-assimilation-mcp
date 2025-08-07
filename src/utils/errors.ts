/**
 * Custom error classes for AI Assimilation MCP Server
 */

export class MCPError extends Error {
  public readonly code: string;
  public readonly context?: Record<string, any>;

  constructor(message: string, code: string, context?: Record<string, any>) {
    super(message);
    this.name = 'MCPError';
    this.code = code;
    this.context = context;
  }
}

export class FileError extends MCPError {
  constructor(message: string, filePath?: string, operation?: string) {
    super(message, 'FILE_ERROR', { filePath, operation });
    this.name = 'FileError';
  }
}

export class ValidationError extends MCPError {
  constructor(message: string, field?: string, value?: any) {
    super(message, 'VALIDATION_ERROR', { field, value });
    this.name = 'ValidationError';
  }
}

export class ProcessingError extends MCPError {
  constructor(message: string, stage?: string, details?: Record<string, any>) {
    super(message, 'PROCESSING_ERROR', { stage, ...details });
    this.name = 'ProcessingError';
  }
}

export class SecurityError extends MCPError {
  constructor(message: string, resource?: string, action?: string) {
    super(message, 'SECURITY_ERROR', { resource, action });
    this.name = 'SecurityError';
  }
}

export class ExportError extends MCPError {
  constructor(message: string, exportId?: string, stage?: string) {
    super(message, 'EXPORT_ERROR', { exportId, stage });
    this.name = 'ExportError';
  }
}

export class ImportError extends MCPError {
  constructor(message: string, directoryPath?: string, reason?: string) {
    super(message, 'IMPORT_ERROR', { directoryPath, reason });
    this.name = 'ImportError';
  }
}

// Error handler utility
export class ErrorHandler {
  static handleFileError(error: Error, filePath?: string, operation?: string): FileError {
    if (error instanceof FileError) {
      return error;
    }
    return new FileError(
      `File operation failed: ${error.message}`,
      filePath,
      operation
    );
  }

  static handleValidationError(error: Error, field?: string, value?: any): ValidationError {
    if (error instanceof ValidationError) {
      return error;
    }
    return new ValidationError(
      `Validation failed: ${error.message}`,
      field,
      value
    );
  }

  static handleProcessingError(error: Error, stage?: string, details?: Record<string, any>): ProcessingError {
    if (error instanceof ProcessingError) {
      return error;
    }
    return new ProcessingError(
      `Processing failed: ${error.message}`,
      stage,
      details
    );
  }

  static toMCPResponse(error: Error): { success: false; error: string; code?: string } {
    if (error instanceof MCPError) {
      return {
        success: false,
        error: error.message,
        code: error.code
      };
    }
    return {
      success: false,
      error: error.message
    };
  }
}