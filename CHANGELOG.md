# Changelog

本文件记录本项目的所有重要变更。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

<!--
发布流程：新建 GitHub Release 时，把对应版本的小节（从标题到下一个分隔线之前）整段复制到 Release 正文。
-->

## [1.2.0] - 2026-09-30

### Added

- **「官网流动」**：浅色内容配色新增一档，复刻 <https://www.deepseek.com/> 首页那层
  **缓慢流动的蓝色背景**。
  - 官网原实现是 WebGL：`type:"pattern"` 着色器，实测配置为
    `colors ["#8AA3D6","#FFFFFF","#FFFFFF"]`、`speed 14`、`swirl 12`、
    `distortion 20`、`scale .5`、`shape "checks"`、`shapeScale 10`、`offsetY 65`；
    `u_time = 毫秒×0.001×(speed/100)` 且着色器内再 `×.5`，**约 0.07 秒/秒**，所以极慢。
  - 外层还有一个**向下淡出的遮罩**：
    `linear-gradient(#000000fc 0%, #000000e8 8.98%, transparent 100%)`。
  - 本插件**直接跑官网原版着色器**（不是近似）：GLSL 逐字提取，uniform 与官网
    JS 的归一化（`offset/100`、`rotation/90`、`proportion/100`、`softness/100`、
    `shapeScale/100`、`distortion/100`、`swirl/50`、`u_time = 秒×(speed/100)`）
    全部照搬 —— 所以**颜色、速度、运动方式与官网一致**。
  - 为什么不用 CSS 近似：试过，不成立 —— 色值对不上（不是同一套噪声场），
    速度也差了十几倍（7% 位移 / 84 秒，而官网约 **0.07 秒/秒**，即一个特征
    横穿屏幕约 70 秒）。
  - 画布挂在框架内（`z-index:-1`：画在框架背景之上、内容之下），侧边栏的
    不透明渐变正好盖住左半边，接缝天然对齐；遮罩逐字照搬。
  - 只作用于浅色模式；30fps 节流、窗口隐藏自动停；系统关闭动效时只画一帧。
  - 没有 WebGL2 时安全退回纯色纸面。

### Fixed

- 「官网流动」的取值没加进宿主侧 `Config` 的白名单（`LIGHT_TINTS`），
  导致选中后**无法持久化、重启即丢**。已补上。

### Changed

- 「雾蓝 · 深」改名为 **「雾蓝」** —— 淡、中两档删除后，"深"已失去对比对象。
  **只改显示名**，档位键 `mist-3` 未动，所以已保存的偏好与宿主白名单都不受影响。

### Removed

- 「浅色内容配色」移除了 **「雾蓝 · 淡」** 与 **「雾蓝 · 中」** 两档，只保留
  默认 / 官网流动 / 雾蓝。宿主侧的白名单（`LIGHT_TINTS`）**同步移除** ——
  两侧必须一致，否则会出现"切得动但存不住"（前面踩过）。若原本正选着被删的档位，
  会安全回落到「默认」。

## [1.1.0] - 2026-09-30

### Added

- **「浅色内容配色」**：设置 → 通用 新增一行，可为右侧内容区选一层低眩光底色，
  **仅浅色模式下生效**。四档：默认 / 雾蓝 · 淡 / 雾蓝 · 中 / 雾蓝 · 深。
  三档着色都由侧边栏顶端的色相（`#3a4f6c`，H≈215°）推导而来，与左侧栏同属一套
  材质 —— 压住纯白的眩光，又不会出现"左边冷蓝、右边暖黄"的割裂。
- 偏好通过宿主的 settings section 持久化（与 ui-theme 存明暗偏好同一机制），
  **不是 localStorage** —— 后者会因本地端口每次启动可能不同而丢失。
- 宿主侧新增 `Config` schema（`.volatile()`）；客户端用
  `ctx.configForms.get(<名字空间>)` 读写。设置行注册在可选依赖上
  （`ctx.inject(["slots","locale","configForms"], …)`），
  因此**该功能缺失或失败都不会影响皮肤本体**。

## [1.0.1] - 2026-09-30

### Fixed

- **顶部标题栏与侧边栏的蓝/黑交界错位 1px。** 标题栏那条硬切渐变的落点写成了
  `calc(var(--dsh-windows-sidebar-width) - 1px)`，比侧边栏真实右边缘少 1px，
  于是 y=40（标题栏高度）处出现一个台阶。改为直接使用该变量，交界在全高对齐。
  （实测依据：浅色 / 深色两张截图里，y<40 交界在 x=283，y≥40 在 x=284。）

### Added

- 浅色 / 深色截图 `assets/screenshot-light-mode.png` 与 `assets/screenshot-dark-mode.png`，
  以及 `screenshots.json` —— 供插件市场详情页展示。
- README 增加「截图」小节（并列展示两种主题），并补全目录结构。

**完整提交对比**：https://github.com/Tim5613/dsh-homepage-palette-skin/compare/v1.0.0...v1.0.1

## [1.0.0] - 2026-09-30

