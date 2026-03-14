# AI代码生成系统 - 前端

## 安装依赖

```bash
npm install
```

## 启动开发服务器

```bash
npm start
```

应用将在 http://localhost:3000 打开

## 构建生产版本

```bash
npm run build
```

## 项目结构

```
src/
  components/        # React组件
    Auth/           # 认证相关组件
    Layout/         # 布局组件
    Sidebar/        # 侧边栏
    ConversationArea/ # 对话区域
    PreviewArea/    # 预览区域
    Modules/        # 功能模块
    DesignPreview/  # 设计预览
    CodePreview/    # 代码预览
  store/            # 状态管理
  services/         # API服务
```

## 功能模块

1. **文本生成设计** - 通过自然语言描述生成Design JSON
2. **图片生成设计** - 上传图片解析生成Design JSON
3. **设计生成代码** - 将Design JSON转换为前端代码
4. **历史记录** - 查看和管理历史记录

