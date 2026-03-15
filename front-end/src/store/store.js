import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

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

  // 当前 Design JSON（用于预览区显示）
  const [currentDesignJson, setCurrentDesignJsonState] = useState(null);

  // 当前编辑的历史记录ID
  const [currentHistoryId, setCurrentHistoryId] = useState(null);

  // 当前会话ID（用于对话上下文管理）
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // 设计稿是否被修改过（用于判断是否需要保存）
  const [isDesignModified, setIsDesignModified] = useState(false);

  // AI 生成 loading 状态
  const [isGenerating, setIsGenerating] = useState(false);

  // 当前预览状态: 'design' | 'code' | 'hidden'
  const [previewState, setPreviewState] = useState('design');

  // 当前生成的代码
  const [currentCode, setCurrentCode] = useState(null);

  // 对话上下文 - 按模块存储
  const [conversations, setConversations] = useState({
    'text-to-design': [],
    'image-to-design': [],
    'design-to-code': []
  });

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

  // 设置Design JSON（标记为已修改）
  const setCurrentDesignJson = useCallback((designJson) => {
    setCurrentDesignJsonState(designJson);
    if (designJson) {
      setIsDesignModified(true);
    }
  }, []);

  // 重置修改状态（保存后调用）
  const resetDesignModified = useCallback(() => {
    setIsDesignModified(false);
  }, []);

  // 生成新的会话ID
  const generateNewSession = useCallback(() => {
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setCurrentSessionId(newSessionId);
    setCurrentHistoryId(null);
    setCurrentDesignJsonState(null);
    return newSessionId;
  }, []);

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
    setConversations(prev => {
      const module = moduleType || currentModule;
      return {
        ...prev,
        [module]: [...(prev[module] || []), message]
      };
    });
  }, [currentModule]);

  // 清空对话
  const clearConversations = useCallback((moduleType) => {
    setConversations(prev => {
      const module = moduleType || currentModule;
      return {
        ...prev,
        [module]: []
      };
    });
  }, [currentModule]);

  // 获取当前模块的对话
  const getCurrentConversations = useCallback(() => {
    return conversations[currentModule] || [];
  }, [conversations, currentModule]);

  // 设置对话（用于恢复历史记录）
  const setConversationsForModule = useCallback((newConversations, moduleType) => {
    setConversations(prev => {
      const module = moduleType || currentModule;
      return {
        ...prev,
        [module]: newConversations
      };
    });
  }, [currentModule]);

  // 更新特定消息中的 designJson（用于保存编辑后的设计稿）
  const updateMessageDesignJson = useCallback((messageId, newDesignJson, moduleType) => {
    setConversations(prev => {
      const module = moduleType || currentModule;
      const moduleConversations = prev[module] || [];
      return {
        ...prev,
        [module]: moduleConversations.map(msg =>
          msg.id === messageId && msg.type === 'design'
            ? { ...msg, designJson: newDesignJson }
            : msg
        )
      };
    });
  }, [currentModule]);

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
    const module = moduleType || currentModule;

    // 生成新会话ID
    const newSessionId = generateNewSession();

    // 清空当前模块的对话
    setConversations(prev => ({
      ...prev,
      [module]: []
    }));

    return newSessionId;
  }, [currentModule, generateNewSession]);

  // 恢复历史记录到当前会话
  const restoreHistory = useCallback((history, moduleType) => {
    const module = moduleType || currentModule;

    // 设置历史记录ID
    setCurrentHistoryId(history._id);

    // 设置会话ID（从历史记录中恢复或使用历史记录ID作为会话ID）
    const sessionId = history.sessionId || `session-${history._id}`;
    setCurrentSessionId(sessionId);

    // 恢复设计稿
    if (history.designJson) {
      setCurrentDesignJsonState(history.designJson);
    }

    // 恢复对话
    if (history.conversations && history.conversations.length > 0) {
      setConversations(prev => ({
        ...prev,
        [module]: history.conversations
      }));
    }

    return sessionId;
  }, [currentModule]);

  const value = {
    // 状态
    currentModule,
    currentDesignJson,
    previewState,
    currentCode,
    conversations,
    histories,
    user,
    token,
    sidebarCollapsed,
    theme,
    currentHistoryId,
    currentSessionId,
    isGenerating,

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
    isDesignModified,
    resetDesignModified,
    setIsGenerating
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
