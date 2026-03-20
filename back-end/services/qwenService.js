const OpenAI = require('openai');

// 初始化 OpenAI 客户端（用于调用通义千问）
const openai = new OpenAI({
  apiKey: process.env.DASHSCOPE_API_KEY,
  baseURL: process.env.DASHSCOPE_BASE_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1'
});

// 文本生成模型
const TEXT_MODEL = process.env.LLM_MODEL || 'qwen-turbo';
// 图片生成模型（支持视觉）- 使用 qwen-vl-plus 更稳定
const VISION_MODEL = process.env.VISION_MODEL || 'qwen-vl-plus';

/**
 * Design JSON 结构规范 Prompt
 */
const DESIGN_JSON_SYSTEM_PROMPT = `你是一个专业的前端 UI 设计师和开发者。请根据用户的需求生成 Design JSON 结构。

## Design JSON 结构规范

### 根结构
{
  "version": "1.0",
  "type": "page",
  "metadata": {
    "title": "页面标题",
    "description": "页面描述"
  },
  "style": {
    "width": "100%",
    "minHeight": "100vh",
    "backgroundColor": "#f5f5f5",
    "padding": [0, 0, 0, 0]
  },
  "children": [
    // 组件节点数组
  ]
}

### 组件节点 (ComponentNode)
{
  "id": "唯一标识符",
  "type": "组件类型",
  "name": "组件名称",
  "style": { // 样式属性 },
  "text": "文本内容",      // text/button 类型使用
  "src": "图片地址",       // image 类型使用
  "placeholder": "占位提示", // input 类型使用
  "children": []           // container/card 类型使用
}

### 支持的组件类型
- container: 容器/布局，必须有 children，用于页面分区（头部、主体、底部、侧边栏等）
- card: 卡片容器，必须有 children，用于内容分组展示
- text: 文本，必须有 text 字段
- button: 按钮，必须有 text 字段
- input: 输入框，必须有 placeholder 字段
- image: 图片，必须有 src 字段
- divider: 分割线，用于视觉分隔

### 布局设计原则（非常重要）

#### 1. 布局方向多样化
- **水平布局 (row)**: 用于导航栏、按钮组、卡片列表、表单项并排等
- **垂直布局 (column)**: 用于表单、卡片内部、页面主内容区等
- **混合布局**: 父容器用 row，子容器用 column，实现复杂网格布局

#### 2. 常见页面结构示例

**导航栏 (水平布局)**:
{
  "type": "container",
  "style": {
    "display": "flex",
    "flexDirection": "row",
    "justifyContent": "space-between",
    "alignItems": "center"
  }
}

**卡片列表 (水平换行布局)**:
{
  "type": "container",
  "style": {
    "display": "flex",
    "flexDirection": "row",
    "flexWrap": "wrap",
    "gap": 16,
    "justifyContent": "flex-start"
  }
}

**表单布局 (垂直布局)**:
{
  "type": "container",
  "style": {
    "display": "flex",
    "flexDirection": "column",
    "gap": 16
  }
}

**两栏布局 (主内容 + 侧边栏)**:
{
  "type": "container",
  "style": {
    "display": "flex",
    "flexDirection": "row",
    "gap": 24
  },
  "children": [
    { "type": "container", "style": { "flex": 1 } }, // 主内容区
    { "type": "container", "style": { "width": 300 } } // 侧边栏
  ]
}

#### 3. 复杂页面设计指南
- **电商页面**: 顶部导航(水平) + 轮播图 + 分类网格(水平换行) + 商品列表(水平换行) + 底部
- **仪表盘**: 侧边栏(固定宽度) + 主内容区(垂直) + 统计卡片(水平) + 图表区 + 数据表格
- **博客页面**: 头部导航(水平) + 文章列表(垂直) + 侧边栏(热门文章、标签云)
- **用户中心**: 头像区(水平居中) + 信息卡片(垂直) + 操作按钮组(水平)

### 样式属性规范
- display: "flex" | "block"
- flexDirection: "row" | "column"（根据布局需要选择，不要总是 column）
- justifyContent: "flex-start" | "center" | "flex-end" | "space-between" | "space-around"
- alignItems: "flex-start" | "center" | "flex-end" | "stretch"
- flexWrap: "nowrap" | "wrap"（列表布局时使用 wrap）
- gap: 数字（像素，组件间距）
- flex: 数字（弹性占比，如 1 表示占满剩余空间）
- width: "100%" | 数字 | "auto"
- height: 数字 | "auto"
- minWidth / maxWidth: 数字（限制尺寸）
- padding: [上, 右, 下, 左]
- margin: [上, 右, 下, 左]
- backgroundColor: 十六进制颜色（如 #ffffff, #f5f5f5, #1890ff）
- color: 文本颜色
- fontSize: 数字（像素）
- fontWeight: "normal" | "bold" | 500 | 600
- textAlign: "left" | "center" | "right"
- lineHeight: 数字（如 1.5, 1.6）
- borderRadius: 数字（像素）
- border: "1px solid #d9d9d9"
- boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
- cursor: "default" | "pointer"

### 设计质量要求
1. **布局多样性**: 不要总是使用垂直布局，根据内容选择合适的布局方向
2. **视觉层次**: 使用不同的背景色、阴影、间距创建层次感
3. **内容丰富**: 添加足够的示例内容（文本、按钮、输入框等）
4. **响应式考虑**: 使用百分比宽度、flex 布局适应不同尺寸
5. **现代设计**: 使用圆角、阴影、渐变等现代 UI 设计元素
6. **色彩协调**: 使用协调的配色方案（主色、辅助色、背景色）

### 重要规则
1. 每个组件必须有唯一的 id（使用有意义的名称，如 "navbar", "hero-section", "product-card-1"）
2. 使用 flex 布局实现页面结构，灵活运用 row 和 column
3. 颜色使用十六进制格式（如 #1890ff, #52c41a, #ff4d4f）
4. 尺寸使用数字（单位默认为 px）或百分比字符串
5. padding 和 margin 必须使用 [上, 右, 下, 左] 数组格式
6. 确保生成的 JSON 可以被直接解析
7. 不要包含任何注释

### 响应格式
请只返回 JSON 数据，不要包含任何解释文字、markdown 代码块标记或其他内容。`;

