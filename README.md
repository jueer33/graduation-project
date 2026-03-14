# AI代码生成系统

一个面向前端开发的 AI 代码生成系统，实现从**自然语言/图片 → 结构化设计 → 前端代码**的完整闭环。

## 系统架构

### 核心设计原则

1. **Design JSON 是系统唯一真实数据源**
2. SVG / PNG / 前端代码均为 Design JSON 的派生结果
3. AI 的职责限定为：
   - 生成 Design JSON
   - 修改 Design JSON
   - 将 Design JSON 转换为前端代码
4. 所有可视化编辑行为，本质都是对 Design JSON 的结构化修改

### 技术栈

**前端：**
- React 18
- CSS (使用CSS变量管理主题)
- Context API (状态管理)

**后端：**
- Node.js + Express
- MongoDB (MongoDB Atlas 云数据库)
- JWT 认证

## 项目结构

```
bisheV2/
├── front-end/          # 前端应用
│   ├── src/
│   │   ├── components/ # React组件
│   │   ├── store/      # 状态管理
│   │   ├── services/   # API服务
│   │   └── ...
│   └── package.json
└── back-end/           # 后端应用
    ├── models/         # 数据库模型
    ├── routes/         # API路由
    ├── middleware/     # 中间件
    └── package.json
```

## 快速开始

### 后端设置

1. 进入后端目录：
```bash
cd back-end
```

2. 安装依赖：
```bash
npm install
```

3. 配置环境变量（`.env`文件已包含默认配置）

4. 启动服务器：
```bash
npm run dev  # 开发模式
# 或
npm start    # 生产模式
```

后端服务运行在 http://localhost:3001

### 前端设置

1. 进入前端目录：
```bash
cd front-end
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm start
```

前端应用运行在 http://localhost:3000

## 功能模块

### 1. 文本生成设计稿（Design JSON）

- 用户通过自然语言描述页面需求
- 后端返回结构化 Design JSON（伪数据）
- 前端自动渲染可视化设计预览

### 2. 图片生成设计稿（Design JSON）

- 用户上传 PNG / JPG 图片
- 后端返回对应 Design JSON（伪解析结果）
- 支持可视化预览和后续编辑

### 3. 设计稿生成前端代码

- 输入：当前 Design JSON
- 用户选择目标框架：React / Vue / HTML
- 后端返回多文件代码结构
- 前端支持代码预览运行和源码查看

### 4. 历史记录管理

- 记录用户输入、Design JSON、生成代码结果
- 支持恢复历史设计
- 继续编辑 / 生成代码

## 页面布局

### 三栏式布局

- **左侧**：功能侧边栏
  - 功能模块切换
  - 主题切换（亮色/暗色）
  - 用户信息与登出

- **中间**：对话区域
  - 根据当前功能模块显示对应界面
  - 支持消息列表和输入

- **右侧**：预览与编辑区域
  - Design JSON 可视化预览
  - 代码预览和源码查看
  - 支持拖拽调整宽度

### 响应式规则

- 宽屏：三栏布局
- 中等屏幕：侧边栏自动折叠
- 窄屏：隐藏预览区，仅显示对话区
- 极窄屏：侧边栏保持折叠状态

## API接口

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### AI功能
- `POST /api/ai/text-to-design` - 文本生成Design JSON
- `POST /api/ai/image-to-design` - 图片生成Design JSON
- `POST /api/ai/design-to-code` - Design JSON生成代码
- `POST /api/ai/chat` - 流式对话接口

### 历史记录
- `GET /api/history` - 获取历史记录列表
- `GET /api/history/:id` - 获取单条历史记录详情
- `POST /api/history` - 创建历史记录
- `PUT /api/history/:id` - 更新历史记录
- `DELETE /api/history/:id` - 删除历史记录

## 数据库设计

- **users** - 用户表
- **histories** - 历史记录表

所有数据关联基于 userId。

## 样式系统

使用 CSS 变量管理主题，支持：
- 亮色主题（默认）
- 暗色主题
- 紫色主色调（#8b5cf6）
- 响应式设计

## 开发说明

### 当前状态

- ✅ 前后端基础架构完成
- ✅ 用户认证系统
- ✅ AI接口（返回伪数据，可用于测试）
- ✅ 历史记录管理
- ✅ 前端UI组件
- ✅ 响应式布局
- ✅ 主题切换
- ✅ Design JSON 可视化预览
- ✅ 代码预览功能
- ⚠️ Design JSON 可视化编辑（待实现）

### 注意事项

1. AI相关接口目前返回**伪数据**，用于测试和演示
2. 所有前端功能**必须真实请求后端接口**
3. JSON预览部分可以先不实现（根据需求）
4. 数据库连接信息已配置在 `.env` 文件中

## 许可证

MIT

