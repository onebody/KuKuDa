import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';
/**
 * Anthropic Claude API 适配器
 * 支持 Claude 3 系列模型
 */
export declare class ClaudeAdapter extends BaseAIAdapter {
    modelType: string;
    private client;
    private apiKey;
    private baseURL;
    /**
     * 构造函数
     * @param apiKey - Anthropic API Key
     * @param baseURL - API 基础 URL（可选，默认 https://api.anthropic.com）
     */
    constructor(apiKey: string, baseURL?: string);
    /**
     * 执行 Claude 模型调用
     * @param config - 节点配置
     * @param inputData - 输入数据
     * @returns 执行结果
     */
    execute(config: NodeConfig, inputData?: any): Promise<NodeResult>;
    /**
     * 验证配置
     * @param config - 节点配置
     * @returns 是否有效
     */
    validateConfig(config: NodeConfig): boolean;
}
//# sourceMappingURL=claudeAdapter.d.ts.map