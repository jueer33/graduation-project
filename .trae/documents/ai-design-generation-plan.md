# AI 设计稿生成优化计划

## 问题分析

当前系统存在的问题：
1. **每次对话都返回相同的设计稿** - 无论用户输入什么，后端都返回固定的伪数据
2. **没有上下文关联** - 第二次对话时没有将当前设计稿状态传递给后端
3. **无法基于现有设计稿进行修改** - 用户无法通过后续对话迭代修改设计稿

## 目标

实现一个完整的、支持上下文的设计稿生成流程：

```
第一次发送: 用户文本 → 后端 → 大模型API → 生成Design JSON → 返回前端
第二次发送: 用户文本 + 当前Design JSON → 后端 → 大模型API → 修改后的Design JSON → 返回前端
```

## 核心概念

### 对话中的设计稿状态管理

一个对话（Conversation）对应一个设计稿：
- 第一次用户输入 → 生成新设计稿
- 后续用户输入 → 基于当前设计稿修改
- 设计稿在对话期间保持一致性

```
对话流程示意:
┌─────────────────────────────────────────────────────────────────┐
│                         一个完整对话                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  用户: "创建一个登录页面"                                          │
│       ↓                                                         │
│  AI:  返回 Design JSON v1 (登录页面)                              │
│       ↓                                                         │
│  [用户编辑设计稿...]                                               │
│       ↓                                                         │
│  用户: "把背景改成蓝色，添加一个注册链接"                            │
│       ↓                                                         │
│  AI:  返回 Design JSON v2 (基于v1修改: 蓝色背景 + 注册链接)          │
│       ↓                                                         │
│  [用户继续编辑...]                                                 │
│       ↓                                                         │
│  用户: "按钮改成圆角"                                              │
│       ↓                                                         │
│  AI:  返回 Design JSON v3 (基于v2修改: 圆角按钮)                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 实现方案

### 1. 后端 API 改造

#### 1.1 修改 `POST /api/ai/text-to-design` 接口

**请求体变化：**
```javascript
// 第一次请求（无当前设计稿）
{
  "text": "创建一个登录页面",
  "currentDesignJson": null  // 或省略
}

// 后续请求（有当前设计稿）
{
  "text": "把背景改成蓝色",
  "currentDesignJson": { /* 当前的 Design JSON */ }
}
```

**伪数据策略（用于毕业设计演示）：**
- 第一次请求：返回完整的登录页面 Design JSON
- 后续请求：基于 `currentDesignJson` 进行简单修改（如修改颜色、添加组件等），返回修改后的 JSON

#### 1.2 修改 `POST /api/ai/image-to-design` 接口

**请求体变化：**
```javascript
// FormData 格式
{
  "image": <File>,           // 图片文件（可选）
  "text": "描述文字",         // 文字描述（可选）
  "currentDesignJson": <JSON字符串>  // 当前设计稿（可选）
}
```

**伪数据策略：**
- 解析用户输入的关键词（如"蓝色"、"按钮"、"卡片"等）
- 如果有 `currentDesignJson`，基于它修改
- 如果没有，生成新的设计稿

### 2. 前端改造

#### 2.1 修改 API 调用

在 `TextToDesign.js` 和 `ImageToDesign.js` 中：

```javascript
// 发送请求时，传入当前设计稿
const response = await aiAPI.textToDesign(text, currentDesignJson);
```

#### 2.2 修改 API 服务层

在 `api.js` 中：

```javascript
textToDesign: (text, currentDesignJson) => 
  api.post('/ai/text-to-design', { text, currentDesignJson }),

