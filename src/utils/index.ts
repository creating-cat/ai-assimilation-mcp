/**
 * Utilities index - exports all utility functions and classes
 */

// Logger
export { Logger, logger } from './logger.js';
export type { LogLevel, LogEntry } from './logger.js';

// Error handling
export {
  MCPError,
  FileError,
  ProcessingError,
  SecurityError,
  ExportError,
  ImportError,
  ErrorHandler
} from './errors.js';
export { ValidationError } from './errors.js';

// File operations
export {
  ensureDirectory,
  fileExists,
  getDirectoryInfo,
  writeJsonFile,
  readJsonFile,
  readExperienceMetadata,
  writeExperienceMetadata,
  readConversationBatch,
  writeConversationBatch,
  // Legacy individual file functions removed - use writeJsonFile directly
  listExperienceDirectories,
  validateExperienceDirectoryFiles,
  getFileSize,
  deleteFile,
  copyFile
} from './fileOperations.js';
export type { FileOperationResult, DirectoryInfo } from './fileOperations.js';

// Experience utilities
export { getExperienceDirectoryPath } from './experience.js';

// Validation
export {
  validateData,
  validateExperienceMetadata,
  validateConversationBatch,
  validateThoughts,
  validateFileContent,
  validateExperienceDirectory
} from './validation.js';
export type {
  ValidationResult
} from './validation.js';