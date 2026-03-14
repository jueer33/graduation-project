/**
 * 伪数据设计稿生成器
 * 用于模拟大模型 API 返回 Design JSON
 */

// 颜色映射表
const COLOR_MAP = {
  '红色': '#f5222d',
  '深红': '#cf1322',
  '蓝色': '#1890ff',
  '深蓝': '#096dd9',
  '天蓝': '#40a9ff',
  '绿色': '#52c41a',
  '深绿': '#389e0d',
  '黑色': '#000000',
  '白色': '#ffffff',
  '灰色': '#8c8c8c',
  '浅灰': '#f5f5f5',
  '深灰': '#595959',
  '紫色': '#722ed1',
  '深紫': '#531dab',
  '橙色': '#fa8c16',
  '深橙': '#d46b08',
  '粉色': '#eb2f96',
  '黄色': '#fadb14',
  '青色': '#13c2c2',
  '深蓝背景': '#001529',
  '浅蓝背景': '#f0f5ff',
  '灰白背景': '#f0f2f5'
};

// 关键词识别配置
const KEYWORDS = {
  colors: Object.keys(COLOR_MAP),
  components: ['按钮', '输入框', '卡片', '图片', '标题', '文本', '链接', '图标', '分割线'],
  layouts: ['居中', '左右', '上下', '网格', '列表', '水平', '垂直'],
  actions: ['添加', '删除', '修改', '变大', '变小', '圆角', '阴影', '边框'],
  pageTypes: ['登录', '注册', '首页', '仪表盘', '卡片', '列表', '导航', '表单']
};

/**
 * 解析用户输入的意图
 * @param {string} text - 用户输入文本
 * @returns {Object} 解析后的意图
 */
function parseIntent(text) {
  const intent = {
    pageType: null,
    colors: [],
    components: [],
    layouts: [],
    actions: [],
    isModification: false
  };

  const lowerText = text.toLowerCase();

  // 识别页面类型
  for (const type of KEYWORDS.pageTypes) {
    if (lowerText.includes(type)) {
      intent.pageType = type;
      break;
    }
  }

  // 识别颜色
  for (const color of KEYWORDS.colors) {
    if (text.includes(color)) {
      intent.colors.push({ keyword: color, value: COLOR_MAP[color] });
    }
  }

  // 识别组件
  for (const comp of KEYWORDS.components) {
    if (text.includes(comp)) {
      intent.components.push(comp);
    }
  }

  // 识别布局
  for (const layout of KEYWORDS.layouts) {
    if (text.includes(layout)) {
      intent.layouts.push(layout);
    }
  }

  // 识别操作
  for (const action of KEYWORDS.actions) {
    if (text.includes(action)) {
      intent.actions.push(action);
    }
  }

  // 判断是否是修改操作
  intent.isModification = intent.actions.length > 0 || 
                          intent.colors.length > 0 || 
                          text.includes('改') || 
                          text.includes('变成') ||
                          text.includes('换成');

  return intent;
}

/**
 * 生成唯一ID
 * @param {string} prefix - ID前缀
 * @returns {string} 唯一ID
 */
