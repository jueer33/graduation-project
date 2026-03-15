import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

const AppContext = createContext();

export const useAppStore = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppStore must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // 当前功能模块: 'text-to-design' | 'image-to-design' | 'design-to-code' | 'history'
  const [currentModule, setCurrentModule] = useState('text-to-design');

  // 当前编辑的历史记录ID
  const [currentHistoryId, setCurrentHistoryId] = useState(null);

  // 当前会话ID（用于对话上下文管理）
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // AI 生成 loading 状态
  const [isGenerating, setIsGenerating] = useState(false);

  // 用户信息
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);

  // 侧边栏折叠状态
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // 主题
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  // 历史记录 - 按模块存储
  const [histories, setHistories] = useState({
    'text-to-design': [],
    'image-to-design': [],
    'design-to-code': []
  });

  // 会话状态 - 按会话ID存储
  const [sessions, setSessions] = useState({});

  // 获取当前会话的状态
  const currentSession = useMemo(() => {
    if (!currentSessionId) return {
      designJson: null,
      code: null,
      previewState: 'design',
      isModified: false,
      conversations: []
    };
    return sessions[currentSessionId] || {
      designJson: null,
      code: null,
      previewState: 'design',
      isModified: false,
      conversations: []
    };
  }, [currentSessionId, sessions]);

  // 获取当前会话的设计稿
  const currentDesignJson = useMemo(() => currentSession.designJson, [currentSession]);

  // 获取当前会话的代码
  const currentCode = useMemo(() => currentSession.code, [currentSession]);

  // 获取当前会话的预览状态
  const previewState = useMemo(() => currentSession.previewState, [currentSession]);

  // 获取当前会话的修改状态
  const isDesignModified = useMemo(() => currentSession.isModified, [currentSession]);

  // 获取当前会话的对话
  const getCurrentConversations = useCallback(() => {
    if (!currentSessionId) return [];
    const session = sessions[currentSessionId];
    return session ? session.conversations : [];
  }, [currentSessionId, sessions]);

  // 初始化主题
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // 切换主题
  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, [theme]);

  // 更新会话状态
  const updateSession = useCallback((sessionId, updates) => {
    console.log('store: updating session:', sessionId, 'updates:', updates);
    setSessions(prev => {
      const updatedSessions = {
        ...prev,
        [sessionId]: {
          ...(prev[sessionId] || {
            designJson: null,
            code: null,
            previewState: 'design',
            isModified: false,
            conversations: []
          }),
          ...updates
        }
      };
      console.log('store: updated sessions:', updatedSessions);
      return updatedSessions;
    });
  }, []);

  // 设置Design JSON（标记为已修改）
  const setCurrentDesignJson = useCallback((designJson) => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        designJson,
        isModified: true
      });
    }
  }, [currentSessionId, updateSession]);

  // 重置修改状态（保存后调用）
  const resetDesignModified = useCallback(() => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        isModified: false
      });
    }
  }, [currentSessionId, updateSession]);

  // 生成新的会话ID
  const generateNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setCurrentHistoryId(null);
    // 初始化新会话状态
    updateSession(newSessionId, {
      designJson: null,
      code: null,
      previewState: 'design',
      isModified: false,
      conversations: []
    });
    return newSessionId;
  }, [updateSession]);

  // 设置用户
  const loginUser = useCallback((userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  }, []);

  // 登出
  const logoutUser = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  // 添加对话
  const addConversation = useCallback((message, moduleType) => {
    // 如果没有会话ID，自动生成一个
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = generateNewSession();
    }
    
    const session = sessions[sessionId] || {
      designJson: null,
      code: null,
      previewState: 'design',
      isModified: false,
      conversations: []
    };
    updateSession(sessionId, {
      conversations: [...session.conversations, message]
    });
  }, [currentSessionId, sessions, updateSession, generateNewSession]);

  // 清空对话
  const clearConversations = useCallback((moduleType) => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        conversations: []
      });
    }
  }, [currentSessionId, updateSession]);

  // 设置对话（用于恢复历史记录）
  const setConversationsForModule = useCallback((newConversations, moduleType) => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        conversations: newConversations
      });
    }
  }, [currentSessionId, updateSession]);

  // 更新特定消息中的 designJson（用于保存编辑后的设计稿）
  const updateMessageDesignJson = useCallback((messageId, newDesignJson, moduleType) => {
    if (currentSessionId) {
      const session = sessions[currentSessionId] || {
        designJson: null,
        code: null,
        previewState: 'design',
        isModified: false,
        conversations: []
      };
      const updatedConversations = session.conversations.map(msg =>
        msg.id === messageId && msg.type === 'design'
          ? { ...msg, designJson: newDesignJson }
          : msg
      );
      updateSession(currentSessionId, {
        conversations: updatedConversations,
        isModified: true
      });
    }
  }, [currentSessionId, sessions, updateSession]);

  // 获取当前模块的历史记录
  const getCurrentHistories = useCallback(() => {
    return histories[currentModule] || [];
  }, [histories, currentModule]);

  // 添加历史记录（前端状态）
  const addHistory = useCallback((history, moduleType) => {
    setHistories(prev => {
      const module = moduleType || currentModule;
      const existing = prev[module] || [];
      // 检查是否已存在（通过ID）
      if (history._id && existing.some(h => h._id === history._id)) {
        // 如果已存在，更新它
        return {
          ...prev,
          [module]: existing.map(h => h._id === history._id ? history : h)
        };
      }
      // 如果不存在，添加到开头
      return {
        ...prev,
        [module]: [history, ...existing].slice(0, 10) // 只保留最近10条
      };
    });
  }, [currentModule]);

  // 删除历史记录（前端状态）
  const removeHistory = useCallback((historyId, moduleType) => {
    setHistories(prev => {
      const module = moduleType || currentModule;
      return {
        ...prev,
        [module]: (prev[module] || []).filter(h => h._id !== historyId)
      };
    });
  }, [currentModule]);

  // 设置历史记录列表（用于从后端加载）
  const setHistoriesForModule = useCallback((newHistories, moduleType) => {
    setHistories(prev => {
      const module = moduleType || currentModule;
      return {
        ...prev,
        [module]: newHistories
      };
    });
  }, [currentModule]);

  // 开始新对话
  const startNewConversation = useCallback((moduleType) => {
    // 生成新会话ID
    const newSessionId = generateNewSession();
    return newSessionId;
  }, [generateNewSession]);

  // 恢复历史记录到当前会话
  const restoreHistory = useCallback((history, moduleType) => {
    console.log('store: restoring history:', history._id);
    console.log('store: history designJson:', history.designJson);
    
    // 设置历史记录ID
    setCurrentHistoryId(history._id);

    // 设置会话ID（从历史记录中恢复或使用历史记录ID作为会话ID）
    const sessionId = history.sessionId || `session-${history._id}`;
    setCurrentSessionId(sessionId);

    // 恢复会话状态
    updateSession(sessionId, {
      designJson: history.designJson || null,
      code: history.generatedCode || null,
      previewState: history.designJson ? 'design' : (history.generatedCode ? 'code' : 'hidden'),
      isModified: false,
      conversations: history.conversations || []
    });

    console.log('store: sessionId set to:', sessionId);
    return sessionId;
  }, [updateSession]);

  // 设置预览状态
  const setPreviewState = useCallback((state) => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        previewState: state
      });
    }
  }, [currentSessionId, updateSession]);

  // 设置当前代码
  const setCurrentCode = useCallback((code) => {
    if (currentSessionId) {
      updateSession(currentSessionId, {
        code,
        isModified: true
      });
    }
  }, [currentSessionId, updateSession]);

  const value = {
    // 状态
    currentModule,
    currentDesignJson,
    previewState,
    currentCode,
    histories,
    user,
    token,
    sidebarCollapsed,
    theme,
    currentHistoryId,
    currentSessionId,
    isGenerating,
    isDesignModified,
    currentSession,
    sessions,

    // 方法
    setCurrentModule,
    setCurrentDesignJson,
    setPreviewState,
    setCurrentCode,
    addConversation,
    clearConversations,
    getCurrentConversations,
    setConversationsForModule,
    updateMessageDesignJson,
    getCurrentHistories,
    addHistory,
    removeHistory,
    setHistoriesForModule,
    loginUser,
    logoutUser,
    setSidebarCollapsed,
    toggleTheme,
    setCurrentHistoryId,
    setCurrentSessionId,
    generateNewSession,
    startNewConversation,
    restoreHistory,
    resetDesignModified,
    setIsGenerating,
    updateSession
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
