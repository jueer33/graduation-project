# 消息丢失和头像添加计划

## 问题分析

### 1. 用户消息消失问题
- 用户发送消息后，AI 返回时用户消息消失
- 可能原因：`handleSubmit` 函数在 `setIsGenerating(true)` 后使用 `getCurrentConversations()` 获取的对话列表可能不包含刚添加的用户消息（状态更新是异步的）
- 需要在添加用户消息后等待状态更新完成，再获取对话列表

### 2. 添加头像
- 需要在用户消息和 AI 消息旁边添加头像
- 用户头像和 AI 头像

## 实现步骤

### 1. 修复消息消失问题
- 修改 TextToDesign.js、ImageToDesign.js、DesignToCode.js 中的 handleSubmit
- 在添加用户消息后使用正确的时机获取对话列表
- 可以使用 useEffect 监听 conversations 变化，或者直接使用添加消息后的最新状态

### 2. 添加头像
- 修改 MessageList.js，在渲染消息时添加头像
- 修改 MessageList.css，添加头像样式
- 用户使用用户头像（可以从 store 获取），AI 使用默认头像
