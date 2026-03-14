/**
 * Design JSON 操作工具
 * 提供对Design JSON的增删改查操作
 */

/**
 * 生成唯一ID
 * @returns {string} 唯一ID
 */
export const generateId = () => {
  return `node-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 5)}`;
};

/**
 * 创建新的Design JSON
 * @param {Object} options - 配置选项
 * @returns {Object} Design JSON对象
 */
export const createDesignJSON = (options = {}) => {
  const {
    title = '未命名页面',
    description = '',
    width = '100%',
    height = 'auto'
  } = options;

  return {
    version: '1.0',
    type: 'design-json',
    metadata: {
      title,
      description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      viewport: {
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined
      }
    },
    theme: {
      colors: {
        primary: '#1890ff',
        secondary: '#52c41a',
        text: '#333333',
        textSecondary: '#666666',
        background: '#f5f5f5',
        border: '#d9d9d9'
      }
    },
    root: {
      id: generateId(),
      type: 'page',
      name: '页面',
      style: {
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: [0, 0, 0, 0],
        display: 'flex',
        flexDirection: 'column'
      },
      children: []
    }
  };
};

/**
 * 查找节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 节点ID
 * @returns {Object} 查找结果 { node, parent, index, path }
 */
export const findNode = (root, nodeId) => {
  if (!root || !nodeId) {
    return { node: null, parent: null, index: -1, path: [] };
  }

  // 检查根节点
  if (root.id === nodeId) {
    return { node: root, parent: null, index: -1, path: [nodeId] };
  }

  // 递归查找
  const search = (currentNode, parentNode, currentPath) => {
    if (!currentNode.children || currentNode.children.length === 0) {
      return null;
    }

    for (let i = 0; i < currentNode.children.length; i++) {
      const child = currentNode.children[i];
      const newPath = [...currentPath, child.id];

      if (child.id === nodeId) {
        return {
          node: child,
          parent: currentNode,
          index: i,
          path: newPath
        };
      }

      const result = search(child, currentNode, newPath);
      if (result) {
        return result;
      }
    }

    return null;
  };

  const result = search(root, null, [root.id]);
  return result || { node: null, parent: null, index: -1, path: [] };
};

/**
 * 更新节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 节点ID
 * @param {Object} updates - 更新内容
 * @returns {Object} 新的根节点
 */
export const updateNode = (root, nodeId, updates) => {
  if (!root || !nodeId) {
    return root;
  }

  const cloneNode = (node) => ({
    ...node,
    style: { ...node.style },
    children: node.children ? node.children.map(cloneNode) : undefined
  });

  const newRoot = cloneNode(root);

  const update = (currentNode) => {
    if (currentNode.id === nodeId) {
      // 更新节点
      Object.keys(updates).forEach(key => {
        if (key === 'style') {
          currentNode.style = { ...currentNode.style, ...updates[key] };
        } else {
          currentNode[key] = updates[key];
        }
      });
      return true;
    }

    if (currentNode.children) {
      for (const child of currentNode.children) {
        if (update(child)) {
          return true;
        }
      }
    }

    return false;
  };

  update(newRoot);
  return newRoot;
};

/**
 * 添加子节点
 * @param {Object} root - 根节点
 * @param {string} parentId - 父节点ID
 * @param {Object} newNode - 新节点
 * @param {number} index - 插入位置（可选，默认添加到末尾）
 * @returns {Object} 新的根节点
 */
export const addChildNode = (root, parentId, newNode, index = -1) => {
  if (!root || !parentId || !newNode) {
    return root;
  }

  const cloneNode = (node) => ({
    ...node,
    style: { ...node.style },
    children: node.children ? [...node.children] : undefined
  });

  const newRoot = cloneNode(root);

  const add = (currentNode) => {
    if (currentNode.id === parentId) {
      if (!currentNode.children) {
        currentNode.children = [];
      }

      const nodeToAdd = {
        ...newNode,
        id: newNode.id || generateId()
      };

      if (index >= 0 && index < currentNode.children.length) {
        currentNode.children.splice(index, 0, nodeToAdd);
      } else {
        currentNode.children.push(nodeToAdd);
      }

      return true;
    }

    if (currentNode.children) {
      for (const child of currentNode.children) {
        if (add(child)) {
          return true;
        }
      }
    }

    return false;
  };

  add(newRoot);
  return newRoot;
};

