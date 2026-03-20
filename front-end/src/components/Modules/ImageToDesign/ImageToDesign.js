import React, { useState, useEffect, useCallback, useRef } from 'react';
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
    currentSessionId,
    setCurrentSessionId,
    addHistory,
    generateNewSession,
    isGenerating,
    setIsGenerating
  } = useAppStore();

  const conversations = getCurrentConversations();

  // 使用ref来存储最新的状态，避免在beforeunload中读取到过期的闭包值
  const conversationsRef = useRef(conversations);
  const currentHistoryIdRef = useRef(currentHistoryId);
  const currentDesignJsonRef = useRef(currentDesignJson);
  const currentSessionIdRef = useRef(currentSessionId);
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

  useEffect(() => {
    currentSessionIdRef.current = currentSessionId;
  }, [currentSessionId]);

  // 刷新时自动保存对话内容
  const handleBeforeUnload = useCallback(async (e) => {
    const currentConversations = conversationsRef.current;
    const historyId = currentHistoryIdRef.current;
    const designJson = currentDesignJsonRef.current;
    const sessionId = currentSessionIdRef.current;

    // 如果有对话内容
    if (currentConversations && currentConversations.length > 0) {
      try {
        if (historyId) {
          // 如果有历史记录ID，更新现有记录
          await historyAPI.update(historyId, {
            conversations: currentConversations,
            designJson: designJson,
            sessionId: sessionId,
            updatedAt: new Date().toISOString()
          });
          console.log('刷新时自动更新历史记录:', historyId);
        } else if (designJson) {
          // 如果没有历史记录ID但有设计稿，创建新记录
          const userInput = currentConversations.find(m => m.type === 'user')?.content || '';
          await historyAPI.create({
            moduleType: currentModule,
            userInput: userInput,
            designJson: designJson,
            sessionId: sessionId,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          });
          console.log('刷新时自动创建历史记录');
        }
      } catch (error) {
        console.error('自动保存失败:', error);
      }
    }
  }, [currentModule]);

  useEffect(() => {
    // 使用同步的beforeunload处理，确保数据被保存
    const syncBeforeUnload = (e) => {
      // 如果刚刚创建了历史记录，不再重复创建
      if (justCreatedRef.current) {
        return;
      }

      // 注意：这里不能直接使用async函数，因为beforeunload需要同步执行
      // 我们使用sendBeacon来发送数据，或者使用同步的XHR
      const currentConversations = conversationsRef.current;
      const historyId = currentHistoryIdRef.current;
      const designJson = currentDesignJsonRef.current;
      const sessionId = currentSessionIdRef.current;

      if (currentConversations && currentConversations.length > 0) {
        const data = {
          conversations: currentConversations,
          designJson: designJson,
          sessionId: sessionId,
          updatedAt: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });

        if (historyId) {
          // 使用sendBeacon发送更新请求
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
            sessionId: sessionId,
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

  // 组件挂载时，如果没有会话ID，生成一个新的
  useEffect(() => {
    if (!currentSessionId) {
      generateNewSession();
    }
  }, []);

  // 处理预览设计稿
  const handlePreviewDesign = (designJson, messageId) => {
    setCurrentDesignJson(designJson);
    setPreviewState('design');
    console.log('加载设计稿到预览区，消息ID:', messageId);
  };

  const handleSubmit = async (text, imageFiles) => {
    // 支持多张图片数组或单张图片
    const images = Array.isArray(imageFiles) ? imageFiles : (imageFiles ? [imageFiles] : []);
    
    if ((!text.trim() && images.length === 0) || isGenerating) return;

    // 确保有会话ID
    let activeSessionId = currentSessionId;
    if (!activeSessionId) {
      activeSessionId = generateNewSession();
    }

    setIsGenerating(true);

    // 创建图片预览URL数组并转换为base64
    const imageUrls = [];
    const imageBase64Array = [];
    
    // 转换图片为base64
    for (const file of images) {
      imageUrls.push(URL.createObjectURL(file));
      // 转换为base64
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      imageBase64Array.push(base64);
    }

    // 添加用户消息
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

    try {
      if (images.length > 0) {
        const formData = new FormData();
        
        // 添加多张图片到 FormData
        images.forEach((file, index) => {
          formData.append('images', file);
        });

        // 添加base64图片数据
        formData.append('imageBase64', JSON.stringify(imageBase64Array));

        if (text.trim()) {
          formData.append('text', text);
        }

        // 使用 ref 获取最新的设计稿，避免闭包问题
        const latestDesignJson = currentDesignJsonRef.current;
        console.log('图片生成设计稿时 Design JSON:', latestDesignJson ? '存在' : '不存在');
        
        // 传入当前设计稿（如果有）和会话ID，用于上下文关联
        formData.append('sessionId', activeSessionId);
        if (latestDesignJson) {
          formData.append('currentDesignJson', JSON.stringify(latestDesignJson));
        }
        
        // 调用AI API生成设计稿
        const response = await aiAPI.imageToDesign(formData);

        if (response.success && response.designJson) {
          // 先添加AI回复消息到对话
          const aiMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.replyText || (images.length > 1 
              ? `图片解析成功（${images.length}张图片），已为您生成设计稿` 
              : '图片解析成功，已为您生成设计稿'),
            timestamp: new Date()
          };
          addConversation(aiMessage, currentModule);

          setCurrentDesignJson(response.designJson);
          setPreviewState('design');

          allMessages.push(aiMessage);

          const historyData = {
            moduleType: currentModule,
            title: response.title || (text || `图片上传（${images.length}张）`),
            userInput: text || `图片上传（${images.length}张）`,
            designJson: response.designJson,
            sessionId: response.sessionId || activeSessionId,
            conversations: allMessages,
            imagePaths: response.imagePaths || [],
            createdAt: new Date().toISOString()
          };

          // 标记即将创建/更新历史记录，避免beforeunload重复操作
          justCreatedRef.current = true;

          // 如果有历史记录ID，更新原有记录；否则创建新记录
          if (currentHistoryId) {
            // 更新现有历史记录
            try {
              await historyAPI.update(currentHistoryId, historyData);
              console.log('历史记录已更新:', currentHistoryId);

              // 更新前端历史记录列表中的对应项
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
            // 创建新历史记录
            const historyResponse = await historyAPI.create(historyData);
            if (historyResponse.success && historyResponse.data._id) {
              // 设置当前历史记录ID
              setCurrentHistoryId(historyResponse.data._id);

              // 立即将新记录添加到历史记录列表（前端状态）
              const newHistory = {
                ...historyResponse.data,
                title: response.title || (text || `图片上传（${images.length}张）`),
                userInput: text || `图片上传（${images.length}张）`,
                moduleType: currentModule,
                sessionId: response.sessionId || activeSessionId,
                imagePaths: response.imagePaths || [],
                createdAt: new Date().toISOString()
              };
              addHistory(newHistory, currentModule);

              console.log('新历史记录已创建并添加到列表:', historyResponse.data._id);
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
        const response = await aiAPI.textToDesign(text, activeSessionId, latestDesignJson);

        if (response.success && response.designJson) {
          // 先添加AI回复消息到对话
          const aiMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: response.replyText || '已为您生成设计稿',
            timestamp: new Date()
          };
          addConversation(aiMessage, currentModule);

          // 更新当前设计稿（共享设计稿）
          setCurrentDesignJson(response.designJson);
          setPreviewState('design');

          // 只有在必要时才更新会话ID
          // 避免因为会话ID变化导致对话内容丢失
          // if (response.sessionId && response.sessionId !== activeSessionId) {
          //   setCurrentSessionId(response.sessionId);
          // }

          // 获取当前对话内容
          const currentConversations = getCurrentConversations();

          // 准备历史记录数据
          const historyData = {
            moduleType: currentModule,
            title: response.title || text,
            userInput: text,
            designJson: response.designJson,
            sessionId: response.sessionId || activeSessionId,
            conversations: currentConversations,
            createdAt: new Date().toISOString()
          };

          // 标记即将创建/更新历史记录，避免beforeunload重复操作
          justCreatedRef.current = true;

          // 如果有历史记录ID，更新原有记录；否则创建新记录
          if (currentHistoryId) {
            // 更新现有历史记录
            try {
              await historyAPI.update(currentHistoryId, historyData);
              console.log('历史记录已更新:', currentHistoryId);

              // 更新前端历史记录列表中的对应项
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
            // 创建新历史记录
            const historyResponse = await historyAPI.create(historyData);
            if (historyResponse.success && historyResponse.data._id) {
              // 设置当前历史记录ID
              setCurrentHistoryId(historyResponse.data._id);

              // 立即将新记录添加到历史记录列表（前端状态）
              const newHistory = {
                ...historyResponse.data,
                title: response.title || text,
                userInput: text,
                moduleType: currentModule,
                sessionId: response.sessionId || activeSessionId,
                createdAt: new Date().toISOString()
              };
              addHistory(newHistory, currentModule);

              console.log('新历史记录已创建并添加到列表:', historyResponse.data._id);
            }
          }

          // 3秒后重置标记，允许后续的beforeunload保存
          setTimeout(() => {
            justCreatedRef.current = false;
          }, 3000);
        }
      }
    } catch (error) {
      console.error('生成失败:', error);
      const errorMessage = {
        id: Date.now() + 2,
        type: 'error',
        content: error.message || '解析失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="image-to-design">
      <div className="conversation-container">
        <MessageList messages={conversations} onPreviewDesign={handlePreviewDesign} />
      </div>
      <InputArea
        onSubmit={handleSubmit}
        loading={isGenerating}
        placeholder="上传图片或描述您想要的页面设计..."
        allowImageUpload={true}
      />
    </div>
  );
};

export default ImageToDesign;
