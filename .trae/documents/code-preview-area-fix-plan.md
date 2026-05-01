# 代码生成模块预览区修复计划

## 问题分析

当前在「设计生成代码」模块中，右侧预览区域会根据 `previewState` 来决定显示内容：
- `previewState === 'design'` → 显示 VisualEditor（可视化设计编辑器）+ 「生成代码」按钮
- `previewState === 'code'` → 显示 CodePreview（代码预览）

**存在的问题：**
1. 在「设计生成代码」模块中，右侧**不需要**显示设计稿的可视化编辑器
2. 「生成代码」按钮只应该在 `text-to-design` 和 `image-to-design` 模块中显示，不应该在 `design-to-code` 模块中显示
3. 在 `design-to-code` 模块中，右侧应该始终显示 **CodePreview**（代码预览），而不是 VisualEditor

## 修改方案

### 修改文件 1: `front-end/src/components/PreviewArea/PreviewArea.js`

**改动内容：**

1. **添加 `currentModule` 到依赖**（已在 store 中获取，但需在条件判断中使用）

2. **修改 `renderContent` 逻辑**：
   - 当 `currentModule === 'design-to-code'` 时：
     - 始终显示 CodePreview（如果有 `currentCode`）
     - 如果没有代码，显示 Placeholder（不再显示 VisualEditor）
     - 不显示「生成代码」按钮
   - 当 `currentModule !== 'design-to-code'` 时（即 text-to-design / image-to-design）：
     - `previewState === 'design'` 且 `currentDesignJson` 存在 → 显示 VisualEditor + 「生成代码」按钮
     - `previewState === 'code'` 且 `currentCode` 存在 → 显示 CodePreview

**具体代码改动：**

将 `renderContent` 中的条件判断改为：

```javascript
const renderContent = () => {
    // 如果正在加载，显示骨架屏
    if (loading) {
      return <SkeletonScreen />;
    }
    
    // 设计生成代码模块：只显示代码预览
    if (currentModule === 'design-to-code') {
      if (currentCode) {
        return <CodePreview code={currentCode} />;
      }
      return <Placeholder message="生成代码后将在此处预览" />;
    }
    
    // 文本/图片生成设计模块：显示设计稿编辑器 + 生成代码按钮
    if (previewState === 'design' && currentDesignJson) {
      return (
        <div className="design-preview-wrapper">
          <div className="design-preview-actions">
            <button 
              className="generate-code-btn"
              onClick={handleGenerateCode}
              title="将设计稿转换为代码"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="16 18 22 12 16 6"></polyline>
                <polyline points="8 6 2 12 8 18"></polyline>
              </svg>
              生成代码
            </button>
          </div>
          <VisualEditor
            key={currentHistoryId || 'visual-editor'}
            initialDesignJson={currentDesignJson}
            onChange={handleDesignChange}
            onSave={handleSaveDesign}
            isSaving={isSaving}
          />
        </div>
      );
    } else if (previewState === 'code' && currentCode) {
      return <CodePreview code={currentCode} />;
    } else {
      return <Placeholder message="暂无预览内容" />;
    }
};
```

### 修改文件 2: `front-end/src/components/Modules/DesignToCode/DesignToCode.js`（可选确认）

当前 DesignToCode 模块在代码生成成功后会调用 `setPreviewState('code')`，这已经正确。但由于 PreviewArea 之前没有区分模块，所以即使 `previewState === 'code'`，也可能被其他逻辑干扰。

在修改 PreviewArea 后，此模块的行为应该变为：
1. 用户点击「生成代码」→ 调用 API
2. API 返回成功 → `setCurrentCode(response.code)` + `setPreviewState('code')`
3. PreviewArea 检测到 `currentModule === 'design-to-code'` 且 `currentCode` 存在 → 显示 CodePreview

## 预期效果

| 模块 | previewState | 右侧显示 |
|------|-------------|---------|
| text-to-design | design | VisualEditor + 「生成代码」按钮 |
| text-to-design | code | CodePreview |
| image-to-design | design | VisualEditor + 「生成代码」按钮 |
| image-to-design | code | CodePreview |
| design-to-code | 任意 | CodePreview（有代码时）/ Placeholder（无代码时） |
