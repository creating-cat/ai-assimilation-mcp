/**
 * List Experiences Tool
 * 利用可能な体験データディレクトリの一覧取得
 */

import { z } from 'zod';
import { logger } from '../utils/logger.js';
import { listExperienceDirectories } from '../utils/fileOperations.js';
import { loadConfig } from '../config/index.js';

const config = loadConfig();

// Input schema validation
export const listExperiencesSchema = z.object({
  base_directory: z.string()
    .optional()
    .describe('検索ベースディレクトリ（省略時はデフォルト設定を使用）'),
  filter: z.object({
    ai_name: z.string().optional().describe('AI名でフィルタ'),
    ai_context: z.string().optional().describe('AIコンテキストでフィルタ'),
    experience_nature: z.string().optional().describe('体験の性質でフィルタ'),
    main_topics: z.array(z.string()).optional().describe('主要トピックでフィルタ'),
    created_after: z.string().optional().describe('指定日時以降に作成されたもの'),
    created_before: z.string().optional().describe('指定日時以前に作成されたもの'),
    min_conversations: z.number().int().min(0).optional().describe('最小会話数'),
    max_conversations: z.number().int().min(0).optional().describe('最大会話数')
  }).optional().describe('フィルタ条件')
});

export type ListExperiencesInput = z.infer<typeof listExperiencesSchema>;

export interface ListExperiencesOutput {
  success: boolean;
  experience_directories: Array<{
    mcp_version: string;
    directory_path: string;
    ai_name: string;
    ai_context: string;
    experience_nature: string;
    experience_summary: string;
    experience_flow: string[];
    main_topics: string[];
    total_conversations: number;
    session_id?: string;
    created_at?: string;
    ai_model?: string;
    duration?: string;
    platform?: string;
  }>;
  directory_summaries: Array<{
    directory: string;
    summary: string;
    file_count: number;
  }>;
  error?: string;
}

export const listExperiencesTool = {
  name: 'list_experiences',
  description: `利用可能な体験データディレクトリの一覧取得

このツールは指定されたディレクトリ内の体験データディレクトリを検索し、
各ディレクトリのmanifest.jsonから概要情報を抽出して一覧表示します。
メインAIが同化したい体験データを発見するために使用します。

【主な機能】
- 体験データディレクトリの自動検出
- manifest.jsonからの概要情報抽出
- フィルタ機能による絞り込み
- ディレクトリサマリーの生成

【フィルタ機能】
- ai_name: AI名での絞り込み
- ai_context: AIコンテキストでの絞り込み
- experience_nature: 体験の性質での絞り込み
- main_topics: 主要トピックでの絞り込み
- created_after/before: 作成日時での絞り込み
- min/max_conversations: 会話数での絞り込み

【出力形式】
成功時: { success: true, experience_directories: [...], directory_summaries: [...] }
失敗時: { success: false, experience_directories: [], directory_summaries: [], error: "message" }

【使用例】
1. 全体験データの一覧取得
2. 特定のAI名での絞り込み
3. 特定のトピックに関する体験の検索
4. 最近作成された体験データの確認

【メインAIの活用方法】
このツールで興味深い体験データを発見した後、メインAIは直接ファイルを読み込んで同化プロセスを開始できます。`,
  input_schema: listExperiencesSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('List experiences tool execution started', { args });

    try {
      // Validate input
      const validatedInput = listExperiencesSchema.parse(args);

      // Use provided base directory or default
      const baseDirectory = validatedInput.base_directory || config.storage.baseDirectory;

      // Get experience directories
      const result = await listExperienceDirectories(baseDirectory);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to list experience directories');
      }

      let experienceDirectories = result.data;

      // Apply filters if provided
      if (validatedInput.filter) {
        experienceDirectories = this.applyFilters(experienceDirectories, validatedInput.filter);
      }

      // Generate directory summaries
      const directorySummaries = experienceDirectories.map(dir => ({
        directory: dir.directory_path,
        summary: `${dir.ai_name}: ${dir.experience_summary}`,
        file_count: 5 // manifest + conversations + insights + patterns + preferences
      }));

      const executionTime = Date.now() - startTime;
      logger.info('List experiences tool execution completed', {
        totalDirectories: experienceDirectories.length,
        executionTime
      });

      const response: ListExperiencesOutput = {
        success: true,
        experience_directories: experienceDirectories.map(dir => ({
          mcp_version: dir.mcp_version,
          directory_path: dir.directory_path,
          ai_name: dir.ai_name,
          ai_context: dir.ai_context,
          experience_nature: dir.experience_nature,
          experience_summary: dir.experience_summary,
          experience_flow: dir.experience_flow,
          main_topics: dir.main_topics,
          total_conversations: dir.total_conversations,
          session_id: dir.session_id,
          created_at: dir.created_at?.toISOString(),
          ai_model: dir.ai_model,
          duration: dir.duration,
          platform: dir.platform
        })),
        directory_summaries: directorySummaries
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('List experiences tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: ListExperiencesOutput = {
        success: false,
        experience_directories: [],
        directory_summaries: [],
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  },

  /**
   * Apply filters to experience directories
   */
  applyFilters(directories: any[], filter: any): any[] {
    return directories.filter(dir => {
      // AI name filter
      if (filter.ai_name && !dir.ai_name.toLowerCase().includes(filter.ai_name.toLowerCase())) {
        return false;
      }

      // AI context filter
      if (filter.ai_context && !dir.ai_context.toLowerCase().includes(filter.ai_context.toLowerCase())) {
        return false;
      }

      // Experience nature filter
      if (filter.experience_nature && !dir.experience_nature.toLowerCase().includes(filter.experience_nature.toLowerCase())) {
        return false;
      }

      // Main topics filter
      if (filter.main_topics && filter.main_topics.length > 0) {
        const hasMatchingTopic = filter.main_topics.some((filterTopic: string) =>
          dir.main_topics.some((dirTopic: string) =>
            dirTopic.toLowerCase().includes(filterTopic.toLowerCase())
          )
        );
        if (!hasMatchingTopic) {
          return false;
        }
      }

      // Date filters
      if (filter.created_after && dir.created_at) {
        const createdAt = new Date(dir.created_at);
        const filterDate = new Date(filter.created_after);
        if (createdAt < filterDate) {
          return false;
        }
      }

      if (filter.created_before && dir.created_at) {
        const createdAt = new Date(dir.created_at);
        const filterDate = new Date(filter.created_before);
        if (createdAt > filterDate) {
          return false;
        }
      }

      // Conversation count filters
      if (filter.min_conversations !== undefined && dir.total_conversations < filter.min_conversations) {
        return false;
      }

      if (filter.max_conversations !== undefined && dir.total_conversations > filter.max_conversations) {
        return false;
      }

      return true;
    });
  }
};