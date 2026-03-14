# 历史记录功能优化计划

## 概述

本计划针对历史记录功能的4个优化点进行详细规划：
1. 删除历史记录不需要弹出提示
2. 新建历史记录时立即在左侧列表显示
3. 切换历史记录时添加active样式
4. 页面刷新/切换历史记录时自动保存当前历史记录（更新而非创建新记录）

---

## 优化点1：删除历史记录不需要弹出提示

### 问题分析
当前代码在两个位置使用了 `window.confirm()` 进行删除确认：
- `SidebarHistory.js` 第86行
- `History.js` 第66行

### 修改方案

#### 文件1: `front-end/src/components/Sidebar/SidebarHistory.js`

**修改位置：** 第86-105行的 `handleDelete` 函数

**当前代码：**
```javascript
const handleDelete = async (e, id) => {
  e.stopPropagation();
  if (!window.confirm('确定要删除这条历史记录吗？')) return;  // 需要删除这一行
  // ...
};
```

**修改后代码：**
```javascript
const handleDelete = async (e, id) => {
  e.stopPropagation();
  // 直接删除，不弹出确认提示
  
  // 先更新前端状态
  removeHistory(id, currentModule);
  
  // 然后同步到后端
  try {
    await historyAPI.delete(id);
  } catch (error) {
    console.error('删除失败:', error);
    // 如果后端删除失败，重新加载历史记录
    const response = await historyAPI.getList(1, 10);
    if (response.success) {
      const filtered = response.data.filter(h => h.moduleType === currentModule);
      setHistoriesForModule(filtered, currentModule);
    }
  }
};
```

#### 文件2: `front-end/src/components/Modules/History/History.js`

**修改位置：** 第66-75行的 `handleDelete` 函数

**当前代码：**
```javascript
const handleDelete = async (id) => {
  if (!window.confirm('确定要删除这条历史记录吗？')) return;  // 需要删除这一行
  // ...
};
```

**修改后代码：**
```javascript
const handleDelete = async (id) => {
  // 直接删除，不弹出确认提示
  try {
    await historyAPI.delete(id);
    setHistories(prev => prev.filter(h => h._id !== id));
  } catch (error) {
    console.error('删除失败:', error);
  }
};
```

---

## 优化点2：新建历史记录时立即在左侧列表显示

### 问题分析
当前代码在创建历史记录后，新记录会添加到列表中，但需要验证是否实时显示。根据代码分析，`addHistory` 函数会将新记录添加到状态开头，但可能存在异步延迟问题。

### 修改方案

#### 文件: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

**修改位置：** 第161-178行的历史记录创建逻辑

**当前代码分析：**
```javascript
const historyResponse = await historyAPI.create(historyData);
if (historyResponse.success && historyResponse.data._id) {
  setCurrentHistoryId(historyResponse.data._id);
  console.log('新历史记录已创建:', historyResponse.data._id);
}
```

**问题：** 创建历史记录后，没有立即调用 `addHistory` 将新记录添加到前端状态。

**修改后代码：**
```javascript
const historyResponse = await historyAPI.create(historyData);
if (historyResponse.success && historyResponse.data._id) {
  // 设置当前历史记录ID
  setCurrentHistoryId(historyResponse.data._id);
  
  // 立即将新记录添加到历史记录列表（前端状态）
  const newHistory = {
    ...historyResponse.data,
    userInput: text,
    moduleType: currentModule,
    createdAt: new Date().toISOString()
  };
  addHistory(newHistory, currentModule);
  
  console.log('新历史记录已创建并添加到列表:', historyResponse.data._id);
}
```

#### 文件: `front-end/src/components/Modules/ImageToDesign/ImageToDesign.js`

**同样需要修改：** 在图片生成设计稿后创建历史记录的地方添加相同的逻辑。

#### 文件: `front-end/src/components/Modules/DesignToCode/DesignToCode.js`

**同样需要修改：** 在代码生成后创建历史记录的地方添加相同的逻辑。

---

## 优化点3：切换历史记录时添加active样式

### 问题分析
当前 `SidebarHistory.js` 中没有使用 `currentHistoryId` 来高亮当前选中的历史记录项。需要在列表项上添加 `active` 类名和对应的样式。

### 修改方案

#### 文件1: `front-end/src/components/Sidebar/SidebarHistory.js`

**修改位置：** 第136-181行的列表渲染部分

**当前代码：**
```javascript
histories.slice(0, 5).map(history => (
  <div
    key={history._id}
    className="sidebar-history-item"
    onClick={() => handleRestore(history)}
    // ...
  >
```

**修改后代码：**
```javascript
// 从全局状态获取当前历史记录ID
const currentHistoryId = useHistoryStore(state => state.currentHistoryId);

// ...

histories.slice(0, 5).map(history => (
  <div
    key={history._id}
    className={`sidebar-history-item ${history._id === currentHistoryId ? 'active' : ''}`}
    onClick={() => handleRestore(history)}
    // ...
  >
```

