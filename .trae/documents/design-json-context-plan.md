# 设计稿修改后上下文传递优化计划

## 问题描述

当前系统存在一个问题：当用户在可视化编辑器中修改设计稿并保存后，再次向AI提问时，AI并没有基于用户修改后的设计稿进行修改，而是基于原始生成的设计稿或者重新开始生成。

## 根本原因分析

### 1. 前端问题

**TextToDesign.js** 中的 `handleSubmit` 函数在调用 `aiAPI.textToDesign` 时，传递的 `currentDesignJson` 可能不是最新的：

```javascript
// 第175行
const response = await aiAPI.textToDesign(text, activeSessionId, currentDesignJson);
```

问题在于：
- `currentDesignJson` 是从 store 中获取的，但用户在 VisualEditor 中修改后保存的设计稿，是否正确地更新到了 store 中？
- VisualEditor 的 `onSave` 回调是否正确地更新了全局的 `currentDesignJson`？

### 2. 后端问题

**qwenService.js** 中的 `buildMessages` 函数虽然接收了 `currentDesignJson` 参数，但在构建 prompt 时，只是简单地添加了一段文字说明：

```javascript
// 第339-342行
if (currentDesignJson) {
  finalPrompt = `${userPrompt}\n\n当前设计稿信息：这是一个已存在的设计稿，请基于现有结构进行修改。保持整体布局，只修改用户要求的部分。`;
}
```

问题在于：
- 没有将实际的 Design JSON 内容传递给 AI
- AI 不知道当前设计稿的具体结构，无法基于它进行修改

## 解决方案

### 阶段1：后端优化 - 将 Design JSON 传递给 AI

**文件**: `back-end/services/qwenService.js`

修改 `buildMessages` 函数，将 `currentDesignJson` 作为上下文传递给 AI：

```javascript
function buildMessages(userPrompt, history = [], currentDesignJson = null) {
  const messages = [
    { role: 'system', content: DESIGN_JSON_SYSTEM_PROMPT }
  ];

  // 添加历史消息
  if (history && history.length > 0) {
    for (const msg of history) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        let content = msg.content;
        if (msg.designJson) {
          content += '\n[包含设计稿数据]';
        }
        messages.push({ role: 'assistant', content: content });
      }
    }
  }

  // 构建当前用户提示
  let finalPrompt = userPrompt;
  
  // 如果有当前设计稿，将完整的 Design JSON 传递给 AI
  if (currentDesignJson) {
    const designJsonStr = JSON.stringify(currentDesignJson, null, 2);
    finalPrompt = `${userPrompt}

【重要】当前设计稿状态（请基于此进行修改）：
\`\`\`json
${designJsonStr}
\`\`\`

请基于以上设计稿进行修改，保持整体结构，只调整用户要求的部分。`;
  }

  messages.push({ role: 'user', content: finalPrompt });

  return messages;
}
```

### 阶段2：前端优化 - 确保保存的设计稿正确更新到 Store

**文件**: `front-end/src/components/PreviewArea/PreviewArea.js`

需要检查 PreviewArea 组件中，当 VisualEditor 保存设计稿时，是否正确地更新了全局的 `currentDesignJson`。

**文件**: `front-end/src/components/VisualEditor/VisualEditor.js`

确保 `onChange` 回调在每次设计稿修改时都被调用，而不仅仅是在保存时。

### 阶段3：对话历史中的 Design JSON 同步

**文件**: `back-end/utils/conversationManager.js`

当前对话历史中保存了每条消息的 `designJson`，但在构建消息时并没有使用这些信息。需要确保：

1. 当用户修改并保存设计稿后，最新的 Design JSON 被保存到对话历史中
2. 在构建消息时，优先使用最新的 Design JSON，而不是历史消息中的旧版本

## 具体实施步骤

### 任务1：修改后端 buildMessages 函数
- 文件: `back-end/services/qwenService.js`
- 修改 `buildMessages` 函数，将完整的 `currentDesignJson` 传递给 AI
- 优化 prompt，明确告知 AI 需要基于现有设计稿进行修改

### 任务2：优化前端设计稿保存逻辑
- 文件: `front-end/src/components/PreviewArea/PreviewArea.js`
- 确保 VisualEditor 保存的设计稿正确更新到全局 store
- 确保再次发送消息时使用最新的 `currentDesignJson`

### 任务3：更新对话历史中的 Design JSON
- 文件: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`
- 在用户修改并保存设计稿后，更新对话历史中对应消息的 designJson
- 确保下次发送请求时使用的是最新的设计稿

### 任务4：添加调试日志
- 在前端和后端添加关键位置的日志，便于排查问题
- 记录传递的 Design JSON 的摘要信息

## 验证方案

1. 创建一个简单的登录页面
2. 在可视化编辑器中修改背景颜色或添加组件
3. 保存修改后的设计稿
4. 再次向AI提问（如"把背景改成蓝色"）
5. 验证AI返回的设计稿是否基于修改后的版本

## 预期效果

- AI 能够准确理解用户基于当前设计稿的修改需求
- 修改后的设计稿状态能够正确传递给 AI
- 用户体验得到提升，对话上下文更加连贯
