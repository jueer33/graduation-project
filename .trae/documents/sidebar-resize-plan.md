# 侧边栏用户区域与拖拽调整大小实现计划

## 任务概述

本次修改包含两个主要功能：
1. **侧边栏折叠状态下的用户区域改造** - 折叠时只显示用户头像，点击头像可弹出菜单进行头像上传和登出操作
2. **对话区域与预览区域之间添加可拖拽调整大小的分割线** - 类似VSCode的分割线拖拽功能

---

## 任务一：侧边栏折叠状态用户区域改造

### 1.1 当前问题分析

当前 `Sidebar.js` 在折叠状态下：
- 底部显示登出按钮（🚪图标）
- 没有显示用户头像
- 没有头像上传功能

### 1.2 实现方案

#### 修改文件：`front-end/src/components/Sidebar/Sidebar.js`

**步骤1：添加用户菜单状态**
```javascript
const [showUserMenu, setShowUserMenu] = useState(false);
const userMenuRef = useRef(null);
```

**步骤2：添加点击外部关闭菜单的逻辑**
```javascript
useEffect(() => {
  const handleClickOutside = (event) => {
    if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
      setShowUserMenu(false);
    }
  };
  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);
```

**步骤3：添加头像上传处理函数**
```javascript
const handleAvatarUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  
  // 创建FormData
  const formData = new FormData();
  formData.append('avatar', file);
  
  try {
    // 调用API上传头像
    const { authAPI } = require('../../services/api');
    const response = await authAPI.uploadAvatar(formData);
    if (response.success) {
      // 更新本地用户状态
      loginUser({ ...user, avatar: response.avatarUrl }, token);
    }
  } catch (error) {
    console.error('头像上传失败:', error);
    alert('头像上传失败，请重试');
  }
  setShowUserMenu(false);
};
```

**步骤4：修改底部用户区域渲染逻辑**

将现有的底部区域：
```jsx
<div className="sidebar-footer">
  <div className="sidebar-user">
    {!collapsed && user && (
      <div className="sidebar-user-info">
        <div className="sidebar-user-email">{user.email}</div>
      </div>
    )}
  </div>
  <button className="sidebar-item" onClick={logoutUser} title={collapsed ? '登出' : ''}>
    <span className="sidebar-icon">🚪</span>
    {!collapsed && <span className="sidebar-text">登出</span>}
  </button>
</div>
```

替换为新的用户菜单组件：
```jsx
<div className="sidebar-footer">
  {collapsed ? (
    // 折叠状态：只显示头像，点击弹出菜单
    <div className="sidebar-user-collapsed" ref={userMenuRef}>
      <button 
        className="sidebar-avatar-btn" 
        onClick={() => setShowUserMenu(!showUserMenu)}
        title={user?.email || '用户菜单'}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt="avatar" className="sidebar-avatar-img" />
        ) : (
          <div className="sidebar-avatar-default">
            {user?.email?.charAt(0).toUpperCase() || '👤'}
          </div>
        )}
      </button>
      {showUserMenu && (
        <div className="sidebar-user-menu">
          <label className="sidebar-menu-item">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleAvatarUpload}
              style={{ display: 'none' }}
            />
            <span>📷 上传头像</span>
          </label>
          <button className="sidebar-menu-item" onClick={logoutUser}>
            <span>🚪 登出</span>
          </button>
        </div>
      )}
    </div>
  ) : (
    // 展开状态：显示用户信息和登出按钮
    <>
      <div className="sidebar-user">
        <div className="sidebar-user-info">
          <div className="sidebar-user-email">{user?.email}</div>
        </div>
      </div>
      <button className="sidebar-item" onClick={logoutUser}>
        <span className="sidebar-icon">🚪</span>
        <span className="sidebar-text">登出</span>
      </button>
    </>
  )}
</div>
```

#### 修改文件：`front-end/src/components/Sidebar/Sidebar.css`

**添加新的样式：**

