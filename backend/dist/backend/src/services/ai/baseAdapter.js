"use strict";
/**
 * AI模型适配器基类（重构版）
 * 所有AI模型适配器都应该继承这个基类
 * 同时支持旧的 NodeResult 接口和新的 NodeOutput 接口
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIAdapter = exports.BaseNodeAdapter = void 0;
/**
 * 节点适配器抽象基类（新架构）
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
        // 默认实现：验证配置Schema
        try {
            const result = this.configSchema.validate(config);
            return result;
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
        console.error(`[${this.nodeType}] Error:`, error);
        return {
            code: 'EXECUTION_ERROR',
            message: error.message || '执行失败',
            details: error.stack,
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
}
exports.BaseNodeAdapter = BaseNodeAdapter;
/**
 * AI模型适配器抽象基类（向后兼容）
 * 所有AI模型适配器都应该继承这个基类
 */
class BaseAIAdapter {
    /**
     * 验证配置
     * @param config 节点配置
     * @returns 是否有效
     */
    validateConfig(config) {
        return true; // 默认实现，子类可以重写
    }
    /**
     * 处理错误（向后兼容）
     */
    handleError(error) {
        console.error(`[${this.modelType}] Error:`, error);
        return {
            error: error.message || '执行失败',
        };
    }
}
exports.BaseAIAdapter = BaseAIAdapter;
//# sourceMappingURL=baseAdapter.js.map