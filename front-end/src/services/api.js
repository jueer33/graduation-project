import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000
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
  textToDesign: (text, currentDesignJson = null) => api.post('/ai/text-to-design', { text, currentDesignJson }),
  imageToDesign: (formData, currentDesignJson = null) => {
    if (currentDesignJson) {
      formData.append('currentDesignJson', JSON.stringify(currentDesignJson));
    }
    return api.post('/ai/image-to-design', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  designToCode: (designJson, framework) => api.post('/ai/design-to-code', { designJson, framework }),
  chat: (messages, moduleType, framework) => api.post('/ai/chat', { messages, moduleType, framework })
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

