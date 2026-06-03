/**
 * 节点数据验证工具
 * 基于 Zod 提供类型安全的验证
 */

import { z } from 'zod'
import {
  NodeType,
  DataType,
  NodeCategory,
  PortDefinition,
  ConfigField,
  ConfigSchema,
  ValidationError,
  ValidationResult,
  NodeOutput,
  OutputData,
  StandardError,
} from '../../../shared/types/node'

/**
 * 创建端口定义验证Schema
 */
export const PortDefinitionSchema = z.object({
  id: z.string().min(1, '端口ID不能为空'),
  label: z.string().min(1, '端口标签不能为空'),
  dataType: z.nativeEnum(DataType, {
    errorMap: () => ({ message: '无效的数据类型' }),
  }),
})

/**
 * 创建配置字段验证Schema
 */
export const ConfigFieldSchema = z.object({
  key: z.string().min(1, '配置字段key不能为空'),
  label: z.string().min(1, '配置字段标签不能为空'),
  type: z.enum(['string', 'number', 'boolean', 'select', 'multiselect', 'textarea', 'file', 'image'], {
    errorMap: () => ({ message: '无效的字段类型' }),
  }),
  required: z.boolean(),
  defaultValue: z.any(),
  options: z
    .array(
      z.object({
        label: z.string(),
        value: z.any(),
      })
    )
    .optional(),
  placeholder: z.string().optional(),
  description: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
})

/**
 * 验证端口定义
 * @param port 端口定义
 * @returns 验证结果
 */
export function validatePortDefinition(port: PortDefinition): ValidationResult {
  try {
    PortDefinitionSchema.parse(port)
    return { valid: true, errors: [] }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: ValidationError[] = error.errors.map((err) => ({
        field: err.path.join('.'),
        code: 'VALIDATION_ERROR',
        message: err.message,
      }))
      return { valid: false, errors }
    }
    return {
      valid: false,
      errors: [
        {
          code: 'UNKNOWN_ERROR',
          message: '验证过程中发生未知错误',
        },
      ],
    }
  }
}

/**
 * 验证配置值
 * @param config 配置对象
 * @param schema 配置Schema
 * @returns 验证结果
 */
export function validateConfig(
  config: Record<string, any>,
  schema: ConfigSchema
): ValidationResult {
  try {
    const result = schema.validate(config)
    return result
  } catch (error: any) {
    return {
      valid: false,
      errors: [
        {
          code: 'VALIDATION_ERROR',
          message: error.message || '配置验证失败',
        },
      ],
    }
  }
}

/**
 * 验证节点输出
 * @param output 节点输出
 * @returns 验证结果
 */
export function validateNodeOutput(output: NodeOutput): ValidationResult {
  const errors: ValidationError[] = []

  // 验证状态
  if (!['SUCCESS', 'ERROR', 'RUNNING'].includes(output.status)) {
    errors.push({
      field: 'status',
      code: 'INVALID_STATUS',
      message: '无效的节点执行状态',
    })
  }

  // 如果状态是SUCCESS，必须有data
  if (output.status === 'SUCCESS' && !output.data) {
    errors.push({
      field: 'data',
      code: 'MISSING_DATA',
      message: '成功状态的节点输出必须包含data字段',
    })
  }

  // 如果状态是ERROR，必须有error
  if (output.status === 'ERROR' && !output.error) {
    errors.push({
      field: 'error',
      code: 'MISSING_ERROR',
      message: '错误状态的节点输出必须包含error字段',
    })
  }

  // 验证data结构
  if (output.data) {
    const dataErrors = validateOutputData(output.data)
    errors.push(...dataErrors)
  }

  // 验证error结构
  if (output.error) {
    const errorErrors = validateErrorInfo(output.error)
    errors.push(...errorErrors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * 验证输出数据
 * @param data 输出数据
 * @returns 验证错误数组
 */
function validateOutputData(data: OutputData): ValidationError[] {
  const errors: ValidationError[] = []

  // text必须是字符串或undefined
  if (data.text !== undefined && typeof data.text !== 'string') {
    errors.push({
      field: 'data.text',
      code: 'INVALID_TYPE',
      message: 'text字段必须是字符串',
    })
  }

  // imageUrls必须是字符串数组或undefined
  if (data.imageUrls !== undefined) {
    if (!Array.isArray(data.imageUrls)) {
      errors.push({
        field: 'data.imageUrls',
        code: 'INVALID_TYPE',
        message: 'imageUrls字段必须是数组',
      })
    } else {
      data.imageUrls.forEach((url, index) => {
        if (typeof url !== 'string') {
          errors.push({
            field: `data.imageUrls[${index}]`,
            code: 'INVALID_TYPE',
            message: 'imageUrls数组元素必须是字符串',
          })
        }
      })
    }
  }

  // files必须是数组或undefined
  if (data.files !== undefined) {
    if (!Array.isArray(data.files)) {
      errors.push({
        field: 'data.files',
        code: 'INVALID_TYPE',
        message: 'files字段必须是数组',
      })
    }
  }

  return errors
}

/**
 * 验证错误信息
 * @param error 错误信息
 * @returns 验证错误数组
 */
function validateErrorInfo(error: any): ValidationError[] {
  const errors: ValidationError[] = []

  if (!error.code || typeof error.code !== 'string') {
    errors.push({
      field: 'error.code',
      code: 'MISSING_FIELD',
      message: 'error.code字段必须存在且为字符串',
    })
  }

  if (!error.message || typeof error.message !== 'string') {
    errors.push({
      field: 'error.message',
      code: 'MISSING_FIELD',
      message: 'error.message字段必须存在且为字符串',
    })
  }

  return errors
}

/**
 * 验证节点类型
 * @param nodeType 节点类型
 * @returns 是否有效
 */
export function isValidNodeType(nodeType: string): boolean {
  return Object.values(NodeType).includes(nodeType as any)
}

/**
 * 验证数据类型
 * @param dataType 数据类型
 * @returns 是否有效
 */
export function isValidDataType(dataType: string): boolean {
  return Object.values(DataType).includes(dataType as any)
}

/**
 * 验证节点分类
 * @param category 节点分类
 * @returns 是否有效
 */
export function isValidNodeCategory(category: string): boolean {
  return Object.values(NodeCategory).includes(category as any)
}

/**
 * 创建标准错误对象
 * @param code 错误代码
 * @param message 错误消息
 * @param details 详细信息
 * @returns 标准错误对象
 */
export function createStandardError(
  code: string,
  message: string,
  details?: any
): StandardError {
  return {
    code,
    message,
    details,
  }
}

/**
 * 创建验证错误对象
 * @param field 字段名
 * @param code 错误代码
 * @param message 错误消息
 * @returns 验证错误对象
 */
export function createValidationError(
  field: string | undefined,
  code: string,
  message: string
): ValidationError {
  return {
    field,
    code,
    message,
  }
}
