/**
 * Design JSON 类型定义
 * 用于AI代码生成系统的可视化编辑器
 */

// ==================== 基础类型定义 ====================

/**
 * 尺寸类型：可以是数字(px)或百分比字符串
 * @example 100 | "100%" | "auto"
 */
export type Dimension = number | string;

/**
 * 颜色类型
 * @example "#1890ff" | "rgb(24, 144, 255)" | "rgba(24, 144, 255, 0.5)"
 */
export type Color = string;

/**
 * 间距类型：[上, 右, 下, 左]
 * @example [10, 20, 10, 20] // 上10px, 右20px, 下10px, 左20px
 */
export type Spacing = [number, number, number, number];

/**
 * Flex对齐方式
 */
export type FlexAlign = 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'stretch';

/**
 * Flex方向
 */
export type FlexDirection = 'row' | 'column' | 'row-reverse' | 'column-reverse';

/**
 * 显示类型
 */
export type DisplayType = 'flex' | 'block' | 'inline' | 'inline-block' | 'none';

/**
 * 定位类型
 */
export type PositionType = 'static' | 'relative' | 'absolute' | 'fixed';

/**
 * 边框样式
 */
export type BorderStyle = 'solid' | 'dashed' | 'dotted' | 'none';

/**
 * 文本对齐方式
 */
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

/**
 * 字体粗细
 */
export type FontWeight = 'normal' | 'bold' | number;

/**
 * Flex换行
 */
export type FlexWrap = 'nowrap' | 'wrap' | 'wrap-reverse';

/**
 * 溢出处理
 */
export type OverflowType = 'visible' | 'hidden' | 'scroll' | 'auto';

/**
 * 光标类型
 */
export type CursorType = 'default' | 'pointer' | 'text' | 'move' | 'not-allowed';

// ==================== 组件类型枚举 ====================

/**
 * 组件类型
 */
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

/**
 * 框架类型
 */
export type FrameworkType = 'react' | 'vue' | 'html';

// ==================== 样式系统 ====================

/**
 * 组件样式接口
 */
export interface ComponentStyle {
  // ========== 布局属性 ==========
  /** 显示类型 */
  display?: DisplayType;
  /** Flex方向 */
  flexDirection?: FlexDirection;
  /** 主轴对齐方式 */
  justifyContent?: FlexAlign;
  /** 交叉轴对齐方式 */
  alignItems?: FlexAlign;
  /** Flex换行 */
  flexWrap?: FlexWrap;
  /** 子元素间距 */
  gap?: number;
  
  // ========== 尺寸属性 ==========
  /** 宽度 */
  width?: Dimension;
  /** 高度 */
  height?: Dimension;
  /** 最小宽度 */
  minWidth?: Dimension;
  /** 最小高度 */
  minHeight?: Dimension;
  /** 最大宽度 */
  maxWidth?: Dimension;
  /** 最大高度 */
  maxHeight?: Dimension;
  
  // ========== 间距属性 ==========
  /** 内边距 [上, 右, 下, 左] */
  padding?: Spacing;
  /** 外边距 [上, 右, 下, 左] */
  margin?: Spacing;
  
  // ========== 外观属性 ==========
  /** 背景色 */
  backgroundColor?: Color;
  /** 背景图片 */
  backgroundImage?: string;
  /** 圆角 */
  borderRadius?: number;
  /** 边框（简写） */
  border?: string;
  /** 边框宽度 */
  borderWidth?: number;
  /** 边框颜色 */
  borderColor?: Color;
  /** 边框样式 */
  borderStyle?: BorderStyle;
  /** 阴影 */
  boxShadow?: string;
  
  // ========== 文本属性 ==========
  /** 文字颜色 */
  color?: Color;
  /** 字体大小 */
  fontSize?: number;
  /** 字体粗细 */
  fontWeight?: FontWeight;
  /** 字体家族 */
  fontFamily?: string;
  /** 文本对齐 */
  textAlign?: TextAlign;
  /** 行高 */
  lineHeight?: number;
  /** 字间距 */
  letterSpacing?: number;
  
  // ========== 定位属性 ==========
  /** 定位类型 */
  position?: PositionType;
  /** 顶部距离 */
  top?: number;
  /** 右侧距离 */
  right?: number;
  /** 底部距离 */
  bottom?: number;
  /** 左侧距离 */
  left?: number;
  /** 层级 */
  zIndex?: number;
  
  // ========== 变换属性 ==========
  /** 透明度 0-1 */
  opacity?: number;
  /** 变换 */
  transform?: string;
  /** 过渡动画 */
  transition?: string;
  /** 光标样式 */
  cursor?: CursorType;
  /** 溢出处理 */
  overflow?: OverflowType;
}

// ==================== 组件节点 ====================

/**
 * 组件节点元数据
 */
export interface ComponentMetadata {
  /** 组件描述 */
  description?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

/**
 * 组件节点接口
 */
export interface ComponentNode {
  /** 唯一标识 */
  id: string;
  
  /** 组件类型 */
  type: ComponentType;
  
