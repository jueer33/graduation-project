const express = require('express');
const History = require('../models/History');
const auth = require('../middleware/auth');

const router = express.Router();

// 获取历史记录列表
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const histories = await History.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select('-generatedCode'); // 不返回generatedCode，但返回designJson用于匹配

    const total = await History.countDocuments({ userId: req.user._id });

    res.json({
      success: true,
      data: histories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: '获取历史记录失败', error: error.message });
  }
});

// 获取单条历史记录详情
router.get('/:id', auth, async (req, res) => {
  try {
    const history = await History.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ message: '获取历史记录失败', error: error.message });
  }
});

// 创建历史记录
router.post('/', auth, async (req, res) => {
  try {
    const { moduleType, userInput, designJson, generatedCode, framework, conversations } = req.body;

    if (!moduleType) {
      return res.status(400).json({ message: '功能模块类型不能为空' });
    }

    const history = new History({
      userId: req.user._id,
      moduleType,
      userInput: userInput || '',
      designJson: designJson || null,
      generatedCode: generatedCode || null,
      framework: framework || null,
      conversations: conversations || []
    });

    await history.save();

    res.status(201).json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ message: '创建历史记录失败', error: error.message });
  }
});

// 更新历史记录
router.put('/:id', auth, async (req, res) => {
  try {
    const { designJson, generatedCode, userInput, conversations } = req.body;

    const history = await History.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }

    if (designJson !== undefined) history.designJson = designJson;
    if (generatedCode !== undefined) history.generatedCode = generatedCode;
    if (userInput !== undefined) history.userInput = userInput;
    if (conversations !== undefined) history.conversations = conversations;
    history.updatedAt = new Date();

    await history.save();

    res.json({
      success: true,
      data: history
    });
  } catch (error) {
    res.status(500).json({ message: '更新历史记录失败', error: error.message });
  }
});

// 删除历史记录
router.delete('/:id', auth, async (req, res) => {
  try {
    const history = await History.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!history) {
      return res.status(404).json({ message: '历史记录不存在' });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    res.status(500).json({ message: '删除历史记录失败', error: error.message });
  }
});

module.exports = router;

