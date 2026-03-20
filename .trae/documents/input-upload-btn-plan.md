# 上传按钮移入文本框内部计划

## 需求
将上传图片按钮移动到文本框内部，与右侧发送按钮对称放置。

## 当前状态分析
- 上传按钮目前位于 `.input-wrapper` 中，在 textarea 外部
- 发送按钮已经位于 `.input-textarea-wrapper` 内部，右侧绝对定位
- 需要将上传按钮移入 `.input-textarea-wrapper`，左侧绝对定位

## 实现步骤

### 1. 修改 InputArea.js
- 将上传按钮从 `.input-wrapper` 移到 `.input-textarea-wrapper` 内部
- 上传按钮放在 textarea 之前（左侧）

### 2. 修改 InputArea.css
- 修改 `.input-upload-btn` 样式为绝对定位，位于左侧
- 调整 `.input-textarea` 的 padding 为左右两侧留出空间
- 保持与右侧发送按钮风格一致

### 3. 验证
- 确保按钮可以正常点击
- 确保布局在各种状态下正常显示
