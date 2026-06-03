/**
 * 文本输出节点适配器
 * 处理文本输出节点的验证逻辑和执行逻辑
 */
import { BaseNodeAdapter } from './BaseNodeAdapter';
import { NodeInput, NodeOutput, ConfigSchema, ValidationResult } from '../../../../../shared/types/node';
import { ExecutionContext } from '../../../types/node';
/**
 * 文本输出适配器类
 * 继承 BaseNodeAdapter，实现文本输出节点的具体逻辑
 */
export declare class TextOutputAdapter extends BaseNodeAdapter {
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
     * 验证输出数据格式
     * @param data 输出数据
     * @returns 是否有效
     */
    private isValidOutputData;
    /**
     * 保存文本到文件
     * @param text 文本内容
     * @param fileName 文件名
     * @param encoding 编码
     * @returns 文件URL
     */
    private saveToFile;
}
export default TextOutputAdapter;
//# sourceMappingURL=TextOutputAdapter.d.ts.map