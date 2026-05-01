# React 代码预览修复计划

## 问题分析

### 1. `exports is not defined` 错误
**原因：** AI 生成的 React 代码使用了 CommonJS 模块导出语法（如 `module.exports = LogoutPage`），但浏览器环境不支持。Babel standalone 只能转换 JSX，不能处理 CommonJS 模块系统。

### 2. `Content truncated or too large to return` 错误
**原因：** AI 返回的代码内容太长，超出了 `max_tokens: 4096` 的限制，导致内容被截断，JSON 不完整。

**解决方案：** 增加 `max_tokens` 参数，或者优化 Prompt 要求 AI 返回精简的代码。

### 3. CORS 图片加载错误
**原因：** iframe 中加载的外部图片 URL 遇到跨域限制。

**解决方案：** 在 iframe sandbox 中添加 `allow-same-origin`。

## 实施步骤

### 步骤 1：修改 `qwenService.js` 增加 max_tokens
**文件：** `d:\project\bisheV2\back-end\services\qwenService.js`

在 `generateCodeFromDesign` 函数中：
- 将 `max_tokens: 4096` 改为 `max_tokens: 8000`（或更大值，取决于模型支持的上限）
- 在 system prompt 中增加要求代码精简的说明

### 步骤 2：修改 `CodePreview.js` 预处理 React 代码
**文件：** `d:\project\bisheV2\front-end\src\components\CodePreview\CodePreview.js`

在 `renderPreview()` 函数中，React 代码注入 iframe 前添加预处理：
1. 移除 CommonJS 模块导出语句（`module.exports = X`）
2. 移除 `import` 语句（React 已全局加载）
3. 移除 `export default` 语句
4. 添加错误处理 try-catch
5. iframe sandbox 添加 `allow-same-origin`

### 步骤 3：优化 System Prompt（可选）
要求 AI：
- 代码中避免使用 `module.exports`，使用 `export default`
- 保持代码精简，只包含必要的组件和样式
- 如果 CSS 内容较长，可以内联到 JSX 的 style 属性中

## 验证
1. 测试代码生成是否不再被截断
2. 测试 React 代码在预览区是否正确渲染
3. 确认无 `exports is not defined` 错误
