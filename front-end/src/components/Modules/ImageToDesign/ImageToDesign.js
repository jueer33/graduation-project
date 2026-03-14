import React, { useState } from 'react';
import { useAppStore } from '../../../store/store';
import { aiAPI } from '../../../services/api';
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
    setCurrentHistoryId
  } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const conversations = getCurrentConversations();

  const handleSubmit = async (text, imageFile) => {
    if ((!text.trim() && !imageFile) || loading) return;

    setLoading(true);

    // 创建图片预览URL
    let imageUrl = null;
    if (imageFile) {
      imageUrl = URL.createObjectURL(imageFile);
    }

    // 添加用户消息
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: text || '',
      image: imageUrl,
      timestamp: new Date()
    };
    addConversation(userMessage, currentModule);

    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append('image', imageFile);
        
        // 如果有文字，也添加到formData
        if (text.trim()) {
          formData.append('text', text);
        }

        const response = await aiAPI.imageToDesign(formData);
        
        if (response.success && response.designJson) {
          // 清除当前历史记录ID（因为这是新的设计）
          setCurrentHistoryId(null);
          
          // 更新Design JSON
          setCurrentDesignJson(response.designJson);
          setPreviewState('design');
          
          // 添加成功消息
          const successMessage = {
            id: Date.now() + 1,
            type: 'assistant',
            content: '图片解析成功，设计稿已生成',
            timestamp: new Date()
          };
          addConversation(successMessage, currentModule);
        }
      } else if (text.trim()) {
        // 如果只有文字没有图片，可以调用文本生成接口
        const response = await aiAPI.textToDesign(text);
        
        if (response.success && response.designJson) {
          // 清除当前历史记录ID（因为这是新的设计）
          setCurrentHistoryId(null);
          
          setCurrentDesignJson(response.designJson);
          setPreviewState('design');
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
      <MessageList messages={conversations} />
      <InputArea
        onSubmit={handleSubmit}
        loading={loading}
        placeholder="上传图片或描述您想要的页面设计..."
        showImageUpload={true}
      />
    </div>
  );
};

export default ImageToDesign;