/**
 * 删除节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 节点ID
 * @returns {Object} 新的根节点
 */
export const removeNode = (root, nodeId) => {
  if (!root || !nodeId || root.id === nodeId) {
    // 不能删除根节点
    return root;
  }

  const cloneNode = (node) => ({
    ...node,
    style: { ...node.style },
    children: node.children ? [...node.children] : undefined
  });

  const newRoot = cloneNode(root);

  const remove = (currentNode) => {
    if (!currentNode.children) {
      return false;
    }

    const index = currentNode.children.findIndex(child => child.id === nodeId);
    if (index !== -1) {
      currentNode.children.splice(index, 1);
      return true;
    }

    for (const child of currentNode.children) {
      if (remove(child)) {
        return true;
      }
    }

    return false;
  };

  remove(newRoot);
  return newRoot;
};

/**
 * 移动节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 要移动的节点ID
 * @param {string} targetParentId - 目标父节点ID
 * @param {number} targetIndex - 目标位置
 * @returns {Object} 新的根节点
 */
export const moveNode = (root, nodeId, targetParentId, targetIndex = -1) => {
  if (!root || !nodeId || !targetParentId) {
    return root;
  }

  // 不能移动到自己内部
  const { path } = findNode(root, targetParentId);
  if (path.includes(nodeId)) {
    return root;
  }

  // 找到要移动的节点
  const { node: nodeToMove, parent: sourceParent } = findNode(root, nodeId);
  if (!nodeToMove || !sourceParent) {
    return root;
  }

  // 克隆根节点
  const cloneNode = (node) => ({
    ...node,
    style: { ...node.style },
    children: node.children ? node.children.map(cloneNode) : undefined
  });

  let newRoot = cloneNode(root);

  // 从原位置删除
  newRoot = removeNode(newRoot, nodeId);

  // 添加到新位置
  newRoot = addChildNode(newRoot, targetParentId, nodeToMove, targetIndex);

  return newRoot;
};

/**
 * 复制节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 要复制的节点ID
 * @param {string} targetParentId - 目标父节点ID（可选，默认为原父节点）
 * @returns {Object} 新的根节点
 */
export const duplicateNode = (root, nodeId, targetParentId = null) => {
  if (!root || !nodeId) {
    return root;
  }

  const { node: nodeToCopy, parent: sourceParent } = findNode(root, nodeId);
  if (!nodeToCopy) {
    return root;
  }

  // 递归克隆节点并生成新ID
  const cloneWithNewIds = (node) => {
    const newNode = {
      ...node,
      id: generateId(),
      name: node.name ? `${node.name} 副本` : undefined,
      style: { ...node.style }
    };

    if (node.children) {
      newNode.children = node.children.map(cloneWithNewIds);
    }

    return newNode;
  };

  const newNode = cloneWithNewIds(nodeToCopy);
  const parentId = targetParentId || sourceParent?.id;

  if (!parentId) {
    return root;
  }

  // 找到原节点的索引，在其后插入
  const { index: sourceIndex } = findNode(root, nodeId);
  return addChildNode(root, parentId, newNode, sourceIndex + 1);
};

/**
 * 获取所有节点列表（扁平化）
 * @param {Object} root - 根节点
 * @returns {Array} 节点列表
 */
export const flattenNodes = (root) => {
  const nodes = [];

  const traverse = (node, depth = 0, parentId = null) => {
    nodes.push({
      ...node,
      depth,
      parentId
    });

    if (node.children) {
      node.children.forEach(child => traverse(child, depth + 1, node.id));
    }
  };

  if (root) {
    traverse(root);
  }

  return nodes;
};

