const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { generateDesignJson, generateDesignJsonFromImages, generateHistoryTitle, streamDesignJson, generateCodeFromDesign, generateCodeFromText, generateCodeFromImages } = require('../services/qwenService');
const conversationManager = require('../utils/conversationManager');

const router = express.Router();

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads/images');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置multer用于文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // maximum 5 files
  }
});

// 文本生成Design JSON
router.post('/text-to-design', auth, async (req, res) => {
  try {
    const { text, sessionId, currentDesignJson } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: '文本内容不能为空' });
    }

    // 生成或获取会话ID
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = conversationManager.generateSessionId();
      console.log('生成新会话ID:', activeSessionId);
    }

    // 获取对话历史
    const history = conversationManager.getHistory(userId, activeSessionId);
    console.log(`用户 ${userId} 会话 ${activeSessionId} 历史消息数:`, history.length);
    
    // 记录是否包含当前设计稿
    if (currentDesignJson) {
      const childrenCount = currentDesignJson.children ? currentDesignJson.children.length : 0;
      console.log(`接收到当前设计稿，包含 ${childrenCount} 个子组件`);
    } else {
      console.log('未接收到当前设计稿，将生成新设计稿');
    }

    // 添加用户消息到历史
    conversationManager.addUserMessage(userId, activeSessionId, text);

    // 调用千问 API 生成 Design JSON
    console.log('开始调用千问 API 生成设计稿...');
    const startTime = Date.now();
    
    const result = await generateDesignJson(text, history, currentDesignJson);
    
    const duration = Date.now() - startTime;
    console.log(`千问 API 调用完成，耗时: ${duration}ms`);

    // 添加助手消息到历史
    conversationManager.addAssistantMessage(
      userId, 
      activeSessionId, 
      result.replyText, 
      result.designJson
    );

    // 生成历史记录标题
    const title = await generateHistoryTitle(text);

    res.json({
      success: true,
      designJson: result.designJson,
      replyText: result.replyText,
      sessionId: activeSessionId,
      title
    });

  } catch (error) {
    console.error('文本生成设计稿失败:', error);
    res.status(500).json({ 
      success: false,
      message: '生成失败', 
      error: error.message 
    });
  }
});

// 图片生成Design JSON（支持多张图片+文字）
router.post('/image-to-design', auth, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
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
    const images = req.files || [];
    const { text, sessionId, currentDesignJson, imageBase64 } = req.body;
    const userId = req.user.id;
    
    if (images.length === 0 && !text) {
      return res.status(400).json({ message: '请上传图片文件或输入文字' });
    }

    // 生成或获取会话ID
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = conversationManager.generateSessionId();
    }

    // 处理图片路径，生成相对路径
    const imagePaths = images.map(file => {
      // 生成相对路径（相对于uploads目录）
      const relativePath = `/uploads/images/${file.filename}`;
      return relativePath;
    });

    // 解析base64图片数据
    let imageBase64Array = [];
    try {
      if (imageBase64) {
        imageBase64Array = JSON.parse(imageBase64);
      }
    } catch (error) {
      console.error('解析base64图片数据失败:', error);
    }

    // 获取对话历史
    const history = conversationManager.getHistory(userId, activeSessionId);

    // 解析 currentDesignJson
    let parsedCurrentDesignJson = null;
    try {
      if (currentDesignJson) {
        parsedCurrentDesignJson = typeof currentDesignJson === 'string' 
          ? JSON.parse(currentDesignJson) 
          : currentDesignJson;
      }
    } catch (error) {
      console.error('解析 currentDesignJson 失败:', error);
    }

    console.log(`接收到 ${images.length} 张图片，调用千问视觉模型 API...`);
    console.log('图片 base64 数量:', imageBase64Array.length);

    // 调用千问视觉模型 API 生成 Design JSON
    const result = await generateDesignJsonFromImages(
      text || '根据上传的图片生成对应的设计稿',
      imageBase64Array,
      history,
      parsedCurrentDesignJson
    );

    // 添加用户消息到历史（简短描述）
    const userMessage = images.length > 0 
      ? `上传了 ${images.length} 张图片${text ? ': ' + text : ''}`
      : text;
    conversationManager.addUserMessage(userId, activeSessionId, userMessage);

    // 添加助手消息到历史
    conversationManager.addAssistantMessage(
      userId, 
      activeSessionId, 
      result.replyText, 
      result.designJson
    );

    // 生成历史记录标题
    const title = await generateHistoryTitle(text || '图片设计');

    res.json({
      success: true,
      designJson: result.designJson,
      replyText: result.replyText,
      sessionId: activeSessionId,
      title,
      imageCount: images.length,
      imagePaths: imagePaths // 返回图片相对路径
    });

  } catch (error) {
    console.error('图片生成设计稿失败:', error);
    res.status(500).json({ 
      success: false,
      message: '解析失败', 
      error: error.message 
    });
  }
});

