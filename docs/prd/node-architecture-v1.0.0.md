# KuKuDa 节点架构改造产品设计文档

**版本**: v1.0.0  
**日期**: 2026-02-10  
**作者**: 茗需（产品经理）  
**状态**: 待评审

---

## 版本历史

| 版本号 | 日期 | 作者 | 变更说明 |
|--------|------|------|----------|
| v1.0.0 | 2026-02-10 | 茗需 | 初始版本，定义节点分类、数据流动规则、输入合并策略 |

---

## 术语定义

| 术语 | 定义 |
|------|------|
| **源节点 (Source Node)** | 只有输出没有输入的节点，作为数据流的起点，用于输入原始数据（文本、图片、文件等） |
| **处理节点 (Processing Node)** | 既有输入也有输出的节点，用于处理、转换或消费数据 |
| **节点输出 (Node Output)** | 节点执行后产生的数据，可被下游节点读取 |
| **节点输入 (Node Input)** | 节点从上游节点读取的数据 |
| **边 (Edge)** | React Flow 中连接节点的线，表示数据流动方向 |
| **被动读取** | 处理节点仅读取上游节点的输出数据，不会主动触发上游节点执行 |
| **追加拼接** | 多个输入源合并时的策略，文本按换行符拼接，数组进行合并 |
| **等待状态** | 当上游节点无输出时，处理节点显示"等待上游数据..."的状态 |

---

## 1. 需求背景

### 1.1 产品概述

KuKuDa 是一个基于 React Flow 画布的 AI 工作流构建工具，用户可以通过拖拽节点、连接边的形式构建 AI 工作流，实现文本生成、图片处理、文件操作等任务的自动化。

### 1.2 当前问题

现有节点架构存在以下问题：
- 节点分类不清晰，源节点和处理节点边界模糊
- 数据流动规则不明确，导致执行顺序混乱
- 多输入合并策略缺失，无法处理复杂的输入输出场景
- UI 交互不一致，用户体验欠佳

### 1.3 改造目标

- 明确节点分类（源节点 vs 处理节点）
- 规范数据流动规则（被动读取、等待策略）
- 定义输入合并策略（追加拼接）
- 统一 UI 交互设计

---

## 2. 节点分类定义

根据节点是否有输入，将节点分为两大类：**源节点（Source Node）** 和 **处理节点（Processing Node）**。

### 2.1 源节点（Source Node）

**定义**: 只有输出、没有输入的节点，作为数据流的起点。

**特征**:
- 无输入句柄（Handle）
- 有输出句柄（Handle）
- 用户手动输入数据或选择文件
- 输出数据可被下游处理节点读取

#### 2.1.1 文本输入节点（TextInputNode）

**功能**: 用户输入文本，输出字符串。

**输入**: 无  
**输出**: 
- `text` (string): 用户输入的文本内容

**UI 设计**:
- 节点主体：一个多行文本输入框（textarea）
- 右下角：输出句柄，标注"文本输出"
- 占位符："请输入文本内容..."

**数据结构**:
```typescript
interface TextInputNodeData {
  type: 'textInput';
  text: string;  // 用户输入的文本内容
}
```

**使用场景**: 
- 输入 AI 绘图提示词
- 输入文本内容进行处理
- 作为工作流的文本数据源

---

#### 2.1.2 单图片输入节点（SingleImageInputNode）

**功能**: 选择单张图片，输出图片 URL。

**输入**: 无  
**输出**: 
- `imageUrl` (string): 图片的 URL 地址

**UI 设计**:
- 点击节点或"选择文件"按钮，弹出图片选择弹窗
- 弹窗样式：深色主题
  - 标题："图片输入"
  - 中央："选择文件"按钮
  - 下方提示："或拖放文件到此处 或 Ctrl+V 粘贴"
  - 底部："支持音频、视频、图片素材"
- 已选择图片后，节点显示图片缩略图和文件名

