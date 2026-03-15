# Design JSON 结构规范

> 本文档定义后端返回给前端的 Design JSON 数据结构，用于 AI 生成设计稿的渲染。

---

## 根结构

```json
{
  "version": "1.0",
  "type": "page",
  "isGenerated": true,
  "metadata": {
    "title": "页面标题",
    "description": "页面描述"
  },
  "style": {
    "width": "100%",
    "height": "100vh",
    "backgroundColor": "#f5f5f5",
    "padding": [0, 0, 0, 0]
  },
  "children": [
    // 组件节点数组
  ]
}
```

---

## 组件节点 (ComponentNode)

```json
{
  "id": "唯一标识符",
  "type": "组件类型",
  "name": "组件名称",
  "style": {
    // 样式属性
  },
  "content": "文本内容（推荐使用）",
  "text": "文本内容（兼容旧版本）",
  "src": "图片地址",
  "placeholder": "占位提示",
  "children": []
}
```

### 组件类型 (type)

| 类型 | 用途 | 特有字段 |
|------|------|----------|
| `container` | 容器/布局 | `children` |
| `text` | 文本 | `text` |
| `button` | 按钮 | `text` |
| `input` | 输入框 | `placeholder` |
| `image` | 图片 | `src`, `alt` |
| `card` | 卡片 | `children` |
| `divider` | 分割线 | 无 |

---

## 样式属性 (style)

```json
{
  "display": "flex",
  "flexDirection": "row | column",
  "justifyContent": "flex-start | center | flex-end | space-between | space-around",
  "alignItems": "flex-start | center | flex-end | stretch",
  "flexWrap": "nowrap | wrap",
  "gap": 16,
  
  "width": "100% | 400 | auto",
  "height": "100vh | 300 | auto",
  
  "padding": [上, 右, 下, 左],
  "margin": [上, 右, 下, 左],
  
  "backgroundColor": "#ffffff",
  "borderRadius": 8,
  "border": "1px solid #d9d9d9",
  "boxShadow": "0 2px 8px rgba(0,0,0,0.1)",
  
  "color": "#333333",
  "fontSize": 14,
  "fontWeight": "normal | bold | 500",
  "textAlign": "left | center | right",
  "lineHeight": 1.5,
  
  "position": "static | relative | absolute",
  "top": 0,
  "left": 0,
  "zIndex": 1,
  
  "opacity": 1,
  "cursor": "default | pointer"
}
```

---

## 完整示例

### 示例1：登录页面

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

### 示例2：导航栏 + 内容区

```json
{
  "version": "1.0",
  "type": "page",
  "metadata": {
    "title": "首页",
    "description": "网站首页"
  },
  "style": {
    "width": "100%",
    "minHeight": "100vh",
    "backgroundColor": "#ffffff"
  },
  "children": [
    {
      "id": "navbar",
      "type": "container",
      "name": "导航栏",
      "style": {
        "display": "flex",
        "flexDirection": "row",
        "justifyContent": "space-between",
        "alignItems": "center",
        "width": "100%",
        "height": 64,
        "padding": [0, 48, 0, 48],
        "backgroundColor": "#001529",
        "gap": 32
      },
      "children": [
        {
          "id": "logo",
          "type": "text",
          "name": "Logo",
          "text": "MyApp",
          "style": {
            "fontSize": 20,
            "fontWeight": "bold",
            "color": "#ffffff"
          }
        },
        {
          "id": "nav-links",
          "type": "container",
          "name": "导航链接",
          "style": {
            "display": "flex",
            "flexDirection": "row",
            "gap": 32
          },
          "children": [
            {
              "id": "nav-home",
              "type": "text",
              "name": "首页链接",
              "text": "首页",
              "style": {
                "fontSize": 14,
                "color": "#ffffff",
                "cursor": "pointer"
              }
            },
            {
              "id": "nav-about",
              "type": "text",
              "name": "关于链接",
              "text": "关于",
              "style": {
                "fontSize": 14,
                "color": "rgba(255,255,255,0.65)",
                "cursor": "pointer"
              }
            }
          ]
        }
      ]
    },
    {
      "id": "hero-section",
      "type": "container",
      "name": "主视觉区",
      "style": {
        "display": "flex",
        "flexDirection": "column",
        "justifyContent": "center",
        "alignItems": "center",
        "width": "100%",
        "height": 500,
        "padding": [80, 48, 80, 48],
        "backgroundColor": "#f0f5ff",
        "gap": 24
      },
      "children": [
        {
          "id": "hero-title",
          "type": "text",
          "name": "主标题",
          "text": "构建更好的产品",
          "style": {
            "fontSize": 48,
            "fontWeight": "bold",
            "color": "#1a1a1a",
            "textAlign": "center"
          }
        },
        {
          "id": "hero-desc",
          "type": "text",
          "name": "描述文字",
          "text": "使用我们的工具，快速构建现代化的 Web 应用",
          "style": {
            "fontSize": 18,
            "color": "#666666",
            "textAlign": "center",
            "lineHeight": 1.6
          }
        },
        {
          "id": "hero-btn",
          "type": "button",
          "name": "CTA按钮",
          "text": "立即开始",
          "style": {
            "padding": [12, 32, 12, 32],
            "backgroundColor": "#1890ff",
            "color": "#ffffff",
            "border": "none",
            "borderRadius": 6,
            "fontSize": 16,
            "cursor": "pointer"
          }
        }
      ]
    }
  ]
}
```

