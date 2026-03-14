import React from 'react';
import './FrameworkSelector.css';

const frameworks = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'html', label: 'HTML' }
];

const FrameworkSelector = ({ value, onChange }) => {
  return (
    <div className="framework-selector">
      <label className="framework-label">选择框架：</label>
      <div className="framework-options">
        {frameworks.map(framework => (
          <button
            key={framework.value}
            className={`framework-option ${value === framework.value ? 'active' : ''}`}
            onClick={() => onChange(framework.value)}
          >
            {framework.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FrameworkSelector;

