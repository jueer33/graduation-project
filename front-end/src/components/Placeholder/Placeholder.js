import React from 'react';
import './Placeholder.css';

const Placeholder = ({ message = '暂无内容', icon = '📄' }) => {
  return (
    <div className="placeholder">
      <div className="placeholder-icon">{icon}</div>
      <div className="placeholder-message">{message}</div>
    </div>
  );
};

export default Placeholder;

