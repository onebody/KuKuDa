"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAdapterCache = exports.executeAINode = exports.getAIAdapter = void 0;
const openaiAdapter_1 = require("./openaiAdapter");
const claudeAdapter_1 = require("./claudeAdapter");
const wenxinAdapter_1 = require("./wenxinAdapter");
const qwenAdapter_1 = require("./qwenAdapter");
/**
 * AI 模型服务入口
 * 根据配置选择合适的适配器并执行
 */
// 适配器缓存
const adapterCache = new Map();
/**
 * 获取 AI 适配器
 * @param modelType - 模型类型
 * @returns 对应的适配器实例
 */
const getAIAdapter = (modelType) => {
    // 检查缓存
    if (adapterCache.has(modelType)) {
        return adapterCache.get(modelType);
    }
    let adapter;
    switch (modelType.toLowerCase()) {
        case 'openai':
        case 'gpt-4':
        case 'gpt-3.5-turbo':
            adapter = new openaiAdapter_1.OpenAIAdapter(process.env.OPENAI_API_KEY || '', process.env.OPENAI_BASE_URL);
            break;
        case 'claude':
        case 'claude-3':
            adapter = new claudeAdapter_1.ClaudeAdapter(process.env.ANTHROPIC_API_KEY || '', process.env.ANTHROPIC_BASE_URL);
            break;
        case 'wenxin':
        case 'ernie':
            adapter = new wenxinAdapter_1.WenxinAdapter(process.env.WENXIN_API_KEY || '', process.env.WENXIN_SECRET_KEY || '');
            break;
        case 'qwen':
        case 'qwen-max':
            adapter = new qwenAdapter_1.QwenAdapter(process.env.QWEN_API_KEY || '', process.env.QWEN_BASE_URL);
            break;
        default:
            // 默认使用 OpenAI
            adapter = new openaiAdapter_1.OpenAIAdapter(process.env.OPENAI_API_KEY || '', process.env.OPENAI_BASE_URL);
    }
    // 缓存适配器
    adapterCache.set(modelType, adapter);
    return adapter;
};
exports.getAIAdapter = getAIAdapter;
/**
 * 执行 AI 节点
 * @param config - 节点配置
 * @param inputData - 输入数据
 * @returns 执行结果
 */
const executeAINode = async (config, inputData) => {
    const model = config.model || 'openai';
    try {
        const adapter = (0, exports.getAIAdapter)(model);
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
    }
    catch (error) {
        return {
            success: false,
            error: 'AI 执行失败: ' + error.message,
        };
    }
};
exports.executeAINode = executeAINode;
/**
 * 清除适配器缓存（用于配置更新）
 */
const clearAdapterCache = () => {
    adapterCache.clear();
};
exports.clearAdapterCache = clearAdapterCache;
//# sourceMappingURL=index.js.map