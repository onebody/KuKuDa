# KuKuDa 节点架构改造 - 架构设计文档

**版本**: v1.0.0  
**日期**: 2026-02-10  
**架构师**: 杉架  
**状态**: 待评审

---

## 版本历史

| 版本号 | 日期 | 作者 | 变更说明 |
|--------|------|------|----------|
| v1.0.0 | 2026-02-10 | 杉架 | 初始版本，基于 PRD v1.0.0 输出架构设计方案 |

---

## 目录

1. [架构概览](#1-架构概览)
2. [核心技术选型](#2-核心技术选型)
3. [关键数据流设计](#3-关键数据流设计)
4. [接口设计](#4-接口设计)
5. [待确认事项的建议方案](#5-待确认事项的建议方案)
6. [技术风险](#6-技术风险)
7. [附录](#7-附录)

---

## 1. 架构概览

### 1.1 系统分层架构

KuKuDa 采用**前后端分离**的分层架构，整体分为以下层次：

```
┌─────────────────────────────────────────────────────────────┐
│                      前端层 (Frontend)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  React 组件  │  │  React Flow  │  │  状态管理    │   │
│  │  (UI Layer)  │  │  (Canvas)    │  │  (Zustand)  │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      后端层 (Backend)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  API 网关    │  │  业务逻辑    │  │  数据访问    │   │
│  │  (Express)   │  │  (Services)  │  │  (Prisma)   │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      数据层 (Data Layer)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │  PostgreSQL  │  │    Redis     │  │  对象存储    │   │
│  │  (主要数据)  │  │   (缓存)    │  │  (文件/图片) │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 模块划分

#### 前端模块

| 模块 | 职责 | 目录 |
|------|------|------|
| **节点组件** | 各类节点的 UI 渲染和交互 | `src/components/nodes/` |
| **画布管理** | React Flow 画布的状态和交互 | `src/components/Canvas/` |
| **状态管理** | 全局状态（节点、边、工作流） | `src/stores/` |
| **服务层** | API 调用、文件上传 | `src/services/` |
| **类型定义** | TypeScript 类型声明 | `src/types/` |
| **工具函数** | 数据处理、节点辅助函数 | `src/utils/` |

#### 后端模块

| 模块 | 职责 | 目录 |
|------|------|------|
| **API 路由** | RESTful 接口定义 | `src/routes/` |
| **控制器** | 请求处理、参数验证 | `src/controllers/` |
| **服务层** | 业务逻辑实现 | `src/services/` |
| **数据模型** | Prisma Schema | `prisma/schema.prisma` |
| **中间件** | 认证、日志、限流 | `src/middleware/` |
| **WebSocket** | 实时通信（执行状态推送） | `src/socket/` |

### 1.3 技术栈总览

| 层级 | 技术选型 | 版本 | 用途 |
|------|----------|------|------|
| **前端框架** | React | 18.2+ | UI 渲染 |
| **类型系统** | TypeScript | 5.2+ | 类型安全 |
| **画布引擎** | React Flow | 11.10+ | 节点画布 |
| **状态管理** | Zustand | 4.4+ | 全局状态 |
| **UI 组件库** | MUI (Material-UI) | 5.14+ | 组件样式 |
| **HTTP 客户端** | Axios | 1.6+ | API 调用 |
| **后端框架** | Express | 4.19+ | API 服务 |
| **ORM** | Prisma | 5.22+ | 数据库访问 |
| **数据库** | PostgreSQL | 15+ | 主数据存储 |
| **缓存** | Redis | 6.0+ | 缓存、Session |
| **文件存储** | 对象存储 (MinIO) | - | 图片/文件存储 |
| **实时通信** | Socket.io | 4.7+ | 执行状态推送 |

---

## 2. 核心技术选型

### 2.1 状态管理方案：Zustand

#### 选型理由

PRD 中提到可使用 Zustand 或 Redux Toolkit，经架构评估，**推荐使用 Zustand**，理由如下：

| 维度 | Zustand | Redux Toolkit | 结论 |
|------|---------|---------------|------|
| **学习成本** | 低（API 简洁） | 中（需要理解 Toolkit 概念） | Zustand 更优 |
| **代码量** | 少（无 Boilerplate） | 中（需要 Slice、Reducer） | Zustand 更优 |
| **TypeScript 支持** | 原生支持 | 需要额外配置 | 相当 |
| **中间件生态** | 丰富（devtools、persist 等） | 丰富（RTK Query 等） | 相当 |
| **性能** | 高（细粒度更新） | 高（内部优化） | 相当 |
| **与 React Flow 集成** | 简单（直接调用 Store） | 中等（需要 Connect 或 Hook） | Zustand 更优 |

#### Zustand Store 设计

```typescript
// src/stores/workflowStore.ts
import { create } from 'zustand';
import { Node, Edge, Connection } from 'reactflow';

interface WorkflowState {
  // 节点和边
  nodes: Node[];
  edges: Edge[];
  
  // 工作流执行状态
  executionStatus: 'idle' | 'running' | 'success' | 'error';
  executingNodeId: string | null;
  
  // 动作
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  addNode: (node: Node) => void;
  updateNodeData: (nodeId: string, data: Partial<any>) => void;
  removeNode: (nodeId: string) => void;
  addEdge: (edge: Edge | Connection) => void;
  removeEdge: (edgeId: string) => void;
  
  // 执行控制
  executeWorkflow: () => void;
  cancelExecution: () => void;
  resetExecution: () => void;
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  executionStatus: 'idle',
  executingNodeId: null,
  
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  
  addNode: (node) => set((state) => ({
    nodes: [...state.nodes, node]
  })),
  
  updateNodeData: (nodeId, data) => set((state) => ({
    nodes: state.nodes.map(node =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, ...data } }
        : node
    )
  })),
  
  removeNode: (nodeId) => set((state) => ({
    nodes: state.nodes.filter(node => node.id !== nodeId),
    edges: state.edges.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    )
  })),
  
  addEdge: (edge) => set((state) => ({
    edges: [...state.edges, edge as Edge]
  })),
  
  removeEdge: (edgeId) => set((state) => ({
    edges: state.edges.filter(edge => edge.id !== edgeId)
  })),
  
  executeWorkflow: () => {
    // 执行工作流的逻辑（详见 3.1 节）
    set({ executionStatus: 'running' });
  },
  
  cancelExecution: () => {
    set({ executionStatus: 'idle', executingNodeId: null });
  },
  
  resetExecution: () => {
    set({ executionStatus: 'idle', executingNodeId: null });
  }
}));
```

### 2.2 数据流动实现方案

#### 方案评估

PRD 中提出使用 `getNodes + edge 关系` 读取上游数据，经评估，**该方案可行但有性能隐患**，建议采用以下优化方案：

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **方案 A：实时计算**<br>(PRD 原方案) | 简单直接、数据实时 | 每次读取都需遍历边和节点，性能差 | ⭐⭐ |
| **方案 B：派生状态**<br>(Zustand 计算属性) | 自动缓存、性能高 | 需要理解 Zustand 派生状态 | ⭐⭐⭐⭐⭐ |
| **方案 C：事件驱动**<br>(发布-订阅模式) | 解耦、灵活 | 实现复杂、调试困难 | ⭐⭐⭐ |

**推荐方案：方案 B（派生状态）**

#### 实现代码示例

```typescript
// src/stores/workflowStore.ts (扩展)
import { create } from 'zustand';
import { Node, Edge } from 'reactflow';

interface WorkflowState {
  nodes: Node[];
  edges: Edge[];
  
  // 派生状态：上游节点数据缓存
  // 当 nodes 或 edges 变化时自动重新计算
  getUpstreamOutputs: (nodeId: string) => any[];
  
  // ... 其他状态和方法
}

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  
  // 获取上游节点输出（带缓存）
  getUpstreamOutputs: (nodeId: string) => {
    const { nodes, edges } = get();
    
    // 1. 获取当前节点的所有入边
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    
    // 2. 读取每个上游节点的输出
    const upstreamOutputs = incomingEdges.map(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (!sourceNode) return null;
      
      // 3. 根据节点类型，读取对应的输出字段
      return extractNodeOutput(sourceNode);
    });
    
    // 4. 过滤掉 null 值
    return upstreamOutputs.filter(output => output !== null);
  },
  
  // ... 其他方法
}));