**数据结构**:
```typescript
interface SingleImageInputNodeData {
  type: 'singleImageInput';
  imageUrl: string;    // 图片 URL
  fileName: string;     // 文件名
  fileSize: number;     // 文件大小（字节）
}
```

**交互细节**:
- 支持点击选择文件
- 支持拖拽上传
- 支持 Ctrl+V 粘贴剪贴板图片
- 支持的文件格式：jpg, jpeg, png, gif, webp, bmp

---

#### 2.1.3 多图片输入节点（MultiImageInputNode）

**功能**: 批量选择最多 20 张图片，自动编号 1-20，输出图片 URL 数组。

**输入**: 无  
**输出**: 
- `imageUrls` (string[]): 图片 URL 数组，按编号顺序排列
- `images` (array): 详细图片信息数组
  - `id` (number): 编号 1-20
  - `url` (string): 图片 URL
  - `fileName` (string): 文件名

**UI 设计**:
- 点击节点或"上传图片"按钮，弹出批量上传弹窗
- 弹窗样式：深色主题
  - 标题："批量上传图片"
  - 顶部提示："支持最多20张图片（自动编号1-20）"
  - 右上角："清空"和"上传图片"按钮
  - 中央区域：图片预览网格（显示已上传的图片缩略图和编号）
  - 中央空白区域提示："点击右上角「上传图片」"
  - 底部提示："下一步点击「分批提示词输入」，会自动创建分镜表节点"
  - 底部按钮："分批提示词输入"
- 已上传图片后，节点显示图片数量和预览网格

**数据结构**:
```typescript
interface MultiImageInputNodeData {
  type: 'multiImageInput';
  imageUrls: string[];  // 图片 URL 数组
  images: Array<{
    id: number;         // 编号 1-20
    url: string;        // 图片 URL
    fileName: string;   // 文件名
    fileSize: number;   // 文件大小（字节）
  }>;
  maxCount: number;     // 最大数量，固定为 20
}
```

**交互细节**:
- 支持批量选择文件（文件选择器支持多选）
- 支持拖拽批量上传
- 支持 Ctrl+V 粘贴剪贴板图片（可连续粘贴多张）
- 自动按上传顺序编号 1-20
- 超过 20 张时提示"最多支持20张图片"
- "清空"按钮清空所有已上传图片
- "分批提示词输入"按钮：点击后自动创建分镜表节点（高级功能，v1.0.0 可预留接口）

**使用场景**:
- 批量 AI 绘图（为每张图片生成不同的提示词）
- 图片处理工作流（批量滤镜、批量裁剪等）
- 图片对比分析

---

#### 2.1.4 单文件输入节点（SingleFileInputNode）

**功能**: 选择单个文件，输出文件 URL。

**输入**: 无  
**输出**: 
- `fileUrl` (string): 文件的 URL 地址
- `fileInfo` (object): 文件详细信息
  - `fileName` (string): 文件名
  - `fileSize` (number): 文件大小（字节）
  - `fileType` (string): 文件类型（MIME type）

**UI 设计**:
- 类似单图片输入节点
- 弹窗标题："文件输入"
- 支持所有文件类型

**数据结构**:
```typescript
interface SingleFileInputNodeData {
  type: 'singleFileInput';
  fileUrl: string;     // 文件 URL
  fileInfo: {
    fileName: string;   // 文件名
    fileSize: number;   // 文件大小（字节）
    fileType: string;   // 文件类型（MIME type）
  };
}
```

---

#### 2.1.5 多文件输入节点（MultiFileInputNode）

**功能**: 批量选择多个文件，输出文件 URL 数组。

**输入**: 无  
**输出**: 
- `fileUrls` (string[]): 文件 URL 数组
- `files` (array): 详细文件信息数组
  - `url` (string): 文件 URL
  - `fileName` (string): 文件名
  - `fileSize` (number): 文件大小（字节）
  - `fileType` (string): 文件类型（MIME type）

**UI 设计**:
- 类似多图片输入节点
- 弹窗标题："批量上传文件"
- 支持所有文件类型
- 不限制数量（或限制为 50 个，根据技术评估确定）

