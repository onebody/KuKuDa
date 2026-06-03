/**
 * 文本输入节点适配器
 * 处理文本输入节点的验证逻辑和执行逻辑
 */
import { BaseNodeAdapter } from './BaseNodeAdapter';
import { NodeInput, NodeOutput, ConfigSchema, ValidationResult } from '../../../../../shared/types/node';
import { ExecutionContext } from '../../../types/node';
/**
 * 文本输入适配器类
 * 继承 BaseNodeAdapter，实现文本输入节点的具体逻辑
 */
export declare class TextInputAdapter extends BaseNodeAdapter {
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
     * 变量插值解析
     * @param text 包含变量的文本
     * @param variables 变量上下文
     * @returns 解析后的文本
     */
    private resolveVariables;
    /**
     * 创建错误输出（辅助方法）
     * @param error 错误信息
     * @returns 节点输出
     */
    private createErrorOutput;
}
export default TextInputAdapter;
//# sourceMappingURL=TextInputAdapter.d.ts.map