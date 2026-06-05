/**
 * 节点适配器导出
 * 统一导出所有节点适配器，并在导入时自动注册到适配器注册表
 */

// 导出基类
export { BaseNodeAdapter } from './BaseNodeAdapter'

// 导出适配器类型
export type { INodeAdapter } from '../../../types/node'

// 导入所有适配器
import { BaseNodeAdapter } from './BaseNodeAdapter'
import { INodeAdapter } from '../../../types/node'

import { TextInputAdapter } from './TextInputAdapter'
import { AIImageAdapter } from './AIImageAdapter'
import { TextOutputAdapter } from './TextOutputAdapter'
import { ImageInputSingleAdapter, ImageInputMultiAdapter } from './ImageInputAdapter'
import { FileInputSingleAdapter, FileInputMultiAdapter } from './FileInputAdapter'
import { SkillAdapter } from './SkillAdapter'

/**
 * 适配器注册表
 * 用于动态注册和获取适配器实例
 */
class AdapterRegistry {
  private adapters: Map<string, new () => BaseNodeAdapter> = new Map()

  /**
   * 注册适配器类
   * @param nodeType 节点类型
   * @param adapterClass 适配器类（构造函数）
   */
  register(nodeType: string, adapterClass: new () => BaseNodeAdapter): void {
    if (this.adapters.has(nodeType)) {
      console.warn(`[AdapterRegistry] 适配器已存在，将被覆盖: ${nodeType}`)
    }
    this.adapters.set(nodeType, adapterClass)
    console.log(`[AdapterRegistry] 注册适配器: ${nodeType}`)
  }

  /**
   * 创建适配器实例
   * @param nodeType 节点类型
   * @returns 适配器实例
   */
  createInstance(nodeType: string): BaseNodeAdapter | null {
    const AdapterClass = this.adapters.get(nodeType)
    if (!AdapterClass) {
      console.error(`[AdapterRegistry] 未找到节点类型 ${nodeType} 的适配器`)
      return null
    }

    try {
      return new AdapterClass()
    } catch (error) {
      console.error(`[AdapterRegistry] 创建适配器实例失败: ${nodeType}`, error)
      return null
    }
  }

  /**
   * 检查适配器是否已注册
   * @param nodeType 节点类型
   * @returns 是否已注册
   */
  hasAdapter(nodeType: string): boolean {
    return this.adapters.has(nodeType)
  }

  /**
   * 注销适配器
   * @param nodeType 节点类型
   */
  unregister(nodeType: string): void {
    this.adapters.delete(nodeType)
    console.log(`[AdapterRegistry] 注销适配器: ${nodeType}`)
  }

  /**
   * 获取所有已注册的节点类型
   * @returns 节点类型数组
   */
  getRegisteredTypes(): string[] {
    return Array.from(this.adapters.keys())
  }

  /**
   * 清空所有适配器
   */
  clear(): void {
    this.adapters.clear()
    console.log('[AdapterRegistry] 已清空所有适配器')
  }
}

// 创建全局单例
const adapterRegistry = new AdapterRegistry()

// ============ 自动注册所有适配器 ============
adapterRegistry.register('TEXT_INPUT', TextInputAdapter)
adapterRegistry.register('IMAGE_INPUT_SINGLE', ImageInputSingleAdapter)
adapterRegistry.register('IMAGE_INPUT_MULTI', ImageInputMultiAdapter)
adapterRegistry.register('FILE_INPUT_SINGLE', FileInputSingleAdapter)
adapterRegistry.register('FILE_INPUT_MULTI', FileInputMultiAdapter)
adapterRegistry.register('AI_IMAGE', AIImageAdapter)
adapterRegistry.register('TEXT_OUTPUT', TextOutputAdapter)
adapterRegistry.register('SKILL', SkillAdapter)

console.log('[AdapterRegistry] 所有适配器已注册:', adapterRegistry.getRegisteredTypes())

export { adapterRegistry }

// 导出具体适配器类（供需要直接使用的场景）
export { TextInputAdapter }
export { AIImageAdapter }
export { TextOutputAdapter }
export { ImageInputSingleAdapter, ImageInputMultiAdapter }
export { FileInputSingleAdapter, FileInputMultiAdapter }
export { SkillAdapter }