/**
 * 生成历史记录标题的系统 Prompt
 */
const TITLE_GENERATION_PROMPT = `请根据用户的输入生成一个简短的历史记录标题（不超过20个字符）。

规则：
1. 如果用户要求创建某个页面（如登录页、注册页），标题为"XX页面"
2. 如果用户要求修改样式，标题为"样式调整"
3. 如果用户要求添加组件，标题为"添加XX"
4. 其他情况提取关键词作为标题

请只返回标题文字，不要包含任何其他内容。`;

/**
 * 解析千问返回的内容，提取 JSON
 * @param {string} content - 千问返回的原始内容
 * @returns {Object|null} 解析后的 JSON 对象
 */
function parseDesignJson(content) {
  if (!content) return null;

  try {
    // 尝试直接解析
    return JSON.parse(content);
  } catch (e) {
    // 尝试提取 markdown 代码块中的 JSON
    const codeBlockMatch = content.match(/\`\`\`(?:json)?\s*([\s\S]*?)\`\`\`/);
    if (codeBlockMatch) {
      try {
        return JSON.parse(codeBlockMatch[1].trim());
      } catch (e2) {
        console.log('代码块解析失败，尝试其他方式');
      }
    }

    // 尝试提取花括号包裹的内容（贪婪匹配）
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e3) {
        console.log('花括号提取解析失败');
      }
    }

    // 尝试修复不完整的 JSON（如果内容被截断）
    // 查找最后一个完整的对象或数组
    const lastBrace = content.lastIndexOf('}');
    const lastBracket = content.lastIndexOf(']');
    const lastCompleteIndex = Math.max(lastBrace, lastBracket);

    if (lastCompleteIndex > 0) {
      const truncatedContent = content.substring(0, lastCompleteIndex + 1);
      try {
        const fixedJson = JSON.parse(truncatedContent);
        console.log('成功解析截断后的 JSON');
        return fixedJson;
      } catch (e4) {
        console.log('截断后解析仍然失败');
      }
    }

    console.error('无法解析返回内容为 JSON:', content.substring(0, 200));
    return null;
  }
}

/**
 * 尝试让 AI 修复 JSON（当解析失败时）
 * @param {string} originalContent - 原始返回内容
 * @returns {Promise<Object|null>}
 */
async function retryParseWithAI(originalContent) {
  try {
    console.log('尝试使用 AI 修复 JSON...');
    
    const response = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { 
          role: 'system', 
          content: '你是一个 JSON 解析助手。请从以下文本中提取并返回合法的 JSON 数据。只返回 JSON，不要包含任何其他内容。' 
        },
        { 
          role: 'user', 
          content: `请解析以下内容为 JSON：\n${originalContent.substring(0, 4000)}` 
        }
      ],
      temperature: 0.1,
      max_tokens: 8000
    });

    const fixedContent = response.choices[0]?.message?.content;
    if (fixedContent) {
      return parseDesignJson(fixedContent);
    }
    
    return null;
  } catch (error) {
    console.error('AI 修复 JSON 失败:', error);
    return null;
  }
}

/**
 * 验证 Design JSON 结构
 * @param {Object} designJson - 解析后的 Design JSON
 * @returns {boolean} 是否有效
 */
function validateDesignJson(designJson) {
  if (!designJson || typeof designJson !== 'object') {
    return false;
  }

  // 检查必需字段
  if (!designJson.version || !designJson.type) {
    return false;
  }

  if (!designJson.style || typeof designJson.style !== 'object') {
    return false;
  }

  if (!Array.isArray(designJson.children)) {
    return false;
  }

  return true;
}

/**
 * 修复 Design JSON 中的字段名（适配前端）
 * @param {Object} designJson - 原始 Design JSON
 * @returns {Object} 修复后的 Design JSON
 */
function fixDesignJsonFields(designJson) {
  if (!designJson) return designJson;

  let idCounter = 0;

  // 递归修复节点
  function fixNode(node) {
    if (!node || typeof node !== 'object') return node;

    // 确保节点有 id
    if (!node.id) {
      node.id = `node-${Date.now()}-${idCounter++}`;
    }

    // 确保节点有 name
    if (!node.name && node.type) {
      node.name = `${node.type}-${idCounter++}`;
    }

    // 将 content 字段转为 text（适配前端）
    if (node.content !== undefined && node.text === undefined) {
      node.text = node.content;
      delete node.content;
    }

    // 修复子节点
    if (node.children && Array.isArray(node.children)) {
      node.children = node.children.map(fixNode);
    }

    return node;
  }

  // 修复根节点
  if (!designJson.id) {
    designJson.id = 'root';
  }

  // 修复根节点的 children
  if (designJson.children && Array.isArray(designJson.children)) {
    designJson.children = designJson.children.map(fixNode);
  }

  return designJson;
}

/**
 * 构建发送给千问的完整消息列表
 * @param {string} userPrompt - 用户当前输入
 * @param {Array} history - 历史消息列表
 * @param {Object} currentDesignJson - 当前设计稿
 * @returns {Array} 完整的消息列表
 */
function buildMessages(userPrompt, history = [], currentDesignJson = null) {
  const messages = [
    { role: 'system', content: DESIGN_JSON_SYSTEM_PROMPT }
  ];

  // 添加历史消息
  if (history && history.length > 0) {
    for (const msg of history) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'assistant') {
        // 如果历史消息包含设计稿，简化内容
        let content = msg.content;
        if (msg.designJson) {
          content += '\n[包含设计稿数据]';
        }
        messages.push({ role: 'assistant', content: content });
      }
    }
  }

  // 构建当前用户提示
  let finalPrompt = userPrompt;
  
  // 如果有当前设计稿，将完整的 Design JSON 传递给 AI
  if (currentDesignJson) {
    const designJsonStr = JSON.stringify(currentDesignJson, null, 2);
    // 限制长度避免超出 token 限制
    const maxLength = 15000;
    const truncatedDesignJson = designJsonStr.length > maxLength 
      ? designJsonStr.substring(0, maxLength) + '\n... (设计稿数据已截断)'
      : designJsonStr;
    
    finalPrompt = `${userPrompt}

【重要】当前设计稿状态（请基于此进行修改）：
\`\`\`json
${truncatedDesignJson}
\`\`\`

请基于以上设计稿进行修改，保持整体结构，只调整用户要求的部分。返回完整的 Design JSON。`;
    
    console.log('传递 Design JSON 给 AI，长度:', designJsonStr.length);
  }

  messages.push({ role: 'user', content: finalPrompt });

  return messages;
}

/**
 * 生成 Design JSON
 * @param {string} prompt - 用户输入
 * @param {Array} history - 历史消息
 * @param {Object} currentDesignJson - 当前设计稿
 * @returns {Promise<{designJson: Object, replyText: string}>}
 */
async function generateDesignJson(prompt, history = [], currentDesignJson = null) {
  try {
    const messages = buildMessages(prompt, history, currentDesignJson);

    console.log('调用千问 API（文本生成），消息数:', messages.length);

    const response = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('千问 API 返回空内容');
    }

    console.log('千问返回内容长度:', content.length);

    // 解析 JSON
    let designJson = parseDesignJson(content);

    // 如果解析失败，尝试使用 AI 修复
    if (!designJson) {
      console.log('首次解析失败，尝试使用 AI 修复 JSON...');
      designJson = await retryParseWithAI(content);
    }

    // 如果仍然解析失败，抛出错误
    if (!designJson) {
      console.log('AI 修复 JSON 失败，返回内容预览:', content.substring(0, 500));
      throw new Error('无法解析 AI 返回的设计稿数据');
    }

    // 验证结构
    if (!validateDesignJson(designJson)) {
      console.warn('Design JSON 结构不完整，尝试修复...');
      // 尝试修复基本结构
      designJson = {
        version: '1.0',
        type: 'page',
        style: designJson.style || {
          width: '100%',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: [0, 0, 0, 0]
        },
        children: designJson.children || []
      };
    }

    // 修复字段名
    designJson = fixDesignJsonFields(designJson);

    // 生成回复文本
    const replyText = generateReplyText(prompt, designJson);

    return {
      designJson,
      replyText
    };

  } catch (error) {
    console.error('生成 Design JSON 失败:', error);
    throw error;
  }
}

