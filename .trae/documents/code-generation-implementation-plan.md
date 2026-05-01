# 代码生成系统实现计划

## 一、需求概述

在现有系统基础上，完善「设计稿生成代码」功能，并扩展代码生成模块以支持多种输入模式：
1. 在文本生成设计稿、图片生成设计稿模块的预览区增加「生成代码」按钮
2. 点击按钮将当前设计稿自动带入设计稿生成代码模块
3. 代码生成模块支持三种模式：设计稿→代码、文本→代码、图片→代码
4. 所有模式均接入真实的大模型API（阿里百炼 Qwen）
5. 生成结果分为回答部分（展示给用户）和代码部分（展示在右侧预览区）
6. 代码预览支持源码查看和页面渲染预览两种模式

## 二、当前状态分析

### 已有基础
- ✅ 三栏布局（侧边栏 + 对话区域 + 预览区域）已搭建
- ✅ 文本生成设计稿、图片生成设计稿已接入真实API
- ✅ DesignToCode 模块基础组件已存在，但使用伪数据
- ✅ CodePreview 组件支持源码查看和HTML预览
- ✅ 状态管理（Zustand）使用 session-based 架构
- ✅ 后端已有 `/ai/design-to-code` 接口，但返回伪数据
- ✅ 后端已有 QwenService 服务，支持文本和视觉模型

### 需要改动
- ⚠️ 后端 `/ai/design-to-code` 需接入真实大模型API
- ⚠️ 后端需新增文本生成代码、图片生成代码的API接口
- ⚠️ 前端 DesignToCode 模块需重构以支持三种输入模式
- ⚠️ 前端文本/图片生成设计稿模块需添加「生成代码」按钮
- ⚠️ 前端需新增设计稿缩略图预览组件
- ⚠️ CodePreview 组件需增强以支持 React/Vue 代码渲染预览
- ⚠️ API 服务层需新增代码生成相关接口

## 三、详细实现步骤

### 阶段一：后端 API 实现

#### 1.1 新增后端代码生成相关服务
**文件**: `d:\project\bisheV2\back-end\services\qwenService.js`

**新增功能**:
- `generateCodeFromDesign(designJson, framework)`: 设计稿→代码
- `generateCodeFromText(prompt, framework)`: 文本→代码  
- `generateCodeFromImages(prompt, imageBase64Array, framework)`: 图片→代码

**实现要点**:
- 构建专用的代码生成 Prompt，指定输出格式为多文件结构
- 要求模型同时返回 `replyText`（用户友好的回复）和 `code`（代码结构）
- 使用 JSON 格式约定返回结构，方便前端解析
- 复用现有的 `parseDesignJson` 等工具函数进行 JSON 解析

#### 1.2 修改现有 `/ai/design-to-code` 接口
**文件**: `d:\project\bisheV2\back-end\routes\ai.js` (L232-L473)

**改动**:
- 删除伪数据生成逻辑（L244-L464）
- 调用真实的 `qwenService.generateCodeFromDesign()` 
- 返回格式: `{ success: true, code: { type, files }, replyText }`

#### 1.3 新增 `/ai/text-to-code` 接口
**文件**: `d:\project\bisheV2\back-end\routes\ai.js`

**新增路由**:
```
POST /ai/text-to-code
Body: { text, framework }
Response: { success: true, code: { type, files }, replyText }
```

#### 1.4 新增 `/ai/image-to-code` 接口  
**文件**: `d:\project\bisheV2\back-end\routes\ai.js`

**新增路由**:
```
POST /ai/image-to-code
Body: FormData (images, text, framework)
Response: { success: true, code: { type, files }, replyText }
```

#### 1.5 导出新服务
**文件**: `d:\project\bisheV2\back-end\services\qwenService.js` (L749-L757)

**改动**: 在 module.exports 中新增导出三个代码生成函数

### 阶段二：前端 API 层

#### 2.1 新增 API 方法
**文件**: `d:\project\bisheV2\front-end\src\services\api.js`

**新增到 `aiAPI` 对象**:
- `textToCode(text, framework)`: 文本→代码
- `imageToCode(formData)`: 图片→代码
- 现有的 `designToCode` 保持不变（后端改动后自动生效）

