/**
 * AI模型适配器基类（重构版）
 * 所有AI模型适配器都应该继承这个基类
 * 同时支持旧的 NodeResult 接口和新的 NodeOutput 接口
 */
import { NodeInput, NodeOutput, ConfigSchema, ValidationResult, StandardError } from 'shared/types/node';
import { ExecutionContext } from '../../types/node';
/**
 * 旧版节点结果接口（保持向后兼容）
 */
export interface NodeResult {
    text?: string;
    imageUrl?: string;
    error?: string;
}
/**
 * 旧版节点数据接口（保持向后兼容）
 */
export interface NodeData {
    type: string;
    config?: any;
    input?: any;
}
/**
 * 节点适配器抽象基类（新架构）
 * 所有节点适配器都应该继承这个基类
 */
export declare abstract class BaseNodeAdapter {
    abstract nodeType: string;
    abstract configSchema: ConfigSchema;
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input: NodeInput, config: Record<string, any>): ValidationResult;
    /**
     * 执行节点（新接口）
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 节点输出
     */
    abstract execute(input: NodeInput, config: Record<string, any>, context: ExecutionContext): Promise<NodeOutput>;
    /**
     * 获取节点元数据
     * @returns 节点元数据
     */
    getMetadata(): any;
    /**
     * 处理错误
     * @param error 错误对象
     * @returns 标准错误对象
     */
    protected handleError(error: any): StandardError;
    /**
     * 创建成功输出
     * @param data 输出数据
     * @param metadata 执行元数据
     * @returns 节点输出
     */
    protected createSuccessOutput(data: any, metadata?: any): NodeOutput;
    /**
     * 创建错误输出
     * @param error 错误信息
     * @returns 节点输出
     */
    protected createErrorOutput(error: StandardError): NodeOutput;
}
/**
 * AI模型适配器抽象基类（向后兼容）
 * 所有AI模型适配器都应该继承这个基类
 */
export declare abstract class BaseAIAdapter {
    abstract modelType: string;
    /**
     * 执行节点（旧接口）
     * @param params 节点参数
     * @returns 执行结果
     */
    abstract execute(params: NodeData): Promise<NodeResult>;
    /**
     * 验证配置
     * @param config 节点配置
     * @returns 是否有效
     */
    validateConfig(config: any): boolean;
    /**
     * 处理错误（向后兼容）
     */
    protected handleError(error: any): NodeResult;
}
//# sourceMappingURL=baseAdapter.d.ts.map