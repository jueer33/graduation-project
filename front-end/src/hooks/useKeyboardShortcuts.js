import { useEffect, useCallback } from 'react';

/**
 * 键盘快捷键Hook
 * 管理可视化编辑器中的键盘快捷键
 * 
 * @param {Object} actions - 快捷键动作映射
 * @param {Object} deps - 依赖项
 */
const useKeyboardShortcuts = (actions, deps = []) => {
  /**
   * 处理键盘事件
   */
  const handleKeyDown = useCallback((event) => {
    const { key, ctrlKey, shiftKey, altKey, metaKey } = event;
    
    // 组合键检测
    const isCtrl = ctrlKey || metaKey; // 支持Mac的Command键
    const isShift = shiftKey;
    const isAlt = altKey;
    
    // 构建快捷键标识符
    const buildShortcut = () => {
      const parts = [];
      if (isCtrl) parts.push('Ctrl');
      if (isShift) parts.push('Shift');
      if (isAlt) parts.push('Alt');
      parts.push(key);
      return parts.join('+');
    };
    
    const shortcut = buildShortcut();
    
    // 快捷键映射表
    const shortcutMap = {
      // 撤销/重做
      'Ctrl+Z': actions.onUndo,
      'Ctrl+Shift+Z': actions.onRedo,
      'Ctrl+Y': actions.onRedo,
      
      // 复制/粘贴/删除
      'Ctrl+C': actions.onCopy,
      'Ctrl+V': actions.onPaste,
      'Ctrl+X': actions.onCut,
      'Delete': actions.onDelete,
      'Backspace': actions.onDelete,
      
      // 选择操作
      'Escape': actions.onDeselect,
      'Ctrl+A': actions.onSelectAll,
      
      // 导航操作
      'ArrowUp': actions.onSelectParent,
      'ArrowDown': actions.onSelectFirstChild,
      'ArrowLeft': actions.onSelectPrevSibling,
      'ArrowRight': actions.onSelectNextSibling,
      
      // 保存
      'Ctrl+S': actions.onSave,
      
      // 其他
      'Ctrl+D': actions.onDuplicate,
      'Ctrl+G': actions.onGroup,
      'Ctrl+Shift+G': actions.onUngroup,
    };
    
    // 执行对应的动作
    const action = shortcutMap[shortcut];
    if (action && typeof action === 'function') {
      event.preventDefault();
      event.stopPropagation();
      action();
    }
  }, [actions, ...deps]);

  useEffect(() => {
    // 添加键盘事件监听
    window.addEventListener('keydown', handleKeyDown);
    
    // 清理函数
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

export default useKeyboardShortcuts;
