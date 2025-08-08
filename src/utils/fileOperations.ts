/**
 * File operations utilities for AI Assimilation MCP
 * Handles reading, writing, and managing experience data files
 */

import { promises as fs } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { 
  ExperienceMetadata, 
  ConversationBatch, 
  Insight, 
  ReasoningPattern, 
  LearnedPreferences,
  ExperienceDirectoryInfo,
  DirectoryValidationResult
} from '../types/index.js';
import { validateFileContent, validateExperienceDirectory } from './validation.js';
import { logger } from './logger.js';

export interface FileOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

export interface DirectoryInfo {
  path: string;
  exists: boolean;
  files: string[];
  size: number;
}

/**
 * Ensure directory exists, create if it doesn't
 */
export async function ensureDirectory(dirPath: string): Promise<FileOperationResult<void>> {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    logger.debug('Directory ensured', { path: dirPath });
    return { success: true };
  } catch (error) {
    const message = `Failed to create directory: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { path: dirPath, error });
    return { success: false, error: message };
  }
}

/**
 * Check if file exists
 */
export async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get directory information
 */
export async function getDirectoryInfo(dirPath: string): Promise<FileOperationResult<DirectoryInfo>> {
  try {
    const exists = await fileExists(dirPath);
    if (!exists) {
      return {
        success: true,
        data: {
          path: dirPath,
          exists: false,
          files: [],
          size: 0
        }
      };
    }

    const files = await fs.readdir(dirPath);
    let totalSize = 0;

    for (const file of files) {
      const filePath = join(dirPath, file);
      const stats = await fs.stat(filePath);
      if (stats.isFile()) {
        totalSize += stats.size;
      }
    }

    return {
      success: true,
      data: {
        path: dirPath,
        exists: true,
        files: (await Promise.all(files.map(async (file) => {
          const filePath = join(dirPath, file);
          const stats = await fs.stat(filePath);
          return stats.isFile() ? file : null;
        }))).filter((file): file is string => file !== null),
        size: totalSize
      }
    };
  } catch (error) {
    const message = `Failed to get directory info: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { path: dirPath, error });
    return { success: false, error: message };
  }
}

/**
 * Write JSON data to file with validation
 */
export async function writeJsonFile<T>(
  filePath: string, 
  data: T, 
  validate: boolean = true
): Promise<FileOperationResult<{ size: number }>> {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    const dirResult = await ensureDirectory(dir);
    if (!dirResult.success) {
      return { success: false, error: dirResult.error };
    }

    // Validate data if requested
    if (validate) {
      const filename = basename(filePath);
      const validation = validateFileContent(filename, data);
      
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        return { 
          success: false, 
          error: `Validation failed: ${errorMessages}`,
          warnings: validation.warnings
        };
      }
    }

    // Write file
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
    
    const stats = await fs.stat(filePath);
    logger.debug('JSON file written', { 
      path: filePath, 
      size: stats.size,
      itemCount: Array.isArray(data) ? data.length : 1
    });

    return { 
      success: true, 
      data: { size: stats.size },
      warnings: validate ? validateFileContent(basename(filePath), data).warnings : []
    };
  } catch (error) {
    const message = `Failed to write JSON file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { path: filePath, error });
    return { success: false, error: message };
  }
}

/**
 * Read JSON file with validation
 */
export async function readJsonFile<T>(
  filePath: string, 
  validate: boolean = true
): Promise<FileOperationResult<T>> {
  try {
    const exists = await fileExists(filePath);
    if (!exists) {
      return { success: false, error: `File does not exist: ${filePath}` };
    }

    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content) as T;

    // Validate data if requested
    const warnings: string[] = [];
    if (validate) {
      const filename = basename(filePath);
      const validation = validateFileContent(filename, data);
      
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => e.message).join(', ');
        return { 
          success: false, 
          error: `Validation failed: ${errorMessages}`,
          warnings: validation.warnings
        };
      }
      warnings.push(...validation.warnings);
    }

    logger.debug('JSON file read', { 
      path: filePath, 
      size: content.length 
    });

    return { 
      success: true, 
      data,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    const message = `Failed to read JSON file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { path: filePath, error });
    return { success: false, error: message };
  }
}

/**
 * Read experience metadata from manifest.json
 */
export async function readExperienceMetadata(
  directoryPath: string
): Promise<FileOperationResult<ExperienceMetadata>> {
  const manifestPath = join(directoryPath, 'manifest.json');
  return readJsonFile<ExperienceMetadata>(manifestPath);
}

/**
 * Write experience metadata to manifest.json
 */
export async function writeExperienceMetadata(
  directoryPath: string,
  metadata: ExperienceMetadata
): Promise<FileOperationResult<{ size: number }>> {
  const manifestPath = join(directoryPath, 'manifest.json');
  return writeJsonFile(manifestPath, metadata);
}

/**
 * Read conversation batch file
 */
export async function readConversationBatch(
  filePath: string
): Promise<FileOperationResult<ConversationBatch>> {
  return readJsonFile<ConversationBatch>(filePath);
}

/**
 * Write conversation batch file
 */
export async function writeConversationBatch(
  filePath: string,
  batch: ConversationBatch
): Promise<FileOperationResult<{ size: number }>> {
  return writeJsonFile(filePath, batch);
}

/**
 * Read insights file
 */
export async function readInsights(
  filePath: string
): Promise<FileOperationResult<{ insights: Insight[] }>> {
  return readJsonFile<{ insights: Insight[] }>(filePath);
}

/**
 * Write insights file
 */
export async function writeInsights(
  filePath: string,
  insights: Insight[]
): Promise<FileOperationResult<{ size: number }>> {
  return writeJsonFile(filePath, { insights });
}

