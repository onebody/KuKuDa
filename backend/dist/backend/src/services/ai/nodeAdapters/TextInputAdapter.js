"use strict";
/**
 * 文本输入节点适配器
 * 处理文本输入节点的验证逻辑和执行逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputAdapter = void 0;
const BaseNodeAdapter_1 = require("./BaseNodeAdapter");
/**
 * 文本输入适配器类
 * 继承 BaseNodeAdapter，实现文本输入节点的具体逻辑
 */
class TextInputAdapter extends BaseNodeAdapter_1.BaseNodeAdapter {
    constructor() {
        super(...arguments);
        this.nodeType = 'TEXT_INPUT';
        this.configSchema = {
            fields: [
                {
                    key: 'text',
                    label: '文本内容',
                    type: 'textarea',
                    required: true,
                    defaultValue: '',
                    placeholder: '请输入文本内容...',
                    description: '节点要处理的文本内容',
                },
                {
                    key: 'maxLength',
                    label: '最大长度',
                    type: 'number',
                    required: false,
                    defaultValue: 5000,
                    description: '文本最大长度限制',
                    min: 1,
                    max: 100000,
                },
                {
                    key: 'allowVariables',
                    label: '允许变量插值',
                    type: 'boolean',
                    required: false,
                    defaultValue: true,
                    description: '是否允许使用 {{nodeId.handleId}} 语法引用其他节点输出',
                },
                {
                    key: 'defaultValue',
                    label: '默认值',
                    type: 'textarea',
                    required: false,
                    defaultValue: '',
                    description: '当文本为空时的默认值',
                },
            ],
            validate: (values) => {
                const errors = [];
                // 验证文本长度
                if (values.text && typeof values.text === 'string') {
                    const maxLength = values.maxLength || 5000;
                    if (values.text.length > maxLength) {
                        errors.push({
                            field: 'text',
                            code: 'MAX_LENGTH_EXCEEDED',
                            message: `文本长度不能超过 ${maxLength} 字符`,
                        });
                    }
                }
                // 验证最大长度配置
                if (values.maxLength !== undefined) {
                    if (typeof values.maxLength !== 'number' || values.maxLength < 1) {
                        errors.push({
                            field: 'maxLength',
                            code: 'INVALID_VALUE',
                            message: '最大长度必须是大于0的数字',
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
        // 额外的业务逻辑验证
        const errors = [...configValidation.errors];
        // 验证文本内容
        const text = config.text || '';
        if (text && typeof text === 'string') {
            const maxLength = config.maxLength || 5000;
            if (text.length > maxLength) {
                errors.push({
                    field: 'text',
                    code: 'MAX_LENGTH_EXCEEDED',
                    message: `文本长度(${text.length})超过最大限制(${maxLength})`,
                });
            }
            // 检查特殊字符（示例：检查是否包含空字节）
            if (text.includes('\0')) {
                errors.push({
                    field: 'text',
                    code: 'INVALID_CHARACTER',
                    message: '文本不能包含空字节',
                });
            }
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
            // 获取文本内容
            let text = config.text || '';
            // 如果文本为空，使用默认值
            if (!text && config.defaultValue) {
                text = config.defaultValue;
            }
            // 验证文本
            if (!text && this.configSchema.fields[0].required) {
                return this.createErrorOutput({
                    code: 'MISSING_TEXT',
                    message: '文本内容不能为空',
                });
            }
            // 处理变量插值
            if (config.allowVariables !== false && context.variables) {
                text = this.resolveVariables(text, context.variables);
            }
            // 验证最终结果
            const validation = this.validate(input, { ...config, text });
            if (!validation.valid) {
                return {
                    status: 'ERROR',
                    error: {
                        code: 'VALIDATION_FAILED',
                        message: `验证失败: ${validation.errors.map((e) => e.message).join(', ')}`,
                        details: validation.errors,
                    },
                    metadata: {
                        nodeId: context.workflowId || 'unknown',
                        executionTime: Date.now() - startTime,
                        timestamp: new Date(),
                        upstreamNodeIds: [],
                    },
                };
            }
            // 构建输出数据
            const outputData = {
                text,
            };
            // 构建执行元数据
            const metadata = {
                nodeId: context.workflowId || 'unknown',
                executionTime: Date.now() - startTime,
                timestamp: new Date(),
                upstreamNodeIds: [],
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
            return {
                status: 'ERROR',
                error: this.handleError(error),
                metadata: {
                    nodeId: context.workflowId || 'unknown',
                    executionTime: Date.now() - startTime,
                    timestamp: new Date(),
                    upstreamNodeIds: [],
                },
            };
        }
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
                console.warn(`[TextInputAdapter] 未找到节点 ${nodeId} 的输出`);
                return match;
            }
            if (!nodeOutput.data) {
                console.warn(`[TextInputAdapter] 节点 ${nodeId} 没有输出数据`);
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
            console.warn(`[TextInputAdapter] 未找到节点 ${nodeId} 的句柄 ${handleId}`);
            return match;
        });
    }
    /**
     * 创建错误输出（辅助方法）
     * @param error 错误信息
     * @returns 节点输出
     */
    createErrorOutput(error) {
        return {
            status: 'ERROR',
            error,
            metadata: {
                nodeId: 'unknown',
                executionTime: 0,
                timestamp: new Date(),
                upstreamNodeIds: [],
            },
        };
    }
}
exports.TextInputAdapter = TextInputAdapter;
// 导出适配器类
exports.default = TextInputAdapter;
//# sourceMappingURL=TextInputAdapter.js.map