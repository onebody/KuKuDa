"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QwenAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const baseAdapter_1 = require("./baseAdapter");
/**
 * 阿里通义千问 API 适配器
 */
class QwenAdapter extends baseAdapter_1.BaseAIAdapter {
    constructor(apiKey, baseURL = 'https://dashscope.aliyuncs.com/api/v1') {
        super();
        this.modelType = 'qwen';
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.client = axios_1.default.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
            },
            timeout: 60000,
        });
    }
    async execute(config, inputData) {
        try {
            const model = config.model || 'qwen-max';
            const prompt = config.prompt || '';
            const temperature = config.temperature || 0.7;
            const maxTokens = config.maxTokens || 2048;
            let messages = [];
            if (inputData) {
                if (typeof inputData === 'string') {
                    messages.push({ role: 'user', content: inputData });
                }
                else if (inputData.text) {
                    messages.push({ role: 'user', content: inputData.text });
                }
            }
            if (prompt) {
                messages.push({ role: 'user', content: prompt });
            }
            if (messages.length === 0) {
                return { success: false, error: '没有提供输入数据或提示词' };
            }
            const response = await this.client.post('/chat/completions', {
                model,
                messages,
                temperature,
                max_tokens: maxTokens,
            });
            return {
                success: true,
                data: {
                    text: response.data.choices[0].message.content,
                    model: model,
                    usage: response.data.usage,
                },
                executionTime: response.data.usage?.total_tokens,
            };
        }
        catch (error) {
            return this.handleError(error);
        }
    }
    validateConfig(config) {
        if (!super.validateConfig(config))
            return false;
        if (!this.apiKey)
            return false;
        return true;
    }
}
exports.QwenAdapter = QwenAdapter;
//# sourceMappingURL=qwenAdapter.js.map