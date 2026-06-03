/**
 * 节点注册中心
 * 负责管理和注册所有节点类型，支持动态注册
 */

import React from 'react'
import { NodeType, NodeCategory, ConfigSchema, NodeTypeDefinition } from '../../../../../shared/types/node'

export type { NodeTypeDefinition } from '../../../../../shared/types/node'

/**
 * 节点注册中心类
 */
class NodeRegistry {
  private nodeTypes: Map<string, NodeTypeDefinition> = new Map()

  /**
   * 注册节点类型
   * @param definition 节点类型定义
   */
  registerNodeType(definition: NodeTypeDefinition): void {
    if (this.nodeTypes.has(definition.type)) {
      console.warn(`[NodeRegistry] 节点类型已存在，将被覆盖: ${definition.type}`)
    }
    this.nodeTypes.set(definition.type, definition)
    console.log(`[NodeRegistry] 注册节点类型: ${definition.type} - ${definition.label}`)
  }

  /**
   * 获取节点类型定义
   * @param type 节点类型
   * @returns 节点类型定义
   */
  getNodeType(type: string): NodeTypeDefinition | undefined {
    return this.nodeTypes.get(type)
  }

  /**
   * 获取所有节点类型定义
   * @returns 节点类型定义数组
   */
  getAllNodeTypes(): NodeTypeDefinition[] {
    return Array.from(this.nodeTypes.values())
  }

  /**
   * 获取指定分类的节点类型
   * @param category 节点分类
   * @returns 节点类型定义数组
   */
  getNodeTypesByCategory(category: NodeCategory): NodeTypeDefinition[] {
    return this.getAllNodeTypes().filter(node => node.category === category)
  }

  /**
   * 获取React Flow节点类型名称
   * @param type 节点类型
   * @returns React Flow节点类型名称
   */
  getReactFlowNodeType(type: string): string {
    return type.toLowerCase()
  }

  /**
   * 注销节点类型
   * @param type 节点类型
   */
  unregisterNodeType(type: string): void {
    this.nodeTypes.delete(type)
    console.log(`[NodeRegistry] 注销节点类型: ${type}`)
  }

  /**
   * 检查节点类型是否已注册
   * @param type 节点类型
   * @returns 是否已注册
   */
  hasNodeType(type: string): boolean {
    return this.nodeTypes.has(type)
  }

  /**
   * 清空所有注册的节点类型
   */
  clear(): void {
    this.nodeTypes.clear()
    console.log('[NodeRegistry] 已清空所有节点类型')
  }

  /**
   * 获取所有已注册的节点类型名称
   * @returns 节点类型名称数组
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.nodeTypes.keys())
  }
}

// 创建全局单例
const nodeRegistry = new NodeRegistry()

export default nodeRegistry
