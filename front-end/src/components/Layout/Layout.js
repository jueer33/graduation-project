import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../store/store';
import Sidebar from '../Sidebar/Sidebar';
import ConversationArea from '../ConversationArea/ConversationArea';
import PreviewArea from '../PreviewArea/PreviewArea';
import Login from '../Auth/Login';
import './Layout.css';

const Layout = () => {
  const { user, token, loginUser } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'conversation' | 'preview'
  const [showToggle, setShowToggle] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      // 侧边栏宽度约220px（或折叠时60px），两个区域最小宽度300px*2=600px
      // 当屏幕宽度小于820px时，需要切换模式
      const needsToggle = window.innerWidth < 820;
      setShowToggle(needsToggle);
      if (!needsToggle) {
        setViewMode('split');
      } else if (viewMode === 'split') {
        setViewMode('conversation');
      }
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, [viewMode]);

  useEffect(() => {
    // 检查用户登录状态
    const checkAuth = async () => {
      if (token) {
        try {
          const { authAPI } = require('../../services/api');
          const response = await authAPI.getMe();
          loginUser(response.user, token);
        } catch (error) {
          console.error('认证失败:', error);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token, loginUser]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const handlePreviewToggle = () => {
    setViewMode(viewMode === 'conversation' ? 'preview' : 'conversation');
  };

  return (
    <div className="layout">
      <Sidebar />
      <div className={`layout-main ${viewMode === 'preview' ? 'preview-active' : ''}`}>
        {viewMode !== 'preview' && (
          <ConversationArea 
            showPreviewToggle={showToggle}
            onPreviewToggle={handlePreviewToggle}
          />
        )}
        {viewMode === 'split' && <PreviewArea />}
        {viewMode === 'preview' && (
          <PreviewArea 
            showBackButton={showToggle}
            onBack={handlePreviewToggle}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;

