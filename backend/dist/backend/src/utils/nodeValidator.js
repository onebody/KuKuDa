"use strict";
/**
 * 节点数据验证工具
 * 基于 Zod 提供类型安全的验证
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFieldSchema = exports.PortDefinitionSchema = void 0;
exports.validatePortDefinition = validatePortDefinition;
exports.validateConfig = validateConfig;
exports.validateNodeOutput = validateNodeOutput;
exports.isValidNodeType = isValidNodeType;
exports.isValidDataType = isValidDataType;
exports.isValidNodeCategory = isValidNodeCategory;
exports.createStandardError = createStandardError;
exports.createValidationError = createValidationError;
const zod_1 = require("zod");
const node_1 = require("../../../shared/types/node");
/**
 * 创建端口定义验证Schema
 */
exports.PortDefinitionSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, '端口ID不能为空'),
    label: zod_1.z.string().min(1, '端口标签不能为空'),
    dataType: zod_1.z.nativeEnum(node_1.DataType, {
        errorMap: () => ({ message: '无效的数据类型' }),
    }),
});
/**
 * 创建配置字段验证Schema
 */
exports.ConfigFieldSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, '配置字段key不能为空'),
    label: zod_1.z.string().min(1, '配置字段标签不能为空'),
    type: zod_1.z.enum(['string', 'number', 'boolean', 'select', 'multiselect', 'textarea', 'file', 'image'], {
        errorMap: () => ({ message: '无效的字段类型' }),
    }),
    required: zod_1.z.boolean(),
    defaultValue: zod_1.z.any(),
    options: zod_1.z
        .array(zod_1.z.object({
        label: zod_1.z.string(),
        value: zod_1.z.any(),
    }))
        .optional(),
    placeholder: zod_1.z.string().optional(),
    description: zod_1.z.string().optional(),
    min: zod_1.z.number().optional(),
    max: zod_1.z.number().optional(),
});
/**
 * 验证端口定义
 * @param port 端口定义
 * @returns 验证结果
 */
function validatePortDefinition(port) {
    try {
        exports.PortDefinitionSchema.parse(port);
        return { valid: true, errors: [] };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            const errors = error.errors.map((err) => ({
                field: err.path.join('.'),
                code: 'VALIDATION_ERROR',
                message: err.message,
            }));
            return { valid: false, errors };
        }
        return {
            valid: false,
            errors: [
                {
                    code: 'UNKNOWN_ERROR',
                    message: '验证过程中发生未知错误',
                },
            ],
        };
    }
}
/**
 * 验证配置值
 * @param config 配置对象
 * @param schema 配置Schema
 * @returns 验证结果
 */
function validateConfig(config, schema) {
    try {
        const result = schema.validate(config);
        return result;
    }
    catch (error) {
        return {
            valid: false,
            errors: [
                {
                    code: 'VALIDATION_ERROR',
                    message: error.message || '配置验证失败',
                },
            ],
        };
    }
}
/**
 * 验证节点输出
 * @param output 节点输出
 * @returns 验证结果
 */
function validateNodeOutput(output) {
    const errors = [];
    // 验证状态
    if (!['SUCCESS', 'ERROR', 'RUNNING'].includes(output.status)) {
        errors.push({
            field: 'status',
            code: 'INVALID_STATUS',
            message: '无效的节点执行状态',
        });
    }
    // 如果状态是SUCCESS，必须有data
    if (output.status === 'SUCCESS' && !output.data) {
        errors.push({
            field: 'data',
            code: 'MISSING_DATA',
            message: '成功状态的节点输出必须包含data字段',
        });
    }
    // 如果状态是ERROR，必须有error
    if (output.status === 'ERROR' && !output.error) {
        errors.push({
            field: 'error',
            code: 'MISSING_ERROR',
            message: '错误状态的节点输出必须包含error字段',
        });
    }
    // 验证data结构
    if (output.data) {
        const dataErrors = validateOutputData(output.data);
        errors.push(...dataErrors);
    }
    // 验证error结构
    if (output.error) {
        const errorErrors = validateErrorInfo(output.error);
        errors.push(...errorErrors);
    }
    return {
        valid: errors.length === 0,
        errors,
    };
}
/**
 * 验证输出数据
 * @param data 输出数据
 * @returns 验证错误数组
 */
function validateOutputData(data) {
    const errors = [];
    // text必须是字符串或undefined
    if (data.text !== undefined && typeof data.text !== 'string') {
        errors.push({
            field: 'data.text',
            code: 'INVALID_TYPE',
            message: 'text字段必须是字符串',
        });
    }
    // imageUrls必须是字符串数组或undefined
    if (data.imageUrls !== undefined) {
        if (!Array.isArray(data.imageUrls)) {
            errors.push({
                field: 'data.imageUrls',
                code: 'INVALID_TYPE',
                message: 'imageUrls字段必须是数组',
            });
        }
        else {
            data.imageUrls.forEach((url, index) => {
                if (typeof url !== 'string') {
                    errors.push({
                        field: `data.imageUrls[${index}]`,
                        code: 'INVALID_TYPE',
                        message: 'imageUrls数组元素必须是字符串',
                    });
                }
            });
        }
    }
    // files必须是数组或undefined
    if (data.files !== undefined) {
        if (!Array.isArray(data.files)) {
            errors.push({
                field: 'data.files',
                code: 'INVALID_TYPE',
                message: 'files字段必须是数组',
            });
        }
    }
    return errors;
}
/**
 * 验证错误信息
 * @param error 错误信息
 * @returns 验证错误数组
 */
function validateErrorInfo(error) {
    const errors = [];
    if (!error.code || typeof error.code !== 'string') {
        errors.push({
            field: 'error.code',
            code: 'MISSING_FIELD',
            message: 'error.code字段必须存在且为字符串',
        });
    }
    if (!error.message || typeof error.message !== 'string') {
        errors.push({
            field: 'error.message',
            code: 'MISSING_FIELD',
            message: 'error.message字段必须存在且为字符串',
        });
    }
    return errors;
}
/**
 * 验证节点类型
 * @param nodeType 节点类型
 * @returns 是否有效
 */
function isValidNodeType(nodeType) {
    return Object.values(node_1.NodeType).includes(nodeType);
}
/**
 * 验证数据类型
 * @param dataType 数据类型
 * @returns 是否有效
 */
function isValidDataType(dataType) {
    return Object.values(node_1.DataType).includes(dataType);
}
/**
 * 验证节点分类
 * @param category 节点分类
 * @returns 是否有效
 */
function isValidNodeCategory(category) {
    return Object.values(node_1.NodeCategory).includes(category);
}
/**
 * 创建标准错误对象
 * @param code 错误代码
 * @param message 错误消息
 * @param details 详细信息
 * @returns 标准错误对象
 */
function createStandardError(code, message, details) {
    return {
        code,
        message,
        details,
    };
}
/**
 * 创建验证错误对象
 * @param field 字段名
 * @param code 错误代码
 * @param message 错误消息
 * @returns 验证错误对象
 */
function createValidationError(field, code, message) {
    return {
        field,
        code,
        message,
    };
}
//# sourceMappingURL=nodeValidator.js.map