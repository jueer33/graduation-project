import React, { useRef, useState } from 'react';
import { useToast } from '../Toast/ToastContext';
import './ImageUpload.css';

const ImageUpload = ({ onUpload, loading = false }) => {
  const { showToast } = useToast();
  
  const fileInputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileSelect = (file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      showToast('请上传图片文件', 'warning');
      return;
    }

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // 调用上传回调
    onUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  return (
    <div className="image-upload">
      <div
        className={`upload-area ${dragging ? 'dragging' : ''} ${loading ? 'loading' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          style={{ display: 'none' }}
          disabled={loading}
        />
        {preview ? (
          <div className="upload-preview">
            <img src={preview} alt="预览" />
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📸</div>
            <div className="upload-text">
              {loading ? '上传中...' : '点击或拖拽图片到此处上传'}
            </div>
            <div className="upload-hint">支持 PNG、JPG 格式</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;