**数据结构**:
```typescript
interface MultiFileInputNodeData {
  type: 'multiFileInput';
  fileUrls: string[];  // 文件 URL 数组
  files: Array<{
    url: string;        // 文件 URL
    fileName: string;   // 文件名
    fileSize: number;   // 文件大小（字节）
    fileType: string;   // 文件类型（MIME type）
  }>;
  maxCount: number;     // 最大数量，v1.0.0 可设为 50
}
```

---

### 2.2 处理节点（Processing Node）

**定义**: 既有输入也有输出的节点，用于处理、转换或消费数据。

**特征**:
- 有输入句柄（Handle）
- 有输出句柄（Handle）
- 读取上游节点的输出数据进行处理
- 输出处理结果供下游节点使用（终端节点除外）

#### 2.2.1 AI 绘图节点（AIImageNode）

**功能**: 输入文本 prompt（可选），调用 AI 绘图接口，输出图片 URL。

**输入**: 
- `prompt` (string, 可选): 绘图提示词
  - 如果连接了上游文本输入节点，自动读取文本内容作为 prompt
  - 如果未连接上游节点，使用节点内部的 prompt 输入框

**输出**: 
- `imageUrl` (string): 生成的图片 URL

**UI 设计**:
- 节点主体：
  - 左侧：输入句柄，标注"文本输入"
  - 右侧：输出句柄，标注"图片输出"
  - 中间：prompt 输入框（textarea，当无上游输入时显示）
  - 中间："生成"按钮
- 生成完成后，节点显示生成的图片缩略图

**数据结构**:
```typescript
interface AIImageNodeData {
  type: 'aiImage';
  prompt: string;       // 提示词（内部输入，当无上游时使用）
  useUpstream: boolean; // 是否使用上游输入
  imageUrl: string;     // 生成的图片 URL
  status: 'idle' | 'generating' | 'success' | 'error';
  error?: string;       // 错误信息
}
```

**执行逻辑**:
1. 检查是否有上游文本输入节点连接
   - 有：读取上游节点的 `text` 输出作为 prompt
   - 无：使用节点内部的 `prompt` 字段
2. 调用 AI 绘图接口（具体接口由技术团队确定）
3. 生成完成后，将图片 URL 写入 `imageUrl` 字段
4. 下游节点可读取 `imageUrl` 作为输入

**使用场景**:
- 根据文本提示词生成图片
- 根据上游文本输出生成配图
- AI 绘画工作流

---

#### 2.2.2 文本输出节点（TextOutputNode）

**功能**: 输入文本，无输出（终端节点）。

**输入**: 
- `text` (string): 文本内容

**输出**: 无（终端节点）

**UI 设计**:
- 节点主体：
  - 左侧：输入句柄，标注"文本输入"
  - 无输出句柄
  - 中间：文本显示区域（只读，显示输入的文本内容）
  - 右上角："复制"按钮（复制文本内容到剪贴板）

**数据结构**:
```typescript
interface TextOutputNodeData {
  type: 'textOutput';
  text: string;  // 输入的文本内容
}
```

**执行逻辑**:
1. 读取上游节点的 `text` 输出
2. 将文本内容显示在节点上
3. 无输出，工作流到此结束

**使用场景**:
- 显示工作流的最终文本结果
- 作为文本处理工作流的终端节点
- 调试工作流（查看中间结果）

---

#### 2.2.3 技能节点（SkillNode）

**功能**: 输入参数，调用技能（Skill）接口，输出执行结果。

**输入**: 
- 根据技能定义动态确定输入参数
- 示例：`prompt` (string), `imageUrl` (string), `count` (number) 等

**输出**: 
- 根据技能定义动态确定输出结果
- 示例：`result` (string), `imageUrl` (string), `data` (object) 等

