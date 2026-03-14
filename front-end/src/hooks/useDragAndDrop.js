import { useState, useCallback, useRef } from 'react';

/**
 * 拖拽功能 Hook
 * 管理组件拖拽状态和行为
 */
export const useDragAndDrop = (options = {}) => {
  const { onDragStart, onDragEnd, onDrop } = options;
  
  const [dragState, setDragState] = useState({
    isDragging: false,
    dragNodeId: null,
    dragNodeType: null,
    dropTargetId: null,
    dropPosition: null, // 'before', 'after', 'inside'
    isRowLayout: false // 是否为水平布局
  });
  
  const dragNodeRef = useRef(null);
  
  /**
   * 开始拖拽
   */
  const handleDragStart = useCallback((e, nodeId, nodeType) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
    
    // 设置拖拽时的幽灵图像
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    e.dataTransfer.setDragImage(e.currentTarget, offsetX, offsetY);
    
    dragNodeRef.current = nodeId;
    
    setDragState({
      isDragging: true,
      dragNodeId: nodeId,
      dragNodeType: nodeType,
      dropTargetId: null,
      dropPosition: null,
      isRowLayout: false
    });
    
    onDragStart?.(nodeId, nodeType);
  }, [onDragStart]);
  
  /**
   * 拖拽经过
   */
  const handleDragOver = useCallback((e, targetId, targetType) => {
    e.preventDefault();
    e.stopPropagation();
    
    // 不能拖拽到自己
    if (targetId === dragState.dragNodeId) {
      return;
    }
    
    // 计算放置位置
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;
    
    // 判断父容器的布局方向
    const targetElement = e.currentTarget;
    const computedStyle = window.getComputedStyle(targetElement);
    const flexDirection = computedStyle.flexDirection;
    const isRowLayout = flexDirection === 'row' || flexDirection === 'row-reverse';
    
    let position = 'inside';
    
    // 如果是容器，根据鼠标位置和布局方向决定放置位置
    const containerTypes = ['page', 'container', 'card'];
    if (containerTypes.includes(targetType)) {
      if (isRowLayout) {
        // 水平布局：根据X坐标判断左右
        if (x < width * 0.25) {
          position = 'before';
        } else if (x > width * 0.75) {
          position = 'after';
        } else {
          position = 'inside';
        }
      } else {
        // 垂直布局：根据Y坐标判断上下
        if (y < height * 0.25) {
          position = 'before';
        } else if (y > height * 0.75) {
          position = 'after';
        } else {
          position = 'inside';
        }
      }
    } else {
      // 非容器：根据布局方向判断
      if (isRowLayout) {
        position = x < width / 2 ? 'before' : 'after';
      } else {
        position = y < height / 2 ? 'before' : 'after';
      }
    }
    
    setDragState(prev => ({
      ...prev,
      dropTargetId: targetId,
      dropPosition: position,
      isRowLayout
    }));
    
    e.dataTransfer.dropEffect = 'move';
  }, [dragState.dragNodeId]);
  
  /**
   * 拖拽离开
   */
  const handleDragLeave = useCallback((e) => {
    e.stopPropagation();
    // 延迟清除，避免闪烁
  }, []);
  
  /**
   * 放置
   */
  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    e.stopPropagation();
    
    const dragNodeId = dragNodeRef.current || e.dataTransfer.getData('text/plain');
    
    if (!dragNodeId || dragNodeId === targetId) {
      setDragState({
        isDragging: false,
        dragNodeId: null,
        dragNodeType: null,
        dropTargetId: null,
        dropPosition: null,
        isRowLayout: false
      });
      return;
    }
    
    onDrop?.({
      dragNodeId,
      dropTargetId: targetId,
      dropPosition: dragState.dropPosition,
      isRowLayout: dragState.isRowLayout
    });
    
    setDragState({
      isDragging: false,
      dragNodeId: null,
      dragNodeType: null,
      dropTargetId: null,
      dropPosition: null,
      isRowLayout: false
    });
    
    dragNodeRef.current = null;
  }, [dragState.dropPosition, onDrop]);
  
  /**
   * 拖拽结束
   */
  const handleDragEnd = useCallback(() => {
    setDragState({
      isDragging: false,
      dragNodeId: null,
      dragNodeType: null,
      dropTargetId: null,
      dropPosition: null,
      isRowLayout: false
    });
    dragNodeRef.current = null;
    onDragEnd?.();
  }, [onDragEnd]);
  
  /**
   * 获取拖拽状态类名
   */
  const getDragClassName = useCallback((nodeId) => {
    const classes = [];
    
    if (dragState.isDragging) {
      if (nodeId === dragState.dragNodeId) {
        classes.push('dragging');
      }
      if (nodeId === dragState.dropTargetId) {
        classes.push(`drop-target-${dragState.dropPosition}`);
        if (dragState.isRowLayout) {
          classes.push('drop-target-row');
        }
      }
    }
    
    return classes.join(' ');
  }, [dragState]);
  
  return {
    dragState,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd,
    getDragClassName
  };
};

export default useDragAndDrop;
