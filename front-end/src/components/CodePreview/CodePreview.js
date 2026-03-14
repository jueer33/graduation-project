import React, { useState, useEffect } from 'react';
import './CodePreview.css';

const CodePreview = ({ code }) => {
  const [viewMode, setViewMode] = useState('preview'); // 'preview' | 'source'
  const [selectedFile, setSelectedFile] = useState(null);

  // 如果是多文件，默认选择第一个
  useEffect(() => {
    if (code?.files && code.files.length > 0 && !selectedFile) {
      setSelectedFile(code.files[0]);
    }
  }, [code, selectedFile]);

  if (!code || !code.files || code.files.length === 0) {
    return (
      <div className="code-preview-empty">
        <div>代码数据无效</div>
      </div>
    );
  }

  const renderPreview = () => {
    if (code.type === 'html' && selectedFile?.content) {
      return (
        <iframe
          title="code-preview"
          srcDoc={selectedFile.content}
          className="code-preview-iframe"
          sandbox="allow-scripts"
        />
      );
    }

    // 对于React和Vue，暂时显示提示
    return (
      <div className="code-preview-info">
        <p>React 和 Vue 代码需要在本地环境中运行。</p>
        <p>请查看源码并复制到您的项目中。</p>
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
            预览
          </button>
          <button
            className={`code-tab ${viewMode === 'source' ? 'active' : ''}`}
            onClick={() => setViewMode('source')}
          >
            源码
          </button>
        </div>
      </div>

      <div className="code-preview-content">
        {viewMode === 'preview' ? (
          renderPreview()
        ) : (
          <div className="code-source-view">
            {code.files.length > 1 ? (
              <div className="code-file-tree">
                <div className="code-file-list">
                  {code.files.map((file, index) => (
                    <button
                      key={index}
                      className={`code-file-item ${selectedFile === file ? 'active' : ''}`}
                      onClick={() => setSelectedFile(file)}
                    >
                      {file.path}
                    </button>
                  ))}
                </div>
                <div className="code-file-content">
                  {selectedFile && (
                    <pre className="code-block">
                      <code>{selectedFile.content}</code>
                    </pre>
                  )}
                </div>
              </div>
            ) : (
              <pre className="code-block">
                <code>{selectedFile?.content || ''}</code>
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodePreview;

