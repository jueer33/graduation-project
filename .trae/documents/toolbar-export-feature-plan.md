# 工具栏新增导出功能计划

## 功能需求

在可视化编辑器的工具栏中新增两个按钮：
1. **导出为图片** - 将设计稿导出为 PNG 图片
2. **复制 JSON 数据** - 将 Design JSON 数据复制到剪贴板

---

## 技术方案

### 1. 导出为图片
- 使用 `html2canvas` 库将设计稿 DOM 元素转换为 Canvas，再导出为图片
- 需要安装依赖：`npm install html2canvas`

### 2. 复制 JSON 数据
- 使用浏览器的 `navigator.clipboard.writeText()` API
- 需要将 designJson 转换为格式化的 JSON 字符串

---

## 修改文件清单

| 文件 | 修改内容 |
|------|----------|
| `front-end/package.json` | 添加 html2canvas 依赖 |
| `front-end/src/components/VisualEditor/VisualEditor.js` | 添加导出按钮和处理函数 |
| `front-end/src/components/VisualEditor/VisualEditor.css` | 添加新按钮样式（可选） |

---

## 实施步骤

### 步骤 1：安装依赖

在 `front-end/package.json` 中添加 html2canvas：

```json
"html2canvas": "^1.4.1"
```

### 步骤 2：修改 VisualEditor.js

1. 导入 html2canvas
2. 添加 `handleExportImage` 函数
3. 添加 `handleCopyJson` 函数
4. 在工具栏中添加两个新按钮

#### 2.1 导入依赖

```jsx
import html2canvas from 'html2canvas';
import { useToast } from '../Toast/ToastContext';
```

#### 2.2 添加处理函数

```jsx
// 导出为图片
const handleExportImage = useCallback(async () => {
  const canvasElement = document.querySelector('.design-renderer');
  if (!canvasElement) {
    showToast('未找到设计稿元素', 'error');
    return;
  }

  try {
    const canvas = await html2canvas(canvasElement, {
      backgroundColor: '#ffffff',
      scale: 2 // 2倍清晰度
    });
    
    const link = document.createElement('a');
    link.download = `design-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    showToast('图片导出成功！', 'success');
  } catch (error) {
    console.error('导出图片失败:', error);
    showToast('导出图片失败', 'error');
  }
}, [showToast]);

// 复制 JSON 数据
const handleCopyJson = useCallback(() => {
  const jsonString = JSON.stringify(convertToNewFormat(designJson), null, 2);
  
  navigator.clipboard.writeText(jsonString).then(() => {
    showToast('JSON 数据已复制到剪贴板！', 'success');
  }).catch((error) => {
    console.error('复制失败:', error);
    showToast('复制失败', 'error');
  });
}, [designJson, showToast]);
```

#### 2.3 在工具栏添加按钮

在保存按钮后添加新按钮：

```jsx
<div className="toolbar-group">
  <button 
    className="toolbar-btn" 
    onClick={handleExportImage}
    title="导出为图片"
  >
    导出图片
  </button>
  <button 
    className="toolbar-btn" 
    onClick={handleCopyJson}
    title="复制 JSON 数据"
  >
    复制 JSON
  </button>
</div>
```

---

## 注意事项

1. 导出图片时需要确保 DesignRenderer 元素已经渲染完成
2. 复制 JSON 时使用新格式（convertToNewFormat）以保持数据一致性
3. 需要使用 showToast 显示操作结果提示用户
