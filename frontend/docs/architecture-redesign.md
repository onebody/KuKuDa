# KuKuDa 架构重设计 — 彻底解决焦点丢失 & 节点缩放问题

## 根本原因分析（一句话）

**Zustand store 掌管 nodes 状态，每次 nodes 变化都触发 `setNodes()` 全量替换 → React Flow 重新挂载节点组件 → 输入框失焦 & resize 状态丢失。**

---

## 推荐架构方案

### 核心思路

> **React Flow 自己管 nodes（`useNodesState`），Zustand 只做后端同步层。**
> 节点 data 的实时更新通过 **ref 直接突变** 完成，不走 `setNodes`。

### 架构示意图

```
┌─────────────────────────────────────────────────────────┐
│                     Canvas.tsx                         │
│                                                         │
│  React Flow (useNodesState) ←── 唯一数据源              │
│       │                                                 │
│       │ setNodes / onNodesChange                         │
│       ▼                                                 │
│  ┌─────────────────────────────────┐                   │
│  │  节点组件 (BaseNode)            │                   │
│  │  ├─ onChange → data 直接突变    │ ← ref 绕过 React   │
│  │  ├─ NodeResizer (官方)          │ ← 用 reactflow 的  │
│  │  └─ 输入框受控于 data          │                   │
│  └─────────────────────────────────┘                   │
│                                                         │
│  Zustand Store (useNodeStore)                          │
│       │                                                 │
│       ├─ nodes: Node[]     ← 仅用于后端同步             │
│       ├─ fetchNodes()      ← 初始加载                   │
│       ├─ syncToBackend()   ← 保存时                     │
│       └─ updateNodeLocal() ← 直接突变 ref               │
└─────────────────────────────────────────────────────────┘
```

### 关键设计决策

| 决策 | 说明 |
|------|------|
| **React Flow 拥有 nodes 状态** | 用 `useNodesState` 管理，不再从 Zustand 同步 |
| **Zustand 只做后端同步** | `nodes` 字段保留但仅用于 CRUD 同步，不直接驱动 UI |
| **data 更新用 ref 直接突变** | `onChange` 直接改 `node.data.xxx`，不触发 `setNodes` |
| **resize 用官方 NodeResizer** | 去掉自定义手柄，用 `@reactflow/node-resizer` |
| **onNodesChange 双向同步** | drag/resize 结束 → 同步回 Zustand；初始加载 → Zustand → setNodes 一次 |

---

## 具体改动

### 1. `Canvas.tsx` — 核心改造

**现状问题：**
- `useEffect([storeNodes]) → setNodes()` 全量同步，导致节点重挂载
- 自定义 resize 手柄用 pointer event 手动实现，冲突多

**改造要点：**

```tsx
// 去掉 storeNodes → setNodes 的 useEffect
// 改为：初始加载时 Zustand → setNodes 一次
// 后续所有变更通过 onNodesChange 同步回 Zustand

const Canvas = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  
  const { fetchNodesAndConnections, updateNode, updateNodeLocal } = useNodeStore()

  // ✅ 初始加载：Zustand → React Flow（仅一次）
  useEffect(() => {
    fetchNodesAndConnections(workflowId).then(({ nodes: sn, edges: se }) => {
      setNodes(sn)
      setEdges(se)
    })
  }, [workflowId])

  // ✅ 节点变化：React Flow → Zustand（仅同步位置/尺寸）
  const handleNodesChange = useCallback((changes: NodeChange[]) => {
    // 先让 React Flow 处理（drag/resize/select）
    setNodes(nds => applyNodeChanges(changes, nds))

    // 再把「位置变化」和「尺寸变化」同步回 Zustand
    changes.forEach(change => {
      if (change.type === 'position' && change.position) {
        updateNode(change.id, {
          positionX: change.position.x,
          positionY: change.position.y,
        })
      }
      if (change.type === 'dimensions' && change.dimensions) {
        updateNodeLocal(change.id, {
          width: change.dimensions.width,
          height: change.dimensions.height,
        })
      }
    })
  }, [])

  // ❌ 删除整个 useEffect([storeNodes, storeEdges])
  // 不再需要从 store 同步到 React Flow
}
```

**改动文件：** `frontend/src/components/canvas/Canvas.tsx`

---

### 2. `BaseNode.tsx` — 加入官方 NodeResizer

**现状问题：**
- 自定义 resize 手柄是 `div + pointer event`，容易被 React Flow 的 drag 拦截
- CSS 隐藏其他手柄的方案不稳定

**改造要点：**

```tsx
import { NodeResizer } from '@reactflow/node-resizer'
import '@reactflow/node-resizer/dist/style.css'

const BaseNode = ({ data, selected }) => {
  return (
    <div className="base-node" style={{ width: data.width, height: data.height }}>
      {/* ✅ 官方 Resize 控件：选中时显示 */}
      {selected && (
        <NodeResizer
          minWidth={200}
          minHeight={60}
          maxWidth={600}
          maxHeight={800}
          isVisible={selected}
          onResize={(_, params) => {
            // 直接写 data，不触发 setNodes
            data.width = params.width
            data.height = params.height
            if (data.onChange) {
              data.onChange('width', params.width)
              data.onChange('height', params.height)
            }
          }}
          onResizeEnd={(_, params) => {
            // resize 结束再同步到后端
            data.onChange?.('width', params.width)
            data.onChange?.('height', params.height)
          }}
        />
      )}

      {/* Header + Content 不变 */}
    </div>
  )
}
```

