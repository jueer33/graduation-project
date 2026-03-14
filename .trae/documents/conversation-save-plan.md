# 对话内容和设计稿保存修复计划

## 问题概述

用户反馈的核心问题：

1. **历史记录没有保存对话内容** - 查看历史记录时，中间对话区域的对话内容没有显示
2. **新建对话时只保存对话内容，没有保存修改后的设计稿** - 新建对话时应该同时保存对话内容和当前的设计稿状态
3. **保存设计稿时也应该保存对话内容** - 保存设计稿时，应该同时保存当前对话窗口的内容

## 根本原因分析

### 问题1：历史记录没有保存对话内容
- 当前 `TextToDesign.js` 在生成设计稿后，只保存了 `designJson`，没有保存 `conversations`
- 需要确保生成设计稿时，同时保存对话内容到历史记录

### 问题2：新建对话时保存逻辑不完整
- 当前新建对话时（点击发送按钮生成设计稿），会创建新的历史记录
- 但这个历史记录只包含初始的 `userInput` 和 `designJson`，缺少 `conversations` 数组

### 问题3：保存设计稿时缺少对话内容
- `PreviewArea.js` 中的 `handleSaveDesign` 只保存了 `designJson`
- 需要同时保存当前的 `conversations`

---

## 修复方案

### 修复1：生成设计稿时同时保存对话内容

**文件**: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

修改 `handleSubmit` 函数：
- 在生成设计稿成功后，创建历史记录时同时包含 `conversations`
- 确保 `conversations` 包含用户的输入和AI的响应

### 修复2：新建对话时保存完整信息

**文件**: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

在生成设计稿成功后：
- 创建历史记录时包含完整的 `conversations` 数组
- 包含当前修改后的 `designJson`

### 修复3：保存设计稿时同时保存对话内容

**文件**: `front-end/src/components/PreviewArea/PreviewArea.js`

修改 `handleSaveDesign` 函数：
- 获取当前模块的对话内容
- 更新历史记录时同时保存 `conversations` 和 `designJson`

### 修复4：ImageToDesign 和 DesignToCode 同样需要修复

**文件**:
- `front-end/src/components/Modules/ImageToDesign/ImageToDesign.js`
- `front-end/src/components/Modules/DesignToCode/DesignToCode.js`

---

## 详细实施步骤

### Step 1: 修复 TextToDesign.js

1. 在 `handleSubmit` 中，生成设计稿成功后创建历史记录时，添加 `conversations` 字段
2. 确保 `conversations` 包含完整的对话历史

### Step 2: 修复 PreviewArea.js

1. 在 `handleSaveDesign` 中获取当前对话内容
2. 更新历史记录时同时保存 `conversations`

### Step 3: 修复 ImageToDesign.js

1. 在 `handleSubmit` 中，图片解析成功后创建历史记录时，添加 `conversations` 字段

### Step 4: 修复 DesignToCode.js

1. 在 `handleGenerate` 中，代码生成成功后创建历史记录时，添加 `conversations` 字段

---

## 验证清单

- [ ] 生成设计稿后，历史记录包含完整的对话内容
- [ ] 新建对话时，历史记录同时包含对话内容和设计稿
- [ ] 保存设计稿时，历史记录同时更新对话内容和设计稿
- [ ] 从侧边栏恢复历史记录时，对话区域正确显示对话内容
- [ ] 刷新页面后，对话内容自动保存到历史记录