// 辅助函数：提取节点输出
function extractNodeOutput(node: Node): any | null {
  const { type, data } = node;
  
  switch (type) {
    case 'textInput':
      return data.text ? { text: data.text } : null;
    
    case 'singleImageInput':
      return data.imageUrl ? { imageUrl: data.imageUrl } : null;
    
    case 'multiImageInput':
      return data.imageUrls?.length > 0 
        ? { imageUrls: data.imageUrls, images: data.images }
        : null;
    
    case 'aiImage':
      return data.imageUrl ? { imageUrl: data.imageUrl } : null;
    
    case 'skill':
      return data.output ? { output: data.output } : null;
    
    default:
      return null;
  }
}
```

### 2.3 存储方案建议

#### 图片/文件存储方案对比

PRD 中待确认事项包含"图片/文件存储方案"，以下是对比分析：

| 方案 | 优点 | 缺点 | 适用场景 | 推荐度 |
|------|------|------|----------|--------|
| **Base64 内嵌** | 简单、无额外依赖 | 数据量大（增大约 33%）、性能差、无法缓存 | 仅用于临时演示 | ⭐ |
| **本地文件系统** | 简单、免费 | 不支持分布式、备份困难、扩展性差 | 单机部署、小规模 | ⭐⭐⭐ |
| **对象存储 (MinIO)** | 支持分布式、兼容 S3 API、免费开源 | 需要自行部署和维护 | 私有部署、中型规模 | ⭐⭐⭐⭐⭐ |
| **云对象存储 (OSS/COS)** | 高可用、无限扩展、免维护 | 有成本、依赖外部服务 | 云端部署、大规模 | ⭐⭐⭐⭐ |

**推荐方案：MinIO (自建对象存储)**

**理由**：
1. 兼容 AWS S3 API，未来可无缝迁移到云服务
2. 免费开源，无成本压力
3. 支持分布式部署，可扩展性强
4. 提供 Web UI 管理界面，方便调试

#### MinIO 集成方案

```typescript
// src/services/storageService.ts
import * as Minio from 'minio';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

