import React, { useCallback, useEffect, useState, useRef } from 'react';
import './VisualEditor.css';
import DesignRenderer from '../DesignRenderer/DesignRenderer';
import useSelection from '../../hooks/useSelection';
import useHistory from '../../hooks/useHistory';
import useKeyboardShortcuts from '../../hooks/useKeyboardShortcuts';
import { 
  updateNode, 
  removeNode, 
  duplicateNode,
  addChildNode,
  findNode,
  createDesignJSON 
} from '../../utils/designJsonUtils';
import { normalizeToOldFormat, convertToNewFormat } from '../../utils/designJsonAdapter';
import { createNode, getComponentTypes, canHaveChildren } from '../../constants/componentTemplates';
import { handleImageUpload } from '../../utils/imageUpload';

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
  onSave = () => {},
  isSaving = false
}) => {
  // 使用 ref 来跟踪初始 designJson 的变化
  const initialDesignJsonRef = useRef(initialDesignJson);

  // 初始化Design JSON（统一转换为旧格式以兼容现有逻辑）
  const [designJson, setDesignJson] = useState(() => {
    const json = initialDesignJson || createDesignJSON();
    return normalizeToOldFormat(json);
  });

  // 当 initialDesignJson 变化时更新内部状态（但不重置选中状态）
  useEffect(() => {
    // 使用 JSON.stringify 进行深度比较，避免对象引用变化导致的无限循环
    const currentInitialStr = JSON.stringify(initialDesignJson);
    const prevInitialStr = JSON.stringify(initialDesignJsonRef.current);

    if (currentInitialStr !== prevInitialStr) {
      initialDesignJsonRef.current = initialDesignJson;
      const json = initialDesignJson || createDesignJSON();
      setDesignJson(normalizeToOldFormat(json));
    }
  }, [initialDesignJson]);

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
      // 返回新格式给父组件
      onChange(convertToNewFormat(historyState));
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
    // 返回新格式给父组件
    onChange(convertToNewFormat(newDesignJson));
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
   * 添加新组件
   */
  const handleAddComponent = useCallback((componentType) => {
    // 确定父节点ID
    let parentId = selectedId;
    
    // 如果没有选中节点，或者选中节点不能包含子元素，则添加到根节点
    if (!parentId) {
      parentId = designJson.root.id;
    } else {
      const { node: selectedNodeData } = findNode(designJson.root, selectedId);
      if (selectedNodeData && !canHaveChildren(selectedNodeData.type)) {
        // 如果选中的节点不能包含子元素，找到它的父节点
        const { parent } = findNode(designJson.root, selectedId);
        parentId = parent ? parent.id : designJson.root.id;
      }
    }
    
    // 创建新节点
    const newNode = createNode(componentType);
    if (!newNode) return;
    
    // 添加到父节点
    const newDesignJson = addChildNode(designJson, parentId, newNode);
    updateDesignJson(newDesignJson);
    
    // 选中新添加的节点
    selectNode(newNode.id);
  }, [designJson, selectedId, updateDesignJson, selectNode]);

  /**
   * 处理撤销
   */
  const handleUndo = useCallback(() => {
    const prevState = undo();
    if (prevState) {
      setDesignJson(prevState);
      onChange(convertToNewFormat(prevState));
    }
  }, [undo, onChange]);

  /**
   * 处理重做
   */
  const handleRedo = useCallback(() => {
    const nextState = redo();
    if (nextState) {
      setDesignJson(nextState);
      onChange(convertToNewFormat(nextState));
    }
  }, [redo, onChange]);

  /**
   * 处理保存
   */
  const handleSave = useCallback(() => {
    onSave(convertToNewFormat(designJson));
  }, [designJson, onSave]);

  /**
   * 处理图片上传
   */
  const handleImageFileUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedId) return;
    
    const result = await handleImageUpload(file);
    if (result.success) {
      handleUpdateNode(selectedId, { src: result.data });
    } else {
      alert(result.error);
    }
    
    // 清空input以便可以重复选择同一文件
    e.target.value = '';
  }, [selectedId, handleUpdateNode]);

  /**
   * 处理背景图片上传
   */
  const handleBackgroundImageUpload = useCallback(async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedId) return;
    
    const result = await handleImageUpload(file);
    if (result.success) {
      handleUpdateStyle({ 
        backgroundImage: result.data,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      });
    } else {
      alert(result.error);
    }
    
    // 清空input以便可以重复选择同一文件
    e.target.value = '';
  }, [selectedId, handleUpdateStyle]);

  // 判断是否为容器类组件
  const isContainer = selectedNode && ['page', 'container', 'card'].includes(selectedNode.type);

  /**
   * 处理移动节点（拖拽）
   */
  const handleMoveNode = useCallback((dragNodeId, dropTargetId, dropPosition) => {
    // 不能移动到自己
    if (dragNodeId === dropTargetId) return;

    const { node: dragNode } = findNode(designJson.root, dragNodeId);
    const { node: targetNode, parent: targetParent } = findNode(designJson.root, dropTargetId);

    if (!dragNode || !targetNode) return;

    // 检查是否尝试将父节点移动到子节点中（避免循环）
    const isDescendant = (parent, childId) => {
      if (!parent.children) return false;
      for (const child of parent.children) {
        if (child.id === childId) return true;
        if (isDescendant(child, childId)) return true;
      }
      return false;
    };

    if (isDescendant(dragNode, dropTargetId)) {
      console.warn('不能将父节点移动到其子节点中');
      return;
    }

    let newDesignJson = JSON.parse(JSON.stringify(designJson));

    // 根据放置位置决定如何移动
    switch (dropPosition) {
      case 'inside':
        // 放入目标容器内部
        if (canHaveChildren(targetNode.type)) {
          // 从原位置删除
          newDesignJson = removeNode(newDesignJson, dragNodeId);
          // 添加到新容器
          newDesignJson = addChildNode(newDesignJson, dropTargetId, dragNode);
        }
        break;

      case 'before':
      case 'after': {
        // 放在目标节点之前或之后
        if (targetParent) {
          const targetIndex = targetParent.children.findIndex(c => c.id === dropTargetId);
          const insertIndex = dropPosition === 'before' ? targetIndex : targetIndex + 1;

          // 从原位置删除
          newDesignJson = removeNode(newDesignJson, dragNodeId);

          // 添加到新位置
          newDesignJson = addChildNode(newDesignJson, targetParent.id, dragNode, insertIndex);
        }
        break;
      }

      default:
        break;
    }

    updateDesignJson(newDesignJson);
  }, [designJson, updateDesignJson]);

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
            disabled={isSaving}
            title="保存 (Ctrl+S)"
          >
            {isSaving ? '⏳ 保存中...' : '💾 保存'}
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
            <h3 className="sidebar-title-component">组件库</h3>
            <div className="component-list">
              <div className="component-item" onClick={() => handleAddComponent('container')}>
                <span className="component-icon">📦</span>
                <span className="component-name">容器</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('text')}>
                <span className="component-icon">📝</span>
                <span className="component-name">文本</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('button')}>
                <span className="component-icon">🔘</span>
                <span className="component-name">按钮</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('image')}>
                <span className="component-icon">🖼️</span>
                <span className="component-name">图片</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('input')}>
                <span className="component-icon">📥</span>
                <span className="component-name">输入框</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('card')}>
                <span className="component-icon">🃏</span>
                <span className="component-name">卡片</span>
              </div>
              <div className="component-item" onClick={() => handleAddComponent('divider')}>
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
            onMoveNode={handleMoveNode}
            editable={true}
          />
        </div>

        {/* 右侧属性面板 */}
        <div className="visual-editor-properties" onClick={(e) => e.stopPropagation()}>
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

                {/* 图片组件属性 */}
                {selectedNode.type === 'image' && (
                  <div className="property-section">
                    <h4 className="property-section-title">图片</h4>
                    <div className="property-field">
                      <label>图片上传</label>
                      <div className="image-upload-area">
                        {selectedNode.src && (
                          <div className="image-preview">
                            <img src={selectedNode.src} alt="preview" />
                          </div>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageFileUpload}
                          className="image-file-input"
                          id="image-upload"
                        />
                        <label htmlFor="image-upload" className="image-upload-btn">
                          📤 选择图片
                        </label>
                        <input
                          type="text"
                          value={selectedNode.src || ''}
                          onChange={(e) => handleUpdateNode(selectedId, { src: e.target.value })}
                          placeholder="或输入图片URL"
                        />
                      </div>
                    </div>
                    <div className="property-field">
                      <label>替代文本 (alt)</label>
                      <input
                        type="text"
                        value={selectedNode.alt || ''}
                        onChange={(e) => handleUpdateNode(selectedId, { alt: e.target.value })}
                        placeholder="图片描述"
                      />
                    </div>
                  </div>
                )}

                {/* 内容属性 */}
                {selectedNode.content !== undefined && selectedNode.type !== 'image' && (
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

                  {/* 容器背景图片 */}
                  {isContainer && (
                    <>
                      <div className="property-field">
                        <label>背景图片</label>
                        <div className="background-image-area">
                          {selectedNode.style?.backgroundImage && (
                            <div 
                              className="background-image-preview"
                              style={{ 
                                backgroundImage: selectedNode.style.backgroundImage.startsWith('url(') 
                                  ? selectedNode.style.backgroundImage 
                                  : `url(${selectedNode.style.backgroundImage})`,
                                backgroundSize: selectedNode.style.backgroundSize || 'cover',
                                backgroundPosition: 'center'
                              }}
                            />
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleBackgroundImageUpload}
                            className="image-file-input"
                            id="bg-image-upload"
                          />
                          <div className="background-image-actions">
                            <label htmlFor="bg-image-upload" className="image-upload-btn small">
                              📤 上传背景
                            </label>
                            <input
                              type="text"
                              value={selectedNode.style?.backgroundImage || ''}
                              onChange={(e) => handleUpdateStyle({ 
                                backgroundImage: e.target.value 
                              })}
                              placeholder="或输入图片URL"
                            />
                            {selectedNode.style?.backgroundImage && (
                              <button 
                                className="clear-bg-btn"
                                onClick={() => handleUpdateStyle({ 
                                  backgroundImage: undefined,
                                  backgroundSize: undefined,
                                  backgroundPosition: undefined,
                                  backgroundRepeat: undefined
                                })}
                              >
                                ✕ 清除
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {selectedNode.style?.backgroundImage && (
                        <>
                          <div className="property-field">
                            <label>背景尺寸</label>
                            <select
                              value={selectedNode.style?.backgroundSize || 'cover'}
                              onChange={(e) => handleUpdateStyle({ backgroundSize: e.target.value })}
                            >
                              <option value="cover">覆盖 (cover)</option>
                              <option value="contain">包含 (contain)</option>
                              <option value="auto">自动 (auto)</option>
                              <option value="100% 100%">拉伸 (100%)</option>
                            </select>
                          </div>
                          <div className="property-field">
                            <label>背景重复</label>
                            <select
                              value={selectedNode.style?.backgroundRepeat || 'no-repeat'}
                              onChange={(e) => handleUpdateStyle({ backgroundRepeat: e.target.value })}
                            >
                              <option value="no-repeat">不重复</option>
                              <option value="repeat">重复</option>
                              <option value="repeat-x">水平重复</option>
                              <option value="repeat-y">垂直重复</option>
                            </select>
                          </div>
                          <div className="property-field">
                            <label>背景位置</label>
                            <select
                              value={selectedNode.style?.backgroundPosition || 'center'}
                              onChange={(e) => handleUpdateStyle({ backgroundPosition: e.target.value })}
                            >
                              <option value="center">居中</option>
                              <option value="top">顶部</option>
                              <option value="bottom">底部</option>
                              <option value="left">左侧</option>
                              <option value="right">右侧</option>
                              <option value="top left">左上</option>
                              <option value="top right">右上</option>
                              <option value="bottom left">左下</option>
                              <option value="bottom right">右下</option>
                            </select>
                          </div>
                        </>
                      )}
                    </>
                  )}

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
