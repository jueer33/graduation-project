import React, { useState } from 'react';
import DesignMessage from './DesignMessage';
import './MessageList.css';

const MessageList = ({ messages, onPreviewDesign }) => {
  const [enlargedImage, setEnlargedImage] = useState(null);

  if (!messages || messages.length === 0) {
    return (
      <div className="message-list empty">
        <div className="empty-message">开始您的对话</div>
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
          onPreview={onPreviewDesign}
        />
      );
    }

    // 普通消息
    return (
      <>
        {message.image && (
          <div className="message-image">
            <img
              src={message.image}
              alt="消息图片"
              onClick={() => handleImageClick(message.image)}
            />
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