```css
/* 折叠状态下的用户头像按钮 */
.sidebar-user-collapsed {
  position: relative;
  display: flex;
  justify-content: center;
  padding: var(--spacing-sm);
}

.sidebar-avatar-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 2px solid var(--border-primary);
  background: var(--bg-primary);
  cursor: pointer;
  padding: 0;
  overflow: hidden;
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-avatar-btn:hover {
  border-color: var(--primary);
  transform: scale(1.05);
}

.sidebar-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.sidebar-avatar-default {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary-light);
  color: var(--primary);
  font-size: 16px;
  font-weight: 600;
}

/* 用户菜单弹窗 */
.sidebar-user-menu {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  margin-bottom: 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  min-width: 140px;
  z-index: 1000;
  overflow: hidden;
}

.sidebar-user-menu::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: var(--bg-primary);
}

.sidebar-menu-item {
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: var(--transition);
  text-align: left;
}

.sidebar-menu-item:hover {
  background: var(--bg-hover);
}

.sidebar-menu-item input[type="file"] {
  display: none;
}
```

#### 修改文件：`front-end/src/services/api.js`

**添加头像上传接口：**
```javascript
export const authAPI = {
  // ... 现有方法
  
  // 上传头像
  uploadAvatar: (formData) => apiClient.post('/auth/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }),
};
```

---

## 任务二：可拖拽调整大小的分割线

### 2.1 当前问题分析

当前布局中：
- `ConversationArea` 和 `PreviewArea` 使用 `flex: 1` 平分空间
- 中间没有可拖拽的分割线
- 用户无法自定义两个区域的宽度比例

### 2.2 实现方案

#### 修改文件：`front-end/src/components/Layout/Layout.js`

**步骤1：添加拖拽相关状态**
```javascript
const [conversationWidth, setConversationWidth] = useState(50); // 百分比
const [isResizing, setIsResizing] = useState(false);
const layoutMainRef = useRef(null);
```

**步骤2：添加拖拽事件处理**
```javascript
// 开始拖拽
const handleResizeStart = useCallback((e) => {
  e.preventDefault();
  setIsResizing(true);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}, []);

// 拖拽中
const handleResizeMove = useCallback((e) => {
  if (!isResizing || !layoutMainRef.current) return;
  
  const rect = layoutMainRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const percentage = (x / rect.width) * 100;
  
  // 限制最小和最大宽度
  const minWidth = 25; // 最小25%
  const maxWidth = 75; // 最大75%
  const clampedPercentage = Math.max(minWidth, Math.min(maxWidth, percentage));
  
  setConversationWidth(clampedPercentage);
}, [isResizing]);

// 结束拖拽
const handleResizeEnd = useCallback(() => {
  setIsResizing(false);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}, []);

// 添加/移除事件监听
useEffect(() => {
  if (isResizing) {
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  }
  
  return () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
}, [isResizing, handleResizeMove, handleResizeEnd]);
```

**步骤3：修改渲染逻辑，添加分割线**

将现有的布局：
```jsx
<div className={`layout-main ${viewMode === 'preview' ? 'preview-active' : ''}`}>
  {viewMode !== 'preview' && (
    <ConversationArea 
      showPreviewToggle={showToggle}
      onPreviewToggle={handlePreviewToggle}
    />
  )}
  {viewMode === 'split' && <PreviewArea />}
  ...
</div>
```

替换为带分割线的布局：
```jsx
<div 
  ref={layoutMainRef}
  className={`layout-main ${viewMode === 'preview' ? 'preview-active' : ''} ${isResizing ? 'resizing' : ''}`}
>
  {viewMode !== 'preview' && (
    <>
      <ConversationArea 
        showPreviewToggle={showToggle}
        onPreviewToggle={handlePreviewToggle}
        width={conversationWidth}
      />
      {viewMode === 'split' && (
        <div 
          className="layout-resize-handle"
          onMouseDown={handleResizeStart}
          title="拖动调整宽度"
        >
          <div className="layout-resize-indicator"></div>
        </div>
      )}
    </>
  )}
  {viewMode === 'split' && <PreviewArea width={100 - conversationWidth} />}
  {viewMode === 'preview' && (
    <PreviewArea 
      showBackButton={showToggle}
      onBack={handlePreviewToggle}
    />
  )}
</div>
```

#### 修改文件：`front-end/src/components/Layout/Layout.css`

**添加分割线样式：**

