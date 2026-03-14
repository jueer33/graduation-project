import React, { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/store';
import DesignPreview from '../DesignPreview/DesignPreview';
import CodePreview from '../CodePreview/CodePreview';
import VisualEditor from '../VisualEditor';
import Placeholder from '../Placeholder/Placeholder';
import { historyAPI } from '../../services/api';
import './PreviewArea.css';

const PreviewArea = ({ showBackButton, onBack }) => {
  const { 
    previewState, 
    currentDesignJson, 
    currentCode,
    setCurrentDesignJson,
    currentModule,
    getCurrentHistories,
    setHistoriesForModule,
    currentHistoryId,
    setCurrentHistoryId,
    resetDesignModified
  } = useAppStore();
  
  const [isSaving, setIsSaving] = useState(false);
  
  const histories = getCurrentHistories();

  // 加载历史记录列表
  const loadHistories = useCallback(async () => {
    try {
      const response = await historyAPI.getList(1, 20);
      if (response.success) {
        const filtered = response.data.filter(h => h.moduleType === currentModule);
        setHistoriesForModule(filtered, currentModule);
        console.log('历史记录已加载:', filtered.length, '条');
        return filtered;
      }
    } catch (error) {
      console.error('加载历史记录失败:', error);
    }
    return [];
  }, [currentModule, setHistoriesForModule]);

  // 组件挂载时加载历史记录
  useEffect(() => {
    loadHistories();
  }, [loadHistories]);

  if (previewState === 'hidden') {
    return null;
  }

  /**
   * 处理Design JSON变化
   */
  const handleDesignChange = (newDesignJson) => {
    setCurrentDesignJson(newDesignJson);
  };

  /**
   * 处理保存设计
   * 更新现有的历史记录，而不是创建新的
   */
  const handleSaveDesign = async (designJson) => {
    setIsSaving(true);
    
    try {
      // 更新当前Design JSON（前端状态）
      setCurrentDesignJson(designJson);
      
      // 使用store中的currentHistoryId
      let historyId = currentHistoryId;
      
      console.log('保存时当前历史记录ID:', historyId);
      
      // 如果有历史记录ID，更新后端的历史记录
      if (historyId) {
        const updateData = {
          designJson: designJson,
          updatedAt: new Date().toISOString()
        };
        
        await historyAPI.update(historyId, updateData);
        console.log('历史记录已更新:', historyId);
        
        // 重新加载历史记录列表
        await loadHistories();
      } else {
        // 如果没有历史记录ID，说明这是新对话，创建新的历史记录
        console.log('未找到历史记录ID，创建新记录');
        const historyData = {
          moduleType: currentModule,
          designJson: designJson,
          createdAt: new Date().toISOString()
        };
        
        const response = await historyAPI.create(historyData);
        if (response.success && response.data._id) {
          // 设置当前历史记录ID
          setCurrentHistoryId(response.data._id);
          console.log('新历史记录已创建:', response.data._id);
        }
        
        // 重新加载历史记录列表
        await loadHistories();
      }
      
      // 重置修改状态
      resetDesignModified();
      
      // 显示保存成功提示
      alert('设计稿已保存！');
    } catch (error) {
      console.error('保存失败:', error);
      alert('保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (previewState === 'design' && currentDesignJson) {
      // 使用可视化编辑器替代简单的DesignPreview
      return (
        <VisualEditor
          initialDesignJson={currentDesignJson}
          onChange={handleDesignChange}
          onSave={handleSaveDesign}
          isSaving={isSaving}
        />
      );
    } else if (previewState === 'code' && currentCode) {
      return <CodePreview code={currentCode} />;
    } else {
      return <Placeholder message="暂无预览内容" />;
    }
  };

  return (
    <div className="preview-area">
      {showBackButton && (
        <div className="preview-toggle-bar">
          <button
            className="preview-toggle-btn"
            onClick={onBack}
          >
            返回对话
          </button>
        </div>
      )}
      <div className="preview-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PreviewArea;
