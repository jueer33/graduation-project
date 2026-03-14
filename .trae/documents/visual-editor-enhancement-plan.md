# 可视化编辑器增强计划

## 概述

基于现有可视化编辑器，增强以下三个核心功能：
1. 图片组件支持本地上传图片
2. 容器组件支持设置背景图片
3. 组件支持拖拽操作（移动位置、调整层级）

---

## 第一部分：图片组件上传功能

### 1.1 功能描述
为图片组件添加本地上传功能，用户可以：
- 点击上传按钮选择本地图片
- 拖拽图片到图片组件区域上传
- 支持图片预览和替换
- 图片以 base64 或 blob URL 形式存储在 Design JSON 中

### 1.2 涉及文件

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `front-end/src/components/VisualEditor/VisualEditor.js` | 修改 | 添加图片上传处理逻辑 |
| `front-end/src/components/VisualEditor/VisualEditor.css` | 修改 | 添加上传按钮和拖拽区域样式 |
| `front-end/src/components/DesignRenderer/DesignRenderer.js` | 修改 | 图片组件添加上传交互 |
| `front-end/src/components/DesignRenderer/DesignRenderer.css` | 修改 | 图片组件上传相关样式 |

### 1.3 实现步骤

#### Step 1: 创建图片上传工具函数
**文件**: `front-end/src/utils/imageUpload.js`

```javascript
/**
 * 图片上传工具
 * 处理本地图片选择、读取和转换
 */

/**
 * 读取文件为 Base64
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Base64 字符串
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 读取文件为 Blob URL
 * @param {File} file - 文件对象
 * @returns {string} Blob URL
 */
export const fileToBlobUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '只支持 JPG、PNG、GIF、WebP 格式的图片' };
  }
  
  // 验证文件大小 (最大 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '图片大小不能超过 5MB' };
  }
  
  return { valid: true };
};

/**
 * 处理图片上传
 * @param {File} file - 文件对象
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} { success: boolean, data?: string, error?: string }
 */
export const handleImageUpload = async (file, options = {}) => {
  const { useBase64 = true, maxWidth = 1920, maxHeight = 1080 } = options;
  
  // 验证文件
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  try {
    let imageData;
    
    if (useBase64) {
      imageData = await fileToBase64(file);
    } else {
      imageData = fileToBlobUrl(file);
    }
    
    return { success: true, data: imageData };
  } catch (error) {
    return { success: false, error: '图片读取失败: ' + error.message };
  }
};
```

#### Step 2: 修改属性面板添加图片上传
**文件**: `front-end/src/components/VisualEditor/VisualEditor.js`

在属性面板的样式属性区域，为图片类型组件添加上传功能：

```javascript
// 在属性面板中添加图片上传区域
{selectedNode.type === 'image' && (
  <div className="property-section">
    <h4 className="property-section-title">图片</h4>
    <div className="property-field">
      <label>图片地址 / 上传</label>
      <div className="image-upload-area">
        {selectedNode.src && (
          <div className="image-preview">
            <img src={selectedNode.src} alt="preview" />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
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
```

#### Step 3: 添加样式
**文件**: `front-end/src/components/VisualEditor/VisualEditor.css`

```css
/* 图片上传区域 */
.image-upload-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-preview {
  width: 100%;
  height: 100px;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
}

.image-preview img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.image-file-input {
  display: none;
}

.image-upload-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: var(--primary-light);
  border: 1px dashed var(--primary);
  border-radius: var(--radius-sm);
  color: var(--primary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
}

.image-upload-btn:hover {
  background-color: var(--primary);
  color: var(--text-inverse);
}
```

---

## 第二部分：容器背景图片功能

### 2.1 功能描述
为容器类组件（container、card、page）添加背景图片设置功能：
- 支持上传本地图片作为背景
- 支持输入图片URL作为背景
- 支持背景图片样式设置（cover、contain、repeat等）
- 背景图片与背景色可以叠加

### 2.2 涉及文件

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `front-end/src/components/VisualEditor/VisualEditor.js` | 修改 | 属性面板添加背景图片设置 |
| `front-end/src/components/VisualEditor/VisualEditor.css` | 修改 | 背景图片设置样式 |
| `front-end/src/utils/styleConverter.js` | 修改 | 支持 backgroundImage 转换 |

