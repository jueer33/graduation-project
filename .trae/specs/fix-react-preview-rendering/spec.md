# 修复 React 代码预览显示问题

## Why
React 代码生成后预览区无法显示，原因是 `renderPreview()` 函数要求 JSX 和 CSS 文件同时存在才渲染，如果 AI 只返回了单个 `.jsx` 文件（无对应 CSS），预览逻辑会跳过，显示"请切换到源码视图"的提示。

## What Changes
- 修复 `renderPreview()` 中 React 预览逻辑：允许仅有 JSX 文件（无 CSS 文件）时也能预览
- 确保预览区域正确渲染 React 组件

## Impact
- Affected specs: 代码预览
- Affected code: `CodePreview.js`

## MODIFIED Requirements

### Requirement: React 代码预览渲染
The system shall render React code preview even if there is only a JSX file without a corresponding CSS file.

#### Scenario: 用户查看单文件 React 组件
- **WHEN** AI 返回的 React 代码只包含 `.jsx` 文件（无 `.css` 文件）
- **THEN** 预览区域仍应使用 Babel standalone 渲染该组件
