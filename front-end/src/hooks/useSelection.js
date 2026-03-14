import { useState, useCallback, useMemo } from 'react';
import { findNode } from '../utils/designJsonUtils';

/**
 * 选中状态管理Hook
 * 管理可视化编辑器中的组件选中状态
 * 
 * @param {Object} designJson - 当前Design JSON
 * @returns {Object} 选中状态和方法
 */
const useSelection = (designJson) => {
  // 当前选中的单个节点ID
  const [selectedId, setSelectedId] = useState(null);
  
  // 多选模式下的选中节点ID列表
  const [selectedIds, setSelectedIds] = useState([]);
  
  // 是否处于多选模式
  const [isMultiSelect, setIsMultiSelect] = useState(false);

  /**
   * 获取当前选中的节点数据
   */
  const selectedNode = useMemo(() => {
    if (!designJson || !selectedId) return null;
    const { node } = findNode(designJson.root, selectedId);
    return node;
  }, [designJson, selectedId]);

  /**
   * 获取多选模式下所有选中的节点数据
   */
  const selectedNodes = useMemo(() => {
    if (!designJson || selectedIds.length === 0) return [];
    return selectedIds
      .map(id => findNode(designJson.root, id).node)
      .filter(Boolean);
  }, [designJson, selectedIds]);

  /**
   * 选中单个节点
   * @param {string} nodeId - 节点ID
   * @param {boolean} multi - 是否多选模式
   */
  const selectNode = useCallback((nodeId, multi = false) => {
    if (multi) {
      // 多选模式
      setIsMultiSelect(true);
      setSelectedIds(prev => {
        if (prev.includes(nodeId)) {
          // 如果已选中，则取消选中
          const newIds = prev.filter(id => id !== nodeId);
          // 如果取消后只剩一个或没有，退出多选模式
          if (newIds.length <= 1) {
            setIsMultiSelect(false);
            setSelectedId(newIds[0] || null);
            return [];
          }
          return newIds;
        } else {
          // 添加到选中列表
          return [...prev, nodeId];
        }
      });
      // 同时更新单选ID为最后一个选中的
      setSelectedId(nodeId);
    } else {
      // 单选模式
      setIsMultiSelect(false);
      setSelectedIds([]);
      setSelectedId(nodeId);
    }
  }, []);

  /**
   * 取消选中
   */
  const deselect = useCallback(() => {
    setSelectedId(null);
    setSelectedIds([]);
    setIsMultiSelect(false);
  }, []);

  /**
   * 切换选中状态
   * @param {string} nodeId - 节点ID
   */
  const toggleSelection = useCallback((nodeId) => {
    if (selectedId === nodeId) {
      deselect();
    } else {
      selectNode(nodeId);
    }
  }, [selectedId, selectNode, deselect]);

  /**
   * 选中父节点
   */
  const selectParent = useCallback(() => {
    if (!designJson || !selectedId) return;
    
    const { parent } = findNode(designJson.root, selectedId);
    if (parent) {
      selectNode(parent.id);
    }
  }, [designJson, selectedId, selectNode]);

  /**
   * 选中下一个兄弟节点
   */
  const selectNextSibling = useCallback(() => {
    if (!designJson || !selectedId) return;
    
    const { parent, index } = findNode(designJson.root, selectedId);
    if (parent && parent.children && index < parent.children.length - 1) {
      selectNode(parent.children[index + 1].id);
    }
  }, [designJson, selectedId, selectNode]);

  /**
   * 选中上一个兄弟节点
   */
  const selectPrevSibling = useCallback(() => {
    if (!designJson || !selectedId) return;
    
    const { parent, index } = findNode(designJson.root, selectedId);
    if (parent && index > 0) {
      selectNode(parent.children[index - 1].id);
    }
  }, [designJson, selectedId, selectNode]);

  /**
   * 选中第一个子节点
   */
  const selectFirstChild = useCallback(() => {
    if (!designJson || !selectedId) return;
    
    const { node } = findNode(designJson.root, selectedId);
    if (node.children && node.children.length > 0) {
      selectNode(node.children[0].id);
    }
  }, [designJson, selectedId, selectNode]);

  /**
   * 检查节点是否被选中
   * @param {string} nodeId - 节点ID
   * @returns {boolean}
   */
  const isSelected = useCallback((nodeId) => {
    if (isMultiSelect) {
      return selectedIds.includes(nodeId);
    }
    return selectedId === nodeId;
  }, [isMultiSelect, selectedIds, selectedId]);

  /**
   * 获取选中节点的路径
   */
  const selectedPath = useMemo(() => {
    if (!designJson || !selectedId) return [];
    const { path } = findNode(designJson.root, selectedId);
    return path;
  }, [designJson, selectedId]);

  return {
    // 状态
    selectedId,
    selectedIds,
    selectedNode,
    selectedNodes,
    isMultiSelect,
    selectedPath,
    
    // 方法
    selectNode,
    deselect,
    toggleSelection,
    selectParent,
    selectNextSibling,
    selectPrevSibling,
    selectFirstChild,
    isSelected,
    
    // 快捷属性
    hasSelection: selectedId !== null,
    hasMultiSelection: isMultiSelect && selectedIds.length > 1
  };
};

export default useSelection;
