# UI样式调整计划

## 需求概述
对整体UI样式进行全面调整，提升视觉体验和一致性。

## 调整项目清单

### 1. 字体层级重新设计
**目标**: 将全局字体大小从单一的13-14px调整为清晰的层级结构

**具体调整**:
- 在 `index.css` 中添加CSS变量定义新的字体层级
  - `--font-xs: 12px` - 辅助文字、次要信息
  - `--font-sm: 14px` - 正文、按钮文字
  - `--font-md: 16px` - 小标题、导航
  - `--font-lg: 18px` - 区块标题
  - `--font-xl: 24px` - 页面主标题
- 修改 `body` 默认字体大小为 `--font-sm` (14px)
- 更新各组件使用对应的字体层级变量

---

### 2. 新建对话按钮样式重设计
**目标**: 与整体风格统一

**具体调整**:
- 在 `ConversationArea.css` 中调整 `.new-conversation-btn` 样式
  - 调整按钮高度和内边距，使其更符合16px层级的文字大小
  - 使用 `--font-md` 变量
  - 添加图标与文字的间距
  - 优化圆角和阴影效果
- 在 `ConversationArea.js` 中移除"➕"符号，改用SVG图标或纯文字"新建对话"

---

### 3. 组件库添加标题
**目标**: 明确组件库区域功能

**具体调整**:
- 在 `VisualEditor.css` 的 `.visual-editor-sidebar` 中添加标题样式
- 在 `VisualEditor.js` 中组件库区域添加标题元素 `<h3>组件库</h3>`

---

### 4. 属性面板与画布之间添加拖拽分隔线
**目标**: 允许用户调整属性面板宽度

**具体调整**:
- 在 `VisualEditor.css` 中:
  - 添加 `.visual-editor-canvas-resize-handle` 样式（垂直分隔线）
  - 添加分隔线拖拽交互效果
- 在 `VisualEditor.js` 中:
  - 在画布区域和属性面板之间添加分隔线元素
  - 添加拖拽调整宽度的逻辑（类似Layout中的实现）

---

### 5. 调整对话区域与预览区域的默认宽度比例
**目标**: 对话区域1/3，预览区域2/3

**具体调整**:
- 在 `Layout.js` 中:
  - 将初始 `conversationWidth` 从 50 改为 33（33%）
  - 调整最小宽度限制为 20%，最大为 50%

---

### 6. 登录成功后自动跳转到主页面
**目标**: 改善用户体验

**具体调整**:
- 在 `Login.js` 中:
  - 导入 `useNavigate` 钩子
  - 在 `loginUser` 调用成功后添加 `navigate('/')` 或 `navigate('/text-to-design')`

---

## 实现顺序

1. 修改 `index.css` 添加字体层级变量
2. 修改 `ConversationArea.css` 和 `ConversationArea.js` 调整新建对话按钮
3. 修改 `VisualEditor.css` 和 `VisualEditor.js` 添加组件库标题和拖拽分隔线
4. 修改 `Layout.js` 调整默认宽度比例
5. 修改 `Login.js` 添加登录后跳转

## 涉及文件

- `front-end/src/index.css`
- `front-end/src/components/ConversationArea/ConversationArea.css`
- `front-end/src/components/ConversationArea/ConversationArea.js`
- `front-end/src/components/VisualEditor/VisualEditor.css`
- `front-end/src/components/VisualEditor/VisualEditor.js`
- `front-end/src/components/Layout/Layout.js`
- `front-end/src/components/Auth/Login.js`
