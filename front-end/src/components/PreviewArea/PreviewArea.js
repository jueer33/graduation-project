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
    resetDesignModified,
    getCurrentConversations
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
   * 注意：这里不直接更新全局状态，只在保存时更新
   */
  const handleDesignChange = (newDesignJson) => {
    // 不更新全局状态，避免影响其他历史记录
    // 设计稿的更改只在 VisualEditor 内部状态维护
    // 保存时才更新到历史记录
  };

  /**
   * 处理保存设计
   * 更新现有的历史记录，同时保存对话内容和设计稿
   */
  const handleSaveDesign = async (designJson) => {
    setIsSaving(true);

    try {
      // 获取当前对话内容
      const currentConversations = getCurrentConversations();

      // 使用store中的currentHistoryId
      let historyId = currentHistoryId;

      console.log('保存时当前历史记录ID:', historyId);

      // 如果有历史记录ID，更新后端的历史记录
      if (historyId) {
        const updateData = {
          designJson: designJson,
          conversations: currentConversations,
          updatedAt: new Date().toISOString()
        };

        await historyAPI.update(historyId, updateData);
        console.log('历史记录已更新（包含对话内容）:', historyId);

        // 更新前端历史记录列表中的对应项，而不是重新加载
        const updatedHistories = histories.map(h =>
          h._id === historyId
            ? { ...h, designJson: designJson, conversations: currentConversations, updatedAt: new Date().toISOString() }
            : h
        );
        setHistoriesForModule(updatedHistories, currentModule);

        // 更新当前设计稿（只更新当前历史记录对应的）
        setCurrentDesignJson(designJson);
      } else {
        // 如果没有历史记录ID，说明这是新对话，创建新的历史记录
        console.log('未找到历史记录ID，创建新记录');
        const userInput = currentConversations.find(m => m.type === 'user')?.content || '';
        const historyData = {
          moduleType: currentModule,
          userInput: userInput,
          designJson: designJson,
          conversations: currentConversations,
          createdAt: new Date().toISOString()
        };

        const response = await historyAPI.create(historyData);
        if (response.success && response.data._id) {
          // 设置当前历史记录ID
          setCurrentHistoryId(response.data._id);
          console.log('新历史记录已创建（包含对话内容）:', response.data._id);

          // 将新记录添加到列表开头
          setHistoriesForModule([response.data, ...histories], currentModule);

          // 更新当前设计稿
          setCurrentDesignJson(designJson);
        }
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
      // key 使用 currentHistoryId 确保每个历史记录有独立的设计稿实例
      return (
        <VisualEditor
          key={currentHistoryId || 'new'}
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
