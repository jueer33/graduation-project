# 多图片上传生成设计稿 Spec

## Why
当前图片生成设计功能只支持单张图片上传，用户需要能够上传多张参考图片来生成或修改设计稿。多张图片可以提供更丰富的视觉参考，帮助AI更好地理解用户需求。

## What Changes
- [ ] 修改前端 InputArea 组件，支持多图片上传和预览
- [ ] 修改前端 ImageToDesign 组件，处理多张图片并传递给后端
- [ ] 修改前端 API 层，支持传递多张图片文件
- [ ] 修改后端 AI 路由，支持接收多张图片文件
- [ ] 修改后端伪数据生成器，考虑多张图片的上下文

## Impact
- Affected specs: 图片生成设计模块
- Affected code: 
  - front-end/src/components/InputArea/InputArea.js
  - front-end/src/components/Modules/ImageToDesign/ImageToDesign.js
  - front-end/src/services/api.js
  - back-end/routes/ai.js
  - back-end/utils/mockDesignGenerator.js

## ADDED Requirements

### Requirement: 多图片上传支持
The system SHALL 允许用户在一次对话中上传多张图片作为设计参考素材。

#### Scenario: 用户上传多张图片生成设计
- **GIVEN** 用户在图片生成设计模块
- **WHEN** 用户选择多张图片并输入描述文字
- **THEN** 系统应将所有图片和文字一起发送给后端
- **AND** 后端应将图片素材传递给大模型（伪实现阶段模拟处理）

#### Scenario: 基于现有设计稿修改时上传图片
- **GIVEN** 用户已有当前设计稿
- **WHEN** 用户上传新的参考图片并输入修改指令
- **THEN** 系统应将当前设计稿、多张图片和修改指令一起发送给后端

### Requirement: 图片预览管理
The system SHALL 提供多图片的预览和管理功能。

#### Scenario: 显示多张图片预览
- **WHEN** 用户选择多张图片
- **THEN** 系统应在输入区域显示所有图片的缩略图预览
- **AND** 用户应能删除单张图片

#### Scenario: 图片数量限制
- **WHEN** 用户选择的图片超过5张
- **THEN** 系统应提示用户最多只能上传5张图片

## MODIFIED Requirements

### Requirement: 图片上传接口
**原需求**: 单文件上传 `upload.single('image')`
**修改后**: 多文件上传 `upload.array('images', 5)`

### Requirement: API 调用方式
**原需求**: `imageToDesign(formData, currentDesignJson)` 传递单张图片
**修改后**: `imageToDesign(formData, currentDesignJson)` 传递多张图片，formData中包含多个images字段
