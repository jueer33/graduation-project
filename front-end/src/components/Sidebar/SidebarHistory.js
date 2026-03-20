import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/store';
import { historyAPI } from '../../services/api';
import './SidebarHistory.css';

const SidebarHistory = () => {
  const {
    currentModule,
    setCurrentModule,
    setCurrentDesignJson,
    setCurrentCode,
    setPreviewState,
    setConversationsForModule,
    sidebarCollapsed,
    getCurrentHistories,
    setHistoriesForModule,
    removeHistory,
    setCurrentHistoryId,
    currentHistoryId,
    currentDesignJson,
    getCurrentConversations,
    isDesignModified,
    resetDesignModified,
    addHistory,
    restoreHistory
  } = useAppStore();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const histories = getCurrentHistories();

  useEffect(() => {
    const loadHistories = async () => {
      setLoading(true);
      try {
        const response = await historyAPI.getList(1, 10);
        if (response.success) {
          const filtered = response.data.filter(h => h.moduleType === currentModule);
          setHistoriesForModule(filtered, currentModule);
        }
      } catch (error) {
        console.error('加载历史记录失败:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadHistories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentModule]);

  const handleRestore = async (history) => {
    try {
      console.log('SidebarHistory: restoring history:', history._id);
      
      // 1. 先保存当前对话（如果有内容）
      const currentConversations = getCurrentConversations();
      const hasContent = currentConversations.length > 0 || currentDesignJson;

      if (hasContent) {
        // 获取第一个用户消息作为userInput
        const firstUserMessage = currentConversations.find(m => m.type === 'user');
        const userInput = firstUserMessage?.content || (firstUserMessage?.image ? '上传图片' : '未命名对话');

        const saveData = {
          moduleType: currentModule,
          userInput: userInput,
          conversations: currentConversations,
          designJson: currentDesignJson,
          updatedAt: new Date().toISOString()
        };

        if (currentHistoryId) {
          // 更新现有历史记录
          try {
            await historyAPI.update(currentHistoryId, saveData);
            console.log('当前历史记录已保存:', currentHistoryId);
          } catch (error) {
            console.error('保存当前历史记录失败:', error);
          }
        } else {
          // 创建新历史记录
          try {
            const response = await historyAPI.create(saveData);
            if (response.success && response.data._id) {
              console.log('新历史记录已创建:', response.data._id);
              // 更新前端列表
              addHistory(response.data, currentModule);
            }
          } catch (error) {
            console.error('创建历史记录失败:', error);
          }
        }

        // 重置修改标记
        resetDesignModified();
      }

      // 2. 获取要恢复的历史记录详情
      const detailResponse = await historyAPI.getDetail(history._id);
      if (detailResponse.success) {
        const detail = detailResponse.data;
        console.log('SidebarHistory: detail response:', detail);

        // 恢复历史记录到store
        const sessionId = restoreHistory(detail, detail.moduleType);
        console.log('SidebarHistory: sessionId:', sessionId);
        
        // 导航到对应的路由
        navigate(`/${detail.moduleType || currentModule}/${sessionId}`);
        
        console.log('历史记录已恢复:', history._id);
      }
    } catch (error) {
      console.error('恢复历史记录失败:', error);
    }
  };

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

  const getTagLabel = (history) => {
    if (history.framework) {
      return history.framework.toUpperCase();
    }
    if (history.designJson) {
      return 'DESIGN';
    }
    return '';
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return `${days}天前`;
    } else {
      return d.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
    }
  };

  if (sidebarCollapsed) {
    return null;
  }

  return (
    <div className="sidebar-history">
      <div className="sidebar-history-header">历史记录</div>
      <div className="sidebar-history-list">
        {loading ? (
          <div className="sidebar-history-loading">加载中...</div>
        ) : histories.length === 0 ? (
          <div className="sidebar-history-empty">暂无记录</div>
        ) : (
          histories.map(history => (
            <div
              key={history._id}
              className={`sidebar-history-item ${history._id === currentHistoryId ? 'active' : ''}`}
              onClick={() => handleRestore(history)}
              onMouseEnter={() => setHoveredId(history._id)}
              onMouseLeave={() => setHoveredId(null)}
              title={history.title || history.userInput || '点击恢复'}
            >
              <div className="sidebar-history-content">
                <div className="sidebar-history-time">{formatDate(history.createdAt)}</div>
                {(history.title || history.userInput) && (
                  <div className="sidebar-history-text">
                    {(history.title || history.userInput).length > 20 
                      ? (history.title || history.userInput).substring(0, 20) + '...'
                      : (history.title || history.userInput)}
                  </div>
                )}
                {getTagLabel(history) && (
                  <div className="sidebar-history-tag">{getTagLabel(history)}</div>
                )}
              </div>
              {hoveredId === history._id && (
                <button
                  className="sidebar-history-delete"
                  onClick={(e) => handleDelete(e, history._id)}
                  title="删除"
                >
                  ×
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SidebarHistory;
