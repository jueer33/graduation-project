import React from 'react';
import './LoadingPlaceholder.css';

/**
 * AI 生成加载占位组件
 * 显示在对话列表中，表示 AI 正在生成设计稿
 */
const LoadingPlaceholder = () => {
  return (
    <div className="loading-placeholder">
      <div className="loading-placeholder-content">
        <div className="loading-icon">
          <div className="loading-spinner"></div>
        </div>
        <div className="loading-text">
          <span className="loading-title">AI 正在生成设计稿...</span>
          <span className="loading-subtitle">这可能需要几秒钟时间</span>
        </div>
      </div>
      <div className="loading-dots">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
    </div>
  );
};

export default LoadingPlaceholder;
