/**
 * Export Manager - Handles experience data export sessions
 */

import { v4 as uuidv4 } from 'uuid';
import { join } from 'path';
import { 
  ExportSession, 
  ExperienceMetadata,
  ConversationBatch,
  Insight,
  ReasoningPattern,
  LearnedPreferences
} from '../types/index.js';
import { 
  ensureDirectory, 
  writeExperienceMetadata,
  writeConversationBatch,
  writeInsights,
  writeReasoningPatterns,
  writeLearnedPreferences,
  getDirectoryInfo,
  FileOperationResult
} from '../utils/fileOperations.js';
import { logger } from '../utils/logger.js';
import { ExportError } from '../utils/errors.js';

export interface ExportInitParams {
  session_id: string;
  output_directory: string;
  metadata: Partial<ExperienceMetadata>;
  summary: {
    ai_name: string;
    ai_context: string;
    experience_nature: string;
    experience_summary: string;
    experience_flow: string[];
    main_topics: string[];
    estimated_conversations: number;
  };
}

export interface ExportInitResult {
  success: boolean;
  export_id: string;
  directory_path: string;
  expected_files: Record<string, number>;
  error?: string;
}

export interface BatchExportParams {
  export_id: string;
  conversations_batch: any[];
  batch_number: number;
  is_final_batch: boolean;
}

export interface BatchExportResult {
  success: boolean;
  file_path: string;
  processed_count: number;
  batch_file_size: number;
  error?: string;
}

export interface ComponentExportParams {
  export_id: string;
  data: any;
}

export interface ComponentExportResult {
  success: boolean;
  file_path: string;
  items_count: number;
  error?: string;
}

export interface FinalizeExportResult {
  success: boolean;
  directory_path: string;
  manifest_path: string;
  total_files: number;
  total_size: number;
  file_list: string[];
  error?: string;
}

export class ExportManager {
  private activeSessions: Map<string, ExportSession> = new Map();
  private baseDirectory: string;

  constructor(baseDirectory: string) {
    this.baseDirectory = baseDirectory;
  }

