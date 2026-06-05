/**
 * 图片输入节点适配器
 * 处理单图片和多图片输入节点的验证和执行逻辑
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
 * 单图片输入适配器
 */
export class ImageInputSingleAdapter extends BaseNodeAdapter {
  nodeType = 'IMAGE_INPUT_SINGLE'

  configSchema: ConfigSchema = {
    fields: [
      {
        key: 'imageUrl',
        label: '图片URL',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '图片的URL地址',
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
      const imageUrl = config.imageUrl || ''

      const outputData: OutputData = {
        imageUrls: imageUrl ? [imageUrl] : [],
        text: imageUrl || undefined,
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
 * 多图片输入适配器
 */
export class ImageInputMultiAdapter extends BaseNodeAdapter {
  nodeType = 'IMAGE_INPUT_MULTI'

  configSchema: ConfigSchema = {
    fields: [
      {
        key: 'imageUrls',
        label: '图片URL列表',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '多张图片的URL地址，用逗号分隔',
      },
      {
        key: 'maxCount',
        label: '最大数量',
        type: 'number',
        required: false,
        defaultValue: 20,
        description: '最多允许的图片数量',
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
      let imageUrls: string[] = []

      if (config.imageUrls) {
        imageUrls = config.imageUrls.split(',').map((url: string) => url.trim()).filter(Boolean)
      }

      const outputData: OutputData = {
        imageUrls,
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

export default ImageInputSingleAdapter
