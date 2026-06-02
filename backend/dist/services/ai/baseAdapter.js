"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseAIAdapter = void 0;
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
     * 处理错误
     */
    handleError(error) {
        console.error(`[${this.modelType}] Error:`, error);
        return {
            error: error.message || '执行失败'
        };
    }
}
exports.BaseAIAdapter = BaseAIAdapter;
//# sourceMappingURL=baseAdapter.js.map