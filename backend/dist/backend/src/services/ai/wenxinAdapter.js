"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WenxinAdapter = void 0;
const axios_1 = __importDefault(require("axios"));
const baseAdapter_1 = require("./baseAdapter");
/**
 * 百度文心一言 API 适配器
 */
class WenxinAdapter extends baseAdapter_1.BaseAIAdapter {
    constructor(apiKey, secretKey) {
        super();
        this.modelType = 'wenxin';
        this.accessToken = null;
        this.tokenExpiry = 0;
        this.apiKey = apiKey;
        this.secretKey = secretKey;
        this.client = axios_1.default.create({
            baseURL: 'https://aip.baidu.com',
            timeout: 60000,
        });
    }
    /**
     * 获取 access_token
     */
    async getAccessToken() {
        // 检查 token 是否过期
        if (this.accessToken && Date.now() < this.tokenExpiry) {
            return this.accessToken;
        }
        try {
            const res = await axios_1.default.get('https://aip.baidu.com/oauth/2.0/token', {
                params: {
                    grant_type: 'client_credentials',
                    client_id: this.apiKey,
                    client_secret: this.secretKey,
                },
            });
            this.accessToken = res.data.access_token;
            // 提前 5 分钟过期
            this.tokenExpiry = Date.now() + (res.data.expires_in - 300) * 1000;
            return this.accessToken;
        }
        catch (error) {
            return {
                success: false,
                error: '获取文心一言 access_token 失败: ' + error.message,
            };
        }
    }
    async execute(config, inputData) {
        try {
            const model = config.model || 'ernie-4.0';
            const prompt = config.prompt || '';
            const temperature = config.temperature || 0.7;
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
            const token = await this.getAccessToken();
            if (!token) {
                return { success: false, error: '无法获取 access_token' };
            }
            const response = await this.client.post(`/rul/2.0/ernievilms/${model}?access_token=${token}`, {
                messages,
                temperature,
            });
            return {
                success: true,
                data: {
                    text: response.data.result,
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
        if (!this.apiKey || !this.secretKey)
            return false;
        return true;
    }
}
exports.WenxinAdapter = WenxinAdapter;
//# sourceMappingURL=wenxinAdapter.js.map