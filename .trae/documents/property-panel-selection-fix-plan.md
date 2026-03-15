# 属性面板编辑时组件选中状态丢失修复计划

## 问题描述

在属性面板中编辑属性（如输入颜色、修改文字）时，组件的选中状态会立即丢失，属性编辑区域变空。

## 根本原因

在 `PreviewArea.js` 中：
```jsx
<VisualEditor
  key={JSON.stringify(currentDesignJson)}  // 问题根源
  initialDesignJson={currentDesignJson}
  ...
/>
```

当用户在属性面板输入框中编辑时：
1. 触发 `handleUpdateNode` → 更新 `designJson`
2. 触发 `onChange` → 调用 `setCurrentDesignJson`
3. `currentDesignJson` 变化 → **key 改变**
4. **VisualEditor 组件被完全卸载并重新挂载**
5. `useSelection` hook 状态被重置 → 选中状态丢失

## 修复方案

### 方案：不使用 JSON 字符串作为 key

使用一个更稳定的 key 值，避免在每次设计稿微小变化时都重新挂载组件。

**修改文件**：`front-end/src/components/PreviewArea/PreviewArea.js`

1. 将 `key={JSON.stringify(currentDesignJson)}` 改为使用稳定的 key（如 `currentHistoryId` 或固定的 `'visual-editor'`）

2. 同时确保 VisualEditor 内部在 `initialDesignJson` 变化时能正确保持选中状态

---

## 修复步骤

### 步骤 1：修改 PreviewArea.js

将第 173 行的：
```jsx
key={JSON.stringify(currentDesignJson)}
```

改为：
```jsx
key="visual-editor"
```

或者使用历史记录ID（如果存在）：
```jsx
key={currentHistoryId || 'visual-editor'}
```

### 步骤 2：确保 VisualEditor 内部状态保持

检查 `VisualEditor.js` 中 `initialDesignJson` 变化的处理逻辑，确保：
- 当 `initialDesignJson` 变化时，已选中的节点如果仍然存在于新的设计稿中，则保持选中状态

（当前代码已有此逻辑，但需要确保在组件重新挂载时不会丢失）

---

## 相关文件

- `front-end/src/components/PreviewArea/PreviewArea.js` - 需要修改
- `front-end/src/components/VisualEditor/VisualEditor.js` - 可能需要微调
