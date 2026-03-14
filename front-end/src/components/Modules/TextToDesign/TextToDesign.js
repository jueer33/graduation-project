import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI, historyAPI } from '../../../services/api';
import MessageList from '../../MessageList/MessageList';
import InputArea from '../../InputArea/InputArea';
import './TextToDesign.css';

const TextToDesign = () => {
  const { 
    currentDesignJson, 
    setCurrentDesignJson, 
    setPreviewState,
    addConversation,
    getCurrentConversations,
    currentModule
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

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
      const response = await aiAPI.textToDesign(text);
      
      if (response.success && response.designJson) {
        // 更新Design JSON
        setCurrentDesignJson(response.designJson);
        setPreviewState('design');
        
        // 不添加AI消息到对话区（已在预览区显示）
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
      <MessageList messages={conversations} />
      <InputArea
        onSubmit={handleSubmit}
        loading={loading}
        placeholder="描述您想要的页面设计，例如：创建一个包含标题和按钮的页面..."
      />
    </div>
  );
};

export default TextToDesign;

