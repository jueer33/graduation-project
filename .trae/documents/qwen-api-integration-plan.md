# 千问大模型 API 集成计划

## 项目背景

当前系统使用伪数据生成器 (`mockDesignGenerator.js`) 模拟 AI 生成 Design JSON。现在需要接入真实的千问大模型 API，实现真正的 AI 代码生成功能。

## 需求分析

### 核心需求
1. **后端对接千问大模型 API**：使用 OpenAI SDK 调用通义千问模型
2. **对话上下文管理**：同一历史记录下保持对话连续性，新对话创建新会话
3. **Design JSON 生成**：大模型返回符合规范的 JSON 数据结构
4. **前端设计稿共享**：同一历史记录下的所有对话共享同一个设计稿预览

### 技术要点
- API Key: `sk-f7750489743144468898817e6426846a`
- Base URL: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- 模型: `qwen-turbo` (支持流式输出)
- 返回格式: 符合 `json结构.md` 规范的 Design JSON

---

## 实施方案

### 第一阶段：后端改造

#### 1.1 安装依赖
在 `back-end/package.json` 中添加：
```json
{
  "dependencies": {
    "openai": "^4.0.0"
  }
}
```

#### 1.2 创建千问 API 服务模块

**文件**: `back-end/services/qwenService.js`

功能：
- 初始化 OpenAI 客户端
- 构建系统 Prompt（包含 Design JSON 结构规范）
- 调用千问 API 生成 Design JSON
- 解析和验证返回结果
- 流式响应支持

**Prompt 设计**：
```
你是一个专业的前端 UI 设计师和开发者。请根据用户的需求生成 Design JSON 结构。

Design JSON 结构规范：
1. 根节点必须包含：version(固定"1.0")、type(固定"page")、style、children
2. 组件类型支持：container、card、text、button、input、image、divider
3. 样式属性使用 camelCase 命名
4. padding/margin 使用 [上,右,下,左] 数组格式
5. 颜色使用十六进制格式（如 #1890ff）
6. 每个组件必须有唯一 id

请只返回 JSON 数据，不要包含任何解释文字或 markdown 代码块标记。
```

#### 1.3 修改 AI 路由

**文件**: `back-end/routes/ai.js`

修改内容：
1. `POST /text-to-design` - 文本生成 Design JSON
   - 接收 `text`, `currentDesignJson`, `conversationId` 参数
   - 根据 `conversationId` 获取对话历史
   - 调用千问服务生成 Design JSON
   - 返回生成的 Design JSON 和对话响应文本

2. `POST /image-to-design` - 图片生成 Design JSON
   - 接收图片文件和文字描述
   - 将图片转为 base64 或多模态输入格式
   - 调用千问服务生成 Design JSON

3. `POST /chat` - 流式对话接口
   - 支持 SSE (Server-Sent Events) 流式返回
   - 实时返回 AI 思考过程和最终 Design JSON

4. 新增 `POST /chat-with-stream` - 专门用于流式生成 Design JSON

#### 1.4 对话上下文管理

**方案**：在后端维护对话历史

- 使用内存存储（Map）临时存储对话上下文
- Key: `userId_conversationId`
- Value: 消息数组 `{role: 'user'|'assistant', content: string, designJson?: object}`

**数据流**：
```
用户发送消息 -> 后端获取历史消息 -> 构建完整 Prompt -> 调用千问 API 
-> 解析返回的 Design JSON -> 更新对话历史 -> 返回给前端
```

### 第二阶段：前端改造

#### 2.1 修改 Store 状态管理

**文件**: `front-end/src/store/store.js`

新增状态：
```javascript
// 当前会话 ID（用于标识同一历史记录下的对话）
const [currentSessionId, setCurrentSessionId] = useState(null);

// 当前共享的设计稿（同一历史记录下所有对话共用）
const [sharedDesignJson, setSharedDesignJson] = useState(null);
```

修改逻辑：
- 新建对话时生成新的 `sessionId`
- 恢复历史记录时沿用原有的 `sessionId`
- 所有对话消息共享同一个 `sharedDesignJson`

#### 2.2 修改 TextToDesign 组件

**文件**: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

修改内容：
1. 发送请求时携带 `sessionId`
2. 接收响应后更新共享设计稿而非消息级设计稿
3. 移除每条消息单独存储 designJson 的逻辑

#### 2.3 调整预览编辑位置

**需求**：将预览编辑区域从对话消息卡片中移出，放到页面顶部或底部固定位置。

**方案**：
- 在 `ConversationArea` 或 `TextToDesign` 组件中添加固定预览区域
- 预览区域显示当前共享的设计稿
- 编辑操作直接修改共享设计稿

**UI 调整**：
```
┌─────────────────────────────────────────┐
│  设计稿预览与编辑区域（固定顶部）          │
├─────────────────────────────────────────┤
│                                         │
│           对话消息列表                   │
│                                         │
├─────────────────────────────────────────┤
│           输入框区域                     │
└─────────────────────────────────────────┘
```

#### 2.4 修改 API 服务

**文件**: `front-end/src/services/api.js`

修改 `aiAPI.textToDesign`：
```javascript
textToDesign: (text, sessionId, currentDesignJson = null) => 
  api.post('/ai/text-to-design', { text, sessionId, currentDesignJson })
```

新增流式接口：
```javascript
streamDesign: (text, sessionId, onChunk) => {
  // 使用 EventSource 或 fetch + ReadableStream
}
```

