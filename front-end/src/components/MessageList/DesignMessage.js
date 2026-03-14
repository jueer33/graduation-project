import React, { useState } from 'react';
import './DesignMessage.css';

const DesignMessage = ({ message, onPreview }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { designJson, content } = message;

  const handlePreview = () => {
    if (onPreview && designJson) {
      onPreview(designJson, message.id);
    }
  };

  // 格式化JSON显示
  const formatJson = (json) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return 'Invalid JSON';
    }
  };

  return (
    <div className="design-message">
      {content && (
        <div className="design-message-content">{content}</div>
      )}

      <div className="design-message-card">
        <div className="design-message-header">
          <span className="design-message-icon">🎨</span>
          <span className="design-message-title">设计稿 JSON 数据</span>
          <button
            className="design-message-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}代码
          </button>
        </div>

        {isExpanded && (
          <div className="design-message-code">
            <pre>{formatJson(designJson)}</pre>
          </div>
        )}

        <div className="design-message-actions">
          <button
            className="design-message-preview-btn"
            onClick={handlePreview}
          >
            <span className="btn-icon">👁️</span>
            <span className="btn-text">点击预览和编辑</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignMessage;
