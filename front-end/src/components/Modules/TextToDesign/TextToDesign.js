import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI, historyAPI } from '../../../services/api';
import MessageList from '../../MessageList/MessageList';
import InputArea from '../../InputArea/InputArea';
import './TextToDesign.css';

const TextToDesign = () => {
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

  // 使用ref来存储最新的conversations，避免在beforeunload中读取到过期的闭包值
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
  const handleBeforeUnload = useCallback(async (e) => {
    const currentConversations = conversationsRef.current;
    const historyId = currentHistoryIdRef.current;
    const designJson = currentDesignJsonRef.current;

    // 如果有对话内容
    if (currentConversations && currentConversations.length > 0) {
      try {
        if (historyId) {
          // 如果有历史记录ID，更新现有记录
          await historyAPI.update(historyId, {
            conversations: currentConversations,
            designJson: designJson,
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

      if (currentConversations && currentConversations.length > 0) {
        const data = {
          conversations: currentConversations,
          designJson: designJson,
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
    // 设置当前设计稿到预览区
    setCurrentDesignJson(designJson);
    setPreviewState('design');
    console.log('加载设计稿到预览区，消息ID:', messageId);
  };

  const handleSubmit = async (text) => {
    if (!text.trim() || loading) return;

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);
    setLoading(true);

    try {
      // 获取当前设计稿（如果有），用于上下文关联
      const response = await aiAPI.textToDesign(text, currentDesignJson);

      if (response.success && response.designJson) {
        // 添加AI返回的设计稿消息到对话
        const designMessage = {
          id: Date.now() + 1,
          type: 'design',
          content: '已为您生成设计稿，点击下方按钮预览和编辑：',
          designJson: response.designJson,
          timestamp: new Date()
        };
        addConversation(designMessage, currentModule);

        // 获取当前对话内容（包含用户输入和设计稿消息）
        const currentConversations = getCurrentConversations();

        // 准备历史记录数据
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
              userInput: text,
              moduleType: currentModule,
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
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        content: error.message || '生成失败，请重试',
        timestamp: new Date()
      };
      addConversation(errorMessage, currentModule);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="text-to-design">
      <MessageList messages={conversations} onPreviewDesign={handlePreviewDesign} />
      <InputArea
        onSubmit={handleSubmit}
        loading={loading}
        placeholder="描述您想要的页面设计，例如：创建一个包含标题和按钮的页面..."
      />
    </div>
  );
};

export default TextToDesign;
