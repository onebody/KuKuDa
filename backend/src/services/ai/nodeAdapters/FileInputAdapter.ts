/**
 * 文件输入节点适配器
 * 处理单文件和多文件输入节点的验证和执行逻辑
 */

import { BaseNodeAdapter } from './BaseNodeAdapter'
import {
  NodeInput,
  NodeOutput,
  ConfigSchema,
  OutputData,
  ExecutionMetadata,
} from '../../../../../shared/types/node'
import { ExecutionContext } from '../../../types/node'

/**
 * 单文件输入适配器
 */
export class FileInputSingleAdapter extends BaseNodeAdapter {
  nodeType = 'FILE_INPUT_SINGLE'

  configSchema: ConfigSchema = {
    fields: [
      {
        key: 'fileUrl',
        label: '文件URL',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '文件的URL地址',
      },
      {
        key: 'fileName',
        label: '文件名',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '文件名',
      },
    ],
    validate: () => ({ valid: true, errors: [] }),
  }

  async execute(
    input: NodeInput,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeOutput> {
    const startTime = Date.now()

    try {
      const files = config.fileUrl
        ? [{
            name: config.fileName || 'unknown',
            url: config.fileUrl,
            type: config.fileType || 'application/octet-stream',
            size: config.fileSize || 0,
          }]
        : []

      const outputData: OutputData = {
        files,
      }

      const metadata: ExecutionMetadata = {
        nodeId: context.workflowId || 'unknown',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        upstreamNodeIds: [],
      }

      return {
        status: 'SUCCESS',
        data: outputData,
        metadata,
      }
    } catch (error: any) {
      return {
        status: 'ERROR',
        error: this.handleError(error),
        metadata: {
          nodeId: context.workflowId || 'unknown',
          executionTime: Date.now() - startTime,
          timestamp: new Date(),
          upstreamNodeIds: [],
        },
      }
    }
  }
}

/**
 * 多文件输入适配器
 */
export class FileInputMultiAdapter extends BaseNodeAdapter {
  nodeType = 'FILE_INPUT_MULTI'

  configSchema: ConfigSchema = {
    fields: [
      {
        key: 'fileUrls',
        label: '文件URL列表',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '多个文件的URL地址，用逗号分隔',
      },
    ],
    validate: () => ({ valid: true, errors: [] }),
  }

  async execute(
    input: NodeInput,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeOutput> {
    const startTime = Date.now()

    try {
      let files: any[] = []

      if (config.fileUrls) {
        const urls = config.fileUrls.split(',').map((url: string) => url.trim()).filter(Boolean)
        files = urls.map((url: string, index: number) => ({
          name: config.fileNames?.[index] || `file_${index}`,
          url,
          type: config.fileTypes?.[index] || 'application/octet-stream',
          size: config.fileSizes?.[index] || 0,
        }))
      }

      const outputData: OutputData = {
        files,
      }

      const metadata: ExecutionMetadata = {
        nodeId: context.workflowId || 'unknown',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        upstreamNodeIds: [],
      }

      return {
        status: 'SUCCESS',
        data: outputData,
        metadata,
      }
    } catch (error: any) {
      return {
        status: 'ERROR',
        error: this.handleError(error),
        metadata: {
          nodeId: context.workflowId || 'unknown',
          executionTime: Date.now() - startTime,
          timestamp: new Date(),
          upstreamNodeIds: [],
        },
      }
    }
  }
}

export default FileInputSingleAdapter
