import React from 'react';
import DesignRenderer from '../DesignRenderer/DesignRenderer';
import './DesignPreview.css';

/**
 * 设计预览组件
 * 包装 DesignRenderer，提供预览界面
 * 
 * @param {Object} props
 * @param {Object} props.designJson - Design JSON数据
 */
const DesignPreview = ({ designJson }) => {
  // 验证 Design JSON 是否有效
  const isValidDesignJson = (json) => {
    if (!json) return false;
    // 支持新格式: { version, type, style, children }
    if (json.type && json.children) return true;
    // 支持旧格式: { root: { ... } }
    if (json.root) return true;
    return false;
  };

  if (!isValidDesignJson(designJson)) {
    return (
      <div className="design-preview-empty">
        <div className="empty-icon">🎨</div>
        <div className="empty-text">暂无设计预览</div>
        <div className="empty-hint">发送消息生成设计稿</div>
      </div>
    );
  }

  return (
    <div className="design-preview">
      <div className="design-preview-content">
        <DesignRenderer designJson={designJson} />
      </div>
    </div>
  );
};

export default DesignPreview;