  /**
   * Initialize a new export session
   */
  async initializeExport(params: ExportInitParams): Promise<ExportInitResult> {
    try {
      // Generate unique export ID
      const exportId = uuidv4();
      
      // Create directory name based on session_id
      const directoryName = `experience_${params.session_id}`;
      const directoryPath = join(params.output_directory, directoryName);

      // Ensure output directory exists
      const dirResult = await ensureDirectory(directoryPath);
      if (!dirResult.success) {
        throw new ExportError(`Failed to create export directory: ${dirResult.error}`, exportId, 'initialization');
      }

      // Calculate expected files
      const estimatedBatches = Math.ceil(params.summary.estimated_conversations / 50);
      const expectedFiles: Record<string, number> = {
        manifest: 1,
        conversation_batches: estimatedBatches,
        insights: 1,
        patterns: 1,
        preferences: 1
      };

      // Create export session
      const session: ExportSession = {
        export_id: exportId,
        directory_path: directoryPath,
        session_id: params.session_id,
        created_at: new Date(),
        status: 'initializing',
        expected_files: expectedFiles,
        created_files: []
      };

      // Store session
      this.activeSessions.set(exportId, session);

      logger.info('Export session initialized', {
        exportId,
        sessionId: params.session_id,
        directoryPath,
        expectedFiles
      });

      return {
        success: true,
        export_id: exportId,
        directory_path: directoryPath,
        expected_files: expectedFiles
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to initialize export', { 
        sessionId: params.session_id, 
        error: message 
      });
      
      return {
        success: false,
        export_id: '',
        directory_path: '',
        expected_files: {},
        error: message
      };
    }
  }

  /**
   * Export conversation batch
   */
  async exportConversationBatch(params: BatchExportParams): Promise<BatchExportResult> {
    try {
      const session = this.activeSessions.get(params.export_id);
      if (!session) {
        throw new ExportError(`Export session not found: ${params.export_id}`, params.export_id, 'conversation_export');
      }

      // Update session status
      session.status = 'in_progress';

      // Create batch data
      const batch: ConversationBatch = {
        batch_info: {
          batch_number: params.batch_number,
          count: params.conversations_batch.length,
          start_index: (params.batch_number - 1) * 50 + 1,
          end_index: (params.batch_number - 1) * 50 + params.conversations_batch.length
        },
        conversations: params.conversations_batch
      };

      // Generate filename
      const filename = `conversations_${params.batch_number.toString().padStart(3, '0')}.json`;
      const filePath = join(session.directory_path, filename);

      // Write batch file
      const writeResult = await writeConversationBatch(filePath, batch);
      if (!writeResult.success) {
        throw new ExportError(`Failed to write conversation batch: ${writeResult.error}`, params.export_id, 'conversation_export');
      }

      // Update session
      session.created_files.push(filename);

      logger.info('Conversation batch exported', {
        exportId: params.export_id,
        batchNumber: params.batch_number,
        conversationCount: params.conversations_batch.length,
        filePath,
        fileSize: writeResult.data?.size
      });

      return {
        success: true,
        file_path: filePath,
        processed_count: params.conversations_batch.length,
        batch_file_size: writeResult.data?.size || 0
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to export conversation batch', { 
        exportId: params.export_id,
        batchNumber: params.batch_number,
        error: message 
      });
      
      return {
        success: false,
        file_path: '',
        processed_count: 0,
        batch_file_size: 0,
        error: message
      };
    }
  }

  /**
   * Export insights
   */
  async exportInsights(params: ComponentExportParams): Promise<ComponentExportResult> {
    return this.exportComponent(params, 'insights', 'insights.json', writeInsights);
  }

  /**
   * Export reasoning patterns
   */
  async exportPatterns(params: ComponentExportParams): Promise<ComponentExportResult> {
    return this.exportComponent(params, 'patterns', 'patterns.json', writeReasoningPatterns);
  }

  /**
   * Export learned preferences
   */
  async exportPreferences(params: ComponentExportParams): Promise<ComponentExportResult> {
    return this.exportComponent(params, 'preferences', 'preferences.json', writeLearnedPreferences);
  }

  /**
   * Generic component export method
   */
  private async exportComponent(
    params: ComponentExportParams,
    componentType: string,
    filename: string,
    writeFunction: (filePath: string, data: any) => Promise<FileOperationResult<{ size: number }>>
  ): Promise<ComponentExportResult> {
    try {
      const session = this.activeSessions.get(params.export_id);
      if (!session) {
        throw new ExportError(`Export session not found: ${params.export_id}`, params.export_id, `${componentType}_export`);
      }

      const filePath = join(session.directory_path, filename);

      // Write component file
      const writeResult = await writeFunction(filePath, params.data);
      if (!writeResult.success) {
        throw new ExportError(`Failed to write ${componentType}: ${writeResult.error}`, params.export_id, `${componentType}_export`);
      }

      // Update session
      session.created_files.push(filename);

      const itemsCount = Array.isArray(params.data) ? params.data.length : 1;

      logger.info(`${componentType} exported`, {
        exportId: params.export_id,
        filePath,
        itemsCount,
        fileSize: writeResult.data?.size
      });

      return {
        success: true,
        file_path: filePath,
        items_count: itemsCount
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(`Failed to export ${componentType}`, { 
        exportId: params.export_id,
        error: message 
      });
      
      return {
        success: false,
        file_path: '',
        items_count: 0,
        error: message
      };
    }
  }

  /**
   * Finalize export and create manifest
   */
  async finalizeExport(exportId: string): Promise<FinalizeExportResult> {
    try {
      const session = this.activeSessions.get(exportId);
      if (!session) {
        throw new ExportError(`Export session not found: ${exportId}`, exportId, 'finalization');
      }

      // Get directory info
      const dirInfo = await getDirectoryInfo(session.directory_path);
      if (!dirInfo.success || !dirInfo.data) {
        throw new ExportError(`Failed to get directory info: ${dirInfo.error}`, exportId, 'finalization');
      }

      // Create manifest data
      const conversationFiles = session.created_files.filter(f => f.startsWith('conversations_'));
      const totalConversations = await this.calculateTotalConversations(session.directory_path, conversationFiles);

      const manifest: ExperienceMetadata = {
        mcp_version: '1.0.0',
        ai_name: 'Exported AI Experience',
        ai_context: 'Experience data exported via AI Assimilation MCP',
        experience_nature: 'Exported experience data',
        experience_summary: 'Experience data exported from AI session',
        experience_flow: ['Data exported via MCP'],
        files: {
          conversations: conversationFiles,
          insights: 'insights.json',
          patterns: 'patterns.json',
          preferences: 'preferences.json'
        },
        main_topics: ['Exported data'],
        total_conversations: totalConversations,
        session_id: session.session_id,
        created_at: session.created_at.toISOString(),
        platform: 'ai-assimilation-mcp'
      };

      // Write manifest
      const manifestPath = join(session.directory_path, 'manifest.json');
      const manifestResult = await writeExperienceMetadata(session.directory_path, manifest);
      if (!manifestResult.success) {
        throw new ExportError(`Failed to write manifest: ${manifestResult.error}`, exportId, 'finalization');
      }

      // Update session
      session.status = 'completed';
      session.created_files.push('manifest.json');

      // Get final directory info
      const finalDirInfo = await getDirectoryInfo(session.directory_path);
      const totalSize = finalDirInfo.data?.size || 0;
      const fileList = [...session.created_files];

      logger.info('Export finalized', {
        exportId,
        directoryPath: session.directory_path,
        totalFiles: fileList.length,
        totalSize,
        fileList
      });

      // Clean up session
      this.activeSessions.delete(exportId);

      return {
        success: true,
        directory_path: session.directory_path,
        manifest_path: manifestPath,
        total_files: fileList.length,
        total_size: totalSize,
        file_list: fileList
      };

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error('Failed to finalize export', { 
        exportId,
        error: message 
      });
      
      return {
        success: false,
        directory_path: '',
        manifest_path: '',
        total_files: 0,
        total_size: 0,
        file_list: [],
        error: message
      };
    }
  }

  /**
   * Calculate total conversations from batch files
   */
  private async calculateTotalConversations(directoryPath: string, conversationFiles: string[]): Promise<number> {
    let total = 0;
    
    for (const filename of conversationFiles) {
      try {
        const filePath = join(directoryPath, filename);
        const batchResult = await readConversationBatch(filePath);
        if (batchResult.success && batchResult.data) {
          total += batchResult.data.conversations.length;
        }
      } catch (error) {
        logger.warn('Failed to read conversation batch for counting', { filename, error });
      }
    }
    
    return total;
  }

  /**
   * Get active session info
   */
  getSession(exportId: string): ExportSession | undefined {
    return this.activeSessions.get(exportId);
  }

  /**
   * List active sessions
   */
  getActiveSessions(): ExportSession[] {
    return Array.from(this.activeSessions.values());
  }

  /**
   * Cancel export session
   */
  cancelExport(exportId: string): boolean {
    const session = this.activeSessions.get(exportId);
    if (session) {
      session.status = 'failed';
      this.activeSessions.delete(exportId);
      logger.info('Export session cancelled', { exportId });
      return true;
    }
    return false;
  }
}

// Import function needed for calculateTotalConversations
import { readConversationBatch } from '../utils/fileOperations.js';