# 修复 React Hooks 预览问题

## 问题分析

**错误：** `useState is not defined`

**原因：** 在 `CodePreview.js` 中预处理 React 代码时，我们移除了 `import` 语句（如 `import React, { useState } from 'react';`）。但在 iframe 环境中，React 是通过 CDN 加载的全局对象 `window.React`，Hooks（如 `useState`、`useEffect`）没有被正确映射到全局作用域。

**解决方案：** 在预处理代码时，将 `import` 语句替换为从全局 `React` 对象解构 Hooks 的语句。

## 实施步骤

### 修改文件: `front-end/src/components/CodePreview/CodePreview.js`

在 `renderPreview()` 函数中，修改 React 代码的预处理逻辑：

**当前逻辑（有问题）：**
```javascript
// 移除 import 语句
processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
```

**修改为：**
```javascript
// 将 import 语句替换为从 React 全局对象解构 Hooks
// 提取 { useState, useEffect } 等 hooks
const importMatch = processedCode.match(/import\s+React\s*,?\s*\{([^}]*)\}\s*from\s+['"]react['"];?/);
if (importMatch) {
  const hooks = importMatch[1].trim();
  // 替换为: const { useState, useEffect } = React;
  processedCode = processedCode.replace(
    /import\s+React\s*,?\s*\{[^}]*\}\s*from\s+['"]react['"];?/,
    `const { ${hooks} } = React;`
  );
} else {
  // 如果只是 import React from 'react'
  processedCode = processedCode.replace(/import\s+React\s+from\s+['"]react['"];?/g, '');
}

// 移除 CSS import 语句
processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?\.css['"];?/g, '');
```

## 验证
1. 生成包含 `useState`、`useEffect` 等 Hooks 的 React 代码
2. 预览区应正确渲染，无 `useState is not defined` 错误
