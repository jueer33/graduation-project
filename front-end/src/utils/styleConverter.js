/**
 * 样式转换工具
 * 将Design JSON样式转换为CSS样式对象
 */

/**
 * 需要添加px单位的属性列表
 */
const PX_PROPERTIES = [
  'width',
  'height',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'fontSize',
  'borderRadius',
  'borderWidth',
  'gap',
  'top',
  'right',
  'bottom',
  'left',
  'zIndex',
  'lineHeight',
  'letterSpacing'
];

/**
 * 间距属性列表
 */
const SPACING_PROPERTIES = ['padding', 'margin'];

/**
 * 将数值转换为带单位的字符串
 * @param {number|string} value - 数值或字符串
 * @param {string} property - 属性名
 * @returns {string} 带单位的字符串
 */
export const convertDimension = (value, property) => {
  // 如果已经是字符串，保持原样
  if (typeof value === 'string') {
    return value;
  }
  
  // 如果是数字，根据属性决定是否添加单位
  if (typeof value === 'number') {
    // zIndex不需要单位
    if (property === 'zIndex') {
      return value;
    }
    // opacity是0-1的小数，不需要单位
    if (property === 'opacity') {
      return value;
    }
    // 其他数值添加px单位
    return `${value}px`;
  }
  
  return value;
};

/**
 * 转换间距数组为CSS字符串
 * @param {number[]} spacing - 间距数组 [上, 右, 下, 左]
 * @returns {string} CSS间距字符串
 */
export const convertSpacing = (spacing) => {
  if (!Array.isArray(spacing) || spacing.length !== 4) {
    return '0px';
  }
  
  return spacing.map(val => `${val}px`).join(' ');
};

/**
 * 将Design JSON样式转换为React CSS样式对象
 * @param {Object} designStyle - Design JSON样式对象
 * @returns {Object} React CSS样式对象
 */
export const convertStyleToCSS = (designStyle = {}) => {
  const cssStyle = {};
  
  if (!designStyle || typeof designStyle !== 'object') {
    return cssStyle;
  }
  
  Object.entries(designStyle).forEach(([key, value]) => {
    // 跳过undefined和null值
    if (value === undefined || value === null) {
      return;
    }
    
    // 处理背景图片
    if (key === 'backgroundImage' && value) {
      // 确保 URL 格式正确
      if (value.startsWith('http') || value.startsWith('data:') || value.startsWith('blob:')) {
        cssStyle.backgroundImage = `url(${value})`;
      } else if (!value.startsWith('url(')) {
        cssStyle.backgroundImage = `url(${value})`;
      } else {
        cssStyle.backgroundImage = value;
      }
      return;
    }
    
    // 处理间距属性
    if (SPACING_PROPERTIES.includes(key) && Array.isArray(value)) {
      cssStyle[key] = convertSpacing(value);
      return;
    }
    
    // 处理需要添加单位的属性
    if (PX_PROPERTIES.includes(key)) {
      cssStyle[key] = convertDimension(value, key);
      return;
    }
    
    // 其他属性直接传递
    cssStyle[key] = value;
  });
  
  // 添加box-sizing确保尺寸计算正确
  cssStyle.boxSizing = 'border-box';
  
  return cssStyle;
};

/**
 * 将CSS样式对象转换回Design JSON样式（用于反向转换）
 * @param {Object} cssStyle - CSS样式对象
 * @returns {Object} Design JSON样式对象
 */
export const convertCSSToDesignStyle = (cssStyle = {}) => {
  const designStyle = {};
  
  if (!cssStyle || typeof cssStyle !== 'object') {
    return designStyle;
  }
  
  Object.entries(cssStyle).forEach(([key, value]) => {
    // 跳过box-sizing
    if (key === 'boxSizing') {
      return;
    }
    
    // 处理间距属性
    if (SPACING_PROPERTIES.includes(key) && typeof value === 'string') {
      const parts = value.split(' ').map(v => parseInt(v, 10) || 0);
      // 确保有4个值
      if (parts.length === 1) {
        designStyle[key] = [parts[0], parts[0], parts[0], parts[0]];
      } else if (parts.length === 2) {
        designStyle[key] = [parts[0], parts[1], parts[0], parts[1]];
      } else if (parts.length === 4) {
        designStyle[key] = parts;
      }
      return;
    }
    
    // 处理带px单位的数值
    if (typeof value === 'string' && value.endsWith('px')) {
      const numValue = parseInt(value, 10);
      if (!isNaN(numValue)) {
        designStyle[key] = numValue;
        return;
      }
    }
    
    // 处理百分比字符串
    if (typeof value === 'string' && value.endsWith('%')) {
      designStyle[key] = value;
      return;
    }
    
    // 其他属性直接传递
    designStyle[key] = value;
  });
  
  return designStyle;
};

