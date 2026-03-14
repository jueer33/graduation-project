import { useState, useCallback, useMemo } from 'react';

/**
 * 编辑历史管理Hook
 * 管理可视化编辑器中的撤销/重做功能
 * 
 * @param {Object} initialState - 初始状态
 * @param {number} maxHistory - 最大历史记录数（默认50）
 * @returns {Object} 历史状态和方法
 */
const useHistory = (initialState, maxHistory = 50) => {
  // 历史记录列表
  const [history, setHistory] = useState([initialState]);
  
  // 当前历史索引
  const [index, setIndex] = useState(0);

  /**
   * 当前状态
   */
  const state = useMemo(() => {
    return history[index];
  }, [history, index]);

  /**
   * 是否可以撤销
   */
  const canUndo = useMemo(() => {
    return index > 0;
  }, [index]);

  /**
   * 是否可以重做
   */
  const canRedo = useMemo(() => {
    return index < history.length - 1;
  }, [index, history.length]);

  /**
   * 推送新状态到历史记录
   * @param {Object} newState - 新状态
   * @param {Object} options - 选项
   * @param {boolean} options.replace - 是否替换当前状态（不创建新记录）
   */
  const pushState = useCallback((newState, options = {}) => {
    const { replace = false } = options;
    
    setHistory(prevHistory => {
      let newHistory;
      
      if (replace) {
        // 替换当前状态
        newHistory = [...prevHistory];
        newHistory[index] = newState;
      } else {
        // 创建新记录，删除当前索引之后的所有记录
        newHistory = prevHistory.slice(0, index + 1);
        newHistory.push(newState);
        
        // 限制历史记录数量
        if (newHistory.length > maxHistory) {
          newHistory = newHistory.slice(newHistory.length - maxHistory);
        }
      }
      
      return newHistory;
    });
    
    if (!replace) {
      setIndex(prevIndex => {
        const newIndex = prevIndex + 1;
        // 如果超过了限制，调整索引
        if (newIndex >= maxHistory) {
          return maxHistory - 1;
        }
        return newIndex;
      });
    }
  }, [index, maxHistory]);

  /**
   * 撤销操作
   * @returns {Object|null} 撤销后的状态
   */
  const undo = useCallback(() => {
    if (canUndo) {
      const newIndex = index - 1;
      setIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [canUndo, index, history]);

  /**
   * 重做操作
   * @returns {Object|null} 重做后的状态
   */
  const redo = useCallback(() => {
    if (canRedo) {
      const newIndex = index + 1;
      setIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [canRedo, index, history]);

  /**
   * 跳转到指定历史记录
   * @param {number} targetIndex - 目标索引
   * @returns {Object|null} 跳转后的状态
   */
  const jumpTo = useCallback((targetIndex) => {
    if (targetIndex >= 0 && targetIndex < history.length) {
      setIndex(targetIndex);
      return history[targetIndex];
    }
    return null;
  }, [history]);

  /**
   * 重置历史记录
   * @param {Object} newInitialState - 新的初始状态
   */
  const reset = useCallback((newInitialState) => {
    setHistory([newInitialState]);
    setIndex(0);
  }, []);

  /**
   * 清空历史记录
   */
  const clear = useCallback(() => {
    setHistory([state]);
    setIndex(0);
  }, [state]);

  /**
   * 获取历史记录列表（用于显示历史面板）
   */
  const historyList = useMemo(() => {
    return history.map((item, i) => ({
      index: i,
      timestamp: item.timestamp || Date.now(),
      isCurrent: i === index,
      description: item.description || `操作 ${i + 1}`
    }));
  }, [history, index]);

  return {
    // 状态
    state,
    index,
    history: historyList,
    
    // 能力检查
    canUndo,
    canRedo,
    
    // 方法
    pushState,
    undo,
    redo,
    jumpTo,
    reset,
    clear
  };
};

export default useHistory;
