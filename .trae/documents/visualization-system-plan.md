# AI代码生成系统 - 可视化编辑模块实施计划

## 项目背景

基于已有的毕设系统，已完成：
- ✅ 基础框架搭建（React + Express）
- ✅ 用户系统（注册、登录、JWT认证）
- ✅ 历史记录管理
- ✅ 基础AI接口（伪数据）
- ✅ 简单的Design JSON渲染

**当前缺失核心功能**：
1. 完善的Design JSON数据结构规范
2. 可视化编辑器（低代码平台式交互）
3. 属性面板（实时编辑组件属性）
4. 代码预览与生成

---

## 第一部分：Design JSON 数据规范设计

### 1.1 核心设计理念

```
┌─────────────────────────────────────────────────────────────┐
│                    Design JSON 架构                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   ┌──────────────┐      ┌──────────────┐                   │
│   │   页面节点    │─────▶│   组件节点    │                   │
│   │   (Page)     │      │  (Component) │                   │
│   └──────────────┘      └──────┬───────┘                   │
│                                │                            │
│                                ▼                            │
│                         ┌──────────────┐                   │
│                         │   样式系统    │                   │
│                         │   (Style)    │                   │
│                         └──────────────┘                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 完整数据结构定义

```typescript
// ==================== 基础类型定义 ====================

// 尺寸类型：可以是数字(px)或百分比字符串
export type Dimension = number | string;

// 颜色类型
export type Color = string;

// 间距类型：[上, 右, 下, 左]
export type Spacing = [number, number, number, number];

// Flex对齐方式
export type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'stretch';

// 组件类型
export type ComponentType = 
  | 'page'        // 页面根节点
  | 'container'   // 容器（Flex布局）
  | 'text'        // 文本
  | 'button'      // 按钮
  | 'image'       // 图片
  | 'input'       // 输入框
  | 'card'        // 卡片
  | 'divider'     // 分割线
  | 'icon';       // 图标

// ==================== 样式系统 ====================

export interface ComponentStyle {
  // 布局属性
  display?: 'flex' | 'block' | 'inline' | 'none';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: FlexAlign;
  alignItems?: FlexAlign;
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number;
  
  // 尺寸属性
  width?: Dimension;
  height?: Dimension;
  minWidth?: Dimension;
  minHeight?: Dimension;
  maxWidth?: Dimension;
  maxHeight?: Dimension;
  
  // 间距属性
  padding?: Spacing;      // [上, 右, 下, 左]
  margin?: Spacing;       // [上, 右, 下, 左]
  
  // 外观属性
  backgroundColor?: Color;
  backgroundImage?: string;
  borderRadius?: number;
  border?: string;
  borderWidth?: number;
  borderColor?: Color;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  
  // 阴影
  boxShadow?: string;
  
  // 文本属性
  color?: Color;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold' | number;
  fontFamily?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  lineHeight?: number;
  letterSpacing?: number;
  
  // 定位属性
  position?: 'static' | 'relative' | 'absolute' | 'fixed';
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
  zIndex?: number;
  
  // 变换属性
  opacity?: number;
  transform?: string;
  transition?: string;
  cursor?: string;
  overflow?: 'visible' | 'hidden' | 'scroll' | 'auto';
}

// ==================== 组件节点 ====================

export interface ComponentNode {
  // 唯一标识
  id: string;
  
  // 组件类型
  type: ComponentType;
  
  // 组件名称（用于显示）
  name?: string;
  
  // 样式属性
  style: ComponentStyle;
  
  // 内容属性（根据类型不同）
  content?: string;           // 文本/按钮内容
  placeholder?: string;       // 输入框占位符
  src?: string;               // 图片地址
  alt?: string;               // 图片替代文本
  iconName?: string;          // 图标名称
  
  // 交互属性
  onClick?: string;           // 点击事件（预留）
  disabled?: boolean;         // 是否禁用
  
  // 子组件（容器类型才有）
  children?: ComponentNode[];
  
  // 元数据
  metadata?: {
    description?: string;     // 组件描述
    createdAt?: string;       // 创建时间
    updatedAt?: string;       // 更新时间
  };
}

// ==================== Design JSON 根节点 ====================