/**
 * 获取组件的默认样式
 * @param {string} componentType - 组件类型
 * @returns {Object} 默认样式对象
 */
export const getDefaultStyle = (componentType) => {
  const defaults = {
    page: {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      padding: [0, 0, 0, 0]
    },
    container: {
      display: 'flex',
      flexDirection: 'column',
      width: '100%',
      padding: [16, 16, 16, 16],
      gap: 8
    },
    text: {
      fontSize: 14,
      color: '#333333',
      lineHeight: 1.5
    },
    button: {
      display: 'inline-flex',
      padding: [8, 16, 8, 16],
      backgroundColor: '#1890ff',
      color: '#ffffff',
      borderRadius: 4,
      border: 'none',
      cursor: 'pointer',
      fontSize: 14
    },
    input: {
      width: '100%',
      height: 32,
      padding: [0, 12, 0, 12],
      border: '1px solid #d9d9d9',
      borderRadius: 4,
      fontSize: 14
    },
    image: {
      width: '100%',
      height: 'auto',
      objectFit: 'cover'
    },
    card: {
      display: 'flex',
      flexDirection: 'column',
      padding: [16, 16, 16, 16],
      backgroundColor: '#ffffff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      gap: 12
    },
    divider: {
      width: '100%',
      height: 1,
      backgroundColor: '#e8e8e8',
      margin: [8, 0, 8, 0]
    },
    icon: {
      width: 24,
      height: 24,
      color: '#666666'
    }
  };
  
  return defaults[componentType] || {};
};

/**
 * 合并样式（用于属性编辑时）
 * @param {Object} baseStyle - 基础样式
 * @param {Object} overrideStyle - 覆盖样式
 * @returns {Object} 合并后的样式
 */
export const mergeStyles = (baseStyle = {}, overrideStyle = {}) => {
  return {
    ...baseStyle,
    ...overrideStyle
  };
};

/**
 * 创建间距数组
 * @param {number} top - 上边距
 * @param {number} right - 右边距
 * @param {number} bottom - 下边距
 * @param {number} left - 左边距
 * @returns {number[]} 间距数组
 */
export const createSpacing = (top = 0, right = 0, bottom = 0, left = 0) => {
  return [top, right, bottom, left];
};

/**
 * 统一设置四边间距
 * @param {number} value - 间距值
 * @returns {number[]} 间距数组
 */
export const createUniformSpacing = (value = 0) => {
  return [value, value, value, value];
};

/**
 * 验证样式值是否有效
 * @param {*} value - 样式值
 * @param {string} property - 属性名
 * @returns {boolean} 是否有效
 */
export const isValidStyleValue = (value, property) => {
  if (value === undefined || value === null) {
    return false;
  }
  
  // 数值类型验证
  if (typeof value === 'number') {
    // opacity必须是0-1之间
    if (property === 'opacity') {
      return value >= 0 && value <= 1;
    }
    return true;
  }
  
  // 字符串类型验证
  if (typeof value === 'string') {
    return value.trim() !== '';
  }
  
  // 数组类型验证（用于间距）
  if (Array.isArray(value)) {
    return value.length === 4 && value.every(v => typeof v === 'number');
  }
  
  return false;
};

/**
 * 清理样式对象，移除无效值
 * @param {Object} style - 样式对象
 * @returns {Object} 清理后的样式对象
 */
export const cleanStyle = (style = {}) => {
  const cleaned = {};
  
  Object.entries(style).forEach(([key, value]) => {
    if (isValidStyleValue(value, key)) {
      cleaned[key] = value;
    }
  });
  
  return cleaned;
};

export default {
  convertDimension,
  convertSpacing,
  convertStyleToCSS,
  convertCSSToDesignStyle,
  getDefaultStyle,
  mergeStyles,
  createSpacing,
  createUniformSpacing,
  isValidStyleValue,
  cleanStyle
};
