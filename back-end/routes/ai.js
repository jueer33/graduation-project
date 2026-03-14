const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const { generateDesignJson, generateHistoryTitle } = require('../utils/mockDesignGenerator');

const router = express.Router();

// 配置multer用于文件上传
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// 文本生成Design JSON
router.post('/text-to-design', auth, async (req, res) => {
  try {
    const { text, currentDesignJson } = req.body;

    if (!text) {
      return res.status(400).json({ message: '文本内容不能为空' });
    }

    // 模拟AI处理延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 使用伪数据生成器生成 Design JSON
    const designJson = generateDesignJson(text, currentDesignJson);

    // 生成历史记录标题
    const title = generateHistoryTitle(text, 'text-to-design');

    res.json({
      success: true,
      designJson,
      title
    });
  } catch (error) {
    res.status(500).json({ message: '生成失败', error: error.message });
  }
});

// 图片生成Design JSON（支持多张图片+文字）
router.post('/image-to-design', auth, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer 错误处理
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
          success: false,
          message: '文件太大，单张图片不能超过10MB' 
        });
      } else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ 
          success: false,
          message: '图片数量过多，最多只能上传5张图片' 
        });
      } else {
        return res.status(400).json({ 
          success: false,
          message: '文件上传错误: ' + err.message 
        });
      }
    } else if (err) {
      return res.status(500).json({ 
        success: false,
        message: '上传失败: ' + err.message 
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    // 支持多张图片或单张图片
    const images = req.files || [];
    
    if (images.length === 0 && !req.body.text) {
      return res.status(400).json({ message: '请上传图片文件或输入文字' });
    }

    const text = req.body.text || '';
    
    // 解析 currentDesignJson（如果是字符串）
    let currentDesignJson = null;
    if (req.body.currentDesignJson) {
      try {
        currentDesignJson = typeof req.body.currentDesignJson === 'string' 
          ? JSON.parse(req.body.currentDesignJson)
          : req.body.currentDesignJson;
      } catch (e) {
        console.warn('解析 currentDesignJson 失败:', e.message);
      }
    }
    
    // 记录接收到的图片信息（用于调试和伪实现）
    console.log(`接收到 ${images.length} 张图片:`);
    images.forEach((img, index) => {
      console.log(`  图片 ${index + 1}: ${img.originalname}, 大小: ${img.size} bytes`);
    });
    
    // 模拟AI处理延迟（多张图片处理时间稍长）
    const delay = images.length > 1 ? 2000 : 1500;
    await new Promise(resolve => setTimeout(resolve, delay));

    // 使用伪数据生成器生成 Design JSON
    // 如果有图片，可以根据图片数量调整生成逻辑
    const designJson = generateDesignJson(text, currentDesignJson);

    // 生成历史记录标题
    const title = generateHistoryTitle(text, 'image-to-design', images.length);

    res.json({
      success: true,
      designJson,
      title,
      imageCount: images.length
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
      const designJson = generateDesignJson('继续生成');
      res.write(`data: ${JSON.stringify({ type: 'complete', designJson })}\n\n`);
    }

    res.end();
  } catch (error) {
    res.status(500).json({ message: '处理失败', error: error.message });
  }
});

module.exports = router;
