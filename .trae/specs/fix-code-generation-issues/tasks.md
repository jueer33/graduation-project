# Tasks
- [ ] Task 1: 修复 CodePreview 源码显示问题 - 源码模式下代码内容不可见
  - [ ] SubTask 1.1: 分析 `.code-source-view` 布局结构，确认 flex 子元素尺寸问题
  - [ ] SubTask 1.2: 修复 `.code-file-content` 和 `.code-block` 样式，确保代码可见
- [ ] Task 2: 修复 DesignToCode 模式切换问题 - 图片生成代码标签点击无效
  - [ ] SubTask 2.1: 检查 `handleModeSwitch` 函数和按钮 onClick 事件
  - [ ] SubTask 2.2: 确认 `codeGenerationMode` 状态更新正确触发重新渲染
- [ ] Task 3: 对齐输入框底部间距样式
  - [ ] SubTask 3.1: 对比 `.code-generator` 与 `.input-area-container` 的 padding 和布局
  - [ ] SubTask 3.2: 调整 `.code-generator` 样式使其与设计稿生成模块的输入区域对齐

# Task Dependencies
- 无明确依赖关系，可并行执行