// Design JSON生成前端代码
router.post('/design-to-code', auth, async (req, res) => {
  try {
    const { designJson } = req.body;
    const framework = 'react';

    if (!designJson) {
      return res.status(400).json({ message: 'Design JSON不能为空' });
    }

    console.log('开始调用千问 API 生成代码...');
    const startTime = Date.now();
    
    const result = await generateCodeFromDesign(designJson, framework);
    
    const duration = Date.now() - startTime;
    console.log(`代码生成 API 调用完成，耗时: ${duration}ms`);

    res.json({
      success: true,
      code: result.code,
      replyText: result.replyText
    });

  } catch (error) {
    console.error('设计稿生成代码失败:', error);
    res.status(500).json({ 
      success: false,
      message: '代码生成失败', 
      error: error.message 
    });
  }
});

// 文本生成前端代码
router.post('/text-to-code', auth, async (req, res) => {
  try {
    const { text } = req.body;
    const framework = 'react';

    if (!text) {
      return res.status(400).json({ message: '文本内容不能为空' });
    }

    console.log('开始调用千问 API（文本→代码）...');
    const startTime = Date.now();
    
    const result = await generateCodeFromText(text, framework);
    
    const duration = Date.now() - startTime;
    console.log(`代码生成 API 调用完成，耗时: ${duration}ms`);

    res.json({
      success: true,
      code: result.code,
      replyText: result.replyText
    });

  } catch (error) {
    console.error('文本生成代码失败:', error);
    res.status(500).json({ 
      success: false,
      message: '代码生成失败', 
      error: error.message 
    });
  }
});

// 图片生成前端代码（支持多张图片+文字）
router.post('/image-to-code', auth, (req, res, next) => {
  upload.array('images', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
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
    const images = req.files || [];
    const { text, imageBase64 } = req.body;
    const framework = 'react';
    
    if (images.length === 0 && !text) {
      return res.status(400).json({ message: '请上传图片文件或输入文字' });
    }

    // 解析base64图片数据
    let imageBase64Array = [];
    try {
      if (imageBase64) {
        imageBase64Array = JSON.parse(imageBase64);
      }
    } catch (error) {
      console.error('解析base64图片数据失败:', error);
    }

    console.log(`接收到 ${images.length} 张图片，调用千问视觉模型 API（图片→代码）...`);
    console.log('图片 base64 数量:', imageBase64Array.length);

    const startTime = Date.now();
    
    const result = await generateCodeFromImages(
      text || '根据图片生成对应页面代码',
      imageBase64Array,
      framework
    );
    
    const duration = Date.now() - startTime;
    console.log(`代码生成 API 调用完成，耗时: ${duration}ms`);

    res.json({
      success: true,
      code: result.code,
      replyText: result.replyText,
      imageCount: images.length
    });

  } catch (error) {
    console.error('图片生成代码失败:', error);
    res.status(500).json({ 
      success: false,
      message: '代码生成失败', 
      error: error.message 
    });
  }
});

// 流式对话接口（用于支持流式返回）
router.post('/chat', auth, async (req, res) => {
  try {
    const { text, sessionId, currentDesignJson } = req.body;
    const userId = req.user.id;

    if (!text) {
      return res.status(400).json({ message: '消息内容不能为空' });
    }

    // 生成或获取会话ID
    let activeSessionId = sessionId;
    if (!activeSessionId) {
      activeSessionId = conversationManager.generateSessionId();
    }

    // 获取对话历史
    const history = conversationManager.getHistory(userId, activeSessionId);

    // 添加用户消息到历史
    conversationManager.addUserMessage(userId, activeSessionId, text);

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    let finalDesignJson = null;
    let finalReplyText = '';

    // 调用流式生成
    await streamDesignJson(text, history, currentDesignJson, (chunk) => {
      if (chunk.type === 'content') {
        finalReplyText += chunk.content;
      } else if (chunk.type === 'design') {
        finalDesignJson = chunk.designJson;
      }
      
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
    });

    // 添加助手消息到历史
    if (finalDesignJson) {
      conversationManager.addAssistantMessage(
        userId, 
        activeSessionId, 
        finalReplyText || '已为您生成设计稿', 
        finalDesignJson
      );
    }

    // 发送完成事件，包含 sessionId
    res.write(`data: ${JSON.stringify({ 
      type: 'complete', 
      sessionId: activeSessionId 
    })}\n\n`);

    res.end();

  } catch (error) {
    console.error('流式对话失败:', error);
    res.write(`data: ${JSON.stringify({ 
      type: 'error', 
      error: error.message 
    })}\n\n`);
    res.end();
  }
});

// 获取会话历史
router.get('/conversation/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    const history = conversationManager.getHistory(userId, sessionId);

    res.json({
      success: true,
      sessionId,
      history
    });

  } catch (error) {
    console.error('获取会话历史失败:', error);
    res.status(500).json({ 
      success: false,
      message: '获取失败', 
      error: error.message 
    });
  }
});

// 清除会话历史
router.delete('/conversation/:sessionId', auth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    conversationManager.clearHistory(userId, sessionId);

    res.json({
      success: true,
      message: '会话历史已清除'
    });

  } catch (error) {
    console.error('清除会话历史失败:', error);
    res.status(500).json({ 
      success: false,
      message: '清除失败', 
      error: error.message 
    });
  }
});

module.exports = router;
