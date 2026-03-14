# AI代码生成系统 - 后端

## 安装依赖

```bash
npm install
```

## 配置环境变量

复制 `.env.example` 为 `.env` 并配置数据库连接信息。

## 启动服务

开发模式（使用nodemon）：
```bash
npm run dev
```

生产模式：
```bash
npm start
```

服务默认运行在 http://localhost:3001

## API接口

### 用户认证
- POST /api/auth/register - 注册
- POST /api/auth/login - 登录
- GET /api/auth/me - 获取当前用户信息

### AI功能
- POST /api/ai/text-to-design - 文本生成Design JSON
- POST /api/ai/image-to-design - 图片生成Design JSON
- POST /api/ai/design-to-code - Design JSON生成代码
- POST /api/ai/chat - 流式对话接口

### 历史记录
- GET /api/history - 获取历史记录列表
- GET /api/history/:id - 获取单条历史记录
- POST /api/history - 创建历史记录
- PUT /api/history/:id - 更新历史记录
- DELETE /api/history/:id - 删除历史记录

