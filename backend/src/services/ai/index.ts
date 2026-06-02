import { BaseAIAdapter } from './baseAdapter';
import { OpenAIAdapter } from './openaiAdapter';
import { ClaudeAdapter } from './claudeAdapter';
import { WenxinAdapter } from './wenxinAdapter';
import { QwenAdapter } from './qwenAdapter';
import { NodeConfig, NodeResult } from '../../types/workflow';

/**
 * AI 模型服务入口
 * 根据配置选择合适的适配器并执行
 */

// 适配器缓存
const adapterCache: Map<string, BaseAIAdapter> = new Map();

/**
 * 获取 AI 适配器
 * @param modelType - 模型类型
 * @returns 对应的适配器实例
 */
export const getAIAdapter = (modelType: string): BaseAIAdapter => {
  // 检查缓存
  if (adapterCache.has(modelType)) {
    return adapterCache.get(modelType)!;
  }

  let adapter: BaseAIAdapter;

  switch (modelType.toLowerCase()) {
    case 'openai':
    case 'gpt-4':
    case 'gpt-3.5-turbo':
      adapter = new OpenAIAdapter(
        process.env.OPENAI_API_KEY || '',
        process.env.OPENAI_BASE_URL
      );
      break;

    case 'claude':
    case 'claude-3':
      adapter = new ClaudeAdapter(
        process.env.ANTHROPIC_API_KEY || '',
        process.env.ANTHROPIC_BASE_URL
      );
      break;

    case 'wenxin':
    case 'ernie':
      adapter = new WenxinAdapter(
        process.env.WENXIN_API_KEY || '',
        process.env.WENXIN_SECRET_KEY || ''
      );
      break;

    case 'qwen':
    case 'qwen-max':
      adapter = new QwenAdapter(
        process.env.QWEN_API_KEY || '',
        process.env.QWEN_BASE_URL
      );
      break;

    default:
      // 默认使用 OpenAI
      adapter = new OpenAIAdapter(
        process.env.OPENAI_API_KEY || '',
        process.env.OPENAI_BASE_URL
      );
  }

  // 缓存适配器
  adapterCache.set(modelType, adapter);

  return adapter;
};

/**
 * 执行 AI 节点
 * @param config - 节点配置
 * @param inputData - 输入数据
 * @returns 执行结果
 */
export const executeAINode = async (
  config: NodeConfig,
  inputData?: any
): Promise<NodeResult> => {
  const model = config.model || 'openai';

  try {
    const adapter = getAIAdapter(model);

    // 验证配置
    if (!adapter.validateConfig(config)) {
      return {
        success: false,
        error: 'AI 模型配置无效',
      };
    }

    // 执行
    const result = await adapter.execute(config, inputData);

    return result;
  } catch (error: any) {
    return {
      success: false,
      error: 'AI 执行失败: ' + error.message,
    };
  }
};

/**
 * 清除适配器缓存（用于配置更新）
 */
export const clearAdapterCache = (): void => {
  adapterCache.clear();
};
