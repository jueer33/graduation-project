const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 生成伪Design JSON示例数据
function generateMockDesignJson() {
  return {
    type: 'design-json',
    version: '1.0',
    root: {
      id: 'root',
      type: 'container',
      layout: 'column',
      style: {
        padding: '20px',
        backgroundColor: '#ffffff',
        gap: '16px'
      },
      children: [
        {
          id: 'header',
          type: 'container',
          layout: 'row',
          style: {
            padding: '16px',
            backgroundColor: '#8b5cf6',
            borderRadius: '8px',
            justifyContent: 'center',
            alignItems: 'center'
          },
          children: [
            {
              id: 'title',
              type: 'text',
              content: '欢迎使用AI代码生成系统',
              style: {
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#ffffff'
              }
            }
          ]
        },
        {
          id: 'content',
          type: 'container',
          layout: 'column',
          style: {
            padding: '20px',
            backgroundColor: '#f7f7f8',
            borderRadius: '8px',
            gap: '12px'
          },
          children: [
            {
              id: 'subtitle',
              type: 'text',
              content: '这是一个示例页面',
              style: {
                fontSize: '18px',
                color: '#353740',
                marginBottom: '12px'
              }
            },
            {
              id: 'description',
              type: 'text',
              content: 'Design JSON 是系统的唯一真实数据源，所有设计预览和代码生成都基于它。',
              style: {
                fontSize: '14px',
                color: '#6e6e80',
                lineHeight: '1.6'
              }
            }
          ]
        }
      ]
    }
  };
}

// 文本生成Design JSON
router.post('/text-to-design', auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: '文本内容不能为空' });
    }

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 返回伪数据
    const designJson = generateMockDesignJson();
    
    // 根据用户输入简单调整内容
    if (text.includes('按钮') || text.includes('button')) {
      designJson.root.children.push({
        id: 'button-container',
        type: 'container',
        layout: 'row',
        style: {
          justifyContent: 'center',
          gap: '12px',
          marginTop: '16px'
        },
        children: [
          {
            id: 'button1',
            type: 'button',
            content: '主要按钮',
            style: {
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }
          }
        ]
      });
    }

    res.json({
      success: true,
      designJson
    });
  } catch (error) {
    res.status(500).json({ message: '生成失败', error: error.message });
  }
});

// 图片生成Design JSON（支持图片+文字）
router.post('/image-to-design', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file && !req.body.text) {
      return res.status(400).json({ message: '请上传图片文件或输入文字' });
    }

    const text = req.body.text || '';
    
    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 返回伪数据
    const designJson = generateMockDesignJson();
    
    // 如果有文本，可以根据文本调整设计
    if (text.includes('按钮') || text.includes('button')) {
      designJson.root.children.push({
        id: 'button-container',
        type: 'container',
        layout: 'row',
        style: {
          justifyContent: 'center',
          gap: '12px',
          marginTop: '16px'
        },
        children: [
          {
            id: 'button1',
            type: 'button',
            content: '主要按钮',
            style: {
              padding: '12px 24px',
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }
          }
        ]
      });
    }

    res.json({
      success: true,
      designJson
    });
  } catch (error) {
    res.status(500).json({ message: '解析失败', error: error.message });
  }
});