**UI 设计**:
- 节点主体：
  - 左侧：多个输入句柄（根据技能输入参数动态生成）
  - 右侧：输出句柄（根据技能输出定义生成）
  - 中间：技能名称（只读）
  - 中间："配置"按钮（点击弹出技能配置弹窗）
- 技能配置弹窗：
  - 显示技能名称、描述
  - 显示输入参数表单（根据技能 schema 动态生成）
  - "保存"按钮

**数据结构**:
```typescript
interface SkillNodeData {
  type: 'skill';
  skillId: string;      // 技能 ID
  skillName: string;    // 技能名称
  inputParams: {        // 输入参数（根据技能 schema 填充）
    [key: string]: any;
  };
  output: any;          // 输出结果（根据技能 schema 确定）
  status: 'idle' | 'running' | 'success' | 'error';
  error?: string;       // 错误信息
}
```

**执行逻辑**:
1. 读取上游节点的输出，填充到 `inputParams` 中对应的字段
2. 调用技能接口（具体接口由技术团队确定）
3. 执行完成后，将结果写入 `output` 字段
4. 下游节点可读取 `output` 作为输入

**使用场景**:
- 调用外部 API（天气查询、翻译、搜索等）
- 执行复杂的数据处理（格式转换、数据清洗等）
- 扩展工作流能力（通过安装新技能）

---

## 3. 数据流动规则

### 3.1 核心原则：被动读取，不主动触发

**规则描述**: 处理节点只读取已有输出结果的上游节点数据，不会主动触发上游节点执行。

**设计原因**:
- 避免循环触发（A 触发 B，B 又触发 A）
- 明确执行顺序（从源节点开始，沿着边的方向依次执行）
- 提高性能（避免不必要的重复执行）

**执行流程**:
1. 用户点击"运行工作流"按钮
2. 从源节点开始执行（源节点不需要上游数据）
3. 源节点执行完成后，输出数据
5. 沿着边的方向，找到下一个处理节点
6. 处理节点检查上游节点是否有输出
   - 有：读取上游输出，执行处理，输出结果
   - 无：显示"等待上游数据..."，暂停执行
7. 重复步骤 3-6，直到没有下游节点或遇到终端节点

### 3.2 上游无输出时的等待策略

**规则描述**: 当处理节点的上游节点无输出时，处理节点等待，并显示"等待上游数据..."。

**UI 设计**:
- 节点边框显示为黄色（表示等待状态）
- 节点内部显示"等待上游数据..."文字
- 鼠标悬停时，显示 tooltip："正在等待上游节点输出数据，请检查上游节点是否已正确配置"

**状态转换**:
```
idle（空闲） → waiting（等待） → running（执行中） → success（成功）/ error（失败）
```

**处理细节**:
- 处理节点定期检查上游节点的输出状态（通过 `setInterval` 或事件监听）
- 一旦上游节点有输出，立即触发处理节点的执行
- 如果上游节点执行失败，处理节点也显示为失败状态，并显示错误信息

### 3.3 数据读取实现方式

**技术方案**: 处理节点通过 React Flow 的 `getNodes` + edge 关系读取上游数据。

**实现步骤**:
1. 获取当前节点的所有入边（incoming edges）
2. 从入边的 `source` 字段获取上游节点 ID
3. 通过 `getNodes` 获取所有节点
4. 根据上游节点 ID 找到对应的节点对象
5. 读取该节点的 `data` 字段中的输出数据

**示例代码**（仅供参考，具体实现由技术团队确定）:
```typescript
// 读取上游节点输出数据
function readUpstreamOutput(currentNodeId: string, nodes: Node[], edges: Edge[]) {
  // 1. 获取当前节点的所有入边
  const incomingEdges = edges.filter(edge => edge.target === currentNodeId);
  
  // 2. 读取每个上游节点的输出
  const upstreamOutputs = incomingEdges.map(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (!sourceNode) return null;
    
    // 3. 根据节点类型，读取对应的输出字段
    switch (sourceNode.data.type) {
      case 'textInput':
        return { text: sourceNode.data.text };
      case 'singleImageInput':
        return { imageUrl: sourceNode.data.imageUrl };
      case 'multiImageInput':
        return { imageUrls: sourceNode.data.imageUrls };
      // ... 其他节点类型
      default:
        return null;
    }
  });
  
  // 4. 过滤掉 null 值
  return upstreamOutputs.filter(output => output !== null);
}
```

