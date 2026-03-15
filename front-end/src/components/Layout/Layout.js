import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useAppStore } from '../../store/store';
import Sidebar from '../Sidebar/Sidebar';
import ConversationArea from '../ConversationArea/ConversationArea';
import PreviewArea from '../PreviewArea/PreviewArea';
import Login from '../Auth/Login';
import './Layout.css';

const Layout = () => {
  const { user, token, loginUser, currentDesignJson, currentHistoryId, isDesignModified, getCurrentConversations, currentModule, currentCode, isGenerating } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('split'); // 'split' | 'conversation' | 'preview'
  const [showToggle, setShowToggle] = useState(false);
  
  // 拖拽调整大小相关状态
  const [conversationWidth, setConversationWidth] = useState(50); // 百分比
  const [isResizing, setIsResizing] = useState(false);
  const layoutMainRef = useRef(null);

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

  // 拖拽调整大小事件处理
  const handleResizeStart = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, []);

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

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  // 添加/移除拖拽事件监听
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

  // 页面关闭前自动保存
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      const currentConversations = getCurrentConversations();
      const hasContent = currentConversations.length > 0 || currentDesignJson || currentCode;

      // 如果有内容，尝试自动保存
      if (hasContent) {
        // 获取第一个用户消息作为userInput
        const firstUserMessage = currentConversations.find(m => m.type === 'user');
        const userInput = firstUserMessage?.content || (firstUserMessage?.image ? '上传图片' : '未命名对话');

        if (currentHistoryId) {
          // 更新现有历史记录
          const data = {
            designJson: currentDesignJson,
            generatedCode: currentCode,
            conversations: currentConversations,
            updatedAt: new Date().toISOString()
          };

          try {
            const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
            navigator.sendBeacon(
              `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history/${currentHistoryId}`,
              blob
            );
            console.log('页面关闭前更新历史记录:', currentHistoryId);
            return;
          } catch (error) {
            console.error('自动保存失败:', error);
          }
        } else {
          // 创建新历史记录
          const createData = {
            moduleType: currentModule,
            userInput: userInput,
            designJson: currentDesignJson,
            generatedCode: currentCode,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          };

          try {
            const blob = new Blob([JSON.stringify(createData)], { type: 'application/json' });
            navigator.sendBeacon(
              `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history`,
              blob
            );
            console.log('页面关闭前创建历史记录');
            return;
          } catch (error) {
            console.error('自动保存失败:', error);
          }
        }

        // 如果无法自动保存且设计稿被修改过，提示用户
        if (isDesignModified) {
          const message = '您有未保存的设计稿，确定要离开吗？';
          e.returnValue = message;
          return message;
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDesignModified, currentHistoryId, currentDesignJson, currentModule, currentCode]);

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
            {viewMode === 'split' && !showToggle && (
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
        {viewMode === 'split' && <PreviewArea width={100 - conversationWidth} loading={isGenerating} />}
        {viewMode === 'preview' && (
          <PreviewArea 
            showBackButton={showToggle}
            onBack={handlePreviewToggle}
            loading={isGenerating}
          />
        )}
      </div>
    </div>
  );
};

export default Layout;
