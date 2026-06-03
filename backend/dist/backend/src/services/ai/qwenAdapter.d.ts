import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';
/**
 * 阿里通义千问 API 适配器
 */
export declare class QwenAdapter extends BaseAIAdapter {
    modelType: string;
    private client;
    private apiKey;
    private baseURL;
    constructor(apiKey: string, baseURL?: string);
    execute(config: NodeConfig, inputData?: any): Promise<NodeResult>;
    validateConfig(config: NodeConfig): boolean;
}
//# sourceMappingURL=qwenAdapter.d.ts.map