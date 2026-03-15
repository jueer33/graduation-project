/**
 * 对话上下文管理器
 * 用于管理用户与大模型的对话历史
 * 
 * 使用内存 Map 存储对话上下文
 * Key: userId_sessionId
 * Value: 消息数组
 */

// 存储对话历史的 Map
const conversations = new Map();

// 会话过期时间（24小时）
const SESSION_EXPIRE_TIME = 24 * 60 * 60 * 1000;

// 清理过期会话的定时器
setInterval(() => {
  const now = Date.now();
  let cleanedCount = 0;
  
  for (const [key, session] of conversations.entries()) {
    if (now - session.lastAccessTime > SESSION_EXPIRE_TIME) {
      conversations.delete(key);
      cleanedCount++;
    }
  }
  
  if (cleanedCount > 0) {
    console.log(`清理了 ${cleanedCount} 个过期会话`);
  }
}, 60 * 60 * 1000); // 每小时清理一次

/**
 * 生成会话存储键
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {string}
 */
function getSessionKey(userId, sessionId) {
  return `${userId}_${sessionId}`;
}

/**
 * 创建新会话
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {Object} 会话对象
 */
function createSession(userId, sessionId) {
  const key = getSessionKey(userId, sessionId);
  const session = {
    userId,
    sessionId,
    messages: [],
    createdAt: Date.now(),
    lastAccessTime: Date.now()
  };
  conversations.set(key, session);
  console.log(`创建新会话: ${key}`);
  return session;
}

/**
 * 获取会话
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {Object|null} 会话对象
 */
function getSession(userId, sessionId) {
  const key = getSessionKey(userId, sessionId);
  const session = conversations.get(key);
  
  if (session) {
    // 更新最后访问时间
    session.lastAccessTime = Date.now();
  }
  
  return session || null;
}

/**
 * 获取或创建会话
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {Object} 会话对象
 */
function getOrCreateSession(userId, sessionId) {
  let session = getSession(userId, sessionId);
  if (!session) {
    session = createSession(userId, sessionId);
  }
  return session;
}

/**
 * 获取对话历史
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @returns {Array} 消息数组
 */
function getHistory(userId, sessionId) {
  const session = getSession(userId, sessionId);
  return session ? session.messages : [];
}

/**
 * 添加用户消息
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {string} content - 消息内容
 */
function addUserMessage(userId, sessionId, content) {
  const session = getOrCreateSession(userId, sessionId);
  session.messages.push({
    role: 'user',
    content,
    timestamp: Date.now()
  });
}

/**
 * 添加助手消息
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {string} content - 消息内容
 * @param {Object} designJson - 设计稿数据（可选）
 */
function addAssistantMessage(userId, sessionId, content, designJson = null) {
  const session = getOrCreateSession(userId, sessionId);
  const message = {
    role: 'assistant',
    content,
    timestamp: Date.now()
  };
  
  if (designJson) {
    message.designJson = designJson;
  }
  
  session.messages.push(message);
}

/**
 * 添加消息（通用方法）
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {Object} message - 消息对象
 */
function addMessage(userId, sessionId, message) {
  const session = getOrCreateSession(userId, sessionId);
  session.messages.push({
    ...message,
    timestamp: Date.now()
  });
}

/**
 * 清空对话历史
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 */
function clearHistory(userId, sessionId) {
  const key = getSessionKey(userId, sessionId);
  const session = conversations.get(key);
  
  if (session) {
    session.messages = [];
    session.lastAccessTime = Date.now();
  }
}

/**
 * 删除会话
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 */
function deleteSession(userId, sessionId) {
  const key = getSessionKey(userId, sessionId);
  conversations.delete(key);
  console.log(`删除会话: ${key}`);
}

/**
 * 获取所有会话（用于调试）
 * @returns {Array}
 */
function getAllSessions() {
  const result = [];
  for (const [key, session] of conversations.entries()) {
    result.push({
      key,
      messageCount: session.messages.length,
      createdAt: session.createdAt,
      lastAccessTime: session.lastAccessTime
    });
  }
  return result;
}

/**
 * 生成新的会话ID
 * @returns {string}
 */
function generateSessionId() {
  return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * 从历史记录恢复会话
 * @param {string} userId - 用户ID
 * @param {string} sessionId - 会话ID
 * @param {Array} conversations - 历史对话数组
 * @returns {Object} 会话对象
 */
function restoreSession(userId, sessionId, conversations) {
  const key = getSessionKey(userId, sessionId);
  
  // 如果会话已存在，先删除
  if (conversations.has(key)) {
    conversations.delete(key);
  }
  
  // 创建新会话并恢复历史
  const session = {
    userId,
    sessionId,
    messages: conversations.map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.content || '',
      designJson: msg.designJson || null,
      timestamp: msg.timestamp || Date.now()
    })),
    createdAt: Date.now(),
    lastAccessTime: Date.now()
  };
  
  conversations.set(key, session);
  console.log(`恢复会话: ${key}, 消息数: ${session.messages.length}`);
  
  return session;
}

module.exports = {
  createSession,
  getSession,
  getOrCreateSession,
  getHistory,
  addUserMessage,
  addAssistantMessage,
  addMessage,
  clearHistory,
  deleteSession,
  getAllSessions,
  generateSessionId,
  restoreSession
};
