# Bug修复计划

## 问题列表

### 1. 保存设计稿失败
**问题描述**: 用户修改设计稿后点击保存，显示"保存设计稿失败"

**原因分析**:
- 前端调用 `historyAPI.update()` 或 `historyAPI.create()` 保存设计稿
- 需要检查后端的 `/api/history` 路由实现
- 可能的问题：数据库模型不匹配、字段缺失、权限验证失败

**修复步骤**:
1. 检查后端 `history.js` 路由的 update 和 create 接口
2. 检查 History 模型定义，确保支持 designJson 和 conversations 字段
3. 检查请求数据格式与后端期望是否一致
4. 添加更详细的错误日志以便调试

---

### 2. 属性面板输入框导致组件取消选择
**问题描述**: 在高度等输入框中点击删除或输入数字时，会取消设计稿的组件选择

**原因分析**:
- 在 `VisualEditor.js` 中，属性面板的输入框 onChange 事件可能触发了组件的重新渲染
- `editorKey` 的变化导致整个 `VisualEditor` 重新渲染，从而丢失了选中状态
- 或者点击输入框时触发了画布的点击事件，导致 deselect

**修复步骤**:
1. 检查 `PreviewArea.js` 中的 `editorKey` 逻辑，它会在 `currentDesignJson` 变化时强制重新渲染
2. 修改 `VisualEditor` 组件，使用 `useRef` 或分离状态来保持选中状态
3. 为属性面板的输入框添加 `onClick={(e) => e.stopPropagation()}` 防止冒泡
4. 考虑将 `selectedId` 状态提升到父组件或使用全局状态管理

---

### 3. 后端端口统一
**问题描述**: 后端端口配置不一致

**当前状态**:
- `back-end/.env`: PORT=3003
- `back-end/server.js`: `process.env.PORT || 3001`
- `front-end/package.json`: proxy: `http://localhost:3001`
- `front-end/src/services/api.js`: `http://localhost:3003/api`

**修复步骤**:
1. 统一使用 **3001** 作为后端端口（与 server.js 默认值一致）
2. 修改 `back-end/.env` 中的 PORT 为 3001
3. 修改 `front-end/src/services/api.js` 中的默认端口为 3001
4. 保持 `front-end/package.json` 中的 proxy 为 3001（已经是正确的）

---

### 4. 画布无法左右滚动
**问题描述**: 设计稿很大时，预览区域的画布不能左右滑动查看

**原因分析**:
- `DesignRenderer.css` 中 `.design-renderer` 有 `overflow: auto`
- `VisualEditor.css` 中 `.visual-editor-canvas` 有 `overflow: auto`
- 但可能父容器限制了宽度或 overflow 设置不正确
- 设计稿内容可能超出容器但没有正确的滚动机制

**修复步骤**:
1. 检查 `PreviewArea.css` 确保预览区域容器允许滚动
2. 检查 `DesignRenderer.css` 确保设计渲染器支持横向滚动
3. 确保设计稿根节点有合适的 `min-width` 或固定宽度
4. 可能需要为画布容器添加 `min-width: max-content` 或类似设置

---

## 执行顺序

1. **端口统一** - 最简单的修改，先完成
2. **保存设计稿失败** - 核心功能，需要优先修复
3. **画布滚动问题** - UI体验问题
4. **输入框取消选择** - 交互细节问题

---

## 相关文件

### 后端
- `back-end/.env`
- `back-end/routes/history.js`
- `back-end/models/History.js`

### 前端
- `front-end/src/services/api.js`
- `front-end/src/components/PreviewArea/PreviewArea.js`
- `front-end/src/components/VisualEditor/VisualEditor.js`
- `front-end/src/components/VisualEditor/VisualEditor.css`
- `front-end/src/components/DesignRenderer/DesignRenderer.css`
- `front-end/src/components/PreviewArea/PreviewArea.css`
