import React, { memo, useCallback } from 'react';
import './DesignRenderer.css';
import { convertStyleToCSS } from '../../utils/styleConverter';
import useDragAndDrop from '../../hooks/useDragAndDrop';

/**
 * 设计渲染器组件
 * 将Design JSON递归渲染为可交互的React组件树
 *
 * @param {Object} props
 * @param {Object} props.designJson - Design JSON数据
 * @param {string} props.selectedId - 当前选中的节点ID
 * @param {Function} props.onSelect - 选中节点回调
 * @param {Function} props.onMoveNode - 移动节点回调
 * @param {boolean} props.editable - 是否可编辑模式
 */
const DesignRenderer = ({
  designJson,
  selectedId = null,
  onSelect = () => {},
  onMoveNode = () => {},
  editable = false
}) => {
  // 使用拖拽Hook
  const {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    getDragClassName
  } = useDragAndDrop({
    onDrop: ({ dragNodeId, dropTargetId, dropPosition, isRowLayout }) => {
      onMoveNode(dragNodeId, dropTargetId, dropPosition, isRowLayout);
    }
  });
  
  /**
   * 渲染单个节点
   * @param {Object} node - 组件节点
   * @param {number} depth - 当前深度
   * @returns {React.ReactNode}
   */
  const renderNode = useCallback((node, depth = 0) => {
    if (!node) return null;

    const { id, type, style = {}, content, placeholder, src, alt, children } = node;

    // 转换样式
    const cssStyle = convertStyleToCSS(style);

    // 是否被选中
    const isSelected = selectedId === id;

    // 拖拽状态类名
    const dragClassName = editable ? getDragClassName(id) : '';

    // 基础节点属性
    const nodeProps = {
      'data-node-id': id,
      'data-node-type': type,
      className: `design-node design-${type} ${isSelected ? 'design-node-selected' : ''} ${dragClassName}`,
      style: cssStyle,
      onClick: (e) => {
        e.stopPropagation();
        if (editable) {
          onSelect(id);
        }
      },
      // 拖拽相关属性
      draggable: editable,
      onDragStart: (e) => handleDragStart(e, id, type),
      onDragOver: (e) => handleDragOver(e, id, type),
      onDragLeave: handleDragLeave,
      onDrop: (e) => handleDrop(e, id),
      onDragEnd: handleDragEnd
    };

    // 根据类型渲染不同组件
    switch (type) {
      case 'page':
        return (
          <div key={id} {...nodeProps}>
            {children?.map(child => renderNode(child, depth + 1))}
          </div>
        );

      case 'container':
        return (
          <div key={id} {...nodeProps}>
            {children?.map(child => renderNode(child, depth + 1))}
          </div>
        );

      case 'card':
        return (
          <div key={id} {...nodeProps}>
            {children?.map(child => renderNode(child, depth + 1))}
          </div>
        );

      case 'text':
        return (
          <div key={id} {...nodeProps}>
            {content || ''}
          </div>
        );

      case 'button':
        return (
          <button 
            key={id} 
            {...nodeProps}
            onClick={(e) => {
              e.stopPropagation();
              if (editable) {
                onSelect(id);
              }
            }}
          >
            {content || '按钮'}
          </button>
        );

      case 'input':
        return (
          <input
            key={id}
            {...nodeProps}
            type="text"
            placeholder={placeholder || ''}
            readOnly={editable}
            onClick={(e) => {
              e.stopPropagation();
              if (editable) {
                onSelect(id);
              }
            }}
          />
        );

      case 'image':
        return (
          <img
            key={id}
            {...nodeProps}
            src={src || 'https://via.placeholder.com/200x150?text=Image'}
            alt={alt || 'image'}
            onClick={(e) => {
              e.stopPropagation();
              if (editable) {
                onSelect(id);
              }
            }}
          />
        );

      case 'divider':
        return <div key={id} {...nodeProps} />;

      case 'icon':
        return (
          <div key={id} {...nodeProps}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
        );

      default:
        return (
          <div key={id} {...nodeProps}>
            {content || ''}
            {children?.map(child => renderNode(child, depth + 1))}
          </div>
        );
    }
  }, [selectedId, onSelect, editable, getDragClassName, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd]);

  // 验证Design JSON
  if (!designJson) {
    return (
      <div className="design-renderer-empty">
        <div className="empty-icon">🎨</div>
        <div className="empty-text">暂无设计数据</div>
        <div className="empty-hint">请先生成或导入设计</div>
      </div>
    );
  }

  if (!designJson.root) {
    return (
      <div className="design-renderer-error">
        <div className="error-icon">⚠️</div>
        <div className="error-text">无效的设计数据</div>
        <div className="error-hint">缺少root节点</div>
      </div>
    );
  }

  return (
    <div className={`design-renderer ${editable ? 'design-renderer-editable' : ''}`}>
      {renderNode(designJson.root)}
    </div>
  );
};

// 使用memo优化性能，避免不必要的重渲染
export default memo(DesignRenderer);
