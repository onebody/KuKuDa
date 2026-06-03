"use strict";
/**
 * 节点适配器导出
 * 统一导出所有节点适配器
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.adapterRegistry = exports.BaseNodeAdapter = void 0;
// 导出基类
var BaseNodeAdapter_1 = require("./BaseNodeAdapter");
Object.defineProperty(exports, "BaseNodeAdapter", { enumerable: true, get: function () { return BaseNodeAdapter_1.BaseNodeAdapter; } });
class AdapterRegistry {
    constructor() {
        this.adapters = new Map();
    }
    /**
     * 注册适配器类
     * @param nodeType 节点类型
     * @param adapterClass 适配器类（构造函数）
     */
    register(nodeType, adapterClass) {
        if (this.adapters.has(nodeType)) {
            console.warn(`[AdapterRegistry] 适配器已存在，将被覆盖: ${nodeType}`);
        }
        this.adapters.set(nodeType, adapterClass);
        console.log(`[AdapterRegistry] 注册适配器: ${nodeType}`);
    }
    /**
     * 创建适配器实例
     * @param nodeType 节点类型
     * @returns 适配器实例
     */
    createInstance(nodeType) {
        const AdapterClass = this.adapters.get(nodeType);
        if (!AdapterClass) {
            console.error(`[AdapterRegistry] 未找到节点类型 ${nodeType} 的适配器`);
            return null;
        }
        try {
            return new AdapterClass();
        }
        catch (error) {
            console.error(`[AdapterRegistry] 创建适配器实例失败: ${nodeType}`, error);
            return null;
        }
    }
    /**
     * 检查适配器是否已注册
     * @param nodeType 节点类型
     * @returns 是否已注册
     */
    hasAdapter(nodeType) {
        return this.adapters.has(nodeType);
    }
    /**
     * 注销适配器
     * @param nodeType 节点类型
     */
    unregister(nodeType) {
        this.adapters.delete(nodeType);
        console.log(`[AdapterRegistry] 注销适配器: ${nodeType}`);
    }
    /**
     * 获取所有已注册的节点类型
     * @returns 节点类型数组
     */
    getRegisteredTypes() {
        return Array.from(this.adapters.keys());
    }
    /**
     * 清空所有适配器
     */
    clear() {
        this.adapters.clear();
        console.log('[AdapterRegistry] 已清空所有适配器');
    }
}
// 创建全局单例
const adapterRegistry = new AdapterRegistry();
exports.adapterRegistry = adapterRegistry;
//# sourceMappingURL=index.js.map