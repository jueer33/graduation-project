# 对话与设计稿关联保存修复计划

## 问题概述

用户反馈的核心问题：

1. **设计稿和对话没有正确关联** - 不同对话窗口的历史记录打开来显示的是同一份设计稿
2. **AI返回的设计稿没有正确展示在对话中** - 用户希望在对话中看到AI返回的设计稿JSON数据，并可以点击"预览和编辑"按钮
3. **设计稿保存逻辑混乱** - 需要确保每个对话流有独立的设计稿

## 根本原因分析

### 问题1：设计稿全局共享
当前 `currentDesignJson` 是全局状态，所有对话共享同一个设计稿。当切换历史记录时，没有正确隔离不同对话的设计稿。

### 问题2：AI返回的设计稿没有添加到对话消息中
当前 AI 返回 designJson 后，直接设置到全局状态，没有在对话消息中显示。

### 问题3：历史记录恢复时设计稿没有正确绑定
恢复历史记录时，设计稿应该和特定的对话流绑定，而不是全局共享。

## 修复方案

### 核心设计原则
每个对话流（历史记录）应该有自己独立的设计稿。设计稿数据应该：
1. 存储在对话消息中（作为消息的一部分）
2. 当用户点击"预览和编辑"时，才加载到右侧编辑区域
3. 编辑后的设计稿保存回当前对话流的历史记录

### 修复1：修改 AI 接口返回格式

**文件**: `back-end/routes/ai.js`

修改 `text-to-design` 和 `image-to-design` 接口：
- 返回的 designJson 作为消息的一部分
- 添加一个消息类型 `design` 来表示包含设计稿的消息

### 修复2：修改前端对话消息结构

**文件**: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

修改 `handleSubmit`：
- AI 返回 designJson 后，添加到对话消息中（类型为 `design`）
- 消息包含 designJson 数据和预览按钮
- 不直接设置全局 currentDesignJson

### 修复3：创建 DesignMessage 组件

**新文件**: `front-end/src/components/MessageList/DesignMessage.js`

创建新的消息类型组件：
- 显示设计稿的JSON代码（可折叠）
- 显示"点击预览和编辑"按钮
- 点击按钮后将 designJson 加载到右侧编辑区

### 修复4：修改 MessageList 支持 design 类型消息

**文件**: `front-end/src/components/MessageList/MessageList.js`

添加对 `design` 类型消息的支持：
- 渲染 DesignMessage 组件
- 传递 designJson 和点击回调

### 修复5：修改历史记录保存逻辑

**文件**: `front-end/src/components/PreviewArea/PreviewArea.js`

修改 `handleSaveDesign`：
- 保存时更新当前历史记录的 designJson
- 同时更新对话消息中的 designJson（找到对应的 design 类型消息并更新）

### 修复6：修改历史记录恢复逻辑

**文件**: `front-end/src/components/Sidebar/SidebarHistory.js`

修改 `handleRestore`：
- 恢复对话内容
- 不直接设置 currentDesignJson（让用户点击预览按钮后再加载）

### 修复7：修改 Store 中的对话结构

**文件**: `front-end/src/store/store.js`

添加辅助方法：
- `updateMessageDesignJson` - 更新特定消息中的 designJson

## 详细实施步骤

### Step 1: 后端 AI 接口修改
修改 `back-end/routes/ai.js`：
- 保持 designJson 返回格式不变

### Step 2: 创建 DesignMessage 组件
创建 `front-end/src/components/MessageList/DesignMessage.js`：
- 显示 JSON 代码块
- 预览和编辑按钮
- 点击回调

### Step 3: 修改 MessageList
修改 `front-end/src/components/MessageList/MessageList.js`：
- 导入 DesignMessage
- 添加 design 类型消息渲染

### Step 4: 修改 TextToDesign
修改 `front-end/src/components/Modules/TextToDesign/TextToDesign.js`：
- AI 返回后添加 design 类型消息到对话
- 移除直接设置 currentDesignJson 的逻辑

### Step 5: 修改 PreviewArea
修改 `front-end/src/components/PreviewArea/PreviewArea.js`：
- 保存时更新历史记录中的 designJson
- 更新对话消息中的 designJson

### Step 6: 修改 SidebarHistory
修改 `front-end/src/components/Sidebar/SidebarHistory.js`：
- 恢复时不自动加载 designJson 到预览区

### Step 7: 修改 Store
修改 `front-end/src/store/store.js`：
- 添加 updateMessageDesignJson 方法

## 数据流设计

```
用户输入 -> AI生成 -> 添加design消息到对话 -> 显示"预览和编辑"按钮
                                              |
                                              v
                                    用户点击按钮 -> 加载designJson到右侧
                                              |
                                              v
                                    用户编辑设计稿 -> 点击保存
                                              |
                                              v
                                    更新历史记录中的designJson
                                    更新对话消息中的designJson
```

## 验证清单

- [ ] AI返回设计稿后，对话中显示JSON代码和预览按钮
- [ ] 点击预览按钮后，右侧显示可视化编辑器
- [ ] 编辑设计稿后保存，更新当前历史记录
- [ ] 不同历史记录有各自独立的设计稿
- [ ] 切换历史记录时，设计稿正确切换
- [ ] 刷新页面后，对话和设计稿正确恢复
