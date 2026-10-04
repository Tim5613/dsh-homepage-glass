#!/usr/bin/env node
/**
 * 把仓库里的 PNG 截图重编码成 8 位索引色（palette）PNG，供 README / 市场详情页使用。
 *
 * 为什么需要它：`assets/screenshot-light.png` 是一张 1280×820 的 RGB PNG，画面大半是
 * 「官网流动」那层宽色域渐变 —— 这类画面用 24bpp 真彩色存，绝大部分字节花在肉眼
 * 分不出的色阶上。
 *
 * 实测（v1.3.0 的两张图 + 配色预览）：
 *   assets/screenshot-light.png  303138 → 83721 字节（-72%），全图最大通道差 15、均值 0.131
 *   assets/screenshot-dark.png    45941 → 18068 字节（-61%），全图最大通道差 42、均值 0.026
 *   preview.png                   42196 → 14825 字节（-65%）
 * 差值集中在文字边缘的抗锯齿像素上，纯色区与渐变区几乎全为 0，所以看不出色带。
 *
 * 只改 PNG 编码，不改尺寸、不改内容，直接覆盖原文件。
 *
 * 用法：
 *   npm i -D sharp        # 只装一次；sharp 是 devDependency，不进发布包
 *   npm run png:optimize
 *
 * 换过截图后重跑一次即可；已经优化过的图再跑不会变小，脚本会跳过它们。
 */
import { readFile, writeFile } from 'node:fs/promises'
import { statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TARGETS = [
  'assets/screenshot-light.png',
  'assets/screenshot-dark.png',
  'preview.png',
]

const OPTIONS = { palette: true, compressionLevel: 9, effort: 10 }

let sharp
try {
  ;({ default: sharp } = await import('sharp'))
} catch {
  console.error('需要 sharp：npm i -D sharp')
  process.exit(1)
}

let saved = 0
for (const rel of TARGETS) {
  const file = path.join(ROOT, rel)
  const before = statSync(file).size
  const input = await readFile(file)
  const output = await sharp(input).png(OPTIONS).toBuffer()
  if (output.length >= before) {
    console.log(`${rel}: ${before} 字节，重编码后 ${output.length}，未变小，保持原文件`)
    continue
  }
  await writeFile(file, output)
  saved += before - output.length
  console.log(`${rel}: ${before} → ${output.length} 字节（-${(100 * (1 - output.length / before)).toFixed(1)}%）`)
}
console.log(`共省下 ${saved} 字节`)