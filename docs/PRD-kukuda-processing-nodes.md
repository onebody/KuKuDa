# PRD - KuKuDa 处理节点架构优化

**项目路径**: `/Users/fcj/workspace/AI_SW/KuKuDa/`  
**创建日期**: 2026-02-03  
**文档版本**: v1.0

---

## 1. 项目信息

**原始需求复述**:  
优化节点分类体系，搭建统一的**处理节点**架构，各节点自主判定并执行自身专属功能。所有处理节点需封装各自独有运行逻辑，同时统一输入输出接口，实现与下游节点无缝对接。

**技术栈**:
- 前端: Vite + React + MUI + Tailwind CSS
- 后端: Node.js + Express + TypeScript

---

## 2. 产品定义

### 2.1 Product Goals

1. **统一节点接口规范** - 建立标准化的输入输出协议，使所有处理节点能够无缝对接
2. **模块化节点架构** - 每个节点封装独立处理逻辑，支持自主判定与执行
3. **可扩展的处理能力** - 支持文本、图片、文件、AI生成、提示词优化等多样化处理需求

### 2.2 User Stories

1. As a **工作流设计者**, I want **拖拽连接不同类型的处理节点**, so that **快速搭建数据处理流水线**
2. As a **内容创作者**, I want **输入文本提示词并自动优化**, so that **获得更高质量的AI生成结果**
3. As a **数据分析师**, I want **上传多种格式文件并自动提取内容**, so that **无需手动转换即可进行后续分析**
4. As a **开发者**, I want **节点输入输出接口标准化**, so that **轻松扩展新的处理节点类型**

---

## 3. 技术规范

### 3.1 统一接口规范 (P0)

所有处理节点必须遵循以下接口规范：

**输入接口**:
```typescript
interface NodeInput {
  nodeId: string;
  nodeType: 'text-input' | 'image-input' | 'file-input' | 'ai-image-gen' | 'prompt-optimize';
  data: any;  // 节点特定数据格式
  metadata?: Record<string, any>;
  upstreamNodeIds: string[];  // 上游节点ID列表
}
```

**输出接口**:
```typescript
interface NodeOutput {
  nodeId: string;
  nodeType: string;
  status: 'success' | 'error' | 'processing';
  data: any;  // 节点处理后数据
  metadata: {
    processingTime: number;
    timestamp: string;
    [key: string]: any;
  };
  downstreamNodeIds: string[];  // 下游节点ID列表
  error?: string;
}
```

**节点执行接口**:
```typescript
interface ProcessableNode {
  validate(input: NodeInput): ValidationResult;
  process(input: NodeInput): Promise<NodeOutput>;
  getOutputSchema(): JSONSchema;  // 输出数据schema
  getInputSchema(): JSONSchema;   // 输入数据schema
}
```

### 3.2 Requirements Pool

#### P0 - Must Have

| ID | 需求 | 验收标准 |
|----|------|---------|
| P0-1 | **文本输入节点** | 1. 支持多行文本输入<br>2. 实现格式校验（长度、特殊字符、编码）<br>3. 输出标准化字符串格式<br>4. 支持变量插值（如`{{user_input}}`） |
| P0-2 | **统一接口实现** | 1. 所有节点实现`ProcessableNode`接口<br>2. 输入输出数据格式符合规范<br>3. 支持节点间数据传递测试通过 |
| P0-3 | **节点注册机制** | 1. 支持动态注册新节点类型<br>2. 节点元数据（名称、描述、图标）可配置<br>3. 节点类型枚举集中管理 |
| P0-4 | **错误处理** | 1. 节点执行失败返回标准错误格式<br>2. 支持错误传播到下游节点<br>3. 记录详细错误日志 |

#### P1 - Should Have

