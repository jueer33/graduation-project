import React, { useCallback, useEffect, useState } from 'react';
import './VisualEditor.css';
import DesignRenderer from '../DesignRenderer/DesignRenderer';
import useSelection from '../../hooks/useSelection';
import useHistory from '../../hooks/useHistory';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { 
  updateNode, 
  removeNode, 
  duplicateNode,
  createDesignJSON 
} from '../../utils/designJsonUtils';

/**
 * 可视化编辑器组件
 * 整合Design JSON渲染、选中交互、属性编辑等功能
 * 
 * @param {Object} props
 * @param {Object} props.initialDesignJson - 初始Design JSON
 * @param {Function} props.onChange - Design JSON变化回调
 * @param {Function} props.onSave - 保存回调
 */
const VisualEditor = ({ 
  initialDesignJson = null, 
  onChange = () => {},
  onSave = () => {}
}) => {
  // 初始化Design JSON
  const [designJson, setDesignJson] = useState(() => {
    return initialDesignJson || createDesignJSON();
  });

  // 使用历史管理
  const {
    state: historyState,
    pushState,
    undo,
    redo,
    canUndo,
    canRedo
  } = useHistory(designJson);

  // 同步历史状态到当前状态
  useEffect(() => {
    if (historyState && historyState !== designJson) {
      setDesignJson(historyState);
      onChange(historyState);
    }
  }, [historyState, designJson, onChange]);

  // 使用选中管理
  const {
    selectedId,
    selectedNode,
    selectNode,
    deselect,
    selectParent,
    selectNextSibling,
    selectPrevSibling,
    selectFirstChild,
    hasSelection
  } = useSelection(designJson);

  /**
   * 更新Design JSON并记录历史
   */
  const updateDesignJson = useCallback((newDesignJson, options = {}) => {
    setDesignJson(newDesignJson);
    pushState(newDesignJson, options);
    onChange(newDesignJson);
  }, [pushState, onChange]);

  /**
   * 更新节点属性
   */
  const handleUpdateNode = useCallback((nodeId, updates) => {
    const newDesignJson = updateNode(designJson, nodeId, updates);
    updateDesignJson(newDesignJson, { replace: false });
  }, [designJson, updateDesignJson]);

  /**
   * 更新选中节点的样式
   */
  const handleUpdateStyle = useCallback((styleUpdates) => {
    if (!selectedId) return;
    handleUpdateNode(selectedId, { style: styleUpdates });
  }, [selectedId, handleUpdateNode]);

  /**
   * 删除选中节点
   */
  const handleDelete = useCallback(() => {
    if (!selectedId) return;
    
    const newDesignJson = removeNode(designJson, selectedId);
    updateDesignJson(newDesignJson);
    deselect();
  }, [designJson, selectedId, updateDesignJson, deselect]);

  /**
   * 复制选中节点
   */
  const handleDuplicate = useCallback(() => {
    if (!selectedId) return;
    
    const newDesignJson = duplicateNode(designJson, selectedId);
    updateDesignJson(newDesignJson);
  }, [designJson, selectedId, updateDesignJson]);

  /**
   * 处理撤销
   */
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setDesignJson(prevState);
      onChange(prevState);
    }
  }, [undo, onChange]);

  /**
   * 处理重做
   */
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setDesignJson(nextState);
      onChange(nextState);
    }
  }, [redo, onChange]);

  /**
   * 处理保存
   */
  const handleSave = useCallback(() => {
    onSave(designJson);
  }, [designJson, onSave]);

  // 注册键盘快捷键
  useKeyboardShortcuts({
    onUndo: handleUndo,
    onRedo: handleRedo,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
    onDeselect: deselect,
    onSelectParent: selectParent,
    onSelectFirstChild: selectFirstChild,
    onSelectPrevSibling: selectPrevSibling,
    onSelectNextSibling: selectNextSibling,
    onSave: handleSave
  }, [handleUndo, handleRedo, handleDelete, handleDuplicate, deselect, 
      selectParent, selectFirstChild, selectPrevSibling, selectNextSibling, handleSave]);

  return (
    <div className="visual-editor">
      {/* 顶部工具栏 */}
      <div className="visual-editor-toolbar">
        <div className="toolbar-group">
          <button 
            className="toolbar-btn" 
            onClick={handleUndo}
            disabled={!canUndo}
            title="撤销 (Ctrl+Z)"
          >
            ↩️ 撤销
          </button>
          <button 
            className="toolbar-btn" 
            onClick={handleRedo}
            disabled={!canRedo}
            title="重做 (Ctrl+Y)"
          >
            ↪️ 重做
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className="toolbar-btn" 
            onClick={handleDuplicate}
            disabled={!hasSelection}
            title="复制 (Ctrl+D)"
          >
            📋 复制
          </button>
          <button 
            className="toolbar-btn danger" 
            onClick={handleDelete}
            disabled={!hasSelection}
            title="删除 (Delete)"
          >
            🗑️ 删除
          </button>
        </div>
        
        <div className="toolbar-group">
          <button 
            className="toolbar-btn primary" 
            onClick={handleSave}
            title="保存 (Ctrl+S)"
          >
            💾 保存
          </button>
        </div>
        
        <div className="toolbar-info">
          {selectedNode && (
            <span className="selected-info">
              选中: {selectedNode.name || selectedNode.type} ({selectedNode.id})
            </span>
          )}
        </div>
      </div>

      {/* 主编辑区域 */}
      <div className="visual-editor-main">
        {/* 左侧组件库 */}
        <div className="visual-editor-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">组件库</h3>
            <div className="component-list">
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">📦</span>
                <span className="component-name">容器</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">📝</span>
                <span className="component-name">文本</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">🔘</span>
                <span className="component-name">按钮</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">🖼️</span>
                <span className="component-name">图片</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">📥</span>
                <span className="component-name">输入框</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">🃏</span>
                <span className="component-name">卡片</span>
              </div>
              <div className="component-item" onClick={() => {}}>
                <span className="component-icon">➖</span>
                <span className="component-name">分割线</span>
              </div>
            </div>
          </div>
        </div>

        {/* 中间画布区域 */}
        <div className="visual-editor-canvas">
          <DesignRenderer
            designJson={designJson}
            selectedId={selectedId}
            onSelect={selectNode}
            editable={true}
          />
        </div>

        {/* 右侧属性面板 */}
        <div className="visual-editor-properties">
          <div className="properties-panel">
            <h3 className="properties-title">属性面板</h3>
            
            {selectedNode ? (
              <div className="properties-content">
                {/* 基础属性 */}
                <div className="property-section">
                  <h4 className="property-section-title">基础属性</h4>
                  <div className="property-field">
                    <label>ID</label>
                    <input type="text" value={selectedNode.id} disabled />
                  </div>
                  <div className="property-field">
                    <label>类型</label>
                    <input type="text" value={selectedNode.type} disabled />
                  </div>
                  <div className="property-field">
                    <label>名称</label>
                    <input 
                      type="text" 
                      value={selectedNode.name || ''}
                      onChange={(e) => handleUpdateNode(selectedId, { name: e.target.value })}
                      placeholder="组件名称"
                    />
                  </div>
                </div>

                {/* 内容属性 */}
                {selectedNode.content !== undefined && (
                  <div className="property-section">
                    <h4 className="property-section-title">内容</h4>
                    <div className="property-field">
                      <textarea
                        value={selectedNode.content}
                        onChange={(e) => handleUpdateNode(selectedId, { content: e.target.value })}
                        rows={3}
                        placeholder="输入内容..."
                      />
                    </div>
                  </div>
                )}

                {/* 样式属性 */}
                <div className="property-section">
                  <h4 className="property-section-title">样式</h4>
                  
                  {/* 尺寸 */}
                  <div className="property-field">
                    <label>宽度</label>
                    <input 
                      type="text" 
                      value={selectedNode.style?.width || ''}
                      onChange={(e) => handleUpdateStyle({ width: e.target.value })}
                      placeholder="auto | 100% | 100"
                    />
                  </div>
                  <div className="property-field">
                    <label>高度</label>
                    <input 
                      type="text" 
                      value={selectedNode.style?.height || ''}
                      onChange={(e) => handleUpdateStyle({ height: e.target.value })}
                      placeholder="auto | 100% | 100"
                    />
                  </div>

                  {/* 背景色 */}
                  <div className="property-field">
                    <label>背景色</label>
                    <div className="color-input">
                      <input 
                        type="color" 
                        value={selectedNode.style?.backgroundColor || '#ffffff'}
                        onChange={(e) => handleUpdateStyle({ backgroundColor: e.target.value })}
                      />
                      <input 
                        type="text" 
                        value={selectedNode.style?.backgroundColor || ''}
                        onChange={(e) => handleUpdateStyle({ backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                      />
                    </div>
                  </div>

                  {/* 文字颜色 */}
                  <div className="property-field">
                    <label>文字颜色</label>
                    <div className="color-input">
                      <input 
                        type="color" 
                        value={selectedNode.style?.color || '#333333'}
                        onChange={(e) => handleUpdateStyle({ color: e.target.value })}
                      />
                      <input 
                        type="text" 
                        value={selectedNode.style?.color || ''}
                        onChange={(e) => handleUpdateStyle({ color: e.target.value })}
                        placeholder="#333333"
                      />
                    </div>
                  </div>

                  {/* 字体大小 */}
                  <div className="property-field">
                    <label>字体大小 (px)</label>
                    <input 
                      type="number" 
                      value={selectedNode.style?.fontSize || ''}
                      onChange={(e) => handleUpdateStyle({ fontSize: parseInt(e.target.value) || 0 })}
                      placeholder="14"
                    />
                  </div>

                  {/* 圆角 */}
                  <div className="property-field">
                    <label>圆角 (px)</label>
                    <input 
                      type="number" 
                      value={selectedNode.style?.borderRadius || ''}
                      onChange={(e) => handleUpdateStyle({ borderRadius: parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>

                  {/* 内边距 */}
                  <div className="property-field">
                    <label>内边距 (px)</label>
                    <div className="spacing-inputs">
                      <input 
                        type="number" 
                        value={selectedNode.style?.padding?.[0] || 0}
                        onChange={(e) => {
                          const padding = [...(selectedNode.style?.padding || [0,0,0,0])];
                          padding[0] = parseInt(e.target.value) || 0;
                          handleUpdateStyle({ padding });
                        }}
                        placeholder="上"
                      />
                      <input 
                        type="number" 
                        value={selectedNode.style?.padding?.[1] || 0}
                        onChange={(e) => {
                          const padding = [...(selectedNode.style?.padding || [0,0,0,0])];
                          padding[1] = parseInt(e.target.value) || 0;
                          handleUpdateStyle({ padding });
                        }}
                        placeholder="右"
                      />
                      <input 
                        type="number" 
                        value={selectedNode.style?.padding?.[2] || 0}
                        onChange={(e) => {
                          const padding = [...(selectedNode.style?.padding || [0,0,0,0])];
                          padding[2] = parseInt(e.target.value) || 0;
                          handleUpdateStyle({ padding });
                        }}
                        placeholder="下"
                      />
                      <input 
                        type="number" 
                        value={selectedNode.style?.padding?.[3] || 0}
                        onChange={(e) => {
                          const padding = [...(selectedNode.style?.padding || [0,0,0,0])];
                          padding[3] = parseInt(e.target.value) || 0;
                          handleUpdateStyle({ padding });
                        }}
                        placeholder="左"
                      />
                    </div>
                  </div>

                  {/* Flex布局 */}
                  {selectedNode.children && (
                    <>
                      <div className="property-field">
                        <label>布局方向</label>
                        <select 
                          value={selectedNode.style?.flexDirection || 'column'}
                          onChange={(e) => handleUpdateStyle({ flexDirection: e.target.value })}
                        >
                          <option value="row">水平排列</option>
                          <option value="column">垂直排列</option>
                        </select>
                      </div>
                      <div className="property-field">
                        <label>主轴对齐</label>
                        <select 
                          value={selectedNode.style?.justifyContent || 'flex-start'}
                          onChange={(e) => handleUpdateStyle({ justifyContent: e.target.value })}
                        >
                          <option value="flex-start">起始</option>
                          <option value="center">居中</option>
                          <option value="flex-end">末尾</option>
                          <option value="space-between">两端对齐</option>
                          <option value="space-around">均匀分布</option>
                        </select>
                      </div>
                      <div className="property-field">
                        <label>交叉轴对齐</label>
                        <select 
                          value={selectedNode.style?.alignItems || 'stretch'}
                          onChange={(e) => handleUpdateStyle({ alignItems: e.target.value })}
                        >
                          <option value="flex-start">起始</option>
                          <option value="center">居中</option>
                          <option value="flex-end">末尾</option>
                          <option value="stretch">拉伸</option>
                        </select>
                      </div>
                      <div className="property-field">
                        <label>间距 (px)</label>
                        <input 
                          type="number" 
                          value={selectedNode.style?.gap || 0}
                          onChange={(e) => handleUpdateStyle({ gap: parseInt(e.target.value) || 0 })}
                          placeholder="0"
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="properties-empty">
                <div className="empty-icon">👆</div>
                <div className="empty-text">点击组件进行编辑</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisualEditor;
