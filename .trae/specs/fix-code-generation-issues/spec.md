# 代码生成模块修复规范

## Why
代码生成模块存在三个影响用户体验的问题：
1. 源码查看模式下代码内容不可见（复制功能正常但显示为空白）
2. 图片生成代码模式无法切换
3. 代码生成模块与设计稿生成模块的输入框底部间距不一致

## What Changes
- 修复 CodePreview 组件源码查看模式的代码显示问题
- 修复 DesignToCode 组件模式切换标签的点击事件问题
- 对齐代码生成模块输入区域的样式与设计稿生成模块一致

## Impact
- Affected specs: 代码预览、代码生成模式切换、输入区域样式
- Affected code: `CodePreview.js`, `DesignToCode.js`, `DesignToCode.css`

## MODIFIED Requirements

### Requirement: 代码预览源码显示
The system shall display code content properly in source view mode.

#### Scenario: 用户切换到源码视图
- **WHEN** 用户点击"源码"标签
- **THEN** 代码内容应当正确显示在源码查看区域

### Requirement: 代码生成模式切换
The system shall allow users to switch between design, text, and image code generation modes.

#### Scenario: 用户点击模式切换标签
- **WHEN** 用户点击"设计稿生成"/"文本生成"/"图片生成"标签
- **THEN** 应当成功切换到对应模式并更新 UI

### Requirement: 输入区域样式一致性
The system shall maintain consistent input area styling across all modules.

#### Scenario: 对比不同模块的输入区域
- **WHEN** 用户在不同模块间切换
- **THEN** 输入框距离底部的视觉间距应当一致
