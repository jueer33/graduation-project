import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/store';
import SidebarHistory from './SidebarHistory';
import './Sidebar.css';
import './SidebarHistory.css';

const menuItems = [
  { id: 'text-to-design', name: '文本生成设计', icon: '📝' },
  { id: 'image-to-design', name: '图片生成设计', icon: '🖼️' },
  { id: 'design-to-code', name: '设计生成代码', icon: '💻' }
];

const Sidebar = () => {
  const { currentModule, setCurrentModule, sidebarCollapsed, setSidebarCollapsed, toggleTheme, theme, user, logoutUser } = useAppStore();
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

  const handleMenuClick = (moduleId) => {
    setCurrentModule(moduleId);
    if (isAutoCollapsed) {
      setSidebarCollapsed(true);
    }
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