#### 文件2: `front-end/src/components/Sidebar/SidebarHistory.css`

**添加active样式：**

```css
/* 历史记录项 - 选中状态 */
.sidebar-history-item.active {
  background-color: var(--bg-active, rgba(24, 144, 255, 0.1));
  border-left-color: var(--primary, #1890ff);
}

.sidebar-history-item.active .sidebar-history-time {
  color: var(--primary, #1890ff);
  font-weight: 500;
}

/* 确保active状态优先级高于hover */
.sidebar-history-item.active:hover {
  background-color: var(--bg-active-hover, rgba(24, 144, 255, 0.15));
  border-left-color: var(--primary, #1890ff);
}
```

#### 文件3: `front-end/src/components/Modules/History/History.js`

**同样需要修改：** 在完整历史记录页面中也添加active样式。

**当前代码：** 第95-115行的列表渲染部分

**修改后代码：**
```javascript
// 从全局状态获取当前历史记录ID
const currentHistoryId = useHistoryStore(state => state.currentHistoryId);

// ...

<div
  key={history._id}
  className={`history-item ${history._id === currentHistoryId ? 'active' : ''}`}
  onClick={() => handleRestore(history)}
  // ...
>
```

#### 文件4: `front-end/src/components/Modules/History/History.css`

**添加active样式：**

```css
/* 历史记录项 - 选中状态 */
.history-item.active {
  background-color: var(--bg-active, rgba(24, 144, 255, 0.1));
  border-color: var(--primary, #1890ff);
}

.history-item.active .history-item-time {
  color: var(--primary, #1890ff);
}

.history-item.active:hover {
  background-color: var(--bg-active-hover, rgba(24, 144, 255, 0.15));
}
```

---

## 优化点4：页面刷新/切换历史记录时自动保存当前历史记录

### 问题分析
当前逻辑：
1. 页面刷新时使用 `navigator.sendBeacon` 发送保存请求
2. 但存在以下问题：
   - 切换历史记录时没有保存当前历史记录
   - 保存逻辑可能创建新记录而不是更新现有记录
   - 需要确保在切换历史记录前，先保存当前历史记录的修改

### 修改方案

#### 文件1: `front-end/src/components/Sidebar/SidebarHistory.js`

**修改位置：** 第50-75行的 `handleRestore` 函数

**当前代码：**
```javascript
const handleRestore = async (history) => {
  // 直接恢复历史记录，没有保存当前记录
  setCurrentHistoryId(history._id);
  setCurrentDesignJson(history.designJson || null);
  setConversations(history.conversations || []);
  // ...
};
```

**修改后代码：**
```javascript
const handleRestore = async (history) => {
  // 1. 先保存当前历史记录（如果有修改）
  const currentHistoryId = useHistoryStore.getState().currentHistoryId;
  const currentDesignJson = useHistoryStore.getState().currentDesignJson;
  const currentConversations = useHistoryStore.getState().conversations;
  const isDesignModified = useHistoryStore.getState().isDesignModified;
  
  if (currentHistoryId && isDesignModified && currentDesignJson) {
    try {
      const updateData = {
        designJson: currentDesignJson,
        conversations: currentConversations,
        updatedAt: new Date().toISOString()
      };
      await historyAPI.update(currentHistoryId, updateData);
      console.log('当前历史记录已保存:', currentHistoryId);
      
      // 重置修改标记
      useHistoryStore.getState().resetDesignModified();
    } catch (error) {
      console.error('保存当前历史记录失败:', error);
    }
  }
  
  // 2. 然后切换到新的历史记录
  setCurrentHistoryId(history._id);
  setCurrentDesignJson(history.designJson || null);
  setConversations(history.conversations || []);
  
  // 重置修改标记
  resetDesignModified();
  
  // ...
};
```

#### 文件2: `front-end/src/components/Modules/TextToDesign/TextToDesign.js`

**修改位置：** 第75-121行的 `beforeunload` 事件处理

**当前代码分析：**
当前代码使用 `navigator.sendBeacon` 在页面关闭时保存，但存在以下问题：
1. 使用 `sendBeacon` 发送 PUT 请求可能不被后端正确识别
2. 需要确保在页面刷新前正确更新当前历史记录

