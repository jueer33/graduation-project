# 图片生成设计稿 - 实现计划

## 项目背景

基于用户需求，需要重新实现图片生成设计稿功能，参考文本生成设计稿的逻辑，并添加图片保存到数据库的功能。

## 实现目标

1. 重新实现 ImageToDesign 组件，参考 TextToDesign 的逻辑结构
2. 支持最多5张图片上传
3. 图片保存到数据库（保存相对路径）
4. 图片可以作为参考图或素材图
5. 集成会话管理和历史记录功能

## 任务分解

### [x] 任务 1: 后端图片保存功能实现
- **Priority**: P0
- **Depends On**: None
- **Description**:
  - 修改后端 `ai.js` 中的 `image-to-design` 接口
  - 实现图片文件保存到服务器本地
  - 生成相对路径并返回给前端
  - 确保图片路径正确保存到历史记录
- **Success Criteria**:
  - 图片成功上传并保存到服务器
  - 数据库中保存图片的相对路径
  - 前端能接收到正确的图片路径
- **Test Requirements**:
  - `programmatic` TR-1.1: 上传图片后返回成功状态和图片路径
  - `programmatic` TR-1.2: 数据库中历史记录包含图片路径
  - `human-judgement` TR-1.3: 图片文件存在于服务器指定目录

### [x] 任务 2: 前端 ImageToDesign 组件重构
- **Priority**: P0
- **Depends On**: 任务 1
- **Description**:
  - 参考 TextToDesign 组件的结构
  - 实现会话管理功能
  - 集成历史记录保存和更新
  - 处理图片上传和预览
- **Success Criteria**:
  - ImageToDesign 组件结构与 TextToDesign 保持一致
  - 支持会话ID管理
  - 自动保存历史记录
- **Test Requirements**:
  - `programmatic` TR-2.1: 组件能正确处理图片上传
  - `programmatic` TR-2.2: 会话ID正确生成和管理
  - `human-judgement` TR-2.3: UI界面与TextToDesign保持一致

### [x] 任务 3: 图片上传和预览功能完善
- **Priority**: P1
- **Depends On**: 任务 2
- **Description**:
  - 实现最多5张图片的上传限制
  - 图片预览功能
  - 图片上传进度显示
  - 错误处理和用户提示
- **Success Criteria**:
  - 最多支持5张图片上传
  - 上传前显示预览
  - 上传过程显示进度
- **Test Requirements**:
  - `programmatic` TR-3.1: 超过5张图片时显示错误提示
  - `human-judgement` TR-3.2: 图片预览正常显示
  - `human-judgement` TR-3.3: 上传进度显示清晰

### [x] 任务 4: 历史记录和数据库集成
- **Priority**: P1
- **Depends On**: 任务 1, 任务 2
- **Description**:
  - 确保图片路径正确保存到历史记录
  - 历史记录中包含图片信息
  - 恢复历史记录时能正确加载图片
- **Success Criteria**:
  - 历史记录中包含图片路径
  - 恢复历史时能显示图片
  - 数据库中存储的图片路径正确
- **Test Requirements**:
  - `programmatic` TR-4.1: 历史记录API调用成功
  - `programmatic` TR-4.2: 数据库中历史记录包含图片路径
  - `human-judgement` TR-4.3: 恢复历史时图片正确显示

### [x] 任务 5: 测试和优化
- **Priority**: P2
- **Depends On**: 任务 1-4
- **Description**:
  - 测试完整的图片生成流程
  - 优化图片上传性能
  - 完善错误处理
  - 确保与其他模块的兼容性
- **Success Criteria**:
  - 完整流程测试通过
  - 性能优化效果明显
  - 错误处理完善
- **Test Requirements**:
  - `programmatic` TR-5.1: 完整流程无错误
  - `programmatic` TR-5.2: 图片上传速度合理
  - `human-judgement` TR-5.3: 用户体验良好

## 技术实现要点

1. **后端图片处理**:
   - 使用 multer 处理文件上传
   - 创建上传目录结构
   - 生成唯一文件名
   - 返回相对路径

2. **前端实现**:
   - 参考 TextToDesign 的会话管理逻辑
   - 使用 FormData 处理图片上传
   - 实现图片预览和进度显示
   - 集成历史记录功能

3. **数据库集成**:
   - 在历史记录中保存图片路径
   - 确保路径格式正确
   - 支持历史记录的恢复

## 风险评估

1. **文件上传失败**:
   - 应对措施: 添加错误处理和重试机制

2. **数据库存储问题**:
   - 应对措施: 确保路径格式正确，添加数据验证

3. **性能问题**:
   - 应对措施: 优化文件上传和处理逻辑

4. **兼容性问题**:
   - 应对措施: 确保与现有代码结构保持一致

## 交付物

1. 后端图片保存功能实现
2. 重构后的 ImageToDesign 组件
3. 完整的图片生成设计稿流程
4. 测试报告

## 时间估计

- 任务 1: 1-2 小时
- 任务 2: 2-3 小时
- 任务 3: 1-2 小时
- 任务 4: 1-2 小时
- 任务 5: 1-2 小时

总计: 6-11 小时