### 阶段三：前端状态管理

#### 3.1 新增状态字段
**文件**: `d:\project\bisheV2\front-end\src\store\store.js`

**新增内容**:
- `codeGenerationMode`: 代码生成模式 ('design' | 'text' | 'image')
- `pendingDesignJson`: 从其他模块传入的待处理设计稿
- `pendingDesignThumbnail`: 设计稿缩略图（用于展示）

**新增方法**:
- `setCodeGenerationMode(mode)`
- `setPendingDesignJson(designJson)`
- `clearPendingDesign()`

### 阶段四：文本/图片生成设计稿模块添加「生成代码」按钮

#### 4.1 设计稿缩略图预览组件
**新建文件**: `d:\project\bisheV2\front-end\src\components\DesignThumbnail\DesignThumbnail.js`
**新建文件**: `d:\project\bisheV2\front-end\src\components\DesignThumbnail\DesignThumbnail.css`

**功能**:
- 将 Design JSON 渲染为小型缩略图预览
- 显示基础组件结构（容器、文本、按钮等）的简化视觉表示
- 点击可跳转到代码生成模块

#### 4.2 在预览区添加「生成代码」按钮
**文件**: `d:\project\bisheV2\front-end\src\components\PreviewArea\PreviewArea.js`

**改动**:
- 当 `previewState === 'design'` 且 `currentDesignJson` 存在时，在设计预览上方/旁边显示「生成代码」按钮
- 按钮样式：固定位置，醒目但不突兀
- 点击后：
  1. 将 `currentDesignJson` 保存到 store 的 `pendingDesignJson`
  2. 生成 `pendingDesignThumbnail`（设计稿的简化快照）
  3. 设置 `codeGenerationMode = 'design'`
  4. 导航到 `/design-to-code/{newSessionId}`

### 阶段五：重构 DesignToCode 模块

#### 5.1 支持三种输入模式
**文件**: `d:\project\bisheV2\front-end\src\components\Modules\DesignToCode\DesignToCode.js`

**重构内容**:

**模式一：设计稿→代码**（当前主要逻辑，需增强）
- 检查 `pendingDesignJson` 是否存在
- 如果存在，显示设计稿缩略图预览（带标识告知用户来源）
- 保留框架选择器
- 保留「生成代码」发送逻辑

**模式二：文本→代码**（新增）
- 当无 `pendingDesignJson` 时，显示文本输入区域
- 用户输入文本描述后，调用 `/ai/text-to-code` 接口
- 框架选择器保持不变

**模式三：图片→代码**（新增）
- 支持图片上传（复用 InputArea 的上传功能）
- 用户上传图片+文字描述后，调用 `/ai/image-to-code` 接口
- 框架选择器保持不变

**模式切换逻辑**:
- 通过 `codeGenerationMode` 状态控制显示
- 支持在三种模式间切换

#### 5.2 对话消息类型增强
**文件**: `d:\project\bisheV2\front-end\src\components\MessageList\MessageList.js`

**改动**:
- 支持 `type: 'code'` 消息的渲染
- 显示 AI 回复文本 + 代码生成状态提示
- 点击可切换到代码预览

### 阶段六：增强 CodePreview 组件

#### 6.1 增强代码渲染预览
**文件**: `d:\project\bisheV2\front-end\src\components\CodePreview\CodePreview.js`

**改动**:
- 保持现有的 HTML iframe 预览方式
- 对于 React/Vue 代码，新增基于 `sandpack` 或 `iframe + CDN` 的在线编译预览方案
- **推荐方案**: 使用 iframe + Babel standalone 实现 React 代码的浏览器端编译预览
- 源码查看保持不变

#### 6.2 代码预览模式优化
**文件**: `d:\project\bisheV2\front-end\src\components\CodePreview\CodePreview.css`

**改动**:
- 优化预览/源码切换的 UI
- 添加代码复制功能
- 优化多文件切换体验

### 阶段七：UI/UX 优化

#### 7.1 设计稿来源标识
**文件**: `d:\project\bisheV2\front-end\src\components\DesignToCode\DesignToCode.js`

**实现**:
- 当从设计稿进入代码生成时，在对话区域顶部显示来源标识
- 展示设计稿缩略图 + 标签「来自设计稿」
- 提供「更换设计稿」按钮

