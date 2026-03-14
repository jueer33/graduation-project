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
  
  // 当前 Design JSON
  const [currentDesignJson, setCurrentDesignJsonState] = useState(null);
  
  // 当前编辑的历史记录ID
  const [currentHistoryId, setCurrentHistoryId] = useState(null);
  
  // 设计稿是否被修改过（用于判断是否需要保存）
  const [isDesignModified, setIsDesignModified] = useState(false);
  
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
    isDesignModified,
    resetDesignModified
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

