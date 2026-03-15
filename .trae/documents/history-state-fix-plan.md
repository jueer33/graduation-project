# 历史记录状态管理修复计划

## 问题分析

**核心问题**：当用户在新对话中生成设计稿后切换到历史记录时，前端显示的设计稿没有正确切换，且会错误地将当前设计稿覆盖到所有历史记录中。

**根本原因**：
1. **状态管理混乱**：所有模块共享同一个 `currentDesignJson` 全局状态
2. **缺少路由系统**：无法通过URL管理不同的会话状态
3. **自动保存逻辑问题**：切换模块时会保存当前的 `currentDesignJson` 到当前历史记录
4. **历史记录恢复逻辑缺陷**：恢复历史记录时没有正确处理状态切换

## 修复计划

### [x] 任务 1：引入React Router路由系统
- **优先级**：P0
- **Depends On**：None
- **Description**：
  - 安装React Router依赖
  - 配置路由系统，支持不同功能模块和会话ID的路由
  - 实现通过URL参数管理会话状态
- **Success Criteria**：
  - 项目集成React Router
  - 支持 `/text-to-design`, `/image-to-design`, `/design-to-code` 路由
  - 支持会话ID作为URL参数
- **Test Requirements**：
  - `programmatic` TR-1.1：路由切换正常，URL参数正确传递
  - `human-judgement` TR-1.2：页面刷新后状态保持一致

### [x] 任务 2：重构状态管理，支持多会话状态
- **优先级**：P0
- **Depends On**：任务1
- **Description**：
  - 修改store.js，为每个会话维护独立的状态
  - 实现会话状态的管理和切换逻辑
  - 确保每个会话有独立的designJson、code等状态
- **Success Criteria**：
  - 不同会话的状态相互隔离
  - 切换会话时状态正确切换
  - 历史记录恢复时状态正确加载
- **Test Requirements**：
  - `programmatic` TR-2.1：多个会话同时存在，状态互不影响
  - `programmatic` TR-2.2：切换会话时状态正确切换

### [x] 任务 3：修复自动保存逻辑
- **优先级**：P1
- **Depends On**：任务2
- **Description**：
  - 改进 `saveCurrentConversation` 函数
  - 确保只保存当前会话的状态到对应的历史记录
  - 修复切换模块时的保存逻辑
- **Success Criteria**：
  - 切换模块时只保存当前会话的状态
  - 历史记录不会被错误覆盖
  - 自动保存逻辑正确执行
- **Test Requirements**：
  - `programmatic` TR-3.1：切换模块时正确保存当前会话状态
  - `programmatic` TR-3.2：历史记录不会被其他会话的状态覆盖

### [x] 任务 4：修复历史记录恢复逻辑
- **优先级**：P0
- **Depends On**：任务2
- **Description**：
  - 修复 `handleRestore` 函数
  - 确保恢复历史记录时正确加载对应的designJson
  - 修复切换历史记录时的状态管理
- **Success Criteria**：
  - 恢复历史记录时显示正确的设计稿
  - 不会错误地覆盖其他历史记录
  - 历史记录恢复后可以正常编辑
- **Test Requirements**：
  - `programmatic` TR-4.1：恢复历史记录时显示正确的设计稿
  - `programmatic` TR-4.2：多次切换历史记录后状态正确

### [x] 任务 5：优化用户体验
- **优先级**：P2
- **Depends On**：任务1-4
- **Description**：
  - 添加会话标题显示
  - 优化历史记录列表的显示
  - 添加会话管理功能
- **Success Criteria**：
  - 用户可以清晰看到当前会话
  - 历史记录列表显示更友好
  - 会话管理功能正常工作
- **Test Requirements**：
  - `human-judgement` TR-5.1：用户界面友好，操作流畅
  - `human-judgement` TR-5.2：历史记录管理功能易用

## 技术实现要点

1. **路由系统**：
   - 使用 React Router v6
   - 配置路由参数：`/:module/:sessionId?`
   - 实现路由守卫，确保用户登录

2. **状态管理**：
   - 为每个会话维护独立的状态对象
   - 使用会话ID作为key来管理不同会话的状态
   - 实现会话状态的懒加载和清理

3. **自动保存**：
   - 基于当前会话ID保存状态
   - 确保只保存当前会话的状态
   - 优化保存时机，避免频繁保存

4. **历史记录恢复**：
   - 先保存当前会话状态
   - 再加载历史记录状态
   - 确保状态切换的顺序正确

## 预期效果

1. **问题解决**：
   - 切换历史记录时显示正确的设计稿
   - 历史记录不会被错误覆盖
   - 状态管理清晰有序

2. **功能增强**：
   - 支持通过URL直接访问特定会话
   - 会话状态持久化
   - 更好的用户体验

3. **代码质量**：
   - 状态管理更加清晰
   - 代码结构更加合理
   - 可维护性提高
