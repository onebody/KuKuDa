"use strict";
/**
 * AI绘图节点适配器（重构版）
 * 继承 BaseNodeAdapter，实现AI绘图节点的具体逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIImageAdapter = void 0;
const BaseNodeAdapter_1 = require("./BaseNodeAdapter");
/**
 * AI绘图适配器类
 * 继承 BaseNodeAdapter，实现AI绘图节点的具体逻辑
 */
class AIImageAdapter extends BaseNodeAdapter_1.BaseNodeAdapter {
    constructor() {
        super(...arguments);
        this.nodeType = 'AI_IMAGE';
        this.configSchema = {
            fields: [
                {
                    key: 'model',
                    label: '模型',
                    type: 'select',
                    required: true,
                    defaultValue: 'dall-e-3',
                    options: [
                        { label: 'DALL-E 3', value: 'dall-e-3' },
                        { label: 'DALL-E 2', value: 'dall-e-2' },
                        { label: 'Stable Diffusion v2', value: 'stable-diffusion-v2' },
                        { label: 'Stable Diffusion XL', value: 'stable-diffusion-xl' },
                    ],
                    description: '使用的AI绘图模型',
                },
                {
                    key: 'size',
                    label: '图片尺寸',
                    type: 'select',
                    required: false,
                    defaultValue: '1024x1024',
                    options: [
                        { label: '1024x1024 (正方形)', value: '1024x1024' },
                        { label: '1024x1792 (竖版)', value: '1024x1792' },
                        { label: '1792x1024 (横版)', value: '1792x1024' },
                    ],
                    description: '生成图片的尺寸',
                },
                {
                    key: 'count',
                    label: '生成数量',
                    type: 'number',
                    required: false,
                    defaultValue: 1,
                    description: '一次生成的图片数量',
                    min: 1,
                    max: 10,
                },
                {
                    key: 'quality',
                    label: '质量',
                    type: 'select',
                    required: false,
                    defaultValue: 'standard',
                    options: [
                        { label: '标准', value: 'standard' },
                        { label: '高清', value: 'hd' },
                    ],
                    description: '生成图片的质量',
                },
                {
                    key: 'style',
                    label: '风格',
                    type: 'select',
                    required: false,
                    defaultValue: 'vivid',
                    options: [
                        { label: '生动', value: 'vivid' },
                        { label: '自然', value: 'natural' },
                    ],
                    description: '生成图片的风格',
                },
                {
                    key: 'prompt',
                    label: '提示词',
                    type: 'textarea',
                    required: true,
                    defaultValue: '',
                    placeholder: '请输入提示词...',
                    description: '用于生成图片的文本描述',
                },
                {
                    key: 'negativePrompt',
                    label: '反向提示词',
                    type: 'textarea',
                    required: false,
                    defaultValue: '',
                    placeholder: '请输入不想要的内容...',
                    description: '用于指定不想要的内容',
                },
                {
                    key: 'seed',
                    label: '随机种子',
                    type: 'number',
                    required: false,
                    defaultValue: -1,
                    description: '随机种子，-1表示随机',
                    min: -1,
                    max: 999999,
                },
                {
                    key: 'enableVariableInterpolation',
                    label: '启用变量插值',
                    type: 'boolean',
                    required: false,
                    defaultValue: true,
                    description: '是否允许在提示词中使用 {{nodeId.handleId}} 语法',
                },
            ],
            validate: (values) => {
                const errors = [];
                // 验证模型
                const validModels = [
                    'dall-e-3',
                    'dall-e-2',
                    'stable-diffusion-v2',
                    'stable-diffusion-xl',
                ];
                if (values.model && !validModels.includes(values.model)) {
                    errors.push({
                        field: 'model',
                        code: 'INVALID_MODEL',
                        message: `无效的模型，支持: ${validModels.join(', ')}`,
                    });
                }
                // 验证尺寸
                if (values.size) {
                    const validSizes = ['1024x1024', '1024x1792', '1792x1024'];
                    if (!validSizes.includes(values.size)) {
                        errors.push({
                            field: 'size',
                            code: 'INVALID_SIZE',
                            message: `无效的尺寸，支持: ${validSizes.join(', ')}`,
                        });
                    }
                }
                // 验证数量
                if (values.count !== undefined) {
                    const count = Number(values.count);
                    if (isNaN(count) || count < 1 || count > 10) {
                        errors.push({
                            field: 'count',
                            code: 'INVALID_COUNT',
                            message: '生成数量必须在1-10之间',
                        });
                    }
                }
                // 验证提示词
                if (!values.prompt || values.prompt.trim().length === 0) {
                    errors.push({
                        field: 'prompt',
                        code: 'MISSING_PROMPT',
                        message: '提示词不能为空',
                    });
                }
                else if (values.prompt.length > 4000) {
                    errors.push({
                        field: 'prompt',
                        code: 'PROMPT_TOO_LONG',
                        message: '提示词不能超过4000个字符',
                    });
                }
                // 验证种子
                if (values.seed !== undefined && values.seed !== -1) {
                    const seed = Number(values.seed);
                    if (isNaN(seed) || seed < 0 || seed > 999999) {
                        errors.push({
                            field: 'seed',
                            code: 'INVALID_SEED',
                            message: '种子必须是0-999999之间的数字或-1',
                        });
                    }
                }
                return {
                    valid: errors.length === 0,
                    errors,
                };
            },
        };
    }
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input, config) {
        // 调用父类的配置验证
        const configValidation = this.configSchema.validate(config);
        const errors = [...configValidation.errors];
        // 验证输入数据
        if (input) {
            // 检查是否有有效的输入数据
            const hasValidInput = Object.values(input).some((data) => data && (data.text || data.imageUrls || data.json));
            if (!hasValidInput && !config.prompt) {
                errors.push({
                    field: 'prompt',
                    code: 'MISSING_PROMPT',
                    message: '提示词不能为空，且输入中没有可使用的文本',
                });
            }
        }
        // 验证提示词长度
        const prompt = config.prompt || this.extractTextFromInput(input);
        if (prompt && prompt.length > 4000) {
            errors.push({
                field: 'prompt',
                code: 'PROMPT_TOO_LONG',
                message: '提示词不能超过4000个字符',
            });
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * 执行节点逻辑
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 节点输出
     */
    async execute(input, config, context) {
        const startTime = Date.now();
        try {
            // 获取提示词
            let prompt = config.prompt || '';
            // 如果没有直接配置提示词，从输入中提取
            if (!prompt) {
                prompt = this.extractTextFromInput(input);
            }
            // 处理变量插值
            if (config.enableVariableInterpolation !== false && context.variables) {
                prompt = this.resolveVariables(prompt, context.variables);
            }
            // 验证提示词
            if (!prompt || prompt.trim().length === 0) {
                return {
                    status: 'ERROR',
                    error: {
                        code: 'MISSING_PROMPT',
                        message: '提示词不能为空',
                    },
                    metadata: {
                        nodeId: context.workflowId || 'unknown',
                        executionTime: Date.now() - startTime,
                        timestamp: new Date(),
                        upstreamNodeIds: Object.keys(input),
                    },
                };
            }
            // 构建API请求参数
            const requestParams = this.buildRequestParams(prompt, config);
            // 调用AI绘图API（模拟）
            const apiResult = await this.callAIAPI(requestParams, context);
            // 处理API响应
            const outputData = {
                imageUrls: apiResult.imageUrls,
                json: {
                    model: config.model,
                    prompt: prompt,
                    size: config.size || '1024x1024',
                    count: config.count || 1,
                    seed: apiResult.seed,
                    quality: config.quality || 'standard',
                },
            };
            // 如果有反向提示词，也加入到输出
            if (config.negativePrompt) {
                outputData.json.negativePrompt = config.negativePrompt;
            }
            // 构建执行元数据
            const metadata = {
                nodeId: context.workflowId || 'unknown',
                executionTime: Date.now() - startTime,
                timestamp: new Date(),
                upstreamNodeIds: Object.keys(input),
            };
            // 返回成功结果
            return {
                status: 'SUCCESS',
                data: outputData,
                metadata,
            };
        }
        catch (error) {
            // 错误处理
            console.error('[AIImageAdapter] 执行失败:', error);
            return {
                status: 'ERROR',
                error: this.handleError(error),
                metadata: {
                    nodeId: context.workflowId || 'unknown',
                    executionTime: Date.now() - startTime,
                    timestamp: new Date(),
                    upstreamNodeIds: Object.keys(input),
                },
            };
        }
    }
    /**
     * 从输入中提取文本
     * @param input 节点输入
     * @returns 提取的文本
     */
    extractTextFromInput(input) {
        // 优先使用 'prompt' 句柄
        if (input['prompt']?.text) {
            return input['prompt'].text;
        }
        // 尝试从 'text' 句柄获取
        if (input['text']?.text) {
            return input['text'].text;
        }
        // 尝试从第一个可用的句柄获取文本
        for (const [, data] of Object.entries(input)) {
            if (data?.text) {
                return data.text;
            }
        }
        return '';
    }
    /**
     * 变量插值解析
     * @param text 包含变量的文本
     * @param variables 变量上下文
     * @returns 解析后的文本
     */
    resolveVariables(text, variables) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        // 匹配 {{nodeId.handleId}} 或 {{nodeId.handleId.field}} 模式
        return text.replace(/\{\{(\w+)\.(\w+)(?:\.(\w+))?\}\}/g, (match, nodeId, handleId, field) => {
            const nodeOutput = variables[nodeId];
            if (!nodeOutput) {
                console.warn(`[AIImageAdapter] 未找到节点 ${nodeId} 的输出`);
                return match;
            }
            if (!nodeOutput.data) {
                console.warn(`[AIImageAdapter] 节点 ${nodeId} 没有输出数据`);
                return match;
            }
            // 提取数据
            const data = nodeOutput.data;
            if (field && data[handleId]) {
                // 支持嵌套路径 {{nodeId.handleId.field}}
                const nestedData = data[handleId];
                if (nestedData && typeof nestedData === 'object' && field in nestedData) {
                    return String(nestedData[field]);
                }
                return match;
            }
            if (data[handleId] !== undefined) {
                return String(data[handleId]);
            }
            // 如果handleId是'text'，直接返回text字段
            if (handleId === 'text' && data.text) {
                return data.text;
            }
            console.warn(`[AIImageAdapter] 未找到节点 ${nodeId} 的句柄 ${handleId}`);
            return match;
        });
    }
    /**
     * 构建API请求参数
     * @param prompt 提示词
     * @param config 节点配置
     * @returns API请求参数
     */
    buildRequestParams(prompt, config) {
        const params = {
            prompt,
            model: config.model || 'dall-e-3',
            n: config.count || 1,
        };
        // 添加可选参数
        if (config.size) {
            params.size = config.size;
        }
        if (config.quality) {
            params.quality = config.quality;
        }
        if (config.style) {
            params.style = config.style;
        }
        if (config.negativePrompt) {
            params.negative_prompt = config.negativePrompt;
        }
        if (config.seed && config.seed !== -1) {
            params.seed = config.seed;
        }
        return params;
    }
    /**
     * 调用AI绘图API
     * @param params API请求参数
     * @param context 执行上下文
     * @returns API响应
     */
    async callAIAPI(params, context) {
        // 模拟API调用延迟
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // 模拟API响应
        const mockImageUrls = [
            `https://api.example.com/images/${Date.now()}_1.png`,
            `https://api.example.com/images/${Date.now()}_2.png`,
        ].slice(0, params.n || 1);
        const mockSeed = params.seed || Math.floor(Math.random() * 1000000);
        console.log('[AIImageAdapter] 模拟API调用，参数:', params);
        console.log('[AIImageAdapter] 模拟API响应，图片URL:', mockImageUrls);
        // 实际应用中应该调用真实的API
        // 示例：const response = await openai.images.generate(params)
        return {
            imageUrls: mockImageUrls,
            seed: mockSeed,
        };
    }
}
exports.AIImageAdapter = AIImageAdapter;
// 导出适配器类
exports.default = AIImageAdapter;
//# sourceMappingURL=AIImageAdapter.js.map