/**
 * Design JSON 适配器
 * 用于统一处理新旧两种 Design JSON 格式
 * 
 * 旧格式: { version, type, metadata, root: { id, type, style, children } }
 * 新格式: { version, type, style, children } (千问返回的格式)
 */

/**
 * 将新格式转换为旧格式（带 root 包装）
 * @param {Object} designJson - 任意格式的 Design JSON
 * @returns {Object} 旧格式（带 root）
 */
export const normalizeToOldFormat = (designJson) => {
  if (!designJson) return null;

  // 如果已经有 root，说明是旧格式，直接返回
  if (designJson.root) {
    return designJson;
  }

  // 新格式：需要包装成旧格式
  // 创建 root 节点
  const rootNode = {
    id: designJson.id || 'root',
    type: designJson.type || 'page',
    name: designJson.name || '页面',
    style: designJson.style || {
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: [0, 0, 0, 0],
      display: 'flex',
      flexDirection: 'column'
    },
    children: designJson.children || []
  };

  return {
    version: designJson.version || '1.0',
    type: designJson.type || 'design-json',
    metadata: designJson.metadata || {
      title: '未命名页面',
      description: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    root: rootNode
  };
};

/**
 * 将旧格式转换为新格式（扁平化）
 * @param {Object} designJson - 旧格式 Design JSON
 * @returns {Object} 新格式
 */
export const convertToNewFormat = (designJson) => {
  if (!designJson) return null;

  // 如果没有 root，说明已经是新格式
  if (!designJson.root) {
    return designJson;
  }

  // 旧格式转新格式
  return {
    version: designJson.version,
    type: designJson.root.type,
    metadata: designJson.metadata,
    ...designJson.root
  };
};

/**
 * 获取根节点
 * @param {Object} designJson - 任意格式的 Design JSON
 * @returns {Object} 根节点
 */
export const getRootNode = (designJson) => {
  if (!designJson) return null;
  return designJson.root || designJson;
};

/**
 * 获取根节点 ID
 * @param {Object} designJson - 任意格式的 Design JSON
 * @returns {string} 根节点 ID
 */
export const getRootId = (designJson) => {
  const root = getRootNode(designJson);
  return root?.id;
};

/**
 * 检查是否为旧格式
 * @param {Object} designJson - Design JSON
 * @returns {boolean}
 */
export const isOldFormat = (designJson) => {
  return designJson && !!designJson.root;
};

/**
 * 检查是否为新格式
 * @param {Object} designJson - Design JSON
 * @returns {boolean}
 */
export const isNewFormat = (designJson) => {
  return designJson && !designJson.root && designJson.children !== undefined;
};