export interface DesignJSON {
  // 版本号
  version: '1.0';
  
  // 文档类型
  type: 'design-json';
  
  // 页面元数据
  metadata: {
    title?: string;           // 页面标题
    description?: string;     // 页面描述
    author?: string;          // 作者
    createdAt?: string;       // 创建时间
    updatedAt?: string;       // 更新时间
    viewport?: {
      width?: number;
      height?: number;
    };
  };
  
  // 全局样式变量
  theme?: {
    colors?: Record<string, Color>;
    fonts?: Record<string, string>;
    spacing?: Record<string, number>;
  };
  
  // 根节点（页面节点）
  root: ComponentNode;
}
```

### 1.3 示例 Design JSON

```json
{
  "version": "1.0",
  "type": "design-json",
  "metadata": {
    "title": "登录页面",
    "description": "用户登录界面",
    "createdAt": "2024-03-21T10:00:00Z"
  },
  "theme": {
    "colors": {
      "primary": "#1890ff",
      "secondary": "#52c41a",
      "text": "#333333",
      "textSecondary": "#666666",
      "background": "#f5f5f5",
      "border": "#d9d9d9"
    }
  },
  "root": {
    "id": "page-001",
    "type": "page",
    "name": "登录页",
    "style": {
      "width": "100%",
      "minHeight": "100vh",
      "backgroundColor": "#f5f5f5",
      "padding": [0, 0, 0, 0],
      "display": "flex",
      "justifyContent": "center",
      "alignItems": "center"
    },
    "children": [
      {
        "id": "card-001",
        "type": "card",
        "name": "登录卡片",
        "style": {
          "width": 400,
          "padding": [32, 32, 32, 32],
          "backgroundColor": "#ffffff",
          "borderRadius": 8,
          "boxShadow": "0 4px 12px rgba(0,0,0,0.1)"
        },
        "children": [
          {
            "id": "title-001",
            "type": "text",
            "name": "标题",
            "content": "欢迎登录",
            "style": {
              "fontSize": 28,
              "fontWeight": "bold",
              "color": "#333333",
              "textAlign": "center",
              "margin": [0, 0, 24, 0]
            }
          },
          {
            "id": "input-001",
            "type": "input",
            "name": "用户名输入框",
            "placeholder": "请输入用户名",
            "style": {
              "width": "100%",
              "height": 40,
              "padding": [0, 12, 0, 12],
              "border": "1px solid #d9d9d9",
              "borderRadius": 4,
              "margin": [0, 0, 16, 0],
              "fontSize": 14
            }
          },
          {
            "id": "input-002",
            "type": "input",
            "name": "密码输入框",
            "placeholder": "请输入密码",
            "style": {
              "width": "100%",
              "height": 40,
              "padding": [0, 12, 0, 12],
              "border": "1px solid #d9d9d9",
              "borderRadius": 4,
              "margin": [0, 0, 24, 0],
              "fontSize": 14
            }
          },
          {
            "id": "btn-001",
            "type": "button",
            "name": "登录按钮",
            "content": "登录",
            "style": {
              "width": "100%",
              "height": 40,
              "backgroundColor": "#1890ff",
              "color": "#ffffff",
              "border": "none",
              "borderRadius": 4,
              "fontSize": 16,
              "fontWeight": "bold",
              "cursor": "pointer"
            }
          }
        ]
      }
    ]
  }
}
```

---

## 第二部分：系统架构设计

### 2.1 可视化编辑器整体架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         可视化编辑器架构                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        预览画布 (Preview Canvas)                     │   │
│   │                                                                     │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │                    渲染引擎 (Renderer)                       │  │   │
│   │   │                                                              │  │   │
│   │   │    ┌─────────┐    ┌─────────┐    ┌─────────┐               │  │   │
│   │   │    │  Page   │───▶│  Card   │───▶│  Text   │               │  │   │
│   │   │    └─────────┘    └────┬────┘    └─────────┘               │  │   │
│   │   │                        │                                   │  │   │
│   │   │                        ▼                                   │  │   │
│   │   │                   ┌─────────┐                              │  │   │
│   │   │                   │ Button  │                              │  │   │
│   │   │                   └─────────┘                              │  │   │
│   │   │                                                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                     │   │
│   │   ┌─────────────────────────────────────────────────────────────┐  │   │
│   │   │              选中高亮层 (Selection Overlay)                  │  │   │
│   │   │                                                              │  │   │
│   │   │    • 选中边框高亮                                             │  │   │
│   │   │    • 拖拽手柄 (resize handles)                               │  │   │
│   │   │    • 悬浮工具栏                                               │  │   │
│   │   │                                                              │  │   │
│   │   └─────────────────────────────────────────────────────────────┘  │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     属性面板 (Property Panel)                        │   │
│   │                                                                     │   │
│   │   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │   │
│   │   │   布局属性   │  │   外观属性   │  │   文本属性   │                │   │
│   │   │  Layout     │  │   Style     │  │   Text      │                │   │
│   │   └─────────────┘  └─────────────┘  └─────────────┘                │   │
│   │                                                                     │   │
│   │   • 尺寸 (width/height)        • 背景色              • 内容         │   │
│   │   • Flex方向                   • 边框                • 字体大小     │   │
│   │   • 对齐方式                   • 圆角                • 颜色         │   │
│   │   • 间距 (gap)                 • 阴影                • 对齐         │   │
│   │   • 边距 (padding/margin)      • 透明度                              │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     组件库 (Component Library)                       │   │
│   │                                                                     │   │
│   │   ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐          │   │
│   │   │Container│ │  Text  │ │ Button │ │  Input │ │  Card  │          │   │
│   │   └────────┘ └────────┘ └────────┘ └────────┘ └────────┘          │   │
│   │                                                                     │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 状态管理设计

```typescript
// 编辑器状态
interface EditorState {
  // 当前Design JSON
  designJson: DesignJSON | null;
  