### 第三阶段：数据格式适配

#### 3.1 千问返回格式处理

千问模型可能返回 markdown 格式的 JSON：
```markdown
```json
{...}
```
```

需要在后端解析：
1. 去除 markdown 代码块标记
2. 提取纯 JSON 字符串
3. 验证 JSON 结构是否符合规范
4. 转换字段名（如将 `content` 转为 `text` 以适配前端）

#### 3.2 错误处理

- API 调用失败时返回友好的错误信息
- JSON 解析失败时尝试修复或返回默认模板
- 网络超时处理

---

## 详细任务列表

### 后端任务

1. **安装 OpenAI SDK**
   - 在 back-end 目录执行 `npm install openai`
   - 在 `.env` 文件添加 `DASHSCOPE_API_KEY`

2. **创建千问服务模块** (`back-end/services/qwenService.js`)
   - 初始化 OpenAI 客户端
   - 实现 `generateDesignJson(prompt, history, currentDesignJson)` 方法
   - 实现 `streamDesignJson(prompt, history, currentDesignJson, onChunk)` 方法
   - 实现 JSON 解析和验证函数

3. **创建对话上下文管理器** (`back-end/utils/conversationManager.js`)
   - 使用 Map 存储对话历史
   - 实现 `getHistory(sessionId)` 方法
   - 实现 `addMessage(sessionId, message)` 方法
   - 实现 `clearHistory(sessionId)` 方法

4. **修改 AI 路由** (`back-end/routes/ai.js`)
   - 更新 `POST /text-to-design` 接口
   - 更新 `POST /image-to-design` 接口
   - 更新 `POST /chat` 流式接口
   - 添加错误处理和日志

5. **Prompt 优化**
   - 编写详细的系统 Prompt
   - 添加 Design JSON 示例
   - 测试并调整 Prompt 以获得更好的生成效果

### 前端任务

1. **修改 Store** (`front-end/src/store/store.js`)
   - 添加 `currentSessionId` 状态
   - 添加 `sharedDesignJson` 状态
   - 修改 `addConversation` 逻辑
   - 添加 `setSharedDesignJson` 方法

2. **修改 TextToDesign 组件**
   - 集成共享设计稿逻辑
   - 修改 `handleSubmit` 方法
   - 添加会话 ID 生成逻辑

3. **调整预览区域位置**
   - 在 `TextToDesign` 顶部添加固定预览区域
   - 移除 `MessageList` 中的设计稿预览按钮
   - 预览区域直接绑定 `sharedDesignJson`

4. **修改 API 调用**
   - 更新 `aiAPI.textToDesign` 参数
   - 添加流式响应处理（可选）

5. **历史记录恢复逻辑**
   - 恢复时设置正确的 `sessionId`
   - 恢复 `sharedDesignJson`

---

## 接口设计

### 后端接口

#### POST /api/ai/text-to-design

**请求体**：
```json
{
  "text": "创建一个登录页面",
  "sessionId": "session-123456",
  "currentDesignJson": { ... }
}
```

**响应**：
```json
{
  "success": true,
  "designJson": { ... },
  "replyText": "已为您创建登录页面，包含用户名和密码输入框...",
  "sessionId": "session-123456",
  "title": "登录页面设计"
}
```

#### POST /api/ai/chat (流式)

**请求体**：
```json
{
  "text": "把按钮改成红色",
  "sessionId": "session-123456",
  "currentDesignJson": { ... }
}
```

**响应** (SSE)：
```
data: {"type": "reasoning", "content": "正在思考..."}

data: {"type": "content", "content": "好的，我来帮您修改按钮颜色"}

data: {"type": "design", "designJson": {...}}

data: {"type": "complete"}
```

---

## 文件变更清单

### 后端
- `back-end/package.json` - 添加 openai 依赖
- `back-end/.env` - 添加 DASHSCOPE_API_KEY
- `back-end/services/qwenService.js` - 新建
- `back-end/utils/conversationManager.js` - 新建
- `back-end/routes/ai.js` - 大幅修改

### 前端
- `front-end/src/store/store.js` - 修改
- `front-end/src/components/Modules/TextToDesign/TextToDesign.js` - 修改
- `front-end/src/components/Modules/TextToDesign/TextToDesign.css` - 修改
- `front-end/src/services/api.js` - 修改
- `front-end/src/components/MessageList/MessageList.js` - 修改（移除预览按钮）

---

## 测试计划

1. **单元测试**
   - 测试千问服务模块的 JSON 解析
   - 测试对话上下文管理器

2. **集成测试**
   - 测试完整的文本生成流程
   - 测试对话上下文连续性
   - 测试历史记录恢复

3. **边界测试**
   - API 超时处理
   - 返回格式错误处理
   - 大模型返回非 JSON 的处理

---

## 风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 千问 API 返回格式不稳定 | 中 | 高 | 添加多重解析逻辑，包含正则提取 |
| API 调用超时 | 中 | 中 | 设置合理的超时时间，添加重试机制 |
| Token 消耗过快 | 低 | 中 | 优化 Prompt，减少不必要的上下文 |
| 并发会话管理问题 | 低 | 中 | 使用 Redis 替代内存存储（后续优化） |

---

## 后续优化方向

1. 使用 Redis 持久化对话上下文，支持多实例部署
2. 添加流式响应，提升用户体验
3. 实现图片多模态输入（千问支持）
4. 添加生成结果的缓存机制
5. 支持更多千问模型（如 qwen-max 用于复杂设计）
