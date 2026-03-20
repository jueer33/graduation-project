import React, { useState } from 'react';
import './DesignMessage.css';

const DesignMessage = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { designJson, content } = message;

  const formatJson = (json) => {
    try {
      return JSON.stringify(json, null, 2);
    } catch (e) {
      return 'Invalid JSON';
    }
  };

  return (
    <div className="message message-assistant">
      <div className="message-avatar ai-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
          <circle cx="7.5" cy="14.5" r="1.5"></circle>
          <circle cx="16.5" cy="14.5" r="1.5"></circle>
        </svg>
      </div>
      <div className="message-body">
        {content && (
          <div className="design-message-content">{content}</div>
        )}

        <div className="design-message-card">
        <div className="design-message-header">
          <span className="design-message-icon">🎨</span>
          <span className="design-message-title">设计稿已生成</span>
          <button
            className="design-message-toggle"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'} JSON
          </button>
        </div>

        {isExpanded && (
          <div className="design-message-code">
            <pre>{formatJson(designJson)}</pre>
          </div>
        )}

        <div className="design-message-hint">
          <span className="hint-icon">💡</span>
          <span className="hint-text">设计稿已显示在上方预览区域</span>
        </div>
      </div>
    </div>
    </div>
  );
};

export default DesignMessage;
