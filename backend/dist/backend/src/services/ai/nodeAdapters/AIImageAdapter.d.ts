/**
 * AI绘图节点适配器（重构版）
 * 继承 BaseNodeAdapter，实现AI绘图节点的具体逻辑
 */
import { BaseNodeAdapter } from './BaseNodeAdapter';
import { NodeInput, NodeOutput, ConfigSchema, ValidationResult } from '../../../../../shared/types/node';
import { ExecutionContext } from '../../../types/node';
/**
 * AI绘图适配器类
 * 继承 BaseNodeAdapter，实现AI绘图节点的具体逻辑
 */
export declare class AIImageAdapter extends BaseNodeAdapter {
    nodeType: string;
    configSchema: ConfigSchema;
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input: NodeInput, config: Record<string, any>): ValidationResult;
    /**
     * 执行节点逻辑
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 节点输出
     */
    execute(input: NodeInput, config: Record<string, any>, context: ExecutionContext): Promise<NodeOutput>;
    /**
     * 从输入中提取文本
     * @param input 节点输入
     * @returns 提取的文本
     */
    private extractTextFromInput;
    /**
     * 变量插值解析
     * @param text 包含变量的文本
     * @param variables 变量上下文
     * @returns 解析后的文本
     */
    private resolveVariables;
    /**
     * 构建API请求参数
     * @param prompt 提示词
     * @param config 节点配置
     * @returns API请求参数
     */
    private buildRequestParams;
    /**
     * 调用AI绘图API
     * @param params API请求参数
     * @param context 执行上下文
     * @returns API响应
     */
    private callAIAPI;
}
export default AIImageAdapter;
//# sourceMappingURL=AIImageAdapter.d.ts.map