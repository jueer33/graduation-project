import React, { useState } from 'react';
import './DesignMessage.css';

/**
 * 设计消息组件
 * 显示 AI 生成的设计稿相关信息
 * 
 * @param {Object} props
 * @param {Object} props.message - 消息对象
 */
const DesignMessage = ({ message }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { designJson, content } = message;

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
  );
};

export default DesignMessage;
