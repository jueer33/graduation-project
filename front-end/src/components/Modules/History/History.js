import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../store/store';
import { historyAPI } from '../../../services/api';
import './History.css';

const History = () => {
  const { 
    setCurrentDesignJson,
    setCurrentCode,
    setPreviewState,
    setCurrentModule 
  } = useAppStore();
  
  const [histories, setHistories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadHistories();
  }, [page]);

  const loadHistories = async () => {
    setLoading(true);
    try {
      const response = await historyAPI.getList(page, 20);
      if (response.success) {
        if (page === 1) {
          setHistories(response.data);
        } else {
          setHistories(prev => [...prev, ...response.data]);
        }
        setHasMore(response.data.length === 20);
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (history) => {
    try {
      const detailResponse = await historyAPI.getDetail(history._id);
      if (detailResponse.success) {
        const detail = detailResponse.data;
        
        if (detail.designJson) {
          setCurrentDesignJson(detail.designJson);
          setPreviewState('design');
        }
        
        if (detail.generatedCode) {
          setCurrentCode(detail.generatedCode);
          setPreviewState('code');
        }
        
        // 切换到对应模块
        setCurrentModule(detail.moduleType);
      }
    } catch (error) {
      console.error('恢复历史记录失败:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('确定要删除这条历史记录吗？')) return;
    
    try {
      await historyAPI.delete(id);
      setHistories(prev => prev.filter(h => h._id !== id));
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const getModuleName = (type) => {
    const map = {
      'text-to-design': '文本生成设计',
      'image-to-design': '图片生成设计',
      'design-to-code': '设计生成代码'
    };
    return map[type] || type;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('zh-CN');
  };

  return (
    <div className="history">
      <div className="history-header">
        <h2>历史记录</h2>
      </div>
      <div className="history-list">
        {histories.length === 0 && !loading ? (
          <div className="history-empty">暂无历史记录</div>
        ) : (
          histories.map(history => (
            <div key={history._id} className="history-item">
              <div className="history-info">
                <div className="history-title">{getModuleName(history.moduleType)}</div>
                <div className="history-meta">
                  <span>{formatDate(history.createdAt)}</span>
                  {history.framework && (
                    <span className="history-framework">{history.framework.toUpperCase()}</span>
                  )}
                </div>
                {history.userInput && (
                  <div className="history-input">{history.userInput}</div>
                )}
              </div>
              <div className="history-actions">
                <button
                  className="history-btn restore"
                  onClick={() => handleRestore(history)}
                >
                  恢复
                </button>
                <button
                  className="history-btn delete"
                  onClick={() => handleDelete(history._id)}
                >
                  删除
                </button>
              </div>
            </div>
          ))
        )}
        {loading && <div className="history-loading">加载中...</div>}
        {hasMore && !loading && (
          <button
            className="history-load-more"
            onClick={() => setPage(prev => prev + 1)}
          >
            加载更多
          </button>
        )}
      </div>
    </div>
  );
};

export default History;

