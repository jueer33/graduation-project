import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/store';
import { useToast } from '../Toast/ToastContext';
import DesignPreview from '../DesignPreview/DesignPreview';
import CodePreview from '../CodePreview/CodePreview';
import VisualEditor from '../VisualEditor';
import SkeletonScreen from '../SkeletonScreen/SkeletonScreen';
import Placeholder from '../Placeholder/Placeholder';
import { historyAPI } from '../../services/api';
import './PreviewArea.css';

const PreviewArea = ({ showBackButton, onBack, width, loading = false }) => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  
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
    getCurrentConversations,
    setConversationsForModule,
    currentSessionId,
    setPendingDesignJson,
    setCodeGenerationMode
  } = useAppStore();

  const [isSaving, setIsSaving] = useState(false);

  const histories = getCurrentHistories();

  const handleGenerateCode = useCallback(() => {
    if (!currentDesignJson) {
      showToast('请先生成设计稿', 'warning');
      return;
    }

    // 保存设计稿到 pending 状态
    setPendingDesignJson(currentDesignJson);
    setCodeGenerationMode('design');

    // 为代码生成模块创建新会话（不在当前模块创建，避免留下空会话）
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    navigate(`/design-to-code/${newSessionId}`);
    showToast('已切换到代码生成模块', 'success');
  }, [currentDesignJson, setPendingDesignJson, setCodeGenerationMode, navigate, showToast]);

  if (previewState === 'hidden') {
    return null;
  }

  /**
   * 处理Design JSON变化
   * 更新全局状态，确保AI下次对话能获取到修改后的设计稿
   */
  const handleDesignChange = (newDesignJson) => {
    // 更新全局状态，这样下次对话时会传递给AI
    setCurrentDesignJson(newDesignJson);
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

      // 更新对话历史中最后一条 AI 消息的 designJson
      // 这样下次发送请求时会使用最新的设计稿
      const updatedConversations = currentConversations.map(msg => {
        if (msg.type === 'assistant' && msg.designJson) {
          return { ...msg, designJson: designJson };
        }
        return msg;
      });
      
      // 更新前端对话状态
      setConversationsForModule(updatedConversations, currentModule);
      console.log('对话历史中的 designJson 已更新');

      // 如果有历史记录ID，更新后端的历史记录
      if (historyId) {
        const updateData = {
          designJson: designJson,
          conversations: updatedConversations,
          updatedAt: new Date().toISOString()
        };

        await historyAPI.update(historyId, updateData);
        console.log('历史记录已更新（包含对话内容）:', historyId);

        // 更新前端历史记录列表中的对应项，而不是重新加载
        const updatedHistories = histories.map(h =>
          h._id === historyId
            ? { ...h, designJson: designJson, conversations: updatedConversations, updatedAt: new Date().toISOString() }
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
          title: userInput || '未命名设计',
          userInput: userInput,
          designJson: designJson,
          conversations: updatedConversations,
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
      showToast('设计稿已保存！', 'success');
    } catch (error) {
      console.error('保存失败:', error);
      showToast('保存失败，请重试', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return <SkeletonScreen />;
    }

    if (currentModule === 'design-to-code') {
      if (currentCode) {
        return <CodePreview code={currentCode} />;
      }
      return <Placeholder message="生成代码后将在此处预览" />;
    }
    
    if (previewState === 'design' && currentDesignJson) {
      return (
        <div className="design-preview-wrapper">
          <div className="design-preview-actions">
            <button 
              className="generate-code-btn"
              onClick={handleGenerateCode}
              title="将设计稿转换为代码"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              生成代码
            </button>
          </div>
          <VisualEditor
            key={currentHistoryId || 'visual-editor'}
            initialDesignJson={currentDesignJson}
            onChange={handleDesignChange}
            onSave={handleSaveDesign}
            isSaving={isSaving}
          />
        </div>
      );
    } else if (previewState === 'code' && currentCode) {
      return <CodePreview code={currentCode} />;
    } else {
      return <Placeholder message="暂无预览内容" />;
    }
  };

  return (
    <div 
      className="preview-area"
      style={width ? { flex: `0 0 ${width}%` } : { flex: 1 }}
    >
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
