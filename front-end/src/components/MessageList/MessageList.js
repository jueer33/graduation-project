import React, { useState } from 'react';
import './MessageList.css';

const MessageList = ({ messages }) => {
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

  return (
    <>
      <div className="message-list">
        {messages.map(message => (
          <div key={message.id} className={`message message-${message.type}`}>
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
