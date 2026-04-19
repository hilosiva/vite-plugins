# vite-plugin-php-loader

WordPress テーマ開発で Vite を使うための PHP ローダープラグイン。

## 動作環境

- **Node.js**: 20.19.0 以上（22.12.0 以上推奨）
- **Vite**: 6.x または 7.x

## 特徴

- PHP ファイルの変更を検知してライブリロード
- dev 起動時に `ViteHelper.php` の `VITE_SERVER`・`ENTRY_POINT` を自動更新
- ローカル IP を自動取得してスマホ等の実機確認に対応
- ビルド時に PHP ファイル内の画像パスをハッシュ付きパスに自動置換
- ビルド時に `IS_DEVELOPMENT = false`・`VITE_SERVER = ''` の本番用 `ViteHelper.php` を生成
- `useWpEnv: true` で wp-env の URL をターミナルに表示

## インストール

```bash
# pnpm
pnpm add @hilosiva/vite-plugin-php-loader -D

# npm
npm i @hilosiva/vite-plugin-php-loader -D

# yarn
yarn add @hilosiva/vite-plugin-php-loader -D
```

## 使い方

```ts
import { defineConfig } from "vite";
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";

export default defineConfig({
  root: "src",
  base: "./",
  plugins: [
    vitePhpLoader({
      useWpEnv: true,
    }),
  ],
  build: {
    outDir: "../dist",
    manifest: true,
  },
  server: {
    strictPort: true,
    host: true,
    port: 5555,
  },
});
```

## ViteHelper.php

`src/lib/ViteHelper.php` に以下の定数を定義しておくと、プラグインが自動で書き換えます。

```php
class ViteHelper
{
  const IS_DEVELOPMENT = true;
  const VITE_SERVER    = 'http://localhost:5555';
  const ENTRY_POINT    = 'scripts/main.js';
  const DIST_URL       = DIST_THEME_URL;
  const PUBLIC_URL     = self::IS_DEVELOPMENT ? self::VITE_SERVER : DIST_THEME_URL;
}
```

| 定数 | dev 時 | build 後 |
|------|--------|----------|
| `IS_DEVELOPMENT` | `true` | `false` |
| `VITE_SERVER` | `http://192.168.x.x:5555`（ローカルIP） | `''` |
| `ENTRY_POINT` | `scripts/main.js` | — |

## オプション

### `entryPoint`

- タイプ: `string`
- デフォルト: `'scripts/main.js'`

dev サーバーから読み込む JS エントリーポイントのパス（`root` からの相対パス）。

### `viteHelperFile`

- タイプ: `string`
- デフォルト: `'lib/ViteHelper.php'`

自動書き換え対象の `ViteHelper.php` のパス（`root` からの相対パス）。

### `useWpEnv`

- タイプ: `boolean`
- デフォルト: `false`

`true` にすると dev 起動時に wp-env（`@wordpress/env`）の URL をターミナルに表示します。

## `.wp-env.json` 設定例

```json
{
  "core": null,
  "themes": [
    "./src",
    "./dist"
  ]
}
```

- **dev 時**: WordPress は `src/` テーマを使用（`IS_DEVELOPMENT = true`）
- **build 後**: WordPress は `dist/` テーマを使用（`IS_DEVELOPMENT = false`）

## ライセンス

MIT