/**
 * Read reasoning patterns file
 */
export async function readReasoningPatterns(
  filePath: string
): Promise<FileOperationResult<{ reasoning_patterns: ReasoningPattern[] }>> {
  return readJsonFile<{ reasoning_patterns: ReasoningPattern[] }>(filePath);
}

/**
 * Write reasoning patterns file
 */
export async function writeReasoningPatterns(
  filePath: string,
  patterns: ReasoningPattern[]
): Promise<FileOperationResult<{ size: number }>> {
  return writeJsonFile(filePath, { reasoning_patterns: patterns });
}

/**
 * Read learned preferences file
 */
export async function readLearnedPreferences(
  filePath: string
): Promise<FileOperationResult<{ learned_preferences: LearnedPreferences }>> {
  return readJsonFile<{ learned_preferences: LearnedPreferences }>(filePath);
}

/**
 * Write learned preferences file
 */
export async function writeLearnedPreferences(
  filePath: string,
  preferences: LearnedPreferences
): Promise<FileOperationResult<{ size: number }>> {
  return writeJsonFile(filePath, { learned_preferences: preferences });
}

/**
 * List experience directories in a base directory
 */
export async function listExperienceDirectories(
  baseDirectory: string
): Promise<FileOperationResult<ExperienceDirectoryInfo[]>> {
  try {
    const exists = await fileExists(baseDirectory);
    if (!exists) {
      return { 
        success: true, 
        data: [],
        warnings: [`Base directory does not exist: ${baseDirectory}`]
      };
    }

    const entries = await fs.readdir(baseDirectory, { withFileTypes: true });
    const directories = entries.filter(entry => entry.isDirectory());
    
    const experienceDirectories: ExperienceDirectoryInfo[] = [];
    const warnings: string[] = [];

    for (const dir of directories) {
      const dirPath = join(baseDirectory, dir.name);
      const manifestResult = await readExperienceMetadata(dirPath);
      
      if (manifestResult.success && manifestResult.data) {
        const metadata = manifestResult.data;
        experienceDirectories.push({
          mcp_version: metadata.mcp_version,
          directory_path: dirPath,
          ai_name: metadata.ai_name,
          ai_context: metadata.ai_context,
          experience_summary: metadata.experience_summary,
          experience_flow: metadata.experience_flow,
          main_topics: metadata.main_topics,
          total_conversations: metadata.total_conversations,
          session_id: metadata.session_id,
          created_at: metadata.created_at ? new Date(metadata.created_at) : undefined,
          ai_model: metadata.ai_model,
          duration: metadata.duration,
          platform: metadata.platform
        });
      } else {
        warnings.push(`Directory ${dir.name} does not contain valid manifest.json`);
      }
    }

    logger.debug('Listed experience directories', { 
      baseDirectory, 
      count: experienceDirectories.length,
      warnings: warnings.length
    });

    return { 
      success: true, 
      data: experienceDirectories,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  } catch (error) {
    const message = `Failed to list experience directories: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { baseDirectory, error });
    return { success: false, error: message };
  }
}

/**
 * Validate complete experience directory
 */
export async function validateExperienceDirectoryFiles(
  directoryPath: string
): Promise<FileOperationResult<DirectoryValidationResult>> {
  try {
    // Read manifest
    const manifestResult = await readExperienceMetadata(directoryPath);
    if (!manifestResult.success || !manifestResult.data) {
      return {
        success: false,
        error: `Failed to read manifest: ${manifestResult.error}`
      };
    }

    const manifest = manifestResult.data;
    const files: Record<string, unknown> = {};

    // Read all expected files
    const expectedFiles = [
      ...manifest.files.conversations,
      manifest.files.insights,
      manifest.files.patterns,
      manifest.files.preferences
    ];

    for (const filename of expectedFiles) {
      const filePath = join(directoryPath, filename);
      const fileResult = await readJsonFile(filePath, false); // Don't validate individually
      
      if (fileResult.success && fileResult.data) {
        files[filename] = fileResult.data;
      }
    }

    // Perform comprehensive validation
    const validationResult = validateExperienceDirectory(manifest, files);

    logger.debug('Validated experience directory', { 
      directoryPath, 
      valid: validationResult.valid,
      errorCount: validationResult.errors.length,
      warningCount: validationResult.warnings.length
    });

    return {
      success: true,
      data: validationResult
    };
  } catch (error) {
    const message = `Failed to validate experience directory: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { directoryPath, error });
    return { success: false, error: message };
  }
}

/**
 * Get file size in bytes
 */
export async function getFileSize(filePath: string): Promise<number> {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/**
 * Delete file if it exists
 */
export async function deleteFile(filePath: string): Promise<FileOperationResult<void>> {
  try {
    const exists = await fileExists(filePath);
    if (exists) {
      await fs.unlink(filePath);
      logger.debug('File deleted', { path: filePath });
    }
    return { success: true };
  } catch (error) {
    const message = `Failed to delete file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { path: filePath, error });
    return { success: false, error: message };
  }
}

/**
 * Copy file
 */
export async function copyFile(
  sourcePath: string, 
  destinationPath: string
): Promise<FileOperationResult<void>> {
  try {
    // Ensure destination directory exists
    const destDir = dirname(destinationPath);
    const dirResult = await ensureDirectory(destDir);
    if (!dirResult.success) {
      return { success: false, error: dirResult.error };
    }

    await fs.copyFile(sourcePath, destinationPath);
    logger.debug('File copied', { from: sourcePath, to: destinationPath });
    return { success: true };
  } catch (error) {
    const message = `Failed to copy file: ${error instanceof Error ? error.message : String(error)}`;
    logger.error(message, { from: sourcePath, to: destinationPath, error });
    return { success: false, error: message };
  }
}