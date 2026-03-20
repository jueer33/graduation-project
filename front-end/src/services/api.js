import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 1000000 // 增加超时时间到60秒，因为大模型调用可能需要更长时间
});

// 请求拦截器 - 添加token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error.message);
  }
);

// 用户相关接口
export const authAPI = {
  register: (email, password) => api.post('/auth/register', { email, password }),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  uploadAvatar: (formData) => api.post('/auth/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

// AI相关接口
export const aiAPI = {
  // 文本生成 Design JSON
  textToDesign: (text, sessionId = null, currentDesignJson = null) => 
    api.post('/ai/text-to-design', { text, sessionId, currentDesignJson }),
  
  // 图片生成 Design JSON
  imageToDesign: (formData) => {
    return api.post('/ai/image-to-design', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  
  // Design JSON 生成代码
  designToCode: (designJson, framework) => 
    api.post('/ai/design-to-code', { designJson, framework }),
  
  // 流式对话接口
  chatStream: (text, sessionId = null, currentDesignJson = null, onMessage) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE_URL}/ai/chat`, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token')}`);
      
      let buffer = '';
      
      xhr.onprogress = () => {
        const newData = xhr.responseText.substring(buffer.length);
        buffer = xhr.responseText;
        
        // 解析 SSE 数据
        const lines = newData.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              onMessage(data);
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error('请求失败'));
        }
      };
      
      xhr.onerror = () => reject(new Error('网络错误'));
      xhr.ontimeout = () => reject(new Error('请求超时'));
      
      xhr.send(JSON.stringify({
        text,
        sessionId,
        currentDesignJson
      }));
    });
  },
  
  // 获取会话历史
  getConversationHistory: (sessionId) => 
    api.get(`/ai/conversation/${sessionId}`),
  
  // 清除会话历史
  clearConversation: (sessionId) => 
    api.delete(`/ai/conversation/${sessionId}`)
};

// 历史记录接口
export const historyAPI = {
  getList: (page = 1, limit = 20) => api.get('/history', { params: { page, limit } }),
  getDetail: (id) => api.get(`/history/${id}`),
  create: (data) => api.post('/history', data),
  update: (id, data) => api.put(`/history/${id}`, data),
  delete: (id) => api.delete(`/history/${id}`)
};

export default api;
