# Tasks

- [x] Task 1: 修改 InputArea 组件支持多图片上传
  - [x] SubTask 1.1: 将 selectedImage 从单个文件改为文件数组
  - [x] SubTask 1.2: 修改 handleFileSelect 支持多文件选择
  - [x] SubTask 1.3: 修改图片预览区域显示多张图片缩略图
  - [x] SubTask 1.4: 添加单张图片删除功能
  - [x] SubTask 1.5: 添加图片数量限制（最多5张）
  - [x] SubTask 1.6: 修改 handleSubmit 传递图片数组

- [x] Task 2: 修改 ImageToDesign 组件处理多图片
  - [x] SubTask 2.1: 修改 handleSubmit 接收图片数组
  - [x] SubTask 2.2: 为每张图片创建预览URL
  - [x] SubTask 2.3: 将多张图片添加到 FormData

- [x] Task 3: 修改前端 API 层
  - [x] SubTask 3.1: 确认 imageToDesign 方法支持多图片 FormData

- [x] Task 4: 修改后端 AI 路由
  - [x] SubTask 4.1: 将 upload.single('image') 改为 upload.array('images', 5)
  - [x] SubTask 4.2: 修改接口处理 req.files 数组
  - [x] SubTask 4.3: 将图片信息传递给生成器（伪实现）

- [x] Task 5: 测试验证
  - [x] SubTask 5.1: 测试单张图片上传
  - [x] SubTask 5.2: 测试多张图片上传
  - [x] SubTask 5.3: 测试图片删除功能
  - [x] SubTask 5.4: 测试超出限制提示

# Task Dependencies
- Task 2 depends on Task 1
- Task 3 depends on Task 2
- Task 4 depends on Task 3
- Task 5 depends on Task 4
