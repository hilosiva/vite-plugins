# vite-plugin-image-optimizer

ビルド時に [sharp](https://sharp.pixelplumbing.com/) を使って画像を最適化・変換する Vite プラグイン。

## 動作環境

- **Node.js**: 20.19.0 以上（22.12.0 以上推奨）
- **Vite**: 6.x または 7.x

## 特徴

- JPG / PNG / GIF / WebP / AVIF を圧縮
- JPG・PNG から WebP・AVIF を自動生成
- `build.assetsInlineLimit: 0` と組み合わせるとすべての画像に適用できる

## インストール

```bash
# pnpm
pnpm add @hilosiva/vite-plugin-image-optimizer -D

# npm
npm i @hilosiva/vite-plugin-image-optimizer -D

# yarn
yarn add @hilosiva/vite-plugin-image-optimizer -D
```

## 使い方

```ts
import { defineConfig } from "vite";
import { viteImageOptimazer } from "@hilosiva/vite-plugin-image-optimizer";

export default defineConfig({
  plugins: [
    viteImageOptimazer({
      generate: {
        preserveExt: true,
      },
    }),
  ],
  build: {
    assetsInlineLimit: 0, // base64 インライン化を無効にすると全画像が対象になる
  },
});
```

> **注意**
> `public/` フォルダ内の静的アセットは対象外です。
> また `build.assetsInlineLimit` のデフォルト（4KB）以下の画像はインライン化されるため対象外になります。インライン化を無効にする場合は `assetsInlineLimit: 0` を設定してください。

## オプション

### `supportedExts`

- タイプ: `string[]`
- デフォルト: `[".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]`

最適化対象の拡張子。

### `generate.inputExts`

- タイプ: `string[]`
- デフォルト: `[".jpg", ".jpeg", ".png"]`

WebP・AVIF を生成する変換元フォーマット。

### `generate.outputExts`

- タイプ: `string[]`
- デフォルト: `[".webp", ".avif"]`

生成する変換先フォーマット。

### `generate.preserveExt`

- タイプ: `boolean`
- デフォルト: `false`

`true` にすると元の拡張子をファイル名に残します。

```
false: logo.png → logo.webp
true:  logo.png → logo.png.webp
```

### `jpg` / `jpeg` / `png` / `gif` / `webp` / `avif`

各フォーマットの圧縮オプション。[sharp のオプション](https://sharp.pixelplumbing.com/api-output)をそのまま渡せます。

## 設定例

```ts
viteImageOptimazer({
  generate: {
    preserveExt: true,
  },
  jpg: { quality: 70, mozjpeg: true },
  jpeg: { quality: 70, mozjpeg: true },
  png: { quality: 70 },
  webp: { quality: 75 },
  avif: { quality: 70 },
})
```

## ライセンス

MIT