function generateId(prefix = 'component') {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * 创建基础页面结构
 * @returns {Object} 基础页面 Design JSON
 */
function createBasePage() {
  return {
    version: "1.0",
    type: "design-json",
    root: {
      id: generateId('page'),
      type: "page",
      name: "页面",
      style: {
        width: "100%",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: [0, 0, 0, 0]
      },
      children: []
    }
  };
}

/**
 * 创建登录页面
 * @returns {Object} 登录页面 Design JSON
 */
function createLoginPage() {
  return {
    version: "1.0",
    type: "design-json",
    root: {
      id: generateId('page'),
      type: "page",
      name: "登录页面",
      style: {
        width: "100%",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: [0, 0, 0, 0]
      },
      children: [
        {
          id: generateId('login-card'),
          type: "card",
          name: "登录卡片",
          style: {
            display: "flex",
            flexDirection: "column",
            width: 400,
            padding: [40, 40, 40, 40],
            gap: 24,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          },
          children: [
            {
              id: generateId('title'),
              type: "text",
              name: "标题",
              content: "欢迎登录",
              style: {
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a1a1a",
                textAlign: "center"
              }
            },
            {
              id: generateId('username-input'),
              type: "input",
              name: "用户名输入框",
              placeholder: "请输入用户名",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('password-input'),
              type: "input",
              name: "密码输入框",
              placeholder: "请输入密码",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('login-btn'),
              type: "button",
              name: "登录按钮",
              content: "登 录",
              style: {
                width: "100%",
                height: 44,
                backgroundColor: "#1890ff",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer"
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * 创建注册页面
 * @returns {Object} 注册页面 Design JSON
 */
function createRegisterPage() {
  return {
    version: "1.0",
    type: "design-json",
    root: {
      id: generateId('page'),
      type: "page",
      name: "注册页面",
      style: {
        width: "100%",
        height: "100vh",
        backgroundColor: "#f0f2f5",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: [0, 0, 0, 0]
      },
      children: [
        {
          id: generateId('register-card'),
          type: "card",
          name: "注册卡片",
          style: {
            display: "flex",
            flexDirection: "column",
            width: 400,
            padding: [40, 40, 40, 40],
            gap: 20,
            backgroundColor: "#ffffff",
            borderRadius: 12,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          },
          children: [
            {
              id: generateId('title'),
              type: "text",
              name: "标题",
              content: "创建账号",
              style: {
                fontSize: 28,
                fontWeight: "bold",
                color: "#1a1a1a",
                textAlign: "center"
              }
            },
            {
              id: generateId('email-input'),
              type: "input",
              name: "邮箱输入框",
              placeholder: "请输入邮箱",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('username-input'),
              type: "input",
              name: "用户名输入框",
              placeholder: "请输入用户名",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('password-input'),
              type: "input",
              name: "密码输入框",
              placeholder: "请输入密码",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('confirm-password-input'),
              type: "input",
              name: "确认密码输入框",
              placeholder: "请确认密码",
              style: {
                width: "100%",
                height: 44,
                padding: [0, 16, 0, 16],
                border: "1px solid #d9d9d9",
                borderRadius: 8,
                fontSize: 14
              }
            },
            {
              id: generateId('register-btn'),
              type: "button",
              name: "注册按钮",
              content: "注 册",
              style: {
                width: "100%",
                height: 44,
                backgroundColor: "#52c41a",
                color: "#ffffff",
                border: "none",
                borderRadius: 8,
                fontSize: 16,
                fontWeight: 500,
                cursor: "pointer"
              }
            }
          ]
        }
      ]
    }
  };
}

/**
 * 创建仪表盘页面
 * @returns {Object} 仪表盘页面 Design JSON
 */
function createDashboardPage() {
  return {
    version: "1.0",
    type: "design-json",
    root: {
      id: generateId('page'),
      type: "page",
      name: "仪表盘",
      style: {
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f0f2f5",
        padding: [24, 24, 24, 24]
      },
      children: [
        {
          id: generateId('page-title'),
          type: "text",
          name: "页面标题",
          content: "数据仪表盘",
          style: {
            fontSize: 32,
            fontWeight: "bold",
            color: "#1a1a1a",
            margin: [0, 0, 24, 0]
          }
        },
        {
          id: generateId('stats-row'),
          type: "container",
          name: "统计卡片行",
          style: {
            display: "flex",
            flexDirection: "row",
            gap: 24,
            margin: [0, 0, 24, 0]
          },
          children: [
            createStatCard('总用户', '12,345', '#1890ff'),
            createStatCard('日活跃', '1,234', '#52c41a'),
            createStatCard('收入', '¥89,234', '#fa8c16'),
            createStatCard('订单', '456', '#722ed1')
          ]
        },
        {
          id: generateId('content-area'),
          type: "container",
          name: "内容区",
          style: {
            display: "flex",
            flexDirection: "row",
            gap: 24
          },
          children: [
            {
              id: generateId('chart-card'),
              type: "card",
              name: "图表卡片",
              style: {
                flex: 2,
                padding: [24, 24, 24, 24],
                backgroundColor: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              },
              children: [
                {
                  id: generateId('chart-title'),
                  type: "text",
                  name: "图表标题",
                  content: "趋势分析",
                  style: {
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    margin: [0, 0, 16, 0]
                  }
                },
                {
                  id: generateId('chart-placeholder'),
                  type: "container",
                  name: "图表占位",
                  style: {
                    height: 300,
                    backgroundColor: "#f5f5f5",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                  },
                  children: [
                    {
                      id: generateId('chart-text'),
                      type: "text",
                      name: "图表文本",
                      content: "图表区域",
                      style: {
                        fontSize: 16,
                        color: "#8c8c8c"
                      }
                    }
                  ]
                }
              ]
            },
            {
              id: generateId('list-card'),
              type: "card",
              name: "列表卡片",
              style: {
                flex: 1,
                padding: [24, 24, 24, 24],
                backgroundColor: "#ffffff",
                borderRadius: 12,
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
              },
              children: [
                {
                  id: generateId('list-title'),
                  type: "text",
                  name: "列表标题",
                  content: "最近活动",
                  style: {
                    fontSize: 18,
                    fontWeight: "bold",
                    color: "#1a1a1a",
                    margin: [0, 0, 16, 0]
                  }
                },
                createListItem('用户A 完成了订单'),
                createListItem('用户B 注册了账号'),
                createListItem('用户C 提交了反馈'),
                createListItem('用户D 更新了资料')
              ]
            }
          ]
        }
      ]
    }
  };
}

/**
 * 创建统计卡片
 * @param {string} title - 标题
 * @param {string} value - 数值
 * @param {string} color - 颜色
 * @returns {Object} 统计卡片节点
 */
function createStatCard(title, value, color) {
  return {
    id: generateId('stat-card'),
    type: "card",
    name: `${title}统计卡片`,
    style: {
      flex: 1,
      padding: [24, 24, 24, 24],
      backgroundColor: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    },
    children: [
      {
        id: generateId('stat-title'),
        type: "text",
        name: "统计标题",
        content: title,
        style: {
          fontSize: 14,
          color: "#8c8c8c",
          margin: [0, 0, 8, 0]
        }
      },
      {
        id: generateId('stat-value'),
        type: "text",
        name: "统计数值",
        content: value,
        style: {
          fontSize: 32,
          fontWeight: "bold",
          color: color
        }
      }
    ]
  };
}

/**
 * 创建列表项
 * @param {string} text - 文本内容
 * @returns {Object} 列表项节点
 */
function createListItem(text) {
  return {
    id: generateId('list-item'),
    type: "container",
    name: "列表项",
    style: {
      padding: [12, 0, 12, 0],
      borderBottom: "1px solid #f0f0f0"
    },
    children: [
      {
        id: generateId('list-item-text'),
        type: "text",
        name: "列表项文本",
        content: text,
        style: {
          fontSize: 14,
          color: "#595959"
        }
      }
    ]
  };
}

/**
 * 创建卡片列表页面
 * @returns {Object} 卡片列表页面 Design JSON
 */
function createCardListPage() {
  return {
    version: "1.0",
    type: "design-json",
    root: {
      id: generateId('page'),
      type: "page",
      name: "产品列表",
      style: {
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: [40, 48, 40, 48]
      },
      children: [
        {
          id: generateId('page-title'),
          type: "text",
          name: "页面标题",
          content: "热门产品",
          style: {
            fontSize: 32,
            fontWeight: "bold",
            color: "#1a1a1a",
            margin: [0, 0, 32, 0]
          }
        },
        {
          id: generateId('card-grid'),
          type: "container",
          name: "卡片网格",
          style: {
            display: "flex",
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 24,
            justifyContent: "flex-start"
          },
          children: [
            createProductCard('智能手表 Pro', '¥1,999', '#1890ff'),
            createProductCard('无线耳机', '¥899', '#52c41a'),
            createProductCard('平板电脑', '¥3,499', '#fa8c16'),
            createProductCard('智能音箱', '¥599', '#722ed1')
          ]
        }
      ]
    }
  };
}

/**
 * 创建产品卡片
 * @param {string} name - 产品名称
 * @param {string} price - 价格
 * @param {string} btnColor - 按钮颜色
 * @returns {Object} 产品卡片节点
 */
function createProductCard(name, price, btnColor) {
  return {
    id: generateId('product-card'),
    type: "card",
    name: `${name}卡片`,
    style: {
      display: "flex",
      flexDirection: "column",
      width: 280,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      overflow: "hidden"
    },
    children: [
      {
        id: generateId('product-img'),
        type: "image",
        name: "产品图片",
        src: "https://via.placeholder.com/280x180",
        alt: name,
        style: {
          width: "100%",
          height: 180,
          objectFit: "cover"
        }
      },
      {
        id: generateId('product-content'),
        type: "container",
        name: "卡片内容",
        style: {
          display: "flex",
          flexDirection: "column",
          padding: [20, 20, 20, 20],
          gap: 12
        },
        children: [
          {
            id: generateId('product-name'),
            type: "text",
            name: "产品名称",
            content: name,
            style: {
              fontSize: 18,
              fontWeight: "bold",
              color: "#1a1a1a"
            }
          },
          {
            id: generateId('product-price'),
            type: "text",
            name: "价格",
            content: price,
            style: {
              fontSize: 20,
              fontWeight: "bold",
              color: "#f5222d"
            }
          },
          {
            id: generateId('product-btn'),
            type: "button",
            name: "购买按钮",
            content: "立即购买",
            style: {
              width: "100%",
              height: 40,
              backgroundColor: btnColor,
              color: "#ffffff",
              border: "none",
              borderRadius: 6,
              fontSize: 14,
              cursor: "pointer",
              margin: [8, 0, 0, 0]
            }
          }
        ]
      }
    ]
  };
}

/**
 * 根据意图创建新的设计稿
 * @param {Object} intent - 解析后的意图
 * @returns {Object} 新的 Design JSON
 */
function createNewDesignJson(intent) {
  let designJson;

  // 根据页面类型选择模板
  switch (intent.pageType) {
    case '注册':
      designJson = createRegisterPage();
      break;
    case '仪表盘':
    case '首页':
      designJson = createDashboardPage();
      break;
    case '卡片':
    case '列表':
      designJson = createCardListPage();
      break;
    case '登录':
    default:
      designJson = createLoginPage();
      break;
  }

  // 应用颜色修改
  if (intent.colors.length > 0) {
    designJson = applyColorChanges(designJson, intent.colors);
  }

  return designJson;
}

/**
 * 修改现有设计稿
 * @param {Object} designJson - 当前设计稿
 * @param {Object} intent - 解析后的意图
 * @returns {Object} 修改后的 Design JSON
 */
function modifyDesignJson(designJson, intent) {
  // 深拷贝，避免修改原对象
  let modified = JSON.parse(JSON.stringify(designJson));

  // 应用颜色修改
  if (intent.colors.length > 0) {
    modified = applyColorChanges(modified, intent.colors, intent);
  }

  // 应用布局修改
  if (intent.layouts.length > 0) {
    modified = applyLayoutChanges(modified, intent);
  }

  // 应用组件操作（添加/删除）
  if (intent.components.length > 0 && intent.actions.includes('添加')) {
    modified = addComponents(modified, intent);
  }

  // 应用圆角修改
  if (intent.actions.includes('圆角')) {
    modified = applyBorderRadius(modified);
  }

  // 应用阴影修改
  if (intent.actions.includes('阴影')) {
    modified = applyShadow(modified);
  }

  return modified;
}

/**
 * 应用颜色修改
 * @param {Object} designJson - 设计稿
 * @param {Array} colors - 颜色列表
 * @param {Object} intent - 意图（可选）
 * @returns {Object} 修改后的设计稿
 */
function applyColorChanges(designJson, colors, intent = null) {
  const modified = JSON.parse(JSON.stringify(designJson));
  const text = intent ? intent.text || '' : '';

  // 判断是否是背景颜色修改
  const isBackgroundChange = text.includes('背景') || 
                             text.includes('页面') || 
                             text.includes('底色');
  
  // 判断是否是按钮颜色修改
  const isButtonChange = text.includes('按钮') || text.includes('button');

  colors.forEach(colorInfo => {
    if (isBackgroundChange && !isButtonChange) {
      // 修改页面背景色（在 root 节点上）
      if (modified.root && modified.root.style) {
        modified.root.style.backgroundColor = colorInfo.value;
      }
    } else if (isButtonChange) {
      // 修改按钮颜色
      if (modified.root) {
        modified.root = traverseAndModify(modified.root, (node) => {
          if (node.type === 'button' && node.style) {
            node.style.backgroundColor = colorInfo.value;
          }
        });
      }
    } else {
      // 默认修改主要元素的颜色（按钮）
      if (modified.root) {
        modified.root = traverseAndModify(modified.root, (node) => {
          if (node.type === 'button' && node.style) {
            node.style.backgroundColor = colorInfo.value;
          }
        });
      }
    }
  });

  return modified;
}

/**
 * 应用布局修改
 * @param {Object} designJson - 设计稿
 * @param {Object} intent - 意图
 * @returns {Object} 修改后的设计稿
 */
function applyLayoutChanges(designJson, intent) {
  const modified = JSON.parse(JSON.stringify(designJson));

  intent.layouts.forEach(layout => {
    if (layout === '居中') {
      if (modified.root && modified.root.style) {
        modified.root.style.justifyContent = 'center';
        modified.root.style.alignItems = 'center';
      }
    } else if (layout === '左右' || layout === '水平') {
      if (modified.root) {
        modified.root = traverseAndModify(modified.root, (node) => {
          if (node.type === 'container' && node.style) {
            node.style.flexDirection = 'row';
          }
        });
      }
    } else if (layout === '上下' || layout === '垂直') {
      if (modified.root) {
        modified.root = traverseAndModify(modified.root, (node) => {
          if (node.type === 'container' && node.style) {
            node.style.flexDirection = 'column';
          }
        });
      }
    }
  });

  return modified;
}

/**
 * 添加组件
 * @param {Object} designJson - 设计稿
 * @param {Object} intent - 意图
 * @returns {Object} 修改后的设计稿
 */
function addComponents(designJson, intent) {
  const modified = JSON.parse(JSON.stringify(designJson));

  intent.components.forEach(componentType => {
    const newComponent = createComponentByType(componentType);
    if (newComponent && modified.root && modified.root.children && modified.root.children.length > 0) {
      // 添加到第一个容器组件中
      const firstContainer = modified.root.children.find(c => 
        c.type === 'container' || c.type === 'card'
      );
      if (firstContainer) {
        if (!firstContainer.children) {
          firstContainer.children = [];
        }
        firstContainer.children.push(newComponent);
      }
    }
  });

  return modified;
}

/**
 * 根据类型创建组件
 * @param {string} type - 组件类型
 * @returns {Object|null} 组件节点
 */
function createComponentByType(type) {
  const id = generateId(type);

  switch (type) {
    case '按钮':
      return {
        id,
        type: "button",
        name: "新增按钮",
        text: "新按钮",
        style: {
          width: "100%",
          height: 40,
          backgroundColor: "#1890ff",
          color: "#ffffff",
          border: "none",
          borderRadius: 8,
          fontSize: 14,
          cursor: "pointer",
          margin: [8, 0, 0, 0]
        }
      };
    case '输入框':
      return {
        id,
        type: "input",
        name: "新增输入框",
        placeholder: "请输入",
        style: {
          width: "100%",
          height: 44,
          padding: [0, 16, 0, 16],
          border: "1px solid #d9d9d9",
          borderRadius: 8,
          fontSize: 14,
          margin: [8, 0, 8, 0]
        }
      };
    case '文本':
    case '标题':
      return {
        id,
        type: "text",
        name: "新增文本",
        content: "新文本内容",
        style: {
          fontSize: 14,
          color: "#595959",
          margin: [8, 0, 8, 0]
        }
      };
    case '链接':
      return {
        id,
        type: "text",
        name: "链接",
        content: "点击这里",
        style: {
          fontSize: 14,
          color: "#1890ff",
          cursor: "pointer",
          textDecoration: "underline",
          margin: [8, 0, 8, 0]
        }
      };
    case '分割线':
      return {
        id,
        type: "divider",
        name: "分割线",
        style: {
          width: "100%",
          height: 1,
          backgroundColor: "#e8e8e8",
          margin: [16, 0, 16, 0]
        }
      };
    default:
      return null;
  }
}

/**
 * 应用圆角
 * @param {Object} designJson - 设计稿
 * @returns {Object} 修改后的设计稿
 */
function applyBorderRadius(designJson) {
  const modified = JSON.parse(JSON.stringify(designJson));
  if (modified.root) {
    modified.root = traverseAndModify(modified.root, (node) => {
      if (node.style && (node.type === 'card' || node.type === 'button' || node.type === 'input')) {
        node.style.borderRadius = 20;
      }
    });
  }
  return modified;
}

/**
 * 应用阴影
 * @param {Object} designJson - 设计稿
 * @returns {Object} 修改后的设计稿
 */
function applyShadow(designJson) {
  const modified = JSON.parse(JSON.stringify(designJson));
  if (modified.root) {
    modified.root = traverseAndModify(modified.root, (node) => {
      if (node.style && node.type === 'card') {
        node.style.boxShadow = "0 8px 24px rgba(0,0,0,0.15)";
      }
    });
  }
  return modified;
}

/**
 * 遍历并修改设计稿中的所有节点
 * @param {Object} node - 节点
 * @param {Function} modifier - 修改函数
 * @returns {Object} 修改后的节点
 */
function traverseAndModify(node, modifier) {
  // 修改当前节点
  modifier(node);

  // 递归修改子节点
  if (node.children && Array.isArray(node.children)) {
    node.children.forEach(child => traverseAndModify(child, modifier));
  }

  return node;
}

/**
 * 主生成函数
 * @param {string} text - 用户输入文本
 * @param {Object|null} currentDesignJson - 当前设计稿（如果有）
 * @returns {Object} 生成的 Design JSON
 */
function generateDesignJson(text, currentDesignJson = null) {
  // 解析用户意图
  const intent = parseIntent(text);
  intent.text = text;

  // 如果有当前设计稿且是修改操作，则修改现有设计稿
  if (currentDesignJson && intent.isModification) {
    return modifyDesignJson(currentDesignJson, intent);
  }

  // 否则创建新的设计稿
  return createNewDesignJson(intent);
}

/**
 * 根据用户输入生成历史记录标题
 * @param {string} text - 用户输入文本
 * @param {string} moduleType - 模块类型
 * @param {number} imageCount - 图片数量
 * @returns {string} 生成的标题
 */
function generateHistoryTitle(text, moduleType, imageCount = 0) {
  if (!text || text.trim().length === 0) {
    if (moduleType === 'image-to-design') {
      return imageCount > 1 ? `图片设计 (${imageCount}张)` : '图片设计';
    }
    return '新对话';
  }

  const trimmedText = text.trim();
  
  // 如果输入很短（<=20字符），直接用作标题
  if (trimmedText.length <= 20) {
    return trimmedText;
  }
  
  // 提取关键词生成标题
  const intent = parseIntent(trimmedText);
  
  // 根据页面类型生成标题
  if (intent.pageType) {
    const typeMap = {
      '登录': '登录页面',
      '注册': '注册页面',
      '仪表盘': '数据仪表盘',
      '首页': '网站首页',
      '卡片': '卡片列表',
      '列表': '列表页面',
      '导航': '导航页面',
      '表单': '表单页面'
    };
    
    if (typeMap[intent.pageType]) {
      return typeMap[intent.pageType];
    }
  }
  
  // 根据操作类型生成标题
  if (intent.isModification) {
    if (intent.colors.length > 0) {
      return `样式调整 - ${trimmedText.substring(0, 15)}...`;
    }
    if (intent.actions.includes('添加') || intent.components.length > 0) {
      return `添加组件 - ${trimmedText.substring(0, 15)}...`;
    }
    return `修改设计 - ${trimmedText.substring(0, 15)}...`;
  }
  
  // 默认截取前20个字符
  return trimmedText.substring(0, 20) + (trimmedText.length > 20 ? '...' : '');
}

module.exports = {
  generateDesignJson,
  generateHistoryTitle,
  parseIntent,
  createLoginPage,
  createRegisterPage,
  createDashboardPage,
  createCardListPage,
  COLOR_MAP,
  KEYWORDS
};
