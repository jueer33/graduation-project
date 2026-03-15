# AI 生成组件文本编辑问题修复计划

## 问题分析

### 当前问题

1. **组件库创建的组件**：使用 `content` 字段存储文本内容，在属性面板中可以编辑
2. **AI 生成的组件**：同样使用 `content` 字段，但没有来源标记
3. **问题核心**：无法区分 AI 生成的组件和手动添加的组件，导致 AI 生成的文本内容不允许编辑

### 解决方案

在 Design JSON 数据结构中增加 `isGenerated` 字段来标识组件来源：
- `isGenerated: true` - AI 生成的组件
- `isGenerated: false` 或不存在的 - 手动添加的组件

然后在属性面板中根据此字段控制编辑权限。

---

## 修改步骤

### 1. 修改后端 mockDesignGenerator.js - 添加 isGenerated 标记

在所有 AI 生成的 Design JSON 中添加 `isGenerated: true` 字段到根节点。

### 2. 修改前端属性面板 - 根据 isGenerated 控制编辑权限

在 `VisualEditor.js` 的属性面板中，检查组件的 `isGenerated` 字段：
- 如果 `isGenerated: true`，显示文本内容但禁用编辑（disabled）
- 如果组件不是 AI 生成的（`isGenerated: false` 或不存在），允许编辑

### 3. 更新 json结构.md 文档

在 Design JSON 结构规范中添加 `isGenerated` 字段的说明。

---

## 具体代码修改

### 1. 后端修改 - mockDesignGenerator.js

在生成函数返回的 Design JSON 根节点中添加：
```javascript
{
  "version": "1.0",
  "type": "page",
  "isGenerated": true,  // 新增：标识是 AI 生成的
  ...
}
```

### 2. 前端修改 - VisualEditor.js

找到属性面板中内容编辑的部分（约第504-513行），修改为：

```javascript
{/* 内容属性 */}
{selectedNode.content !== undefined && selectedNode.type !== 'image' && (
  <div className="property-section">
    <h4 className="property-section-title">内容</h4>
    <div className="property-field">
      <textarea
        value={selectedNode.content}
        onChange={(e) => handleUpdateNode(selectedId, { content: e.target.value })}
        rows={3}
        placeholder="输入内容..."
        disabled={selectedNode.isGenerated === true}  // 新增：AI生成的禁止编辑
      />
      {selectedNode.isGenerated === true && (
        <span className="readonly-hint">AI生成的内容不可编辑</span>
      )}
    </div>
  </div>
)}
```

### 3. 更新 json结构.md

在根结构中添加：

```json
{
  "version": "1.0",
  "type": "page",
  "isGenerated": true,  // 标识是否是 AI 生成的
  "metadata": {...},
  "style": {...},
  "children": [...]
}
```

字段说明：
| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| isGenerated | boolean | 否 | 是否是AI生成的，true表示AI生成，不可编辑内容 |

---

## 涉及的修改文件

1. `d:\project\bisheV2\back-end\utils\mockDesignGenerator.js` - 添加 isGenerated 标记
2. `d:\project\bisheV2\front-end\src\components\VisualEditor.js` - 控制编辑权限
3. `d:\project\bisheV2\json结构.md` - 更新文档

---

## 验收标准

1. AI 生成的 Design JSON 包含 `isGenerated: true` 字段
2. AI 生成的组件在属性面板中显示文本内容但不可编辑
3. 手动添加的组件在属性面板中可以正常编辑
4. 文档中包含 `isGenerated` 字段的说明
