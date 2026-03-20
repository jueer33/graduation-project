# 历史记录请求问题修复计划

## 问题分析

### 1. 发送两个请求的原因
- `SidebarHistory.js` 在 `useEffect` 中调用 `historyAPI.getList(1, 10)`
- `PreviewArea.js` 也有 `loadHistories` 函数，调用 `historyAPI.getList(1, 20)`
- 两个组件同时渲染时会发送两个请求

### 2. 切换模块后历史记录显示不完整
- 刷新页面时正常（页面重新加载数据）
- 切换模块后不正常
- 可能原因：
  1. `useEffect` 依赖项问题导致切换模块时重新请求但数据被覆盖
  2. `currentModule` 变化时 histories 状态未正确处理

## 实现步骤

### 1. 移除重复请求
- 移除 `PreviewArea.js` 中的历史记录加载逻辑（SidebarHistory 统一管理）

### 2. 统一 limit 参数
- 将 SidebarHistory 中的 limit 从 10 改为 20

### 3. 修复切换模块时的问题
- 检查 useEffect 依赖项
- 确保切换模块时正确加载该模块的历史记录
