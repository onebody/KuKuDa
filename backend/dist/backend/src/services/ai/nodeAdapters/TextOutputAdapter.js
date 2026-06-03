"use strict";
/**
 * 文本输出节点适配器
 * 处理文本输出节点的验证逻辑和执行逻辑
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextOutputAdapter = void 0;
const BaseNodeAdapter_1 = require("./BaseNodeAdapter");
/**
 * 文本输出适配器类
 * 继承 BaseNodeAdapter，实现文本输出节点的具体逻辑
 */
class TextOutputAdapter extends BaseNodeAdapter_1.BaseNodeAdapter {
    constructor() {
        super(...arguments);
        this.nodeType = 'TEXT_OUTPUT';
        this.configSchema = {
            fields: [
                {
                    key: 'outputFormat',
                    label: '输出格式',
                    type: 'select',
                    required: false,
                    defaultValue: 'text',
                    options: [
                        { label: '纯文本', value: 'text' },
                        { label: 'Markdown', value: 'markdown' },
                        { label: 'HTML', value: 'html' },
                        { label: 'JSON', value: 'json' },
                    ],
                    description: '输出内容的格式',
                },
                {
                    key: 'encoding',
                    label: '编码',
                    type: 'select',
                    required: false,
                    defaultValue: 'utf-8',
                    options: [
                        { label: 'UTF-8', value: 'utf-8' },
                        { label: 'ASCII', value: 'ascii' },
                        { label: 'UTF-16', value: 'utf-16' },
                    ],
                    description: '文本编码格式',
                },
                {
                    key: 'saveToFile',
                    label: '保存到文件',
                    type: 'boolean',
                    required: false,
                    defaultValue: false,
                    description: '是否将输出保存到文件',
                },
                {
                    key: 'fileName',
                    label: '文件名',
                    type: 'string',
                    required: false,
                    defaultValue: 'output.txt',
                    placeholder: '请输入文件名...',
                    description: '保存文件时的文件名（当 saveToFile 为 true 时生效）',
                },
                {
                    key: 'appendTimestamp',
                    label: '添加时间戳',
                    type: 'boolean',
                    required: false,
                    defaultValue: true,
                    description: '在输出末尾添加执行时间戳',
                },
            ],
            validate: (values) => {
                const errors = [];
                // 验证输出格式
                const validFormats = ['text', 'markdown', 'html', 'json'];
                if (values.outputFormat && !validFormats.includes(values.outputFormat)) {
                    errors.push({
                        field: 'outputFormat',
                        code: 'INVALID_FORMAT',
                        message: `无效的输出格式，支持: ${validFormats.join(', ')}`,
                    });
                }
                // 验证文件名
                if (values.saveToFile && !values.fileName) {
                    errors.push({
                        field: 'fileName',
                        code: 'MISSING_FILE_NAME',
                        message: '保存到文件时必须指定文件名',
                    });
                }
                // 验证编码
                const validEncodings = ['utf-8', 'ascii', 'utf-16'];
                if (values.encoding && !validEncodings.includes(values.encoding)) {
                    errors.push({
                        field: 'encoding',
                        code: 'INVALID_ENCODING',
                        message: `无效的编码格式，支持: ${validEncodings.join(', ')}`,
                    });
                }
                return {
                    valid: errors.length === 0,
                    errors,
                };
            },
        };
    }
    /**
     * 验证节点输入和配置
     * @param input 节点输入
     * @param config 节点配置
     * @returns 验证结果
     */
    validate(input, config) {
        // 调用父类的配置验证
        const configValidation = this.configSchema.validate(config);
        const errors = [...configValidation.errors];
        // 验证输入数据
        const hasInput = Object.keys(input).some((key) => input[key] !== undefined);
        if (!hasInput) {
            console.warn('[TextOutputAdapter] 警告: 没有检测到输入数据');
            // 注意：输出节点可以没有输入（使用默认值），所以这里只是警告
        }
        // 验证输入数据类型
        for (const [handleId, data] of Object.entries(input)) {
            if (data && !this.isValidOutputData(data)) {
                errors.push({
                    field: `input.${handleId}`,
                    code: 'INVALID_DATA_FORMAT',
                    message: `输入句柄 ${handleId} 的数据格式无效`,
                });
            }
        }
        return {
            valid: errors.length === 0,
            errors,
        };
    }
    /**
     * 执行节点逻辑
     * @param input 节点输入
     * @param config 节点配置
     * @param context 执行上下文
     * @returns 节点输出
     */
    async execute(input, config, context) {
        const startTime = Date.now();
        try {
            // 获取输入文本
            let inputText = this.extractTextFromInput(input);
            // 如果没有输入且不是必须，使用配置中的默认值
            if (!inputText && config.defaultValue) {
                inputText = config.defaultValue;
            }
            // 处理输出格式
            let outputText = inputText || '';
            // 根据输出格式处理
            const outputFormat = config.outputFormat || 'text';
            if (outputFormat === 'json') {
                try {
                    // 尝试解析为JSON
                    const jsonData = JSON.parse(outputText);
                    outputText = JSON.stringify(jsonData, null, 2);
                }
                catch (e) {
                    // 如果不是有效JSON，保持原样
                    console.warn('[TextOutputAdapter] 输入不是有效的JSON，保持原样');
                }
            }
            // 添加时间戳
            if (config.appendTimestamp) {
                const timestamp = new Date().toISOString();
                outputText += `\n\n---\n生成时间: ${timestamp}`;
            }
            // 保存到文件（如果启用）
            let fileUrl;
            if (config.saveToFile) {
                fileUrl = await this.saveToFile(outputText, config.fileName || 'output.txt', config.encoding || 'utf-8');
            }
            // 构建输出数据
            const outputData = {
                text: outputText,
            };
            if (fileUrl) {
                outputData.files = [
                    {
                        name: config.fileName || 'output.txt',
                        url: fileUrl,
                        type: 'text/plain',
                        size: outputText.length,
                        metadata: {
                            encoding: config.encoding || 'utf-8',
                            format: outputFormat,
                        },
                    },
                ];
            }
            // 构建执行元数据
            const metadata = {
                nodeId: context.workflowId || 'unknown',
                executionTime: Date.now() - startTime,
                timestamp: new Date(),
                upstreamNodeIds: Object.keys(input),
            };
            // 返回成功结果
            return {
                status: 'SUCCESS',
                data: outputData,
                metadata,
            };
        }
        catch (error) {
            // 错误处理
            return {
                status: 'ERROR',
                error: this.handleError(error),
                metadata: {
                    nodeId: context.workflowId || 'unknown',
                    executionTime: Date.now() - startTime,
                    timestamp: new Date(),
                    upstreamNodeIds: Object.keys(input),
                },
            };
        }
    }
    /**
     * 从输入中提取文本
     * @param input 节点输入
     * @returns 提取的文本
     */
    extractTextFromInput(input) {
        // 优先使用 'text' 句柄
        if (input['text']?.text) {
            return input['text'].text;
        }
        // 尝试从第一个可用的句柄获取文本
        for (const [, data] of Object.entries(input)) {
            if (data?.text) {
                return data.text;
            }
        }
        // 如果没有文本，尝试拼接所有可用数据
        const parts = [];
        for (const [, data] of Object.entries(input)) {
            if (data?.text) {
                parts.push(data.text);
            }
            else if (data?.json) {
                parts.push(JSON.stringify(data.json, null, 2));
            }
        }
        return parts.join('\n');
    }
    /**
     * 验证输出数据格式
     * @param data 输出数据
     * @returns 是否有效
     */
    isValidOutputData(data) {
        if (!data || typeof data !== 'object') {
            return false;
        }
        // 必须有 text, imageUrls, files, json 中的一个
        const hasValidField = data.text !== undefined ||
            data.imageUrls !== undefined ||
            data.files !== undefined ||
            data.json !== undefined;
        return hasValidField;
    }
    /**
     * 保存文本到文件
     * @param text 文本内容
     * @param fileName 文件名
     * @param encoding 编码
     * @returns 文件URL
     */
    async saveToFile(text, fileName, encoding) {
        // 简化实现：返回模拟的文件URL
        // 实际应用中应该保存到文件系统或对象存储
        const timestamp = Date.now();
        const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileUrl = `/api/files/${timestamp}_${sanitizedFileName}`;
        console.log(`[TextOutputAdapter] 保存文件: ${fileUrl}, 编码: ${encoding}, 大小: ${text.length} 字节`);
        // 这里应该实际保存文件
        // 示例：await fs.writeFile(path, text, encoding)
        return fileUrl;
    }
}
exports.TextOutputAdapter = TextOutputAdapter;
// 导出适配器类
exports.default = TextOutputAdapter;
//# sourceMappingURL=TextOutputAdapter.js.map