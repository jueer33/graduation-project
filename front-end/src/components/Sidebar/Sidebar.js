import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/store';
import { useToast } from '../Toast/ToastContext';
import { historyAPI } from '../../services/api';
import SidebarHistory from './SidebarHistory';
import './Sidebar.css';
import './SidebarHistory.css';

const menuItems = [
  { id: 'text-to-design', name: '文本生成设计', icon: '📝' },
  { id: 'image-to-design', name: '图片生成设计', icon: '🖼️' },
  { id: 'design-to-code', name: '设计生成代码', icon: '💻' }
];

const Sidebar = () => {
  const { showToast } = useToast();
  
  const { currentModule, setCurrentModule, sidebarCollapsed, setSidebarCollapsed, toggleTheme, theme, user, logoutUser, loginUser, token, currentHistoryId, currentDesignJson, getCurrentConversations, addHistory, resetDesignModified, currentCode, generateNewSession, currentSessionId } = useAppStore();
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const shouldCollapse = window.innerWidth < 1024; // 修改为1024px自动折叠
      setIsAutoCollapsed(shouldCollapse);
      if (shouldCollapse) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setSidebarCollapsed]);

  // 点击外部关闭用户菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  // 头像上传处理
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      showToast('请选择图片文件', 'warning');
      return;
    }

    // 检查文件大小（最大5MB）
    if (file.size > 5 * 1024 * 1024) {
      showToast('图片大小不能超过5MB', 'warning');
      return;
    }
    
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
      showToast('头像上传失败，请重试', 'error');
    }
    setShowUserMenu(false);
  };

  const handleMenuClick = async (moduleId) => {
    // 如果切换到不同模块，先保存当前对话
    if (moduleId !== currentModule) {
      await saveCurrentConversation();
    }

    // 生成新会话ID并导航到新路由
    const newSessionId = generateNewSession();
    navigate(`/${moduleId}/${newSessionId}`);
    
    if (isAutoCollapsed) {
      setSidebarCollapsed(true);
    }
  };

  // 保存当前对话的函数
  const saveCurrentConversation = async () => {
    const currentConversations = getCurrentConversations();
    const hasContent = currentConversations.length > 0 || currentDesignJson || currentCode;

    if (!hasContent) return;

    // 获取第一个用户消息作为userInput
    const firstUserMessage = currentConversations.find(m => m.type === 'user');
    const userInput = firstUserMessage?.content || (firstUserMessage?.image ? '上传图片' : '未命名对话');

    const saveData = {
      moduleType: currentModule,
      userInput: userInput,
      conversations: currentConversations,
      designJson: currentDesignJson,
      generatedCode: currentCode,
      sessionId: currentSessionId,
      updatedAt: new Date().toISOString()
    };

    if (currentHistoryId) {
      // 更新现有历史记录
      try {
        await historyAPI.update(currentHistoryId, saveData);
        console.log('切换模块前保存历史记录:', currentHistoryId);
      } catch (error) {
        console.error('切换模块前保存历史记录失败:', error);
      }
    } else {
      // 创建新历史记录
      try {
        const response = await historyAPI.create(saveData);
        if (response.success && response.data._id) {
          console.log('切换模块前创建历史记录:', response.data._id);
          addHistory(response.data, currentModule);
        }
      } catch (error) {
        console.error('切换模块前创建历史记录失败:', error);
      }
    }

    // 重置修改标记
    resetDesignModified();
  };

  const collapsed = sidebarCollapsed || isAutoCollapsed;

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!collapsed && <h2 className="sidebar-title">AI代码生成</h2>}
        <div className="sidebar-header-actions">
          {!collapsed && (
            <button className="sidebar-toggle theme-toggle" onClick={toggleTheme} title={theme === 'light' ? '切换暗色' : '切换亮色'}>
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
          )}
          <button className="sidebar-toggle" onClick={handleToggle} title={collapsed ? '展开' : '折叠'}>
            {collapsed ? '☰' : '✕'}
          </button>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${currentModule === item.id ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.id)}
            title={collapsed ? item.name : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {!collapsed && <span className="sidebar-text">{item.name}</span>}
          </button>
        ))}
      </nav>

      {!collapsed && <SidebarHistory />}

      <div className="sidebar-footer">
        <div className="sidebar-user-wrapper" ref={userMenuRef}>
          {collapsed ? (
            // 折叠状态：只显示头像
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
          ) : (
            // 展开状态：显示用户头像和邮箱，点击头像弹出菜单
            <div className="sidebar-user-expanded">
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
              <div className="sidebar-user-info" onClick={() => setShowUserMenu(!showUserMenu)}>
                <div className="sidebar-user-email">{user?.email}</div>
              </div>
            </div>
          )}
          
          {/* 用户菜单弹窗 */}
          {showUserMenu && (
            <div className={`sidebar-user-menu ${collapsed ? 'collapsed' : 'expanded'}`}>
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
      </div>
    </div>
  );
};

export default Sidebar;

