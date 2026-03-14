import React, { useState, useEffect } from 'react';
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
    setCurrentHistoryId
  } = useAppStore();
  
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
      const detailResponse = await historyAPI.getDetail(history._id);
      if (detailResponse.success) {
        const detail = detailResponse.data;
        
        // 设置当前编辑的历史记录ID
        setCurrentHistoryId(history._id);
        console.log('设置当前历史记录ID:', history._id);
        
        // 切换到对应的模块
        if (detail.moduleType) {
          setCurrentModule(detail.moduleType);
        }
        
        // 恢复对话内容
        if (detail.conversations && detail.conversations.length > 0) {
          setConversationsForModule(detail.conversations, detail.moduleType || currentModule);
        }
        
        // 恢复预览内容
        if (detail.designJson) {
          setCurrentDesignJson(detail.designJson);
          setPreviewState('design');
        }
        
        if (detail.generatedCode) {
          setCurrentCode(detail.generatedCode);
          setPreviewState('code');
        }
      }
    } catch (error) {
      console.error('恢复历史记录失败:', error);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('确定要删除这条历史记录吗？')) return;
    
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
          histories.slice(0, 5).map(history => (
            <div
              key={history._id}
              className="sidebar-history-item"
              onClick={() => handleRestore(history)}
              onMouseEnter={() => setHoveredId(history._id)}
              onMouseLeave={() => setHoveredId(null)}
              title={history.userInput || '点击恢复'}
            >
              <div className="sidebar-history-content">
                <div className="sidebar-history-time">{formatDate(history.createdAt)}</div>
                {history.userInput && (
                  <div className="sidebar-history-text">
                    {history.userInput.length > 20 
                      ? history.userInput.substring(0, 20) + '...'
                      : history.userInput}
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