  // 选中状态
  selectedId: string | null;
  selectedNode: ComponentNode | null;
  
  // 拖拽状态
  isDragging: boolean;
  dragSource: string | null;
  dragTarget: string | null;
  
  // 编辑历史（用于撤销/重做）
  history: DesignJSON[];
  historyIndex: number;
  
  // 画布状态
  canvas: {
    zoom: number;           // 缩放比例
    showGrid: boolean;      // 是否显示网格
    snapToGrid: boolean;    // 是否吸附网格
  };
  
  // 预览状态
  preview: {
    mode: 'design' | 'code';
    device: 'desktop' | 'tablet' | 'mobile';
  };
}
```

---

## 第三部分：功能模块详细设计

### 3.1 模块一：Design JSON渲染引擎 (Renderer)

**功能描述**：将Design JSON递归渲染为可交互的React组件树

**核心功能**：
1. 递归渲染组件树
2. 应用样式系统
3. 处理组件嵌套
4. 支持事件绑定

**实现要点**：
```typescript
// 渲染引擎核心逻辑
const renderNode = (node: ComponentNode, depth: number = 0): React.ReactNode => {
  const { id, type, style, children, content } = node;
  
  // 转换样式对象为CSS属性
  const cssStyle = convertStyleToCSS(style);
  
  // 根据类型渲染不同组件
  switch (type) {
    case 'container':
      return (
        <div key={id} style={cssStyle} data-node-id={id}>
          {children?.map(child => renderNode(child, depth + 1))}
        </div>
      );
    case 'text':
      return <div key={id} style={cssStyle} data-node-id={id}>{content}</div>;
    case 'button':
      return <button key={id} style={cssStyle} data-node-id={id}>{content}</button>;
    // ... 其他类型
  }
};
```

### 3.2 模块二：组件选中与交互系统

**功能描述**：实现组件的选中、拖拽、调整大小等交互

**核心功能**：
1. 点击选中组件
2. 多选支持（Ctrl+点击）
3. 拖拽调整位置
4. 拖拽调整大小
5. 键盘快捷键（Delete删除、Ctrl+Z撤销等）

**实现要点**：
```typescript
// 选中管理
const useSelection = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const selectNode = (id: string, multi: boolean = false) => {
    if (multi) {
      setSelectedIds(prev => 
        prev.includes(id) 
          ? prev.filter(i => i !== id)
          : [...prev, id]
      );
    } else {
      setSelectedIds([id]);
    }
  };
  
  return { selectedIds, selectNode };
};
```

### 3.3 模块三：属性面板 (Property Panel)

**功能描述**：根据选中的组件类型，动态展示可编辑的属性

**属性分类**：

| 分类 | 包含属性 | 适用组件 |
|------|----------|----------|
| 基础属性 | id, name, type | 所有组件 |
| 布局属性 | width, height, display, flexDirection, justifyContent, alignItems, gap | 容器类 |
| 间距属性 | padding, margin | 所有组件 |
| 外观属性 | backgroundColor, borderRadius, border, boxShadow, opacity | 所有组件 |
| 文本属性 | content, fontSize, fontWeight, color, textAlign | 文本类 |
| 图片属性 | src, alt, objectFit | 图片组件 |
| 交互属性 | onClick, disabled | 交互组件 |

**实现要点**：
```typescript
// 属性面板组件
const PropertyPanel = ({ selectedNode, onUpdate }) => {
  if (!selectedNode) return <EmptyState />;
  
  return (
    <div className="property-panel">
      <Section title="基础属性">
        <TextField label="名称" value={selectedNode.name} onChange={...} />
        <TextField label="ID" value={selectedNode.id} disabled />
      </Section>
      
      <Section title="布局属性">
        <DimensionInput label="宽度" value={selectedNode.style.width} onChange={...} />
        <DimensionInput label="高度" value={selectedNode.style.height} onChange={...} />
        <Select label="布局方向" value={selectedNode.style.flexDirection} options={...} />
      </Section>
      
      {/* 其他属性分组 */}
    </div>
  );
};
```

### 3.4 模块四：组件库 (Component Library)

**功能描述**：提供可拖拽的组件模板，支持向画布添加新组件

**组件列表**：

| 组件 | 默认样式 | 可配置属性 |
|------|----------|------------|
| Container | Flex布局容器 | 所有布局属性 |
| Text | 文本块 | 文本内容、字体样式 |
| Button | 按钮 | 背景色、文字、圆角 |
| Input | 输入框 | 占位符、边框样式 |
| Image | 图片 | 图片地址、填充模式 |
| Card | 卡片容器 | 阴影、圆角、背景色 |
| Divider | 分割线 | 颜色、粗细、边距 |
| Icon | 图标 | 图标名称、大小、颜色 |

### 3.5 模块五：编辑历史与撤销/重做

**功能描述**：记录编辑操作，支持撤销和重做

**实现要点**：
```typescript
// 历史管理
const useHistory = (initialState: DesignJSON) => {
  const [history, setHistory] = useState([initialState]);
  const [index, setIndex] = useState(0);
  
  const pushState = (newState: DesignJSON) => {
    const newHistory = history.slice(0, index + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setIndex(newHistory.length - 1);
  };
  
  const undo = () => index > 0 && setIndex(index - 1);
  const redo = () => index < history.length - 1 && setIndex(index + 1);
  
  return {
    state: history[index],
    pushState,
    undo,
    redo,
    canUndo: index > 0,
    canRedo: index < history.length - 1
  };
};
```

---

## 第四部分：实施任务清单

### Phase 1: Design JSON规范与基础渲染 (Day 1-3)

#### Task 1.1: 创建Design JSON类型定义文件
- **文件**: `front-end/src/types/design-json.ts`
- **内容**: 完整的TypeScript类型定义
- **优先级**: P0

#### Task 1.2: 重构DesignRenderer组件
- **文件**: `front-end/src/components/DesignRenderer/DesignRenderer.js` → `.tsx`
- **功能**:
  - 支持新的Design JSON格式
  - 递归渲染组件树
  - 样式系统转换
- **优先级**: P0

#### Task 1.3: 创建样式转换工具
- **文件**: `front-end/src/utils/styleConverter.js`
- **功能**: 将Design JSON样式转换为CSS样式对象
- **优先级**: P0

#### Task 1.4: 更新后端伪数据生成器
- **文件**: `back-end/routes/ai.js`
- **功能**: 生成符合新规范的Design JSON
- **优先级**: P1

### Phase 2: 组件选中与交互系统 (Day 4-6)

#### Task 2.1: 创建选中状态管理
- **文件**: `front-end/src/hooks/useSelection.js`
- **功能**: 管理组件选中状态
- **优先级**: P0

#### Task 2.2: 实现选中高亮效果
- **文件**: `front-end/src/components/SelectionOverlay/SelectionOverlay.js`
- **功能**:
  - 选中边框高亮
  - 组件名称标签
  - 悬浮工具栏（删除、复制）
- **优先级**: P0

#### Task 2.3: 实现点击选中功能
- **文件**: `front-end/src/components/DesignRenderer/DesignRenderer.js`
- **功能**: 点击组件触发选中
- **优先级**: P0

#### Task 2.4: 实现键盘快捷键
- **文件**: `front-end/src/hooks/useKeyboardShortcuts.js`
- **功能**:
  - Delete: 删除选中组件
  - Ctrl+Z: 撤销
  - Ctrl+Y/Ctrl+Shift+Z: 重做
  - Ctrl+C/Ctrl+V: 复制粘贴
- **优先级**: P1

### Phase 3: 属性面板实现 (Day 7-10)

#### Task 3.1: 创建属性面板容器
- **文件**: `front-end/src/components/PropertyPanel/PropertyPanel.js`
- **功能**: 属性面板整体布局和状态管理
- **优先级**: P0

#### Task 3.2: 实现基础属性编辑器
- **文件**: `front-end/src/components/PropertyPanel/BasicProperties.js`
- **属性**: id, name, type
- **优先级**: P0

#### Task 3.3: 实现布局属性编辑器
- **文件**: `front-end/src/components/PropertyPanel/LayoutProperties.js`
- **属性**: width, height, display, flexDirection, justifyContent, alignItems, gap
- **优先级**: P0

#### Task 3.4: 实现间距属性编辑器
- **文件**: `front-end/src/components/PropertyPanel/SpacingProperties.js`
- **属性**: padding, margin（支持四边独立设置）
- **优先级**: P0

#### Task 3.5: 实现外观属性编辑器
- **文件**: `front-end/src/components/PropertyPanel/AppearanceProperties.js`
- **属性**: backgroundColor, borderRadius, border, boxShadow, opacity
- **优先级**: P0

#### Task 3.6: 实现文本属性编辑器
- **文件**: `front-end/src/components/PropertyPanel/TextProperties.js`
- **属性**: content, fontSize, fontWeight, color, textAlign
- **优先级**: P1

#### Task 3.7: 创建通用表单组件
- **文件**: `front-end/src/components/PropertyPanel/inputs/`
- **组件**:
  - `ColorPicker.js` - 颜色选择器
  - `DimensionInput.js` - 尺寸输入（支持px/%）
  - `SpacingInput.js` - 间距输入（四边）
  - `Select.js` - 下拉选择
  - `TextArea.js` - 多行文本
- **优先级**: P0

### Phase 4: 组件库与拖拽系统 (Day 11-13)

#### Task 4.1: 创建组件库面板
- **文件**: `front-end/src/components/ComponentLibrary/ComponentLibrary.js`
- **功能**: 展示可用组件列表
- **优先级**: P0

#### Task 4.2: 实现组件模板定义
- **文件**: `front-end/src/constants/componentTemplates.js`
- **内容**: 各组件类型的默认配置
- **优先级**: P0

#### Task 4.3: 实现拖拽添加组件
- **文件**: `front-end/src/hooks/useDragAndDrop.js`
- **功能**: 从组件库拖拽到画布
- **优先级**: P1

#### Task 4.4: 实现点击添加组件
- **文件**: `front-end/src/components/ComponentLibrary/ComponentLibrary.js`
- **功能**: 点击组件添加到选中容器
- **优先级**: P0

### Phase 5: 编辑历史与撤销重做 (Day 14-15)

#### Task 5.1: 实现历史管理Hook
- **文件**: `front-end/src/hooks/useHistory.js`
- **功能**: 管理编辑历史状态
- **优先级**: P0

#### Task 5.2: 集成撤销重做到编辑器
- **文件**: `front-end/src/components/VisualEditor/VisualEditor.js`
- **功能**: 连接快捷键和UI按钮
- **优先级**: P0

#### Task 5.3: 添加编辑操作记录
- **文件**: 更新各属性编辑器组件
- **功能**: 每次修改自动记录历史
- **优先级**: P0

### Phase 6: 可视化编辑器整合 (Day 16-18)

#### Task 6.1: 创建可视化编辑器主组件
- **文件**: `front-end/src/components/VisualEditor/VisualEditor.js`
- **功能**: 整合所有子组件
- **优先级**: P0

#### Task 6.2: 更新预览区域
- **文件**: `front-end/src/components/PreviewArea/PreviewArea.js`
- **功能**: 集成可视化编辑器
- **优先级**: P0

#### Task 6.3: 更新Store状态管理
- **文件**: `front-end/src/store/store.js`
- **功能**: 添加可视化编辑相关状态
- **优先级**: P0

#### Task 6.4: 实现设计保存功能
- **文件**: `front-end/src/components/VisualEditor/VisualEditor.js`
- **功能**: 保存编辑后的Design JSON到历史记录
- **优先级**: P0

### Phase 7: 代码生成与预览优化 (Day 19-21)

#### Task 7.1: 优化代码生成器
- **文件**: `back-end/routes/ai.js`
- **功能**: 根据Design JSON生成更准确的代码
- **优先级**: P1

#### Task 7.2: 优化代码预览组件
- **文件**: `front-end/src/components/CodePreview/CodePreview.js`
- **功能**: 更好的代码展示和文件切换
- **优先级**: P1

#### Task 7.3: 实现代码运行预览
- **文件**: `front-end/src/components/CodePreview/CodeRunner.js`
- **功能**: 在iframe中运行生成的代码
- **优先级**: P2

### Phase 8: 测试与优化 (Day 22-25)

#### Task 8.1: 编写单元测试
- **文件**: `front-end/src/utils/__tests__/`
- **内容**: 样式转换、Design JSON操作等工具函数测试
- **优先级**: P1

#### Task 8.2: 集成测试
- **内容**: 端到端测试主要用户流程
- **优先级**: P1

#### Task 8.3: 性能优化
- **内容**: 优化渲染性能、减少不必要的重渲染
- **优先级**: P2

#### Task 8.4: UI/UX优化
- **内容**: 优化交互体验、添加动画效果
- **优先级**: P2

---

## 第五部分：文件结构规划

### 新增文件清单

```
front-end/src/
├── types/
│   └── design-json.ts              # Design JSON类型定义
├── utils/
│   ├── styleConverter.js           # 样式转换工具
│   ├── designJsonUtils.js          # Design JSON操作工具
│   └── nodePath.js                 # 节点路径查找工具
├── hooks/
│   ├── useSelection.js             # 选中状态管理
│   ├── useHistory.js               # 编辑历史管理
│   ├── useDragAndDrop.js           # 拖拽功能
│   └── useKeyboardShortcuts.js     # 键盘快捷键
├── constants/
│   └── componentTemplates.js       # 组件模板定义
└── components/
    ├── VisualEditor/               # 可视化编辑器主组件
    │   ├── VisualEditor.js
    │   ├── VisualEditor.css
    │   └── index.js
    ├── DesignRenderer/             # 渲染引擎（重构）
    │   ├── DesignRenderer.tsx
    │   ├── DesignRenderer.css
    │   └── index.js
    ├── SelectionOverlay/           # 选中高亮层
    │   ├── SelectionOverlay.js
    │   ├── SelectionOverlay.css
    │   └── index.js
    ├── PropertyPanel/              # 属性面板
    │   ├── PropertyPanel.js
    │   ├── PropertyPanel.css
    │   ├── BasicProperties.js
    │   ├── LayoutProperties.js
    │   ├── SpacingProperties.js
    │   ├── AppearanceProperties.js
    │   ├── TextProperties.js
    │   └── inputs/                 # 表单输入组件
    │       ├── ColorPicker.js
    │       ├── DimensionInput.js
    │       ├── SpacingInput.js
    │       ├── Select.js
    │       └── TextArea.js
    ├── ComponentLibrary/           # 组件库
    │   ├── ComponentLibrary.js
    │   ├── ComponentLibrary.css
    │   └── index.js
    └── CodePreview/                # 代码预览（优化）
        ├── CodeRunner.js
        └── CodeRunner.css
```

---

## 第六部分：关键技术决策

### 6.1 状态管理策略

```
┌─────────────────────────────────────────────────────────────┐
│                      状态分层管理                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  全局状态 (Store)              本地状态 (Component)          │
│  ────────────────              ───────────────────          │
│  • currentDesignJson           • selectedId                  │
│  • user                        • isDragging                  │
│  • token                       • panelCollapsed              │
│  • histories                   • localHistory                │
│                                                              │
│  为什么这样设计？                                             │
│  ─────────────────                                           │
│  • 选中状态是编辑器内部状态，不需要全局共享                    │
│  • Design JSON是核心数据，需要全局管理                        │
│  • 减少不必要的全局状态更新，提升性能                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 样式系统转换规则

```typescript
// Design JSON样式 → CSS样式的转换规则
const styleConversionRules = {
  // 尺寸：数字转为px，字符串保持原样
  width: (val) => typeof val === 'number' ? `${val}px` : val,
  height: (val) => typeof val === 'number' ? `${val}px` : val,
  
  // 间距：[上,右,下,左] → "上px 右px 下px 左px"
  padding: (val) => val.map(v => `${v}px`).join(' '),
  margin: (val) => val.map(v => `${v}px`).join(' '),
  
  // 颜色：保持原样（已经是字符串）
  backgroundColor: (val) => val,
  color: (val) => val,
  
  // Flex相关：保持原样
  display: (val) => val,
  flexDirection: (val) => val,
  justifyContent: (val) => val,
  alignItems: (val) => val,
  gap: (val) => `${val}px`,
  
  // 其他：数字转为px或直接保持
  fontSize: (val) => `${val}px`,
  borderRadius: (val) => `${val}px`,
  borderWidth: (val) => `${val}px`,
  opacity: (val) => val,  // 透明度是0-1的小数
};
```

### 6.3 性能优化策略

1. **虚拟化长列表**：如果组件树很深，考虑使用虚拟滚动
2. **防抖属性更新**：属性面板输入时使用防抖，减少重渲染
3. **Memoization**：使用React.memo和useMemo缓存渲染结果
4. **增量更新**：只更新变化的节点，不重新渲染整棵树

---

## 第七部分：验收标准

### 7.1 功能验收

- [ ] 可以正确渲染新的Design JSON格式
- [ ] 点击组件可以选中并显示高亮边框
- [ ] 属性面板可以显示选中组件的所有属性
- [ ] 修改属性可以实时反映在预览中
- [ ] 可以从组件库添加新组件
- [ ] 可以删除选中的组件
- [ ] 撤销/重做功能正常工作
- [ ] 编辑后的Design JSON可以保存到历史记录

### 7.2 技术验收

- [ ] 所有新增文件有完整的类型定义（TypeScript）
- [ ] 核心工具函数有单元测试
- [ ] 代码通过ESLint检查
- [ ] 没有明显的性能问题（渲染延迟<100ms）

### 7.3 用户体验验收

- [ ] 界面响应流畅，无明显卡顿
- [ ] 属性编辑有即时反馈
- [ ] 选中状态清晰可见
- [ ] 操作有明确的视觉反馈

---

## 第八部分：风险与应对

| 风险 | 可能性 | 影响 | 应对措施 |
|------|--------|------|----------|
| 递归渲染性能问题 | 中 | 高 | 使用虚拟化、减少不必要的重渲染 |
| 拖拽实现复杂 | 中 | 中 | 使用成熟的拖拽库如react-dnd |
| 样式转换边界情况 | 中 | 中 | 编写全面的测试用例 |
| 时间不足 | 中 | 高 | 优先完成核心功能，高级功能延后 |

---

## 总结

本计划将可视化编辑系统的实现分为8个阶段，共约25天。核心思路是：

1. **先规范，后实现**：先定义好Design JSON数据结构
2. **先基础，后高级**：先实现渲染和选中，再实现拖拽和高级功能
3. **先功能，后优化**：先保证功能完整，再进行性能优化

每个Task都有明确的文件路径和功能描述，可以直接开始实施。
