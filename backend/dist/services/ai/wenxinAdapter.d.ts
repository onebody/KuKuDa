import { BaseAIAdapter, NodeResult } from './baseAdapter';
import { NodeConfig } from '../../types/workflow';
/**
 * 百度文心一言 API 适配器
 */
export declare class WenxinAdapter extends BaseAIAdapter {
    modelType: string;
    private client;
    private apiKey;
    private secretKey;
    private accessToken;
    private tokenExpiry;
    constructor(apiKey: string, secretKey: string);
    /**
     * 获取 access_token
     */
    private getAccessToken;
    execute(config: NodeConfig, inputData?: any): Promise<NodeResult>;
    validateConfig(config: NodeConfig): boolean;
}
//# sourceMappingURL=wenxinAdapter.d.ts.map