/**
 * 节点适配器基类（新架构）
 * 所有节点适配器都应该继承这个基类
 * 提供统一的节点执行接口
 */
import { NodeInput, NodeOutput, ConfigSchema, ValidationResult, StandardError } from 'shared/types/node';
import { LogLevel, ExecutionContext } from '../../../types/node';
/**
 * 节点适配器抽象基类
 * 所有节点适配器都应该继承这个基类
 */
export declare abstract class BaseNodeAdapter {
    /**
     * 节点类型
     */
    abstract nodeType: string;
    /**
     * 配置Schema
     */
    abstract configSchema: ConfigSchema;
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input: NodeInput, config: Record<string, any>): ValidationResult;
    /**
     * 执行节点（核心方法）
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
    getMetadata(): Record<string, any>;
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
    /**
     * 日志记录
     * @param level 日志级别
     * @param message 日志消息
     * @param details 详细信息
     */
    protected log(level: LogLevel, message: string, details?: any): void;
    /**
     * 解析变量插值
     * @param text 包含变量的文本
     * @param variables 变量上下文
     * @returns 解析后的文本
     */
    protected resolveVariableInterpolation(text: string, variables: Record<string, any>): string;
}
//# sourceMappingURL=BaseNodeAdapter.d.ts.map