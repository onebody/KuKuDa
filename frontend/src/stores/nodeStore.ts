import { create } from 'zustand'
import type { Node, Edge } from 'reactflow'
import { NodeData, ConnectionData } from '../types/node'
import * as nodeService from '../services/nodeService'
import { workflowService } from '../services/workflowService'
import { NodeType, NodeCategory, NodeTypeDefinition } from '../../../shared/types/node'
import nodeRegistry from '../components/canvas/nodes/NodeRegistry'

// Local WorkflowData matching types/node.ts types
interface WorkflowData {
  nodes: NodeData[]
  connections: ConnectionData[]
  viewport?: string | null
}
import { toast } from 'react-hot-toast'

// NodeType enum -> React Flow node type key (动态从 NodeRegistry 获取)
const getNodeTypeMap = (): Record<string, string> => {
  const typeMap: Record<string, string> = {}
  const definitions = nodeRegistry.getAllNodeTypes()
  definitions.forEach(def => {
    typeMap[def.type] = def.type.toLowerCase()
  })

  // 默认值（如果注册中心还没有加载）
  if (Object.keys(typeMap).length === 0) {
    return {
      'TEXT_INPUT': 'textInput',
      'IMAGE_INPUT': 'imageInput',
      'FILE_INPUT': 'fileInput',
      'AI_IMAGE': 'aiImage',
    }
  }

  return typeMap
}

// NodeType enum -> friendly Chinese label (动态从 NodeRegistry 获取)
const getNodeLabelMap = (): Record<string, string> => {
  const labelMap: Record<string, string> = {}
  const definitions = nodeRegistry.getAllNodeTypes()
  definitions.forEach(def => {
    labelMap[def.type] = def.label
  })

  // 默认值（如果注册中心还没有加载）
  if (Object.keys(labelMap).length === 0) {
    return {
      'TEXT_INPUT': '文本输入',
      'IMAGE_INPUT': '图片输入',
      'FILE_INPUT': '文件输入',
      'AI_IMAGE': 'AI绘图',
    }
  }

  return labelMap
}

/**
 * 将后端节点数据转换为 React Flow 节点
 */
  const convertToReactFlowNodes = (nodes: NodeData[]): Node[] => {
    if (!nodes || !Array.isArray(nodes)) return [];
    const nodeTypeMap = getNodeTypeMap()
    const nodeLabelMap = getNodeLabelMap()

    return nodes.map((node) => ({
    id: node.id,
    type: nodeTypeMap[node.type] || node.type.toLowerCase(),
    position: {
      x: node.positionX ?? 0,
      y: node.positionY ?? 0,
    },
    data: {
      label: node.label || nodeLabelMap[node.type] || node.type,
      nodeType: node.type,
      status: node.status,
      config: node.config,
      result: node.result,
      error: node.error,
      ...node.data,
    },
  }));
};

/**
 * 将后端连接数据转换为 React Flow 边
 */
  const convertToReactFlowEdges = (connections: ConnectionData[]): Edge[] => {
    if (!connections || !Array.isArray(connections)) return [];
    return connections.map((conn) => ({
    id: conn.id,
    source: conn.sourceNodeId,
    sourceHandle: conn.sourceHandle,
    target: conn.targetNodeId,
    targetHandle: conn.targetHandle,
  }));
  };

/**
 * 节点状态管理 Store
 */
