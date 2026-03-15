import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI, historyAPI } from '../../../services/api';
import MessageList from '../../MessageList/MessageList';
import InputArea from '../../InputArea/InputArea';
import './ImageToDesign.css';

const ImageToDesign = () => {
  const {
    setCurrentDesignJson,
    setPreviewState,
    addConversation,
    getCurrentConversations,
    currentModule,
    setCurrentHistoryId,
    currentHistoryId,
    currentDesignJson,
    addHistory
  } = useAppStore();

  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

  // 使用ref来存储最新的状态，避免在beforeunload中读取到过期的闭包值
  const conversationsRef = useRef(conversations);
  const currentHistoryIdRef = useRef(currentHistoryId);
  const currentDesignJsonRef = useRef(currentDesignJson);
  // 标记是否刚刚创建了历史记录，避免beforeunload重复创建
  const justCreatedRef = useRef(false);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  useEffect(() => {
    currentHistoryIdRef.current = currentHistoryId;
  }, [currentHistoryId]);

  useEffect(() => {
    currentDesignJsonRef.current = currentDesignJson;
  }, [currentDesignJson]);

  // 刷新时自动保存对话内容
  useEffect(() => {
    const syncBeforeUnload = () => {
      // 如果刚刚创建了历史记录，不再重复创建
      if (justCreatedRef.current) {
        return;
      }

      const currentConversations = conversationsRef.current;
      const historyId = currentHistoryIdRef.current;
      const designJson = currentDesignJsonRef.current;

      if (currentConversations && currentConversations.length > 0) {
        const data = {
          conversations: currentConversations,
          designJson: designJson,
          updatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        if (historyId) {
          navigator.sendBeacon(
            `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/history/${historyId}`,
            blob
          );
        } else if (designJson) {
          const userInput = currentConversations.find(m => m.type === 'user')?.content || '';
          const createData = {
            moduleType: currentModule,
            userInput: userInput,
            designJson: designJson,
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
    setCurrentDesignJson(designJson);
    setPreviewState('design');
    console.log('加载设计稿到预览区，消息ID:', messageId);
  };

  const handleSubmit = async (text, imageFiles) => {
    // 支持多张图片数组或单张图片
    const images = Array.isArray(imageFiles) ? imageFiles : (imageFiles ? [imageFiles] : []);
    
    if ((!text.trim() && images.length === 0) || loading) return;

    setLoading(true);

    // 创建图片预览URL数组
    const imageUrls = images.map(file => URL.createObjectURL(file));

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text || '',
      images: imageUrls,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    try {
      if (images.length > 0) {
        const formData = new FormData();
        
        // 添加多张图片到 FormData
        images.forEach((file, index) => {
          formData.append('images', file);
        });

        if (text.trim()) {
          formData.append('text', text);
        }

        // 使用 ref 获取最新的设计稿，避免闭包问题
        const latestDesignJson = currentDesignJsonRef.current;
        console.log('图片生成设计稿时 Design JSON:', latestDesignJson ? '存在' : '不存在');
        
        // 传入当前设计稿（如果有），用于上下文关联
        const response = await aiAPI.imageToDesign(formData, latestDesignJson);

        if (response.success && response.designJson) {
          // 添加设计稿消息到对话
          const designMessage = {
            id: Date.now() + 1,
            type: 'design',
            content: images.length > 1 
              ? `图片解析成功（${images.length}张图片），已为您生成设计稿：` 
              : '图片解析成功，已为您生成设计稿：',
            designJson: response.designJson,
            timestamp: new Date()
          };
          addConversation(designMessage, currentModule);

          const currentConversations = getCurrentConversations();

          const historyData = {
            moduleType: currentModule,
            title: response.title || (text || `图片上传（${images.length}张）`),
            userInput: text || `图片上传（${images.length}张）`,
            designJson: response.designJson,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          };

          // 标记即将创建/更新历史记录，避免beforeunload重复操作
          justCreatedRef.current = true;

          // 如果有历史记录ID，更新原有记录；否则创建新记录
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
                title: response.title || (text || `图片上传（${images.length}张）`),
                userInput: text || `图片上传（${images.length}张）`,
                moduleType: currentModule,
                createdAt: new Date().toISOString()
              };
              addHistory(newHistory, currentModule);
            }
          }

          // 3秒后重置标记，允许后续的beforeunload保存
          setTimeout(() => {
            justCreatedRef.current = false;
          }, 3000);
        }
      } else if (text.trim()) {
        // 使用 ref 获取最新的设计稿，避免闭包问题
        const latestDesignJson = currentDesignJsonRef.current;
        console.log('文本生成设计稿时 Design JSON:', latestDesignJson ? '存在' : '不存在');
        
        // 传入当前设计稿（如果有），用于上下文关联
        const response = await aiAPI.textToDesign(text, null, latestDesignJson);

        if (response.success && response.designJson) {
          const designMessage = {
            id: Date.now() + 1,
            type: 'design',
            content: '已为您生成设计稿，点击下方按钮预览和编辑：',
            designJson: response.designJson,
            timestamp: new Date()
          };
          addConversation(designMessage, currentModule);

          const currentConversations = getCurrentConversations();

          const historyData = {
            moduleType: currentModule,
            userInput: text,
            designJson: response.designJson,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          };

          // 标记即将创建/更新历史记录，避免beforeunload重复操作
          justCreatedRef.current = true;

          // 如果有历史记录ID，更新原有记录；否则创建新记录
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

          // 3秒后重置标记，允许后续的beforeunload保存
          setTimeout(() => {
            justCreatedRef.current = false;
          }, 3000);
        }
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 2,
        type: 'error',
        content: error.message || '解析失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-to-design">
      <MessageList messages={conversations} onPreviewDesign={handlePreviewDesign} />
      <InputArea
        onSubmit={handleSubmit}
        loading={loading}
        placeholder="上传图片或描述您想要的页面设计..."
        allowImageUpload={true}
      />
    </div>
  );
};

export default ImageToDesign;
