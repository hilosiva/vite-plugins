# vite-plugin-html-loader

`root` 配下の HTML ファイルをすべて自動検出して Rollup の `input` に追加する Vite プラグイン。マルチページ構成のサイトで `input` を手書きする必要がなくなります。

## 動作環境

- **Node.js**: 20.19.0 以上（22.12.0 以上推奨）
- **Vite**: 6.x または 7.x

## インストール

```bash
# pnpm
pnpm add @hilosiva/vite-plugin-html-loader -D

# npm
npm i @hilosiva/vite-plugin-html-loader -D

# yarn
yarn add @hilosiva/vite-plugin-html-loader -D
```

## 使い方

`vite.config.ts` でインポートしてプラグインに追加するだけです。

```ts
import { defineConfig } from "vite";
import { viteHtmlLoader } from "@hilosiva/vite-plugin-html-loader";

export default defineConfig({
  root: "src",
  plugins: [
    viteHtmlLoader(),
  ],
  build: {
    outDir: "../dist",
  },
});
```

**オプションはありません**。`viteHtmlLoader()` を追加するだけで動作します。

## 動作

`root` 配下の `.html` ファイルをすべて検出して Rollup の `input` に自動登録します。

```
src/
├── index.html          → dist/index.html
├── about/
│   └── index.html      → dist/about/index.html
└── contact/
    └── index.html      → dist/contact/index.html
```

## ライセンス

MIT
