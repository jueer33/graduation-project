# 修复跨模块切换导致多余"未命名对话"问题

## 问题分析

**复现步骤：**
1. 在文本生成设计稿模块输入文本，生成设计稿
2. 点击预览区的「生成代码」按钮
3. 系统跳转到代码生成模块，生成代码
4. 用户返回文本生成设计稿模块
5. 发现多了一个"未命名对话"的历史记录，内容与之前相同

**根本原因：** `PreviewArea.js` 的 `handleGenerateCode` 函数中调用了 `generateNewSession()`，这会：
- 在**当前模块**（如 text-to-design）创建一个全新的空会话
- 设置 `currentSessionId` 为新会话
- 但用户随后导航到了 `design-to-code` 模块，原来的 text-to-design 模块留下了一个空会话

这个空会话没有用户消息（conversations 为空），所以显示为"未命名对话"。

## 解决方案

**方案：`handleGenerateCode` 不应该调用 `generateNewSession()`**

在 text-to-design 模块中，当用户点击「生成代码」时：
- **不应该**创建新的空会话（因为当前会话已经有设计稿了）
- **应该**保留当前会话不变，只将 designJson 传递到 design-to-code 模块
- design-to-code 模块在代码生成成功后会自己创建历史记录

### 修改文件: `front-end/src/components/PreviewArea/PreviewArea.js`

修改 `handleGenerateCode` 函数：
- 移除 `generateNewSession()` 调用
- 保留 `setPendingDesignJson` 和 `setCodeGenerationMode` 逻辑
- 直接导航到 design-to-code 模块（使用当前 sessionId 或创建新 sessionId 用于 design-to-code 模块）

### 修改后的逻辑

```javascript
const handleGenerateCode = useCallback(() => {
  if (!currentDesignJson) {
    showToast('请先生成设计稿', 'warning');
    return;
  }

  // 保存设计稿到 pending 状态
  setPendingDesignJson(currentDesignJson);
  setCodeGenerationMode('design');

  // 为代码生成模块创建新会话（不在当前模块创建）
  const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  navigate(`/design-to-code/${newSessionId}`);
  showToast('已切换到代码生成模块', 'success');
}, [currentDesignJson, setPendingDesignJson, setCodeGenerationMode, navigate, showToast]);
```

## 验证
1. 在文本生成设计稿模块生成设计稿
2. 点击「生成代码」
3. 确认跳转到代码生成模块，且文本生成设计稿模块没有多余的"未命名对话"
4. 生成代码后返回文本生成设计稿模块，确认原有对话保持不变
