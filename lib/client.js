/**
 * dsh-homepage-palette-skin — Client half.
 *
 * 目标：**左侧栏固定为官网预览图那种深蓝渐变玻璃，不跟随主题；右侧内容区照常跟随。**
 *
 * ══ 全部取值来自对参考图的逐像素采样，不是肉眼估的 ══════════════════
 *
 * 【1】侧边栏渐变（参考图 222x608 裁切，取样点 x=4..8 内边距，避开文字）
 *      y=  6  #3a4f6c      y=121  #3c4b61      y=304  #424952
 *      y=182  #3f4b5b      y=243  #414a56      y=425  #3c4149
 *      y=486  #3a3e47      y=547  #393d45
 *      → 顶部蓝、越往下**饱和度递减**到中性深灰，**底部并不发紫**。
 *
 * 【2】面板白叠加的 alpha（用 P = a*255 + (1-a)*B 反解，三通道一致）
 *      「新会话」按钮  P=#4d5b6f  B=#3d4c63  → a ≈ 0.083
 *      「选中会话」行  P=#4f5762  B=#404752  → a ≈ 0.086
 *      → 参考图的面板就是 **8.5% 白**。之前用 10%~16% 是"发闷、块状"的主因。
 *
 * 【3】文字色（区域内最亮像素 ≈ 实色）
 *      普通条目 #e6e8eb / 选中条目 #e3e6e9 / 底部署名 #f4f5f7
 *      分区标题「工作区」#9399a1（≈ 44% 白）
 *
 * ══ 踩过的坑 ════════════════════════════════════════════════════════
 * 1) 这套侧边栏 DSH 自带，但被 `[data-platform=darwin]` 锁死在 macOS。
 * 2) `.BynINW_sidebarCol` 里嵌着 ui-sidebar 的 SidebarRoot，自带
 *    `background:var(--dsw-specific-sidebar-fill)` 且 height:100% —— 不透明盖子。
 *    → 把该 token 在侧边栏子树内置为 transparent。
 * 3) 内容卡片左上 16px 圆角缺口会露出框架底色 → 框架底色设成
 *    var(--dsw-alias-bg-base)（= 卡片色），缺口隐形。
 * 4) 自己加的 `inset 0 1px 0 rgba(255,255,255,.16)` 高光在圆角处留下
 *    #6a7492 亮带（实测 = 侧边栏色 + 16% 白）。已去掉。
 * 5) 只靠 backdrop-filter 不行（系统关透明效果时 Chromium 会连模糊一起停用）。
 */
window.__ModuleLoader__.load({
  id: "dsh-homepage-palette-skin",
  factory: () => {
    var module = { exports: {} };
    var exports = module.exports;
    Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

    const name = "dsh-homepage-palette-skin";
    const inject = ["theme"];

    /** 品牌蓝（官网 --ds-color-brand），随浅/深色各自取值。 */
    const TOKENS = {
      "--dsw-alias-brand-primary": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-brand-text": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-button-primary-fill": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-button-primary-hover": { light: "#3a65c2", dark: "#7aa6ff" },
      "--dsw-alias-button-info-fill": { light: "#4d6bfe", dark: "#6799fe" },
      "--dsw-alias-state-business-primary": { light: "#4d6bfe", dark: "#6799fe" },
      // 蓝调悬停 / 按下底（跟随主题明暗）
      "--dsw-alias-interactive-bg-hover": { light: "#4d6bfe14", dark: "#6799fe1f" },
      "--dsw-alias-interactive-bg-active": { light: "#4d6bfe24", dark: "#6799fe30" }
    };

    /** 参考图实测的侧边栏渐变（8 个采样点归纳为 6 段）。 */
    const SIDEBAR_BG = [
      "linear-gradient(180deg,",
      "#3a4f6c 0%,",
      "#3c4b61 20%,",
      "#414a56 40%,",
      "#3f454d 60%,",
      "#3a3e47 80%,",
      "#393d45 100%)"
    ].join("");

    const CSS = `
/* ── ① 框架底色 = 内容卡片色：让卡片左上圆角缺口隐形（坑 3）──── */
.BynINW_frame,[class*="BynINW_frame"]{background:var(--dsw-alias-bg-base)!important}

/* ── ② 顶部标题栏：左段 = 侧边栏顶色，右段透出框架（=卡片色）──── */
[data-windows-titlebar] [class*="BynINW_frame"]:before{
  background:linear-gradient(90deg,
    #3a4f6c 0,
    #3a4f6c var(--dsh-windows-sidebar-width,280px),
    rgba(0,0,0,0) var(--dsh-windows-sidebar-width,280px),
    rgba(0,0,0,0) 100%)!important;
}

/* ── ③ 侧边栏：实测渐变 + 实测文字/面板色，固定不随主题 ───────── */
[class*="sidebarCol"]{
  /* 坑 2：清掉内层 SidebarRoot 的不透明盖子 */
  --dsw-specific-sidebar-fill:transparent!important;

  /* 文字：参考图实测 —— 正文 #e6e8eb，分区标题 ≈44% 白 (#9399a1) */
  --dsw-alias-label-primary:#e6e8eb!important;
  --dsw-alias-label-secondary:rgba(255,255,255,.86)!important;
  --dsw-alias-label-tertiary:rgba(255,255,255,.60)!important;
  --dsw-alias-label-caption:rgba(255,255,255,.44)!important;
  --dsw-alias-label-dimmed:rgba(255,255,255,.72)!important;

  /* 面板：实测 8.5% 白（之前 10%~16% 偏重，是"发闷"的主因）*/
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
/* 兜底：直接子元素若另有实底也一并清掉 */
[class*="sidebarCol"] > *{background:transparent!important}

/* ── ④ 右侧内容区保持不透明：正常跟随浅色 / 深色 ────────────── */
[class*="centerCol"],[class*="rightbarCol"]{background:var(--dsw-alias-bg-base)!important}

/* ── ⑤ 品牌蓝：官网 --ds-color-brand ─────────────────────────── */
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

    function apply(ctx) {
      if (typeof document === "undefined") return;

      ctx.effect(() => {
        const tag = document.createElement("style");
        tag.dataset.plugin = name;
        tag.dataset.pluginCss = name + "/sidebar-glass.css";
        tag.textContent = CSS;
        document.head.appendChild(tag);
        return () => {
          tag.remove();
        };
      }, name + ": sidebar glass stylesheet");

      const theme = ctx && ctx.theme;
      if (theme !== undefined && typeof theme.overrideTokens === "function") {
        ctx.effect(
          () => theme.overrideTokens(name, TOKENS),
          name + ": brand tokens"
        );
      }
    }

    exports.apply = apply;
    exports.inject = inject;
    exports.name = name;
    return module.exports;
  }
});
