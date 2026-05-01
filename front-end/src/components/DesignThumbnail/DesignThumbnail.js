import React, { useMemo } from 'react';
import './DesignThumbnail.css';

const DesignThumbnail = ({ designJson, onClick }) => {
  const componentCount = useMemo(() => {
    if (!designJson || !designJson.children) return 0;
    const count = (node) => {
      if (!node || !node.children) return 1;
      return 1 + node.children.reduce((sum, child) => sum + count(child), 0);
    };
    return designJson.children.reduce((sum, child) => sum + count(child), 0);
  }, [designJson]);

  const title = useMemo(() => {
    if (!designJson) return '设计稿';
    if (designJson.metadata?.title) return designJson.metadata.title;
    return `${designJson.type || '页面'} · ${componentCount}个组件`;
  }, [designJson, componentCount]);

  if (!designJson) {
    return (
      <div className="design-thumbnail design-thumbnail-empty">
        <div className="design-thumbnail-placeholder">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="9" x2="9" y2="21" />
          </svg>
          <span>无设计稿</span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="design-thumbnail" 
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick?.()}
    >
      <div className="design-thumbnail-preview">
        <div className="design-thumbnail-canvas">
          {designJson.children?.map((child, index) => (
            <ThumbnailNode key={child.id || index} node={child} />
          ))}
        </div>
      </div>
      <div className="design-thumbnail-info">
        <span className="design-thumbnail-title">{title}</span>
        <span className="design-thumbnail-badge">来自设计稿</span>
      </div>
    </div>
  );
};

const ThumbnailNode = ({ node, depth = 0 }) => {
  if (!node) return null;

  const styleMap = {
    container: { 
      display: 'flex', 
      flexDirection: node.style?.flexDirection === 'row' ? 'row' : 'column',
      gap: node.style?.gap ? Math.max(2, node.style.gap / 5) : 4,
      backgroundColor: node.style?.backgroundColor || 'transparent',
      padding: node.style?.padding ? `${Math.max(1, (node.style.padding[0] || 0) / 5)}px` : '2px',
      borderRadius: node.style?.borderRadius ? Math.max(2, node.style.borderRadius / 5) : 0,
      flexWrap: node.style?.flexWrap,
      flex: node.style?.flex,
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: node.style?.backgroundColor || '#f0f0f0',
      borderRadius: Math.max(4, (node.style?.borderRadius || 8) / 5),
      padding: '4px',
      margin: '2px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    },
    text: {
      fontSize: Math.max(6, (node.style?.fontSize || 14) / 3),
      color: node.style?.color || '#333',
      fontWeight: node.style?.fontWeight === 'bold' || node.style?.fontWeight > 500 ? 'bold' : 'normal',
      padding: '2px',
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: node.style?.backgroundColor || '#1890ff',
      color: node.style?.color || '#fff',
      borderRadius: Math.max(2, (node.style?.borderRadius || 4) / 3),
      fontSize: Math.max(6, (node.style?.fontSize || 14) / 3),
      padding: '3px 6px',
      margin: '2px',
    },
    input: {
      backgroundColor: '#fafafa',
      border: '1px solid #d9d9d9',
      borderRadius: '3px',
      padding: '2px 4px',
      fontSize: '6px',
      color: '#999',
      margin: '2px',
      height: '14px',
    },
    image: {
      backgroundColor: '#e8e8e8',
      borderRadius: '3px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '2px',
      minHeight: '20px',
      fontSize: '6px',
      color: '#999',
    },
    divider: {
      height: '1px',
      backgroundColor: '#d9d9d9',
      margin: '3px 0',
    },
  };

  const nodeStyle = styleMap[node.type] || styleMap.container;

  if (node.type === 'text') {
    return <div style={nodeStyle}>{node.text?.substring(0, 10) || '文本'}</div>;
  }

  if (node.type === 'button') {
    return <div style={nodeStyle}>{node.text?.substring(0, 6) || '按钮'}</div>;
  }

  if (node.type === 'input') {
    return <div style={nodeStyle}>{node.placeholder || '输入框'}</div>;
  }

  if (node.type === 'image') {
    return (
      <div style={nodeStyle}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" />
        </svg>
      </div>
    );
  }

  if (node.type === 'divider') {
    return <div style={nodeStyle} />;
  }

  return (
    <div style={nodeStyle}>
      {node.children?.map((child, index) => (
        <ThumbnailNode key={child.id || index} node={child} depth={depth + 1} />
      ))}
    </div>
  );
};

export default DesignThumbnail;
