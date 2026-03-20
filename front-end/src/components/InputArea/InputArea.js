import React, { useState, useRef, useEffect } from 'react';
import { useToast } from '../Toast/ToastContext';
import './InputArea.css';

const InputArea = ({ 
  onSubmit, 
  loading = false, 
  placeholder = '输入消息...',
  allowImageUpload = false,
  allowEmptySubmit = false,
  onImageSelect
}) => {
  const { showToast } = useToast();
  
  const [input, setInput] = useState('');
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const MAX_IMAGES = 5;

  const handleSubmit = (e) => {
    e.preventDefault();
    const canSubmit = allowEmptySubmit || input.trim() || selectedImages.length > 0;
    if (!loading && canSubmit) {
      onSubmit(input, selectedImages);
      // 只在有实际输入内容时才清空
      if (input.trim() || selectedImages.length > 0) {
        setInput('');
        setSelectedImages([]);
        setImagePreviews([]);
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

  const handleFileSelect = (files) => {
    if (!files || files.length === 0) return;

    // 检查总数量限制
    const totalCount = selectedImages.length + files.length;
    if (totalCount > MAX_IMAGES) {
      showToast(`最多只能上传${MAX_IMAGES}张图片，您已选择${selectedImages.length}张，还能选择${MAX_IMAGES - selectedImages.length}张`, 'warning');
      return;
    }

    // 过滤非图片文件
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (imageFiles.length === 0) {
      showToast('请选择图片文件', 'warning');
      return;
    }

    // 添加新图片到数组
    setSelectedImages(prev => [...prev, ...imageFiles]);
    
    // 为每张图片创建预览
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, { url: e.target.result, name: file.name }]);
      };
      reader.readAsDataURL(file);
    });

    if (onImageSelect) {
      imageFiles.forEach(file => onImageSelect(file));
    }
  };

  const handleFileInputChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
    // 重置 input 值，允许重复选择相同文件
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e) => {
    if (allowImageUpload) {
      e.preventDefault();
    }
  };

  const handleDrop = (e) => {
    if (allowImageUpload) {
      e.preventDefault();
      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFileSelect(files);
      }
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  const canSubmit = allowEmptySubmit || input.trim() || selectedImages.length > 0;

  return (
    <div 
      className="input-area-container"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {imagePreviews.length > 0 && (
        <div className="input-images-preview">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="input-image-preview-item">
              <img src={preview.url} alt={`预览 ${index + 1}`} />
              <button 
                type="button"
                className="input-image-remove"
                onClick={() => handleRemoveImage(index)}
                title="删除图片"
              >
                ×
              </button>
            </div>
          ))}
          {selectedImages.length < MAX_IMAGES && (
            <button
              type="button"
              className="input-image-add-more"
              onClick={() => fileInputRef.current?.click()}
              title="添加更多图片"
            >
              +{MAX_IMAGES - selectedImages.length}
            </button>
          )}
        </div>
      )}
      <form className="input-area" onSubmit={handleSubmit}>
        <div className="input-wrapper">
          <div className="input-textarea-wrapper">
            {allowImageUpload && (
              <button
                type="button"
                className="input-upload-btn"
                onClick={() => fileInputRef.current?.click()}
                title="上传图片"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                {selectedImages.length > 0 && (
                  <span className="upload-count">{selectedImages.length}</span>
                )}
              </button>
            )}
            <textarea
              ref={textareaRef}
              className={`input-textarea ${allowImageUpload ? 'has-upload-btn' : ''}`}
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
            multiple
            style={{ display: 'none' }}
            onChange={handleFileInputChange}
          />
        </div>
      </form>
    </div>
  );
};

export default InputArea;
