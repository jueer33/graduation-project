import React, { useState } from 'react';
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
    currentModule
  } = useAppStore();
  
  const [framework, setFramework] = useState('react');
  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

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
        // 更新代码
        setCurrentCode(response.code);
        setPreviewState('code');
        
        // 添加成功消息
        const successMessage = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `代码生成成功（${framework.toUpperCase()}）`,
          timestamp: new Date()
        };
        addConversation(successMessage, currentModule);
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
      <MessageList messages={conversations} />
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

