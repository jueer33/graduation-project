import React from 'react';
import { useAppStore } from '../../store/store';
import { historyAPI } from '../../services/api';
import TextToDesign from '../Modules/TextToDesign/TextToDesign';
import ImageToDesign from '../Modules/ImageToDesign/ImageToDesign';
import DesignToCode from '../Modules/DesignToCode/DesignToCode';
import './ConversationArea.css';

const ConversationArea = ({ showPreviewToggle, onPreviewToggle, width }) => {
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
    removeHistory,
    currentHistoryId,
    setCurrentHistoryId
  } = useAppStore();

  const [isDragging, setIsDragging] = React.useState(false);
  const fabRef = React.useRef(null);
  const hasMovedRef = React.useRef(false);

  const handleFabMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    hasMovedRef.current = false;
  };

  React.useEffect(() => {
    let startX = 0;
    let startY = 0;

    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      if (!hasMovedRef.current) {
        startX = e.clientX;
        startY = e.clientY;
        hasMovedRef.current = true;
      }

      const container = fabRef.current?.parentElement;
      if (!container) return;
      
      const containerRect = container.getBoundingClientRect();
      const rect = fabRef.current.getBoundingClientRect();
      const newX = e.clientX - containerRect.left - (startX - rect.left);
      const newY = e.clientY - containerRect.top - (startY - rect.top);
      
      const maxX = containerRect.width - 60;
      const maxY = containerRect.height - 60;
      
      if (fabRef.current) {
        fabRef.current.style.left = `${Math.max(0, Math.min(maxX, newX))}px`;
        fabRef.current.style.top = `${Math.max(0, Math.min(maxY, newY))}px`;
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleNewConversation = async () => {
    if (isDragging || hasMovedRef.current) return;
    
    const conversations = getCurrentConversations();
    const hasContent = conversations.length > 0 || currentDesignJson || currentCode;

    if (!hasContent) {
      clearConversations();
      setCurrentHistoryId(null);
      return;
    }

    try {
      const firstUserMessage = conversations.find(m => m.type === 'user');
      const userInput = firstUserMessage?.content ||
                       (firstUserMessage?.image ? '上传图片' : '');

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

      if (currentHistoryId) {
        try {
          await historyAPI.update(currentHistoryId, saveData);
          console.log('历史记录已更新:', currentHistoryId);
        } catch (error) {
          console.error('更新历史记录失败:', error);
        }
      } else {
        const newHistory = {
          ...saveData,
          _id: `temp_${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        addHistory(newHistory, currentModule);

        try {
          const response = await historyAPI.create(saveData);
          if (response.success && response.data) {
            removeHistory(newHistory._id, currentModule);
            addHistory(response.data, currentModule);
          }
        } catch (error) {
          console.error('保存历史记录失败:', error);
          removeHistory(newHistory._id, currentModule);
        }
      }

      clearConversations();
      setCurrentDesignJson(null);
      setCurrentCode(null);
      setPreviewState('hidden');
      setCurrentHistoryId(null);
    } catch (error) {
      console.error('新建对话失败:', error);
      clearConversations();
      setCurrentHistoryId(null);
    }
  };

  const getModuleTitle = () => {
    switch (currentModule) {
      case 'text-to-design':
        return '文本生成设计';
      case 'image-to-design':
        return '图片生成设计';
      case 'design-to-code':
        return '设计生成代码';
      default:
        return '对话';
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
    <div 
      className="conversation-area"
      style={width ? { flex: `0 0 ${width}%` } : { flex: 1 }}
    >
      <div className="conversation-header">
        <span className="conversation-header-title">{getModuleTitle()}</span>
        <button
          ref={fabRef}
          className={`fab-button ${isDragging ? 'dragging' : ''}`}
          onMouseDown={handleFabMouseDown}
          onClick={handleNewConversation}
          title="新建对话"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
        </button>
      </div>
      <div className="conversation-content">
        {renderModule()}
      </div>
    </div>
  );
};

export default ConversationArea;
