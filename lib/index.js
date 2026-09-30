/**
 * dsh-homepage-palette-skin — Host half.
 *
 * 皮肤本身是纯客户端的（样式表 + token 覆盖），这里只多做一件事：
 * **声明「浅色内容配色」这个可持久化偏好的 schema**，让宿主把它作为一个
 * settings section 管起来，客户端再用 `ctx.configForms.get(NS)` 读写。
 *
 * 这套写法照抄 ui-theme（它用同样的方式存「浅色/深色/系统」与字号）：
 *   宿主  ：Config = z.object({ … .volatile() }) + ctx.inject(["settings"], …)
 *   客户端：ctx.configForms.get(NS).set / getSnapshot / subscribe
 *
 * `.volatile()` 的含义：值存在宿主的 user-settings 文档里，而不是 profile 的
 * 配置文件里 —— 用户改的是「偏好」，不是「插件配置」。
 */
import z from "@deepseek-ai/schemastery";

export const name = "dsh-homepage-palette-skin";

/** 本插件拥有的 settings 名字空间（宿主与客户端必须一致）。 */
export const SETTINGS_NS = "dsh-homepage-palette-skin";

/** 「浅色内容配色」的可选档位。 */
export const LIGHT_TINTS = ["default", "mist-1", "mist-2", "mist-3"];

/**
 * 实时偏好。字段名 `lightTint` 与客户端读取的键必须一致。
 */
export const Config = z.object({
  lightTint: z.union([...LIGHT_TINTS]).default("default").volatile()
});

export const inject = [];

/**
 * 把本插件的偏好交给宿主 settings 服务托管（与 ui-theme 同一条路径）。
 * 宿主侧不参与任何渲染 —— 样式表全在客户端。
 */
export function apply(ctx) {
  ctx.inject(["settings"], (child) => {
    child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
  });
}