---

## 4. 输入合并策略

当一个处理节点有多个上游节点时，需要将多个输入源的数据合并。采用**追加拼接**策略。

### 4.1 文本合并策略：按顺序拼接，以换行符分隔

**规则描述**: 多个文本输入节点连接到一个处理节点时，将其文本内容按顺序拼接，以换行符（`\n`）分隔。

**示例**:
- 上游节点 A 输出：`"Hello"`
- 上游节点 B 输出：`"World"`
- 合并后输入到处理节点：`"Hello\nWorld"`

**实现细节**:
```typescript
function mergeTextInputs(upstreamOutputs: Array<{ text: string }>) {
  return upstreamOutputs.map(output => output.text).join('\n');
}
```

### 4.2 图片/文件 URL 合并策略：数组合并

**规则描述**: 多个图片/文件输入节点连接到一个处理节点时，将其 URL 数组合并。

**示例**:
- 上游节点 A 输出：`["url1", "url2"]`
- 上游节点 B 输出：`["url3", "url4"]`
- 合并后输入到处理节点：`["url1", "url2", "url3", "url4"]`

**实现细节**:
```typescript
function mergeImageUrls(upstreamOutputs: Array<{ imageUrls: string[] }>) {
  return upstreamOutputs.flatMap(output => output.imageUrls);
}
```

### 4.3 多种类型合并策略：按类型分别处理

**规则描述**: 当上游节点输出多种类型的数据时，按类型分别处理，不跨类型合并。

**示例**:
- 上游节点 A（文本输入）输出：`{ text: "Hello" }`
- 上游节点 B（单图片输入）输出：`{ imageUrl: "url1" }`
- 合并后输入到处理节点：
  ```typescript
  {
    texts: ["Hello"],           // 文本数组
    imageUrls: ["url1"],        // 图片 URL 数组
  }
  ```

**实现细节**:
```typescript
function mergeMixedInputs(upstreamOutputs: any[]) {
  const result = {
    texts: [],
    imageUrls: [],
    fileUrls: [],
  };
  
  upstreamOutputs.forEach(output => {
    if (output.text) result.texts.push(output.text);
    if (output.imageUrl) result.imageUrls.push(output.imageUrl);
    if (output.imageUrls) result.imageUrls.push(...output.imageUrls);
    if (output.fileUrl) result.fileUrls.push(output.fileUrl);
    if (output.fileUrls) result.fileUrls.push(...output.fileUrls);
  });
  
  return result;
}
```

### 4.4 合并冲突处理

**问题**: 当处理节点期望单一输入，但收到多个输入时，如何处理？

**策略**: 根据处理节点的类型，采用不同的策略：

| 处理节点类型 | 策略 | 示例 |
|-------------|------|------|
| AI 绘图节点 | 使用第一个文本输入，忽略后续的 | 上游有 3 个文本输入节点，只使用第一个 |
| 文本输出节点 | 合并所有文本输入，以换行符分隔 | 上游有 3 个文本输入节点，合并为一个文本 |
| 技能节点 | 根据技能输入参数定义，映射到对应字段 | 技能需要 `prompt` 和 `imageUrl`，分别从上游读取 |

---

## 5. UI/UX 交互设计

### 5.1 节点样式规范

**节点外观**:
- 圆角矩形，背景色为深色（#1e1e1e）
- 边框颜色：
  - 空闲状态：灰色（#555）
  - 等待状态：黄色（#ffc107）
  - 执行中状态：蓝色（#2196f3）
  - 成功状态：绿色（#4caf50）
  - 失败状态：红色（#f44336）
