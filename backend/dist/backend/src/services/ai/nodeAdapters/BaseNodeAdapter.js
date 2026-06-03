"use strict";
/**
 * 节点适配器基类（新架构）
 * 所有节点适配器都应该继承这个基类
 * 提供统一的节点执行接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseNodeAdapter = void 0;
const node_1 = require("../../../types/node");
/**
 * 节点适配器抽象基类
 * 所有节点适配器都应该继承这个基类
 */
class BaseNodeAdapter {
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input, config) {
        try {
            // 验证配置
            const configValidation = this.configSchema.validate(config);
            if (!configValidation.valid) {
                return configValidation;
            }
            // 验证输入（基本验证）
            if (input && typeof input !== 'object') {
                return {
                    valid: false,
                    errors: [
                        {
                            code: 'INVALID_INPUT',
                            message: '节点输入必须是对象类型',
                        },
                    ],
                };
            }
            return { valid: true, errors: [] };
        }
        catch (error) {
            return {
                valid: false,
                errors: [
                    {
                        code: 'VALIDATION_ERROR',
                        message: error.message || '验证过程中发生错误',
                    },
                ],
            };
        }
    }
    /**
     * 获取节点元数据
     * @returns 节点元数据
     */
    getMetadata() {
        return {
            nodeType: this.nodeType,
            configSchema: this.configSchema,
        };
    }
    /**
     * 处理错误
     * @param error 错误对象
     * @returns 标准错误对象
     */
    handleError(error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.log(node_1.LogLevel.ERROR, `节点执行失败: ${errorMessage}`, errorStack);
        return {
            code: 'EXECUTION_ERROR',
            message: errorMessage,
            details: errorStack,
        };
    }
    /**
     * 创建成功输出
     * @param data 输出数据
     * @param metadata 执行元数据
     * @returns 节点输出
     */
    createSuccessOutput(data, metadata) {
        return {
            status: 'SUCCESS',
            data,
            metadata,
        };
    }
    /**
     * 创建错误输出
     * @param error 错误信息
     * @returns 节点输出
     */
    createErrorOutput(error) {
        return {
            status: 'ERROR',
            error,
        };
    }
    /**
     * 日志记录
     * @param level 日志级别
     * @param message 日志消息
     * @param details 详细信息
     */
    log(level, message, details) {
        const prefix = `[${this.nodeType}]`;
        switch (level) {
            case node_1.LogLevel.DEBUG:
                console.debug(`${prefix} ${message}`, details);
                break;
            case node_1.LogLevel.INFO:
                console.info(`${prefix} ${message}`);
                break;
            case node_1.LogLevel.WARN:
                console.warn(`${prefix} ${message}`, details);
                break;
            case node_1.LogLevel.ERROR:
                console.error(`${prefix} ${message}`, details);
                break;
        }
    }
    /**
     * 解析变量插值
     * @param text 包含变量的文本
     * @param variables 变量上下文
     * @returns 解析后的文本
     */
    resolveVariableInterpolation(text, variables) {
        if (!text || typeof text !== 'string') {
            return text;
        }
        // 匹配 {{nodeId.handleId}} 模式
        return text.replace(/\{\{(\w+)\.(\w+)\}\}/g, (match, nodeId, handleId) => {
            const nodeResult = variables[nodeId];
            if (!nodeResult) {
                this.log(node_1.LogLevel.WARN, `未找到节点 ${nodeId} 的输出`);
                return match;
            }
            // 从输出中提取数据
            if (nodeResult.data) {
                if (handleId === 'text' && nodeResult.data.text) {
                    return nodeResult.data.text;
                }
                if (handleId === 'imageUrls' && nodeResult.data.imageUrls) {
                    return nodeResult.data.imageUrls.join(',');
                }
                if (handleId in nodeResult.data) {
                    return String(nodeResult.data[handleId]);
                }
            }
            this.log(node_1.LogLevel.WARN, `未找到节点 ${nodeId} 的句柄 ${handleId}`);
            return match;
        });
    }
}
exports.BaseNodeAdapter = BaseNodeAdapter;
//# sourceMappingURL=BaseNodeAdapter.js.map