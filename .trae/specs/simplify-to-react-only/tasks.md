# Tasks
- [x] Task 1: 移除 FrameworkSelector 组件中的多框架选项
  - [x] SubTask 1.1: 删除 `FrameworkSelector.js` 中的 vue 和 html 选项
  - [x] SubTask 1.2: 简化或移除 `FrameworkSelector.css` 样式
- [x] Task 2: 移除 DesignToCode 模块中的框架选择器
  - [x] SubTask 2.1: 从 `DesignToCode.js` 中移除 FrameworkSelector 组件引用
  - [x] SubTask 2.2: 将 framework 状态硬编码为 'react'
  - [x] SubTask 2.3: 更新所有调用 API 的地方，使用固定的 'react' 框架
- [x] Task 3: 简化状态管理
  - [x] SubTask 3.1: 从 store 中移除 framework 相关状态（如果存在）
  - [x] SubTask 3.2: 更新 API 调用，移除 framework 参数或固定为 'react'
- [x] Task 4: 更新后端 API
  - [x] SubTask 4.1: 修改后端代码生成接口，固定使用 react 框架
  - [x] SubTask 4.2: 移除后端框架选择相关逻辑

# Task Dependencies
- Task 2 依赖 Task 1
- Task 3 依赖 Task 2
- Task 4 可并行执行