- 节点标题栏：顶部显示节点类型图标和名称
- 输入句柄：左侧，圆形，灰色
- 输出句柄：右侧，圆形，灰色
- 句柄连接时：句柄变为蓝色，边变为蓝色

**节点大小**:
- 最小宽度：200px
- 最小高度：100px
- 可根据内容自动伸展

### 5.2 图片选择弹窗设计

#### 5.2.1 单图片选择弹窗

**弹窗标题**: "图片输入"

**弹窗内容**:
- 中央："选择文件"按钮（大号，醒目）
- 下方提示文字："或拖放文件到此处 或 Ctrl+V 粘贴"
- 底部提示文字："支持音频、视频、图片素材"
- 已选择图片后，中央显示图片预览和文件名

**交互**:
- 点击"选择文件"按钮：打开文件选择器（只显示图片文件）
- 拖放文件到弹窗：自动上传
- Ctrl+V 粘贴：如果剪贴板有图片，自动上传
- 上传完成后：显示图片预览和"重新选择"按钮

**视觉稿**（文字描述）:
```
+----------------------------------+
|  图片输入                        |
+----------------------------------+
|                                  |
|     +------------------+         |
|     |   选择文件       |         |
|     +------------------+         |
|                                  |
|   或拖放文件到此处                |
|   或 Ctrl+V 粘贴                 |
|                                  |
|  支持音频、视频、图片素材         |
+----------------------------------+
```

#### 5.2.2 批量图片上传弹窗

**弹窗标题**: "批量上传图片"

**弹窗内容**:
- 顶部提示："支持最多20张图片（自动编号1-20）"
- 右上角："清空"按钮和"上传图片"按钮
- 中央区域：
  - 已上传图片时：显示图片预览网格（每张图片显示缩略图、编号、文件名）
  - 未上传图片时：显示"点击右上角「上传图片」"
- 底部提示："下一步点击「分批提示词输入」，会自动创建分镜表节点"
- 底部按钮："分批提示词输入"（灰色，不可点击，v1.0.0 预留）

**交互**:
- 点击"上传图片"按钮：打开文件选择器（支持多选）
- 拖放文件到弹窗：自动上传
- Ctrl+V 粘贴：连续粘贴多张图片
- 自动编号：按上传顺序编号 1-20
- 点击"清空"按钮：清空所有已上传图片
- 鼠标悬停图片：显示"删除"按钮，点击删除该图片
- 超过 20 张时：提示"最多支持20张图片"

**视觉稿**（文字描述）:
```
+----------------------------------+
|  批量上传图片                     |
+----------------------------------+
| 支持最多20张图片（自动编号1-20）   |
|                      [清空] [上传] |
|                                  |
|  +------+ +------+ +------+      |
|  | 1    | | 2    | | 3    |     |
|  |[img] | |[img] | |[img] |     |
|  |a.jpg| |b.jpg| |c.jpg|     |
|  +------+ +------+ +------+      |
|                                  |
|  点击右上角「上传图片」            |
|                                  |
| 下一步点击「分批提示词输入」，      |
| 会自动创建分镜表节点               |
|                                  |
|  [分批提示词输入]                 |
+----------------------------------+
```

### 5.3 等待状态 UI 设计

**节点外观**:
- 边框颜色变为黄色（#ffc107）
- 节点内部显示"等待上游数据..."文字
- 可添加旋转动画（可选）

**Tooltip**:
- 鼠标悬停时，显示 tooltip："正在等待上游节点输出数据，请检查上游节点是否已正确配置"

**示例**:
```
+----------------------------------+
|  AI 绘图                         |
|                                  |
|  等待上游数据...                  |
|                                  |
|  [i] 正在等待上游节点输出数据      |
+----------------------------------+
```

### 5.4 执行状态 UI 设计

**节点外观**:
- 边框颜色根据状态变化：
  - 执行中：蓝色（#2196f3），可添加进度条或旋转动画
  - 成功：绿色（#4caf50），显示"✓ 执行成功"
  - 失败：红色（#f44336），显示"✗ 执行失败"，鼠标悬停显示错误信息