**修改后代码：**
```javascript
useEffect(() => {
  const syncBeforeUnload = async (e) => {
    const currentConversations = conversationsRef.current;
    const historyId = currentHistoryIdRef.current;
    const designJson = currentDesignJsonRef.current;
    const isModified = isDesignModifiedRef.current;

    if (isModified && designJson) {
      const data = {
        designJson: designJson,
        conversations: currentConversations,
        updatedAt: new Date().toISOString()
      };

      if (historyId) {
        // 更新现有记录
        try {
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          navigator.sendBeacon(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history/${historyId}`,
            blob
          );
        } catch (error) {
          console.error('页面关闭前保存失败:', error);
        }
      } else {
        // 创建新记录（如果没有历史记录ID）
        try {
          const createData = {
            ...data,
            moduleType: currentModule,
            userInput: currentConversations[0]?.text || '未命名设计'
          };
          const blob = new Blob([JSON.stringify(createData)], { type: 'application/json' });
          navigator.sendBeacon(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history`,
            blob
          );
        } catch (error) {
          console.error('页面关闭前创建记录失败:', error);
        }
      }
    }
  };

  window.addEventListener('beforeunload', syncBeforeUnload);
  return () => {
    window.removeEventListener('beforeunload', syncBeforeUnload);
  };
}, [currentModule]);
```

#### 文件3: `front-end/src/components/Layout/Layout.js`

**修改位置：** 第51-65行的 `beforeunload` 事件处理

**当前代码：**
```javascript
const handleBeforeUnload = (e) => {
  if (isDesignModified) {
    const message = '您有未保存的设计稿，确定要离开吗？';
    e.returnValue = message;
    return message;
  }
};
```

**修改后代码：**
```javascript
const handleBeforeUnload = (e) => {
  if (isDesignModified) {
    // 尝试自动保存而不是提示用户
    const currentHistoryId = useHistoryStore.getState().currentHistoryId;
    const currentDesignJson = useHistoryStore.getState().currentDesignJson;
    const currentConversations = useHistoryStore.getState().conversations;
    
    if (currentHistoryId && currentDesignJson) {
      const data = {
        designJson: currentDesignJson,
        conversations: currentConversations,
        updatedAt: new Date().toISOString()
      };
      
      try {
        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
        navigator.sendBeacon(
          `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history/${currentHistoryId}`,
          blob
        );
        // 保存成功，不提示用户
        return;
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }
    
    // 如果无法自动保存，提示用户
    const message = '您有未保存的设计稿，确定要离开吗？';
    e.returnValue = message;
    return message;
  }
};
```

#### 文件4: `back-end/routes/history.js`

**需要确保后端支持 `sendBeacon` 发送的 PUT 请求**

当前代码第120-148行是更新历史记录的接口，需要确认它能正确处理 `sendBeacon` 发送的请求。

**检查点：**
- `sendBeacon` 发送的请求没有自定义 headers（如 `Content-Type: application/json`）
- 需要确保后端能正确解析请求体

**可能需要添加的中间件处理：**
```javascript
// 在 app.js 中确保能处理 beacon 请求
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
```

---

## 文件修改清单

| 序号 | 文件路径 | 修改内容 |
|------|----------|----------|
| 1 | `front-end/src/components/Sidebar/SidebarHistory.js` | 删除确认弹窗、添加active样式、切换前保存当前记录 |
| 2 | `front-end/src/components/Sidebar/SidebarHistory.css` | 添加active样式 |
| 3 | `front-end/src/components/Modules/History/History.js` | 删除确认弹窗、添加active样式 |
| 4 | `front-end/src/components/Modules/History/History.css` | 添加active样式 |
| 5 | `front-end/src/components/Modules/TextToDesign/TextToDesign.js` | 新建记录后立即添加到列表、优化页面关闭保存逻辑 |
| 6 | `front-end/src/components/Modules/ImageToDesign/ImageToDesign.js` | 新建记录后立即添加到列表 |
| 7 | `front-end/src/components/Modules/DesignToCode/DesignToCode.js` | 新建记录后立即添加到列表 |
| 8 | `front-end/src/components/Layout/Layout.js` | 优化页面关闭前的自动保存逻辑 |

---

## 实施顺序建议

1. **优化点1（删除确认）** - 最简单，先完成
2. **优化点3（active样式）** - 纯UI修改，独立性强
3. **优化点2（新建记录显示）** - 需要修改多个文件
4. **优化点4（自动保存）** - 最复杂，需要仔细测试

---

## 测试要点

1. **删除功能**：
   - 点击删除按钮直接删除，无弹窗
   - 删除后列表正确更新
   - 后端数据正确删除

2. **新建记录显示**：
   - 新建设计稿后立即在左侧列表看到新记录
   - 新记录在列表顶部
   - 刷新页面后记录仍然存在

3. **Active样式**：
   - 点击历史记录后该项高亮显示
   - 切换不同历史记录时active状态正确切换
   - 刷新页面后保持active状态

4. **自动保存**：
   - 修改设计稿后切换历史记录，当前记录自动保存
   - 刷新页面时当前记录自动保存
   - 保存是更新而非创建新记录
   - 无历史记录ID时创建新记录
