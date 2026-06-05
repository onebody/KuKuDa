/**
 * 技能节点适配器
 * 处理技能节点的验证和执行逻辑
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
 * 技能节点适配器
 */
export class SkillAdapter extends BaseNodeAdapter {
  nodeType = 'SKILL'

  configSchema: ConfigSchema = {
    fields: [
      {
        key: 'skillId',
        label: '技能ID',
        type: 'string',
        required: true,
        defaultValue: '',
        description: '要执行的技能标识',
      },
      {
        key: 'skillName',
        label: '技能名称',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '技能显示名称',
      },
      {
        key: 'config',
        label: '技能配置',
        type: 'string',
        required: false,
        defaultValue: '',
        description: '技能配置参数（JSON格式）',
      },
    ],
    validate: (values: Record<string, any>) => {
      const errors: any[] = []

      if (!values.skillId) {
        errors.push({
          field: 'skillId',
          code: 'MISSING_SKILL_ID',
          message: '技能ID不能为空',
        })
      }

      return { valid: errors.length === 0, errors }
    },
  }

  async execute(
    input: NodeInput,
    config: Record<string, any>,
    context: ExecutionContext
  ): Promise<NodeOutput> {
    const startTime = Date.now()

    try {
      // 技能节点：将上游输入和配置合并后输出
      // 实际应用中应该调用技能注册表执行具体技能
      const outputData: OutputData = {
        json: {
          skillId: config.skillId,
          skillName: config.skillName,
          config: config.config,
          input,
        },
      }

      const metadata: ExecutionMetadata = {
        nodeId: context.workflowId || 'unknown',
        executionTime: Date.now() - startTime,
        timestamp: new Date(),
        upstreamNodeIds: Object.keys(input),
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
          upstreamNodeIds: Object.keys(input),
        },
      }
    }
  }
}

export default SkillAdapter