export const storageService = {
  // 上传文件
  async uploadFile(
    bucketName: string,
    objectName: string,
    filePath: string,
    metaData?: any
  ) {
    return await minioClient.fPutObject(
      bucketName,
      objectName,
      filePath,
      metaData
    );
  },
  
  // 获取文件 URL（预签名 URL，有时效性）
  async getFileUrl(
    bucketName: string,
    objectName: string,
    expiryInSeconds: number = 24 * 60 * 60 // 默认 24 小时
  ) {
    return await minioClient.presignedGetObject(
      bucketName,
      objectName,
      expiryInSeconds
    );
  },
  
  // 删除文件
  async deleteFile(bucketName: string, objectName: string) {
    return await minioClient.removeObject(bucketName, objectName);
  }
};
```

---

## 3. 关键数据流设计

### 3.1 节点数据流动实现方案

#### 核心流程

```
┌─────────────────────────────────────────────────────────────┐
│  1. 用户点击"运行工作流"按钮                                 │
│     ↓                                                       │
│  2. 从源节点开始执行（source 节点，无入边）                   │
│     ↓                                                       │
│  3. 执行源节点（如文本输入节点，直接读取 data.text）            │
│     ↓                                                       │
│  4. 沿边的方向 BFS 遍历，找到下一个处理节点                    │
│     ↓                                                       │
│  5. 处理节点读取上游输出（调用 getUpstreamOutputs）            │
│     ↓                                                       │
│  6. 判断上游输出是否完整                                      │
│     ├─ 是：执行处理节点，生成输出                             │
│     └─ 否：标记为 waiting，监听上游节点变化                   │
│     ↓                                                       │
│  7. 重复步骤 4-6，直到没有下游节点或遇到终端节点               │
└─────────────────────────────────────────────────────────────┘
```

#### 实现代码

```typescript
// src/services/workflowExecutor.ts
import { Node, Edge } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';

export class WorkflowExecutor {
  private nodes: Node[];
  private edges: Edge[];
  private executingNodes: Set<string> = new Set();
  
  constructor(nodes: Node[], edges: Edge[]) {
    this.nodes = nodes;
    this.edges = edges;
  }
  
  // 执行工作流
  async execute() {
    // 1. 找到所有源节点（无入边的节点）
    const sourceNodes = this.findSourceNodes();
    
    // 2. 依次执行源节点
    for (const sourceNode of sourceNodes) {
      await this.executeNode(sourceNode.id);
    }
  }
  
  // 执行单个节点
  private async executeNode(nodeId: string) {
    // 防止重复执行
    if (this.executingNodes.has(nodeId)) return;
    this.executingNodes.add(nodeId);
    
    const node = this.nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // 更新节点状态为 running
    this.updateNodeStatus(nodeId, 'running');
    
    try {
      // 根据节点类型执行不同逻辑
      switch (node.type) {
        case 'textInput':
        case 'singleImageInput':
        case 'multiImageInput':
        case 'singleFileInput':
        case 'multiFileInput':
          // 源节点：直接标记为 success（数据已在 data 中）
          this.updateNodeStatus(nodeId, 'success');
          break;
        
        case 'aiImage':
          await this.executeAIImageNode(node);
          break;
        
        case 'textOutput':
          // 终端节点：读取上游数据，显示在节点上
          const upstreamData = this.getUpstreamOutputs(nodeId);
          this.updateNodeData(nodeId, { text: upstreamData[0]?.text || '' });
          this.updateNodeStatus(nodeId, 'success');
          break;
        
        case 'skill':
          await this.executeSkillNode(node);
          break;
      }
      
      // 执行下游节点
      const downstreamNodes = this.findDownstreamNodes(nodeId);
      for (const downstreamNode of downstreamNodes) {
        await this.executeNode(downstreamNode.id);
      }
      
    } catch (error: any) {
      this.updateNodeStatus(nodeId, 'error', error.message);
    } finally {
      this.executingNodes.delete(nodeId);
    }
  }
  
  // 查找源节点
  private findSourceNodes(): Node[] {
    return this.nodes.filter(node => {
      const incomingEdges = this.edges.filter(edge => edge.target === node.id);
      return incomingEdges.length === 0;
    });
  }
  
  // 查找下游节点
  private findDownstreamNodes(nodeId: string): Node[] {
    const outgoingEdges = this.edges.filter(edge => edge.source === nodeId);
    return outgoingEdges
      .map(edge => this.nodes.find(node => node.id === edge.target))
      .filter(Boolean) as Node[];
  }
  
  // 读取上游节点输出
  private getUpstreamOutputs(nodeId: string): any[] {
    const incomingEdges = this.edges.filter(edge => edge.target === nodeId);
    
    return incomingEdges.map(edge => {
      const sourceNode = this.nodes.find(node => node.id === edge.source);
      if (!sourceNode) return null;
      
      // 检查上游节点是否已成功执行
      if (sourceNode.data.status !== 'success') {
        return { waiting: true, nodeId: sourceNode.id };
      }
      
      return extractNodeOutput(sourceNode);
    }).filter(Boolean);
  }
  
  // 更新节点状态（调用 Zustand Store）
  private updateNodeStatus(
    nodeId: string, 
    status: 'idle' | 'waiting' | 'running' | 'success' | 'error',
    error?: string
  ) {
    const { updateNodeData } = useWorkflowStore.getState();
    updateNodeData(nodeId, { status, error });
  }
  
  private updateNodeData(nodeId: string, data: any) {
    const { updateNodeData } = useWorkflowStore.getState();
    updateNodeData(nodeId, data);
  }
  
  // 执行 AI 绘图节点
  private async executeAIImageNode(node: Node) {
    const { data } = node;
    
    // 1. 获取 prompt（优先使用上游输入）
    let prompt = data.prompt;
    if (data.useUpstream) {
      const upstreamOutputs = this.getUpstreamOutputs(node.id);
      prompt = upstreamOutputs[0]?.text || prompt;
    }
    
    if (!prompt) {
      throw new Error('缺少 prompt 参数');
    }
    
    // 2. 调用后端 AI 绘图接口
    const response = await fetch('/api/ai/image-generation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error('AI 绘图失败');
    }
    
    const { imageUrl } = await response.json();
    
    // 3. 更新节点数据
    this.updateNodeData(node.id, { imageUrl, status: 'success' });
  }
  
