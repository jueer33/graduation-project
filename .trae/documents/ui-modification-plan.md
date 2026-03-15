# UI 修改计划

## 修改概述
根据需求文档 `d:\project\bisheV2\初稿.md` 和现有代码结构，进行以下三项UI修改。

---

## 修改任务清单

### 任务1：组件库位置和样式调整
**目标**：将组件库从左侧移到右边预览区域上方，改为紧凑的一排显示（2-3个）

**涉及文件**：
- `d:\project\bisheV2\front-end\src\components\VisualEditor\VisualEditor.js` - 修改布局结构
- `d:\project\bisheV2\front-end\src\components\VisualEditor\VisualEditor.css` - 修改样式

**具体步骤**：
1. 修改 VisualEditor 布局结构：
   - 将原来的三栏布局（左侧组件库+中间画布+右侧属性面板）改为两栏布局
   - 组件库移到画布区域的右上角（或单独作为顶部工具栏的一部分）
   - 画布区域在左侧，属性面板保持在右侧下方

2. 修改组件库样式：
   - 组件库容器改为水平排列（flex-direction: row）
   - 每个组件项改为更小的尺寸（一排显示2-3个）
   - 调整 `.component-list` 的 gap 和 padding

---

### 任务2：画布最小尺寸限制和滚动
**目标**：画布设置最小尺寸，当内容小于该值时不缩小，可滚动；大于时自适应

**涉及文件**：
- `d:\project\bisheV2\front-end\src\components\VisualEditor\VisualEditor.css` - 画布容器样式
- `d:\project\bisheV2\front-end\src\components\DesignRenderer\DesignRenderer.css` - 画布内部样式

**具体步骤**：
1. 在 VisualEditor.css 中：
   - 修改 `.visual-editor-canvas` 样式，设置 `min-width` 和 `min-height`
   - 确保画布内容可以滚动（设置 `overflow: auto`）

2. 在 DesignRenderer.css 中：
   - 为 `.design-page` 或顶级容器设置 `min-width`（如 320px）和 `min-height`（如 480px）
   - 确保页面节点不会小于最小尺寸

---

### 任务3：全局提示（Toast）样式美化
**目标**：将浏览器原生的 `alert()` 替换为自定义的美观 Toast 组件

**涉及文件**：
- 创建 `d:\project\bisheV2\front-end\src\components\Toast\Toast.js` - Toast 组件
- 创建 `d:\project\bisheV2\front-end\src\components\Toast\Toast.css` - Toast 样式
- 创建 `d:\project\bisheV2\front-end\src\hooks\useToast.js` - Toast 钩子
- 修改以下文件，将 `alert()` 调用替换为自定义 Toast：
  - `d:\project\bisheV2\front-end\src\components\VisualEditor\VisualEditor.js`
  - `d:\project\bisheV2\front-end\src\components\PreviewArea\PreviewArea.js`
  - `d:\project\bisheV2\front-end\src\components\InputArea\InputArea.js`
  - `d:\project\bisheV2\front-end\src\components\Sidebar\Sidebar.js`
  - `d:\project\bisheV2\front-end\src\components\ImageUpload\ImageUpload.js`
- 修改 `d:\project\bisheV2\front-end\src\App.js` - 引入 Toast 组件

**具体步骤**：
1. 创建 Toast 组件：
   - 支持不同类型：success（绿色）、error（红色）、warning（橙色）、info（蓝色）
   - 支持自动消失（3秒）
   - 支持手动关闭
   - 从屏幕顶部居中显示，带有滑动动画

2. 创建 useToast 钩子：
   - 提供 `showToast(message, type)` 方法
   - 使用 React Context 在应用顶层提供 Toast 功能

3. 替换所有 alert() 调用：
   - 将提示信息映射到对应的 Toast 类型（如保存成功 → success，错误 → error）

---

## 修改优先级
1. **任务1** - 组件库位置调整（P0）
2. **任务2** - 画布滚动限制（P0）
3. **任务3** - Toast 美化（P1）

---

## 预期效果
1. 组件库位于画布右上方，以紧凑水平方式显示
2. 画布有最小尺寸限制，不会无限缩小
3. 所有提示信息以美观的 Toast 样式显示
