/**
 * 节点数据验证工具
 * 基于 Zod 提供类型安全的验证
 */
import { z } from 'zod';
import { DataType, PortDefinition, ConfigSchema, ValidationError, ValidationResult, NodeOutput, StandardError } from '../../../shared/types/node';
/**
 * 创建端口定义验证Schema
 */
export declare const PortDefinitionSchema: z.ZodObject<{
    id: z.ZodString;
    label: z.ZodString;
    dataType: z.ZodNativeEnum<typeof DataType>;
}, "strip", z.ZodTypeAny, {
    id: string;
    label: string;
    dataType: DataType;
}, {
    id: string;
    label: string;
    dataType: DataType;
}>;
/**
 * 创建配置字段验证Schema
 */
export declare const ConfigFieldSchema: z.ZodObject<{
    key: z.ZodString;
    label: z.ZodString;
    type: z.ZodEnum<["string", "number", "boolean", "select", "multiselect", "textarea", "file", "image"]>;
    required: z.ZodBoolean;
    defaultValue: z.ZodAny;
    options: z.ZodOptional<z.ZodArray<z.ZodObject<{
        label: z.ZodString;
        value: z.ZodAny;
    }, "strip", z.ZodTypeAny, {
        label: string;
        value?: any;
    }, {
        label: string;
        value?: any;
    }>, "many">>;
    placeholder: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    min: z.ZodOptional<z.ZodNumber>;
    max: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    type: "string" | "number" | "boolean" | "select" | "multiselect" | "textarea" | "file" | "image";
    label: string;
    key: string;
    required: boolean;
    min?: number | undefined;
    options?: {
        label: string;
        value?: any;
    }[] | undefined;
    description?: string | undefined;
    max?: number | undefined;
    defaultValue?: any;
    placeholder?: string | undefined;
}, {
    type: "string" | "number" | "boolean" | "select" | "multiselect" | "textarea" | "file" | "image";
    label: string;
    key: string;
    required: boolean;
    min?: number | undefined;
    options?: {
        label: string;
        value?: any;
    }[] | undefined;
    description?: string | undefined;
    max?: number | undefined;
    defaultValue?: any;
    placeholder?: string | undefined;
}>;
/**
 * 验证端口定义
 * @param port 端口定义
 * @returns 验证结果
 */
export declare function validatePortDefinition(port: PortDefinition): ValidationResult;
/**
 * 验证配置值
 * @param config 配置对象
 * @param schema 配置Schema
 * @returns 验证结果
 */
export declare function validateConfig(config: Record<string, any>, schema: ConfigSchema): ValidationResult;
/**
 * 验证节点输出
 * @param output 节点输出
 * @returns 验证结果
 */
export declare function validateNodeOutput(output: NodeOutput): ValidationResult;
/**
 * 验证节点类型
 * @param nodeType 节点类型
 * @returns 是否有效
 */
export declare function isValidNodeType(nodeType: string): boolean;
/**
 * 验证数据类型
 * @param dataType 数据类型
 * @returns 是否有效
 */
export declare function isValidDataType(dataType: string): boolean;
/**
 * 验证节点分类
 * @param category 节点分类
 * @returns 是否有效
 */
export declare function isValidNodeCategory(category: string): boolean;
/**
 * 创建标准错误对象
 * @param code 错误代码
 * @param message 错误消息
 * @param details 详细信息
 * @returns 标准错误对象
 */
export declare function createStandardError(code: string, message: string, details?: any): StandardError;
/**
 * 创建验证错误对象
 * @param field 字段名
 * @param code 错误代码
 * @param message 错误消息
 * @returns 验证错误对象
 */
export declare function createValidationError(field: string | undefined, code: string, message: string): ValidationError;
//# sourceMappingURL=nodeValidator.d.ts.map