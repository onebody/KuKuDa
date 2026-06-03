"use strict";
/**
 * 节点注册服务（后端）
 * 管理所有节点适配器的注册和获取
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 节点注册服务类
 */
class NodeRegistryService {
    constructor() {
        this.adapters = new Map();
        this.typeDefinitions = new Map();
    }
    /**
     * 注册节点适配器
     * @param nodeType 节点类型
     * @param adapter 适配器实例
     * @param definition 节点类型定义（可选）
     */
    registerAdapter(nodeType, adapter, definition) {
        if (this.adapters.has(nodeType)) {
            console.warn(`[NodeRegistryService] 节点适配器已存在，将被覆盖: ${nodeType}`);
        }
        this.adapters.set(nodeType, adapter);
        if (definition) {
            this.typeDefinitions.set(nodeType, definition);
        }
        console.log(`[NodeRegistryService] 注册节点适配器: ${nodeType}`);
    }
    /**
     * 获取节点适配器
     * @param nodeType 节点类型
     * @returns 适配器实例
     */
    getAdapter(nodeType) {
        return this.adapters.get(nodeType);
    }
    /**
     * 获取节点类型定义
     * @param nodeType 节点类型
     * @returns 节点类型定义
     */
    getTypeDefinition(nodeType) {
        return this.typeDefinitions.get(nodeType);
    }
    /**
     * 获取所有已注册的节点类型
     * @returns 节点类型数组
     */
    getAllNodeTypes() {
        return Array.from(this.adapters.keys());
    }
    /**
     * 获取所有节点类型定义
     * @returns 节点类型定义数组
     */
    getAllTypeDefinitions() {
        return Array.from(this.typeDefinitions.values());
    }
    /**
     * 检查节点类型是否已注册
     * @param nodeType 节点类型
     * @returns 是否已注册
     */
    hasAdapter(nodeType) {
        return this.adapters.has(nodeType);
    }
    /**
     * 注销节点适配器
     * @param nodeType 节点类型
     */
    unregisterAdapter(nodeType) {
        this.adapters.delete(nodeType);
        this.typeDefinitions.delete(nodeType);
        console.log(`[NodeRegistryService] 注销节点适配器: ${nodeType}`);
    }
    /**
     * 验证节点配置
     * @param nodeType 节点类型
     * @param config 节点配置
     * @returns 验证结果
     */
    validateConfig(nodeType, config) {
        const adapter = this.getAdapter(nodeType);
        if (!adapter) {
            return {
                valid: false,
                errors: [
                    {
                        code: 'ADAPTER_NOT_FOUND',
                        message: `未找到节点类型 ${nodeType} 的适配器`,
                    },
                ],
            };
        }
        // 创建模拟输入进行验证
        const mockInput = {};
        return adapter.validate(mockInput, config);
    }
    /**
     * 执行节点
     * @param nodeType 节点类型
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 执行结果
     */
    async executeNode(nodeType, input, config, context) {
        const adapter = this.getAdapter(nodeType);
        if (!adapter) {
            return {
                status: 'ERROR',
                error: {
                    code: 'ADAPTER_NOT_FOUND',
                    message: `未找到节点类型 ${nodeType} 的适配器`,
                },
            };
        }
        try {
            // 验证输入和配置
            const validation = adapter.validate(input, config);
            if (!validation.valid) {
                return {
                    status: 'ERROR',
                    error: {
                        code: 'VALIDATION_FAILED',
                        message: `配置验证失败: ${validation.errors.map((e) => e.message).join(', ')}`,
                        details: validation.errors,
                    },
                };
            }
            // 执行节点
            const result = await adapter.execute(input, config, context);
            return result;
        }
        catch (error) {
            return {
                status: 'ERROR',
                error: {
                    code: 'EXECUTION_FAILED',
                    message: error.message || '节点执行失败',
                    details: error.stack,
                },
            };
        }
    }
    /**
     * 清空所有注册的适配器
     */
    clear() {
        this.adapters.clear();
        this.typeDefinitions.clear();
        console.log('[NodeRegistryService] 已清空所有节点适配器');
    }
}
// 创建全局单例
const nodeRegistryService = new NodeRegistryService();
exports.default = nodeRegistryService;
//# sourceMappingURL=nodeRegistryService.js.map