### 2.3 实现步骤

#### Step 1: 扩展样式转换器支持背景图片
**文件**: `front-end/src/utils/styleConverter.js`

```javascript
// 在 convertStyleToCSS 函数中添加背景图片处理
export const convertStyleToCSS = (designStyle = {}) => {
  const cssStyle = {};
  
  // ... 原有代码
  
  Object.entries(designStyle).forEach(([key, value]) => {
    // ... 原有处理
    
    // 处理背景图片
    if (key === 'backgroundImage' && value) {
      // 确保 URL 格式正确
      if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:')) {
        cssStyle.backgroundImage = `url(${value})`;
      } else if (!value.startsWith('url(')) {
        cssStyle.backgroundImage = `url(${value})`;
      } else {
        cssStyle.backgroundImage = value;
      }
      return;
    }
    
    // ... 其他处理
  });
  
  return cssStyle;
};
```

#### Step 2: 属性面板添加背景图片设置
**文件**: `front-end/src/components/VisualEditor/VisualEditor.js`

在样式属性区域添加背景图片设置（仅对容器类组件显示）：

```javascript
// 判断是否为容器类组件
const isContainer = ['page', 'container', 'card'].includes(selectedNode.type);

// 在样式属性区域添加
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
```

#### Step 3: 添加样式
**文件**: `front-end/src/components/VisualEditor/VisualEditor.css`

```css
/* 背景图片区域 */
.background-image-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.background-image-preview {
  width: 100%;
  height: 80px;
  border: 1px solid var(--border-secondary);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
}

.background-image-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.image-upload-btn.small {
  padding: 6px 10px;
  font-size: 12px;
}

.clear-bg-btn {
  padding: 6px 10px;
  background-color: var(--error-light);
  border: 1px solid var(--error);
  border-radius: var(--radius-sm);
  color: var(--error);
  font-size: 12px;
  cursor: pointer;
  transition: var(--transition);
}

.clear-bg-btn:hover {
  background-color: var(--error);
  color: var(--text-inverse);
}
```

---

## 第三部分：组件拖拽功能

### 3.1 功能描述
实现组件拖拽功能，用户可以：
- 拖拽组件在同级之间调整顺序
- 拖拽组件到其他容器中改变层级关系
- 拖拽时有视觉反馈（高亮目标区域）
- 支持键盘辅助操作（ESC取消拖拽）

### 3.2 涉及文件

| 文件路径 | 修改类型 | 说明 |
|---------|---------|------|
| `front-end/src/hooks/useDragAndDrop.js` | 新建 | 拖拽逻辑Hook |
| `front-end/src/components/DesignRenderer/DesignRenderer.js` | 修改 | 集成拖拽功能 |
| `front-end/src/components/DesignRenderer/DesignRenderer.css` | 修改 | 拖拽样式 |
| `front-end/src/components/VisualEditor/VisualEditor.js` | 修改 | 处理拖拽结果 |
| `front-end/src/utils/designJsonUtils.js` | 修改 | 添加移动节点辅助函数 |

### 3.3 实现步骤

#### Step 1: 创建拖拽Hook
**文件**: `front-end/src/hooks/useDragAndDrop.js`

```javascript
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
    dropPosition: null // 'before', 'after', 'inside'
  });
  
  const dragNodeRef = useRef(null);
  
  /**
   * 开始拖拽
   */
  const handleDragStart = useCallback((e, nodeId, nodeType) => {
    e.stopPropagation();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', nodeId);
    
    dragNodeRef.current = nodeId;
    
    setDragState({
      isDragging: true,
      dragNodeId: nodeId,
      dragNodeType: nodeType,
      dropTargetId: null,
      dropPosition: null
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
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position = 'inside';
    
    // 如果是容器，根据鼠标位置决定是放入内部还是放在前后
    const containerTypes = ['page', 'container', 'card'];
    if (containerTypes.includes(targetType)) {
      if (y < height * 0.25) {
        position = 'before';
      } else if (y > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
    } else {
      // 非容器只能放在前后
      position = y < height / 2 ? 'before' : 'after';
    }
    
    setDragState(prev => ({
      ...prev,
      dropTargetId: targetId,
      dropPosition: position
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
        dropPosition: null
      });
      return;
    }
    
    onDrop?.({
      dragNodeId,
      dropTargetId: targetId,
      dropPosition: dragState.dropPosition
    });
    
    setDragState({
      isDragging: false,
      dragNodeId: null,
      dragNodeType: null,
      dropTargetId: null,
      dropPosition: null
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
      dropPosition: null
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
```

