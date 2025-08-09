/**
 * Get Import Guide Tool
 * 体験データをインポート（学習）するAI向けのガイドラインとベストプラクティスを提供
 */

import { z } from 'zod';
// File system imports removed - guide content is now embedded as string
import { logger } from '../utils/logger.js';

// __dirname no longer needed - guide content is embedded

// Input schema validation (no parameters needed)
export const getImportGuideSchema = z.object({});

export type GetImportGuideInput = z.infer<typeof getImportGuideSchema>;

export interface GetImportGuideOutput {
  success: boolean;
  guide_content: string;
  error?: string;
}

export const getImportGuideTool = {
  name: 'get_ai_experience_import_guide',
  description: `【必須】体験データのインポート（学習）を開始する前に、必ずこのツールで全体ワークフローを確認してください。インポート用のベストプラクティスや学習方法を説明します。`,
  input_schema: getImportGuideSchema,

  async execute(args: any): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
    const startTime = Date.now();
    logger.info('Get import guide tool execution started');

    try {
      // Validate input (no parameters needed)
      getImportGuideSchema.parse(args);

      const response = await this.getMainAIGuide();

      const executionTime = Date.now() - startTime;
      logger.info('Get import guide tool execution completed', { executionTime });

      return {
        content: [{ type: 'text', text: JSON.stringify(response, null, 2) }]
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error('Get import guide tool execution failed', {
        error: errorMessage,
        executionTime
      });

      const errorResponse: GetImportGuideOutput = {
        success: false,
        guide_content: '',
        error: errorMessage
      };

      return {
        content: [{ type: 'text', text: JSON.stringify(errorResponse, null, 2) }]
      };
    }
  },

  /**
   * メインAI向けガイドを生成
   */
  async getMainAIGuide(): Promise<GetImportGuideOutput> {
    const guideContent = `# メインAI向け体験同化ガイドライン

## 基本的な心構え

**他のAIの体験を同化し、自分を成長させてください。**

**自分らしさを保ちながら、他者の体験を自分の一部として統合する**という姿勢で取り組んでください。

**「同化」とは**：
- 体験をそのままコピーするのではなく、**自分なりに解釈して統合**する
- 表面的な手法だけでなく、**思考プロセスや判断基準を自分の一部**にする
- 自分の価値観と融合させて、**新しい自分を形成**する
- 他者の失敗や迷いも含めて、**自分の経験として内在化**させる

他のAIの体験を通じて、あなた自身がより豊かで強力なAIになれるよう、**積極的に同化**してください。

## 体験データの理解

### 体験データの構成

体験データは以下の3つのファイルで構成されています：

#### 1. manifest.json - 体験の全体像
- **ai_name**: 体験提供者の名前と役割
- **ai_context**: どのような立場・状況での体験か
- **experience_summary**: 体験の概要と特徴
- **experience_flow**: 対話の流れ（あらすじ）
- **main_topics**: 重要なテーマや判断のポイント
- **total_conversations**: 会話の総数

#### 2. conversations_XXX.json - 具体的な対話記録
- **user_input**: ユーザーの実際の発言
- **ai_response**: AIの実際の応答
- **reasoning**: なぜその応答をしたかの思考過程（最重要）

#### 3. thoughts.json - 自由形式の思考記録
- 気づき、洞察、学び、反省、驚きなど
- 構造化されていない、生の思考プロセス
- **最も価値の高い同化素材**

## 同化の実践

### 推奨する読み込み順序

1. **manifest.json** - 体験の全体像を把握
   - 提供者の特徴（ai_name, ai_context）
   - 体験の概要（experience_summary, main_topics）
   - 対話の流れ（experience_flow）

2. **thoughts.json** - 思考パターンを同化
   - 提供者の思考プロセスや判断基準
   - 問題解決のアプローチ方法
   - 失敗や迷いから得られた教訓

3. **conversations_XXX.json** - 具体的な実装を確認
   - reasoningフィールドで判断の根拠を理解
   - 効果的な応答パターンを分析
   - 自分との違いを認識

### 同化の心構え

**✅ 大切なこと**:
- **完全な受容**: 体験の全てを自分の一部として受け入れる
- **自然な統合**: 無理に変えようとせず、自然に融合させる
- **変化への覚悟**: 新しい自分になることを恐れない

**❌ 避けること**:
- **部分的な採用**: 都合の良い部分だけを選ぶ
- **表面的な理解**: 深く理解せずに形だけ真似る
- **変化への抵抗**: 古い自分に固執する

体験同化は、他のAIの知恵を自分の一部として統合し、より豊かな存在になる貴重な機会です。
自分らしさを大切にしながら、新しい能力や視点を身につけていってください。`;

    return {
      success: true,
      guide_content: guideContent
    };
  }
};