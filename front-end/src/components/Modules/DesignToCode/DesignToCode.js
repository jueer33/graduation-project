import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI, historyAPI } from '../../../services/api';
import MessageList from '../../MessageList/MessageList';
import InputArea from '../../InputArea/InputArea';
import DesignThumbnail from '../../DesignThumbnail/DesignThumbnail';
import './DesignToCode.css';

const DesignToCode = () => {
  const {
    currentDesignJson,
    setCurrentCode,
    setPreviewState,
    addConversation,
    getCurrentConversations,
    currentModule,
    currentHistoryId,
    currentCode,
    setCurrentHistoryId,
    addHistory,
    pendingDesignJson,
    codeGenerationMode,
    setCodeGenerationMode,
    setPendingDesignJson,
    clearPendingDesign,
    setCurrentDesignJson,
    generateNewSession
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

  // 使用ref来存储最新的状态，避免在beforeunload中读取到过期的闭包值
  const conversationsRef = useRef(conversations);
  const currentHistoryIdRef = useRef(currentHistoryId);
  const currentDesignJsonRef = useRef(currentDesignJson);
  const currentCodeRef = useRef(currentCode);
  const pendingDesignJsonRef = useRef(pendingDesignJson);
  const codeGenerationModeRef = useRef(codeGenerationMode);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    currentHistoryIdRef.current = currentHistoryId;
  }, [currentHistoryId]);

  useEffect(() => {
    currentDesignJsonRef.current = currentDesignJson;
  }, [currentDesignJson]);

  useEffect(() => {
    currentCodeRef.current = currentCode;
  }, [currentCode]);

  useEffect(() => {
    pendingDesignJsonRef.current = pendingDesignJson;
  }, [pendingDesignJson]);

  useEffect(() => {
    codeGenerationModeRef.current = codeGenerationMode;
  }, [codeGenerationMode]);

  // 组件挂载时，如果有 pendingDesignJson，设置到当前会话
  useEffect(() => {
    if (pendingDesignJson && !currentDesignJson) {
      setCurrentDesignJson(pendingDesignJson);
    }
  }, [pendingDesignJson, currentDesignJson, setCurrentDesignJson]);

  // 刷新时自动保存对话内容
  useEffect(() => {
    const syncBeforeUnload = () => {
      if (justCreatedRef.current) {
        return;
      }

      const currentConversations = conversationsRef.current;
      const historyId = currentHistoryIdRef.current;
      const designJson = currentDesignJsonRef.current;
      const code = currentCodeRef.current;
      const currentFramework = 'react';

      if (currentConversations && currentConversations.length > 0) {
        const data = {
          conversations: currentConversations,
          designJson: designJson,
          generatedCode: code,
          framework: currentFramework,
          updatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        if (historyId) {
          navigator.sendBeacon(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history/${historyId}`,
            blob
          );
        } else if (designJson || code) {
          const userInput = currentConversations.find(m => m.type === 'user')?.content || '';
          const createData = {
            moduleType: currentModule,
            userInput: userInput,
            designJson: designJson,
            generatedCode: code,
            framework: currentFramework,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          };
          const createBlob = new Blob([JSON.stringify(createData)], { type: 'application/json' });
          navigator.sendBeacon(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history`,
            createBlob
          );
        }
      }
    };

    window.addEventListener('beforeunload', syncBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', syncBeforeUnload);
    };
  }, [currentModule]);

  // 处理预览设计稿
  const handlePreviewDesign = (designJson, messageId) => {
    setPreviewState('design');
    console.log('加载设计稿到预览区，消息ID:', messageId);
  };

  // 标记是否刚刚创建了历史记录
  const justCreatedRef = useRef(false);

  // 处理设计稿生成代码
  const handleDesignToCode = async () => {
    const designJson = pendingDesignJsonRef.current || currentDesignJsonRef.current;
    if (!designJson || loading) {
      const warningMessage = {
        id: Date.now(),
        type: 'warning',
        content: '请先生成或选择设计稿',
        timestamp: new Date()
      };
      addConversation(warningMessage, currentModule);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: `生成REACT代码`,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    const allMessages = [userMessage];

    setLoading(true);

    try {
      const response = await aiAPI.designToCode(designJson, 'react');

      if (response.success && response.code) {
        const codeMessage = {
          id: Date.now() + 1,
          type: 'code',
          content: response.replyText || `代码生成成功（REACT）`,
          code: response.code,
          framework: 'react',
          timestamp: new Date()
        };
        addConversation(codeMessage, currentModule);

        setCurrentCode(response.code);
        setPreviewState('code');

        allMessages.push(codeMessage);

        const historyData = {
          moduleType: currentModule,
          userInput: `生成REACT代码`,
          designJson: designJson,
          generatedCode: response.code,
          framework: 'react',
          conversations: allMessages,
          createdAt: new Date().toISOString()
        };

        justCreatedRef.current = true;

        if (currentHistoryId) {
          try {
            await historyAPI.update(currentHistoryId, historyData);
            console.log('历史记录已更新:', currentHistoryId);
            const updatedHistory = {
              ...historyData,
              _id: currentHistoryId,
              updatedAt: new Date().toISOString()
            };
            addHistory(updatedHistory, currentModule);
          } catch (error) {
            console.error('更新历史记录失败:', error);
          }
        } else {
          const historyResponse = await historyAPI.create(historyData);
          if (historyResponse.success && historyResponse.data._id) {
            setCurrentHistoryId(historyResponse.data._id);
            const newHistory = {
              ...historyResponse.data,
              userInput: `生成REACT代码`,
              moduleType: currentModule,
              createdAt: new Date().toISOString()
            };
            addHistory(newHistory, currentModule);
          }
        }

        setTimeout(() => {
          justCreatedRef.current = false;
        }, 3000);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || '代码生成失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setLoading(false);
    }
  };

  // 处理文本生成代码
  const handleTextToCode = async (text = '') => {
    if (!text.trim() && !loading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    const allMessages = [userMessage];

    setLoading(true);

    try {
      const response = await aiAPI.textToCode(text, 'react');

      if (response.success && response.code) {
        const codeMessage = {
          id: Date.now() + 1,
          type: 'code',
          content: response.replyText || `代码生成成功（REACT）`,
          code: response.code,
          framework: 'react',
          timestamp: new Date()
        };
        addConversation(codeMessage, currentModule);

        setCurrentCode(response.code);
        setPreviewState('code');

        allMessages.push(codeMessage);

        const historyData = {
          moduleType: currentModule,
          userInput: text,
          generatedCode: response.code,
          framework: 'react',
          conversations: allMessages,
          createdAt: new Date().toISOString()
        };

        justCreatedRef.current = true;

        if (currentHistoryId) {
          try {
            await historyAPI.update(currentHistoryId, historyData);
            console.log('历史记录已更新:', currentHistoryId);
            const updatedHistory = {
              ...historyData,
              _id: currentHistoryId,
              updatedAt: new Date().toISOString()
            };
            addHistory(updatedHistory, currentModule);
          } catch (error) {
            console.error('更新历史记录失败:', error);
          }
        } else {
          const historyResponse = await historyAPI.create(historyData);
          if (historyResponse.success && historyResponse.data._id) {
            setCurrentHistoryId(historyResponse.data._id);
            const newHistory = {
              ...historyResponse.data,
              userInput: text,
              moduleType: currentModule,
              createdAt: new Date().toISOString()
            };
            addHistory(newHistory, currentModule);
          }
        }

        setTimeout(() => {
          justCreatedRef.current = false;
        }, 3000);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || '代码生成失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setLoading(false);
    }
  };

  // 处理图片生成代码
  const handleImageToCode = async (text, imageFiles) => {
    const images = Array.isArray(imageFiles) ? imageFiles : (imageFiles ? [imageFiles] : []);
    
    if ((!text.trim() && images.length === 0) || loading) return;

    // 转换图片为base64
    const imageUrls = [];
    const imageBase64Array = [];
    
    for (const file of images) {
      imageUrls.push(URL.createObjectURL(file));
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      imageBase64Array.push(base64);
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text || '',
      images: imageUrls,
      imageCount: images.length,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    const allMessages = [userMessage];

    setLoading(true);

    try {
      const formData = new FormData();
      
      images.forEach((file, index) => {
        formData.append('images', file);
      });

      formData.append('imageBase64', JSON.stringify(imageBase64Array));

      if (text.trim()) {
        formData.append('text', text);
      }

      formData.append('framework', 'react');
      
      const response = await aiAPI.imageToCode(formData);

      if (response.success && response.code) {
        const codeMessage = {
          id: Date.now() + 1,
          type: 'code',
          content: response.replyText || `代码生成成功（REACT）`,
          code: response.code,
          framework: 'react',
          timestamp: new Date()
        };
        addConversation(codeMessage, currentModule);

        setCurrentCode(response.code);
        setPreviewState('code');

        allMessages.push(codeMessage);

        const historyData = {
          moduleType: currentModule,
          userInput: text || `图片上传（${images.length}张）`,
          generatedCode: response.code,
          framework: 'react',
          conversations: allMessages,
          createdAt: new Date().toISOString()
        };

        justCreatedRef.current = true;

        if (currentHistoryId) {
          try {
            await historyAPI.update(currentHistoryId, historyData);
            console.log('历史记录已更新:', currentHistoryId);
            const updatedHistory = {
              ...historyData,
              _id: currentHistoryId,
              updatedAt: new Date().toISOString()
            };
            addHistory(updatedHistory, currentModule);
          } catch (error) {
            console.error('更新历史记录失败:', error);
          }
        } else {
          const historyResponse = await historyAPI.create(historyData);
          if (historyResponse.success && historyResponse.data._id) {
            setCurrentHistoryId(historyResponse.data._id);
            const newHistory = {
              ...historyResponse.data,
              userInput: text || `图片上传（${images.length}张）`,
              moduleType: currentModule,
              createdAt: new Date().toISOString()
            };
            addHistory(newHistory, currentModule);
          }
        }

        setTimeout(() => {
          justCreatedRef.current = false;
        }, 3000);
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || '代码生成失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setLoading(false);
    }
  };

  // 统一的提交处理
  const handleSubmit = (text, imageFiles) => {
    const currentMode = codeGenerationModeRef.current;
    
    if (currentMode === 'design') {
      handleDesignToCode();
    } else if (currentMode === 'text') {
      handleTextToCode(text);
    } else if (currentMode === 'image') {
      handleImageToCode(text, imageFiles);
    }
  };

  // 切换代码生成模式
  const handleModeSwitch = (mode) => {
    setCodeGenerationMode(mode);
    if (mode !== 'design') {
      clearPendingDesign();
    }
  };

  // 处理更换设计稿
  const handleClearDesign = () => {
    clearPendingDesign();
  };

  return (
    <div className="design-to-code">
      {/* 模式切换标签 */}
      <div className="design-to-code-mode-tabs">
        <button
          className={`mode-tab ${codeGenerationMode === 'design' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('design')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="9" y1="21" x2="9" y2="9" />
          </svg>
          设计稿生成
        </button>
        <button
          className={`mode-tab ${codeGenerationMode === 'text' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('text')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          文本生成
        </button>
        <button
          className={`mode-tab ${codeGenerationMode === 'image' ? 'active' : ''}`}
          onClick={() => handleModeSwitch('image')}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
          图片生成
        </button>
      </div>

      {/* 对话消息列表 */}
      <div className="conversation-container">
        {/* 设计稿模式下的设计稿预览 */}
        {codeGenerationMode === 'design' && pendingDesignJson && (
          <div className="design-to-code-pending-design">
            <div className="pending-design-header">
              <span className="pending-design-label">当前设计稿</span>
              <button className="pending-design-clear-btn" onClick={handleClearDesign} title="更换设计稿">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <DesignThumbnail
              designJson={pendingDesignJson}
              onClick={() => {
                setCurrentDesignJson(pendingDesignJson);
                setPreviewState('design');
              }}
            />
          </div>
        )}

        <MessageList messages={conversations} onPreviewDesign={handlePreviewDesign} />
      </div>

      {/* 输入区域 */}
      <div className="code-generator">
        {/* 设计稿模式：显示发送按钮，不需要输入文本 */}
        {codeGenerationMode === 'design' ? (
          <button
            className={`generate-code-submit-btn ${loading ? 'loading' : ''} ${(!pendingDesignJson && !currentDesignJson) ? 'disabled' : ''}`}
            onClick={handleDesignToCode}
            disabled={loading || (!pendingDesignJson && !currentDesignJson)}
          >
            {loading ? (
              <>
                <span className="generate-code-loading-spinner"></span>
                生成中...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="16 18 22 12 16 6"></polyline>
                  <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                生成代码
              </>
            )}
          </button>
        ) : (
          <InputArea
            onSubmit={handleSubmit}
            loading={loading}
            placeholder={
              codeGenerationMode === 'text'
                ? "描述您想要的页面，例如：创建一个登录页面..."
                : "上传图片或描述您想要的页面..."
            }
            allowEmptySubmit={false}
            allowImageUpload={codeGenerationMode === 'image'}
          />
        )}
      </div>
    </div>
  );
};

export default DesignToCode;
