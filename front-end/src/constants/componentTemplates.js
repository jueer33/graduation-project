/**
 * 组件模板定义
 * 定义各种组件类型的默认配置
 */

import { generateId } from '../utils/designJsonUtils';

/**
 * 组件模板列表
 */
export const componentTemplates = {
  container: {
    type: 'container',
    name: '容器',
    style: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: [16, 16, 16, 16],
      gap: 8,
      backgroundColor: 'transparent'
    },
    children: []
  },

  text: {
    type: 'text',
    name: '文本',
    content: '这是一段文本',
    style: {
      fontSize: 14,
      color: '#333333',
      lineHeight: 1.5
    }
  },

  button: {
    type: 'button',
    name: '按钮',
    content: '按钮',
    style: {
      display: 'inline-flex',
      padding: [8, 16, 8, 16],
      backgroundColor: '#1890ff',
      color: '#ffffff',
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14,
      fontWeight: 'normal'
    }
  },

  input: {
    type: 'input',
    name: '输入框',
    placeholder: '请输入内容',
    style: {
      width: '100%',
      height: 32,
      padding: [0, 12, 0, 12],
      border: '1px solid #d9d9d9',
      borderRadius: 4,
      fontSize: 14
    }
  },

  image: {
    type: 'image',
    name: '图片',
    src: 'https://via.placeholder.com/200x150?text=Image',
    alt: '图片',
    style: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover'
    }
  },

  card: {
    type: 'card',
    name: '卡片',
    style: {
      display: 'flex',
      flexDirection: 'column',
      padding: [16, 16, 16, 16],
      backgroundColor: '#ffffff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      gap: 12
    },
    children: []
  },

  divider: {
    type: 'divider',
    name: '分割线',
    style: {
      width: '100%',
      height: 1,
      backgroundColor: '#e8e8e8',
      margin: [8, 0, 8, 0]
    }
  },

  icon: {
    type: 'icon',
    name: '图标',
    iconName: 'check',
    style: {
      width: 24,
      height: 24,
      color: '#666666'
    }
  }
};

/**
 * 创建新节点
 * @param {string} type - 组件类型
 * @param {Object} overrides - 覆盖配置
 * @returns {Object} 新节点
 */
export const createNode = (type, overrides = {}) => {
  const template = componentTemplates[type];
  if (!template) {
    console.warn(`未知的组件类型: ${type}`);
    return null;
  }

  return {
    id: generateId(),
    ...JSON.parse(JSON.stringify(template)), // 深拷贝
    ...overrides
  };
};

/**
 * 获取组件类型列表
 * @returns {Array} 组件类型列表
 */
export const getComponentTypes = () => {
  return Object.keys(componentTemplates).map(type => ({
    type,
    name: componentTemplates[type].name,
    icon: getComponentIcon(type)
  }));
};

/**
 * 获取组件图标
 * @param {string} type - 组件类型
 * @returns {string} 图标字符
 */
const getComponentIcon = (type) => {
  const icons = {
    container: '📦',
    text: '📝',
    button: '🔘',
    input: '📥',
    image: '🖼️',
    card: '🃏',
    divider: '➖',
    icon: '🔣'
  };
  return icons[type] || '📄';
};

/**
 * 检查组件是否可以包含子元素
 * @param {string} type - 组件类型
 * @returns {boolean}
 */
export const canHaveChildren = (type) => {
  const containerTypes = ['page', 'container', 'card'];
  return containerTypes.includes(type);
};

/**
 * 获取组件默认样式
 * @param {string} type - 组件类型
 * @returns {Object} 默认样式
 */
export const getDefaultStyle = (type) => {
  const template = componentTemplates[type];
  return template ? { ...template.style } : {};
};

export default {
  componentTemplates,
  createNode,
  getComponentTypes,
  canHaveChildren,
  getDefaultStyle
};
