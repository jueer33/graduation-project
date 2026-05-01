# 更换代码生成 API 模型计划

## 问题分析

当前使用的 `qwen-turbo` 模型免费额度已用完，需要更换为阿里云百炼的其他可用模型。

## 可用模型对比

| 模型 | 输入价格(元/千tokens) | 输出价格(元/千tokens) | 能力 | 推荐场景 |
|------|----------------------|----------------------|------|----------|
| qwen-turbo | 0.0003 | 0.0006 | 基础 | 简单文本任务（已用完） |
| **qwen-plus** | **0.0008** | **0.002** | **中等** | **代码生成推荐** |
| qwen-max | 0.004 | 0.012 | 最强 | 复杂任务 |

## 推荐方案：切换到 `qwen-plus`

**理由：**
1. `qwen-plus` 是通义千问的中级模型，在代码生成能力上优于 `qwen-turbo`
2. 价格适中：输入 0.0008元/千tokens，输出 0.002元/千tokens
3. 经过之前的优化（约5500 tokens/次），单次调用成本约 **0.011元**，非常经济
4. 无需更换 API key，直接修改模型名称即可

## 修改方案

### 修改文件：`d:\project\bisheV2\back-end\.env`

**改动：**
```diff
- LLM_MODEL=qwen-turbo
+ LLM_MODEL=qwen-plus
```

仅此一处修改。因为代码中已经使用了环境变量 `process.env.LLM_MODEL`：
```javascript
const TEXT_MODEL = process.env.LLM_MODEL || 'qwen-turbo';
```

修改 `.env` 后重启后端服务即可生效。

## 备选方案

如果 `qwen-plus` 效果不够好，可以考虑升级到 `qwen-max`（价格稍贵但能力最强）：
```
LLM_MODEL=qwen-max
```
