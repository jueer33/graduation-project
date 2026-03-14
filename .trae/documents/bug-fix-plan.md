# Bug修复计划

## 问题概述

根据用户反馈，需要修复以下三个问题：

1. **可视化编辑区域没有响应主题颜色切换** - 暗色/亮色主题切换时，VisualEditor组件没有使用CSS变量
2. **保存设计稿后会多出来一条新的历史记录** - 保存时错误地创建了新的历史记录而不是更新现有记录
3. **刷新页面后对话内容丢失** - 刷新时需要自动更新当前历史记录（而不是新增）

---

## 问题1：可视化编辑区域主题切换

### 问题分析
`VisualEditor.css` 中使用了硬编码的颜色值（如 `#ffffff`, `#333333`, `#f0f2f5` 等），而不是使用CSS变量（如 `var(--bg-primary)`, `var(--text-primary)` 等）。

### 修复方案
将 `VisualEditor.css` 中的所有硬编码颜色替换为CSS变量，使其能够响应主题切换。

### 需要修改的文件
- `front-end/src/components/VisualEditor/VisualEditor.css`

### 颜色映射关系

| 当前硬编码值 | 应替换为CSS变量 |
|-------------|----------------|
| `#ffffff` | `var(--bg-primary)` |
| `#f0f2f5` | `var(--bg-secondary)` |
| `#333333` | `var(--text-primary)` |
| `#666666` | `var(--text-secondary)` |
| `#999999` | `var(--text-tertiary)` |
| `#e8e8e8` | `var(--border-primary)` |
| `#d9d9d9` | `var(--border-secondary)` |
| `#1890ff` | `var(--primary)` |
| `#40a9ff` | `var(--primary-hover)` |
| `#f5f5f5` | `var(--bg-secondary)` |
| `#fafafa` | `var(--bg-secondary)` |
| `#f6ffed` | `var(--primary-light)` |
| `#b7eb8f` | `var(--success)` |
| `#52c41a` | `var(--success)` |
| `#ff4d4f` | `var(--error)` |
| `#e6f7ff` | `var(--primary-light)` |

---

## 问题2：保存设计稿后多出历史记录

### 问题分析
在 `PreviewArea.js` 中的 `handleSaveDesign` 函数，当保存设计稿时：
1. 如果有 `currentHistoryId`，会调用 `historyAPI.update()` 更新现有记录 ✓
2. 但更新后会调用 `loadHistories()` 重新加载列表
3. 问题可能在于历史记录列表的更新逻辑

经过进一步分析，发现问题可能在 `SidebarHistory.js` 中：
- 当切换模块时会重新加载历史记录
- 保存后历史记录列表的更新可能有问题

### 修复方案
检查 `PreviewArea.js` 中的保存逻辑，确保：
1. 有 `currentHistoryId` 时只更新，不创建新记录
2. 更新后正确刷新历史记录列表

### 需要修改的文件
- `front-end/src/components/PreviewArea/PreviewArea.js`（检查保存逻辑）

---

## 问题3：刷新页面后对话内容丢失

### 问题分析
当前系统：
- 对话内容存储在React Context中（内存中）
- 刷新页面后Context状态丢失
- 用户希望在刷新时自动保存当前对话到历史记录

### 修复方案
在 `TextToDesign.js` 中添加页面刷新事件监听：
1. 监听 `beforeunload` 事件
2. 如果当前有 `currentHistoryId`，则更新历史记录（包含对话内容）
3. 如果没有 `currentHistoryId` 但有对话内容，创建新记录

### 需要修改的文件
- `front-end/src/components/Modules/TextToDesign/TextToDesign.js`
- `front-end/src/components/Modules/ImageToDesign/ImageToDesign.js`
- `front-end/src/components/Modules/DesignToCode/DesignToCode.js`

---

## 实施步骤

### Step 1: 修复VisualEditor主题切换
- 修改 `VisualEditor.css`，将所有硬编码颜色替换为CSS变量

### Step 2: 修复保存历史记录问题
- 检查并修复 `PreviewArea.js` 中的保存逻辑
- 确保更新历史记录时不创建新记录

### Step 3: 添加刷新自动保存功能
- 在三个模块组件中添加 `beforeunload` 事件监听
- 实现自动保存/更新历史记录逻辑

---

## 验证清单

- [ ] 切换暗色/亮色主题时，VisualEditor正确响应
- [ ] 保存设计稿后不会多出历史记录
- [ ] 刷新页面后对话内容自动保存到当前历史记录