/**
 * 基于图片生成 Design JSON（使用视觉模型）
 * @param {string} prompt - 用户输入
 * @param {Array} imageBase64Array - 图片 base64 数组
 * @param {Array} history - 历史消息
 * @param {Object} currentDesignJson - 当前设计稿
 * @returns {Promise<{designJson: Object, replyText: string}>}
 */
async function generateDesignJsonFromImages(prompt, imageBase64Array = [], history = [], currentDesignJson = null) {
  try {
    const messages = [
      { role: 'system', content: DESIGN_JSON_SYSTEM_PROMPT }
    ];

    // 添加历史消息
    if (history && history.length > 0) {
      for (const msg of history) {
        if (msg.role === 'user') {
          messages.push({ role: 'user', content: msg.content });
        } else if (msg.role === 'assistant') {
          let content = msg.content;
          if (msg.designJson) {
            content += '\n[包含设计稿数据]';
          }
          messages.push({ role: 'assistant', content: content });
        }
      }
    }

    // 构建用户消息内容，包含图片
    let userContent = prompt || '根据上传的图片生成对应的设计稿';
    
    // 如果有当前设计稿，添加到提示中
    if (currentDesignJson) {
      const designJsonStr = JSON.stringify(currentDesignJson, null, 2);
      const maxLength = 8000;
      const truncatedDesignJson = designJsonStr.length > maxLength 
        ? designJsonStr.substring(0, maxLength) + '\n... (设计稿数据已截断)'
        : designJsonStr;
      
      userContent += `\n\n【重要】当前设计稿状态（请基于图片和此设计稿进行修改）：\n\`\`\`json\n${truncatedDesignJson}\n\`\`\``;
    }

    // 构建多模态消息
    const userMessage = {
      role: 'user',
      content: []
    };

    // 添加文本部分
    userMessage.content.push({
      type: 'text',
      text: userContent
    });

    // 添加图片（限制最多 5 张，避免超出 token 限制）
    const maxImages = 5;
    const imagesToProcess = imageBase64Array.slice(0, maxImages);
    
    for (const base64 of imagesToProcess) {
      userMessage.content.push({
        type: 'image_url',
        image_url: {
          url: base64
        }
      });
    }

    messages.push(userMessage);

    console.log(`调用千问视觉模型 API，图片数: ${imagesToProcess.length}, 消息数: ${messages.length}`);

    const response = await openai.chat.completions.create({
      model: VISION_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('千问视觉模型 API 返回空内容');
    }

    console.log('视觉模型返回内容长度:', content.length);

    // 解析 JSON
    let designJson = parseDesignJson(content);

    // 如果解析失败，尝试使用 AI 修复
    if (!designJson) {
      console.log('首次解析失败，尝试使用 AI 修复 JSON...');
      designJson = await retryParseWithAI(content);
    }

    // 如果仍然解析失败，抛出错误
    if (!designJson) {
      console.log('AI 修复 JSON 失败，返回内容预览:', content.substring(0, 500));
      throw new Error('无法解析 AI 返回的设计稿数据');
    }

    // 验证结构
    if (!validateDesignJson(designJson)) {
      console.warn('Design JSON 结构不完整，尝试修复...');
      designJson = {
        version: '1.0',
        type: 'page',
        style: designJson.style || {
          width: '100%',
          height: '100vh',
          backgroundColor: '#f5f5f5',
          padding: [0, 0, 0, 0]
        },
        children: designJson.children || []
      };
    }

    // 修复字段名
    designJson = fixDesignJsonFields(designJson);

    // 生成回复文本
    const replyText = imagesToProcess.length > 1 
      ? `已根据 ${imagesToProcess.length} 张图片生成设计稿`
      : '已根据图片生成设计稿';

    return {
      designJson,
      replyText
    };

  } catch (error) {
    console.error('基于图片生成 Design JSON 失败:', error);
    throw error;
  }
}

/**
 * 生成历史记录标题
 * @param {string} prompt - 用户输入
 * @returns {Promise<string>}
 */
async function generateHistoryTitle(prompt) {
  try {
    const response = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: [
        { role: 'system', content: TITLE_GENERATION_PROMPT },
        { role: 'user', content: `用户输入：${prompt}\n请生成标题：` }
      ],
      temperature: 0.3,
      max_tokens: 50
    });

    const title = response.choices[0]?.message?.content?.trim();
    
    if (title) {
      // 清理标题（去除引号等）
      return title.replace(/["'""]/g, '').substring(0, 30);
    }

    return prompt.substring(0, 20) || '新对话';
  } catch (error) {
    console.error('生成标题失败:', error);
    return prompt.substring(0, 20) || '新对话';
  }
}

/**
 * 流式生成 Design JSON
 * @param {string} prompt - 用户输入
 * @param {Array} history - 历史消息
 * @param {Object} currentDesignJson - 当前设计稿
 * @param {Function} onChunk - 回调函数，接收每个数据块
 */
async function streamDesignJson(prompt, history = [], currentDesignJson = null, onChunk) {
  try {
    const messages = buildMessages(prompt, history, currentDesignJson);

    const stream = await openai.chat.completions.create({
      model: TEXT_MODEL,
      messages: messages,
      temperature: 0.7,
      max_tokens: 8000,
      stream: true
    });

    let fullContent = '';
    let isAnswering = false;

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      
      if (delta?.reasoning_content) {
        // 思考过程
        onChunk({
          type: 'reasoning',
          content: delta.reasoning_content
        });
      }
      
      if (delta?.content) {
        if (!isAnswering) {
          isAnswering = true;
          onChunk({ type: 'answer_start' });
        }
        fullContent += delta.content;
        onChunk({
          type: 'content',
          content: delta.content
        });
      }
    }

    // 解析最终的 Design JSON
    const designJson = parseDesignJson(fullContent);
    
    if (designJson && validateDesignJson(designJson)) {
      onChunk({
        type: 'design',
        designJson: fixDesignJsonFields(designJson)
      });
    }

    onChunk({ type: 'complete' });

  } catch (error) {
    console.error('流式生成失败:', error);
    onChunk({
      type: 'error',
      error: error.message
    });
  }
}

