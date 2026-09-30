/**
 * dsh-homepage-palette-skin — Host half.
 *
 * 纯客户端皮肤插件：配色覆盖全部发生在客户端 (lib/client.js)。
 * 这里的 host half 只提供合法的 Cordis 插件形状，让 bundle 层条目可解析，
 * 不注册任何宿主服务、不做任何宿主侧工作。
 */
export const name = "dsh-homepage-palette-skin";

export const inject = [];

export function apply() {
  // Client-only skin; no host-side work.
}