#### Step 2: 修改 DesignRenderer 集成拖拽
**文件**: `front-end/src/components/DesignRenderer/DesignRenderer.js`

```javascript
import React, { memo, useCallback } from 'react';
import './DesignRenderer.css';
import { convertStyleToCSS } from '../../utils/styleConverter';
import useDragAndDrop from '../../hooks/useDragAndDrop';

const DesignRenderer = ({ 
  designJson, 
  selectedId = null, 
  onSelect = () => {},
  onMoveNode = () => {}, // 新增：移动节点回调
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
    onDrop: ({ dragNodeId, dropTargetId, dropPosition }) => {
      onMoveNode(dragNodeId, dropTargetId, dropPosition);
    }
  });
  
  const renderNode = useCallback((node, depth = 0) => {
    if (!node) return null;

    const { id, type, style = {}, content, placeholder, src, alt, children } = node;
    const cssStyle = convertStyleToCSS(style);
    const isSelected = selectedId === id;
    const dragClassName = editable ? getDragClassName(id) : '';
    
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

    // ... 原有 switch 渲染逻辑
    
  }, [selectedId, onSelect, editable, getDragClassName, handleDragStart, handleDragOver, handleDragLeave, handleDrop, handleDragEnd]);
  
  // ... 原有验证和返回逻辑
};

export default memo(DesignRenderer);
```

#### Step 3: 添加拖拽样式
**文件**: `front-end/src/components/DesignRenderer/DesignRenderer.css`

```css
/* 拖拽相关样式 */

/* 正在拖拽的节点 */
.design-node.dragging {
  opacity: 0.5;
  outline: 2px dashed #1890ff !important;
}

/* 放置目标 - 之前 */
.design-node.drop-target-before {
  position: relative;
}

.design-node.drop-target-before::before {
  content: '';
  position: absolute;
  top: -2px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #1890ff;
  border-radius: 2px;
  z-index: 100;
}

/* 放置目标 - 之后 */
.design-node.drop-target-after {
  position: relative;
}

.design-node.drop-target-after::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #1890ff;
  border-radius: 2px;
  z-index: 100;
}

/* 放置目标 - 内部 */
.design-node.drop-target-inside {
  outline: 3px solid #1890ff !important;
  outline-offset: 2px;
  background-color: rgba(24, 144, 255, 0.05);
}

/* 可拖拽时的光标 */
.design-renderer-editable .design-node[draggable="true"] {
  cursor: grab;
}

.design-renderer-editable .design-node[draggable="true"]:active {
  cursor: grabbing;
}

/* 拖拽时的禁用文本选择 */
.design-renderer.dragging {
  user-select: none;
}
```

#### Step 4: 在 VisualEditor 处理移动逻辑
**文件**: `front-end/src/components/VisualEditor/VisualEditor.js`

```javascript
// 添加移动节点处理函数
const handleMoveNode = useCallback((dragNodeId, dropTargetId, dropPosition) => {
  // 不能移动到自己
  if (dragNodeId === dropTargetId) return;
  
  const { node: dragNode, parent: dragParent } = findNode(designJson.root, dragNodeId);
  const { node: targetNode, parent: targetParent } = findNode(designJson.root, dropTargetId);
  
  if (!dragNode || !targetNode) return;
  
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

// 传递给 DesignRenderer
<DesignRenderer
  designJson={designJson}
  selectedId={selectedId}
  onSelect={selectNode}
  onMoveNode={handleMoveNode}
  editable={true}
/>
```

---

## 第四部分：任务清单

### Phase 1: 图片上传功能 (Day 1-2)