// Design JSON生成前端代码
router.post('/design-to-code', auth, async (req, res) => {
  try {
    const { designJson, framework } = req.body;

    if (!designJson) {
      return res.status(400).json({ message: 'Design JSON不能为空' });
    }

    if (!framework || !['react', 'vue', 'html'].includes(framework)) {
      return res.status(400).json({ message: '请选择正确的框架类型' });
    }

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 生成伪代码数据
    let generatedCode = {};

    if (framework === 'react') {
      generatedCode = {
        type: 'react',
        files: [
          {
            path: 'App.jsx',
            content: `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>欢迎使用AI代码生成系统</h1>
      </header>
      <main className="content">
        <h2>这是一个示例页面</h2>
        <p>Design JSON 是系统的唯一真实数据源，所有设计预览和代码生成都基于它。</p>
      </main>
    </div>
  );
}

export default App;`
          },
          {
            path: 'App.css',
            content: `.app {
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;
}

.header {
  padding: 16px;
  background-color: #8b5cf6;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 16px;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.content {
  padding: 20px;
  background-color: #f7f7f8;
  border-radius: 8px;
}

.content h2 {
  font-size: 18px;
  color: #353740;
  margin-bottom: 12px;
}

.content p {
  font-size: 14px;
  color: #6e6e80;
  line-height: 1.6;
}`
          }
        ]
      };
    } else if (framework === 'vue') {
      generatedCode = {
        type: 'vue',
        files: [
          {
            path: 'App.vue',
            content: `<template>
  <div class="app">
    <header class="header">
      <h1>欢迎使用AI代码生成系统</h1>
    </header>
    <main class="content">
      <h2>这是一个示例页面</h2>
      <p>Design JSON 是系统的唯一真实数据源，所有设计预览和代码生成都基于它。</p>
    </main>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  padding: 20px;
  background-color: #ffffff;
  min-height: 100vh;
}

.header {
  padding: 16px;
  background-color: #8b5cf6;
  border-radius: 8px;
  text-align: center;
  margin-bottom: 16px;
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: #ffffff;
  margin: 0;
}

.content {
  padding: 20px;
  background-color: #f7f7f8;
  border-radius: 8px;
}

.content h2 {
  font-size: 18px;
  color: #353740;
  margin-bottom: 12px;
}

.content p {
  font-size: 14px;
  color: #6e6e80;
  line-height: 1.6;
}
</style>`
          }
        ]
      };
    } else if (framework === 'html') {
      generatedCode = {
        type: 'html',
        files: [
          {
            path: 'index.html',
            content: `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI代码生成系统</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      background-color: #ffffff;
      color: #353740;
    }

    .app {
      padding: 20px;
      min-height: 100vh;
    }

    .header {
      padding: 16px;
      background-color: #8b5cf6;
      border-radius: 8px;
      text-align: center;
      margin-bottom: 16px;
    }

    .header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
      margin: 0;
    }

    .content {
      padding: 20px;
      background-color: #f7f7f8;
      border-radius: 8px;
    }

    .content h2 {
      font-size: 18px;
      color: #353740;
      margin-bottom: 12px;
    }

    .content p {
      font-size: 14px;
      color: #6e6e80;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="header">
      <h1>欢迎使用AI代码生成系统</h1>
    </header>
    <main class="content">
      <h2>这是一个示例页面</h2>
      <p>Design JSON 是系统的唯一真实数据源，所有设计预览和代码生成都基于它。</p>
    </main>
  </div>
</body>
</html>`
          }
        ]
      };
    }

    res.json({
      success: true,
      code: generatedCode
    });
  } catch (error) {
    res.status(500).json({ message: '生成失败', error: error.message });
  }
});

// 流式对话接口（用于支持流式返回）
router.post('/chat', auth, async (req, res) => {
  try {
    const { messages, moduleType, framework } = req.body;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // 模拟流式返回
    const chunks = [
      '正在',
      '处理',
      '您的',
      '请求',
      '...',
      '\n\n',
      '生成',
      '完成'
    ];

    for (let i = 0; i < chunks.length; i++) {
      res.write(`data: ${JSON.stringify({ chunk: chunks[i] })}\n\n`);
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    // 如果最后需要返回完整数据
    if (moduleType === 'text-to-design' || moduleType === 'image-to-design') {
      const designJson = generateMockDesignJson();
      res.write(`data: ${JSON.stringify({ type: 'complete', designJson })}\n\n`);
    }

    res.end();
  } catch (error) {
    res.status(500).json({ message: '处理失败', error: error.message });
  }
});

module.exports = router;