  // 执行技能节点
  private async executeSkillNode(node: Node) {
    const { data } = node;
    
    // 1. 合并上游输入到 inputParams
    const upstreamOutputs = this.getUpstreamOutputs(node.id);
    const inputParams = this.mergeInputsToParams(data.inputParams, upstreamOutputs);
    
    // 2. 调用技能接口
    const response = await fetch(`/api/skills/${data.skillId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inputParams })
    });
    
    if (!response.ok) {
      throw new Error('技能执行失败');
    }
    
    const { output } = await response.json();
    
    // 3. 更新节点数据
    this.updateNodeData(node.id, { output, status: 'success' });
  }
  
  // 合并输入到参数
  private mergeInputsToParams(baseParams: any, upstreamOutputs: any[]): any {
    const params = { ...baseParams };
    
    upstreamOutputs.forEach(output => {
      if (output.text && !params.prompt) {
        params.prompt = output.text;
      }
      if (output.imageUrl && !params.imageUrl) {
        params.imageUrl = output.imageUrl;
      }
      if (output.imageUrls && !params.imageUrls) {
        params.imageUrls = output.imageUrls;
      }
    });
    
    return params;
  }
}

// 辅助函数：提取节点输出（与 Store 中的函数相同）
function extractNodeOutput(node: Node): any | null {
  const { type, data } = node;
  
  switch (type) {
    case 'textInput':
      return data.text ? { text: data.text } : null;
    
    case 'singleImageInput':
      return data.imageUrl ? { imageUrl: data.imageUrl } : null;
    
    case 'multiImageInput':
      return data.imageUrls?.length > 0 
        ? { imageUrls: data.imageUrls }
        : null;
    
    case 'aiImage':
      return data.imageUrl ? { imageUrl: data.imageUrl } : null;
    
    default:
      return null;
  }
}
```

### 3.2 输入合并的逻辑实现

#### 合并策略

根据 PRD 定义的合并策略，实现如下：

```typescript
// src/utils/inputMerger.ts

export interface MergedInput {
  texts: string[];           // 所有文本输入
  imageUrls: string[];       // 所有图片 URL
  fileUrls: string[];        // 所有文件 URL
  outputs: any[];            // 所有原始输出（用于技能节点自定义处理）
}

// 合并多个上游节点的输出
export function mergeInputs(upstreamOutputs: any[]): MergedInput {
  const result: MergedInput = {
    texts: [],
    imageUrls: [],
    fileUrls: [],
    outputs: []
  };
  
  upstreamOutputs.forEach(output => {
    if (!output) return;
    
    // 文本合并
    if (output.text) {
      result.texts.push(output.text);
    }
    
    // 图片 URL 合并
    if (output.imageUrl) {
      result.imageUrls.push(output.imageUrl);
    }
    if (output.imageUrls) {
      result.imageUrls.push(...output.imageUrls);
    }
    
    // 文件 URL 合并
    if (output.fileUrl) {
      result.fileUrls.push(output.fileUrl);
    }
    if (output.fileUrls) {
      result.fileUrls.push(...output.fileUrls);
    }
    
    // 保存原始输出
    result.outputs.push(output);
  });
  
  return result;
}

// 将合并后的输入转换为单个字符串（用于 AI 绘图节点的 prompt）
export function mergeTextsForPrompt(mergedInput: MergedInput): string {
  return mergedInput.texts.join('\n');
}

// 将合并后的输入转换为图片 URL 数组（用于批量处理）
export function mergeImageUrlsForBatch(mergedInput: MergedInput): string[] {
  return mergedInput.imageUrls;
}
```

#### 冲突处理策略

```typescript
// src/utils/inputConflictResolver.ts

export function resolveInputConflict(
  nodeType: string,
  mergedInput: MergedInput
): any {
  switch (nodeType) {
    case 'aiImage':
      // AI 绘图节点：只使用第一个文本输入
      return {
        prompt: mergedInput.texts[0] || '',
        imageUrls: mergedInput.imageUrls
      };
    
    case 'textOutput':
      // 文本输出节点：合并所有文本
      return {
        text: mergeTextsForPrompt(mergedInput)
      };
    
    case 'skill':
      // 技能节点：返回合并后的所有数据，由技能自行处理
      return mergedInput;
    
    default:
      return mergedInput;
  }
}
```

### 3.3 上游数据变化的传播机制

#### 问题场景

当上游节点数据变化时（如用户修改了文本输入），下游节点需要感知到变化并重新执行。

#### 方案设计

采用 **Zustand 订阅机制 + React Flow 事件** 实现数据变化传播：

```typescript
// src/hooks/useNodeDataPropagation.ts
import { useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { useWorkflowStore } from '../stores/workflowStore';

export function useNodeDataPropagation() {
  const { nodes, edges, updateNodeData } = useWorkflowStore();
  
  // 监听节点数据变化
  useEffect(() => {
    // 找到所有 status 为 success 的节点
    const successNodes = nodes.filter(node => node.data.status === 'success');
    
    successNodes.forEach(node => {
      // 找到该节点的下游节点
      const downstreamEdges = edges.filter(edge => edge.source === node.id);
      
      downstreamEdges.forEach(edge => {
        const downstreamNode = nodes.find(n => n.id === edge.target);
        if (!downstreamNode) return;
        
        // 如果下游节点处于 waiting 状态，检查是否可以执行
        if (downstreamNode.data.status === 'waiting') {
          const upstreamOutputs = getUpstreamOutputs(downstreamNode.id, nodes, edges);
          const allReady = upstreamOutputs.every(output => !output.waiting);
          
          if (allReady) {
            // 所有上游节点都已就绪，执行下游节点
            executeNode(downstreamNode.id);
          }
        }
      });
    });
  }, [nodes, edges]); // 依赖 nodes 和 edges，当它们变化时重新执行
}

// 获取上游节点输出（辅助函数）
function getUpstreamOutputs(
  nodeId: string,
  nodes: Node[],
  edges: Edge[]
): any[] {
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  return incomingEdges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (!sourceNode) return null;
    
    if (sourceNode.data.status !== 'success') {
      return { waiting: true };
    }
    
    return extractNodeOutput(sourceNode);
  }).filter(Boolean);
}
```

#### 实时状态更新（WebSocket）

对于长时间执行的节点（如 AI 绘图），使用 WebSocket 推送执行状态：

```typescript
// src/services/workflowWebSocket.ts
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function initWorkflowWebSocket(workflowId: string) {
  socket = io('/workflow', {
    query: { workflowId }
  });
  
  // 监听节点执行状态变化
  socket.on('node:status-change', ({ nodeId, status, output, error }) => {
    const { updateNodeData } = useWorkflowStore.getState();
    updateNodeData(nodeId, { status, output, error });
  });
  
  // 监听工作流执行完成
  socket.on('workflow:complete', ({ status, error }) => {
    const { setExecutionStatus } = useWorkflowStore.getState();
    setExecutionStatus(status, error);
  });
}

export function disconnectWorkflowWebSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
```

---

## 4. 接口设计

### 4.1 前端节点数据接口（TypeScript）

#### 基础接口

```typescript
// src/types/nodes.ts

import { Node, NodeProps } from 'reactflow';

// 基础节点数据接口
export interface BaseNodeData {
  type: string;
  status: 'idle' | 'waiting' | 'running' | 'success' | 'error';
  error?: string;
}

// React Flow 节点类型
export type KuKuDaNode = Node<BaseNodeData>;

// 节点组件 Props
export type KuKuDaNodeProps<T extends BaseNodeData = BaseNodeData> = NodeProps<T>;
```

#### 源节点数据接口

```typescript
// 文本输入节点数据
export interface TextInputNodeData extends BaseNodeData {
  type: 'textInput';
  text: string;
}

// 单图片输入节点数据
export interface SingleImageInputNodeData extends BaseNodeData {
  type: 'singleImageInput';
  imageUrl: string;
  fileName: string;
  fileSize: number;
}

// 多图片输入节点数据
export interface MultiImageInputNodeData extends BaseNodeData {
  type: 'multiImageInput';
  imageUrls: string[];
  images: Array<{
    id: number;
    url: string;
    fileName: string;
    fileSize: number;
  }>;
  maxCount: number;
}

// 单文件输入节点数据
export interface SingleFileInputNodeData extends BaseNodeData {
  type: 'singleFileInput';
  fileUrl: string;
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

// 多文件输入节点数据
export interface MultiFileInputNodeData extends BaseNodeData {
  type: 'multiFileInput';
  fileUrls: string[];
  files: Array<{
    url: string;
    fileName: string;
    fileSize: number;
    fileType: string;
  }>;
  maxCount: number;
}
```

#### 处理节点数据接口

```typescript
// AI 绘图节点数据
export interface AIImageNodeData extends BaseNodeData {
  type: 'aiImage';
  prompt: string;
  useUpstream: boolean;
  imageUrl: string;
}

// 文本输出节点数据
export interface TextOutputNodeData extends BaseNodeData {
  type: 'textOutput';
  text: string;
}

// 技能节点数据
export interface SkillNodeData extends BaseNodeData {
  type: 'skill';
  skillId: string;
  skillName: string;
  inputParams: {
    [key: string]: any;
  };
  output: any;
}
```

#### 节点类型映射

```typescript
// 节点类型到数据接口的映射
export type NodeDataMap = {
  'textInput': TextInputNodeData;
  'singleImageInput': SingleImageInputNodeData;
  'multiImageInput': MultiImageInputNodeData;
  'singleFileInput': SingleFileInputNodeData;
  'multiFileInput': MultiFileInputNodeData;
  'aiImage': AIImageNodeData;
  'textOutput': TextOutputNodeData;
  'skill': SkillNodeData;
};

// 根据节点类型获取对应的数据接口
export type NodeData<T extends keyof NodeDataMap> = NodeDataMap[T];

// 节点类型枚举
export const NodeTypes = {
  TextInput: 'textInput',
  SingleImageInput: 'singleImageInput',
  MultiImageInput: 'multiImageInput',
  SingleFileInput: 'singleFileInput',
  MultiFileInput: 'multiFileInput',
  AIImage: 'aiImage',
  TextOutput: 'textOutput',
  Skill: 'skill',
} as const;
```

### 4.2 后端接口设计

#### 统一代理 AI 调用的接口设计

**架构建议：AI 接口调用应统一走后端**，理由：
1. **安全性**：API Key 不会暴露在前端
2. **可控性**：可以在后端做限流、日志、计费
3. **兼容性**：未来切换 AI 服务商时，前端无需修改

##### AI 绘图接口

```typescript
// POST /api/ai/image-generation
// Request
{
  "prompt": "一只可爱的猫",
  "negativePrompt": "",      // 可选，负面提示词
  "model": "stable-diffusion-v1.5",  // 可选，模型选择
  "size": "512x512",        // 可选，图片尺寸
  "count": 1,               // 可选，生成数量
  "style": "photorealistic" // 可选，风格
}

// Response
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/generated/12345.png",
    "imageId": "12345",
    "prompt": "一只可爱的猫",
    "model": "stable-diffusion-v1.5",
    "createdAt": "2026-02-10T12:00:00Z"
  }
}
```

##### AI 文本生成接口（预留）

```typescript
// POST /api/ai/text-generation
// Request
{
  "prompt": "请写一篇关于...",
  "model": "gpt-4",
  "maxTokens": 1000,
  "temperature": 0.7
}

// Response
{
  "success": true,
  "data": {
    "text": "生成的内容...",
    "usage": {
      "promptTokens": 10,
      "completionTokens": 100
    }
  }
}
```

#### 文件上传接口设计

##### 单文件上传

```typescript
// POST /api/upload/single
// Content-Type: multipart/form-data
// Request Body
{
  "file": <File>,           // 文件对象
  "type": "image",          // 文件类型：image | file
  "workflowId": "xxx",     // 可选，关联的工作流 ID
  "nodeId": "xxx"          // 可选，关联的节点 ID
}

// Response
{
  "success": true,
  "data": {
    "fileUrl": "/uploads/images/abc123.png",
    "fileName": "cat.png",
    "fileSize": 102400,
    "fileType": "image/png",
    "uploadedAt": "2026-02-10T12:00:00Z"
  }
}
```

##### 批量文件上传

```typescript
// POST /api/upload/batch
// Content-Type: multipart/form-data
// Request Body
{
  "files": [<File>, <File>, ...],
  "type": "image",
  "workflowId": "xxx",
  "nodeId": "xxx"
}

// Response
{
  "success": true,
  "data": {
    "files": [
      {
        "fileUrl": "/uploads/images/abc123.png",
        "fileName": "cat.png",
        "fileSize": 102400,
        "fileType": "image/png",
        "id": 1
      },
      {
        "fileUrl": "/uploads/images/def456.png",
        "fileName": "dog.png",
        "fileSize": 204800,
        "fileType": "image/png",
        "id": 2
      }
    ],
    "uploadedAt": "2026-02-10T12:00:00Z"
  }
}
```

#### 技能节点接口设计

##### 获取技能列表

```typescript
// GET /api/skills
// Query Parameters
{
  "category": "image",      // 可选，技能分类
  "search": "draw",        // 可选，搜索关键词
  "page": 1,               // 可选，页码
  "pageSize": 20           // 可选，每页数量
}

// Response
{
  "success": true,
  "data": {
    "skills": [
      {
        "id": "skill_001",
        "name": "图片风格转换",
        "description": "将图片转换为不同风格",
        "category": "image",
        "inputSchema": {   // 输入参数 Schema（JSON Schema 格式）
          "type": "object",
          "properties": {
            "imageUrl": { "type": "string", "format": "uri" },
            "style": { "type": "string", "enum": ["anime", "realistic", "sketch"] }
          },
          "required": ["imageUrl", "style"]
        },
        "outputSchema": {  // 输出结果 Schema
          "type": "object",
          "properties": {
            "imageUrl": { "type": "string", "format": "uri" }
          }
        }
      }
    ],
    "total": 100,
    "page": 1,
    "pageSize": 20
  }
}
```

##### 执行技能

```typescript
// POST /api/skills/:skillId/execute
// Request
{
  "inputParams": {
    "imageUrl": "/uploads/images/abc123.png",
    "style": "anime"
  },
  "workflowId": "xxx",     // 可选
  "nodeId": "xxx"          // 可选
}

// Response
{
  "success": true,
  "data": {
    "output": {
      "imageUrl": "/uploads/processed/xyz789.png"
    },
    "executionId": "exec_001",
    "executedAt": "2026-02-10T12:00:00Z"
  }
}
```

##### 获取技能执行结果（异步场景）

```typescript
// GET /api/skills/executions/:executionId
// Response
{
  "success": true,
  "data": {
    "executionId": "exec_001",
    "status": "running",  // pending | running | success | error
    "output": null,       // 执行完成后有值
    "error": null,        // 执行失败时
    "startedAt": "2026-02-10T12:00:00Z",
    "completedAt": null
  }
}
```

### 4.3 后端 Prisma Schema 设计

```prisma
// prisma/schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

// 用户表
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  name      String?
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  workflows Workflow[]
}

// 工作流表
model Workflow {
  id          String   @id @default(uuid())
  name        String
  description String?
  userId      String
  nodes       Json[]    // 存储节点数据（React Flow Node[]）
  edges       Json[]    // 存储边数据（React Flow Edge[]）
  status      String   @default("draft")  // draft | active | archived
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id])
  
  @@index([userId])
  @@index([status])
}

// 文件表
model File {
  id          String   @id @default(uuid())
  fileName    String
  fileSize    Int      // 字节
  fileType    String
  filePath    String   // 存储路径（MinIO 对象名）
  bucketName  String   @default("kukuda")
  workflowId  String?
  nodeId      String?
  uploadedBy  String
  createdAt   DateTime @default(now())
  
  uploadedByUser User @relation(fields: [uploadedBy], references: [id])
  
  @@index([workflowId])
  @@index([nodeId])
  @@index([uploadedBy])
}

// 技能表
model Skill {
  id           String   @id @default(uuid())
  name         String
  description  String?
  category     String   // image | text | file | other
  inputSchema  Json     // 输入参数 Schema
  outputSchema Json     // 输出结果 Schema
  apiEndpoint  String   // 技能接口地址
  apiMethod    String   @default("POST")  // GET | POST
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  
  executions SkillExecution[]
}

// 技能执行记录表
model SkillExecution {
  id          String   @id @default(uuid())
  skillId     String
  inputParams Json
  output      Json?
  status      String   @default("pending")  // pending | running | success | error
  error       String?
  workflowId  String?
  nodeId      String?
  executedBy  String
  startedAt   DateTime @default(now())
  completedAt DateTime?
  
  skill     Skill @relation(fields: [skillId], references: [id])
  executedByUser User @relation(fields: [executedBy], references: [id])
  
  @@index([skillId])
  @@index([status])
  @@index([workflowId])
}
```

---

## 5. 待确认事项的建议方案

### 5.1 AI 接口调用方式

**PRD 待确认**：AI 绘图接口具体使用哪个服务？

**架构建议**：

| 方案 | 优点 | 缺点 | 推荐度 |
|------|------|------|--------|
| **前端直接调用** | 简单、延迟低 | API Key 暴露、不安全、无法控管 | ⭐ |
| **后端统一代理** | 安全、可控、易扩展 | 需要后端开发、增加延迟 | ⭐⭐⭐⭐⭐ |

**推荐方案：后端统一代理**

**理由**：
1. **安全性**：API Key 存储在后端，不会暴露给前端用户
2. **可控性**：可以在后端做限流、日志、计费、重试
3. **兼容性**：未来切换 AI 服务商（如从 Stable Diffusion 切换到 DALL-E）时，前端无需修改
4. **审计**：可以记录所有 AI 调用日志，便于排查问题

**实现建议**：
- 后端提供统一的 AI 调用接口（如 `/api/ai/image-generation`）
- 后端根据配置选择 AI 服务商（可通过环境变量切换）
- 前端只调用后端接口，不关心具体 AI 服务商

### 5.2 图片/文件存储方案

**PRD 待确认**：文件上传的存储方案？

**架构建议**：

**推荐方案：MinIO 对象存储**

**具体方案**：
1. 前端上传文件到后端 `/api/upload` 接口
2. 后端将文件存储到 MinIO
3. 后端返回文件 URL（MinIO 预签名 URL）
4. 前端将文件 URL 存储到节点 data 中

**文件命名规则**：
```
/uploads/{type}/{workflowId}/{nodeId}/{timestamp}_{fileName}
示例：/uploads/images/wf_001/node_005/1707564000000_cat.png
```

**URL 有效期**：
- 预签名 URL 默认 24 小时有效
- 如果需要永久访问，使用 Nginx 反向代理 MinIO

### 5.3 技能节点接口格式

**PRD 待确认**：技能接口的具体格式？

**架构建议**：

**推荐方案：RESTful API + JSON Schema**

**理由**：
1. **通用性**：RESTful API 是业界标准，易于理解和对接
2. **描述性**：JSON Schema 可以清晰描述输入参数和输出结果
3. **可扩展性**：未来可以支持更多协议（如 GraphQL、gRPC）

**接口规范**：

```json
// 技能接口标准格式
{
  // 请求
  "method": "POST",
  "path": "/api/skills/:skillId/execute",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "inputParams": {
      // 根据技能的 inputSchema 动态生成
    }
  },
  
  // 响应
  "response": {
    "success": true,
    "data": {
      "output": {
        // 根据技能的 outputSchema 动态生成
      },
      "executionId": "xxx",
      "executedAt": "2026-02-10T12:00:00Z"
    }
  }
}
```

**inputSchema 示例**（JSON Schema 格式）：

```json
{
  "type": "object",
  "properties": {
    "imageUrl": {
      "type": "string",
      "format": "uri",
      "description": "图片 URL"
    },
    "style": {
      "type": "string",
      "enum": ["anime", "realistic", "sketch"],
      "description": "转换风格"
    }
  },
  "required": ["imageUrl", "style"]
}
```

### 5.4 多文件输入节点的最大数量

**PRD 待确认**：多文件输入节点的最大数量？

**架构建议**：

| 场景 | 建议最大值 | 理由 |
|------|-----------|------|
| **图片输入** | 20 张 | PRD 已定义，考虑到 AI 处理能力 |
| **文件输入** | 50 个 | 文件相对较小，可以支持更多 |
| **未来扩展** | 可配置 | 允许管理员根据实际情况调整 |

**实现建议**：
- 前端做数量限制（超过最大值提示用户）
- 后端也做数量限制（防止恶意上传）
- 将最大值设置为可配置项（存储在数据库或环境变量）

### 5.5 工作流执行的超时时间

**PRD 待确认**：工作流执行的超时时间？

**架构建议**：

| 节点类型 | 建议超时时间 | 理由 |
|----------|-------------|------|
| **源节点** | 无超时 | 数据已存在，无需执行 |
| **AI 绘图节点** | 60 秒 | AI 生成需要时间 |
| **技能节点** | 30 秒 | 外部 API 调用 |
| **文本输出节点** | 无超时 | 仅显示数据 |
| **整个工作流** | 300 秒（5 分钟） | 防止无限执行 |

**实现建议**：
- 后端执行节点时设置超时（使用 `Promise.race` 或 `setTimeout`）
- 超时后自动取消执行，并标记节点状态为 `error`
- 将超时时间设置为可配置项

---

## 6. 技术风险

### 6.1 性能风险

#### 风险 1：大数据量传递导致性能问题

**问题描述**：
- 当节点传递大量数据（如 20 张图片的 URL 数组）时，可能导致性能问题
- React Flow 的节点数据存储在内存中，数据量过大会导致内存占用过高

**影响程度**：中

**应对措施**：
1. **图片 URL 而不是图片数据**：节点间只传递 URL，不传递 Base64 编码的图片数据
2. **分页加载**：对于大量图片，前端分页加载和显示
3. **虚拟滚动**：使用 `react-window` 或类似库实现虚拟滚动，只渲染可见区域的图片
4. **数据分片**：对于超大数据，考虑分片传递（如每次只传递 5 张图片）

#### 风险 2：复杂工作流的布局计算性能

**问题描述**：
- 当工作流包含大量节点（如 50+ 个）时，React Flow 的自动布局计算可能很慢
- 用户拖拽节点时可能卡顿

**影响程度**：中

**应对措施**：
1. **使用 dagre 库进行布局优化**：PRD 中已提到使用 dagre，确保正确使用
2. **懒加载**：对于复杂工作流，只渲染可见区域的节点（需要 React Flow 支持）
3. **限制节点数量**：在产品层面限制单个工作流的最大节点数（如 100 个）

### 6.2 安全风险

#### 风险 1：API Key 泄露

**问题描述**：
- 如果前端直接调用 AI 接口，API Key 会暴露在前端代码中
- 恶意用户可以窃取 API Key，导致费用损失

**影响程度**：高

**应对措施**：
1. **统一走后端代理**：AI 接口调用统一走后端，API Key 存储在后端环境变量中
2. **限流**：后端对 AI 接口调用做限流（如每个用户每分钟最多 10 次）
3. **监控**：监控异常的 API 调用（如短时间内大量请求）

#### 风险 2：文件上传漏洞

**问题描述**：
- 用户可能上传恶意文件（如病毒、木马）
- 用户可能上传超大文件，导致存储空间耗尽

**影响程度**：高

**应对措施**：
1. **文件类型限制**：只允许上传指定类型的文件（如图片只允许 jpg、png 等）
2. **文件大小限制**：限制单个文件大小（如图片最大 10MB，文件最大 100MB）
3. **病毒扫描**：对上传的文件进行病毒扫描（可集成 ClamAV）
4. **文件名随机化**：上传后使用随机文件名存储，防止路径遍历攻击

### 6.3 可用性风险

#### 风险 1：AI 服务不可用

**问题描述**：
- AI 服务（如 Stable Diffusion API）可能不可用（宕机、维护等）
- 导致工作流执行失败

**影响程度**：中

**应对措施**：
1. **重试机制**：调用 AI 接口失败时自动重试（最多 3 次）
2. **降级方案**：如果 AI 服务不可用，提示用户稍后重试
3. **多服务商切换**：配置多个 AI 服务商，当一个不可用时自动切换到另一个

#### 风险 2：WebSocket 连接断开

**问题描述**：
- 用户网络不稳定，导致 WebSocket 连接断开
- 无法实时获取节点执行状态

**影响程度**：低

**应对措施**：
1. **自动重连**：Socket.io 自带自动重连机制
2. **轮询兜底**：WebSocket 断开后，前端改用轮询获取执行状态
3. **用户提示**：网络断开时提示用户"网络连接已断开，正在重试..."

### 6.4 扩展性风险

#### 风险 1：节点类型扩展成本高

**问题描述**：
- 每次新增节点类型，需要修改多处代码（前端组件、后端接口、类型定义等）
- 扩展性差

**影响程度**：中

**应对措施**：
1. **节点配置化**：将节点定义（输入句柄、输出句柄、UI 组件等）存储在配置文件中
2. **动态注册**：前端根据配置动态注册节点组件，无需修改代码
3. **插件化**：将节点实现为插件，支持动态加载

#### 风险 2：技能接口不兼容

**问题描述**：
- 第三方技能的接口格式可能不统一
- 导致对接成本高

**影响程度**：中

**应对措施**：
1. **定义标准接口规范**：如本文档 4.3 节所述，定义统一的技能接口格式
2. **适配器模式**：对于不兼容的技能，编写适配器进行转换
3. **审核机制**：技能上架前经过审核，确保接口符合规范

---

## 7. 附录

### 7.1 技术选型对比总结

| 技术点 | 候选方案 | 推荐方案 | 核心理由 |
|--------|----------|----------|----------|
| **状态管理** | Zustand / Redux Toolkit | Zustand | 简单、高性能、与 React Flow 集成好 |
| **文件存储** | Base64 / 本地文件系统 / MinIO / 云存储 | MinIO | 免费、可扩展、兼容 S3 API |
| **AI 调用方式** | 前端直接调用 / 后端代理 | 后端代理 | 安全、可控、易扩展 |
| **技能接口格式** | RESTful / GraphQL / gRPC | RESTful + JSON Schema | 通用、描述性强、易对接 |
| **数据流动实现** | 实时计算 / 派生状态 / 事件驱动 | 派生状态（Zustand） | 高性能、自动缓存 |

### 7.2 实施优先级建议

| 优先级 | 里程碑 | 时间估算 | 关键风险 |
|--------|--------|----------|----------|
| **P0** | 里程碑 1：节点基础架构 | 2 周 | 无 |
| **P0** | 里程碑 2：数据流动和合并 | 2 周 | 性能问题 |
| **P1** | 里程碑 3：图片/文件上传 | 1 周 | 文件存储方案选型 |
| **P1** | 里程碑 4：AI 绘图和技能调用 | 2 周 | AI 服务对接 |
| **P2** | 里程碑 5：测试和优化 | 1 周 | 性能优化 |

### 7.3 参考资料

- [React Flow 官方文档](https://reactflow.dev/)
- [Zustand 官方文档](https://github.com/pmndrs/zustand)
- [MinIO 官方文档](https://min.io/docs)
- [Prisma 官方文档](https://www.prisma.io/docs)
- [JSON Schema 规范](https://json-schema.org/)

---

**文档结束**

---

## 审批记录

| 角色 | 姓名 | 审批意见 | 日期 |
|------|------|----------|------|
| 产品负责人 | 茗需 | 待审批 |  |
| 技术负责人 | 杉架 | 待审批 |  |
| 项目经理 |  | 待审批 |  |

---

**备注**：本文档为 v1.0.0 版本，基于 PRD v1.0.0 编写。后续版本将根据开发反馈和技术评审进行迭代优化。
