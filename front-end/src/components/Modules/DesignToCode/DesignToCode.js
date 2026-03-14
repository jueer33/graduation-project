import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI, historyAPI } from '../../../services/api';
import MessageList from '../../MessageList/MessageList';
import FrameworkSelector from '../../FrameworkSelector/FrameworkSelector';
import InputArea from '../../InputArea/InputArea';
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
    addHistory
  } = useAppStore();

  const [framework, setFramework] = useState('react');
  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

  // 使用ref来存储最新的状态，避免在beforeunload中读取到过期的闭包值
  const conversationsRef = useRef(conversations);
  const currentHistoryIdRef = useRef(currentHistoryId);
  const currentDesignJsonRef = useRef(currentDesignJson);
  const currentCodeRef = useRef(currentCode);
  const frameworkRef = useRef(framework);
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
    currentCodeRef.current = currentCode;
  }, [currentCode]);

  useEffect(() => {
    frameworkRef.current = framework;
  }, [framework]);

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
      const code = currentCodeRef.current;
      const currentFramework = frameworkRef.current;

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
    // 在代码生成模块，点击预览按钮应该切换到设计视图
    setPreviewState('design');
    console.log('加载设计稿到预览区，消息ID:', messageId);
  };

  const handleGenerate = async (text = '') => {
    if (!currentDesignJson || loading) {
      const warningMessage = {
        id: Date.now(),
        type: 'warning',
        content: '请先生成或选择设计稿',
        timestamp: new Date()
      };
      addConversation(warningMessage, currentModule);
      return;
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text || `生成${framework.toUpperCase()}代码`,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    setLoading(true);

    try {
      const response = await aiAPI.designToCode(currentDesignJson, framework);

      if (response.success && response.code) {
        // 添加代码消息到对话
        const codeMessage = {
          id: Date.now() + 1,
          type: 'code',
          content: `代码生成成功（${framework.toUpperCase()}），代码已加载到预览区`,
          code: response.code,
          framework: framework,
          timestamp: new Date()
        };
        addConversation(codeMessage, currentModule);

        // 更新代码到预览区
        setCurrentCode(response.code);
        setPreviewState('code');

        const currentConversations = getCurrentConversations();

        const historyData = {
          moduleType: currentModule,
          userInput: text || `生成${framework.toUpperCase()}代码`,
          designJson: currentDesignJson,
          generatedCode: response.code,
          framework: framework,
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
              userInput: text || `生成${framework.toUpperCase()}代码`,
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

  return (
    <div className="design-to-code">
      <MessageList messages={conversations} onPreviewDesign={handlePreviewDesign} />
      <div className="code-generator">
        <FrameworkSelector value={framework} onChange={setFramework} />
        <InputArea
          onSubmit={(text) => handleGenerate(text)}
          loading={loading}
          placeholder="选择框架后按Enter或点击发送按钮生成代码"
          allowEmptySubmit={true}
        />
      </div>
    </div>
  );
};

export default DesignToCode;

