import React from 'react';
import { useAppStore } from '../../store/store';
import DesignPreview from '../DesignPreview/DesignPreview';
import CodePreview from '../CodePreview/CodePreview';
import VisualEditor from '../VisualEditor';
import Placeholder from '../Placeholder/Placeholder';
import './PreviewArea.css';

const PreviewArea = ({ showBackButton, onBack }) => {
  const { 
    previewState, 
    currentDesignJson, 
    currentCode,
    setCurrentDesignJson,
    addHistory,
    currentModule
  } = useAppStore();

  if (previewState === 'hidden') {
    return null;
  }

  /**
   * 处理Design JSON变化
   */
  const handleDesignChange = (newDesignJson) => {
    setCurrentDesignJson(newDesignJson);
  };

  /**
   * 处理保存设计
   */
  const handleSaveDesign = (designJson) => {
    // 保存到历史记录
    const historyData = {
      type: currentModule,
      designJson: designJson,
      createdAt: new Date().toISOString()
    };
    addHistory(historyData);
    
    // 可以在这里添加保存成功的提示
    console.log('设计已保存:', designJson.metadata?.title || '未命名');
  };

  const renderContent = () => {
    if (previewState === 'design' && currentDesignJson) {
      // 使用可视化编辑器替代简单的DesignPreview
      return (
        <VisualEditor
          initialDesignJson={currentDesignJson}
          onChange={handleDesignChange}
          onSave={handleSaveDesign}
        />
      );
    } else if (previewState === 'code' && currentCode) {
      return <CodePreview code={currentCode} />;
    } else {
      return <Placeholder message="暂无预览内容" />;
    }
  };

  return (
    <div className="preview-area">
      {showBackButton && (
        <div className="preview-toggle-bar">
          <button
            className="preview-toggle-btn"
            onClick={onBack}
          >
            返回对话
          </button>
        </div>
      )}
      <div className="preview-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PreviewArea;
