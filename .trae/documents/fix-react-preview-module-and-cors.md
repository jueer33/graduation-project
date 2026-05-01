# 修复 React 代码预览问题 - 模块语法和 CORS 错误

## 问题 1: `exports is not defined`

### 原因
AI 生成的 React 代码使用了 CommonJS 模块导出语法（如 `module.exports = LogoutPage`），但浏览器环境中没有 `exports` 对象。Babel standalone 只能转换 JSX 语法，不能处理 CommonJS 模块系统。

### 解决方案
在将代码注入 iframe 之前，预处理代码：
1. 将 `module.exports = X` 或 `exports.default = X` 替换为空（因为代码已经在 iframe 的全局作用域中）
2. 将 `import` 语句替换为空（因为 React 和 ReactDOM 已通过 script 标签全局加载）
3. 确保组件函数在全局作用域中可用

## 问题 2: CORS 图片加载错误

### 原因
iframe 中加载的图片 URL 来自不允许跨域访问的服务器，导致图片无法显示。

### 解决方案
1. 在 iframe 的 sandbox 属性中添加 `allow-same-origin`（如果安全允许）
2. 或者在预览时忽略 CORS 错误（这是预期的，外部资源可能无法加载）
3. 可以在代码中替换外部图片 URL 为占位图或移除

## 实施步骤

### 修改文件: `front-end/src/components/CodePreview/CodePreview.js`

在 `renderPreview()` 函数中，构建 `htmlWrapper` 之前添加代码预处理逻辑：

```javascript
if (code.type === 'react') {
  const jsxFile = code.files.find(f => f.path.endsWith('.jsx') || f.path.endsWith('.tsx'));
  const cssFile = code.files.find(f => f.path.endsWith('.css'));

  if (jsxFile) {
    const cssContent = cssFile ? cssFile.content : '';
    
    // 预处理 React 代码，使其能在浏览器环境中运行
    let processedCode = jsxFile.content;
    
    // 移除 CommonJS 模块导出语句
    processedCode = processedCode.replace(/module\.exports\s*=\s*\w+;?/g, '');
    processedCode = processedCode.replace(/exports\.\w+\s*=\s*\w+;?/g, '');
    processedCode = processedCode.replace(/Object\.defineProperty\(exports.*?\);?/gs, '');
    
    // 移除 import 语句（React 和 ReactDOM 已全局加载）
    processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
    processedCode = processedCode.replace(/import\s+['"].*?['"];?/g, '');
    
    // 提取组件名称（假设组件名为 App 或从 export default 推断）
    const exportMatch = processedCode.match(/export\s+default\s+(\w+)/);
    const componentName = exportMatch ? exportMatch[1] : 'App';
    
    // 移除 export default 语句
    processedCode = processedCode.replace(/export\s+default\s+\w+;?/g, '');
    
    const htmlWrapper = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
  <style>
    ${cssContent}
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    ${processedCode}
    
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(React.createElement(${componentName}));
    } catch (error) {
      console.error('渲染失败:', error);
      document.getElementById('root').innerHTML = '<p style="color:red;padding:20px;">预览渲染失败: ' + error.message + '</p>';
    }
  </script>
</body>
</html>`;
    return (
      <iframe
        title="code-preview"
        srcDoc={htmlWrapper}
        className="code-preview-iframe"
        sandbox="allow-scripts allow-modals allow-same-origin"
      />
    );
  }
}
```

## 验证步骤

1. 生成 React 代码后检查预览是否正常显示
2. 确认 `exports is not defined` 错误已解决
3. 确认组件能正确渲染到预览区域