| ID | 需求 | 验收标准 |
|----|------|---------|
| P1-1 | **多图片文件输入节点** | 1. 支持拖拽/点击上传多张图片<br>2. 解析图片元数据（尺寸、格式、EXIF）<br>3. 输出标准化图像数据（Base64/URL）<br>4. 支持图片预处理（裁剪、压缩、格式转换） |
| P1-2 | **AI图像生成节点** | 1. 接收提示词和生成参数<br>2. 对接AI绘图API（如Stable Diffusion）<br>3. 解析并返回生成图片+元数据<br>4. 支持批量生成和进度反馈 |
| P1-3 | **节点配置UI** | 1. 每个节点类型有独立配置面板<br>2. 配置项动态渲染（根据节点类型）<br>3. 配置验证实时反馈 |
| P1-4 | **数据流可视化** | 1. 显示节点间数据传递状态<br>2. 支持查看中间处理结果<br>3. 数据流转动画效果 |

#### P2 - Nice to Have

| ID | 需求 | 验收标准 |
|----|------|---------|
| P2-1 | **通用文件输入节点** | 1. 支持PDF/Word/Excel/TXT等格式<br>2. 文件格式自动识别<br>3. 内容提取并转为结构化数据<br>4. 大文件分片上传支持 |
| P2-2 | **提示词优化节点** | 1. 接入NLP模型优化提示词<br>2. 支持多种优化策略（扩写、精简、结构化）<br>3. 优化前后对比展示<br>4. 支持自定义优化规则 |
| P2-3 | **节点模板库** | 1. 预置常用节点配置模板<br>2. 支持保存自定义模板<br>3. 模板分享与导入功能 |
| P2-4 | **性能监控** | 1. 节点执行时间统计<br>2. 内存/CPU使用监控<br>3. 性能瓶颈分析报告 |

### 3.3 UI Design Draft

#### 整体布局

```
+------------------------------------------------------------------+
|  Toolbar: [保存] [运行] [清空] [节点列表▼]                          |
+------------------------------------------------------------------+
| 节点面板 |          工作流画布区                    | 配置面板       |
|          |                                        |                |
| 文本输入  |    [文本输入] --→ [提示词优化]          | 节点名称:       |
| 图片输入  |         ↓                               | [文本输入框]    |
| 文件输入  |    [AI图像生成] --→ [输出]             |                |
| AI图像   |                                        | [参数设置]      |
| 提示词优化 |                                        |                |
|          |                                        | [预览区]        |
+----------+----------------------------------------+----------------+
| 状态栏: 就绪 | 节点数: 4 | 执行时间: 2.3s                           |
+------------------------------------------------------------------+
```

#### 节点样式规范

- **输入节点** (文本/图片/文件): 蓝色系，左侧有输入端口
- **处理节点** (AI生成/提示词优化): 紫色系，左右均有端口
- **输出节点**: 绿色系，右侧有输出端口
- **端口状态**: 未连接(灰色)、已连接(高亮)、错误(红色)
- **节点状态**: 待执行(默认)、运行中(旋转动画)、完成(绿色勾)、错误(红色感叹号)

#### 连接线规范

- 数据类型用颜色区分：文本(绿色)、图片(蓝色)、文件(橙色)、AI生成(紫色)
- 数据流动画：从左到右的粒子流动效果
- 选中状态：高亮+控制点

---

## 4. 技术实现要点

### 4.1 后端架构

```
src/
├── nodes/
│   ├── base-node.ts          # ProcessableNode 抽象基类
│   ├── node-registry.ts      # 节点注册中心
│   ├── text-input-node.ts    # 文本输入节点
│   ├── image-input-node.ts   # 图片输入节点  
│   ├── file-input-node.ts    # 文件输入节点
│   ├── ai-image-gen-node.ts  # AI图像生成节点
│   └── prompt-optimize-node.ts # 提示词优化节点
├── interfaces/
│   ├── node-input.interface.ts
│   ├── node-output.interface.ts
│   └── node-config.interface.ts
└── services/
    ├── workflow-executor.service.ts  # 工作流执行引擎
    └── node-validator.service.ts     # 节点配置验证
```

