/**
 * 节点适配器导出
 * 统一导出所有节点适配器
 */
export { BaseNodeAdapter } from './BaseNodeAdapter';
export type { INodeAdapter } from '../../../types/node';
/**
 * 适配器注册表
 * 用于动态注册和获取适配器实例
 */
import { BaseNodeAdapter } from './BaseNodeAdapter';
declare class AdapterRegistry {
    private adapters;
    /**
     * 注册适配器类
     * @param nodeType 节点类型
     * @param adapterClass 适配器类（构造函数）
     */
    register(nodeType: string, adapterClass: new () => BaseNodeAdapter): void;
    /**
     * 创建适配器实例
     * @param nodeType 节点类型
     * @returns 适配器实例
     */
    createInstance(nodeType: string): BaseNodeAdapter | null;
    /**
     * 检查适配器是否已注册
     * @param nodeType 节点类型
     * @returns 是否已注册
     */
    hasAdapter(nodeType: string): boolean;
    /**
     * 注销适配器
     * @param nodeType 节点类型
     */
    unregister(nodeType: string): void;
    /**
     * 获取所有已注册的节点类型
     * @returns 节点类型数组
     */
    getRegisteredTypes(): string[];
    /**
     * 清空所有适配器
     */
    clear(): void;
}
declare const adapterRegistry: AdapterRegistry;
export { adapterRegistry };
//# sourceMappingURL=index.d.ts.map