### 示例3：卡片列表

```json
{
  "version": "1.0",
  "type": "page",
  "metadata": {
    "title": "产品列表",
    "description": "展示产品卡片列表"
  },
  "style": {
    "width": "100%",
    "minHeight": "100vh",
    "backgroundColor": "#f5f5f5",
    "padding": [40, 48, 40, 48]
  },
  "children": [
    {
      "id": "page-title",
      "type": "text",
      "name": "页面标题",
      "text": "热门产品",
      "style": {
        "fontSize": 32,
        "fontWeight": "bold",
        "color": "#1a1a1a",
        "margin": [0, 0, 32, 0]
      }
    },
    {
      "id": "card-grid",
      "type": "container",
      "name": "卡片网格",
      "style": {
        "display": "flex",
        "flexDirection": "row",
        "flexWrap": "wrap",
        "gap": 24,
        "justifyContent": "flex-start"
      },
      "children": [
        {
          "id": "card-1",
          "type": "card",
          "name": "产品卡片1",
          "style": {
            "display": "flex",
            "flexDirection": "column",
            "width": 300,
            "backgroundColor": "#ffffff",
            "borderRadius": 12,
            "boxShadow": "0 2px 8px rgba(0,0,0,0.08)",
            "overflow": "hidden"
          },
          "children": [
            {
              "id": "card-1-img",
              "type": "image",
              "name": "产品图片",
              "src": "https://via.placeholder.com/300x200",
              "alt": "产品图片",
              "style": {
                "width": "100%",
                "height": 200,
                "objectFit": "cover"
              }
            },
            {
              "id": "card-1-content",
              "type": "container",
              "name": "卡片内容",
              "style": {
                "display": "flex",
                "flexDirection": "column",
                "padding": [20, 20, 20, 20],
                "gap": 12
              },
              "children": [
                {
                  "id": "card-1-title",
                  "type": "text",
                  "name": "产品名称",
                  "text": "智能手表 Pro",
                  "style": {
                    "fontSize": 18,
                    "fontWeight": "bold",
                    "color": "#1a1a1a"
                  }
                },
                {
                  "id": "card-1-price",
                  "type": "text",
                  "name": "价格",
                  "text": "¥1,999",
                  "style": {
                    "fontSize": 20,
                    "fontWeight": "bold",
                    "color": "#f5222d"
                  }
                },
                {
                  "id": "card-1-btn",
                  "type": "button",
                  "name": "购买按钮",
                  "text": "立即购买",
                  "style": {
                    "width": "100%",
                    "height": 40,
                    "backgroundColor": "#1890ff",
                    "color": "#ffffff",
                    "border": "none",
                    "borderRadius": 6,
                    "fontSize": 14,
                    "cursor": "pointer",
                    "margin": [8, 0, 0, 0]
                  }
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

---

## 调用大模型时的 Prompt 示例

```
请根据以下描述生成 Design JSON 结构：

描述：{用户输入}

要求：
1. 返回标准的 JSON 格式，不要包含任何注释
2. 根节点 type 必须是 "page"
3. 每个组件必须有唯一的 id（使用有意义的名称，如 "navbar", "login-btn"）
4. 使用 flex 布局实现页面结构
5. 颜色使用十六进制格式（如 #1890ff）
6. 尺寸使用数字（单位默认为 px）或百分比字符串
7. padding 和 margin 使用 [上, 右, 下, 左] 数组格式
8. 确保生成的 JSON 可以被直接解析

请只返回 JSON 数据，不要返回其他内容。
```

---

## 字段说明速查

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| version | string | 是 | 版本号，固定 "1.0" |
| type | string | 是 | 文档类型，固定 "page" |
| isGenerated | boolean | 否 | 是否是AI生成的，true表示AI生成，内容不可编辑 |
| metadata | object | 否 | 页面元数据 |
| style | object | 是 | 页面/组件样式 |
| children | array | 否 | 子组件数组 |
| id | string | 是 | 唯一标识符 |
| name | string | 否 | 组件名称（用于显示） |
| content | string | 否 | 文本内容（text/button/card类型组件使用content字段） |
| text | string | 否 | 文本内容（同content，用于兼容） |
| src | string | 否 | 图片地址（image 类型） |
| placeholder | string | 否 | 占位提示（input 类型） |
