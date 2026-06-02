# 工作流画布平台 (Workflow Canvas Platform)

一个多用户工作流式画布管理平台，类似于ComfyUI和Coze，支持可视化节点编排和AI模型调用。

## 功能特性

✅ **多用户系统**：用户注册、登录、权限管理
✅ **可视化画布**：基于React Flow的节点编辑器，支持拖拽、连接、缩放
✅ **多样化节点**：文本输入、LLM调用、图片生成等
✅ **实时执行**：WebSocket实时推送执行状态
✅ **工作流管理**：保存、加载、删除工作流

## 技术栈

### 前端
- React 18 + TypeScript
- React Flow（节点画布）
- Material-UI（UI组件）
- Zustand（状态管理）
- Vite（构建工具）

### 后端
- Node.js + Express + TypeScript
- Prisma（ORM）
- PostgreSQL（数据库）
- Redis（缓存）
- Socket.IO（WebSocket）

### AI模型
- OpenAI GPT-4/3.5
- Anthropic Claude
- 百度文心一言
- 阿里通义千问

## 快速开始

### 1. 安装依赖

```bash
# 前端
cd frontend
npm install

# 后端
cd backend
npm install
```

### 2. 配置环境变量

```bash
# 复制环境变量示例
cp .env.example .env

# 编辑.env文件，填写必要的配置
# - DATABASE_URL（数据库连接）
# - JWT_SECRET（JWT密钥）
# - OPENAI_API_KEY（OpenAI API密钥，可选）
```

### 3. 启动数据库

```bash
# 使用Docker启动PostgreSQL和Redis
docker-compose up -d postgres redis

# 运行数据库迁移
cd backend
npx prisma migrate dev

# 生成Prisma Client
npx prisma generate
```

### 4. 启动开发服务器

```bash
# 启动后端（终端1）
cd backend
npm run dev

# 启动前端（终端2）
cd frontend
npm run dev
```

### 5. 访问应用

打开浏览器访问：http://localhost:3000

## 项目结构

```
workflow-canvas/
├── frontend/          # 前端代码
│   ├── src/
│   │   ├── components/  # React组件
│   │   ├── pages/       # 页面
│   │   ├── stores/      # Zustand状态管理
│   │   ├── services/    # API服务
│   │   └── types/       # TypeScript类型定义
│   └── package.json
├── backend/           # 后端代码
│   ├── src/
│   │   ├── controllers/ # 控制器
│   │   ├── services/    # 业务逻辑
│   │   ├── routes/      # 路由
│   │   ├── sockets/     # WebSocket
│   │   └── utils/       # 工具函数
│   ├── prisma/          # 数据库Schema
│   └── package.json
├── docker-compose.yml # Docker编排
└── README.md
```

## API文档

### 认证相关
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户信息

### 工作流相关
- `GET /api/workflows` - 获取工作流列表
- `POST /api/workflows` - 创建工作流
- `GET /api/workflows/:id` - 获取工作流详情
- `PUT /api/workflows/:id` - 更新工作流
- `DELETE /api/workflows/:id` - 删除工作流
- `POST /api/workflows/:id/execute` - 执行工作流

### 节点相关
- `POST /api/workflows/:id/nodes` - 添加节点
- `PUT /api/nodes/:id` - 更新节点
- `DELETE /api/nodes/:id` - 删除节点

## 开发进度

### ✅ 已完成
- [x] 项目基础设施（T01）
- [x] 用户认证系统（T02）
- [x] 工作流核心功能（T03）
- [x] 执行引擎基础（T04）

### 🚧 进行中
- [ ] 高级功能（T05）：模板系统、撤销重做、文件上传

### 📋 待实现
- [ ] 完整的AI模型集成（Claude、文心一言等）
- [ ] 图片生成功能
- [ ] 工作流模板
- [ ] 撤销/重做
- [ ] 文件上传
- [ ] 主题切换

## 贡献指南

欢迎提交Issue和Pull Request！

## 许可证

MIT License

---

**创建日期**：2026-06-01  
**最后更新**：2026-06-01