/**
 * 获取节点的兄弟节点
 * @param {Object} root - 根节点
 * @param {string} nodeId - 节点ID
 * @returns {Array} 兄弟节点列表
 */
export const getSiblings = (root, nodeId) => {
  const { parent } = findNode(root, nodeId);
  if (!parent || !parent.children) {
    return [];
  }

  return parent.children.filter(child => child.id !== nodeId);
};

/**
 * 更新节点样式
 * @param {Object} root - 根节点
 * @param {string} nodeId - 节点ID
 * @param {Object} styleUpdates - 样式更新
 * @returns {Object} 新的根节点
 */
export const updateNodeStyle = (root, nodeId, styleUpdates) => {
  return updateNode(root, nodeId, { style: styleUpdates });
};

/**
 * 验证Design JSON结构
 * @param {Object} designJson - Design JSON对象
 * @returns {Object} 验证结果 { valid: boolean, errors: string[] }
 */
export const validateDesignJSON = (designJson) => {
  const errors = [];

  if (!designJson) {
    return { valid: false, errors: ['Design JSON不能为空'] };
  }

  // 检查必需字段
  if (!designJson.version) {
    errors.push('缺少version字段');
  }

  if (!designJson.type) {
    errors.push('缺少type字段');
  }

  if (!designJson.root) {
    errors.push('缺少root字段');
  } else {
    // 验证根节点
    if (!designJson.root.id) {
      errors.push('根节点缺少id字段');
    }

    if (!designJson.root.type) {
      errors.push('根节点缺少type字段');
    }

    if (!designJson.root.style) {
      errors.push('根节点缺少style字段');
    }
  }

  // 递归验证所有节点
  const validateNode = (node, path = 'root') => {
    if (!node.id) {
      errors.push(`${path} 节点缺少id字段`);
    }

    if (!node.type) {
      errors.push(`${path} 节点缺少type字段`);
    }

    if (!node.style) {
      errors.push(`${path} 节点缺少style字段`);
    }

    if (node.children) {
      node.children.forEach((child, index) => {
        validateNode(child, `${path}.children[${index}]`);
      });
    }
  };

  if (designJson.root) {
    validateNode(designJson.root);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * 导出Design JSON为JSON字符串
 * @param {Object} designJson - Design JSON对象
 * @param {boolean} pretty - 是否格式化
 * @returns {string} JSON字符串
 */
export const exportDesignJSON = (designJson, pretty = true) => {
  if (pretty) {
    return JSON.stringify(designJson, null, 2);
  }
  return JSON.stringify(designJson);
};

/**
 * 从JSON字符串导入Design JSON
 * @param {string} jsonString - JSON字符串
 * @returns {Object|null} Design JSON对象或null
 */
export const importDesignJSON = (jsonString) => {
  try {
    const designJson = JSON.parse(jsonString);
    const { valid, errors } = validateDesignJSON(designJson);

    if (!valid) {
      console.error('Design JSON验证失败:', errors);
      return null;
    }

    return designJson;
  } catch (error) {
    console.error('解析Design JSON失败:', error);
    return null;
  }
};

/**
 * 更新Design JSON元数据
 * @param {Object} designJson - Design JSON对象
 * @param {Object} metadataUpdates - 元数据更新
 * @returns {Object} 新的Design JSON对象
 */
export const updateMetadata = (designJson, metadataUpdates) => {
  return {
    ...designJson,
    metadata: {
      ...designJson.metadata,
      ...metadataUpdates,
      updatedAt: new Date().toISOString()
    }
  };
};

export default {
  generateId,
  createDesignJSON,
  findNode,
  updateNode,
  addChildNode,
  removeNode,
  moveNode,
  duplicateNode,
  flattenNodes,
  getSiblings,
  updateNodeStyle,
  validateDesignJSON,
  exportDesignJSON,
  importDesignJSON,
  updateMetadata
};
