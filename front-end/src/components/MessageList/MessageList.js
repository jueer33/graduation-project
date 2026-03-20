import React, { useState } from 'react';
import { useAppStore } from '../../store/store';
import DesignMessage from './DesignMessage';
import LoadingPlaceholder from '../LoadingPlaceholder/LoadingPlaceholder';
import './MessageList.css';

const MessageList = ({ messages, loading = false }) => {
  const { user } = useAppStore();
  const [enlargedImage, setEnlargedImage] = useState(null);

  const getAvatar = (type) => {
    if (type === 'user') {
      return user?.avatar ? (
        <img src={user.avatar} alt="用户头像" className="message-avatar-img" />
      ) : (
        <div className="message-avatar user-avatar">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      );
    }
    return (
      <div className="message-avatar ai-avatar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
          <circle cx="7.5" cy="14.5" r="1.5"></circle>
          <circle cx="16.5" cy="14.5" r="1.5"></circle>
        </svg>
      </div>
    );
  };

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-message">开始您的对话</div>
        <div className="empty-hint">描述您想要的页面设计，AI 将为您生成设计稿</div>
      </div>
    );
  }

  const handleImageClick = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const handleCloseEnlarged = () => {
    setEnlargedImage(null);
  };

  const renderMessage = (message) => {
    // 如果是设计稿类型的消息，使用 DesignMessage 组件
    if (message.type === 'design') {
      return (
        <DesignMessage
          message={message}
        />
      );
    }

    // 普通消息
    return (
      <>
        {getAvatar(message.type)}
        <div className="message-body">
          {/* 支持单张图片 (message.image) 或多张图片 (message.images) */}
          {message.image && (
            <div className="message-image">
              <img
                src={message.image}
                alt="消息图片"
                onClick={() => handleImageClick(message.image)}
              />
            </div>
          )}
          {message.images && message.images.length > 0 && (
            <div className="message-images">
              {message.images.map((img, index) => (
                <div key={index} className="message-image-item">
                  <img
                    src={img}
                    alt={`消息图片 ${index + 1}`}
                    onClick={() => handleImageClick(img)}
                  />
                </div>
              ))}
            </div>
          )}
          {message.content && (
            <div className="message-content">{message.content}</div>
          )}
          {message.timestamp && (
            <div className="message-time">
              {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          )}
        </div>
      </>
    );
  };

  return (
    <>
      <div className="message-list">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.type}`}>
            {renderMessage(message)}
          </div>
        ))}
        {/* AI 生成时的加载占位 */}
        {loading && (
          <div className="message message-loading">
            <div className="message-avatar ai-avatar">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"></path>
                <circle cx="7.5" cy="14.5" r="1.5"></circle>
                <circle cx="16.5" cy="14.5" r="1.5"></circle>
              </svg>
            </div>
            <LoadingPlaceholder />
          </div>
        )}
      </div>
      {enlargedImage && (
        <div className="image-enlarged-overlay" onClick={handleCloseEnlarged}>
          <div className="image-enlarged-container" onClick={(e) => e.stopPropagation()}>
            <button className="image-enlarged-close" onClick={handleCloseEnlarged}>×</button>
            <img src={enlargedImage} alt="放大图片" />
          </div>
        </div>
      )}
    </>
  );
};

export default MessageList;
