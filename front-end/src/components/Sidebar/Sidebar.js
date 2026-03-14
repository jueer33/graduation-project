import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/store';
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
  const { currentModule, setCurrentModule, sidebarCollapsed, setSidebarCollapsed, toggleTheme, theme, user, logoutUser, currentHistoryId, currentDesignJson, getCurrentConversations, addHistory, resetDesignModified, currentCode } = useAppStore();
  const [isAutoCollapsed, setIsAutoCollapsed] = useState(false);

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

  const handleToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleMenuClick = async (moduleId) => {
    // 如果切换到不同模块，先保存当前对话
    if (moduleId !== currentModule) {
      await saveCurrentConversation();
    }

    setCurrentModule(moduleId);
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
    </div>
  );
};

export default Sidebar;