/**
 * 生成回复文本
 * @param {string} prompt - 用户输入
 * @param {Object} designJson - 生成的设计稿
 * @returns {string}
 */
function generateReplyText(prompt, designJson) {
  // 根据用户输入生成友好的回复
  const lowerPrompt = prompt.toLowerCase();
  
  if (lowerPrompt.includes('登录')) {
    return '已为您创建登录页面，包含用户名、密码输入框和登录按钮。您可以继续调整样式或添加其他元素。';
  }
  if (lowerPrompt.includes('注册')) {
    return '已为您创建注册页面，包含邮箱、用户名、密码等输入项。';
  }
  if (lowerPrompt.includes('首页') || lowerPrompt.includes('主页')) {
    return '已为您创建首页，包含导航栏和主视觉区域。';
  }
  if (lowerPrompt.includes('卡片') || lowerPrompt.includes('列表')) {
    return '已为您创建卡片列表页面，展示产品信息。';
  }
  if (lowerPrompt.includes('改') || lowerPrompt.includes('调整') || lowerPrompt.includes('修改')) {
    return '已按您的要求调整设计稿，请查看预览效果。';
  }
  if (lowerPrompt.includes('添加') || lowerPrompt.includes('增加')) {
    return '已为您添加新组件到设计稿中。';
  }
  
  return '已为您生成设计稿，可以在右侧预览和编辑。如需调整，请继续描述您的需求。';
}

module.exports = {
  generateDesignJson,
  generateDesignJsonFromImages,
  generateHistoryTitle,
  streamDesignJson,
  parseDesignJson,
  validateDesignJson,
  fixDesignJsonFields
};