首次发布。把 DeepSeek Harness 官网预览图（macOS）的**深蓝渐变玻璃侧边栏**复刻到 Windows 客户端。

### 亮点

- **左侧栏**：固定深蓝渐变（顶部 `#3a4f6c` 蓝 → 底部 `#393d45` 中性深灰），**不跟随浅色 / 深色**
- **右侧内容区**：保持不透明，**正常跟随浅色 / 深色**
- **品牌色**：主按钮 / 品牌强调色 = DeepSeek 蓝 `#4d6bfe`（深色模式 `#6799fe`）
- **深底配浅字**：侧边栏子树内的文字 / 边框 / 交互色自动固定为浅色，
  所以即使当前是浅色模式，侧边栏也不会出现"深底深字"读不了
- **零 npm 依赖**：宿主提供全部依赖，仅用 `ctx.theme` 与一张注入的样式表

### 颜色全部来自逐像素采样

不是肉眼估的 —— 对官网预览图采样并用 `P = a·255 + (1−a)·B` 反解：

| 项目 | 实测值 |
| ---- | ------ |
| 渐变 顶部 | `#3a4f6c` |
| 渐变 中段 | `#414a56` |
| 渐变 底部 | `#393d45` |
| 面板叠加（按钮 / 选中行） | `rgba(255,255,255,.085)` |
| 正文文字 | `#e6e8eb` |
| 分区标题 | `#9399a1` |

**关键：饱和度是向下递减的 —— 顶部偏蓝，越往下越接近中性深灰，底部并不发紫。**

### 安装

三种方式任选其一。**生效无需刷新、无需重启**（DSH 客户端 bundle 是热加载的）。

**1. 从 GitHub 安装**

```bash
# 在你的 dsh profile 目录下（例如 ~/.dsh/profiles/desktop）
pnpm add github:Tim5613/dsh-homepage-palette-skin
```

然后把包名加进 profile `package.json` 的 `dsh.profile.bundles`：

```json
{ "dsh": { "profile": { "bundles": ["...", "dsh-homepage-palette-skin"] } } }
```

**2. 锁定版本安装**

```bash
pnpm add github:Tim5613/dsh-homepage-palette-skin#v1.0.0
```

**3. 交给 DSH 插件管理器**（`file:` 规格，本地开发模式）

```
install_bundle  target = file:<你的路径>/dsh-homepage-palette-skin
```

### 实现要点

这套侧边栏 DSH **本来就自带**，但被 `[data-platform=darwin]` 锁死在 macOS；
Windows 上 `sidebarCol` 只是一条不透明纯色。本插件要绕过五个坑：

1. **平台锁** —— 官方样式写在 `[data-platform=darwin]` 下，Windows 一条不生效。
2. **侧边栏不是一个元素** —— `.BynINW_sidebarCol` 里还嵌着 ui-sidebar 的 `SidebarRoot`，
   它自带 `background:var(--dsw-specific-sidebar-fill)` 且 `height:100%`，等于盖了个不透明盖子。
   → 把该 token 在侧边栏子树内置为 `transparent`（不依赖哈希类名）。
3. **内容卡片左上 16px 圆角缺口** 会露出框架底色。
   → 框架底色设成 `var(--dsw-alias-bg-base)`（= 卡片色），缺口隐形。
4. **自己加的顶部高光会留亮带** —— `inset 0 1px 0 rgba(255,255,255,.16)` 实测在圆角处
   留下 `#6a7492` 亮带。已去掉。
5. **不能只靠 `backdrop-filter`** —— 系统关闭「透明效果」时 Chromium 会连模糊一起停用。
   → 渐变直接写在侧边栏上，模糊只作加分项。

### 已知边界

参考图的通透有一半来自 **macOS 原生窗口 vibrancy**（Electron `vibrancy: "sidebar"` +
透明背景色，桌面被系统实时模糊后透上来）。本插件在**渲染层**改 CSS，看不到窗口外的桌面；
DSH 在 Windows 上创建主窗口时也没有开启任何材质。

所以本插件做到的是**把参考图的颜色与透明度关系 1:1 复刻**；
**真正的"看见桌面"需要改客户端本体**。另外，Electron 官方的 `backgroundMaterial`
（mica / acrylic）要求 **Windows 11**，Windows 10 上会被静默忽略。

### 环境要求

- DSH 客户端（含 `@deepseek-ai/dsh-client-ui-theme` 的 Web 组合：桌面端或 `dsh web`）
- Node.js ≥ 22（仅为安装；插件本身零依赖）
- 浅色 / 深色 / 跟随系统三种偏好均支持

### 变更明细

- Added: 深蓝渐变玻璃侧边栏（固定，不随主题）
- Added: 侧边栏子树内的浅色文字 / 边框 / 交互 token 覆盖
- Added: 品牌蓝 token 覆盖层（`#4d6bfe` / `#6799fe`）
- Added: 配色预览图 `preview.png`（按实测值渲染）

**完整提交对比**：https://github.com/Tim5613/dsh-homepage-palette-skin/commits/v1.0.0
