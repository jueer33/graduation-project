# 代码生成 API 优化计划

## 问题分析

用户反馈：调用一次代码生成就用完了API额度。

**当前问题点：**

1. **System Prompt 过长**（约600 tokens）：`CODE_GENERATION_SYSTEM_PROMPT` 包含了大量格式说明、质量要求、重要规则等
2. **User Prompt 包含完整 Design JSON**：Design JSON 可能非常大，直接 `JSON.stringify(designJson, null, 2)` 会占用大量 tokens
3. **max_tokens: 12000** 设置过大，一次请求可能消耗上万个 output tokens
4. **retryParseWithAI 机制**：如果 JSON 解析失败，会再次调用 AI 进行修复，相当于一次请求最多调用 2 次 API
5. **model: qwen-turbo**：虽然便宜，但如果 prompt 太长 + 输出太长，token 消耗依然很大

**Token 消耗估算：**
- System Prompt: ~600 tokens
- User Prompt (含 Design JSON): ~1500-3000 tokens
- Output (max_tokens): 最多 12000 tokens
- 如果 retry: 额外 ~2000 tokens (input) + ~12000 tokens (output)
- **总计可能: 15000-28000 tokens/次**

## 优化方案

### 优化 1: 精简 System Prompt（减少约 40% token 消耗）

**文件**: `d:\project\bisheV2\back-end\services\qwenService.js` (L752-L811)

**改动**: 将 `CODE_GENERATION_SYSTEM_PROMPT` 从 ~600 tokens 精简到 ~300 tokens

**精简后的 Prompt**：
```
你是一个前端代码生成专家。根据用户的设计稿或需求，生成完整可运行的前端代码。

## 输出格式（严格 JSON）
{
  "replyText": "对用户的友好回复",
  "code": {
    "type": "react" | "vue" | "html",
    "files": [
      {"path": "文件名", "content": "完整代码", "language": "javascript|css|html|vue"}
    ]
  }
}

## 要求
- React: 函数式组件+Hooks，import/export 完整，CSS 独立文件
- Vue: Vue 3 Composition API，<script setup>，<style scoped>
- HTML: 完整 HTML5 文档，内联 CSS/JS
- 严格按照设计稿结构和样式生成
- 代码完整可运行，不要省略任何部分
- 必须返回合法 JSON，代码中双引号转义为 \"，换行用 \\n
- 不要包含 markdown 代码块标记，replyText 用中文
```

### 优化 2: 压缩 Design JSON 输入（减少约 50% token 消耗）

**文件**: `d:\project\bisheV2\back-end\services\qwenService.js` (L868-L888)

**改动**: 将 `JSON.stringify(designJson, null, 2)` 改为 `JSON.stringify(designJson)` (去掉格式化空格)

```javascript
// 修改前
${JSON.stringify(designJson, null, 2)}

// 修改后
${JSON.stringify(designJson)}
```

### 优化 3: 降低 max_tokens

**文件**: `d:\project\bisheV2\back-end\services\qwenService.js` (L899, L978, L1071)

**改动**: 将 `max_tokens: 12000` 改为 `max_tokens: 4096`

理由：生成的代码通常不会超过 4000 tokens，如果超过说明模型在冗余输出。降低后可以控制成本。

### 优化 4: 简化 User Prompt

**文件**: `d:\project\bisheV2\back-end\services\qwenService.js` (L876-L888)

**改动**: 精简 user prompt，去掉冗余描述

```javascript
// 修改前
const userPrompt = `请将以下 Design JSON 转换为 ${frameworkNames[framework]} 代码。

Design JSON:
\`\`\`json
${JSON.stringify(designJson, null, 2)}
\`\`\`

要求：
1. 严格按照设计稿的结构和样式生成代码
2. 保持所有组件层级和布局关系
3. 转换样式为对应的 CSS 规则
4. 代码完整可运行，包含必要的 import/export
5. 添加适当的代码注释`;

// 修改后
const userPrompt = `将以下 Design JSON 转换为 ${frameworkNames[framework]} 代码：
${JSON.stringify(designJson)}`;
```

### 优化 5: 可选 - 更换模型（降低成本）

**文件**: `d:\project\bisheV2\back-end\.env` (L16)

**当前**: `LLM_MODEL=qwen-turbo`

**建议**: `qwen-turbo` 已经是最便宜的模型了（约 0.002 元/千token）。

如果仍然消耗过大，可以考虑：
- 使用 `qwen-long` 处理长文本（更便宜）
- 或者限制每次生成的组件数量

## 预期效果

| 优化项 | 优化前 tokens | 优化后 tokens | 节省 |
|--------|--------------|--------------|------|
| System Prompt | ~600 | ~300 | ~50% |
| Design JSON 输入 | ~2000 | ~1000 | ~50% |
| User Prompt | ~2500 | ~1200 | ~52% |
| Output (max) | 12000 | 4096 | ~66% |
| **总计（不含 retry）** | **~15000** | **~5500** | **~63%** |

**优化后单次调用约消耗 5000-6000 tokens，相比之前的 15000+ tokens，成本降低约 60%。**

## 实施步骤

1. 修改 `qwenService.js` 中的 `CODE_GENERATION_SYSTEM_PROMPT`
2. 修改 `generateCodeFromDesign` 函数中的 userPrompt 和 max_tokens
3. 修改 `generateCodeFromText` 函数中的 userPrompt 和 max_tokens  
4. 修改 `generateCodeFromImages` 函数中的 max_tokens
5. 测试验证代码生成功能正常工作