**安装依赖：**
```bash
npm install @reactflow/node-resizer
```

**改动文件：** `frontend/src/components/canvas/nodes/BaseNode.tsx`

---

### 3. 节点组件（`TextInputNode.tsx` 等）— data 直接突变

**现状问题：**
- `onChange('text', value)` → `updateNodeLocal` → Zustand `set({ nodes })` → Canvas useEffect → `setNodes()` → 节点重挂载

**改造要点：**

```tsx
// ✅ onChange 直接突变 data，不碰 Zustand nodes
const getOnChange = useCallback((nodeId: string) => {
  return (key: string, value: any) => {
    // 1. 直接改 data（通过 ref 拿到当前 nodes）
    const node = reactFlowInstance.current?.getNode(nodeId)
    if (node) {
      node.data[key] = value
      // 2. 强制触发 React 重渲染（只刷新该节点）
      setNodes(nds => [...nds])
    }

    // 3. 异步同步到 Zustand（防抖，不触发 UI 重挂载）
    debounceToZustand(nodeId, key, value)
  }
}, [])
```

> **注意：** 如果担心直接突变不够 React-idiomatic，可以用 Zustand 的 `shallow` 比较 + `replace` 策略，但关键是 **不要再 `setNodes(JSON.parse(JSON.stringify(nodes)))` 深拷贝**。

**更好的方案（推荐）：用 `useStore` 订阅单个 node 的 data**

```tsx
// 在节点组件内，订阅 Zustand 中该节点的 data（细粒度）
const nodeData = useNodeStore(
  s => s.nodes.find(n => n.id === data.id)?.data,
  shallow,  // 浅比较，data 不变就不重渲染
)

// 渲染用 nodeData，编辑时直接 mutate
```

**改动文件：**
- `frontend/src/components/canvas/nodes/TextInputNode.tsx`
- `frontend/src/components/canvas/nodes/AIImageNode.tsx`
- 其他自定义节点

---

### 4. `nodeStore.ts` — 改为同步层

**改造要点：**

```ts
// ✅ updateNodeLocal：只更新 Zustand 中的副本，不触发 React Flow 重挂载
updateNodeLocal: (nodeId, data) => {
  set(state => ({
    nodes: state.nodes.map(n =>
      n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n
    )
  }))
  // ❌ 不再调用 setNodes，React Flow 自己管
}
```

**注意：** 如果采用「节点组件内直接突变 data」的方案，`updateNodeLocal` 可以改为 **仅用于后端同步**，UI 层完全不经过它。

---

## 改动文件清单

| 文件 | 改动类型 | 要点 |
|------|----------|------|
| `Canvas.tsx` | **重构** | 删除 `useEffect([storeNodes])`，改为 `onNodesChange` 双向同步 |
| `BaseNode.tsx` | **重构** | 去掉自定义 resize 手柄，引入 `NodeResizer` |
| `TextInputNode.tsx` | 修改 | onChange 直接突变 data，或订阅 Zustand 细粒度 |
| `AIImageNode.tsx` | 修改 | 同上 |
| `nodeStore.ts` | 修改 | `updateNodeLocal` 不再触发 `setNodes` |
| `package.json` | 新增依赖 | `@reactflow/node-resizer` |

---

## 风险评估

| 风险 | 等级 | 缓解措施 |
|------|------|----------|
| `NodeResizer` 样式和现有 dark theme 冲突 | 低 | 覆盖 CSS 变量即可 |
| 直接突变 data 不符合 React 范式，后续维护困惑 | 中 | 加注释 + 用 `useStore` 细粒度订阅替代 |
| 初始加载时 Zustand → React Flow 的一次性同步可能丢字段 | 低 | 写单测覆盖 `convertToReactFlowNodes` |
| 去掉 `useEffect([storeNodes])` 后，后端推送更新无法到达 UI | 中 | 如果是实时协作场景，需要 WebSocket 直接调用 `setNodes` 而不是经过 Zustand |

---

## 推荐实施顺序

1. **先改 `Canvas.tsx`**：去掉 `useEffect([storeNodes])`，验证节点能正常渲染、drag 正常
2. **再加 `NodeResizer`**：改 `BaseNode.tsx`，验证 resize 不丢焦点
3. **最后改节点组件**：用 direct mutation 或细粒度订阅，验证输入不丢焦点
4. **回归测试**：新建工作流 → 添加节点 → 输入文本 → resize → 保存 → 重新打开

---

## 附录：为啥之前的补丁都失败了

| 补丁 | 失败原因 |
|------|----------|
| `useMemo` 包装 `nodeTypes` | 在模块层调用 Hook，违反 Rules of Hooks |
| `onChangeCache` ref | 没解决 **data 变化 → setNodes 全量替换** 的根本问题 |
| `posSame && labelSame` 跳过更新 | 漏掉了 `data` 字段，输入内容不变 |
| 加入 `dataSame` 浅比较 | resize 时 `onChange` 改 data → dataSame false → 还是替换 |
| 自定义 resize 手柄 + `nodrag` | React Flow 的 drag  detection 和 pointer event 冲突 |
| `NodeResizer` + CSS 隐藏 | `isVisible` 控制和 CSS `!important` 冲突，手柄显示逻辑不稳定 |

**根本解法只有一个：让 React Flow 自己管 nodes，别在 Zustand 和 React Flow 之间来回同步。**
