# vite-plugin-php-loader

[vite-plugin-php-loader](https://github.com/hilosiva/vite-plugins/packages/vite-plugin-php-loader/) は、俺流の Vite 用 PHP ローダーです。

## 特徴

- PHP ファイル更新時にライブリロード
- dev 起動時に `ViteHelper.php` の接続先（`VITE_SERVER`・`ENTRY_POINT`）を自動更新
- スマホ等の実機確認ができるようにローカル IP を自動取得して設定
- ビルド時に PHP ファイル内の画像パスをハッシュ付きパスに更新
- ビルド時に `ViteHelper.php` の `IS_DEVELOPMENT` を `false`・`VITE_SERVER` を空にした本番用ファイルを生成
- `useWpEnv` オプションで wp-env の URL をターミナルに表示

## インストール

■ npm の場合

```console
npm i @hilosiva/vite-plugin-php-loader -D
```

■ yarn の場合

```console
yarn add @hilosiva/vite-plugin-php-loader -D
```

■ pnpm の場合

```console
pnpm i @hilosiva/vite-plugin-php-loader -D
```

## 使用方法

`vite.config.js` でインポートし、プラグインに追加してください。

```javascript
import { defineConfig } from "vite";
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loader";

export default defineConfig({
  plugins: [
    vitePhpLoader({
      /* オプション */
    }),
  ],
});
```

## オプション

### `entryPoint`

- タイプ： `String`
- デフォルト： `'scripts/main.js'`

PHP ファイルに読み込ませるエントリーポイントとなる JS ファイルのパス（`root` からの相対パス）

### `viteHelperFile`

- タイプ： `String`
- デフォルト： `'lib/ViteHelper.php'`

[Orelop WP](https://github.com/hilosiva/orelop-wp) のヘルパー用 PHP ファイルのパス（`root` からの相対パス）

### `useWpEnv`

- タイプ： `Boolean`
- デフォルト： `false`

`true` にすると、dev 起動時にターミナルへ wp-env（`@wordpress/env`）の URL を表示します。

```javascript
vitePhpLoader({
  useWpEnv: true,
})
```
