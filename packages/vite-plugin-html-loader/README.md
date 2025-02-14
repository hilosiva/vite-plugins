# vite-plugin-html-loader

[vite-plugin-html-loader](https://github.com/hilosiva/vite-plugins/packages/vite-plugin-html-loader) は、俺流の Vite 用 HTML ローダーです。



## 特徴

- ルートディレクトリ内のすべての HTML ファイルをビルドできる。

## インストール

■ npm の場合

```console
  npm i @hilosiva/vite-plugin-html-loader -D
```

■ yarn の場合

```console
  yarn add @hilosiva/vite-plugin-html-loader -D
```

■ pnpm の場合

```console
  pnpm i @hilosiva/vite-plugin-html-loader -D
```

## 使用方法

「vite.config.js」でインポートし、プラグインに追加してください。

```javascript
import { defineConfig } from "vite";
import { viteHtmlLoader } from "@hilosiva/vite-plugin-html-loader"; // 追加

export default defineConfig({
  plugins: [
    // 追加
    viteHtmlLoader(),
  ],
});
```
