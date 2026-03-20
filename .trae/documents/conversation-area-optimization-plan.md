# 对话区域优化计划

## 需求
1. 消息距离顶部太近，在顶部加一个 header 设计，把新建按钮放到右上方
2. 拖动新建按钮放开时自动触发新建对话的问题
3. 历史记录显示不完整问题（删除后从下方出现，但容器下方有空白）

## 实现步骤

### 1. 修改 ConversationArea.js
- 在顶部添加 header 区域，包含标题和新建按钮
- 将悬浮按钮改为固定在 header 右侧
- 修复拖拽时触发点击的问题：添加 `isDragging` 状态检测，拖拽时不触发点击

### 2. 修改 ConversationArea.css
- 添加 `.conversation-header` 样式：固定高度，flex 布局，左侧标题，右侧按钮
- 调整 `.conversation-content` 样式

### 3. 修改 SidebarHistory.js
- 修改 `histories.slice(0, 5)` 为显示全部历史记录
- 增加滚动区域样式，确保内容可以滚动

### 4. 修改 SidebarHistory.css（如需要）
- 添加滚动容器样式