#### 7.2 加载状态优化
**多处文件**:

- 代码生成过程中的 loading 动画
- 骨架屏支持
- 生成进度提示

## 四、文件变更清单

### 新建文件
| 文件路径 | 用途 |
|----------|------|
| `front-end/src/components/DesignThumbnail/DesignThumbnail.js` | 设计稿缩略图预览组件 |
| `front-end/src/components/DesignThumbnail/DesignThumbnail.css` | 缩略图样式 |

### 修改文件（前端）
| 文件路径 | 改动内容 |
|----------|----------|
| `front-end/src/services/api.js` | 新增 textToCode、imageToCode API方法 |
| `front-end/src/store/store.js` | 新增代码生成相关状态和方法 |
| `front-end/src/components/PreviewArea/PreviewArea.js` | 添加「生成代码」按钮 |
| `front-end/src/components/Modules/DesignToCode/DesignToCode.js` | 重构支持三种模式 |
| `front-end/src/components/MessageList/MessageList.js` | 支持 code 类型消息 |
| `front-end/src/components/CodePreview/CodePreview.js` | 增强预览功能 |
| `front-end/src/components/CodePreview/CodePreview.css` | 优化预览样式 |

### 修改文件（后端）
| 文件路径 | 改动内容 |
|----------|----------|
| `back-end/services/qwenService.js` | 新增代码生成相关函数 |
| `back-end/routes/ai.js` | 修改 design-to-code，新增 text-to-code、image-to-code |

## 五、数据结构约定

### API 请求格式

**设计稿→代码**:
```json
{
  "designJson": { /* Design JSON 结构 */ },
  "framework": "react"
}
```

**文本→代码**:
```json
{
  "text": "创建一个登录页面...",
  "framework": "vue"
}
```

**图片→代码** (FormData):
```
images: [File, File, ...]
text: "根据图片生成代码..."
framework: "html"
```

### API 响应格式
```json
{
  "success": true,
  "replyText": "已为您生成 React 代码，包含 App.jsx 和 App.css 两个文件...",
  "code": {
    "type": "react",
    "files": [
      {
        "path": "App.jsx",
        "content": "/* 代码内容 */",
        "language": "javascript"
      },
      {
        "path": "App.css", 
        "content": "/* CSS 内容 */",
        "language": "css"
      }
    ]
  }
}
```

## 六、代码生成 Prompt 设计要点

### 系统 Prompt 核心要求
1. 明确指定输出格式为 JSON，包含 `replyText` 和 `files` 字段
2. 每个文件包含 `path`, `content`, `language` 字段
3. 要求代码完整可运行，包含必要的 import/export
4. 要求代码遵循目标框架最佳实践
5. 要求代码风格与传入的设计稿风格一致

### 设计稿→代码 额外要求
- 严格按照 Design JSON 的结构生成对应代码
- 保持组件层级关系
- 转换样式属性为目标框架的 CSS
- 添加适当的注释

## 七、注意事项

1. **Token 限制**: 代码生成 Prompt 需要控制长度，避免超出模型 token 上限
2. **JSON 解析**: 模型返回的代码结构需要可靠的 JSON 解析和容错处理
3. **跨模块数据传递**: 使用 store 的 `pendingDesignJson` 作为临时中转
4. **状态清理**: 切换模块/新建对话时需要清理 pending 状态
5. **预览安全**: iframe 预览需要使用 sandbox 属性限制权限
6. **性能优化**: 设计稿缩略图渲染需要避免性能瓶颈

## 八、实现优先级

| 优先级 | 任务 | 说明 |
|--------|------|------|
| P0 | 后端代码生成 API 实现 | 基础能力 |
| P0 | 前端 DesignToCode 模块重构 | 核心功能 |
| P0 | API 层新增接口 | 前后端联调 |
| P1 | 预览区「生成代码」按钮 | 用户体验 |
| P1 | 设计稿缩略图组件 | 来源标识 |
| P1 | CodePreview 增强 | 预览能力 |
| P2 | 消息类型增强 | 对话展示优化 |
| P2 | UI/UX 细节优化 | 体验打磨 |
