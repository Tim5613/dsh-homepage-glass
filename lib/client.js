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
    const FLOW_LAYERS = [
      "radial-gradient(46% 38% at 22% 10%,#8aa3d6d9 0,#8aa3d600 72%)",
      "radial-gradient(38% 30% at 64% 3%,#a9bde5c4 0,#a9bde500 72%)",
      "radial-gradient(54% 44% at 90% 16%,#8aa3d6a8 0,#8aa3d600 76%)",
      "radial-gradient(62% 46% at 44% 0,#ffffff 0,#ffffff00 70%)"
    ].join(",");
    const FLOW_MASK = "linear-gradient(#000 0%,#000 9%,rgba(0,0,0,.5) 52%,transparent 100%)";
    const FLOW_CSS = `
body:not([data-ds-dark-theme]) [class*="BynINW_frame"]{
  background-color:#f4f7fc!important;
  background-image:${FLOW_LAYERS}!important;
  background-size:100vw 100vh!important;
  background-position:0 0!important;
  background-repeat:no-repeat!important;
}
body:not([data-ds-dark-theme]) [class*="centerCol"]{position:relative;background:transparent!important}
body:not([data-ds-dark-theme]) [class*="centerCol"]::before{
  content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;
  background-color:#f4f7fc;
  background-image:${FLOW_LAYERS};
  background-size:100vw 100vh;
  background-position:calc(-1 * var(--dsh-windows-sidebar-width,280px)) 0;
  background-repeat:no-repeat;
  -webkit-mask-image:${FLOW_MASK};
  mask-image:${FLOW_MASK};
  animation:dhps-flow 84s ease-in-out infinite alternate;
}
@keyframes dhps-flow{from{transform:translate3d(-3.5%,0,0)}to{transform:translate3d(3.5%,0,0)}}
@media (prefers-reduced-motion:reduce){
  body:not([data-ds-dark-theme]) [class*="centerCol"]::before{animation:none!important}
}
`;

    /** 把某个档位写成一条只作用于浅色模式的规则。 */
    function tintCss(id) {
      const tint = TINTS.filter((o) => o.id === id)[0] || TINTS[0];
      if (tint.flow === true) return FLOW_CSS;
      if (tint.bg === null) return "";
      return `body:not([data-ds-dark-theme]){--dsw-alias-bg-base:${tint.bg}!important}`;
    }
    //#endregion

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

        const sync = (cb) => scope.subscribe(cb);
        const repaint = () => {
          tintTag.textContent = tintCss(read());
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
