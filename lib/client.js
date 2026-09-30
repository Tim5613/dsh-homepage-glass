/**
 * dsh-homepage-palette-skin — Client half.
 *
 * 两件事：
 *   ① 皮肤本体：固定的深蓝渐变玻璃侧边栏（不跟随主题）+ 品牌蓝。
 *      只用 `theme` 服务与一张注入的样式表，**不依赖任何可选服务**，
 *      所以设置行那部分出问题也不会影响皮肤。
 *   ② （v1.1.0）「浅色内容配色」：右侧内容区在浅色模式下可选一层低眩光底色。
 *      配色从侧边栏的色相（H≈215°）推导，和左侧是同一套材质。
 *
 * ── 皮肤取值：全部来自对官网预览图的逐像素采样 ──────────────────────
 *   渐变      #3a4f6c → #3c4b61 → #414a56 → #3f454d → #3a3e47 → #393d45
 *   面板叠加  rgba(255,255,255,.085)（实测 8.5% 白）
 *   文字      #e6e8eb / 分区标题 ≈44% 白 (#9399a1)
 *
 * ── 踩过的坑 ────────────────────────────────────────────────────────
 *   1. 这套侧边栏 DSH 自带，但被 `[data-platform=darwin]` 锁死在 macOS。
 *   2. `.BynINW_sidebarCol` 里嵌着 ui-sidebar 的 SidebarRoot，自带
 *      `background:var(--dsw-specific-sidebar-fill)` 且 height:100% —— 不透明盖子。
 *      → 把该 token 在侧边栏子树内置为 transparent。
 *   3. 内容卡片左上 16px 圆角缺口会露出框架底色 → 框架底色设成卡片色。
 *   4. 自加的顶部高光会留亮带（实测 #6a7492）→ 已去掉。
 *   5. 只靠 backdrop-filter 不行（系统关透明效果时 Chromium 连模糊一起停用）。
 *   6. 标题栏硬切渐变的落点曾写成 `calc(W - 1px)`，比侧边栏右边缘少 1px，
 *      在 y=40 处留下台阶 → 直接用变量。
 *
 * ── 为什么着色只改 `--dsw-alias-bg-base` ─────────────────────────────
 * 框架、内容卡片、圆角缺口三者都用这一个 token；只改它，三者会一起变，
 * 缺口的隐形关系（坑 3）才不会被破坏。层表面（卡片）保持白色 → 浮在着色底上。
 */