**示例**:
```
# 执行中
+----------------------------------+
|  AI 绘图                         |
|                                  |
|  ⏳ 生成中...                     |
|  [======>     ] 60%              |
+----------------------------------+

# 成功
+----------------------------------+
|  AI 绘图                         |
|                                  |
|  ✓ 生成成功                      |
|  [图片缩略图]                    |
+----------------------------------+

# 失败
+----------------------------------+
|  AI 绘图                         |
|                                  |
|  ✗ 执行失败                      |
|  [查看详情]                      |
+----------------------------------+
```

---

## 6. 节点数据结构定义

### 6.1 基础节点数据接口

```typescript
// 基础节点数据接口
interface BaseNodeData {
  type: string;  // 节点类型
  status: 'idle' | 'waiting' | 'running' | 'success' | 'error';
  error?: string; // 错误信息（可选）
}

// React Flow 节点类型
type KuKuDaNode = Node<BaseNodeData>;
```

### 6.2 源节点数据接口

```typescript
// 文本输入节点数据
interface TextInputNodeData extends BaseNodeData {
  type: 'textInput';
  text: string;
}

// 单图片输入节点数据
interface SingleImageInputNodeData extends BaseNodeData {
  type: 'singleImageInput';
  imageUrl: string;
  fileName: string;
  fileSize: number;
}

// 多图片输入节点数据
interface MultiImageInputNodeData extends BaseNodeData {
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
interface SingleFileInputNodeData extends BaseNodeData {
  type: 'singleFileInput';
  fileUrl: string;
  fileInfo: {
    fileName: string;
    fileSize: number;
    fileType: string;
  };
}

// 多文件输入节点数据
interface MultiFileInputNodeData extends BaseNodeData {
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

### 6.3 处理节点数据接口

```typescript
// AI 绘图节点数据
interface AIImageNodeData extends BaseNodeData {
  type: 'aiImage';
  prompt: string;
  useUpstream: boolean;
  imageUrl: string;
}

// 文本输出节点数据
interface TextOutputNodeData extends BaseNodeData {
  type: 'textOutput';
  text: string;
}

