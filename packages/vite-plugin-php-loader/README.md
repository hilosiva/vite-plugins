# vite-plugin-php-loadder

[vite-plugin-php-loadder](https://github.com/hilosiva/vite-plugins/packages/vite-plugin-php-loadder/) は、俺流の Vite 用 PHP ローダーです。



## 特徴

- PHP ファイルを更新時にライブリロード
- ビルド時に PHP ファイル内に含まれる img 要素のファイルパスを更新
- [Orelop WP](https://github.com/hilosiva/orelop-wp)利用時、ビルド時に開発用を表す定数を「false」に変更

## インストール

■ npm の場合

```console
  npm i @hilosiva/vite-plugin-php-loadder -D
```

■ yarn の場合

```console
  yarn add @hilosiva/vite-plugin-php-loadder -D
```

■ pnpm の場合

```console
  pnpm i @hilosiva/vite-plugin-php-loadder -D
```


## 使用方法

「vite.config.js」でインポートし、プラグインに追加してください。

```javascript
import { defineConfig } from "vite";
import { vitePhpLoader } from "@hilosiva/vite-plugin-php-loadder"; // 追加

export default defineConfig({
  plugins: [
    // 追加
    vitePhpLoader({
      /* オプション */
    }),
  ],
});
```

## オプション

### `entryPoint`

- タイプ： String
- デフォルト： `'assets/scripts/main.js'`

PHP ファイルに読み込ませるエントリーポイントとなる JS ファイルのパス



### `viteHelperFile`

- タイプ： String
- デフォルト： `'lib/ViteHelper.php'`

[Orelop WP](https://github.com/hilosiva/orelop-wp)のヘルパー用 PHP ファイルのファイルパス