window.__ModuleLoader__.load({
  id: "dsh-homepage-palette-skin",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const name = "dsh-homepage-palette-skin";
    /** 与宿主 lib/index.js 的 SETTINGS_NS 必须一致。 */
    const SETTINGS_NS = "dsh-homepage-palette-skin";
    /** 本插件设置行的文案名字空间。 */
    const LOCALE_NS = "dsh-homepage-palette-skin";

    /** 硬依赖只有 theme —— 皮肤必须先无条件下得来。 */
    const inject = ["theme"];

    //#region ① 皮肤本体
    /** 品牌蓝（官网 --ds-color-brand），随浅/深色各自取值。 */
    const TOKENS = {
      "--dsw-alias-brand-primary": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-brand-text": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-button-primary-fill": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-button-primary-hover": { light: "#3a65c2", dark: "#7aa6ff" },
      "--dsw-alias-button-info-fill": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-state-business-primary": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-interactive-bg-hover": { light: "#4d6bfe14", dark: "#6799fe1f" },
      "--dsw-alias-interactive-bg-active": { light: "#4d6bfe24", dark: "#6799fe30" }
    };

    /** 参考图实测的侧边栏渐变。 */
    const SIDEBAR_BG = [
      "linear-gradient(180deg,",
      "#3a4f6c 0%,",
      "#3c4b61 20%,",
      "#414a56 40%,",
      "#3f454d 60%,",
      "#3a3e47 80%,",
      "#393d45 100%)"
    ].join("");

    const SKIN_CSS = `
/* Electron 标题栏覆盖层（右上角三个按钮的底）跟着背景走 —— 详见 nudgeWindowsAppearance。
   preload 用一个隐藏 span 探针读 background-color:var(--dsw-specific-sidebar-fill)
   的 computed 值当作覆盖层底色，所以在浅色下把该 token 在 body 层级置为透明，
   覆盖层就变透明，流动背景/着色才能一直铺到右上角，不会缺一块。 */
body:not([data-ds-dark-theme]){--dsw-specific-sidebar-fill:transparent!important}
.BynINW_frame,[class*="BynINW_frame"]{background:var(--dsw-alias-bg-base)!important}
[data-windows-titlebar] [class*="BynINW_frame"]:before{
  background:linear-gradient(90deg,
    #3a4f6c 0,
    #3a4f6c var(--dsh-windows-sidebar-width,280px),
    rgba(0,0,0,0) var(--dsh-windows-sidebar-width,280px),
    rgba(0,0,0,0) 100%)!important;
}
[class*="sidebarCol"]{
  --dsw-specific-sidebar-fill:transparent!important;
  --dsw-alias-label-primary:#e6e8eb!important;
  /* 成对 token 必须成对翻：label-primary 被我改成浅色后，凡是拿它当**底色**、
     用 inverted 当**文字色**的组件（例如侧边栏的 HARNESS 版本徽标
     `_2H3hWW_buildVersion`）就会变成白字压浅底。 */
  --dsw-alias-label-primary-inverted:#333d4d!important;
  --dsw-alias-label-secondary:rgba(255,255,255,.86)!important;
  --dsw-alias-label-tertiary:rgba(255,255,255,.60)!important;
  --dsw-alias-label-caption:rgba(255,255,255,.44)!important;
  --dsw-alias-label-dimmed:rgba(255,255,255,.72)!important;
  --dsw-alias-bg-layer-1:rgba(255,255,255,.085)!important;
  --dsw-alias-bg-layer-2:rgba(255,255,255,.12)!important;
  --dsw-alias-border-l1:rgba(255,255,255,.10)!important;
  --dsw-alias-border-l2:rgba(255,255,255,.14)!important;
  --dsw-alias-border-l3:rgba(255,255,255,.14)!important;
  --dsw-alias-interactive-bg-hover:rgba(255,255,255,.07)!important;
  --dsw-alias-interactive-bg-active:rgba(255,255,255,.11)!important;
  --dsw-alias-interactive-bg-hover-solid:rgba(255,255,255,.10)!important;
  --dsw-specific-sidebar-nav-item-hover:rgba(255,255,255,.055)!important;
  --dsw-specific-sidebar-nav-item-active:rgba(255,255,255,.085)!important;
  --dsw-specific-sidebar-nav-item-active-accent:rgba(255,255,255,.10)!important;
  --dsw-alias-scrollbar-bg-l2:rgba(255,255,255,.18)!important;
  --dsw-alias-scrollbar-hover-l2:rgba(255,255,255,.30)!important;
  background:${SIDEBAR_BG}!important;
  border-right:none!important;
}
[class*="sidebarCol"] > *{background:transparent!important}
[class*="centerCol"],[class*="rightbarCol"]{background:var(--dsw-alias-bg-base)!important}
/* ── 浅色模式下侧边栏里两处「看不清」的修正 ─────────────────────────────
   ① 顶部 Windows 菜单（「应用 / 编辑」）：它是网页画的，在 shadow DOM 里，
      但按钮用的是 CSS 变量 —— 自定义属性会跨 shadow 边界继承，所以改宿主
      [data-windows-menu] 的 token 就能改它的文字色。它压在侧边栏的深蓝上，
      默认走浅色主题的深色字 → 深字压深蓝。只在侧边栏展开时改（收起时菜单
      会移到内容区上方，那时深色字才对）。 */
html[data-windows-titlebar]:not(:has([data-sidebar-collapsed="true"])) [data-windows-menu]{
  --dsw-alias-label-secondary:rgba(255,255,255,.86)!important;
  --dsw-alias-label-primary:#e6e8eb!important;
  --dsw-alias-interactive-bg-hover:rgba(255,255,255,.10)!important;
}
/* ② 「新会话」主按钮：浅色主题下它是不透明浅底，而本皮肤把侧边栏文字强制成
      浅色 → 浅底浅字。参考图里这个按钮实测就是 8.5% 白（#4d5b6f / #3d4c63），
      所以直接用侧边栏的 bg-layer-1（同为 8.5% 白）压回去，与参考图一致。
      只选 button，避开 newSessionLabel / newSessionContent 这些同名子元素。 */
button[class*="newSession"]{background:var(--dsw-alias-bg-layer-1)!important}
body{
  --dsw-alias-brand-primary:#4d6bfe!important;
  --dsw-alias-brand-text:#4d6bfe!important;
  --dsw-alias-button-primary-fill:#4d6bfe!important;
  --dsw-alias-button-primary-hover:#3a65c2!important;
  --dsw-alias-button-info-fill:#4d6bfe!important;
  --dsw-alias-state-business-primary:#4d6bfe!important;
}
body[data-ds-dark-theme]{
  --dsw-alias-brand-primary:#6799fe!important;
  --dsw-alias-brand-text:#6799fe!important;
  --dsw-alias-button-primary-fill:#6799fe!important;
  --dsw-alias-button-primary-hover:#7aa6ff!important;
  --dsw-alias-button-info-fill:#6799fe!important;
  --dsw-alias-state-business-primary:#6799fe!important;
}
`;
    //#endregion

    //#region ② 浅色内容配色
    /**
     * 档位。颜色由侧边栏的色相推导（H≈215°，与 #3a4f6c 同族），
     * 只把明度提到纸面区间 —— 既压住纯白的眩光，又不与左侧栏打架。
     * `bg: null` 表示不着色（交回 DSH 默认的 #fff）。
     */
    const TINTS = [
      { id: "default", key: "tint.default", bg: null, dot: "#ffffff" },
      {
        id: "flow",
        key: "tint.flow",
        flow: true,
        dot: "linear-gradient(135deg,#8aa3d6 0%,#c2d0ea 45%,#ffffff 100%)"
      },
      { id: "mist-1", key: "tint.mist-1", bg: "#f2f5f9", dot: "#f2f5f9" },
      { id: "mist-2", key: "tint.mist-2", bg: "#e9eef6", dot: "#e9eef6" },
      { id: "mist-3", key: "tint.mist-3", bg: "#dee5ef", dot: "#dee5ef" }
    ];

    const zh = {
      "tint.title": "浅色内容配色",
      "tint.desc": "只影响右侧内容区，仅浅色模式生效；与左侧栏同一色系",
      "tint.default": "默认",
      "tint.flow": "官网流动",
      "tint.mist-1": "雾蓝 · 淡",
      "tint.mist-2": "雾蓝 · 中",
      "tint.mist-3": "雾蓝 · 深"
    };
    const en = {
      "tint.title": "Light content tint",
      "tint.desc": "Content area only, light mode; same hue family as the sidebar",
      "tint.default": "Default",
      "tint.flow": "Homepage flow",
      "tint.mist-1": "Mist · light",
      "tint.mist-2": "Mist · mid",
      "tint.mist-3": "Mist · deep"
    };

    const ROW_CSS = `
.dhps_row{display:flex;align-items:center;gap:8px;padding:16px 0;border-bottom:.5px solid var(--dsw-alias-border-l2)}
.dhps_rowText{display:flex;flex-direction:column;flex:1;gap:4px;min-width:0;padding-right:48px}
.dhps_title{color:var(--dsw-alias-label-primary);font-size:14px;font-weight:400;line-height:22px}
.dhps_desc{color:var(--dsw-alias-label-tertiary);font-size:12px;font-weight:400;line-height:18px}
.dhps_swatches{display:inline-flex;align-items:center;gap:8px}
.dhps_swatch{box-sizing:border-box;width:34px;height:34px;padding:0;border-radius:var(--dsw-radius-md);border:.5px solid var(--dsw-alias-border-l4);background:0 0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
.dhps_swatch:hover:not(.dhps_swatchSelected){background:var(--dsw-alias-interactive-bg-hover)}
.dhps_swatchSelected{border-color:var(--dsw-static-neutral-bluish-400)}
.dhps_dot{display:block;width:20px;height:20px;border-radius:var(--dsw-radius-sm);border:.5px solid var(--dsw-alias-border-l3)}
`;

    /**
     * 官网首页那层「缓慢流动的蓝」的 CSS 近似。
     *
     * 官网实现是 WebGL —— `type:"pattern"` 着色器，配置实测为：
     *   colors ["#8AA3D6","#FFFFFF","#FFFFFF"], speed 14, swirl 12,
     *   distortion 20, scale .5, shape "checks", shapeScale 10, offsetY 65
     * 时间在着色器里是 `t = .5 * (ms*.001 * speed/100)` ≈ 0.07 秒/秒，很慢。
     * 外层还有个向下淡出的遮罩：`linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%)`。
     *
     * CSS 近似的三个要点：
     *   ① 遮罩只能加在伪元素上 —— 加在内容列自身会把**子内容一起淡掉**。
     *   ② 伪元素用 `z-index:-1`：它画在内容列背景之上、正文之下。因此内容列
     *      自身必须透明，底色交给框架。
     *   ③ 框架与伪元素铺**同一张按视口尺寸的图**（`background-size:100vw 100vh`），
     *      伪元素再左移一个侧边栏宽度 —— 两者在同一坐标系里严丝合缝，内容卡片
     *      左上 16px 圆角缺口处不会露出色差。
     *   ④ 「流动」用 transform 位移（合成器加速）；用 background-position 会每帧
     *      整块重绘。mask 是垂直的、位移是水平的，所以淡出位置不会跟着跑。
     */
    /** 官网原版顶点着色器（全屏四边形）。 */
    const FLOW_VERT = `#version 300 es
in vec4 a_position;
void main() {
  gl_Position = a_position;
}
`;

    /** 官网首页 pattern 片段着色器 —— 从 www.deepseek.com 首页 bundle 逐字提取，未做改动。 */
    const FLOW_FRAG = `#version 300 es
precision mediump float;

uniform float u_time;
uniform float u_pixelRatio;
uniform vec2 u_resolution;

uniform float u_scale;
uniform float u_rotation;
uniform vec4 u_color1;
uniform vec4 u_color2;
uniform vec4 u_color3;
uniform vec4 u_color4;
uniform vec4 u_color5;
uniform vec4 u_color6;
uniform float u_colorCount;
uniform float u_grain;
uniform float u_proportion;
uniform float u_softness;
uniform float u_shape;
uniform float u_shapeScale;
uniform float u_distortion;
uniform float u_swirl;
uniform float u_swirlIterations;
uniform vec2 u_offset;

out vec4 fragColor;

#define TWO_PI 6.28318530718
#define PI 3.14159265358979323846

vec2 rotate(vec2 uv, float th) {
  return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
}

float random(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
}

float noise(vec2 st) {
  vec2 i = floor(st);
  vec2 f = fract(st);
  float a = random(i);
  float b = random(i + vec2(1.0, 0.0));
  float c = random(i + vec2(0.0, 1.0));
  float d = random(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  float x1 = mix(a, b, u.x);
  float x2 = mix(c, d, u.x);
  return mix(x1, x2, u.y);
}

vec3 blend_multi(float mixer, float softness) {
  float edge = 1.0 - softness;
  vec3 col = u_color1.rgb;
  if (u_colorCount > 1.5) {
    float r1 = smoothstep(0.0 + 0.35 * edge, 0.7 - 0.35 * edge, mixer);
    col = mix(col, u_color2.rgb, r1);
  }
  if (u_colorCount > 2.5) {
    float r2 = smoothstep(0.3 + 0.35 * edge, 1.0 - 0.35 * edge, mixer);
    col = mix(col, u_color3.rgb, r2);
  }
  if (u_colorCount > 3.5) {
    col = mix(col, u_color4.rgb, smoothstep(0.4, 0.75, mixer));
  }
  if (u_colorCount > 4.5) {
    col = mix(col, u_color5.rgb, smoothstep(0.55, 0.85, mixer));
  }
  if (u_colorCount > 5.5) {
    col = mix(col, u_color6.rgb, smoothstep(0.7, 0.95, mixer));
  }
  return col;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  float t = .5 * u_time;
  float noise_scale = .0005 + .006 * u_scale;

  uv -= .5;
  uv *= (noise_scale * u_resolution);
  uv = rotate(uv, u_rotation * .5 * PI);
  uv /= u_pixelRatio;
  uv += .5;
  uv += u_offset;

  float n1 = noise(uv * 1. + t);
  float n2 = noise(uv * 2. - t);
  float angle = n1 * TWO_PI;
  uv.x += 4. * u_distortion * n2 * cos(angle);
  uv.y += 4. * u_distortion * n2 * sin(angle);

  float iterations_number = ceil(clamp(u_swirlIterations, 1., 30.));
  for (float i = 1.; i <= 30.0; i++) {
    if (i > iterations_number) break;
    uv.x += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1.5 * uv.y);
    uv.y += clamp(u_swirl, 0., 2.) / i * cos(t + i * 1. * uv.x);
  }

  float proportion = clamp(u_proportion, 0., 1.);

  float shape = 0.;
  float mixer = 0.;
  if (u_shape < .5) {
    vec2 checks_shape_uv = uv * (.5 + 3.5 * u_shapeScale);
    shape = .5 + .5 * sin(checks_shape_uv.x) * cos(checks_shape_uv.y);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else if (u_shape < 1.5) {
    vec2 stripes_shape_uv = uv * (.25 + 3. * u_shapeScale);
    float f = fract(stripes_shape_uv.y);
    shape = smoothstep(.0, .55, f) * smoothstep(1., .45, f);
    mixer = shape + .48 * sign(proportion - .5) * pow(abs(proportion - .5), .5);
  } else {
    float sh = 1. - uv.y;
    sh -= .5;
    sh /= (noise_scale * u_resolution.y);
    sh += .5;
    float shape_scaling = .2 * (1. - u_shapeScale);
    shape = smoothstep(.45 - shape_scaling, .55 + shape_scaling, sh + .3 * (proportion - .5));
    mixer = shape;
  }

  vec3 col = blend_multi(mixer, clamp(u_softness, 0., 1.));
  fragColor = vec4(col, 1.0);

  if (u_grain > 0.0) {
    float g = random(gl_FragCoord.xy + vec2(u_time * 100.0));
    fragColor.rgb += (g - 0.5) * u_grain;
  }
}
`;

    /** 官网首页传入的配置（实测自其 bundle）。 */
    const FLOW_PARAMS = {
      colors: ["#8AA3D6", "#FFFFFF", "#FFFFFF"],
      scale: 0.5,
      offsetX: 0,
      offsetY: 65,
      rotation: -5,
      proportion: 50,
      softness: 100,
      shape: 0,
      shapeScale: 10,
      distortion: 20,
      swirl: 12,
      swirlIterations: 8,
      speed: 14,
      grain: 0
    };

    /**
     * 流动层的遮罩。
     *
     * 官网原版是 `linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%)`
     * —— 一条**线性淡出**。那是对整屏 hero 合适的：hero 只占页面顶部，往下本来就
     * 该是干净的白。
     *
     * DSH 的内容列形状不同：**输入框在最底部**。照搬官网那条线性淡出，到 85~95%
     * 高度（正是输入框所在处）只剩 5~15% —— 等于输入框底下没有蓝可透，半透明的
     * 磨砂输入框盖在白底上，只能是灰白的。这就是「输入框和官网不一样」的真正原因，
     * 不是那个 0.58 的数值问题。
     *
     * 所以改成 **U 形**：
     *   顶部 0~9%   照官网保持最浓（标题带）
     *   中部 34~58% 压到 0.2~0.3（保证正文可读，这是阅读区）
     *   底部 82~100% 直接保持 0.95 → 满，给输入框做底
     * 这样 58% 白的磨砂输入框才真正透出蓝，与官网观感一致。
     *
     * 可调的三处：34%/58% 那两档控制"正文区有多蓝"，82% 是回升起点
     * （提前 → 输入框周围的蓝更宽，但正文底部也会偏蓝）。
     */
    const FLOW_MASK = [
      "linear-gradient(180deg,",
      "#000000fc 0%,",
      "#000000e8 8.98%,",
      "rgba(0,0,0,.30) 34%,",
      "rgba(0,0,0,.20) 58%,",
      "rgba(0,0,0,.95) 82%,",
      "#000 100%)"
    ].join("");

    /**
     * 布局：画布要有地方显示，框架与内容列都必须透明。
     * 画布用 `z-index:-1` 挂在框架里 —— 画在框架背景之上、内容之下；
     * 侧边栏有自己的不透明渐变，正好把它左半边盖住，接缝天然对齐。
     *
     * ⚠️ 关键：只把 `.BynINW_centerCol` 设透明**不够**。内容列子树里还有别的容器
     * 自己画了 `background:var(--dsw-alias-bg-base)`（ui-chat / ui-conversation 的
     * 对话区就是），会把画布整块盖住 —— 表现就是「只有最上面一行有流动效果」。
     * 所以在内容列子树里把这个 **token 本身**置为 transparent：凡是用它的表面都会
     * 自动透出画布，不必逐个点名哈希类名，DSH 升级换类名也不会失效。
     * 侧边栏是内容列的兄弟节点，不受影响；卡片仍用 layer-1/2，保持白色浮层。
     */
    const FLOW_LAYOUT_CSS = `
body:not([data-ds-dark-theme]) [class*="BynINW_frame"]{background:transparent!important}
body:not([data-ds-dark-theme]) [class*="centerCol"]{
  background:transparent!important;
  --dsw-alias-bg-base:transparent!important;
}
/* 只让「对话画布」透明是不够的 —— 内容列子树里凡是消费这个 token 的表面都会一起
   变透明，吸顶行、文件块于是「发虚」。它们浮在画布之上，需要实底。
   修法不是逐个覆盖 background，而是在这些元素上把 **token 本身还原**成不透明的
   抬高表面：元素自己的声明压过从内容列继承来的值，而**没用到这个 token 的元素
   完全不受影响** —— 所以选择器可以放宽，不会误伤。
   想再加一处，往下面这个列表里补一个选择器即可。 */
[class*="compactionButton"],
[data-disclosure-row],
[class*="_file"],
[class*="_thumb"]{
  --dsw-alias-bg-base:var(--dsw-alias-bg-layer-1)!important;
}
/* 输入框照官网做。官网首页的输入框实测是半透明白 + 磨砂：
     框内 #e8eff7、身后（左右插值）≈#c7d7ed  →  反解 α = 0.56~0.60
   所以既不是不透明白，也不是全透 —— 是 58% 白。模糊很关键：它顺带承担了
   composerSeat 原本「遮住滚动内容」的职责，所以不用再给它一块死白。 */
[class*="composerSeat"],
[class*="_editor"]{
  --dsw-alias-bg-base:rgba(255,255,255,.58)!important;
}
[class*="_editor"]{
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
  backdrop-filter:blur(20px) saturate(1.5);
}
/* 模糊**不能**直接加在 composerSeat 上：backdrop-filter 没有渐变，会在 seat 的
   顶边硬切出一条分界线（实测该处颜色从 #a5b8df 跳到更饱和的 #9fbbf3，正是
   saturate 的痕迹）—— seat 的背景有 36px 淡出，模糊却没有，两者对不齐。
   所以把模糊挂到一个带 mask 的伪元素上，让它在同样的 36px 内淡入。 */
[class*="composerSeat"]::after{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  -webkit-backdrop-filter:blur(20px) saturate(1.5);
  backdrop-filter:blur(20px) saturate(1.5);
  -webkit-mask-image:linear-gradient(180deg,transparent 0,#000 36px);
  mask-image:linear-gradient(180deg,transparent 0,#000 36px);
}
/* 系统关闭「透明效果」时 Chromium 会连模糊一起停用（踩过的坑）——
   那种情况下退回不透明，保证输入内容始终看得清。 */
@media (prefers-reduced-transparency:reduce){
  [class*="composerSeat"],
  [class*="_editor"]{
    --dsw-alias-bg-base:var(--dsw-alias-bg-layer-1)!important;
    -webkit-backdrop-filter:none;
    backdrop-filter:none;
  }
  [class*="composerSeat"]::after{display:none}
}
.dhps_flow{
  position:absolute;inset:0;z-index:-1;pointer-events:none;display:block;
  -webkit-mask-image:${FLOW_MASK};
  mask-image:${FLOW_MASK};
}
body[data-ds-dark-theme] .dhps_flow{display:none!important}
`;

    /** #rrggbb → [r,g,b]（0..1）。 */
    function hexToRgb(hex) {
      const h = String(hex).replace("#", "");
      return [
        parseInt(h.slice(0, 2), 16) / 255,
        parseInt(h.slice(2, 4), 16) / 255,
        parseInt(h.slice(4, 6), 16) / 255
      ];
    }

    /**
     * 挂载官网原版着色器。返回 dispose；不可用时返回 null（调用方保持纯色）。
     *
     * 参数换算全部照抄官网 JS（见 FLOW_PARAMS 上方注释）：
     *   u_time = 秒 × (speed/100)，着色器内再 ×.5。
     * 帧率压到 30fps —— 本来就只有 0.07 秒/秒，30fps 完全够，省电。
     */
    function createFlowBackground(host) {
      try {
        const canvas = document.createElement("canvas");
        canvas.className = "dhps_flow";
        canvas.setAttribute("aria-hidden", "true");
        const gl = canvas.getContext("webgl2", {
          alpha: false,
          antialias: false,
          depth: false,
          stencil: false,
          powerPreference: "low-power"
        });
        if (!gl) return null;

        const compile = (type, src) => {
          const s = gl.createShader(type);
          gl.shaderSource(s, src);
          gl.compileShader(s);
          if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.warn(
              "[dsh-homepage-palette-skin] 着色器编译失败: " + gl.getShaderInfoLog(s)
            );
            gl.deleteShader(s);
            return null;
          }
          return s;
        };
        const vs = compile(gl.VERTEX_SHADER, FLOW_VERT);
        const fs = compile(gl.FRAGMENT_SHADER, FLOW_FRAG);
        if (!vs || !fs) return null;

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
          console.warn(
            "[dsh-homepage-palette-skin] 着色器链接失败: " + gl.getProgramInfoLog(prog)
          );
          return null;
        }
        gl.useProgram(prog);

        const buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
          gl.STATIC_DRAW
        );
        const attr = gl.getAttribLocation(prog, "a_position");
        gl.enableVertexAttribArray(attr);
        gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);

        const u = (n) => gl.getUniformLocation(prog, n);
        const U = {
          time: u("u_time"),
          pixelRatio: u("u_pixelRatio"),
          resolution: u("u_resolution"),
          scale: u("u_scale"),
          offset: u("u_offset"),
          rotation: u("u_rotation"),
          c1: u("u_color1"),
          c2: u("u_color2"),
          c3: u("u_color3"),
          c4: u("u_color4"),
          c5: u("u_color5"),
          c6: u("u_color6"),
          colorCount: u("u_colorCount"),
          grain: u("u_grain"),
          proportion: u("u_proportion"),
          softness: u("u_softness"),
          shape: u("u_shape"),
          shapeScale: u("u_shapeScale"),
          distortion: u("u_distortion"),
          swirl: u("u_swirl"),
          swirlIterations: u("u_swirlIterations")
        };

        const P = FLOW_PARAMS;
        const rgb = [0, 1, 2].map((i) => (P.colors[i] ? hexToRgb(P.colors[i]) : [0, 0, 0]));
        gl.uniform1f(U.scale, P.scale);
        gl.uniform2f(U.offset, P.offsetX / 100, P.offsetY / 100);
        gl.uniform1f(U.rotation, P.rotation / 90);
        gl.uniform4f(U.c1, rgb[0][0], rgb[0][1], rgb[0][2], 1);
        gl.uniform4f(U.c2, rgb[1][0], rgb[1][1], rgb[1][2], 1);
        gl.uniform4f(U.c3, rgb[2][0], rgb[2][1], rgb[2][2], 1);
        gl.uniform4f(U.c4, 0, 0, 0, 1);
        gl.uniform4f(U.c5, 0, 0, 0, 1);
        gl.uniform4f(U.c6, 0, 0, 0, 1);
        gl.uniform1f(U.colorCount, P.colors.length);
        gl.uniform1f(U.grain, P.grain);
        gl.uniform1f(U.proportion, P.proportion / 100);
        gl.uniform1f(U.softness, P.softness / 100);
        gl.uniform1f(U.shape, P.shape);
        gl.uniform1f(U.shapeScale, P.shapeScale / 100);
        gl.uniform1f(U.distortion, P.distortion / 100);
        gl.uniform1f(U.swirl, P.swirl / 50);
        gl.uniform1f(U.swirlIterations, P.swirlIterations);

        let dpr = 1;
        const applySize = (w, h) => {
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
            gl.viewport(0, 0, w, h);
          }
        };
        const measure = () => {
          const rect = host.getBoundingClientRect();
          dpr = Math.min(window.devicePixelRatio || 1, 1.25);
          applySize(
            Math.max(1, Math.round(rect.width * dpr)),
            Math.max(1, Math.round(rect.height * dpr))
          );
        };

        const started = performance.now();
        const render = (now) => {
          gl.uniform1f(U.time, (now - started) * 0.001 * (P.speed / 100));
          gl.uniform1f(U.pixelRatio, dpr);
          gl.uniform2f(U.resolution, canvas.width, canvas.height);
          gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        };

        const reduce =
          typeof window.matchMedia === "function" &&
          window.matchMedia("(prefers-reduced-motion: reduce)").matches;

        host.appendChild(canvas);
        measure();

        let raf = 0;
        let last = 0;
        const FRAME_MS = 1000 / 30;
        const loop = (now) => {
          raf = requestAnimationFrame(loop);
          if (now - last < FRAME_MS) return;
          last = now;
          render(now);
        };
        if (reduce) render(started);
        else raf = requestAnimationFrame(loop);

        const ro =
          typeof ResizeObserver === "function"
            ? new ResizeObserver(() => {
                measure();
                if (reduce) render(performance.now());
              })
            : null;
        if (ro) ro.observe(host);

        return () => {
          if (raf) cancelAnimationFrame(raf);
          if (ro) ro.disconnect();
          gl.deleteProgram(prog);
          gl.deleteShader(vs);
          gl.deleteShader(fs);
          gl.deleteBuffer(buf);
          canvas.remove();
        };
      } catch (e) {
        console.warn("[dsh-homepage-palette-skin] 流动背景初始化失败，保持纯色: " + e);
        return null;
      }
    }

    /** 把某个档位写成一条只作用于浅色模式的规则。 */
    function tintCss(id) {
      const tint = TINTS.filter((o) => o.id === id)[0] || TINTS[0];
      if (tint.flow === true) return FLOW_LAYOUT_CSS;
      if (tint.bg === null) return "";
      return `body:not([data-ds-dark-theme]){--dsw-alias-bg-base:${tint.bg}!important}`;
    }
    //#endregion

    /**
     * 让 Electron 的标题栏覆盖层重算底色。
     *
     * Windows 上右上角那三个窗口按钮的底是 Electron 画的（`titleBarOverlay`），
     * 网页内容盖不住它。它的颜色来自 DSH preload 里的一个隐藏探针：
     *
     *   probe.style.cssText = "…background-color:var(--dsw-specific-sidebar-fill);
     *                           color:var(--dsw-alias-label-primary)"
     *   new MutationObserver(send).observe(document.body,
     *       { attributes:true, attributeFilter:["data-ds-dark-theme","style"] })
     *
     * 关键：它只观察 body 的 **[style] 属性变化** —— 单纯改 CSS 不会触发回调，
     * 所以必须在 body 的 style 上动一下（加一个变量再移除），覆盖层才会读到我们的
     * 透明值。main 进程的校验接受 8 位十六进制（`#00000000` 合法），因此能变透明。
     */
    function nudgeWindowsAppearance() {
      try {
        const b = document.body;
        if (!b || !b.style) return;
        b.style.setProperty("--dhps-nudge", "1");
        window.requestAnimationFrame(() => {
          try {
            b.style.removeProperty("--dhps-nudge");
          } catch (e) {
            /* ignore */
          }
        });
      } catch (e) {
        /* ignore */
      }
    }

    /** 插一张插件自有的样式表，随 ctx.effect 卸载。 */
    function insertSheet(ctx, suffix, css) {
      ctx.effect(() => {
        const tag = document.createElement("style");
        tag.dataset.plugin = name;
        tag.dataset.pluginCss = name + "/" + suffix;
        tag.textContent = css;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, name + ": " + suffix);
    }

    function apply(ctx) {
      if (typeof document === "undefined") return;

      // ① 皮肤：只依赖 theme，先无条件上屏
      insertSheet(ctx, "skin.css", SKIN_CSS);
      insertSheet(ctx, "row.css", ROW_CSS);
      // 皮肤上屏后让 Electron 覆盖层重算底色（它只观测 body 的 style 属性变化）
      nudgeWindowsAppearance();
      const theme = ctx.theme;
      if (theme !== undefined && typeof theme.overrideTokens === "function") {
        ctx.effect(() => theme.overrideTokens(name, TOKENS), name + ": brand tokens");
      }

      // ② 设置行：可选功能。服务齐了才注册，缺任何一个都只是少一个功能，
      //    绝不影响上面的皮肤（这是它不写进硬 inject 的原因）。
      const mount = (c) => {
        const slots = c.slots || (typeof c.get === "function" ? c.get("slots") : undefined);
        const locale = c.locale || (typeof c.get === "function" ? c.get("locale") : undefined);
        const forms = c.configForms || (typeof c.get === "function" ? c.get("configForms") : undefined);
        if (!slots || !locale || !forms || typeof forms.get !== "function") {
          console.warn("[dsh-homepage-palette-skin] 设置行未注册：slots/locale/configForms 或 configForms.get 不可用");
          return;
        }
        const scope = forms.get(SETTINGS_NS);
        if (!scope || typeof scope.getSnapshot !== "function" || typeof scope.set !== "function") {
          console.warn("[dsh-homepage-palette-skin] 设置行未注册：拿不到 " + SETTINGS_NS + " 的设置作用域");
          return;
        }

        const read = () => {
          const snap = scope.getSnapshot();
          const value = snap && snap.value;
          return (value && value.lightTint) || "default";
        };

        // 着色样式表：一张常驻的 <style>，内容按当前档位重写
        const tintTag = document.createElement("style");
        tintTag.dataset.plugin = name;
        tintTag.dataset.pluginCss = name + "/tint.css";
        tintTag.textContent = tintCss(read());
        document.head.appendChild(tintTag);
        c.effect(() => () => tintTag.remove(), name + ": tint stylesheet");

        // 「官网流动」档要挂一块 WebGL 画布（跑官网原版着色器）。
        // 画布挂在框架里（= 内容列的父节点）；布局尚未就绪时短暂重试。
        let flowDispose = null;
        let flowFailed = false;
        let flowRetry = 0;
        let disposed = false;
        const flowHost = () => {
          const col = document.querySelector('[class*="centerCol"]');
          return col && col.parentElement ? col.parentElement : null;
        };
        const syncFlow = () => {
          if (disposed) return;
          if (read() !== "flow") {
            if (flowDispose) {
              flowDispose();
              flowDispose = null;
            }
            flowRetry = 0;
            return;
          }
          if (flowDispose || flowFailed) return;
          const hostEl = flowHost();
          if (!hostEl) {
            if (flowRetry < 40) {
              flowRetry += 1;
              window.setTimeout(syncFlow, 250);
            }
            return;
          }
          flowDispose = createFlowBackground(hostEl);
          if (!flowDispose) {
            flowFailed = true;
            console.warn(
              "[dsh-homepage-palette-skin] WebGL2 不可用，「官网流动」退回纯色纸面"
            );
          }
        };
        c.effect(
          () => () => {
            disposed = true;
            if (flowDispose) {
              flowDispose();
              flowDispose = null;
            }
          },
          name + ": flow canvas"
        );
        syncFlow();

        const sync = (cb) => scope.subscribe(cb);
        const repaint = () => {
          tintTag.textContent = tintCss(read());
          syncFlow();
          nudgeWindowsAppearance();
        };
        c.effect(() => scope.subscribe(repaint), name + ": tint sync");

        c.effect(() => locale.register(LOCALE_NS, { zh, en }), name + ": tint dictionary");
        const t = locale.bind(LOCALE_NS);
        const React = require("react");

        function TintRow() {
          const current = React.useSyncExternalStore(sync, read);
          return React.createElement(
            "div",
            { className: "dhps_row" },
            React.createElement(
              "div",
              { className: "dhps_rowText" },
              React.createElement("div", { className: "dhps_title" }, t("tint.title")),
              React.createElement("div", { className: "dhps_desc" }, t("tint.desc"))
            ),
            React.createElement(
              "div",
              { className: "dhps_swatches" },
              TINTS.map((o) =>
                React.createElement(
                  "button",
                  {
                    key: o.id,
                    type: "button",
                    title: t(o.key),
                    "aria-label": t(o.key),
                    "aria-pressed": current === o.id,
                    className: "dhps_swatch" + (current === o.id ? " dhps_swatchSelected" : ""),
                    onClick: () => scope.set("lightTint", o.id)
                  },
                  React.createElement("span", {
                    className: "dhps_dot",
                    style: { background: o.dot || o.bg || "#ffffff" }
                  })
                )
              )
            )
          );
        }

        slots.inject("settings.general.item", () =>
          slots.register(
            { name: "settings.general.item", id: "skin-light-tint", order: 13 },
            TintRow
          )
        );
      };

      if (typeof ctx.inject === "function") {
        ctx.inject(["slots", "locale", "configForms"], mount);
      } else {
        mount(ctx);
      }
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.name = name;
    return module.exports;
  }
});
