"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenAIAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const baseAdapter_1 = require("./baseAdapter");
class OpenAIAdapter extends baseAdapter_1.BaseAIAdapter {
    constructor(apiKey) {
        super();
        this.modelType = 'OpenAI';
        this.apiUrl = 'https://api.openai.com/v1/chat/completions';
        this.apiKey = apiKey;
    }
    async execute(params) {
        try {
            const { config, input } = params;
            // 构建请求体
            const requestBody = {
                model: config?.model || 'gpt-4',
                messages: [
                    {
                        role: 'user',
                        content: input?.text || config?.prompt || ''
                    }
                ],
                temperature: config?.temperature || 0.7,
                max_tokens: config?.maxTokens || 2000
            };
            // 调用OpenAI API
            const response = await axios_1.default.post(this.apiUrl, requestBody, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });
            // 解析结果
            const result = response.data;
            const text = result.choices?.[0]?.message?.content || '';
            return {
                text
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    validateConfig(config) {
        return !!this.apiKey && !!config?.model;
    }
}
exports.OpenAIAdapter = OpenAIAdapter;
//# sourceMappingURL=openaiAdapter.js.map