import { BaseAIAdapter, NodeData, NodeResult } from './baseAdapter';
export declare class OpenAIAdapter extends BaseAIAdapter {
    modelType: string;
    private apiKey;
    private apiUrl;
    constructor(apiKey: string);
    execute(params: NodeData): Promise<NodeResult>;
    validateConfig(config: any): boolean;
}
//# sourceMappingURL=openaiAdapter.d.ts.map