// 技能节点数据
interface SkillNodeData extends BaseNodeData {
  type: 'skill';
  skillId: string;
  skillName: string;
  inputParams: {
    [key: string]: any;
  };
  output: any;
}
```

### 6.4 节点类型映射

```typescript
// 节点类型到数据接口的映射
type NodeDataMap = {
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
type NodeData<T extends keyof NodeDataMap> = NodeDataMap[T];
```

---

## 7. 实施里程碑

### 7.1 里程碑 1：节点基础架构（2 周）

**目标**: 完成节点分类定义和基础数据结构。

**任务**:
- [ ] 定义节点数据接口（TypeScript 类型定义）
- [ ] 实现源节点基类和处理节点基类
- [ ] 实现 5 种源节点的 UI 组件（文本输入、单图片、多图片、单文件、多文件）
- [ ] 实现 3 种处理节点的 UI 组件（AI 绘图、文本输出、技能节点）
- [ ] 完成节点拖拽、连接、删除等基础交互

**验收标准**:
- 可以在画布上拖拽创建所有类型的节点
- 可以连接节点（从输出句柄到输入句柄）
- 可以删除节点和边
- 节点显示正确的 UI（输入句柄、输出句柄、配置项）

---

### 7.2 里程碑 2：数据流动和合并（2 周）

**目标**: 实现数据流动规则和输入合并策略。

**任务**:
- [ ] 实现数据流动核心逻辑（被动读取、等待策略）
- [ ] 实现输入合并策略（文本拼接、数组合并、多类型处理）
- [ ] 实现等待状态 UI（黄色边框、"等待上游数据..."文字）
- [ ] 实现执行状态 UI（执行中、成功、失败）
- [ ] 完成端到端测试（从源节点到处理节点到输出节点）

**验收标准**:
- 源节点可以输出数据
- 处理节点可以读取上游节点的输出数据
- 多个上游节点输入时，可以按合并策略正确合并
- 上游无输出时，处理节点显示等待状态
- 执行成功后，下游节点可以读取处理结果

---

### 7.3 里程碑 3：图片/文件上传（1 周）

**目标**: 实现图片/文件上传功能。

**任务**:
- [ ] 实现单图片选择弹窗（深色主题、选择文件、拖拽、Ctrl+V）
- [ ] 实现批量图片上传弹窗（深色主题、批量选择、自动编号、清空）
- [ ] 实现单文件选择弹窗
- [ ] 实现多文件选择弹窗
- [ ] 完成上传功能（调用上传接口、显示进度、错误处理）

**验收标准**:
- 可以点击选择文件/图片
- 可以拖拽上传文件/图片
- 可以 Ctrl+V 粘贴图片
- 批量上传时，自动编号 1-20
- 上传成功后，节点显示预览
- 上传失败时，显示错误信息

---

### 7.4 里程碑 4：AI 绘图和技能调用（2 周）

**目标**: 实现 AI 绘图节点和技能节点的核心功能。

**任务**:
- [ ] 实现 AI 绘图接口调用（对接 AI 绘图服务）
- [ ] 实现 AI 绘图节点 UI（prompt 输入、生成按钮、图片预览）
- [ ] 实现技能节点配置弹窗（动态表单生成）
- [ ] 实现技能接口调用（对接技能服务）
- [ ] 完成技能节点测试（调用外部 API、处理返回结果）

**验收标准**:
- AI 绘图节点可以生成图片
- 技能节点可以调用外部 API
- 执行结果可以输出到下游节点
- 执行失败时，显示错误信息

---

### 7.5 里程碑 5：测试和优化（1 周）

**目标**: 完成集成测试、性能优化、文档编写。

**任务**:
- [ ] 完成集成测试（所有节点类型、所有数据流场景）
- [ ] 完成性能优化（大数据量、多个节点、复杂工作流）
- [ ] 完成用户文档（节点使用说明、常见问题）
- [ ] 完成开发文档（架构设计、接口定义、扩展指南）

**验收标准**:
- 所有功能正常工作，无严重 bug
- 工作流执行速度可接受（< 5 秒 for 10 个节点）
- 文档完整、准确、易读

---

## 8. 附录

### 8.1 技术栈

- **前端框架**: React 18+
- **画布库**: React Flow 11+
- **状态管理**: Zustand / Redux Toolkit
- **样式方案**: Tailwind CSS / styled-components
- **类型检查**: TypeScript 5+
- **构建工具**: Vite / Webpack

### 8.2 参考文档

- [React Flow 官方文档](https://reactflow.dev/)
- [KuKuDa 项目架构设计文档](./architecture.md)（待编写）
- [KuKuDa 节点开发指南](./node-development-guide.md)（待编写）

### 8.3 待确认事项

- [ ] AI 绘图接口具体使用哪个服务（Stable Diffusion、DALL-E、Midjourney API？）
- [ ] 技能接口的具体格式（REST API、GraphQL、gRPC？）
- [ ] 文件上传的存储方案（本地存储、云存储、IPFS？）
- [ ] 多文件输入节点的最大数量（50？100？不限制？）
- [ ] 工作流执行的超时时间（30 秒？60 秒？可配置？）

### 8.4 变更日志

（本文档的变更记录）

---

**文档结束**

---

## 审批记录

| 角色 | 姓名 | 审批意见 | 日期 |
|------|------|----------|------|
| 产品负责人 |  | 待审批 |  |
| 技术负责人 |  | 待审批 |  |
| 设计师 |  | 待审批 |  |
| 测试负责人 |  | 待审批 |  |

---

**备注**: 本文档为 v1.0.0 版本，定义了 KuKuDa 节点架构改造的核心设计方案。后续版本将根据开发反馈和用户反馈进行迭代优化。