### 4.2 前端架构

```
frontend/src/
├── components/
│   ├── NodePalette/          # 节点面板
│   ├── WorkflowCanvas/       # 工作流画布(React Flow)
│   ├── NodeConfig/           # 节点配置面板
│   └── nodes/                # 节点React组件
│       ├── TextInputNode.tsx
│       ├── ImageInputNode.tsx
│       └── ...
├── services/
│   ├── node-api.service.ts   # 节点API调用
│   └── workflow.service.ts   # 工作流CRUD
└── store/
    └── workflow.slice.ts     # 工作流状态管理
```

### 4.3 数据流转示例

```typescript
// 示例：文本输入 → 提示词优化 → AI图像生成
const workflow = {
  nodes: [
    { id: 'n1', type: 'text-input', config: { placeholder: '输入描述...' } },
    { id: 'n2', type: 'prompt-optimize', config: { strategy: 'enhance' } },
    { id: 'n3', type: 'ai-image-gen', config: { model: 'stable-diffusion-v2' } }
  ],
  edges: [
    { from: 'n1', to: 'n2' },
    { from: 'n2', to: 'n3' }
  ]
};

// 执行过程
const output1 = await nodes['n1'].process({ data: '一只坐在月亮上的猫' });
// output1.data = '一只坐在月亮上的猫'

const output2 = await nodes['n2'].process({ data: output1.data });
// output2.data = '一只可爱的猫咪悠闲地坐在新月上，背景是闪烁的星空...'

const output3 = await nodes['n3'].process({ data: output2.data, params: { steps: 20 } });
// output3.data = { imageUrl: '...', seed: 12345, metadata: {...} }
```

---

## 5. Open Questions (待确认问题)

1. **Q1**: 节点执行是同步还是异步？
   - 建议：支持异步执行，提供执行状态回调机制

2. **Q2**: 如何处理节点间数据类型不匹配？
   - 建议：增加类型检查+自动转换机制，或明确要求用户手动连接兼容节点

3. **Q3**: AI图像生成节点的API选型？
   - 建议：先支持Stable Diffusion本地部署，后续扩展云端API（DALL-E、Midjourney等）

4. **Q4**: 提示词优化节点的NLP模型选型？
   - 建议：初期使用规则引擎+模板，后续集成GPT/Claude等大模型API

5. **Q5**: 工作流保存格式？
   - 建议：JSON格式，包含节点配置、连接关系、元数据

6. **Q6**: 节点执行失败的重试策略？
   - 建议：可配置重试次数+退避策略，失败时暂停整个工作流

---

## 6. 开发排期建议

| 阶段 | 任务 | 工期 |
|------|------|------|
| 第一阶段 | 统一接口规范 + 节点基类 + 注册机制 | 3天 |
| 第二阶段 | 文本输入节点 + 基础UI框架 | 2天 |
| 第三阶段 | 图片输入节点 + 文件输入节点 | 3天 |
| 第四阶段 | AI图像生成节点 + 提示词优化节点 | 4天 |
| 第五阶段 | 工作流执行引擎 + 错误处理 | 2天 |
| 第六阶段 | UI完善 + 数据流可视化 | 3天 |
| 第七阶段 | 测试 + 文档 + 部署 | 2天 |

**总计**: 约19个工作日

---

## 7. 成功指标

- ✅ 所有节点类型实现统一接口，可无缝对接
- ✅ 用户可成功搭建包含5个节点的工作流并顺利执行
- ✅ 节点执行错误率 < 1%
- ✅ 100个节点并发执行时，响应时间 < 5秒
- ✅ 用户满意度调研评分 ≥ 4.0/5.0

---

**文档维护**:  
本文档将随项目进展持续更新。重大变更需通知所有相关人员并版本号+1。

**审批记录**:
- 产品审批: ___________ 日期: ___________
- 技术审批: ___________ 日期: ___________  
- 测试审批: ___________ 日期: ___________