| 任务 | 文件 | 优先级 | 状态 |
|------|------|--------|------|
| 1.1 创建图片上传工具函数 | `front-end/src/utils/imageUpload.js` | P0 | ✅ 已完成 |
| 1.2 属性面板添加图片上传UI | `VisualEditor.js` | P0 | ✅ 已完成 |
| 1.3 添加图片上传样式 | `VisualEditor.css` | P0 | ✅ 已完成 |
| 1.4 测试图片上传功能 | - | P1 | ✅ 已完成 |

### Phase 2: 容器背景图片功能 (Day 2-3)

| 任务 | 文件 | 优先级 | 状态 |
|------|------|--------|------|
| 2.1 扩展样式转换器 | `styleConverter.js` | P0 | ✅ 已完成 |
| 2.2 属性面板添加背景图片设置 | `VisualEditor.js` | P0 | ✅ 已完成 |
| 2.3 添加背景图片样式 | `VisualEditor.css` | P0 | ✅ 已完成 |
| 2.4 测试背景图片功能 | - | P1 | ✅ 已完成 |

### Phase 3: 组件拖拽功能 (Day 3-5)

| 任务 | 文件 | 优先级 | 状态 |
|------|------|--------|------|
| 3.1 创建拖拽Hook | `useDragAndDrop.js` | P0 | ✅ 已完成 |
| 3.2 DesignRenderer集成拖拽 | `DesignRenderer.js` | P0 | ✅ 已完成 |
| 3.3 添加拖拽样式 | `DesignRenderer.css` | P0 | ✅ 已完成 |
| 3.4 VisualEditor处理移动逻辑 | `VisualEditor.js` | P0 | ✅ 已完成 |
| 3.5 测试拖拽功能 | - | P1 | ✅ 已完成 |

### Phase 4: 集成测试与优化 (Day 5-6)

| 任务 | 说明 | 优先级 | 状态 |
|------|------|--------|------|
| 4.1 功能联调测试 | 验证三个功能正常工作 | P0 | ✅ 已完成 |
| 4.2 性能优化 | 优化大图片和复杂结构的渲染 | P1 | ✅ 已完成 |
| 4.3 错误处理 | 添加上传失败、拖拽异常处理 | P1 | ✅ 已完成 |
| 4.4 用户体验优化 | 添加loading状态、提示信息 | P1 | ✅ 已完成 |

---

## 第五部分：验收标准

### 5.1 图片上传功能
- [x] 可以点击按钮选择本地图片上传
- [x] 上传后图片正确显示在组件中
- [x] 支持输入图片URL作为备选
- [x] 上传的图片保存在 Design JSON 中
- [x] 支持替换已上传的图片

### 5.2 容器背景图片功能
- [x] 容器类组件显示背景图片设置选项
- [x] 可以上传本地图片作为背景
- [x] 可以输入图片URL作为背景
- [x] 支持设置背景尺寸（cover/contain等）
- [x] 支持设置背景重复和位置
- [x] 可以清除背景图片

### 5.3 组件拖拽功能
- [x] 可以拖拽组件调整位置
- [x] 拖拽时有视觉反馈
- [x] 可以拖拽组件到其他容器内
- [x] 可以在同级组件间调整顺序
- [x] 拖拽操作支持撤销/重做

---

## 第六部分：技术要点

### 6.1 图片存储策略
- 小图片（< 100KB）：使用 Base64 直接存储在 Design JSON
- 大图片：使用 Blob URL（临时）或上传到服务器获取 URL

### 6.2 拖拽实现要点
- 使用 HTML5 原生拖拽 API
- 通过 dataTransfer 传递节点 ID
- 根据鼠标位置计算放置位置
- 避免拖拽到自己内部造成循环嵌套

### 6.3 性能考虑
- 图片上传后压缩处理
- 拖拽时使用 requestAnimationFrame 优化
- 大 Design JSON 使用虚拟滚动

---

## 总结

本计划详细规划了可视化编辑器的三个增强功能：
1. **图片上传**：让用户可以上传本地图片到图片组件
2. **背景图片**：让容器支持设置背景图片
3. **组件拖拽**：实现可视化的组件位置调整

预计总工期约 6 天，按优先级逐步实现，确保每个功能都经过充分测试。
