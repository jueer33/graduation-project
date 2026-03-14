import React, { useState, useRef, useEffect } from 'react';
import './InputArea.css';

const InputArea = ({ 
  onSubmit, 
  loading = false, 
  placeholder = '输入消息...',
  allowImageUpload = false,
  allowEmptySubmit = false,
  onImageSelect
}) => {
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const canSubmit = allowEmptySubmit || input.trim() || selectedImage;
    if (!loading && canSubmit) {
      onSubmit(input, selectedImage);
      // 只在有实际输入内容时才清空
      if (input.trim() || selectedImage) {
        setInput('');
        setSelectedImage(null);
        setImagePreview(null);
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleFileSelect = (file) => {
    if (!file || !file.type.startsWith('image/')) {
      alert('请选择图片文件');
      return;
    }

    setSelectedImage(file);
    
    // 创建预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);

    if (onImageSelect) {
      onImageSelect(file);
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    if (allowImageUpload) {
      e.preventDefault();
    }
  };

  const handleDrop = (e) => {
    if (allowImageUpload) {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const canSubmit = allowEmptySubmit || input.trim() || selectedImage;

  return (
    <div 
      className="input-area-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imagePreview && (
        <div className="input-image-preview">
          <img src={imagePreview} alt="预览" />
          <button 
            type="button"
            className="input-image-remove"
            onClick={handleRemoveImage}
          >
            ×
          </button>
        </div>
      )}
      <form className="input-area" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          {allowImageUpload && (
            <button
              type="button"
              className="input-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              title="上传图片"
            >
              📎
            </button>
          )}
          <div className="input-textarea-wrapper">
            <textarea
              ref={textareaRef}
              className="input-textarea"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              rows={1}
              disabled={loading}
            />
            <button
              type="submit"
              className="input-send-btn"
              disabled={!canSubmit || loading}
              title="发送"
            >
              {loading ? (
                <span className="input-send-btn-loading">⏳</span>
              ) : (
                <span className="input-send-btn-icon">➤</span>
              )}
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default InputArea;