export const useNodeStore = create<NodeStore>((set, get) => ({
  // 初始状态
  nodes: [],
  edges: [],
  workflowId: null,
  isLoading: false,
  viewport: null as string | null, // JSON string: {"x":0,"y":0,"zoom":1}

  /**
   * 设置当前工作流 ID
   */
  setWorkflowId: (workflowId: string | null) => {
    set({ workflowId });
  },

  /**
   * 设置节点
   */
  setNodes: (nodes: Node[]) => {
    set({ nodes });
  },

  /**
   * 设置边
   */
  setEdges: (edges: Edge[]) => {
    set({ edges });
  },

  /**
   * 获取工作流的节点和连接
   */
  fetchNodesAndConnections: async (workflowId: string) => {
    set({ isLoading: true, workflowId });
    try {
      const results = await Promise.allSettled([
        nodeService.getWorkflowNodes(workflowId),
        nodeService.getWorkflowConnections(workflowId),
        workflowService.getWorkflow(workflowId),
      ]);

      const nodes = results[0].status === 'fulfilled' ? results[0].value : [];
      const connections = results[1].status === 'fulfilled' ? results[1].value : [];
      const workflow = results[2].status === 'fulfilled' ? results[2].value : null;

      set({
        nodes: convertToReactFlowNodes(nodes),
        edges: convertToReactFlowEdges(connections),
        viewport: workflow?.data?.data?.viewport || null,
        isLoading: false,
      });
    } catch (error: any) {
      set({ isLoading: false });
      const message = error.response?.data?.message || '获取节点数据失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 添加节点
   * @param nodeType - NodeType 枚举值（如 'AI_IMAGE'），不是 reactflow type key
   */
  addNode: async (nodeType: string, position: { x: number; y: number }): Promise<Node | undefined> => {
    const { workflowId } = get();
    if (!workflowId) {
      toast.error('未选择工作流');
      return undefined;
    }

    try {
      const nodeLabelMap = getNodeLabelMap()
      const friendlyLabel = nodeLabelMap[nodeType] || nodeType;
      const nodeData = await nodeService.addNode(workflowId, {
        type: nodeType as any,
        label: friendlyLabel,
        positionX: position.x,
        positionY: position.y,
      });

      // 添加到本地状态
      const nodeTypeMap = getNodeTypeMap()
      const newNode: Node = {
        id: nodeData.id,
        type: nodeTypeMap[nodeData.type] || nodeData.type.toLowerCase(),
        position: { x: nodeData.positionX, y: nodeData.positionY },
        data: {
          label: nodeData.label || friendlyLabel,
          nodeType: nodeData.type,
          status: nodeData.status,
          config: nodeData.config,
        },
      };

      set((state) => ({
        nodes: [...state.nodes, newNode],
      }));

      return newNode;
    } catch (error: any) {
      const message = error.response?.data?.message || '添加节点失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 更新节点（本地 + 后端同步）
   */
  updateNode: async (nodeId: string, data: Partial<NodeData>) => {
    try {
      await nodeService.updateNode(nodeId, data);

      // 更新本地状态（同时更新 position 和 data）
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                position: {
                  x: data.positionX !== undefined ? data.positionX : node.position.x,
                  y: data.positionY !== undefined ? data.positionY : node.position.y,
                },
                data: { ...node.data, ...data },
              }
            : node
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || '更新节点失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 更新节点（仅本地状态，不调用后端）
   * 用于节点内联编辑等高频操作
   */
  updateNodeLocal: (nodeId: string, data: Partial<NodeData> & Record<string, any>) => {
    set((state) => ({
      nodes: state.nodes.map((node) =>
        node.id === nodeId
          ? {
              ...node,
              position: {
                x: data.positionX !== undefined ? data.positionX : node.position.x,
                y: data.positionY !== undefined ? data.positionY : node.position.y,
              },
              data: { ...node.data, ...data },
            }
          : node
      ),
    }));
  },

  /**
   * 删除节点
   */
  deleteNode: async (nodeId: string) => {
    try {
      await nodeService.deleteNode(nodeId);

      // 从本地状态移除
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== nodeId),
        edges: state.edges.filter(
          (edge) => edge.source !== nodeId && edge.target !== nodeId
        ),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || '删除节点失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 添加连接
   */
  addConnection: async (connection: {
    source: string;
    sourceHandle?: string;
    target: string;
    targetHandle?: string;
  }) => {
    const { workflowId } = get();
    if (!workflowId) {
      toast.error('未选择工作流');
      return;
    }

    try {
      const connData = await nodeService.addConnection(workflowId, {
        sourceNodeId: connection.source,
        sourceHandle: connection.sourceHandle || 'output',
        targetNodeId: connection.target,
        targetHandle: connection.targetHandle || 'input',
      });

      // 添加到本地状态
      const newEdge: Edge = {
        id: connData.id,
        source: connData.sourceNodeId,
        sourceHandle: connData.sourceHandle,
        target: connData.targetNodeId,
        targetHandle: connData.targetHandle,
      };

      set((state) => ({
        edges: [...state.edges, newEdge],
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || '添加连接失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 删除连接
   */
  deleteConnection: async (connectionId: string) => {
    try {
      await nodeService.deleteConnection(connectionId);

      // 从本地状态移除
      set((state) => ({
        edges: state.edges.filter((edge) => edge.id !== connectionId),
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || '删除连接失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 设置 viewport（用于从后端恢复）
   */
  setViewport: (viewport: string | null) => {
    set({ viewport });
  },

  /**
   * 同步到后端（保存工作流）
   * @param viewport - 可选，当前视口 JSON 字符串
   */
  syncWithBackend: async (viewport?: string | null) => {
    const { workflowId, nodes, edges } = get();
    if (!workflowId) {
      toast.error('未选择工作流');
      return;
    }

    try {
      await nodeService.saveWorkflow(workflowId, {
        nodes: nodes.map((node) => ({
          id: node.id,
          type: node.data.nodeType,
          label: node.data.label,
          positionX: node.position.x,
          positionY: node.position.y,
          config: node.data.config,
          data: node.data,
        })),
        connections: edges.map((edge) => ({
          sourceNodeId: edge.source,
          sourceHandle: edge.sourceHandle || 'output',
          targetNodeId: edge.target,
          targetHandle: edge.targetHandle || 'input',
        })),
        viewport: viewport || undefined,
      });

      toast.success('工作流保存成功');
    } catch (error: any) {
      const message = error.response?.data?.message || '保存工作流失败';
      toast.error(message);
      throw error;
    }
  },

  /**
   * 重置 Store
   */
  resetStore: () => {
    set({
      nodes: [],
      edges: [],
      workflowId: null,
      isLoading: false,
    });
  },

  /**
   * 从 NodeRegistry 获取节点类型定义
   */
  getNodeTypeDefinition: (nodeType: string) => {
    return nodeRegistry.getNodeType(nodeType)
  },

  /**
   * 获取所有可用的节点类型
   */
  getAllNodeTypes: () => {
    return nodeRegistry.getAllNodeTypes()
  },
}));

/**
 * NodeStore 接口定义
 */
interface NodeStore {
  // 状态
  nodes: Node[];
  edges: Edge[];
  workflowId: string | null;
  isLoading: boolean;
  viewport: string | null; // JSON string: {"x":0,"y":0,"zoom":1}

  // 方法
  setWorkflowId: (workflowId: string | null) => void;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  fetchNodesAndConnections: (workflowId: string) => Promise<void>;
  addNode: (
    type: string,
    position: { x: number; y: number }
  ) => Promise<Node | undefined>;
  updateNode: (nodeId: string, data: Partial<NodeData>) => Promise<void>;
  updateNodeLocal: (nodeId: string, data: Partial<NodeData>) => void;
  deleteNode: (nodeId: string) => Promise<void>;
  addConnection: (connection: {
    source: string;
    sourceHandle?: string;
    target: string;
    targetHandle?: string;
  }) => Promise<void>;
  deleteConnection: (connectionId: string) => Promise<void>;
  syncWithBackend: (viewport?: string | null) => Promise<void>;
  setViewport: (viewport: string | null) => void;
  resetStore: () => void;
  getNodeTypeDefinition: (nodeType: string) => any;
  getAllNodeTypes: () => any[];
}