  /** 组件名称（用于显示） */
  name?: string;
  
  /** 样式属性 */
  style: ComponentStyle;
  
  // ========== 内容属性（根据类型不同） ==========
  /** 文本/按钮内容 */
  content?: string;
  /** 输入框占位符 */
  placeholder?: string;
  /** 图片地址 */
  src?: string;
  /** 图片替代文本 */
  alt?: string;
  /** 图标名称 */
  iconName?: string;
  
  // ========== 交互属性 ==========
  /** 点击事件（预留） */
  onClick?: string;
  /** 是否禁用 */
  disabled?: boolean;
  
  /** 子组件（容器类型才有） */
  children?: ComponentNode[];
  
  /** 元数据 */
  metadata?: ComponentMetadata;
}

// ==================== Design JSON 根节点 ====================

/**
 * 视口配置
 */
export interface ViewportConfig {
  width?: number;
  height?: number;
}

/**
 * Design JSON 元数据
 */
export interface DesignJSONMetadata {
  /** 页面标题 */
  title?: string;
  /** 页面描述 */
  description?: string;
  /** 作者 */
  author?: string;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 视口配置 */
  viewport?: ViewportConfig;
}

/**
 * 主题配置
 */
export interface ThemeConfig {
  /** 颜色变量 */
  colors?: Record<string, Color>;
  /** 字体变量 */
  fonts?: Record<string, string>;
  /** 间距变量 */
  spacing?: Record<string, number>;
}

/**
 * Design JSON 根接口
 */
export interface DesignJSON {
  /** 版本号 */
  version: '1.0';
  
  /** 文档类型 */
  type: 'design-json';
  
  /** 页面元数据 */
  metadata: DesignJSONMetadata;
  
  /** 全局样式变量 */
  theme?: ThemeConfig;
  
  /** 根节点（页面节点） */
  root: ComponentNode;
}

// ==================== 代码生成相关类型 ====================

/**
 * 代码文件
 */
export interface CodeFile {
  /** 文件路径 */
  path: string;
  /** 文件内容 */
  content: string;
  /** 语言类型 */
  language: string;
}

/**
 * 生成的代码结果
 */
export interface GeneratedCode {
  /** 框架类型 */
  framework: FrameworkType;
  /** 文件列表 */
  files: CodeFile[];
}

// ==================== 历史记录相关类型 ====================

/**
 * 历史记录类型
 */
export type HistoryType = 'text-to-design' | 'image-to-design' | 'design-to-code';

/**
 * 历史记录数据
 */
export interface HistoryRecord {
  /** 记录ID */
  _id?: string;
  /** 用户ID */
  userId?: string;
  /** 记录类型 */
  type: HistoryType;
  /** 用户输入 */
  input?: string;
  /** 图片URL */
  imageUrl?: string;
  /** Design JSON */
  designJson?: DesignJSON;
  /** 生成的代码 */
  codeResult?: GeneratedCode;
  /** 框架类型 */
  framework?: FrameworkType;
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
}

// ==================== 编辑器状态类型 ====================

/**
 * 选中状态
 */
export interface SelectionState {
  /** 选中的节点ID */
  selectedId: string | null;
  /** 选中的节点数据 */
  selectedNode: ComponentNode | null;
  /** 多选模式 */
  isMultiSelect: boolean;
  /** 选中的多个节点ID */
  selectedIds: string[];
}

/**
 * 拖拽状态
 */
export interface DragState {
  /** 是否正在拖拽 */
  isDragging: boolean;
  /** 拖拽源ID */
  dragSource: string | null;
  /** 拖拽目标ID */
  dragTarget: string | null;
  /** 拖拽类型 */
  dragType: 'move' | 'resize' | 'add' | null;
}

/**
 * 画布状态
 */
export interface CanvasState {
  /** 缩放比例 */
  zoom: number;
  /** 是否显示网格 */
  showGrid: boolean;
  /** 是否吸附网格 */
  snapToGrid: boolean;
  /** 网格大小 */
  gridSize: number;
}

/**
 * 编辑器状态
 */
export interface EditorState {
  /** 当前Design JSON */
  designJson: DesignJSON | null;
  /** 选中状态 */
  selection: SelectionState;
  /** 拖拽状态 */
  drag: DragState;
  /** 画布状态 */
  canvas: CanvasState;
  /** 编辑历史 */
  history: DesignJSON[];
  /** 历史索引 */
  historyIndex: number;
}

// ==================== 工具函数类型 ====================

/**
 * 节点查找结果
 */
export interface NodeFindResult {
  /** 找到的节点 */
  node: ComponentNode | null;
  /** 父节点 */
  parent: ComponentNode | null;
  /** 节点在父节点children中的索引 */
  index: number;
  /** 节点路径（ID数组） */
  path: string[];
}

/**
 * 样式转换选项
 */
export interface StyleConvertOptions {
  /** 是否添加单位 */
  addUnit?: boolean;
  /** 单位类型 */
  unit?: 'px' | 'rem' | 'em';
  /** 是否处理响应式 */
  responsive?: boolean;
}

export default DesignJSON;
