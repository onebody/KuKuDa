/**
 * 节点注册服务（后端）
 * 管理所有节点适配器的注册和获取
 */
import { NodeTypeDefinition, ValidationResult } from '../../../shared/types/node';
import { INodeAdapter } from '../types/node';
/**
 * 节点注册服务类
 */
declare class NodeRegistryService {
    private adapters;
    private typeDefinitions;
    /**
     * 注册节点适配器
     * @param nodeType 节点类型
     * @param adapter 适配器实例
     * @param definition 节点类型定义（可选）
     */
    registerAdapter(nodeType: string, adapter: INodeAdapter, definition?: NodeTypeDefinition): void;
    /**
     * 获取节点适配器
     * @param nodeType 节点类型
     * @returns 适配器实例
     */
    getAdapter(nodeType: string): INodeAdapter | undefined;
    /**
     * 获取节点类型定义
     * @param nodeType 节点类型
     * @returns 节点类型定义
     */
    getTypeDefinition(nodeType: string): NodeTypeDefinition | undefined;
    /**
     * 获取所有已注册的节点类型
     * @returns 节点类型数组
     */
    getAllNodeTypes(): string[];
    /**
     * 获取所有节点类型定义
     * @returns 节点类型定义数组
     */
    getAllTypeDefinitions(): NodeTypeDefinition[];
    /**
     * 检查节点类型是否已注册
     * @param nodeType 节点类型
     * @returns 是否已注册
     */
    hasAdapter(nodeType: string): boolean;
    /**
     * 注销节点适配器
     * @param nodeType 节点类型
     */
    unregisterAdapter(nodeType: string): void;
    /**
     * 验证节点配置
     * @param nodeType 节点类型
     * @param config 节点配置
     * @returns 验证结果
     */
    validateConfig(nodeType: string, config: Record<string, any>): ValidationResult;
    /**
     * 执行节点
     * @param nodeType 节点类型
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 执行结果
     */
    executeNode(nodeType: string, input: any, config: Record<string, any>, context: any): Promise<any>;
    /**
     * 清空所有注册的适配器
     */
    clear(): void;
}
declare const nodeRegistryService: NodeRegistryService;
export default nodeRegistryService;
//# sourceMappingURL=nodeRegistryService.d.ts.map