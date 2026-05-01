# 简化代码生成为仅支持 React 框架

## Why
用户希望简化代码生成流程，只生成 React 框架代码，因为：
1. 用户的应用本身就是 React 框架
2. 生成的 React 代码可以直接在应用中预览
3. 移除其他框架选项可以简化 UI 和逻辑

## What Changes
- 移除 FrameworkSelector 组件中的 Vue 和 HTML 选项
- 移除 DesignToCode 模块中的框架选择器 UI
- 将框架硬编码为 'react'
- 简化相关状态管理，移除 framework 状态

## Impact
- Affected specs: 代码生成框架选择
- Affected code: `FrameworkSelector.js`, `DesignToCode.js`, `store.js`, 后端 API

## MODIFIED Requirements

### Requirement: 代码生成框架支持
The system shall only support React framework for code generation.

#### Scenario: 用户使用代码生成功能
- **WHEN** 用户访问代码生成模块
- **THEN** 不应显示框架选择器，系统默认使用 React 框架

#### Scenario: 后端接收代码生成请求
- **WHEN** 前端发送代码生成请求
- **THEN** 框架参数固定为 'react'
