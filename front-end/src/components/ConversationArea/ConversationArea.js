import React from 'react';
import { useAppStore } from '../../store/store';
import { historyAPI } from '../../services/api';
import TextToDesign from '../Modules/TextToDesign/TextToDesign';
import ImageToDesign from '../Modules/ImageToDesign/ImageToDesign';
import DesignToCode from '../Modules/DesignToCode/DesignToCode';
import './ConversationArea.css';

const ConversationArea = ({ showPreviewToggle, onPreviewToggle }) => {
  const { 
    currentModule, 
    clearConversations, 
    getCurrentConversations,
    currentDesignJson,
    currentCode,
    previewState,
    setCurrentDesignJson,
    setCurrentCode,
    setPreviewState,
    addHistory,
    removeHistory
  } = useAppStore();

  const handleNewConversation = async () => {
    const conversations = getCurrentConversations();
    const hasContent = conversations.length > 0 || currentDesignJson || currentCode;
    
    if (!hasContent) {
      clearConversations();
      return;
    }

    try {
      // 保存当前对话为历史记录
      // 获取第一个用户消息作为userInput
      const firstUserMessage = conversations.find(m => m.type === 'user');
      const userInput = firstUserMessage?.content || 
                       (firstUserMessage?.image ? '上传图片' : '');
      
      // 确定framework
      let framework = null;
      if (currentCode && currentCode.type) {
        framework = currentCode.type;
      }
      
      const saveData = {
        moduleType: currentModule,
        userInput: userInput,
        conversations: conversations,
        designJson: currentDesignJson,
        generatedCode: currentCode,
        framework: framework
      };
      
      // 先更新前端状态
      const newHistory = {
        ...saveData,
        _id: `temp_${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      addHistory(newHistory, currentModule);
      
      // 然后同步到后端
      try {
        const response = await historyAPI.create(saveData);
        if (response.success && response.data) {
          // 更新为真实的ID
          removeHistory(newHistory._id, currentModule);
          addHistory(response.data, currentModule);
        }
      } catch (error) {
        console.error('保存历史记录失败:', error);
        // 如果后端保存失败，移除前端临时记录
        removeHistory(newHistory._id, currentModule);
      }
      
      // 清空当前对话和预览内容
      clearConversations();
      setCurrentDesignJson(null);
      setCurrentCode(null);
      setPreviewState('hidden');
    } catch (error) {
      console.error('新建对话失败:', error);
      clearConversations();
    }
  };

  const renderModule = () => {
    switch (currentModule) {
      case 'text-to-design':
        return <TextToDesign />;
      case 'image-to-design':
        return <ImageToDesign />;
      case 'design-to-code':
        return <DesignToCode />;
      default:
        return <TextToDesign />;
    }
  };

  return (
    <div className="conversation-area">
      <div className="conversation-area-header">
        <button
          className="new-conversation-btn"
          onClick={handleNewConversation}
          title="新建对话"
        >
          ➕ 新建对话
        </button>
        {showPreviewToggle && (
          <button
            className="preview-toggle-btn"
            onClick={onPreviewToggle}
          >
            预览
          </button>
        )}
      </div>
      <div className="conversation-content">
        {renderModule()}
      </div>
    </div>
  );
};

export default ConversationArea;
