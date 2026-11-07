# 04｜模板系统与设计原则

## 1. 模板系统目标

模板提供可靠的构图起点和有意义的可编辑空间。每个模板应是原创视觉系统，避免复制特定专辑封面、艺人宣传照、商标、独特字标或可识别的受保护作品构图。

## 2. 模板数据模型（概念）

```ts
type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  categories: string[];
  canvas: { width: number; height: number; background: string };
  previewAsset: string;
  layers: LayerDefinition[];
  modes: { quick: string[]; free: string[] };
  export: { format: "png"; width: number; height: number };
  assetCredits: AssetCredit[];
};

type LayerDefinition =
  | { id: string; type: "text"; label: string; defaultText: string;
      maxLength: number; x: number; y: number; fontToken: string;
      color: string; editable: boolean }
  | { id: string; type: "image"; label: string; x: number; y: number;
      width: number; height: number; fit: "cover" | "contain";
      editable: boolean }
  | { id: string; type: "shape"; label: string; geometry: string;
      fill: string; editable: boolean };
```

实现时应以实际选定的渲染方案调整 schema，避免把实现类型直接暴露给用户。

## 3. 模板创建规则

- 每个模板有唯一的原创构图概念、配色、排版和名称；不得仅替换艺人名复制商业封面。
- 模板封面、预览图和默认文字均由项目原创或有明确许可。
- 默认图片槽使用抽象图形/渐变/原创插画占位，不使用艺人肖像或封面图。
- 可编辑内容通过 schema 显式列出；锁定层不得包含不可用的“官方”元素。
- 设计多个宽容的文字长度范围；预览需处理换行、缩放、隐藏和溢出提示。
- 每个模板在桌面、手机和导出分辨率下均需检查。

## 4. 快速模式与自由模式

### 快速模式

- 只呈现完成模板所需的少数控件：标题、副标题、图片、主题变体。
- 用口语化标签与即时预览，不暴露坐标或图层结构。
- 提供安全默认值；用户可随时撤销或恢复默认。

### 自由模式

- 提供图层选择、拖动、位置/字号/颜色微调及图片焦点控制。
- 控件有明确范围和单位；支持键盘替代操作，避免只有拖拽可用。
- 保留画布边界与对齐辅助；不承诺完整专业级图层管理。

## 5. 视觉与交互基线

- 视觉气质：独立音乐杂志、粉丝剪贴簿与现代网页工具的混合；原创字体组合和图形语言。
- 作品画布是视觉中心；编辑器控件保持简洁，不与作品争夺注意力。
- 使用明显的按钮层级、清楚的 hover/focus/disabled 状态和足够对比度。
- 关键动作可逆；删除图片、重置等操作需明确反馈。
- 字体文件必须确认网页嵌入和再分发许可；MVP 可使用有合适许可的系统字体或开放字体。

## 6. Through the Window 模板

- 模板 ID 为 `through-window`，分类值与模板库筛选标签一致：`Through the Window`。
- 以 RAYE 的 *This Music May Contain Hope.* 专辑封面作为完整底图；编辑器标题采用正式专辑名 `RAYE · This Music May Contain Hope.`。高分辨率原图通过 [MusicBrainz Cover Art Archive](https://musicbrainz.org/release/d174af14-93f2-475a-a649-76fbfda4798b/cover-art) 引用，随项目保留用户提供封面的裁切版本作为离线及载入失败备用素材。
- 右上方打开的书本和蓝色封面区域保留为固定构图；该蓝色区域是独立内容区。默认保持专辑原图和原有封面文字。
- 窗内使用 `windowMode` 互斥切换 `text` 与 `image`。文本来自 `windowText`（最多 72 字符），图片来自专用 `windowImageObject` 与本地 Object URL；它们不复用通用图片槽。
- 用户输入非空文字时，用书页背景色覆盖书本封面区域并排字；按单词优先换行，长文本自动缩字号，并支持字体、字号、对齐方式和背景色。图片按 cover 裁切并限制在书本封面轮廓内。文本为空或图片未上传时保留原图内容。
- 图片读取失败、替换、移除和模板重置均清理独立状态。窗口文字/图片控件与字体、字号、书页背景色选项只在此模板快速编辑面板内出现；通用标题/主图控件不显示。
- 卡片预览、编辑器和 PNG 导出调用同一封面绘制函数，保持底图和窗内内容一致。

封面本地素材：RAYE 原图 `assets/raye-this-music-may-contain-hope.jpg`（2000 × 2000），Midnights 原图 `assets/taylor-swift-midnights-cover.jpg`（3000 × 3000）。二者取自各自的 [Cover Art Archive 条目](https://musicbrainz.org/release/d174af14-93f2-475a-a649-76fbfda4798b/cover-art) 与 [Midnights 条目](https://musicbrainz.org/release/1f092b12-eabf-4486-9470-ac0ed5aa185d/cover-art)，作为同源本地素材使用以保证画布和 PNG 导出不受跨域限制。用户提供的 675 × 675 裁切图保留为 RAYE 封面载入失败时的备用素材。

Midnights 卡片使用完整 3000 × 3000 原始封面，并在宽卡片预览中等比完整显示，不裁切边缘。

