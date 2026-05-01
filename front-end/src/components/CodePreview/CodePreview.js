import React, { useState, useEffect, useCallback } from 'react';
import './CodePreview.css';

const CodePreview = ({ code }) => {
  const [viewMode, setViewMode] = useState('preview');
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);

  // 如果是多文件，默认选择第一个
  useEffect(() => {
    if (code?.files && code.files.length > 0 && !selectedFile) {
      setSelectedFile(code.files[0]);
    }
  }, [code, selectedFile]);

  // 复制代码到剪贴板
  const handleCopyCode = useCallback(async () => {
    if (selectedFile?.content) {
      try {
        await navigator.clipboard.writeText(selectedFile.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('复制失败:', err);
      }
    }
  }, [selectedFile]);

  // 获取文件对应的语言
  const getLanguageLabel = (file) => {
    if (!file) return '';
    const ext = file.path.split('.').pop().toLowerCase();
    const langMap = {
      jsx: 'JSX',
      js: 'JavaScript',
      tsx: 'TSX',
      ts: 'TypeScript',
      vue: 'Vue',
      html: 'HTML',
      css: 'CSS',
      scss: 'SCSS',
      less: 'LESS'
    };
    return langMap[ext] || ext;
  };

  if (!code || !code.files || code.files.length === 0) {
    return (
      <div className="code-preview-empty">
        <div>代码数据无效</div>
      </div>
    );
  }

  const renderPreview = () => {
    const mainFile = code.files.find(f => f.path.endsWith('.html')) || 
                     code.files.find(f => f.path.endsWith('.htm'));

    if (mainFile) {
      let htmlContent = mainFile.content;

      const cssFiles = code.files.filter(f => f.path.endsWith('.css'));
      if (cssFiles.length > 0) {
        const cssTags = cssFiles.map(f => `<style>${f.content}</style>`).join('\n');
        htmlContent = htmlContent.replace('</head>', `${cssTags}\n</head>`);
      }

      const jsFiles = code.files.filter(f => f.path.endsWith('.js') && !f.path.endsWith('.css'));
      if (jsFiles.length > 0) {
        const jsTags = jsFiles.map(f => `<script>${f.content}</script>`).join('\n');
        htmlContent = htmlContent.replace('</body>', `${jsTags}\n</body>`);
      }

      return (
        <iframe
          title="code-preview"
          srcDoc={htmlContent}
          className="code-preview-iframe"
          sandbox="allow-scripts allow-modals"
        />
      );
    }

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
        
        // 将 import { useState, useEffect } from 'react' 替换为 const { useState, useEffect } = React
        const reactImportMatch = processedCode.match(/import\s+React\s*,?\s*\{([^}]*)\}\s*from\s+['"]react['"];?/);
        if (reactImportMatch) {
          const hooks = reactImportMatch[1].trim();
          processedCode = processedCode.replace(
            /import\s+React\s*,?\s*\{[^}]*\}\s*from\s+['"]react['"];?/,
            `const { ${hooks} } = React;`
          );
        } else {
          // 如果只是 import React from 'react'
          processedCode = processedCode.replace(/import\s+React\s+from\s+['"]react['"];?/g, '');
        }
        
        // 移除其他 import 语句（如 CSS import）
        processedCode = processedCode.replace(/import\s+['"].*?['"];?/g, '');
        processedCode = processedCode.replace(/import\s+.*?from\s+['"].*?['"];?/g, '');
        
        // 提取组件名称（从 export default 推断）
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

    if (code.type === 'vue') {
      const vueFile = code.files.find(f => f.path.endsWith('.vue'));
      if (vueFile) {
        // Parse Vue SFC to extract template, script, and style
        const templateMatch = vueFile.content.match(/<template[^>]*>([\s\S]*?)<\/template>/i);
        const scriptMatch = vueFile.content.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
        const styleMatch = vueFile.content.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);

        const template = templateMatch ? templateMatch[1] : '';
        
        // Extract setup script content
        let scriptContent = '';
        if (scriptMatch) {
          scriptContent = scriptMatch.map(s => {
            const contentMatch = s.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
            return contentMatch ? contentMatch[1] : '';
          }).join('\n');
        }

        const styles = styleMatch ? styleMatch.map(s => {
          const contentMatch = s.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
          return contentMatch ? contentMatch[1] : '';
        }).join('\n') : '';

        const htmlWrapper = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://unpkg.com/vue@3/dist/vue.global.prod.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    ${styles}
  </style>
</head>
<body>
  <div id="app">${template}</div>
  <script>
    const { createApp, ref, reactive, computed, watch, onMounted } = Vue;
    
    const App = {
      setup() {
        ${scriptContent}
        return {};
      }
    };
    
    createApp(App).mount('#app');
  </script>
</body>
</html>`;
        return (
          <iframe
            title="code-preview"
            srcDoc={htmlWrapper}
            className="code-preview-iframe"
            sandbox="allow-scripts allow-modals"
          />
        );
      }
    }

    return (
      <div className="code-preview-info">
        <p>React 和 Vue 代码需要在完整环境中运行。</p>
        <p>请切换到"源码"视图查看和复制代码。</p>
      </div>
    );
  };

  return (
    <div className="code-preview">
      <div className="code-preview-header">
        <div className="code-preview-tabs">
          <button
            className={`code-tab ${viewMode === 'preview' ? 'active' : ''}`}
            onClick={() => setViewMode('preview')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
            预览
          </button>
          <button
            className={`code-tab ${viewMode === 'source' ? 'active' : ''}`}
            onClick={() => setViewMode('source')}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            源码
          </button>
        </div>
        {viewMode === 'source' && selectedFile && (
          <button 
            className="code-copy-btn" 
            onClick={handleCopyCode}
            title="复制代码"
          >
            {copied ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                已复制
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制
              </>
            )}
          </button>
        )}
      </div>

      <div className="code-preview-content">
        {viewMode === 'preview' ? (
          renderPreview()
        ) : (
          <div className="code-source-view">
            {code.files.length > 1 && (
              <div className="code-file-tree">
                <div className="code-file-list">
                  {code.files.map((file, index) => (
                    <button
                      key={index}
                      className={`code-file-item ${selectedFile === file ? 'active' : ''}`}
                      onClick={() => setSelectedFile(file)}
                    >
                      <span className="code-file-icon">{getFileIcon(file.path)}</span>
                      <span className="code-file-name">{file.path}</span>
                      <span className="code-file-lang">{getLanguageLabel(file)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="code-file-content">
              {selectedFile && (
                <pre className="code-block">
                  <code>{selectedFile.content}</code>
                </pre>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const getFileIcon = (path) => {
  const ext = path.split('.').pop().toLowerCase();
  const icons = {
    jsx: '⚛️',
    tsx: '⚛️',
    js: '📄',
    ts: '📄',
    vue: '💚',
    html: '🌐',
    css: '🎨',
    scss: '🎨',
    less: '🎨'
  };
  return icons[ext] || '📄';
};

export default CodePreview;
