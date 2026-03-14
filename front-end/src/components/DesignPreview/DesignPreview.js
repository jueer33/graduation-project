import React from 'react';
import DesignRenderer from '../DesignRenderer/DesignRenderer';
import './DesignPreview.css';

const DesignPreview = ({ designJson }) => {
  if (!designJson || !designJson.root) {
    return (
      <div className="design-preview-empty">
        <div>Design JSON 数据无效</div>
      </div>
    );
  }

  return (
    <div className="design-preview">
      <div className="design-preview-header">
        <h3>设计预览</h3>
        <button className="design-edit-btn" title="编辑功能待实现">
          编辑
        </button>
      </div>
      <div className="design-preview-content">
        <DesignRenderer designJson={designJson} />
      </div>
    </div>
  );
};

export default DesignPreview;