imageToDesign: (formData, currentDesignJson) => {
  if (currentDesignJson) {
    formData.append('currentDesignJson', JSON.stringify(currentDesignJson));
  }
  return api.post('/ai/image-to-design', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}
```

### 3. 伪数据生成策略

为了演示效果，后端将根据用户输入的关键词生成不同的响应：

#### 3.1 关键词识别

```javascript
const keywords = {
  // 颜色相关
  colors: ['红色', '蓝色', '绿色', '黑色', '白色', '紫色', '橙色'],
  
  // 组件相关
  components: ['按钮', '输入框', '卡片', '图片', '标题', '文本'],
  
  // 布局相关
  layouts: ['居中', '左右', '上下', '网格', '列表'],
  
  // 操作相关
  actions: ['添加', '删除', '修改', '变大', '变小', '圆角']
};
```

#### 3.2 响应生成逻辑

```javascript
function generateResponse(text, currentDesignJson) {
  // 1. 解析用户意图
  const intent = parseIntent(text);
  
  // 2. 如果有当前设计稿，基于它修改
  if (currentDesignJson) {
    return modifyDesignJson(currentDesignJson, intent);
  }
  
  // 3. 如果没有，生成新的
  return createNewDesignJson(intent);
}
```

### 4. 数据结构规范

遵循 `json结构.md` 中定义的 Design JSON 规范：

```typescript
interface DesignJSON {
  version: "1.0";
  type: "page";
  metadata?: {
    title: string;
    description: string;
  };
  style: {
    width: string | number;
    height: string | number;
    backgroundColor: string;
    padding: number[];  // [上, 右, 下, 左]
  };
  children: ComponentNode[];
}

interface ComponentNode {
  id: string;
  type: "container" | "text" | "button" | "input" | "image" | "card";
  name?: string;
  style: {
    display?: "flex" | "block";
    flexDirection?: "row" | "column";
    justifyContent?: string;
    alignItems?: string;
    width?: string | number;
    height?: string | number;
    backgroundColor?: string;
    color?: string;
    fontSize?: number;
    padding?: number[];
    margin?: number[];
    borderRadius?: number;
    gap?: number;
    // ... 其他样式属性
  };
  text?: string;
  src?: string;
  placeholder?: string;
  children?: ComponentNode[];
}
```

## 具体任务清单

### 阶段一：后端 API 改造

#### 任务 1.1: 重构 `text-to-design` 接口
- [ ] 修改接口接收 `currentDesignJson` 参数
- [ ] 实现基于关键词的伪数据生成逻辑
- [ ] 实现设计稿修改逻辑（基于现有 JSON 修改）
- [ ] 提供至少 3 种不同类型的设计稿模板

#### 任务 1.2: 重构 `image-to-design` 接口
- [ ] 修改接口接收 `currentDesignJson` 参数
- [ ] 实现图片+文本的联合解析逻辑（伪实现）
- [ ] 复用 `text-to-design` 的生成逻辑

#### 任务 1.3: 创建伪数据生成器模块
- [ ] 创建 `mockDesignGenerator.js` 模块
- [ ] 实现关键词解析函数
- [ ] 实现设计稿模板库（登录页、注册页、仪表盘、卡片列表等）
- [ ] 实现设计稿修改函数

### 阶段二：前端 API 层改造

#### 任务 2.1: 修改 `api.js`
- [ ] 更新 `textToDesign` 方法，添加 `currentDesignJson` 参数
- [ ] 更新 `imageToDesign` 方法，添加 `currentDesignJson` 参数

### 阶段三：前端组件改造

#### 任务 3.1: 修改 `TextToDesign.js`
- [ ] 在 `handleSubmit` 中获取当前设计稿
- [ ] 将当前设计稿传递给 API 调用
- [ ] 确保新生成的设计稿正确更新到对话和状态中

#### 任务 3.2: 修改 `ImageToDesign.js`
- [ ] 在 `handleSubmit` 中获取当前设计稿
- [ ] 将当前设计稿传递给 API 调用
- [ ] 确保新生成的设计稿正确更新到对话和状态中

### 阶段四：测试验证

#### 任务 4.1: 功能测试
- [ ] 测试第一次生成设计稿
- [ ] 测试基于现有设计稿的修改
- [ ] 测试多次迭代修改
- [ ] 测试图片上传生成

#### 任务 4.2: 边界测试
- [ ] 测试空输入处理
- [ ] 测试无效设计稿 JSON 处理
- [ ] 测试大模型 API 超时处理

## 伪数据示例

### 示例 1: 登录页面（首次生成）

用户输入: "创建一个登录页面"

返回的 Design JSON:
```json
{
  "version": "1.0",
  "type": "page",
  "metadata": {
    "title": "登录页面",
    "description": "用户登录界面"
  },
  "style": {
    "width": "100%",
    "height": "100vh",
    "backgroundColor": "#f0f2f5",
    "display": "flex",
    "justifyContent": "center",
    "alignItems": "center",
    "padding": [0, 0, 0, 0]
  },
  "children": [
    {
      "id": "login-card",
      "type": "card",
      "name": "登录卡片",
      "style": {
        "display": "flex",
        "flexDirection": "column",
        "width": 400,
        "padding": [40, 40, 40, 40],
        "gap": 24,
        "backgroundColor": "#ffffff",
        "borderRadius": 12,
        "boxShadow": "0 4px 12px rgba(0,0,0,0.1)"
      },
      "children": [
        {
          "id": "title",
          "type": "text",
          "name": "标题",
          "text": "欢迎登录",
          "style": {
            "fontSize": 28,
            "fontWeight": "bold",
            "color": "#1a1a1a",
            "textAlign": "center"
          }
        },
        {
          "id": "username-input",
          "type": "input",
          "name": "用户名输入框",
          "placeholder": "请输入用户名",
          "style": {
            "width": "100%",
            "height": 44,
            "padding": [0, 16, 0, 16],
            "border": "1px solid #d9d9d9",
            "borderRadius": 8,
            "fontSize": 14
          }
        },
        {
          "id": "password-input",
          "type": "input",
          "name": "密码输入框",
          "placeholder": "请输入密码",
          "style": {
            "width": "100%",
            "height": 44,
            "padding": [0, 16, 0, 16],
            "border": "1px solid #d9d9d9",
            "borderRadius": 8,
            "fontSize": 14
          }
        },
        {
          "id": "login-btn",
          "type": "button",
          "name": "登录按钮",
          "text": "登 录",
          "style": {
            "width": "100%",
            "height": 44,
            "backgroundColor": "#1890ff",
            "color": "#ffffff",
            "border": "none",
            "borderRadius": 8,
            "fontSize": 16,
            "fontWeight": 500,
            "cursor": "pointer"
          }
        }
      ]
    }
  ]
}
```

### 示例 2: 基于现有设计稿修改

用户输入: "把背景改成深蓝色，按钮改成绿色"
当前设计稿: [上面的登录页面 JSON]

修改逻辑:
1. 解析出关键词: "背景" + "深蓝色", "按钮" + "绿色"
2. 遍历 Design JSON，找到对应元素
3. 修改 `style.backgroundColor` 和 `style.backgroundColor`

返回的 Design JSON:
```json
{
  "version": "1.0",
  "type": "page",
  "metadata": {
    "title": "登录页面",
    "description": "用户登录界面"
  },
  "style": {
    "width": "100%",
    "height": "100vh",
    "backgroundColor": "#001529",
    "display": "flex",
    "justifyContent": "center",
    "alignItems": "center",
    "padding": [0, 0, 0, 0]
  },
  "children": [
    {
      "id": "login-card",
      "type": "card",
      "name": "登录卡片",
      "style": {
        "display": "flex",
        "flexDirection": "column",
        "width": 400,
        "padding": [40, 40, 40, 40],
        "gap": 24,
        "backgroundColor": "#ffffff",
        "borderRadius": 12,
        "boxShadow": "0 4px 12px rgba(0,0,0,0.1)"
      },
      "children": [
        {
          "id": "title",
          "type": "text",
          "name": "标题",
          "text": "欢迎登录",
          "style": {
            "fontSize": 28,
            "fontWeight": "bold",
            "color": "#1a1a1a",
            "textAlign": "center"
          }
        },
        {
          "id": "username-input",
          "type": "input",
          "name": "用户名输入框",
          "placeholder": "请输入用户名",
          "style": {
            "width": "100%",
            "height": 44,
            "padding": [0, 16, 0, 16],
            "border": "1px solid #d9d9d9",
            "borderRadius": 8,
            "fontSize": 14
          }
        },
        {
          "id": "password-input",
          "type": "input",
          "name": "密码输入框",
          "placeholder": "请输入密码",
          "style": {
            "width": "100%",
            "height": 44,
            "padding": [0, 16, 0, 16],
            "border": "1px solid #d9d9d9",
            "borderRadius": 8,
            "fontSize": 14
          }
        },
        {
          "id": "login-btn",
          "type": "button",
          "name": "登录按钮",
          "text": "登 录",
          "style": {
            "width": "100%",
            "height": 44,
            "backgroundColor": "#52c41a",
            "color": "#ffffff",
            "border": "none",
            "borderRadius": 8,
            "fontSize": 16,
            "fontWeight": 500,
            "cursor": "pointer"
          }
        }
      ]
    }
  ]
}
```

## 文件变更清单

### 后端文件
1. `back-end/routes/ai.js` - 重构 AI 接口
2. `back-end/utils/mockDesignGenerator.js` - 新增伪数据生成器（可选提取）

### 前端文件
1. `front-end/src/services/api.js` - 修改 API 调用方法
2. `front-end/src/components/Modules/TextToDesign/TextToDesign.js` - 传入当前设计稿
3. `front-end/src/components/Modules/ImageToDesign/ImageToDesign.js` - 传入当前设计稿

## 验收标准

- [ ] 第一次发送对话，后端返回完整的设计稿 JSON
- [ ] 第二次及以后发送对话，后端基于当前设计稿返回修改后的 JSON
- [ ] 设计稿修改能正确反映在预览区
- [ ] 支持常见的修改指令（颜色、添加组件、布局调整等）
- [ ] 图片上传功能同样支持上下文
- [ ] 所有修改都能正确保存到历史记录