```css
.layout-main {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-width: 0;
  position: relative;
}

.layout-main.resizing {
  cursor: col-resize;
}

/* 可拖拽分割线 */
.layout-resize-handle {
  width: 8px;
  background: transparent;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  transition: background-color 0.2s;
}

.layout-resize-handle:hover,
.layout-main.resizing .layout-resize-handle {
  background: var(--primary-light);
}

.layout-resize-indicator {
  width: 2px;
  height: 40px;
  background: var(--border-primary);
  border-radius: 1px;
  transition: background-color 0.2s;
}

.layout-resize-handle:hover .layout-resize-indicator,
.layout-main.resizing .layout-resize-indicator {
  background: var(--primary);
}
```

#### 修改文件：`front-end/src/components/ConversationArea/ConversationArea.js`

**接收并应用宽度属性：**
```javascript
const ConversationArea = ({ showPreviewToggle, onPreviewToggle, width }) => {
  // ... 现有代码
  
  return (
    <div 
      className="conversation-area"
      style={{ flex: `0 0 ${width}%` }}
    >
      {/* ... 现有内容 */}
    </div>
  );
};
```

#### 修改文件：`front-end/src/components/ConversationArea/ConversationArea.css`

**更新样式：**
```css
.conversation-area {
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-primary);
  overflow: hidden;
  /* 移除 flex: 1，改为由父组件传入的 width 控制 */
}
```

#### 修改文件：`front-end/src/components/PreviewArea/PreviewArea.js`

**接收并应用宽度属性：**
```javascript
const PreviewArea = ({ showBackButton, onBack, width }) => {
  // ... 现有代码
  
  return (
    <div 
      className="preview-area"
      style={width ? { flex: `0 0 ${width}%` } : { flex: 1 }}
    >
      {/* ... 现有内容 */}
    </div>
  );
};
```

#### 修改文件：`front-end/src/components/PreviewArea/PreviewArea.css`

**更新样式：**
```css
.preview-area {
  position: relative;
  background-color: var(--bg-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-left: 1px solid var(--border-primary);
  min-width: 300px;
  /* 移除 flex: 1，改为由父组件传入的 width 控制 */
}

/* 移除旧的 resize-handle 样式，使用 Layout 中的新样式 */
```

---

## 后端接口补充（如需要）

### 修改文件：`backend/src/routes/authRoutes.js`

添加头像上传路由：
```javascript
const express = require('express');
const router = express.Router();
const multer = require('multer');
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// 配置multer存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB限制
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('只允许上传图片文件'));
    }
  }
});

// ... 现有路由

// 头像上传
router.post('/avatar', auth, upload.single('avatar'), authController.uploadAvatar);

module.exports = router;
```

### 修改文件：`backend/src/controllers/authController.js`

添加头像上传处理：
```javascript
// 上传头像
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: '没有上传文件' });
    }
    
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    
    // 更新用户头像
    await User.findByIdAndUpdate(req.userId, { avatar: avatarUrl });
    
    res.json({ 
      success: true, 
      avatarUrl: avatarUrl,
      message: '头像上传成功'
    });
  } catch (error) {
    console.error('头像上传失败:', error);
    res.status(500).json({ success: false, message: '头像上传失败' });
  }
};
```

---

## 实现步骤总结

### 第一阶段：侧边栏用户区域改造
1. 修改 `Sidebar.js` - 添加用户菜单状态和头像上传功能
2. 修改 `Sidebar.css` - 添加折叠状态下的头像和菜单样式
3. 修改 `api.js` - 添加头像上传接口（可选，如后端已支持则跳过）

### 第二阶段：可拖拽分割线
1. 修改 `Layout.js` - 添加拖拽逻辑和分割线组件
2. 修改 `Layout.css` - 添加分割线样式
3. 修改 `ConversationArea.js` - 接收并应用宽度属性
4. 修改 `ConversationArea.css` - 更新样式
5. 修改 `PreviewArea.js` - 接收并应用宽度属性
6. 修改 `PreviewArea.css` - 更新样式

---

## 注意事项

1. **头像上传**：如果后端尚未实现头像上传接口，可以先在前端模拟，或者只实现UI部分
2. **拖拽性能**：使用 `requestAnimationFrame` 可以进一步优化拖拽性能（如需要）
3. **响应式**：在小屏幕下（<820px），应禁用拖拽功能，保持现有的切换模式
4. **持久化**：可以考虑将用户调整的宽度比例保存到 localStorage，下次访问时恢复
