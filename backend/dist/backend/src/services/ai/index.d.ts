import { BaseAIAdapter } from './baseAdapter';
import { NodeConfig, NodeResult } from '../../types/workflow';
/**
 * 获取 AI 适配器
 * @param modelType - 模型类型
 * @returns 对应的适配器实例
 */
export declare const getAIAdapter: (modelType: string) => BaseAIAdapter;
/**
 * 执行 AI 节点
 * @param config - 节点配置
 * @param inputData - 输入数据
 * @returns 执行结果
 */
export declare const executeAINode: (config: NodeConfig, inputData?: any) => Promise<NodeResult>;
/**
 * 清除适配器缓存（用于配置更新）
 */
export declare const clearAdapterCache: () => void;
//# sourceMappingURL=index.d.ts.map