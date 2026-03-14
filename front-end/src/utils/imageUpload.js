/**
 * 图片上传工具
 * 处理本地图片选择、读取和转换
 */

/**
 * 读取文件为 Base64
 * @param {File} file - 文件对象
 * @returns {Promise<string>} Base64 字符串
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * 读取文件为 Blob URL
 * @param {File} file - 文件对象
 * @returns {string} Blob URL
 */
export const fileToBlobUrl = (file) => {
  return URL.createObjectURL(file);
};

/**
 * 验证图片文件
 * @param {File} file - 文件对象
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validateImageFile = (file) => {
  // 验证文件类型
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: '只支持 JPG、PNG、GIF、WebP 格式的图片' };
  }
  
  // 验证文件大小 (最大 5MB)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { valid: false, error: '图片大小不能超过 5MB' };
  }
  
  return { valid: true };
};

/**
 * 处理图片上传
 * @param {File} file - 文件对象
 * @param {Object} options - 配置选项
 * @returns {Promise<Object>} { success: boolean, data?: string, error?: string }
 */
export const handleImageUpload = async (file, options = {}) => {
  const { useBase64 = true } = options;
  
  // 验证文件
  const validation = validateImageFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }
  
  try {
    let imageData;
    
    if (useBase64) {
      imageData = await fileToBase64(file);
    } else {
      imageData = fileToBlobUrl(file);
    }
    
    return { success: true, data: imageData };
  } catch (error) {
    return { success: false, error: '图片读取失败: ' + error.message };
  }
};

export default {
  fileToBase64,
  fileToBlobUrl,
  validateImageFile,
  handleImageUpload
};
