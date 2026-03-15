import React from 'react';
import './SkeletonScreen.css';

/**
 * 设计稿骨架屏组件
 * 在右侧预览区域显示，表示正在加载设计稿
 */
const SkeletonScreen = () => {
  return (
    <div className="skeleton-screen">
      {/* 顶部工具栏骨架 */}
      <div className="skeleton-toolbar">
        <div className="skeleton-toolbar-item"></div>
        <div className="skeleton-toolbar-item"></div>
        <div className="skeleton-toolbar-item"></div>
      </div>

      {/* 主内容区域骨架 */}
      <div className="skeleton-main">
        {/* 左侧组件面板骨架 */}
        <div className="skeleton-sidebar">
          <div className="skeleton-sidebar-title"></div>
          <div className="skeleton-component-grid">
            <div className="skeleton-component-item"></div>
            <div className="skeleton-component-item"></div>
            <div className="skeleton-component-item"></div>
            <div className="skeleton-component-item"></div>
            <div className="skeleton-component-item"></div>
            <div className="skeleton-component-item"></div>
          </div>
        </div>

        {/* 中间画布骨架 */}
        <div className="skeleton-canvas">
          <div className="skeleton-canvas-header">
            <div className="skeleton-canvas-title"></div>
            <div className="skeleton-canvas-actions">
              <div className="skeleton-action-btn"></div>
              <div className="skeleton-action-btn"></div>
            </div>
          </div>
          <div className="skeleton-canvas-content">
            <div className="skeleton-page">
              <div className="skeleton-page-header">
                <div className="skeleton-text-short"></div>
                <div className="skeleton-text-medium"></div>
              </div>
              <div className="skeleton-page-body">
                <div className="skeleton-card">
                  <div className="skeleton-card-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text-lines">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line-short"></div>
                    </div>
                  </div>
                  <div className="skeleton-card-body">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line-short"></div>
                  </div>
                  <div className="skeleton-card-footer">
                    <div className="skeleton-button"></div>
                    <div className="skeleton-button"></div>
                  </div>
                </div>
                <div className="skeleton-card">
                  <div className="skeleton-card-header">
                    <div className="skeleton-avatar"></div>
                    <div className="skeleton-text-lines">
                      <div className="skeleton-line"></div>
                      <div className="skeleton-line-short"></div>
                    </div>
                  </div>
                  <div className="skeleton-card-body">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧属性面板骨架 */}
        <div className="skeleton-properties">
          <div className="skeleton-properties-title"></div>
          <div className="skeleton-property-group">
            <div className="skeleton-property-label"></div>
            <div className="skeleton-property-input"></div>
          </div>
          <div className="skeleton-property-group">
            <div className="skeleton-property-label"></div>
            <div className="skeleton-property-input"></div>
          </div>
          <div className="skeleton-property-group">
            <div className="skeleton-property-label"></div>
            <div className="skeleton-property-color"></div>
          </div>
          <div className="skeleton-property-group">
            <div className="skeleton-property-label"></div>
            <div className="skeleton-property-slider"></div>
          </div>
        </div>
      </div>

      {/* 底部状态栏骨架 */}
      <div className="skeleton-footer">
        <div className="skeleton-footer-text"></div>
        <div className="skeleton-footer-actions">
          <div className="skeleton-footer-btn"></div>
          <div className="skeleton-footer-btn"></div>
        </div>
      </div>

      {/* 加载提示 */}
      <div className="skeleton-loading-overlay">
        <div className="skeleton-loading-content">
          <div className="skeleton-loading-spinner"></div>
          <div className="skeleton-loading-text">正在加载设计稿...</div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonScreen;
